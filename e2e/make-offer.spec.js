import { test, expect } from "@playwright/test";
import { login, expectAccessible } from "./helpers";

test("collector offers, gallery counters, collector accepts and gets a private offer at the agreed price", async ({
  browser,
}) => {
  const collector = await (await browser.newContext()).newPage();
  const admin = await (await browser.newContext()).newPage();

  await login(collector, "collector@atelierarc.example");
  await collector.goto("/artworks/night-orchard");
  await collector.getByRole("button", { name: "Make an offer" }).click();
  const dialog = collector.getByRole("dialog", { name: "Night Orchard" });
  await expect(dialog).toBeVisible();
  await expectAccessible(collector, "offer dialog");
  const input = dialog.getByLabel(/Your offer/);
  await input.fill("1000");
  await expect(dialog.getByText(/Offers start from/)).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Submit offer" }),
  ).toBeDisabled();
  await input.fill("150000");
  await dialog.getByRole("button", { name: "Submit offer" }).click();
  await expect(collector).toHaveURL(/\/account\/inquiries\//);
  await expect(collector.getByText("Awaiting a response")).toBeVisible();
  const inquiryUrl = collector.url();
  const id = inquiryUrl.split("/").pop();

  await login(admin, "admin@atelierarc.example");
  await admin.goto(`/admin/inquiries/${id}`);
  await expect(
    admin.getByRole("heading", { name: "Collector offer" }),
  ).toBeVisible();
  await admin.getByLabel("Counter at").fill("170000");
  await admin.getByRole("button", { name: "Send counter-offer" }).click();
  await expect(admin.getByText(/countered at/)).toBeVisible();

  await collector.reload();
  await expect(collector.getByText(/The gallery proposes/)).toBeVisible();
  await collector.getByRole("button", { name: /Accept ₹1,70,000/ }).click();
  await expect(
    collector.getByRole("heading", { name: "Private offer" }),
  ).toBeVisible();
  await expect(
    collector.getByRole("button", { name: "Accept and pay" }),
  ).toBeVisible();
  await expectAccessible(collector, "offer timeline");
});
