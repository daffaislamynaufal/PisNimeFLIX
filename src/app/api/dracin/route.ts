import { NextResponse } from 'next/server';

const ANICHIN_API_KEY = process.env.ANICHIN_API_KEY || 'TRIAL-ANICHIN-2026';

const ALLOWED_SOURCES = [
  'dramabox', 'reelshort', 'shortmax', 'netshort', 'goodshort',
  'dramawave', 'flickreels', 'freereels', 'idrama', 'dramanova',
  'starshort', 'dramabite'
];

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
    
    // Construct external target URL
    let targetUrl = `https://api.anichin.bio/${sourceParam}/${typeParam}`;
    
    if (typeParam === 'foryou') {
      const page = parseInt(searchParams.get('page') || '1', 10);
      if (isNaN(page) || page <= 0) {
        return NextResponse.json({ error: 'Invalid page parameter.' }, { status: 400 });
      }
      targetUrl += `?page=${page}`;
    } else if (typeParam === 'search') {
      const q = searchParams.get('q') || '';
      if (!q) {
        return NextResponse.json({ error: 'Query parameter q is required.' }, { status: 400 });
      }
      targetUrl += `?q=${encodeURIComponent(q)}`;
    } else if (typeParam === 'detail') {
      const id = searchParams.get('id') || '';
      if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
        return NextResponse.json({ error: 'Invalid drama id.' }, { status: 400 });
      }
      targetUrl += `?id=${id}`;
    } else if (typeParam === 'episode') {
      const id = searchParams.get('id') || '';
      const ep = parseInt(searchParams.get('ep') || '1', 10);
      if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
        return NextResponse.json({ error: 'Invalid drama id.' }, { status: 400 });
      }
      if (isNaN(ep) || ep <= 0) {
        return NextResponse.json({ error: 'Invalid episode number.' }, { status: 400 });
      }
      targetUrl += `?id=${id}&ep=${ep}`;
    }
    
    // Fetch from external api
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': ANICHIN_API_KEY,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `External API responded with status ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Dracin API proxy route:', error);
    return NextResponse.json({ error: 'Failed to process proxy request.' }, { status: 500 });
  }
}
