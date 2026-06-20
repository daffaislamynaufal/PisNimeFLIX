import { NextResponse } from 'next/server';
import { getDracinCatalog, getDracinDetail, getDracinEpisodeStream, SOURCE_MAP } from '@/lib/dracin';

const ALLOWED_SOURCES = Object.keys(SOURCE_MAP);

const ALLOWED_TYPES = [
  'trending', 'foryou', 'hotrank', 'recommended', 'search', 'detail', 'episode'
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceParam = (searchParams.get('source') || '').toLowerCase();
    const typeParam = (searchParams.get('type') || '').toLowerCase();
    
    // 1. Validation
    if (!ALLOWED_SOURCES.includes(sourceParam)) {
      return NextResponse.json({ error: 'Invalid source platform.' }, { status: 400 });
    }
    
    if (!ALLOWED_TYPES.includes(typeParam)) {
      return NextResponse.json({ error: 'Invalid query type.' }, { status: 400 });
    }
    
    const clientUserAgent = request.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    let resultData;

    if (typeParam === 'detail') {
      const id = searchParams.get('id') || '';
      if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
        return NextResponse.json({ error: 'Invalid drama id.' }, { status: 400 });
      }
      resultData = await getDracinDetail(sourceParam, id, clientUserAgent);
      if (!resultData) {
        return NextResponse.json({ error: 'Drama not found' }, { status: 404 });
      }
    } else if (typeParam === 'episode') {
      const id = searchParams.get('id') || '';
      const ep = parseInt(searchParams.get('ep') || '1', 10);
      if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
        return NextResponse.json({ error: 'Invalid drama id.' }, { status: 400 });
      }
      if (isNaN(ep) || ep <= 0) {
        return NextResponse.json({ error: 'Invalid episode number.' }, { status: 400 });
      }
      resultData = await getDracinEpisodeStream(sourceParam, id, ep, clientUserAgent);
    } else {
      // Catalog: trending, foryou, hotrank, recommended, search
      const page = parseInt(searchParams.get('page') || '1', 10);
      const q = searchParams.get('q') || '';
      const pageVal = isNaN(page) || page <= 0 ? 1 : page;
      resultData = await getDracinCatalog(sourceParam, typeParam, pageVal, q, clientUserAgent);
    }
    
    return NextResponse.json(resultData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error in Dracin API proxy route:', error);
    return NextResponse.json({ error: 'Failed to process proxy request.' }, { status: 500 });
  }
}
