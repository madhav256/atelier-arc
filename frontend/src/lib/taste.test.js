import { describe, it, expect } from "vitest";
import { toPayload, scoreForTaste, scaleOf } from "./taste";

describe("taste quiz", () => {
  it("maps answers to the API payload", () => {
    expect(
      toPayload({
        styles: ["arch"],
        palettes: ["cool"],
        scale: ["intimate"],
        budget: ["b3"],
      }),
    ).toEqual({
      action: "complete",
      styles: ["arch"],
      palettes: ["cool"],
      scale: "intimate",
      priceMin: 100000,
      priceMax: 500000,
    });
    expect(toPayload({ styles: ["horizon"], budget: ["open"] })).toEqual({
      action: "complete",
      styles: ["horizon"],
      palettes: [],
    });
  });
  it("ranks matching works above others", () => {
    const p = {
      styles: ["arch"],
      palettes: ["cool"],
      scale: "intimate",
      priceMax: 500000,
    };
    const match = {
      style: ["arch"],
      tags: ["cool"],
      price: 200000,
      dimensions: { width: 50 },
    };
    const miss = {
      style: ["strata"],
      tags: ["warm"],
      price: 900000,
      dimensions: { width: 120 },
    };
    expect(scoreForTaste(match, p)).toBeGreaterThan(scoreForTaste(miss, p));
    expect(scaleOf({ dimensions: { width: 40, unit: "in" } })).toBe(
      "statement",
    );
  });
});
