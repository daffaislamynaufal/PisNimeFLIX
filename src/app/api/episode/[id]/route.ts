import { NextResponse } from 'next/server';
import { getEpisodeDetail } from '@/lib/scraper';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Episode ID is required' }, { status: 400 });
    }
    
    const data = await getEpisodeDetail(id);
    if (!data) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in episode detail API route:', error);
    return NextResponse.json({ error: 'Failed to fetch episode details' }, { status: 500 });
  }
}
