import { describe, it, expect } from "vitest";
import { wrapPhotoIndex } from "@/lib/showcase";

describe("wrapPhotoIndex", () => {
  it("leaves an index inside the set alone", () => {
    expect(wrapPhotoIndex(0, 3)).toBe(0);
    expect(wrapPhotoIndex(2, 3)).toBe(2);
  });

  it("wraps past the end back to the first photo", () => {
    expect(wrapPhotoIndex(3, 3)).toBe(0);
    expect(wrapPhotoIndex(4, 3)).toBe(1);
  });

  it("wraps before the start round to the last photo", () => {
    expect(wrapPhotoIndex(-1, 3)).toBe(2);
    expect(wrapPhotoIndex(-4, 3)).toBe(2);
  });

  it("stays at zero for a listing with no photos", () => {
    expect(wrapPhotoIndex(2, 0)).toBe(0);
  });
});
