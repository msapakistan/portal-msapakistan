// Private object storage using the S3 API (Cloudflare R2 or another
// S3-compatible provider). Downloads use short-lived signed URLs.

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { ENV } from "./_core/env";

let s3Client: S3Client | null = null;

export function isStorageConfigured(): boolean {
  return Boolean(
    ENV.s3Endpoint &&
      ENV.s3Bucket &&
      ENV.s3AccessKeyId &&
      ENV.s3SecretAccessKey,
  );
}

function getS3Client(): S3Client {
  if (!isStorageConfigured()) {
    throw new Error(
      "Object storage is not configured. Set S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY.",
    );
  }
  if (s3Client) return s3Client;

  let endpoint: URL;
  try {
    endpoint = new URL(ENV.s3Endpoint);
  } catch {
    throw new Error("S3_ENDPOINT must be a valid absolute URL.");
  }
  if (
    (ENV.isProduction && endpoint.protocol !== "https:") ||
    (endpoint.protocol !== "https:" && endpoint.protocol !== "http:") ||
    endpoint.username ||
    endpoint.password ||
    endpoint.search ||
    endpoint.hash ||
    (endpoint.pathname !== "" && endpoint.pathname !== "/")
  ) {
    throw new Error("S3_ENDPOINT must be a secure provider endpoint URL.");
  }

  s3Client = new S3Client({
    region: ENV.s3Region,
    endpoint: endpoint.origin,
    forcePathStyle: true,
    credentials: {
      accessKeyId: ENV.s3AccessKeyId,
      secretAccessKey: ENV.s3SecretAccessKey,
    },
  });
  return s3Client;
}

export function isValidStorageKey(key: string): boolean {
  return (
    /^[A-Za-z0-9][A-Za-z0-9._/-]{0,511}$/.test(key) &&
    !key.split("/").includes("..")
  );
}

function normalizeKey(relKey: string): string {
  const key = relKey.replace(/^\/+/, "");
  if (!isValidStorageKey(key)) {
    throw new Error("Invalid object storage key.");
  }
  return key;
}

function appendHashSuffix(relKey: string): string {
  const hash = randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: ENV.s3Bucket,
      Key: key,
      Body: typeof data === "string" ? Buffer.from(data) : data,
      ContentType: contentType,
    }),
  );

  return { key, url: `/manus-storage/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `/manus-storage/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  return getSignedUrl(
    getS3Client(),
    new GetObjectCommand({ Bucket: ENV.s3Bucket, Key: key }),
    { expiresIn: 300 },
  );
}
