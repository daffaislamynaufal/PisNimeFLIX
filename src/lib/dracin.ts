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
  const cookie = await getCutadCookie();
  const searchParams = new URLSearchParams({ action, ...queryParams });
  const targetUrl = `https://www.cutad.web.id/api/${provider}?${searchParams.toString()}`;

  const response = await fetch(targetUrl, {
    method: 'GET',
    headers: {
      'User-Agent': clientUA || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Cookie': cookie,
      'Referer': 'https://www.cutad.web.id/'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch from cutad.web.id: ${response.statusText}`);
  }

  return await response.json();
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

function mapDramaItem(item: any) {
  const id = item.id || item.dramaId || item.filteredTitle || item.key;
  return {
    id: id ? String(id) : '',
    title: item.title || '',
    cover: item.cover || item.poster || item.posterImg || item.thumbnail || '',
    totalEpisodes: item.episode || item.episodeCount || item.totalEpisodes || item.episodes || 0,
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
    const rawItems = data.data?.items || data.items || data.rows || [];
    result = {
      items: rawItems.map((item: any) => mapDramaItem(item))
    };
  } else {
    // Map other tabs to action=rank
    const data = await fetchCutadAPI(mappedSource, 'rank', {}, clientUA);
    
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
    } else if (data.data) {
      if (Array.isArray(data.data)) {
        rawItems = data.data;
      } else if (Array.isArray(data.data.items)) {
        rawItems = data.data.items;
      } else if (Array.isArray(data.data.rows)) {
        rawItems = data.data.rows;
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
  const data = await fetchCutadAPI(mappedSource, 'detail', { id }, clientUA);
  
  const drama = data.data || data;
  if (!drama) return null;

  const chapters = drama.chapters || drama.episodes || drama.rows || [];
  const episodes = chapters.map((ch: any) => {
    const epNum = ch.episode || ch.episodeNumber || ch.episodeNo || ch.episode_no || ch.number || 1;
    const chId = ch.chapter_id || ch.id || ch.chapterId || ch.episodeNo || '';
    const videoFakeId = `${id}::${drama.bookId || drama.id || ''}::${chId}`;
    return {
      episodeNumber: epNum,
      number: epNum,
      title: ch.chapter_name || ch.title || `Episode ${epNum}`,
      locked: false,
      videoUrl: videoFakeId
    };
  });

  const result = {
    id: drama.id || id,
    title: drama.title || '',
    cover: drama.cover || drama.poster || drama.posterImg || drama.thumbnail || '',
    totalEpisodes: drama.totalEpisodes || episodes.length,
    description: drama.description || drama.synopsis || '',
    synopsis: drama.description || drama.synopsis || '',
    isCompleted: '0',
    defaultLanguage: 'zh',
    viewCount: 0,
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
    const detail = await fetchCutadAPI(mappedSource, 'detail', { id }, clientUA);
    const drama = detail.data || detail;
    if (!drama) {
      throw new Error('Drama detail not found');
    }
    bookId = drama.bookId || drama.id || '';
    const rawChapters = drama.chapters || drama.episodes || drama.rows || [];
    chapters = rawChapters;
    
    const episodes = rawChapters.map((ch: any) => {
      const epNumVal = ch.episode || ch.episodeNumber || ch.episodeNo || ch.episode_no || ch.number || 1;
      const chId = ch.chapter_id || ch.id || ch.chapterId || ch.episodeNo || '';
      return {
        episodeNumber: epNumVal,
        number: epNumVal,
        title: ch.chapter_name || ch.title || `Episode ${epNumVal}`,
        locked: false,
        videoUrl: `${id}::${bookId}::${chId}`
      };
    });
    
    detailCache.set(cacheKey, {
      data: {
        id,
        title: drama.title || '',
        cover: drama.cover || drama.poster || drama.posterImg || drama.thumbnail || '',
        totalEpisodes: drama.totalEpisodes || episodes.length,
        description: drama.description || drama.synopsis || '',
        synopsis: drama.description || drama.synopsis || '',
        isCompleted: '0',
        defaultLanguage: 'zh',
        viewCount: 0,
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
      filteredTitle: id
    }, clientUA);
  } else if (mappedSource === 'meloshort') {
    watchData = await fetchCutadAPI(mappedSource, 'episode_video', {
      dramaId: id,
      chapterId: chId
    }, clientUA);
  } else {
    // For dramarush (DramaBox) and standard Group B platforms
    watchData = await fetchCutadAPI(mappedSource, 'episode_video', {
      id: id,
      ep: String(epNum)
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
