import { NextResponse } from 'next/server';
import { getCutadCookie } from '@/lib/dracin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || '';

    // Security validation: path must strictly match expected pattern /api/<provider>/proxy-m3u8?url=<encoded_url>
    if (!path || !/^\/api\/[a-zA-Z0-9_-]+\/proxy-m3u8\?url=https?%3A%2F%2F/.test(path)) {
      return NextResponse.json({ error: 'Invalid or unauthorized path parameter.' }, { status: 400 });
    }

    const cookie = await getCutadCookie();
    const targetUrl = `https://www.cutad.web.id${path}`;

    const clientUA = request.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    const res = await fetch(targetUrl, {
      headers: {
        'Cookie': cookie,
        'User-Agent': clientUA,
        'Referer': 'https://www.cutad.web.id/'
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Proxy failed with status ${res.status}` }, { status: res.status });
    }

    let m3u8Text = await res.text();

    // Replace all occurrences of /api/proxy?u= with /api/dracin-proxy/ts?u=
    m3u8Text = m3u8Text.replace(/\/api\/proxy\?u=/g, '/api/dracin-proxy/ts?u=');

    return new Response(m3u8Text, {
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error in m3u8 proxy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
