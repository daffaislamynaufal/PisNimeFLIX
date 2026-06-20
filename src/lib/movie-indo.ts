import axios from 'axios';
import * as cheerio from 'cheerio';
import { getCutadCookie, rewriteCoverUrl } from './dracin';
import fs from 'fs';
import path from 'path';
import os from 'os';

const BASE_URL = 'https://www.cutad.web.id';

export interface MovieItem {
  id: string;
  title: string;
  cover: string;
  slug: string;
}

export interface MovieDetail {
  id: string;
  title: string;
  cover: string;
  description: string;
  videoUrl: string;
}

// Memory Cache configuration
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const movieDetailCache = new Map<string, CacheEntry<any>>();

const DETAIL_TTL = 15 * 60 * 1000; // 15 minutes

const RUNTIME_CACHE_FILE = path.join(os.tmpdir(), 'pisnime_movie_indo_cache.json');
const BUILD_TIME_CACHE_FILE = path.join(process.cwd(), 'src', 'lib', 'movie_indo_cache.json');
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface LocalCache {
  timestamp: number;
  items: MovieItem[];
}

function readLocalCache(): LocalCache | null {
  try {
    // 1. Try runtime cache (/tmp)
    if (fs.existsSync(RUNTIME_CACHE_FILE)) {
      const data = fs.readFileSync(RUNTIME_CACHE_FILE, 'utf8');
      return JSON.parse(data);
    }
    
    // 2. Try build-time fallback cache (project directory)
    if (fs.existsSync(BUILD_TIME_CACHE_FILE)) {
      const data = fs.readFileSync(BUILD_TIME_CACHE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading local cache file:', e);
  }
  return null;
}

function writeLocalCache(items: MovieItem[]) {
  const data: LocalCache = {
    timestamp: Date.now(),
    items
  };
  
  // Always write to runtime cache (/tmp)
  try {
    fs.writeFileSync(RUNTIME_CACHE_FILE, JSON.stringify(data), 'utf8');
  } catch (e) {
    console.error('Error writing runtime cache file:', e);
  }

  // Also try writing to build-time cache file if we are running in a writable environment
  if (process.env.NODE_ENV === 'development' || !process.env.VERCEL) {
    try {
      fs.writeFileSync(BUILD_TIME_CACHE_FILE, JSON.stringify(data), 'utf8');
    } catch (e) {
      // Ignore errors if read-only
    }
  }
}

let isRefreshing = false;

async function refreshCacheInBackground() {
  console.log('Refreshing movie-indo cache in background...');
  const items = await fetchAllMovieIndoFromSource();
  if (items.length > 0) {
    writeLocalCache(items);
    console.log(`Movie-indo cache updated successfully in background. Total items: ${items.length}`);
  }
}

export async function getAllMovieIndo(): Promise<MovieItem[]> {
  // 1. Read from local cache file
  const cached = readLocalCache();

  if (cached && cached.items && cached.items.length > 0) {
    const age = Date.now() - cached.timestamp;
    
    // If cache is still fresh, return it
    if (age < CACHE_TTL) {
      return cached.items;
    }

    // If cache is stale (> 1 hour), trigger background refresh and return stale items instantly!
    if (!isRefreshing) {
      isRefreshing = true;
      refreshCacheInBackground().catch(err => {
        console.error('Error in background cache refresh:', err);
      }).finally(() => {
        isRefreshing = false;
      });
    }

    return cached.items;
  }

  // 2. Fallback: If no cache exists, fetch synchronously (first visit ever)
  const items = await fetchAllMovieIndoFromSource();
  if (items.length > 0) {
    writeLocalCache(items);
  }
  return items;
}

export async function fetchAllMovieIndoFromSource(): Promise<MovieItem[]> {
  const allItems: MovieItem[] = [];

  try {
    const cookie = await getCutadCookie();
    
    // Fetch page 1 first to determine maxPage and load initial items
    const firstPageUrl = `${BASE_URL}/category/sfilmindo/?page=1`;
    const response = await axios.get(firstPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cookie': cookie,
        'Referer': BASE_URL
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    
    // Parse Page 1 items
    $('a.group.block').each((_, el) => {
      const href = $(el).attr('href') || '';
      const match = href.match(/\/watch\/sfilmindo\/([^/]+)/);
      if (!match) return;

      const slug = match[1];
      const title = $(el).find('h3').text().trim() || $(el).find('img').attr('alt') || '';
      const rawCover = $(el).find('img').attr('src') || $(el).find('img').attr('data-src') || '';
      
      allItems.push({
        id: slug,
        slug,
        title,
        cover: rewriteCoverUrl(rawCover)
      });
    });

    // Detect maximum page from Page 1 pagination links
    let maxPage = 1;
    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const match = href.match(/[?&]page=(\d+)/);
      if (match) {
        const pNum = parseInt(match[1], 10);
        if (pNum > maxPage) {
          maxPage = pNum;
        }
      }
    });

    // If there are other pages, fetch them in parallel
    if (maxPage > 1) {
      const otherPages = Array.from({ length: maxPage - 1 }, (_, i) => i + 2);
      
      const pagePromises = otherPages.map(async (p) => {
        try {
          const url = `${BASE_URL}/category/sfilmindo/?page=${p}`;
          const res = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Cookie': cookie,
              'Referer': BASE_URL
            },
            timeout: 15000
          });
          
          const page$ = cheerio.load(res.data);
          const pageItems: MovieItem[] = [];
          
          page$('a.group.block').each((_, el) => {
            const href = page$(el).attr('href') || '';
            const match = href.match(/\/watch\/sfilmindo\/([^/]+)/);
            if (!match) return;

            const slug = match[1];
            const title = page$(el).find('h3').text().trim() || page$(el).find('img').attr('alt') || '';
            const rawCover = page$(el).find('img').attr('src') || page$(el).find('img').attr('data-src') || '';
            
            pageItems.push({
              id: slug,
              slug,
              title,
              cover: rewriteCoverUrl(rawCover)
            });
          });
          
          return pageItems;
        } catch (e: any) {
          console.error(`Error fetching page ${p} in parallel:`, e.message);
          return [];
        }
      });
      
      const results = await Promise.all(pagePromises);
      for (const pageItems of results) {
        allItems.push(...pageItems);
      }
    }

    return allItems;
  } catch (err: any) {
    console.error('Error fetching Movie Indo from source:', err.message);
    return [];
  }
}

