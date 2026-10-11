import { test, expect } from "@playwright/test";
test("all fintech demonstrations respond to real input without errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("");
  await expect(page.locator("h1")).toContainText("Ordinary.");
  await page.getByRole("button", { name: "Personal", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Everyday banking", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Everyday banking", exact: true })
    .click();
  await page.locator("#banking").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Income", exact: true }).click();
  await expect(page.locator(".transaction")).toHaveCount(1);
  await expect(page.locator(".transaction")).toContainText("Studio North");
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(page.locator(".transaction")).toHaveCount(4);
  await page.locator("#payments").scrollIntoViewIfNeeded();
  await page.locator("#amount").fill("200");
  await expect(page.locator("output")).toHaveText("218.00");
  await page.locator("#to").selectOption("GBP");
  await expect(page.locator("output")).toHaveText("172.00");
  await page.getByRole("button", { name: "Swap currencies" }).click();
  await expect(page.locator("#from")).toHaveValue("GBP");
  await page.getByRole("button", { name: "Preview exchange" }).click();
  await expect(
    page.getByText("Simulation only. No money has been moved."),
  ).toBeVisible();
  await page.locator("#cards").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Graphite", exact: true }).click();
  await expect(page.locator(".payment-card")).toHaveClass(/graphite/);
  await page.getByRole("button", { name: "Explore virtual card" }).click();
  await expect(page.locator(".payment-card")).toHaveClass(/virtual/);
  await page.locator("#savings").scrollIntoViewIfNeeded();
  await page.locator("#contribution").fill("500");
  await expect(page.locator(".projected strong")).toHaveText("€4,000.00");
  await page
    .getByRole("button", { name: /New studio Space to create/ })
    .click();
  await expect(page.locator(".projected strong")).toHaveText("€6,840.00");
  await page.locator("#security").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Freeze card", exact: true }).click();
  await expect(page.getByText("Card frozen", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Unfreeze card", exact: true })
    .click();
  await expect(
    page.getByText("You’re in control", { exact: true }),
  ).toBeVisible();
  await page.getByRole("switch", { name: "Hide balance" }).click();
  await expect(page.locator(".privacy-preview b")).toHaveText("€24,680.50");
  await page.locator("#invest").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "1Y", exact: true }).click();
  await expect(page.locator(".portfolio-value")).toHaveText("€28,940.00");
  await page.locator("#plans").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /Yearly/ }).click();
  await expect(page.locator(".featured .plan-price")).toContainText("7.2");
  await page
    .getByRole("button", { name: "Explore Premium", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close demo" }).click();
  await expect(page.locator('a[href="#"]')).not.toHaveCount(0);
  const broken = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links
        .map((a) => a.getAttribute("href"))
        .filter((h) => h && h !== "#" && !document.getElementById(h.slice(1))),
    );
  expect(broken).toEqual([]);
  expect(errors).toEqual([]);
});
for (const width of [375, 768, 1024, 1440])
  test(`responsive layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("");
    await page.waitForTimeout(700);
    for (const id of [
      "banking",
      "payments",
      "cards",
      "savings",
      "security",
      "invest",
      "plans",
    ]) {
      await page.locator("#" + id).scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
    }
    if (width === 375) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await expect(
        page.getByRole("link", { name: "Plans", exact: true }),
      ).toBeVisible();
      await page.getByRole("link", { name: "Plans", exact: true }).click();
      await expect(
        page.getByRole("button", { name: "Open navigation" }),
      ).toHaveAttribute("aria-expanded", "false");
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `../outputs/orbit-${width}.png`,
      fullPage: width === 1440,
    });
  });
