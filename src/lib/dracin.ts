import { headers } from 'next/headers';

// In-memory cookie cache
let cachedCookie = '';
let cookieExpiry = 0;

export async function getCutadCookie(): Promise<string> {
  if (cachedCookie && Date.now() < cookieExpiry) {
    return cachedCookie;
  }

  try {
    const res = await fetch('https://www.cutad.web.id/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      cache: 'no-store'
    });

    const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    let cutadSess = '';
    for (const cookie of setCookies) {
      if (cookie.includes('cutad_sess=')) {
        cutadSess = cookie.split(';')[0];
        break;
      }
    }

    if (!cutadSess) {
      // Fallback: check if we can parse from standard headers.get('set-cookie')
      const cookieStr = res.headers.get('set-cookie') || '';
      const parts = cookieStr.split(',');
      for (const part of parts) {
        if (part.includes('cutad_sess=')) {
          cutadSess = part.trim().split(';')[0];
          break;
        }
      }
    }

    if (cutadSess) {
      cachedCookie = cutadSess;
      // Cache cookie for 30 minutes
      cookieExpiry = Date.now() + 30 * 60 * 1000;
      return cutadSess;
    }
  } catch (err) {
    console.error('Error fetching cutad cookie:', err);
  }

  // Fallback to empty if it fails to avoid breaking compilation, but it will error during request
  throw new Error('Failed to obtain cutad_sess session cookie');
}

export const SOURCE_MAP: Record<string, string> = {
  dramabox: 'dramarush',
  reelshort: 'reelshort',
  shortmax: 'shortsky',
  netshort: 'netshort',
  goodshort: 'goodshort',
  dramawave: 'dramawave',
  flickreels: 'freereels',
  freereels: 'freereels',
  idrama: 'dotdrama',
  dramanova: 'dramanova',
  starshort: 'starshort',
  dramabite: 'dramabite'
};

