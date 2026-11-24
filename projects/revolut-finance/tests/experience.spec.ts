import { test, expect } from "@playwright/test";
test("retained fintech demonstrations respond to real input without errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("");
  await expect(page.locator("h1")).toContainText("Banking & Beyond");
  await expect(page.locator('.hero a')).toHaveCount(2);
  await expect(page.locator('.app-store-link img')).toHaveAttribute('alt', 'Download on the App Store');
  await expect(page.locator('.app-store-link')).toHaveAccessibleName('Download Revolut on the App Store (opens in a new tab)');
  await expect(page.locator('.app-store-link')).toHaveAttribute('href', 'https://apps.apple.com/app/id932493382');
  await expect(page.locator('.play-store-link img')).toHaveAttribute('alt', 'Get it on Google Play');
  await expect(page.locator('.play-store-link')).toHaveAccessibleName('Download Revolut on Google Play (opens in a new tab)');
  await expect(page.locator('.play-store-link')).toHaveAttribute('href', 'https://play.google.com/store/apps/details?id=com.revolut.revolut');
  for (const selector of ['.app-store-link', '.play-store-link']) {
    await expect(page.locator(selector)).toHaveAttribute('target', '_blank');
    await expect(page.locator(selector)).toHaveAttribute('rel', /noopener/);
  }
  await expect(page.locator('.hero-acquisition').getByText('Official Revolut app · external link', { exact: true })).toHaveCount(2);
  await expect(
    page.locator(".nav-links").getByRole("link", { name: "Savings", exact: true }),
  ).toBeVisible();
  await page
    .locator(".nav-links").getByRole("link", { name: "Savings", exact: true })
    .click();
  await page.locator("#savings").scrollIntoViewIfNeeded();
  await expect(page.locator("#savings astro-island")).not.toHaveAttribute("ssr");
  await page.locator("#savings-goal").selectOption("0");
  await page.locator("#contribution").press("Home");
  for (let step = 0; step < 19; step++)
    await page.locator("#contribution").press("ArrowRight");
  await expect(page.locator(".projected strong")).toHaveText("€4,000.00");
  await page.locator("#savings-goal").selectOption("1");
  await expect(page.locator(".projected strong")).toHaveText("€6,840.00");
  await page.locator("#savings-goal").selectOption("2");
  await expect(page.locator(".projected strong")).toHaveText("€4,800.00");
  await page.locator("#months").selectOption("12");
  await expect(page.locator(".projected strong")).toHaveText("€6,000.00");
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
  await expect(page.getByRole("button", { name: "Demo account", exact: true, includeHidden: true })).toHaveCount(0);
  await expect(page.locator('a[href="#"]')).not.toHaveCount(0);
  const broken = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links
        .map((a) => a.getAttribute("href"))
        .filter((h) => h && h !== "#" && !document.getElementById(h.slice(1))),
    );
  expect(broken).toEqual([]);
  const brokenImages = await page.locator('img').evaluateAll(images => images.filter(img => !(img as HTMLImageElement).complete || (img as HTMLImageElement).naturalWidth === 0).map(img => (img as HTMLImageElement).src));
  expect(brokenImages).toEqual([]);
  expect(errors).toEqual([]);
});
for (const width of [375, 768, 1024, 1440])
  test(`responsive layout at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("");
    await page.waitForTimeout(700);
    const appBadge = await page.locator('.app-store-link img').boundingBox();
    const playBadge = await page.locator('.play-store-link img').boundingBox();
    expect(appBadge).not.toBeNull();
    expect(playBadge).not.toBeNull();
    expect(playBadge!.height, 'store badges must share the same visible height').toBeCloseTo(appBadge!.height, 1);
    expect(playBadge!.y, 'store badges must align at the top').toBeCloseTo(appBadge!.y, 1);
    for (const id of [
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
        page.locator(".nav-links").getByRole("link", { name: "Plans", exact: true }),
      ).toBeVisible();
      await page.locator(".nav-links").getByRole("link", { name: "Plans", exact: true }).click();
      await expect(
        page.getByRole("button", { name: "Open navigation" }),
      ).toHaveAttribute("aria-expanded", "false");
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `../outputs/editorial-${width}.png`,
      fullPage: width === 1440,
    });
  });
