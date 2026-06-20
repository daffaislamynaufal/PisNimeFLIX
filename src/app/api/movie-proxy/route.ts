import { NextResponse } from 'next/server';
import { getCutadCookie } from '@/lib/dracin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url') || '';

    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // SSRF Validation: verify targetUrl points to www.cutad.web.id/api/proxy
    let parsedUrl;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format.' }, { status: 400 });
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname !== 'www.cutad.web.id' && hostname !== 'cutad.web.id') {
      return NextResponse.json({ error: 'Unauthorized target host.' }, { status: 403 });
    }

    if (!parsedUrl.pathname.startsWith('/api/proxy')) {
      return NextResponse.json({ error: 'Unauthorized target path.' }, { status: 403 });
    }

    // Get cookie
    const cookie = await getCutadCookie();
    const clientUA = request.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    const rangeHeader = request.headers.get('range');
    const headersList: Record<string, string> = {
      'Cookie': cookie,
      'User-Agent': clientUA,
      'Referer': 'https://www.cutad.web.id/'
    };

    if (rangeHeader) {
      headersList['Range'] = rangeHeader;
    }

    const res = await fetch(targetUrl, {
      headers: headersList,
      cache: 'no-store'
    });

    if (!res.ok && res.status !== 206) {
      return NextResponse.json({ error: `Movie proxy failed with status ${res.status}` }, { status: res.status });
    }

    const responseHeaders = new Headers();
    if (res.headers.get('content-type')) {
      responseHeaders.set('Content-Type', res.headers.get('content-type')!);
    } else {
      responseHeaders.set('Content-Type', 'video/mp4');
    }
    
    if (res.headers.get('content-length')) {
      responseHeaders.set('Content-Length', res.headers.get('content-length')!);
    }
    if (res.headers.get('content-range')) {
      responseHeaders.set('Content-Range', res.headers.get('content-range')!);
    }
    if (res.headers.get('accept-ranges')) {
      responseHeaders.set('Accept-Ranges', res.headers.get('accept-ranges')!);
    }

    // Enable cross origin sharing and stream response directly
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(res.body, {
      status: res.status,
      headers: responseHeaders
    });
  } catch (error) {
    console.error('Error in movie proxy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
