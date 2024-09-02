import { createClient } from "redis";
import "dotenv/config";
import RedisStore from "connect-redis";

const redisUrl = process.env.REDIS_URL || "";

export const redisClient = createClient({
  url: redisUrl,
  socket: {
    connectTimeout: 50000,
  },
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis Client connected"));

redisClient.connect().catch(console.error);

export const redisStore = new RedisStore({ client: redisClient });
