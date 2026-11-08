import { describe, expect, it } from "vitest";
import { publicGovernance } from "./publicGovernance";

describe("2026-27 bylaws publication", () => {
  it("publishes the current edition metadata and verified role changes", async () => {
    const overview = await publicGovernance.getOverview();
    const section = await publicGovernance.getSection("B-6.9");
    const positions = publicGovernance.getPositions();

    expect(overview.documentVersion).toBe("2026-27 Edition");
    expect(overview.lastAmended).toBe("25th October 2026");
    expect(overview.effectiveFrom).toContain("Not separately specified");
    expect(section?.content).toContain("Observer Members");
    expect(
      positions.find((position) => position.title.includes("NOWA"))?.body
    ).toBe("Team of Officials");
    expect(positions.find((position) => position.title === "Regional Directors")?.electionMethod).toContain(
      "prescribed"
    );
  });
});
