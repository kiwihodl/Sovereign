import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

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

  // Allow access to .well-known paths
  if (pathname.startsWith('/.well-known')) {
    const { success } = await ratelimit.limit(ip);
    return success
      ? NextResponse.next()
      : NextResponse.redirect(new URL('/blocked', request.url));
  }

  // Check if the request is internal
  if (!isInternalRequest(request)) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { 
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Apply rate limiting for allowed requests
  const { success } = await ratelimit.limit(ip);
  return success
    ? NextResponse.next()
    : NextResponse.redirect(new URL('/blocked', request.url));
}

function isInternalRequest(request) {
  // Check if the request is from the same origin
  const requestHost = request.headers.get('host');
  const requestProtocol = request.headers.get('x-forwarded-proto') || 'http';
  const requestOrigin = `${requestProtocol}://${requestHost}`;

  // Check if the request has a referer from the same origin
  const referer = request.headers.get('referer');
  
  // Allow requests with no referer (direct API calls from your app)
  if (!referer) {
    return true;
  }

  // Check if the referer matches the request origin
  return referer.startsWith(requestOrigin);
}