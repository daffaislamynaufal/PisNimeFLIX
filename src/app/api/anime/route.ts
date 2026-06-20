import { NextResponse } from 'next/server';
import { fetchOngoingAnime, fetchCompleteAnime, searchAnime } from '@/lib/scraper';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Input validation & sanitization
    const status = searchParams.get('status') === 'completed' ? 'completed' : 'ongoing';
    
    const pageRaw = searchParams.get('page') || '1';
    let page = parseInt(pageRaw, 10);
    if (isNaN(page) || page < 1) {
      page = 1;
    }
    
    const query = (searchParams.get('q') || '').substring(0, 100).trim();

    // If query is provided, perform search
    if (query) {
      const data = await searchAnime(query);
      const items = data.map(item => ({
        animeId: item.animeId,
        title: item.title,
        poster: item.poster,
        episodes: item.status || 'Unknown',
        releaseDay: item.score && item.score !== 'N/A' ? `★ ${item.score}` : undefined,
        latestReleaseDate: 'Hasil pencarian',
        isSearch: true
      }));
      return NextResponse.json({ items, hasMore: false });
    }

    // Otherwise, fetch by status (ongoing or completed)
    const data = status === 'completed'
      ? await fetchCompleteAnime(page)
      : await fetchOngoingAnime(page);

    const items = data.map(item => ({
      animeId: item.animeId,
      title: item.title,
      poster: item.poster,
      episodes: item.episodes,
      releaseDay: item.releaseDay,
      latestReleaseDate: item.latestReleaseDate,
      isSearch: false
    }));

    const hasMore = items.length > 0;

    return NextResponse.json({ items, hasMore });
  } catch (error) {
    console.error('Error in anime API route:', error);
    return NextResponse.json({ error: 'Failed to fetch anime' }, { status: 500 });
  }
}
