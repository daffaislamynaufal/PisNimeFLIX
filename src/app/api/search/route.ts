import { NextResponse } from 'next/server';
import { searchAnime } from '@/lib/scraper';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    if (!query) {
      return NextResponse.json({ data: [] });
    }
    
    const data = await searchAnime(query);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in search API route:', error);
    return NextResponse.json({ error: 'Failed to search anime' }, { status: 500 });
  }
}
