import { test, expect } from "@playwright/test";

test("artwork and advisory pages offer a prefilled advisor email", async ({
  page,
}) => {
  await page.goto("/artworks/quiet-geometry");
  const link = page.getByRole("link", { name: /Email an advisor/ });
  await expect(link).toHaveAttribute(
    "href",
    /^mailto:maddynade7@gmail\.com\?subject=About%20%22Quiet%20Geometry%22&body=/,
  );
  await expect(link).toHaveAttribute("href", /Quiet%20Geometry/);
  await page.goto("/advisory");
  await expect(
    page.getByRole("link", { name: /Email an advisor/ }),
  ).toHaveAttribute("href", /private%20collector%20services/);
});
