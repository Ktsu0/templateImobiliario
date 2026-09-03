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

export function buildThemeCssVars(theme: ClientTheme): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, cssVar] of Object.entries(COLOR_KEY_TO_VAR) as [
    keyof typeof COLOR_KEY_TO_VAR,
    string
  ][]) {
    vars[cssVar] = theme[key];
  }
  vars["--font-display"] = theme.fontDisplay;
  vars["--font-body"] = theme.fontBody;
  return vars;
}
