import { describe, expect, it } from "vitest";
import { moduleForProcedurePath } from "./trpc";

describe("module availability routing", () => {
  it("keeps the public NGA status endpoint available when Governance is disabled", () => {
    expect(moduleForProcedurePath("enterprise.nga.isActive")).toBeNull();
  });

  it("continues gating NGA operations behind Governance", () => {
    expect(moduleForProcedurePath("enterprise.nga.list")).toBe("governance");
  });
});
