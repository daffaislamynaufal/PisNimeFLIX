import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return new NextResponse('Image URL is required', { status: 400 });
    }
    
    // Fetch image with spoofed Referer to bypass hotlinking protection
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'Referer': 'https://komiku.org/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 10000 // 10s timeout
    });
    
    const contentTypeHeader = response.headers['content-type'];
    const contentType = typeof contentTypeHeader === 'string' ? contentTypeHeader : 'image/jpeg';
    
    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache permanently (1 year)
      }
    });
  } catch (error: any) {
    console.error('Error in comic image proxy:', error.message);
    return new NextResponse('Failed to load image', { status: 500 });
  }
}
