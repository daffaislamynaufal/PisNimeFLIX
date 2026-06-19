import { NextResponse } from 'next/server';
import { fetchComicDetail } from '@/lib/scraper';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Comic slug is required' }, { status: 400 });
    }
    
    const data = await fetchComicDetail(slug);
    if (!data) {
      return NextResponse.json({ error: 'Comic not found' }, { status: 404 });
    }
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error(`Error in comic detail API route for ${request.url}:`, error);
    return NextResponse.json({ error: 'Failed to fetch comic details' }, { status: 500 });
  }
}
