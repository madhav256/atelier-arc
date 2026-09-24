import { describe, it, expect } from "vitest";
import { advisorMailto, artworkMessage } from "./advisor";

describe("advisor email link", () => {
  it("builds an encoded mailto link", () => {
    const href = advisorMailto('Hello "Quiet Geometry"', {
      email: "advisor@example.com",
    });
    expect(href).toBe(
      "mailto:advisor@example.com?subject=Advisor%20inquiry%20-%20Atelier%20Arc&body=Hello%20%22Quiet%20Geometry%22",
    );
  });
  it("returns null without an address", () => {
    expect(advisorMailto("Hi", { email: "" })).toBeNull();
  });
  it("names the work and links back to it", () => {
    const m = artworkMessage(
      { title: "Loom", slug: "loom", artist: { name: "Neel Kapoor" } },
      "https://atelier.example",
    );
    expect(m).toContain('"Loom" by Neel Kapoor');
    expect(m).toContain("https://atelier.example/artworks/loom");
  });
});
