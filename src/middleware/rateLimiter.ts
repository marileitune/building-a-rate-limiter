import type { Request, Response, NextFunction } from "express";

type RateLimitEntry = {
  count: number;
  windowStart: number;
};

const counters = new Map<string, RateLimitEntry>();

const MAX_REQUESTS = 100;
const WINDOW_SIZE_MS = 60_000; // 60 seconds in milliseconds

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const userId = req.header("x-user-id");

  // if there is no user in the headers
  if (!userId) {
    return res.status(400).send("User ID is required");
  }

  const user = counters.get(userId);
  const now = Date.now();

  // if the user is not in the map, add them with a count of 1 and set the window start time to now
  if (!user) {
    counters.set(userId, { count: 1, windowStart: now });
    return next();
  }

  const windowStart = user.windowStart;
  const elapsedTime = now - windowStart;
  const isWindowExpired = elapsedTime >= WINDOW_SIZE_MS;

  // if the user is in the map, check if the current window has expired
  if (isWindowExpired) {
    counters.set(userId, { count: 1, windowStart: now });
    return next();
  }

  // if the user is in the map and the current window has not expired, check if they have exceeded the max requests
  if (user.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((WINDOW_SIZE_MS - elapsedTime) / 1000);
    return res
      .status(429)
      .set("Retry-After", String(retryAfterSeconds))
      .send("Too many requests");
  }

  // if the user is in the map and the current window has not expired and they have not exceeded the max requests, increment their count
  user.count++;
  return next();
}
