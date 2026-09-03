import { describe, it, expect } from "vitest";
import { buildThemeCssVars, buildGoogleFontsUrl } from "@/lib/theme";
import type { ClientTheme } from "@/config/types";

const sampleTheme: ClientTheme = {
  bgDark: "#111111",
  ivory: "#eeeeee",
  sand: "#dddddd",
  brass: "#b08d57",
  brassLight: "#d9c7a3",
  ink: "#222222",
  inkSoft: "#333333",
  fontDisplay: "Fraunces",
  fontBody: "Manrope",
};

describe("buildThemeCssVars", () => {
  it("maps every theme token to its CSS custom property, plus an RGB-channel twin", () => {
    expect(buildThemeCssVars(sampleTheme)).toEqual({
      "--bg-dark": "#111111",
      "--bg-dark-rgb": "17 17 17",
      "--ivory": "#eeeeee",
      "--ivory-rgb": "238 238 238",
      "--sand": "#dddddd",
      "--sand-rgb": "221 221 221",
      "--brass": "#b08d57",
      "--brass-rgb": "176 141 87",
      "--brass-light": "#d9c7a3",
      "--brass-light-rgb": "217 199 163",
      "--ink": "#222222",
      "--ink-rgb": "34 34 34",
      "--ink-soft": "#333333",
      "--ink-soft-rgb": "51 51 51",
      "--font-display": "Fraunces",
      "--font-body": "Manrope",
    });
  });
});

describe("buildGoogleFontsUrl", () => {
  it("requests both theme fonts with display=swap", () => {
    expect(buildGoogleFontsUrl(sampleTheme)).toBe(
      "https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=Manrope:wght@400;500;600&display=swap"
    );
  });

  it("encodes spaces in font family names as plus signs", () => {
    const url = buildGoogleFontsUrl({ ...sampleTheme, fontDisplay: "Playfair Display" });
    expect(url).toContain("family=Playfair+Display:wght@400;600;700");
  });
});
