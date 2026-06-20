import { NextResponse } from 'next/server';
import { getCutadCookie } from '@/lib/dracin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const u = searchParams.get('u') || '';

    if (!u) {
      return NextResponse.json({ error: 'Missing u parameter' }, { status: 400 });
    }

    // SSRF Validation: Base64 decode 'u' and verify it's a valid public HTTP/HTTPS URL
    let decoded = '';
    try {
      decoded = Buffer.from(u, 'base64').toString('utf-8');
    } catch {
      return NextResponse.json({ error: 'Invalid base64 payload.' }, { status: 400 });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(decoded);
    } catch {
      return NextResponse.json({ error: 'Invalid URL within payload.' }, { status: 400 });
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return NextResponse.json({ error: 'Invalid URL protocol.' }, { status: 400 });
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.20.') ||
      hostname.startsWith('172.21.') ||
      hostname.startsWith('172.22.') ||
      hostname.startsWith('172.23.') ||
      hostname.startsWith('172.24.') ||
      hostname.startsWith('172.25.') ||
      hostname.startsWith('172.26.') ||
      hostname.startsWith('172.27.') ||
      hostname.startsWith('172.28.') ||
      hostname.startsWith('172.29.') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.')
    ) {
      return NextResponse.json({ error: 'Unauthorized hostname.' }, { status: 403 });
    }

    const cookie = await getCutadCookie();
    // Pass 'u' parameter directly to the cutad proxy endpoint
    const targetUrl = `https://www.cutad.web.id/api/proxy?u=${encodeURIComponent(u)}`;

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
      return NextResponse.json({ error: `TS chunk proxy failed with status ${res.status}` }, { status: res.status });
    }

    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'video/mp2t';
    return new Response(Buffer.from(arrayBuffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Length': res.headers.get('content-length') || String(arrayBuffer.byteLength),
        'Cache-Control': 'public, max-age=86400', // Cache TS chunks/images for 24 hours
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error in TS proxy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
