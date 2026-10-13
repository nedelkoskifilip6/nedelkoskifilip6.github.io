import { test, expect, type Page } from '@playwright/test';

// Set PLAYWRIGHT_BASE_URL to exercise the deployed static build instead of the
// local preview configured in playwright.config.ts. All scrolling uses wheel
// input so ScrollTrigger is tested through the same path as a visitor.
declare const process: { env: Record<string, string | undefined> };
const destination = process.env.PLAYWRIGHT_BASE_URL ?? '';
const visualState = async (page: Page) => page.locator('.hero-photo').evaluate(image => {
  const photograph = image.closest('.hero-photograph')!;
  const headline = document.getElementById('hero-title')!;
  return [getComputedStyle(image).transform, getComputedStyle(photograph).clipPath,
    getComputedStyle(headline).transform, getComputedStyle(headline).opacity];
});

async function settleScene(page: Page) {
  await page.waitForFunction(async () => {
    let last = '', stableFrames = 0;
    while (stableFrames < 12) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      const elements = document.querySelectorAll('.hero-photo, .hero-photograph, #hero-title, .hero-title-line > span, .hero-text, .hero-description');
      const signature = Array.from(elements).map(element => {
        const style = getComputedStyle(element);
        return `${style.transform}|${style.opacity}|${style.clipPath}`;
      }).join(';');
      stableFrames = signature === last ? stableFrames + 1 : 0;
      last = signature;
    }
    return true;
  }, undefined, { timeout: 10_000 });
}

async function assertNoOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(page.viewportSize()!.width);
}

async function assertVisibleLinkIsUsable(page: Page) {
  const download = page.locator('.hero a');
  const visuallyAvailable = await download.evaluate(link => {
    const hero = link.closest<HTMLElement>('.hero');
    const style = getComputedStyle(link);
    const description = link.closest('.hero-description');
    return !hero?.inert && style.visibility !== 'hidden' && style.display !== 'none'
      && (!description || getComputedStyle(description).visibility !== 'hidden');
  });
  if (!visuallyAvailable) return;
  const box = await download.boundingBox();
  if (!box || box.y < 0 || box.y + box.height > page.viewportSize()!.height) return;
  const reachable = await download.evaluate(link => {
    const rect = link.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    return hit === link || !!hit && link.contains(hit);
  });
  expect(reachable, 'a visible hero CTA must not be covered by a transition layer').toBe(true);
}

