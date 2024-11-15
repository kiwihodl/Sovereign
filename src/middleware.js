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
    const maxRequests = 40;

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
      limiter: Ratelimit.slidingWindow(40, '10 s'),
      analytics: true,
      timeout: 1000,
    })
  : localRatelimit;

// Define which routes you want to rate limit
export const config = {
  matcher: [
    // Exclude .well-known routes from middleware
    '/((?!.well-known).*)',
  ]
};

export default async function middleware(request) {
  // Add CORS headers for all responses
  const response = NextResponse.next();
  
  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS request
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { 
      status: 200,
      headers: response.headers
    });
  }

  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success, limit, remaining, reset } = await ratelimit.limit(
      `ratelimit_middleware_${ip}`
    );

    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', reset.toString());
  }

  return response;
}