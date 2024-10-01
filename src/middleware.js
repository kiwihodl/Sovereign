import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

const FRONTEND_HOSTNAME = process.env.FRONTEND_HOSTNAME
const FRONTEND_STAGING_HOSTNAME = process.env.FRONTEND_STAGING_HOSTNAME
const BACKEND_URL = process.env.BACKEND_URL
const BACKEND_STAGING_URL = process.env.BACKEND_STAGING_URL

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(5, '10 s'),
});

export const config = {
  matcher: ['/api/:path*'],
};

export default async function combinedMiddleware(request) {
  const ip = request.ip ?? '127.0.0.1';
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get('host');
  console.log("Host", host)
  // Allow access to .well-known paths
  if (pathname.startsWith('/.well-known')) {
    const { success } = await ratelimit.limit(ip);
    return success
      ? NextResponse.next()
      : NextResponse.redirect(new URL('/blocked', request.url));
  }

  // Check if the request is coming from allowed hosts
  const allowedHosts = [
    FRONTEND_HOSTNAME,
    FRONTEND_STAGING_HOSTNAME,
    new URL(BACKEND_URL).host,
    new URL(BACKEND_STAGING_URL).host
  ].filter(Boolean);
  console.log("Allowed hosts", allowedHosts)

  if (!allowedHosts.includes(host)) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { 
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Apply rate limiting for allowed hosts
  const { success } = await ratelimit.limit(ip);
  return success
    ? NextResponse.next()
    : NextResponse.redirect(new URL('/blocked', request.url));
}