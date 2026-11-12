import { app } from "./app.js";
import { redis } from "./config/redis.js";

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  await redis.connect();

  console.log("Connected to Redis");

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
