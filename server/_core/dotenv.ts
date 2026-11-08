/**
 * Environment bootstrap.
 *
 * MUST be the first import in the server entry point: ES module imports are
 * evaluated in source order, so `server/_core/env.ts` (which captures
 * process.env values into a frozen ENV object) only sees the real values if
 * .env is loaded before it is evaluated.
 *
 * In development the project .env intentionally wins over shell defaults.
 * In production, values configured by the host must take precedence over any
 * accidentally-present .env file.
 */
import dotenv from "dotenv";

dotenv.config({
  override: process.env.NODE_ENV !== "production",
  quiet: true,
});
