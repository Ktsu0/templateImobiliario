import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { activeClientConfig } from "@/config/active-client";
import { buildGoogleFontsUrl } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: activeClientConfig.brand.name,
  description: activeClientConfig.brand.slogan,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={buildGoogleFontsUrl(activeClientConfig.theme)} />
      </head>
      <body>
        <ThemeProvider theme={activeClientConfig.theme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
