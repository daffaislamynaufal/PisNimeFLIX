import axios from 'axios';
import * as cheerio from 'cheerio';

const BASE_URL = process.env.OTAKUDESU_BASE_URL || 'https://otakudesu.blog';

// In-Memory Cache configuration
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const cache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache TTL

async function getCached<T>(key: string, fetcher: () => Promise<T>, ttl: number = CACHE_DURATION): Promise<T> {
  const cached = cache.get(key);
  if (cached && (Date.now() - cached.timestamp < ttl)) {
    return cached.data;
  }
  const freshData = await fetcher();
  if (freshData && (!Array.isArray(freshData) || freshData.length > 0)) {
    cache.set(key, { data: freshData, timestamp: Date.now() });
  }
  return freshData;
}

// Helper function to optionally route requests through a proxy service to bypass Cloudflare
async function scraperRequest(method: 'GET' | 'POST', url: string, data?: any, customHeaders?: any) {
  let proxyPrefix = process.env.SCRAPER_PROXY_PREFIX || '';
  if (!proxyPrefix && url.includes('sankavollerei')) {
    proxyPrefix = 'https://pisnime-proxy.dfaxploit.workers.dev/?url=';
  }
  
  let requestUrl = url;
  let headers = { ...customHeaders };

  if (proxyPrefix) {
    if (proxyPrefix.endsWith('url=')) {
      requestUrl = `${proxyPrefix}${encodeURIComponent(url)}`;
    } else {
      const separator = proxyPrefix.includes('?') ? '&' : '?';
      requestUrl = `${proxyPrefix}${separator}url=${encodeURIComponent(url)}`;
    }
  } else {
    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  if (method === 'POST') {
    return await axios.post(requestUrl, data, { headers });
  } else {
    return await axios.get(requestUrl, { headers });
  }
}

// Helper to extract the last path segment (slug) from a URL
function getSlugFromUrl(url: string | undefined): string {
  if (!url) return '';
  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  const parts = cleanUrl.split('/');
  return parts[parts.length - 1] || '';
}

export interface OngoingAnime {
  title: string;
  poster: string;
  episodes: string;
  animeId: string;
  latestReleaseDate: string;
  releaseDay: string;
}

export interface SearchedAnime {
  title: string;
  poster: string;
  animeId: string;
  status: string;
  score: string;
}

export interface EpisodeItem {
  title: string;
  episodeId: string;
}

export interface RecommendationItem {
  title: string;
  poster: string;
  animeId: string;
}

export interface AnimeDetail {
  title: string;
  japanese: string;
  score: string;
  producers: string;
  type: string;
  status: string;
  episodes: string;
  duration: string;
  aired: string;
  studios: string;
  poster: string;
  synopsis: string;
  genres: string[];
  recommendations: RecommendationItem[];
  episodeList: EpisodeItem[];
}

export interface MirrorItem {
  quality: string;
  provider: string;
  content: string;
}

export interface WatchDetail {
  title: string;
  animeId: string;
  defaultStreamingUrl: string;
  prevEpisodeId: string | null;
  nextEpisodeId: string | null;
  episodeList: EpisodeItem[];
  mirrors: MirrorItem[];
}

export async function fetchOngoingAnime(page: number = 1): Promise<OngoingAnime[]> {
  const cacheKey = `ongoing-p${page}`;
  return getCached(cacheKey, async () => {
    try {
      const url = page > 1 ? `${BASE_URL}/ongoing-anime/page/${page}/` : `${BASE_URL}/ongoing-anime/`;
      const { data } = await scraperRequest('GET', url);
      
      const $ = cheerio.load(data);
      const list: OngoingAnime[] = [];
      
      $('.venz ul li').each((_, el) => {
        const title = $(el).find('h2.jdlflm').text().trim();
        const poster = $(el).find('.thumbz img').attr('data-src') || $(el).find('.thumbz img').attr('src') || '';
        const episodesText = $(el).find('.epz').text().trim();
        const href = $(el).find('.thumb a').attr('href');
        const animeId = getSlugFromUrl(href);
        const latestReleaseDate = $(el).find('.newnime').text().trim();
        const releaseDay = $(el).find('.epztipe').text().trim();
        
        if (title && animeId) {
          list.push({
            title,
            poster,
            episodes: episodesText,
            animeId,
            latestReleaseDate,
            releaseDay,
          });
        }
      });
      
      return list;
    } catch (error) {
      console.error('Error in fetchOngoingAnime:', error);
      return [];
    }
  });
}

export async function fetchCompleteAnime(page: number = 1): Promise<OngoingAnime[]> {
  const cacheKey = `complete-p${page}`;
  return getCached(cacheKey, async () => {
    try {
      const url = page > 1 ? `${BASE_URL}/complete-anime/page/${page}/` : `${BASE_URL}/complete-anime/`;
      const { data } = await scraperRequest('GET', url);
      
      const $ = cheerio.load(data);
      const list: OngoingAnime[] = [];
      
      $('.venz ul li').each((_, el) => {
        const title = $(el).find('h2.jdlflm').text().trim();
        const poster = $(el).find('.thumbz img').attr('data-src') || $(el).find('.thumbz img').attr('src') || '';
        const episodesText = $(el).find('.epz').text().trim();
        const href = $(el).find('.thumb a').attr('href');
        const animeId = getSlugFromUrl(href);
        const latestReleaseDate = $(el).find('.newnime').text().trim();
        const releaseDay = $(el).find('.epztipe').text().trim();
        
        if (title && animeId) {
          list.push({
            title,
            poster,
            episodes: episodesText,
            animeId,
            latestReleaseDate,
            releaseDay,
          });
        }
      });
      
      return list;
    } catch (error) {
      console.error('Error in fetchCompleteAnime:', error);
      return [];
    }
  });
}

export async function searchAnime(query: string): Promise<SearchedAnime[]> {
  try {
    const url = `${BASE_URL}/?s=${encodeURIComponent(query)}&post_type=anime`;
    const { data } = await scraperRequest('GET', url);
    
    const $ = cheerio.load(data);
    const list: SearchedAnime[] = [];
    
    $('ul.chivsrc li').each((_, el) => {
      const title = $(el).find('h2 a').text().trim();
      const href = $(el).find('h2 a').attr('href');
      const animeId = getSlugFromUrl(href);
      const poster = $(el).find('img').attr('data-src') || $(el).find('img').attr('src') || '';
      
      // Info elements (score, status, genre, etc.)
      const details: string[] = [];
      $(el).find('.set').each((_, detailEl) => {
        details.push($(detailEl).text().trim());
      });
      
      const status = details.find(d => d.includes('Status :'))?.split('Status :')[1]?.trim() || 'Unknown';
      const score = details.find(d => d.includes('Rating :'))?.split('Rating :')[1]?.trim() || 'N/A';
      
      if (title && animeId) {
        list.push({
          title,
          poster,
          animeId,
          status,
          score,
        });
      }
    });
    
    return list;
  } catch (error) {
    console.error('Error in searchAnime:', error);
    return [];
  }
}

export async function getAnimeDetail(id: string): Promise<AnimeDetail | null> {
  const cacheKey = `detail-${id}`;
  return getCached(cacheKey, async () => {
    try {
      const url = `${BASE_URL}/anime/${id}/`;
      const { data } = await scraperRequest('GET', url);
      
      const $ = cheerio.load(data);
      
      let title = '';
      let japanese = '';
      let score = '';
      let producers = '';
      let type = '';
      let status = '';
      let episodes = '';
      let duration = '';
      let aired = '';
      let studios = '';
      let genres: string[] = [];
      
      $('.infozingle p').each((_, el) => {
        const text = $(el).text();
        if (text.includes('Judul:')) title = text.split('Judul:')[1].trim();
        else if (text.includes('Japanese:')) japanese = text.split('Japanese:')[1].trim();
        else if (text.includes('Skor:')) score = text.split('Skor:')[1].trim();
        else if (text.includes('Produser:')) producers = text.split('Produser:')[1].trim();
        else if (text.includes('Tipe:')) type = text.split('Tipe:')[1].trim();
        else if (text.includes('Status:')) status = text.split('Status:')[1].trim();
        else if (text.includes('Total Episode:')) episodes = text.split('Total Episode:')[1].trim();
        else if (text.includes('Durasi:')) duration = text.split('Durasi:')[1].trim();
        else if (text.includes('Tanggal Rilis:')) aired = text.split('Tanggal Rilis:')[1].trim();
        else if (text.includes('Studio:')) studios = text.split('Studio:')[1].trim();
        else if (text.includes('Genre:')) genres = text.split('Genre:')[1].split(',').map(g => g.trim());
      });
      
      const poster = $('.fotoanime img').attr('data-src') || $('.fotoanime img').attr('src') || '';
      
      // Concatenate all synopsis paragraphs
      const paragraphs: string[] = [];
      $('.sinopc p').each((_, el) => {
        paragraphs.push($(el).text().trim());
      });
      const synopsis = paragraphs.filter(Boolean).join('\n\n');
      
      // Recommendations List
      const recommendations: RecommendationItem[] = [];
      $('.isi-recommend-anime-series .isi-konten').each((_, el) => {
        const recTitle = $(el).find('.judul-anime').text().trim();
        const recHref = $(el).find('.isi-anime a').attr('href');
        const recId = getSlugFromUrl(recHref);
        const recPoster = $(el).find('img').attr('data-src') || $(el).find('img').attr('src') || '';
        if (recTitle && recId) {
          recommendations.push({ title: recTitle, poster: recPoster, animeId: recId });
        }
      });

      // Episode List
      const episodeList: EpisodeItem[] = [];
      $('.episodelist li a, .ejul li a, .keyingpost li a').each((_, el) => {
        const href = $(el).attr('href') || '';
        if (!href.includes('/episode/')) return; // Filter out batch or other non-episode links
        
        const epTitle = $(el).text().trim();
        const episodeId = getSlugFromUrl(href);
        
        if (epTitle && episodeId) {
          episodeList.push({
            title: epTitle,
            episodeId,
          });
        }
      });

      return {
        title: title || $('h1.posttl').text().trim(),
        japanese,
        score,
        producers,
        type,
        status,
        episodes,
        duration,
        aired,
        studios,
        poster,
        synopsis,
        genres,
        recommendations,
        episodeList: episodeList.reverse(), // Reverse so episode 1 starts at the beginning
      };
    } catch (error) {
      console.error(`Error in getAnimeDetail for ID ${id}:`, error);
      return null;
    }
  });
}

export async function getEpisodeDetail(id: string): Promise<WatchDetail | null> {
  const cacheKey = `episode-${id}`;
  return getCached(cacheKey, async () => {
    try {
      const url = `${BASE_URL}/episode/${id}/`;
      const { data } = await scraperRequest('GET', url);
      
      const $ = cheerio.load(data);
      const title = $('.venutama h1.posttl').text().trim();
      
      // Anime ID / Slug
      const animeUrl = $('.alert-info a').attr('href') || $('.kategoz a').attr('href');
      const animeId = getSlugFromUrl(animeUrl);
      
      // Iframe streaming url
      const defaultStreamingUrl = $('.player-embed iframe').attr('src') || '';
      
      // Navigation Links (Prev/Next)
      let prevEpisodeId: string | null = null;
      let nextEpisodeId: string | null = null;
      
      $('.flir a').each((_, el) => {
        const text = $(el).text().toLowerCase();
        const href = $(el).attr('href');
        if (!href) return;
        const slug = getSlugFromUrl(href);
        
        if (text.includes('prev') || text.includes('sebelumnya')) {
          prevEpisodeId = slug;
        } else if (text.includes('next') || text.includes('selanjutnya')) {
          nextEpisodeId = slug;
        }
      });
      
      // Other episodes (usually listed under .keyingpost or .keyingpost li a)
      const episodeList: EpisodeItem[] = [];
      $('.keyingpost li a').each((_, el) => {
        const epTitle = $(el).text().trim();
        const href = $(el).attr('href');
        const epId = getSlugFromUrl(href);
        
        if (epTitle && epId) {
          episodeList.push({
            title: epTitle,
            episodeId: epId,
          });
        }
      });

      // Mirror streaming options
      const mirrors: MirrorItem[] = [];
      $('.mirrorstream ul').each((_, ul) => {
        const classList = $(ul).attr('class') || '';
        let quality = '360p';
        if (classList.includes('m480p')) quality = '480p';
        else if (classList.includes('m720p')) quality = '720p';
        else if (classList.includes('m360p')) quality = '360p';
        
        $(ul).find('li a').each((_, a) => {
          const provider = $(a).text().trim();
          const content = $(a).attr('data-content') || '';
          if (content) {
            mirrors.push({
              quality,
              provider,
              content
            });
          }
        });
      });
      
      return {
        title,
        animeId,
        defaultStreamingUrl,
        prevEpisodeId,
        nextEpisodeId,
        episodeList: episodeList.reverse(),
        mirrors,
      };
    } catch (error) {
      console.error(`Error in getEpisodeDetail for ID ${id}:`, error);
      return null;
    }
  });
}

export async function getMirrorIframe(content: string, episodeId: string): Promise<string | null> {
  const cacheKey = `mirror-${content}`;
  return getCached(cacheKey, async () => {
    try {
      const payload = JSON.parse(Buffer.from(content, 'base64').toString('utf-8'));
      const url = `${BASE_URL}/episode/${episodeId}/`;
      
      // 1. Fetch Nonce
      const resNonce = await scraperRequest('POST', `${BASE_URL}/wp-admin/admin-ajax.php`, 
        new URLSearchParams({ action: 'aa1208d27f29ca340c92c66d1926f13f' }),
        {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Origin': BASE_URL,
          'Referer': url
        }
      );
      
      const nonce = resNonce.data.data;
      if (!nonce) return null;
      
      // 2. Fetch Base64 Iframe HTML
      const resMirror = await scraperRequest('POST', `${BASE_URL}/wp-admin/admin-ajax.php`,
        new URLSearchParams({
          id: payload.id,
          i: payload.i,
          q: payload.q,
          nonce: nonce,
          action: '2a3505c93b0035d3f455df82bf976b84'
        }),
        {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Origin': BASE_URL,
          'Referer': url
        }
      );
      
      const base64Iframe = resMirror.data.data;
      if (!base64Iframe) return null;
      
      const iframeHtml = Buffer.from(base64Iframe, 'base64').toString('utf-8');
      const $ = cheerio.load(iframeHtml);
      const src = $('iframe').attr('src') || '';
      return src;
    } catch (error) {
      console.error('Error in getMirrorIframe:', error);
      return null;
    }
  });
}

// Comic Scraping Definitions & API Connections
const COMIC_BASE_URL = 'https://www.sankavollerei.web.id';

export interface ComicListItem {
  title: string;
  thumbnail: string;
  type: string;
  genre: string;
  url: string;
  detailUrl: string;
  slug: string;
  description: string;
  stats?: string;
  firstChapter?: { title: string; url: string };
  latestChapter?: { title: string; url: string };
}

export interface ComicDetailMetadata {
  type: string;
  author: string;
  status: string;
  concept: string;
  age_rating?: string;
  reading_direction?: string;
}

export interface ComicGenre {
  name: string;
  slug: string;
  link: string;
}

export interface ComicChapterItem {
  chapter: string;
  slug: string;
  link: string;
  date: string;
}

export interface ComicDetail {
  creator: string;
  slug: string;
  title: string;
  title_indonesian: string;
  image: string;
  synopsis: string;
  synopsis_full?: string;
  summary?: string;
  background_story?: string;
  metadata: ComicDetailMetadata;
  genres: ComicGenre[];
  chapters: ComicChapterItem[];
  similar_manga?: any[];
}

export interface ComicChapterDetail {
  creator: string;
  manga_title: string;
  chapter_title: string;
  navigation: {
    previousChapter: string | null;
    nextChapter: string | null;
    chapterList: string;
  };
  images: string[];
}

export async function fetchComicPustaka(page: number = 1): Promise<ComicListItem[]> {
  const cacheKey = `comic-pustaka-p${page}`;
  return getCached(cacheKey, async () => {
    try {
      const url = `${COMIC_BASE_URL}/comic/pustaka/${page}`;
      const { data } = await scraperRequest('GET', url);
      
      const results = data.results || [];
      return results.map((item: any) => {
        let slug = '';
        if (item.detailUrl) {
          const parts = item.detailUrl.replace(/\/$/, '').split('/');
          slug = parts[parts.length - 1];
        }
        return {
          title: item.title || '',
          thumbnail: item.thumbnail || '',
          type: item.type || 'Manga',
          genre: item.genre || '',
          url: item.url || '',
          detailUrl: item.detailUrl || '',
          slug: slug,
          description: item.description || '',
          stats: item.stats || '',
          firstChapter: item.firstChapter || null,
          latestChapter: item.latestChapter || null,
        };
      });
    } catch (error) {
      console.error(`Error in fetchComicPustaka page ${page}:`, error);
      return [];
    }
  }, 3 * 60 * 60 * 1000); // Cache pustaka for 3 hours
}

export async function searchComics(query: string): Promise<ComicListItem[]> {
  try {
    const url = `${COMIC_BASE_URL}/comic/search?q=${encodeURIComponent(query)}`;
    const { data } = await scraperRequest('GET', url);
    
    const items = data.data || [];
    return items.map((item: any) => {
      let slug = item.slug || '';
      if (!slug && item.href) {
        const parts = item.href.replace(/\/$/, '').split('/');
        slug = parts[parts.length - 1];
      }
      return {
        title: item.title || '',
        thumbnail: item.thumbnail || item.image || '',
        type: item.type || 'Manga',
        genre: item.genre || '',
        url: item.href ? `${COMIC_BASE_URL}${item.href}` : '',
        detailUrl: item.href || '',
        slug: slug,
        description: item.description || '',
      };
    });
  } catch (error) {
    console.error(`Error in searchComics for ${query}:`, error);
    return [];
  }
}

export async function fetchComicDetail(slug: string): Promise<ComicDetail | null> {
  const cacheKey = `comic-detail-${slug}`;
  return getCached(cacheKey, async () => {
    try {
      const url = `${COMIC_BASE_URL}/comic/comic/${slug}`;
      const { data } = await scraperRequest('GET', url);
      return data;
    } catch (error) {
      console.error(`Error in fetchComicDetail for ${slug}:`, error);
      return null;
    }
  }, 6 * 60 * 60 * 1000); // Cache comic details for 6 hours
}

export async function fetchChapterDetail(slug: string): Promise<ComicChapterDetail | null> {
  const cacheKey = `comic-chapter-${slug}`;
  return getCached(cacheKey, async () => {
    try {
      const url = `${COMIC_BASE_URL}/comic/chapter/${slug}`;
      const { data } = await scraperRequest('GET', url);
      return data;
    } catch (error) {
      console.error(`Error in fetchChapterDetail for ${slug}:`, error);
      return null;
    }
  }, 12 * 60 * 60 * 1000); // Cache chapter details (images) for 12 hours
}

// In-memory cache for dynamic multi-page type filtering
let cachedComicItems: ComicListItem[] = [];
let lastFetchedPustakaPage = 0;
let isPustakaFullyFetched = false;

export async function getComicsByType(
  type: string,
  page: number,
  limit: number = 12
): Promise<{ items: ComicListItem[]; hasMore: boolean }> {
  const typeLower = type ? type.toLowerCase() : 'all';

  const getFilteredFromCache = () => {
    if (typeLower === 'all' || typeLower === 'semua') {
      return cachedComicItems;
    }
    return cachedComicItems.filter((c) => c.type.toLowerCase() === typeLower);
  };

  const neededCount = page * limit;
  let pagesFetchedThisLoop = 0;
  const maxPagesPerLoop = 3; // Strict throttle: Max 3 API requests per user search to avoid rate limits

  // Scan and fetch next pages from pustaka until we have enough matches in cache
  while (
    getFilteredFromCache().length < neededCount &&
    !isPustakaFullyFetched &&
    lastFetchedPustakaPage < 150 &&
    pagesFetchedThisLoop < maxPagesPerLoop
  ) {
    const nextPage = lastFetchedPustakaPage + 1;
    
    // Polite throttle: add a small delay of 150ms between sequential API requests
    if (pagesFetchedThisLoop > 0) {
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    const pageItems = await fetchComicPustaka(nextPage);
    pagesFetchedThisLoop++;

    if (pageItems.length === 0) {
      isPustakaFullyFetched = true;
      break;
    }

    pageItems.forEach((item) => {
      if (!cachedComicItems.some((c) => c.slug === item.slug)) {
        cachedComicItems.push(item);
      }
    });

    lastFetchedPustakaPage = nextPage;
  }

  const filtered = getFilteredFromCache();
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const items = filtered.slice(startIndex, endIndex);
  const hasMore =
    filtered.length > endIndex || (!isPustakaFullyFetched && lastFetchedPustakaPage < 150);

  return { items, hasMore };
}

