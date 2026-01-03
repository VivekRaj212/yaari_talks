import { getEnv } from "../utils/get-env";

export const Env = {
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("PORT", "8000"),
  MONGO_URI: getEnv(
    "MONGO_URI",
    "mongodb+srv://bhardwajvivek2980_db_user:MqtRjI7rM5i3ElVb@mern-chat-cluster.kttewzu.mongodb.net/?appName=mern-chat-cluster"
  ),
  JWT_SECRET: getEnv("JWT_SECRET", "secret_jwt"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "15m"),
  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "http://localhost:5173"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME", "yaari-chats"),
  CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY", "514382398314764"),
  CLOUDINARY_API_SECRET: getEnv(
    "CLOUDINARY_API_SECRET",
    "alYyoqqQhSC-mUD7nM3TZ6pEIXU"
  ),
  GOOGLE_GENERATIVE_API_KEY: getEnv(
    "GOOGLE_GENERATIVE_API_KEY",
    "AIzaSyBTc5hsSzSZpRLupSfqoGqeNwCdnZQyZQ8"
  ),
} as const;
