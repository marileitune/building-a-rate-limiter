import express from "express";
import { rateLimiter } from "./middleware/rateLimiter.js";

export const app = express();

// Apply rate limiting to all routes
app.use(rateLimiter);

app.get("/hello", (req, res) => {
  res.json({ message: "Hello World!" });
});
