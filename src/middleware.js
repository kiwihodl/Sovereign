import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

// In-memory store for development
const inMemoryStore = new Map();

// Simple in-memory rate limiter for development
const localRatelimit = {
  limit: async (key) => {
    const now = Date.now();
    const windowMs = 10 * 1000; // 10 seconds
    const maxRequests = 5;

    const requestLog = inMemoryStore.get(key) || [];
    const windowStart = now - windowMs;

    const recentRequests = requestLog.filter(timestamp => timestamp > windowStart);
    const isRateLimited = recentRequests.length >= maxRequests;

    if (!isRateLimited) {
      recentRequests.push(now);
      inMemoryStore.set(key, recentRequests);
    }

    return {
      success: !isRateLimited,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - recentRequests.length),
      reset: windowStart + windowMs,
    };
  },
};

// Use local rate limiter for development, Upstash for production
const ratelimit = process.env.NODE_ENV === 'production'
  ? new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
      timeout: 1000,
    })
  : localRatelimit;

// Define which routes you want to rate limit
export const config = {
  matcher: '/api/:path*',
};

export default async function middleware(request) {
  const ip = request.ip ?? '127.0.0.1';
  const { success, limit, remaining, reset } = await ratelimit.limit(
    `ratelimit_middleware_${ip}`
  );

  if (!success) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
      },
    });
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());

  return response;
}