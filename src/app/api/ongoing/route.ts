import { NextResponse } from 'next/server';
import { fetchOngoingAnime } from '@/lib/scraper';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    
    const data = await fetchOngoingAnime(page);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in ongoing API route:', error);
    return NextResponse.json({ error: 'Failed to fetch ongoing anime' }, { status: 500 });
  }
}
