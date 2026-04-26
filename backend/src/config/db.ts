import mongoose from "mongoose";
import { env } from "./env.ts";

const DATABASE_NAME = "gameorbit";

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(env.databaseUrl, {
    dbName: DATABASE_NAME,
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB connected (${DATABASE_NAME})`);
};

export const disconnectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.connection.close();
  console.log("MongoDB disconnected");
};
