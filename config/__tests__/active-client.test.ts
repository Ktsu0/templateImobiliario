import { describe, it, expect, afterEach, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("activeClientConfig", () => {
  it("resolves the meridiano config when no slug is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_CLIENT_SLUG", "");
    const { activeClientConfig } = await import("@/config/active-client");
    expect(activeClientConfig.slug).toBe("meridiano");
  });

  it("falls back to meridiano for an unknown slug", async () => {
    vi.stubEnv("NEXT_PUBLIC_CLIENT_SLUG", "does-not-exist");
    const { activeClientConfig } = await import("@/config/active-client");
    expect(activeClientConfig.slug).toBe("meridiano");
  });
});