test.describe('cinematic hero transition', () => {
  test.use({ reducedMotion: 'no-preference' });

  for (const width of [375, 768, 1440]) {
    test(`scrolls forward and reverses cleanly at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      await page.goto(destination);
      await expect(page.locator('.hero a')).toHaveCount(1);
      await expect(page.locator('.hero a')).toHaveText('Download the app');
      await expect(page.locator('.hero a')).toHaveAttribute('href', 'https://revolut.com/app');
      await expect.poll(() => page.locator('.hero-photo').evaluate(image =>
        (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0,
      )).toBe(true);
      await settleScene(page);
      const photograph = await page.locator('.hero-photograph').boundingBox();
      expect(photograph).not.toBeNull();
      expect(photograph!.x, 'hero photograph must begin edge-to-edge').toBeCloseTo(0, 0);
      expect(photograph!.y, 'hero photograph starts at the top of the screen').toBeCloseTo(0, 0);
      expect(photograph!.width).toBeCloseTo(width, 0);
      expect(photograph!.height).toBeCloseTo(900, 0);
      const initial = await visualState(page);
      await assertVisibleLinkIsUsable(page);
      const positions: number[] = [];
      for (let step = 0; step < 5; step++) {
        await page.mouse.wheel(0, 180);
        await settleScene(page);
        positions.push(await page.evaluate(() => window.scrollY));
        await assertNoOverflow(page);
        await assertVisibleLinkIsUsable(page);
      }
      expect(positions.at(-1)).toBeGreaterThan(400);
      expect(await visualState(page), 'the hero scene responds to scroll input').not.toEqual(initial);
      await page.mouse.wheel(0, 4_000);
      await settleScene(page);
      await assertNoOverflow(page);
      // Returning through the scene must restore its initial state rather than
      // leaving text hidden, a stale pin, or an accumulated transform.
      await page.mouse.wheel(0, -10_000);
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
      await settleScene(page);
      expect(await visualState(page)).toEqual(initial);
      await expect(page.locator('#hero-title')).toBeVisible();
      await assertVisibleLinkIsUsable(page);
      await assertNoOverflow(page);
      expect(errors).toEqual([]);
    });
  }

  test('passes focus into banking when the curtain covers the hero CTA', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(destination);
    await settleScene(page);
    await page.locator('.hero a').focus();
    await expect(page.locator('.hero a')).toBeFocused();
    await page.mouse.wheel(0, 1_800);
    await settleScene(page);
    await expect.poll(() => page.locator('.hero').evaluate(element => (element as HTMLElement).inert)).toBe(true);
    await expect(page.locator('#banking')).toBeFocused();
    const afterCurtain = await page.evaluate(() => window.scrollY);
    expect(afterCurtain, 'focus handoff must not change the visitor scroll position').toBeCloseTo(1_800, 0);
    await page.mouse.wheel(0, -10_000);
    await settleScene(page);
    await expect(page.locator('.hero')).not.toHaveAttribute('inert');
    await expect(page.locator('#banking')).toBeFocused();
    await assertVisibleLinkIsUsable(page);
  });

  test('rebuilds correctly when viewport crosses the mobile breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(destination);
    await settleScene(page);
    await page.mouse.wheel(0, 400);
    await settleScene(page);
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await settleScene(page);
      await assertNoOverflow(page);
      expect(await page.locator('.hero a').count()).toBe(1);
    }
    await page.mouse.wheel(0, -10_000);
    await settleScene(page);
    await expect(page.locator('#hero-title')).toBeVisible();
    await assertVisibleLinkIsUsable(page);
  });

  test('restores static content when reduced motion changes during the scene', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    // Model a slow interactive bundle while the independent hero motion loads.
    // This guarantees the preference changes before idle islands commit.
    let releaseHydration!: () => void;
    const hydrationGate = new Promise<void>(resolve => { releaseHydration = resolve; });
    await page.route('**/*Experience*', async route => {
      await hydrationGate;
      await route.continue();
    });
    await page.goto(destination, { waitUntil: 'domcontentloaded' });
    await settleScene(page);
    await expect(page.locator('.cinematic-journey')).toHaveAttribute('data-cinematic');
    await expect(page.locator('.dashboard')).not.toHaveAttribute('data-motion-ready');
    await page.mouse.wheel(0, 1_800);
    await settleScene(page);
    await expect.poll(() => page.locator('.hero').evaluate(element => (element as HTMLElement).inert)).toBe(true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.cinematic-journey')).not.toHaveAttribute('data-cinematic');
    await expect(page.locator('.hero')).not.toHaveAttribute('inert');
    expect(await page.locator('#hero-title').evaluate(element => getComputedStyle(element).opacity)).toBe('1');
    expect(await page.locator('.hero-description').evaluate(element => getComputedStyle(element).visibility)).toBe('visible');
    // Idle hydration can complete after the preference changes. Its late
    // readiness event must not revive a reverted GSAP context or hidden layer.
    releaseHydration();
    await expect(page.locator('.dashboard')).toHaveAttribute('data-motion-ready', 'true');
    expect(await page.locator('.dashboard').evaluate(panel => Array.from(panel.children)
      .every(child => getComputedStyle(child).opacity === '1'))).toBe(true);
    await page.mouse.wheel(0, -10_000);
    await settleScene(page);
    await assertVisibleLinkIsUsable(page);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.locator('.cinematic-journey')).toHaveAttribute('data-cinematic');
    await settleScene(page);
    await expect(page.locator('#hero-title')).toBeVisible();
    await assertVisibleLinkIsUsable(page);
    await assertNoOverflow(page);
  });

  for (const [width, height] of [[844, 390], [1440, 600], [375, 600]]) {
    test(`keeps the short-screen hero usable at ${width}×${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(destination);
      await expect(page.locator('.cinematic-journey')).not.toHaveAttribute('data-cinematic');
      const photograph = await page.locator('.hero-photograph').boundingBox();
      expect(photograph).not.toBeNull();
      expect(photograph!.x).toBeCloseTo(0, 0);
      expect(photograph!.y).toBeCloseTo(0, 0);
      expect(photograph!.width).toBeCloseTo(width, 0);
      expect(photograph!.height).toBeCloseTo(height, 0);
      const button = await page.locator('.hero a').boundingBox();
      expect(button).not.toBeNull();
      expect(button!.y).toBeGreaterThanOrEqual(0);
      expect(button!.y + button!.height).toBeLessThanOrEqual(height);
      const headline = await page.locator('#hero-title').boundingBox();
      const description = await page.locator('.hero-description').boundingBox();
      expect(headline!.y + headline!.height, 'headline and CTA copy must not overlap').toBeLessThanOrEqual(description!.y + 1);
      await assertVisibleLinkIsUsable(page);
      await assertNoOverflow(page);
    });
  }
});

test.describe('reduced-motion cinematic fallback', () => {
  test.use({ reducedMotion: 'reduce' });

  test('keeps the hero static and banking usable with reduced motion', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto(destination);
    await expect(page.locator('.hero a')).toHaveCount(1);
    await expect(page.locator('#hero-title')).toBeVisible();
    const initial = await visualState(page);
    await expect(page.locator('.cinematic-journey')).not.toHaveAttribute('data-cinematic');
    const photograph = await page.locator('.hero-photograph').boundingBox();
    expect(photograph!.x).toBeCloseTo(0, 0);
    expect(photograph!.width).toBeCloseTo(375, 0);
    expect(photograph!.height).toBeCloseTo(900, 0);
    await page.mouse.wheel(0, 450);
    await settleScene(page);
    expect(await visualState(page)).toEqual(initial);
    expect(await page.locator('#hero-title').evaluate(element => getComputedStyle(element).opacity)).toBe('1');
    await page.locator('#banking').scrollIntoViewIfNeeded();
    await expect(page.locator('#banking h2')).toBeVisible();
    // SSR buttons look ready before client:idle installs React handlers.
    await expect(page.locator('.dashboard')).toHaveAttribute('data-motion-ready', 'true');
    await page.getByRole('button', { name: 'Income', exact: true }).click();
    await expect(page.locator('.transaction')).toHaveCount(1);
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expect(page.locator('.transaction')).toHaveCount(4);
    await assertNoOverflow(page);
  });
});
