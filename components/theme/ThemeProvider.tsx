import type { CSSProperties, ReactNode } from "react";
import type { ClientTheme } from "@/config/types";
import { buildThemeCssVars } from "@/lib/theme";

interface ThemeProviderProps {
  theme: ClientTheme;
  children: ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const cssVars = buildThemeCssVars(theme) as CSSProperties;

  return (
    <div style={cssVars} className="min-h-screen bg-bgDark font-body text-ivory">
      {children}
    </div>
  );
}
