import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

const ratelimit = new Ratelimit({
  redis: kv,
  // 5 requests from the same IP in 10 seconds
  limiter: Ratelimit.slidingWindow(5, '10 s'),
  analytics: true,
  timeout: 1000, // 1 second
});

// Define which routes you want to rate limit
export const config = {
  matcher: '/api/:path*',
};

export default async function middleware(request) {
  const ip = request.ip ?? '127.0.0.1';
  const { success, pending, limit, reset, remaining } = await ratelimit.limit(
    `ratelimit_middleware_${ip}`
  );

  if (!success) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': reset.toString(),
      },
    });
  }

  return NextResponse.next();
}