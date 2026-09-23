import { describe, it, expect } from "vitest";
import { whatsappLink, artworkMessage } from "../lib/whatsapp";

describe("advisor WhatsApp link", () => {
  it("builds an encoded wa.me link", () => {
    const href = whatsappLink('Hello "Quiet Geometry"', "+91 98200 00000");
    expect(href).toBe(
      "https://wa.me/919820000000?text=Hello%20%22Quiet%20Geometry%22",
    );
  });
  it("returns null without a valid number", () => {
    expect(whatsappLink("Hi", "")).toBeNull();
    expect(whatsappLink("Hi", "123")).toBeNull();
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
