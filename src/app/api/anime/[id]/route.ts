import { NextResponse } from 'next/server';
import { getAnimeDetail } from '@/lib/scraper';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Anime ID is required' }, { status: 400 });
    }
    
    const data = await getAnimeDetail(id);
    if (!data) {
      return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in anime detail API route:', error);
    return NextResponse.json({ error: 'Failed to fetch anime details' }, { status: 500 });
  }
}
