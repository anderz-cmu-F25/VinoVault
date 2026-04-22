/**
 * One-off runner for the price-refresh + price-drop monitor.
 * Usage: tsx scripts/run-monitor.ts
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

import mongoose from "mongoose";
import { runMonitor } from "../lib/monitor";

runMonitor()
  .then((result) => {
    console.log("\n[run-monitor] Result:", result);
  })
  .catch((err) => {
    console.error("[run-monitor] Fatal:", err);
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log("[run-monitor] Disconnected from MongoDB");
    process.exit(0);
  });
