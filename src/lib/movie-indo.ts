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
const movieCatalogCache = new Map<string, CacheEntry<any>>();
const movieDetailCache = new Map<string, CacheEntry<any>>();

const CATALOG_TTL = 5 * 60 * 1000; // 5 minutes
const DETAIL_TTL = 15 * 60 * 1000; // 15 minutes

export async function getMovieIndoCatalog(page: number = 1): Promise<{ items: MovieItem[]; hasMore: boolean }> {
  const cacheKey = `catalog-${page}`;
  const cached = movieCatalogCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CATALOG_TTL) {
    return cached.data;
  }

  try {
    const url = `${BASE_URL}/category/sfilmindo/?page=${page}`;
    const cookie = await getCutadCookie();
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cookie': cookie,
        'Referer': BASE_URL
      }
    });

    const $ = cheerio.load(response.data);
    const items: MovieItem[] = [];

    $('a.group.block').each((_, el) => {
      const href = $(el).attr('href') || '';
      const match = href.match(/\/watch\/sfilmindo\/([^/]+)/);
      if (!match) return;

      const slug = match[1];
      const title = $(el).find('h3').text().trim() || $(el).find('img').attr('alt') || '';
      const rawCover = $(el).find('img').attr('src') || $(el).find('img').attr('data-src') || '';
      
      items.push({
        id: slug,
        slug,
        title,
        cover: rewriteCoverUrl(rawCover)
      });
    });

    // Check pagination next page existence
    let hasMore = false;
    $('a').each((_, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr('href') || '';
      if (href.includes(`page=${page + 1}`) || (text.includes('Berikutnya') && href.includes(`page=${page + 1}`))) {
        hasMore = true;
      }
    });

    const result = { items, hasMore };
    movieCatalogCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (err: any) {
    console.error('Error fetching Movie Indo catalog:', err.message);
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
    const imgMatch = html.match(/"posterImg"\s*:\s*"([^"]+)"/);
    if (imgMatch) {
      cover = rewriteCoverUrl(imgMatch[1]);
    } else {
      // fallback
      const posterSelector = $('img').first();
      cover = rewriteCoverUrl(posterSelector.attr('src') || '');
    }

    // Get Description
    const description = $('meta[name="description"]').attr('content') || '';

    // Get Video URL from next_f payload
    let videoUrl = '';
    const cleanedHtml = html.replace(/\\u0026/g, '&').replace(/\\u002f/g, '/').replace(/\\/g, '');
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
