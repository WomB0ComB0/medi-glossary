import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (isPublicAsset(request)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};

const isPublicAsset = (request: NextRequest): boolean => {
  const publicPaths = [
    '/assets/',
    '/pwa/',
    '/images/',
    '/icon/',
    '/media/',
    '/favicon.ico',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    '/apple-touch-icon.png',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/robots.txt',
    '/sitemap.xml',
    '/manifest.webmanifest',
    '/sw.js',
  ];

  return publicPaths.some((path) => request.nextUrl.pathname.startsWith(path));
};
