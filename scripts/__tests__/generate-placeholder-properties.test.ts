import { describe, it, expect } from "vitest";
import { pickColor } from "@/scripts/generate-placeholder-properties";
import { clientConfig } from "@/config/clients/pioneira";

describe("pickColor", () => {
  it("cycles through the theme palette", () => {
    expect(pickColor(0)).toBe(clientConfig.theme.bgDark);
    expect(pickColor(1)).toBe(clientConfig.theme.brass);
  });

  it("wraps around after the palette length", () => {
    expect(pickColor(4)).toBe(pickColor(0));
  });
});
