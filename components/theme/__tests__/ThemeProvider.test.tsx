import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import type { ClientTheme } from "@/config/types";

const theme: ClientTheme = {
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

describe("ThemeProvider", () => {
  it("injects theme tokens as CSS variables on its wrapper", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <p>conteúdo</p>
      </ThemeProvider>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.getPropertyValue("--bg-dark")).toBe("#111111");
    expect(wrapper.style.getPropertyValue("--font-display")).toBe("Fraunces");
  });
});
