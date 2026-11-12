import type { Request, Response, NextFunction } from "express";
import { redis } from "../config/redis.js";

const MAX_REQUESTS = 100;
const WINDOW_SIZE_SECONDS = 60; // 60 seconds

export async function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.header("x-user-id");

  // if there is no user in the headers
  if (!userId) {
    return res.status(400).send("User ID is required");
  }

  const key = `rate-limit:${userId}`;
  const count = await redis.incr(key);

  // Set expiration when a new counter is created
  if (count === 1) {
    await redis.expire(key, WINDOW_SIZE_SECONDS);
  }

  // Reject requests that exceed the limit
  if (count > MAX_REQUESTS) {
    const retryAfterSeconds = await redis.ttl(key);
    return res
      .status(429)
      .set("Retry-After", String(retryAfterSeconds))
      .send("Too many requests");
  }
  return next();
}
