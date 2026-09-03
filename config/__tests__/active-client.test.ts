import { describe, it, expect, afterEach, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("activeClientConfig", () => {
  it("resolves the pioneira config when no slug is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_CLIENT_SLUG", "");
    const { activeClientConfig } = await import("@/config/active-client");
    expect(activeClientConfig.slug).toBe("pioneira");
  });

  it("falls back to pioneira for an unknown slug", async () => {
    vi.stubEnv("NEXT_PUBLIC_CLIENT_SLUG", "does-not-exist");
    const { activeClientConfig } = await import("@/config/active-client");
    expect(activeClientConfig.slug).toBe("pioneira");
  });
});
