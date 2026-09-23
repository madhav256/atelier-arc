import { test, expect } from "@playwright/test";

test("artwork and advisory pages offer a prefilled WhatsApp advisor chat", async ({
  page,
}) => {
  await page.goto("/artworks/quiet-geometry");
  const link = page.getByRole("link", {
    name: /Message an advisor on WhatsApp/,
  });
  await expect(link).toHaveAttribute(
    "href",
    /^https:\/\/wa\.me\/16699377112\?text=.*Quiet%20Geometry/,
  );
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", /noopener/);
  await page.goto("/advisory");
  await expect(
    page.getByRole("link", { name: /Message an advisor on WhatsApp/ }),
  ).toHaveAttribute("href", /private%20collector%20services/);
});
