import * as http from "http";
import app from "./app.ts";
import { disconnectDB, connectDB } from "./config/db.ts";
import { env } from "./config/env.ts";

const server = http.createServer(app);
let isShuttingDown = false;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    server.listen(env.port, () => {
      console.log(`Server is running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const shutdown = (signal: NodeJS.Signals | "UNHANDLED_REJECTION"): void => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`${signal} received. Shutting down...`);

  server.close((error?: Error) => {
    if (error) {
      console.error("Error while closing server:", error);
      process.exit(1);
    }

    disconnectDB()
      .then(() => {
        console.log("Server closed successfully.");
        process.exit(0);
      })
      .catch((disconnectError) => {
        console.error("Error while disconnecting database:", disconnectError);
        process.exit(1);
      });
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  shutdown("UNHANDLED_REJECTION");
});

void startServer();
