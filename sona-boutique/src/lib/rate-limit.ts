type RateLimitEntry = {
  count: number;
  resetAt: Date;
};

const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries periodically — runs every 60 seconds
setInterval(() => {
  const now = new Date();
  store.forEach((entry, key) => {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  });
}, 60_000);

/**
 * Checks whether the given identifier has exceeded the rate limit.
 * If the limit is not exceeded, increments the counter.
 *
 * @param identifier - Unique key to rate-limit by (e.g. "login:127.0.0.1").
 * @param limit - Maximum number of allowed requests within the window.
 * @param windowMs - Time window in milliseconds.
 * @returns An object with `success` (true if allowed), `remaining` (requests left), and `resetAt`.
 */
export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
): { success: boolean; remaining: number; resetAt: Date } {
  const now = new Date();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt <= now) {
    // First request or window expired — create new entry
    const resetAt = new Date(now.getTime() + windowMs);
    store.set(identifier, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  // Increment existing entry
  entry.count++;

  if (entry.count > limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/**
 * Higher-order function that wraps an API route handler with rate limiting.
 * Returns a 429 response if the limit is exceeded.
 *
 * @param handler - The route handler function.
 * @param options - Rate limit options: `limit`, `windowMs`, and a `keyFn` to derive the identifier from the request.
 * @returns A wrapped handler with rate limiting.
 */
export function withRateLimit(
  handler: (req: Request, ctx: { params: Record<string, string | undefined> }) => Promise<Response>,
  options: {
    limit: number;
    windowMs: number;
    keyFn?: (req: Request) => string;
  },
) {
  return async (req: Request, ctx: { params: Record<string, string | undefined> }) => {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const identifier = options.keyFn
      ? options.keyFn(req)
      : `${req.method}:${new URL(req.url).pathname}:${ip}`;
    const result = checkRateLimit(identifier, options.limit, options.windowMs);

    if (!result.success) {
      const retryAfter = Math.ceil((result.resetAt.getTime() - Date.now()) / 1000);
      return Response.json(
        { error: "Too many requests. Bitte versuchen Sie es später erneut." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": options.limit.toString(),
            "X-RateLimit-Remaining": "0",
            "Retry-After": retryAfter.toString(),
          },
        },
      );
    }

    return handler(req, ctx);
  };
}
