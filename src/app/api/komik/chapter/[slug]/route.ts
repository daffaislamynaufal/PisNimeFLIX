import { NextResponse } from 'next/server';
import { fetchChapterDetail } from '@/lib/scraper';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Chapter slug is required' }, { status: 400 });
    }
    
    const data = await fetchChapterDetail(slug);
    if (!data) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error(`Error in chapter detail API route for ${request.url}:`, error);
    return NextResponse.json({ error: 'Failed to fetch chapter details' }, { status: 500 });
  }
}