export async function getMovieIndoCatalog(page: number = 1, q: string = ''): Promise<{ items: MovieItem[]; hasMore: boolean }> {
  try {
    const allMovies = await getAllMovieIndo();
    
    let filtered = allMovies;
    if (q.trim()) {
      const queryLower = q.toLowerCase().trim();
      filtered = allMovies.filter(item => item.title.toLowerCase().includes(queryLower));
    }

    const itemsPerPage = 60;
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);
    const hasMore = startIndex + itemsPerPage < filtered.length;

    return { items: paginatedItems, hasMore };
  } catch (err: any) {
    console.error('Error getting Movie Indo catalog:', err.message);
    return { items: [], hasMore: false };
  }
}

export async function getMovieIndoDetail(id: string): Promise<MovieDetail | null> {
  const cacheKey = `detail-${id}`;
  const cached = movieDetailCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < DETAIL_TTL) {
    return cached.data;
  }

  try {
    const url = `${BASE_URL}/watch/sfilmindo/${id}`;
    const cookie = await getCutadCookie();

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cookie': cookie,
        'Referer': BASE_URL
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Get Title
    const pageTitle = $('title').text().replace(' Subtitle Indonesia Terbaru | CUTAD', '').trim();

    // Get Poster
    let cover = '';
    const cleanedHtml = html.replace(/\\u0026/g, '&').replace(/\\u002f/g, '/').replace(/\\/g, '');
    const coverMatch = cleanedHtml.match(/(https:\/\/www\.cutad\.web\.id\/api\/proxy\?u=[^"]+)/);
    if (coverMatch) {
      cover = rewriteCoverUrl(coverMatch[1]);
    } else {
      const imgMatch = html.match(/"posterImg"\s*:\s*"([^"]+)"/);
      if (imgMatch) {
        cover = rewriteCoverUrl(imgMatch[1]);
      } else {
        const posterSelector = $('img').first();
        cover = rewriteCoverUrl(posterSelector.attr('src') || '');
      }
    }

    // Get Description
    const description = $('meta[name="description"]').attr('content') || '';

    // Get Video URL from next_f payload
    let videoUrl = '';
    const videoMatch = cleanedHtml.match(/(https:\/\/www\.cutad\.web\.id\/api\/proxy\?url=[^"]+)/);
    
    if (videoMatch) {
      const rawVideoUrl = videoMatch[1];
      // Rewrite the video URL to point to our local api proxy
      videoUrl = `/api/movie-proxy?url=${encodeURIComponent(rawVideoUrl)}`;
    }

    if (!videoUrl) {
      console.warn(`Video URL not found in Next.js payload for movie: ${id}`);
      return null;
    }

    const result: MovieDetail = {
      id,
      title: pageTitle,
      cover,
      description,
      videoUrl
    };

    movieDetailCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (err: any) {
    console.error(`Error fetching Movie Indo detail for ${id}:`, err.message);
    return null;
  }
}
