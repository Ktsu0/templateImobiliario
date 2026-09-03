import { describe, it, expect } from "vitest";
import { buildThemeCssVars } from "@/lib/theme";
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
  it("maps every theme token to its CSS custom property", () => {
    expect(buildThemeCssVars(sampleTheme)).toEqual({
      "--bg-dark": "#111111",
      "--ivory": "#eeeeee",
      "--sand": "#dddddd",
      "--brass": "#b08d57",
      "--brass-light": "#d9c7a3",
      "--ink": "#222222",
      "--ink-soft": "#333333",
      "--font-display": "Fraunces",
      "--font-body": "Manrope",
    });
  });
});