export async function fetchCutadAPI(provider: string, action: string, queryParams: Record<string, string> = {}, clientUA?: string) {
  let cookie = await getCutadCookie();
  const searchParams = new URLSearchParams({ action, ...queryParams });
  const targetUrl = `https://www.cutad.web.id/api/${provider}?${searchParams.toString()}`;

  let response = await fetch(targetUrl, {
    method: 'GET',
    headers: {
      'User-Agent': clientUA || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Cookie': cookie,
      'Referer': 'https://www.cutad.web.id/'
    },
    cache: 'no-store'
  });

  // Optimize: If cookie expired/rejected, clear cache and retry once
  if (response.status === 401 || response.status === 403) {
    console.warn(`Cookie expired or rejected (status ${response.status}). Retrying with a fresh cookie...`);
    cachedCookie = '';
    cookieExpiry = 0;
    cookie = await getCutadCookie();
    response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': clientUA || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cookie': cookie,
        'Referer': 'https://www.cutad.web.id/'
      },
      cache: 'no-store'
    });
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch from cutad.web.id: ${response.statusText}`);
  }

  const rawText = await response.text();
  const normalizedText = rawText.replace(/:\s*(\d{16,})\b/g, ': "$1"');
  return JSON.parse(normalizedText);
}

// In-memory cache for API requests
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const catalogCache = new Map<string, CacheEntry<any>>();
const detailCache = new Map<string, CacheEntry<any>>();

const CATALOG_CACHE_TTL = 3 * 60 * 1000; // 3 minutes cache for catalog lists
const DETAIL_CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache for details

export function rewriteCoverUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('/api/dracin-proxy/')) {
    return url;
  }
  const match = url.match(/(?:\/api\/proxy\?u=([^&]+))/);
  if (match && match[1]) {
    return `/api/dracin-proxy/ts?u=${match[1]}`;
  }
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (!url.includes('localhost') && !url.includes('127.0.0.1') && !url.includes('daffaislamy.biz.id')) {
      try {
        const b64 = typeof btoa !== 'undefined' ? btoa(url) : Buffer.from(url).toString('base64');
        return `/api/dracin-proxy/ts?u=${encodeURIComponent(b64)}`;
      } catch (e) {
        return url;
      }
    }
  }
  
  return url;
}

export function extractTitle(obj: any): string {
  if (!obj) return '';
  const val = obj.title || obj.name || obj.bookName || obj.book_name || obj.dramaName || obj.drama_name || obj.dramaTitle || obj.filteredTitle || '';
  if (Array.isArray(val)) return String(val[0] || '');
  if (typeof val === 'object') return String(val.name || val.title || '');
  return String(val);
}

export function extractCover(obj: any): string {
  if (!obj) return '';
  let rawUrl = obj.cover || obj.coverImage || obj.cover_image || obj.coverUrl || obj.imageUrl || obj.image_url || obj.image || obj.verticalCover || obj.vertical_cover || obj.poster || obj.posterUrl || obj.poster_url || obj.posterImg || obj.thumbnail || '';
  if (Array.isArray(rawUrl)) {
    rawUrl = rawUrl[0] || '';
  }
  if (typeof rawUrl === 'object') {
    rawUrl = rawUrl.url || rawUrl.src || '';
  }
  return rewriteCoverUrl(String(rawUrl));
}

export function extractTotalEpisodes(obj: any, fallbackCount: number = 0): number {
  if (!obj) return fallbackCount;
  const val = obj.episode || obj.episodeCount || obj.totalEpisodes || obj.episodes || obj.episodeNum || obj.episode_num || obj.chapterCount || obj.chapters;
  if (val === undefined || val === null) return fallbackCount;
  if (Array.isArray(val)) return val.length;
  if (typeof val === 'object') {
    if (typeof val.length === 'number') return val.length;
    return fallbackCount;
  }
  const parsed = parseInt(String(val), 10);
  return isNaN(parsed) ? fallbackCount : parsed;
}

export function extractDescription(obj: any): string {
  if (!obj) return '';
  const val = obj.description || obj.synopsis || obj.intro || obj.summary || '';
  if (Array.isArray(val)) return String(val[0] || '');
  if (typeof val === 'object') return String(val.text || val.content || '');
  return String(val);
}

function mapDramaItem(item: any) {
  const id = item.id || item.dramaId || item.filteredTitle || item.key;
  return {
    id: id ? String(id) : '',
    title: extractTitle(item),
    cover: extractCover(item),
    totalEpisodes: extractTotalEpisodes(item, 0),
    isCompleted: '0',
    defaultLanguage: 'zh'
  };
}

export async function getDracinCatalog(source: string, type: string, page: number = 1, q: string = '', clientUA?: string) {
  const cacheKey = `${source}:${type}:${page}:${q}`;
  const cached = catalogCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CATALOG_CACHE_TTL) {
    return cached.data;
  }

  const mappedSource = SOURCE_MAP[source] || source;

  let result;
  if (type === 'search') {
    const data = await fetchCutadAPI(mappedSource, 'search', { q }, clientUA);
    const rawItems = data.data?.items || data.items || data.rows || data.list || data.results || [];
    result = {
      items: rawItems.map((item: any) => mapDramaItem(item))
    };
  } else {
    // Determine the catalog action depending on the provider
    let action = 'rank';
    let queryParams: Record<string, string> = {};
    
    if (mappedSource === 'netshort') {
      action = 'home';
      queryParams = { size: '300' };
    } else if (mappedSource === 'dotdrama') {
      action = 'list';
    }

    const data = await fetchCutadAPI(mappedSource, action, queryParams, clientUA);
    
    // Fallback parser to support multiple data structures
    let rawItems: any[] = [];
    if (data.data?.sections) {
      for (const sec of data.data.sections) {
        if (sec.items) {
          rawItems.push(...sec.items);
        }
      }
    } else if (Array.isArray(data.items)) {
      rawItems = data.items;
    } else if (Array.isArray(data.rows)) {
      rawItems = data.rows;
    } else if (Array.isArray(data.dramas)) {
      rawItems = data.dramas;
    } else if (Array.isArray(data.list)) {
      rawItems = data.list;
    } else if (Array.isArray(data.results)) {
      rawItems = data.results;
    } else if (data.data) {
      if (Array.isArray(data.data)) {
        rawItems = data.data;
      } else if (Array.isArray(data.data.items)) {
        rawItems = data.data.items;
      } else if (Array.isArray(data.data.rows)) {
        rawItems = data.data.rows;
      } else if (Array.isArray(data.data.dramas)) {
        rawItems = data.data.dramas;
      } else if (Array.isArray(data.data.list)) {
        rawItems = data.data.list;
      } else if (Array.isArray(data.data.results)) {
        rawItems = data.data.results;
      }
    }

    const allItems: any[] = [];
    const seenIds = new Set();
    
    for (const item of rawItems) {
      const mapped = mapDramaItem(item);
      if (mapped.id && !seenIds.has(mapped.id)) {
        seenIds.add(mapped.id);
        allItems.push(mapped);
      }
    }

    if (type === 'foryou') {
      const limit = 18;
      const startIndex = (page - 1) * limit;
      const paginatedItems = allItems.slice(startIndex, startIndex + limit);
      result = {
        items: paginatedItems,
        hasMore: startIndex + limit < allItems.length
      };
    } else {
      result = {
        items: allItems.slice(0, 30),
        hasMore: false
      };
    }
  }

  catalogCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

export async function getDracinDetail(source: string, id: string, clientUA?: string) {
  const cacheKey = `${source}:${id}`;
  const cached = detailCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < DETAIL_CACHE_TTL) {
    return cached.data;
  }

  const mappedSource = SOURCE_MAP[source] || source;
  const data = await fetchCutadAPI(mappedSource, 'detail', {
    id,
    dramaId: id,
    bookId: id,
    filteredTitle: id
  }, clientUA);
  
  const drama = data.data || data;
  if (!drama) return null;

  const chapters = drama.chapters || drama.episodes || drama.rows || drama.chapter_list || drama.chapterList || drama.episodeList || drama.items || [];
  const episodes = chapters.map((ch: any) => {
    const epNum = ch.episode || ch.episodeNumber || ch.episodeNo || ch.episode_no || ch.number || ch.chapter_no || ch.chapterNo || ch.sort || 1;
    const chId = ch.chapter_id || ch.id || ch.chapterId || ch.episodeNo || ch.chapterNo || '';
    const videoFakeId = `${id}::${drama.bookId || drama.id || drama.book_id || drama.dramaId || drama.drama_id || ''}::${chId}`;
    return {
      episodeNumber: epNum,
      number: epNum,
      title: ch.chapter_name || ch.chapterTitle || ch.title || ch.name || `Episode ${epNum}`,
      locked: false,
      videoUrl: videoFakeId
    };
  });

  const result = {
    id: drama.id || id,
    title: extractTitle(drama),
    cover: extractCover(drama),
    totalEpisodes: extractTotalEpisodes(drama, episodes.length),
    description: extractDescription(drama),
    synopsis: extractDescription(drama),
    isCompleted: '0',
    defaultLanguage: 'zh',
    viewCount: drama.viewCount || drama.view_count || 0,
    episodes
  };

  detailCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

export async function getDracinEpisodeStream(source: string, id: string, epNum: number, clientUA?: string) {
  const mappedSource = SOURCE_MAP[source] || source;
  
  const cacheKey = `${source}:${id}`;
  const cachedDetail = detailCache.get(cacheKey);
  
  let chapters: any[] = [];
  let bookId = '';
  
  if (cachedDetail && Date.now() - cachedDetail.timestamp < DETAIL_CACHE_TTL) {
    const detailData = cachedDetail.data;
    bookId = detailData.episodes[0]?.videoUrl?.split('::')[1] || '';
    chapters = detailData.episodes.map((ep: any) => {
      const parts = ep.videoUrl.split('::');
      return {
        episode: ep.episodeNumber,
        chapter_id: parts[2]
      };
    });
  } else {
    const detail = await fetchCutadAPI(mappedSource, 'detail', {
      id,
      dramaId: id,
      bookId: id,
      filteredTitle: id
    }, clientUA);
    const drama = detail.data || detail;
    if (!drama) {
      throw new Error('Drama detail not found');
    }
    bookId = drama.bookId || drama.id || drama.book_id || drama.dramaId || drama.drama_id || '';
    const rawChapters = drama.chapters || drama.episodes || drama.rows || drama.chapter_list || drama.chapterList || drama.episodeList || drama.items || [];
    chapters = rawChapters;
    
    const episodes = rawChapters.map((ch: any) => {
      const epNumVal = ch.episode || ch.episodeNumber || ch.episodeNo || ch.episode_no || ch.number || ch.chapter_no || ch.chapterNo || ch.sort || 1;
      const chId = ch.chapter_id || ch.id || ch.chapterId || ch.episodeNo || ch.chapterNo || '';
      return {
        episodeNumber: epNumVal,
        number: epNumVal,
        title: ch.chapter_name || ch.chapterTitle || ch.title || ch.name || `Episode ${epNumVal}`,
        locked: false,
        videoUrl: `${id}::${bookId}::${chId}`
      };
    });
    
    detailCache.set(cacheKey, {
      data: {
        id,
        title: extractTitle(drama),
        cover: extractCover(drama),
        totalEpisodes: extractTotalEpisodes(drama, episodes.length),
        description: extractDescription(drama),
        synopsis: extractDescription(drama),
        isCompleted: '0',
        defaultLanguage: 'zh',
        viewCount: drama.viewCount || drama.view_count || 0,
        episodes
      },
      timestamp: Date.now()
    });
  }

  const chapter = chapters.find((ch: any) => (ch.episode || ch.episodeNo || ch.episodeNumber) === epNum);
  if (!chapter) {
    throw new Error(`Episode ${epNum} not found`);
  }

  const chId = chapter.chapter_id || chapter.id || chapter.chapterId || chapter.episodeNo || String(epNum);

  // Group endpoints logic depending on the provider API structure
  let watchData;
  if (mappedSource === 'reelshort' || mappedSource === 'freereels' || mappedSource === 'dotdrama') {
    watchData = await fetchCutadAPI(mappedSource, 'watch', {
      bookId,
      chapterId: chId,
      episode: '1',
      filteredTitle: id,
      id,
      dramaId: id
    }, clientUA);
  } else if (mappedSource === 'meloshort') {
    watchData = await fetchCutadAPI(mappedSource, 'episode_video', {
      dramaId: id,
      bookId: id,
      id,
      chapterId: chId
    }, clientUA);
  } else {
    // For dramarush (DramaBox) and standard Group B platforms
    watchData = await fetchCutadAPI(mappedSource, 'episode_video', {
      id: id,
      dramaId: id,
      bookId: id,
      ep: String(epNum),
      chapterId: chId
    }, clientUA);
  }

  const relativeM3u8Url = watchData.url || watchData.data?.url || watchData.data || '';
  if (!relativeM3u8Url) {
    throw new Error('Watch URL not found in API response');
  }

  const proxyUrl = `/api/dracin-proxy/m3u8?path=${encodeURIComponent(relativeM3u8Url)}`;

  return {
    episodeNumber: epNum,
    number: epNum,
    locked: false,
    videoUrl: proxyUrl,
    msg: 'Success'
  };
}
