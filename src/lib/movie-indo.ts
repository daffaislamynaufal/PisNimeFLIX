import axios from 'axios';
import * as cheerio from 'cheerio';
import { getCutadCookie, rewriteCoverUrl } from './dracin';

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

let cachedAllMovies: MovieItem[] | null = null;
let cachedAllMoviesExpiry = 0;
const ALL_MOVIES_TTL = 30 * 60 * 1000; // 30 minutes

export async function getAllMovieIndo(): Promise<MovieItem[]> {
  if (cachedAllMovies && Date.now() < cachedAllMoviesExpiry) {
    return cachedAllMovies;
  }

  const allItems: MovieItem[] = [];
  let page = 1;
  let hasMore = true;

  try {
    const cookie = await getCutadCookie();
    while (hasMore && page <= 10) { // Safety limit of 10 pages
      const url = `${BASE_URL}/category/sfilmindo/?page=${page}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Cookie': cookie,
          'Referer': BASE_URL
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const pageItems: MovieItem[] = [];

      $('a.group.block').each((_, el) => {
        const href = $(el).attr('href') || '';
        const match = href.match(/\/watch\/sfilmindo\/([^/]+)/);
        if (!match) return;

        const slug = match[1];
        const title = $(el).find('h3').text().trim() || $(el).find('img').attr('alt') || '';
        const rawCover = $(el).find('img').attr('src') || $(el).find('img').attr('data-src') || '';
        
        pageItems.push({
          id: slug,
          slug,
          title,
          cover: rewriteCoverUrl(rawCover)
        });
      });

      if (pageItems.length === 0) {
        break;
      }

      allItems.push(...pageItems);

      // Check pagination next page existence
      let pageHasMore = false;
      $('a').each((_, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href') || '';
        if (href.includes(`page=${page + 1}`) || (text.includes('Berikutnya') && href.includes(`page=${page + 1}`))) {
          pageHasMore = true;
        }
      });

      hasMore = pageHasMore;
      page++;
    }

    if (allItems.length > 0) {
      cachedAllMovies = allItems;
      cachedAllMoviesExpiry = Date.now() + ALL_MOVIES_TTL;
    }
    return allItems;
  } catch (err: any) {
    console.error('Error fetching all Movie Indo:', err.message);
    if (cachedAllMovies) {
      return cachedAllMovies;
    }
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
