import { NextResponse } from 'next/server';
import { getMirrorIframe } from '@/lib/scraper';

export async function POST(request: Request) {
  try {
    const { content, episodeId } = await request.json();
    
    if (!content || !episodeId) {
      return NextResponse.json({ error: 'Content and episodeId are required' }, { status: 400 });
    }
    
    const src = await getMirrorIframe(content, episodeId);
    
    if (!src) {
      return NextResponse.json({ error: 'Failed to resolve mirror link' }, { status: 500 });
    }
    
    return NextResponse.json({ src });
  } catch (error) {
    console.error('Error in mirror resolution API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
