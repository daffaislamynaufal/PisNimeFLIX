import { NextResponse } from 'next/server';
import { getComicsByType, searchComics } from '@/lib/scraper';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const query = searchParams.get('q') || '';

    if (query) {
      const data = await searchComics(query);
      return NextResponse.json({ items: data, hasMore: false });
    }

    const { items, hasMore } = await getComicsByType(type, page, 12);
    return NextResponse.json({ items, hasMore });
  } catch (error) {
    console.error('Error in komik API route:', error);
    return NextResponse.json({ error: 'Failed to fetch comics' }, { status: 500 });
  }
}
