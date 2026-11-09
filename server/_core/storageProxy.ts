import type { Express } from "express";
import {
  isStorageConfigured,
  isValidStorageKey,
  storageGetSignedUrl,
} from "../storage";
import { canAccessModule } from "../services/memberAccountService";
import { childLogger } from "./logger";
import { sdk } from "./sdk";

const log = childLogger("StorageProxy");

export function registerStorageProxy(app: Express) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = (req.params as any)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    if (!isValidStorageKey(key)) {
      res.status(400).send("Invalid storage key");
      return;
    }

    let user: Awaited<ReturnType<typeof sdk.authenticateRequest>>;
    try {
      user = await sdk.authenticateRequest(req);
    } catch {
      res.status(401).send("Authentication required");
      return;
    }
    if (!canAccessModule(user, "members")) {
      res.status(403).send("You do not have access to membership documents");
      return;
    }

    if (!isStorageConfigured()) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      const url = await storageGetSignedUrl(key);
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      log.error({ err }, "Storage proxy failed");
      res.status(502).send("Storage proxy error");
    }
  });
}
