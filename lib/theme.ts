import type { ClientTheme } from "@/config/types";

const COLOR_KEY_TO_VAR: Record<
  "bgDark" | "ivory" | "sand" | "brass" | "brassLight" | "ink" | "inkSoft",
  string
> = {
  bgDark: "--bg-dark",
  ivory: "--ivory",
  sand: "--sand",
  brass: "--brass",
  brassLight: "--brass-light",
  ink: "--ink",
  inkSoft: "--ink-soft",
};

function hexToRgbChannels(hex: string): string {
  const clean = hex.replace("#", "");
  const channels = [0, 2, 4].map((offset) => parseInt(clean.slice(offset, offset + 2), 16));
  return channels.join(" ");
}

export function buildThemeCssVars(theme: ClientTheme): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, cssVar] of Object.entries(COLOR_KEY_TO_VAR) as [
    keyof typeof COLOR_KEY_TO_VAR,
    string
  ][]) {
    vars[cssVar] = theme[key];
    vars[`${cssVar}-rgb`] = hexToRgbChannels(theme[key]);
  }
  vars["--font-display"] = theme.fontDisplay;
  vars["--font-body"] = theme.fontBody;
  return vars;
}

export function buildGoogleFontsUrl(theme: ClientTheme): string {
  const display = theme.fontDisplay.trim().replace(/\s+/g, "+");
  const body = theme.fontBody.trim().replace(/\s+/g, "+");
  return `https://fonts.googleapis.com/css2?family=${display}:wght@400;600;700&family=${body}:wght@400;500;600&display=swap`;
}
