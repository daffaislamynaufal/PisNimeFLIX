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

async function getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);
  if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
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
  const proxyPrefix = process.env.SCRAPER_PROXY_PREFIX || '';
  
  let requestUrl = url;
  let headers = { ...customHeaders };

  if (proxyPrefix) {
    const separator = proxyPrefix.includes('?') ? '&' : '?';
    requestUrl = `${proxyPrefix}${separator}url=${encodeURIComponent(url)}`;
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
