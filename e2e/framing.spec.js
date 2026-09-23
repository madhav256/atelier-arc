import { test, expect } from "@playwright/test";

test("room view previews frame styles at true scale", async ({ page }) => {
  await page.goto("/artworks/blue-interval");
  await page.getByRole("button", { name: /View in your space/ }).click();
  const room = page.getByRole("region", { name: "Room simulation" });
  const figure = room.locator("figure.framed");
  await expect(figure).toHaveClass(/frame-none/);
  await room.getByRole("radio", { name: "Gilt" }).check();
  await expect(figure).toHaveClass(/frame-gilt/);
  await expect(room.getByText(/cm framed/)).toBeVisible();
  await room.getByRole("checkbox", { name: /White mount/ }).check();
  await expect(figure).toHaveClass(/has-mat/);
  await expect(
    room.getByRole("link", { name: /Ask about this frame/ }),
  ).toHaveAttribute("href", /gilt%20with%20a%20white%20mount/);
});

test("sculptural works are shown without frame options", async ({ page }) => {
  await page.goto("/artworks/quiet-geometry");
  await page.getByRole("button", { name: /View in your space/ }).click();
  await expect(
    page.getByRole("region", { name: "Room simulation" }).getByRole("radio"),
  ).toHaveCount(0);
});
