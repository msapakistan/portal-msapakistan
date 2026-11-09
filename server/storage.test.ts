import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  getSignedUrl: vi.fn(),
}));

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {
    send(...args: unknown[]) {
      return mocks.send(...args);
    }
  },
  PutObjectCommand: class {
    constructor(readonly input: unknown) {}
  },
  GetObjectCommand: class {
    constructor(readonly input: unknown) {}
  },
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: mocks.getSignedUrl,
}));

const storageEnvKeys = [
  "S3_ENDPOINT",
  "S3_BUCKET",
  "S3_REGION",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
] as const;
const originalStorageEnv = new Map(
  storageEnvKeys.map((key) => [key, process.env[key]]),
);

describe("object storage", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.S3_ENDPOINT = "https://account.r2.cloudflarestorage.com";
    process.env.S3_BUCKET = "msap-private";
    process.env.S3_REGION = "auto";
    process.env.S3_ACCESS_KEY_ID = "test-access-key";
    process.env.S3_SECRET_ACCESS_KEY = "test-secret-key";
    mocks.send.mockResolvedValue({});
    mocks.getSignedUrl.mockResolvedValue("https://storage.example/signed");
  });

  afterEach(() => {
    for (const key of storageEnvKeys) {
      const originalValue = originalStorageEnv.get(key);
      if (originalValue === undefined) delete process.env[key];
      else process.env[key] = originalValue;
    }
  });

  it("writes files to the configured private bucket with a unique key", async () => {
    const { storagePut } = await import("./storage");
    const contents = Buffer.from("file contents");

    const result = await storagePut(
      "applications/cv/application.pdf",
      contents,
      "application/pdf",
    );

    expect(result.key).toMatch(
      /^applications\/cv\/application_[a-f0-9]{8}\.pdf$/,
    );
    expect(result.url).toBe(`/manus-storage/${result.key}`);
    expect(mocks.send).toHaveBeenCalledTimes(1);
    expect(mocks.send.mock.calls[0][0]).toMatchObject({
      input: {
        Bucket: "msap-private",
        Key: result.key,
        Body: contents,
        ContentType: "application/pdf",
      },
    });
  });

  it("creates a short-lived signed URL for private downloads", async () => {
    const { storageGetSignedUrl } = await import("./storage");

    await expect(
      storageGetSignedUrl("applications/cv/application.pdf"),
    ).resolves.toBe("https://storage.example/signed");
    expect(mocks.getSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        input: {
          Bucket: "msap-private",
          Key: "applications/cv/application.pdf",
        },
      }),
      { expiresIn: 300 },
    );
  });

  it("rejects unsafe object keys before access", async () => {
    const { storageGetSignedUrl } = await import("./storage");

    await expect(
      storageGetSignedUrl("applications/../private.pdf"),
    ).rejects.toThrow("Invalid object storage key.");
    expect(mocks.getSignedUrl).not.toHaveBeenCalled();
  });
});
