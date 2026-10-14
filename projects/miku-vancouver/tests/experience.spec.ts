import { test as base, expect, type Locator, type Page } from '@playwright/test';

const test = base.extend<{ browserDiagnostics: void }>({
  browserDiagnostics: [async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await use();
    expect(errors, 'Browser console and page errors').toEqual([]);
  }, { auto: true }],
});

const categories = [
  ['Signature Aburi', 'Salmon Oshi Sushi', '$23'],
  ['Sushi & Sashimi', 'Bluefin Trio', '$32'],
  ['Appetizers', 'Tofu Salad', '$21'],
  ['Main Courses', 'Kyoto Saikyo Miso Sablefish', '$48'],
  ['Kaiseki Experience', 'Miku Kaiseki', '$180'],
  ['Desserts', 'Green Tea Opera', '$17.50'],
  ['Beverages', 'Espresso / Americano', '$4.50'],
] as const;

async function hydrated(page: Page, selector: string) {
  const content = page.locator(selector);
  await content.waitFor({ state: 'visible' });
  const island = content.locator('xpath=ancestor::astro-island[1]');
  await expect.poll(() => island.evaluate(element => !element.hasAttribute('ssr')), { message: `${selector} hydrated` }).toBe(true);
  return content;
}

async function readyHero(page: Page) {
  await page.goto('./');
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.locator('.hero-image img').evaluate(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0)).toBe(true);
  await expect.poll(() => page.locator('.hero-content').evaluate(element => Number(getComputedStyle(element).opacity))).toBeGreaterThan(.98);
  // The image and font refreshes must settle before measuring pin geometry.
  await expect(page.getByRole('heading', { level: 1, name: 'The Art of Aburi' })).toBeVisible();
}

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 'No horizontal document overflow').toBeLessThanOrEqual(1);
}

async function selectCategory(page: Page, category: string) {
  const name = new RegExp(`${category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
  const tab = page.getByRole('tab', { name });
  await tab.click();
  await expect(tab).toHaveAttribute('aria-selected', 'true');
}

async function expectDialogFocus(page: Page, dialog: Locator) {
  for (let index = 0; index < 7; index += 1) {
    await page.keyboard.press('Tab');
    const focused = await dialog.evaluate(element => ({ inside: element.contains(document.activeElement), element: document.activeElement?.tagName, label: document.activeElement?.getAttribute('aria-label') }));
    expect(focused.inside, `Tab focus remains in the modal (step ${index + 1}; active ${focused.element}, label ${focused.label})`).toBe(true);
  }
}

test('desktop Hero is edge-to-edge, photographic, and has a working menu CTA', async ({ page }) => {
  await readyHero(page);
  const photograph = await page.locator('.hero-image img').boundingBox();
  const viewport = page.viewportSize()!;
  expect(photograph).not.toBeNull();
  expect(photograph!.x).toBeCloseTo(0, 0);
  expect(photograph!.y).toBeCloseTo(0, 0);
  expect(photograph!.width).toBeCloseTo(viewport.width, 0);
  expect(photograph!.height).toBeCloseTo(viewport.height, 0);
  expect(await page.locator('.hero-image img').evaluate(image => getComputedStyle(image).objectFit)).toBe('cover');
  await expect(page.locator('.hero-bottom')).toContainText('Independent Portfolio Concept.');
  await expect(page.locator('.hero-bottom')).toContainText('Not affiliated with Miku Vancouver.');
  const menuCTA = page.getByRole('link', { name: 'Explore the menu', exact: true });
  await expect(menuCTA).toHaveAttribute('href', '/miku-vancouver/menu/');
  await menuCTA.click();
  await expect(page).toHaveURL(/\/miku-vancouver\/menu\/$/);
  await hydrated(page, '.menu-explorer');
  await noOverflow(page);
});

test('every local navigation destination is prefixed, reachable, and resolves its anchor', async ({ page, request }) => {
  const destinations = new Set<string>();
  for (const route of ['./', 'menu/', 'credits/']) {
    await page.goto(route);
    const current = page.url();
    const hrefs = await page.locator('a[href]').evaluateAll(links => links.map(link => link.getAttribute('href')!));
    for (const href of hrefs) {
      const url = new URL(href, current);
      if (url.origin !== new URL(current).origin) continue;
      expect(url.pathname, href).toMatch(/^\/miku-vancouver\/(?:.*)?$/);
      destinations.add(url.href);
    }
  }
  for (const destination of destinations) {
    const url = new URL(destination);
    const response = await request.get(`${url.origin}${url.pathname}${url.search}`);
    expect(response.status(), destination).toBe(200);
    if (url.hash) {
      const markup = await response.text();
      const id = decodeURIComponent(url.hash.slice(1));
      expect(await page.evaluate(({ markup, id }) => new DOMParser().parseFromString(markup, 'text/html').getElementById(id) !== null, { markup, id }), destination).toBe(true);
    }
  }
});

test('all seven menu categories expose dish descriptions and verified CAD prices', async ({ page }) => {
  await page.goto('menu/');
  await hydrated(page, '.menu-explorer');
  await expect(page.getByRole('tab')).toHaveCount(7);
  for (const [category, dish, price] of categories) {
    await selectCategory(page, category);
    const panel = page.getByRole('tabpanel');
    await expect(panel.getByRole('heading', { level: 2, name: dish, exact: true })).toBeVisible();
    const row = panel.locator('.menu-dish-row').filter({ has: page.getByRole('heading', { level: 3, name: dish, exact: true }) });
    await expect(row).toContainText(price);
    await expect(row).toContainText('CAD');
    expect((await row.locator('p').innerText()).trim().length).toBeGreaterThan(10);
  }
  await expect(page.locator('.menu-source-note')).toContainText('October 14, 2026');
  await noOverflow(page);
});

test('dietary filtering handles verified labels, empty selections, and reset', async ({ page }) => {
  await page.goto('menu/');
  await hydrated(page, '.menu-explorer');
  const dietary = page.getByLabel('Dietary selection');
  await dietary.selectOption('Vegetarian');
  await expect(page.getByRole('heading', { name: 'A different selection.' })).toBeVisible();
  await expect(page.getByRole('tabpanel')).toContainText('No dishes in this category carry the selected official dietary label.');
  await page.getByRole('button', { name: /Show all dishes/ }).click();
  await expect(dietary).toHaveValue('All dishes');
  await expect(page.getByRole('heading', { level: 2, name: 'Salmon Oshi Sushi', exact: true })).toBeVisible();
  await selectCategory(page, 'Appetizers');
  await dietary.selectOption('Vegetarian');
  await expect(page.locator('.menu-dish-row')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 2, name: 'Tofu Salad', exact: true })).toBeVisible();
  await dietary.selectOption('Gluten Free');
  await expect(page.getByRole('heading', { name: 'A different selection.' })).toBeVisible();
  await page.getByRole('button', { name: /Show all dishes/ }).click();
  await selectCategory(page, 'Main Courses');
  await dietary.selectOption('Gluten Free');
  await expect(page.locator('.menu-dish-row')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 2, name: 'Wagyu Steak', exact: true })).toBeVisible();
  await dietary.selectOption('All dishes');
  await expect(page.locator('.menu-dish-row')).toHaveCount(2);
});

test('category tabs support arrow, Home, and End keyboard navigation', async ({ page }) => {
  await page.goto('menu/');
  await hydrated(page, '.menu-explorer');
  const first = page.getByRole('tab').first();
  await first.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: /Sushi & Sashimi$/ })).toBeFocused();
  await expect(page.getByRole('tab', { name: /Sushi & Sashimi$/ })).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: /Beverages$/ })).toBeFocused();
  await page.keyboard.press('Home');
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute('aria-selected', 'true');
});

test('dish overlay navigates in both directions, contains focus, and restores it on Escape', async ({ page }) => {
  await page.goto('menu/');
  await hydrated(page, '.menu-explorer');
  const trigger = page.getByRole('button', { name: 'Open Salmon Oshi Sushi details', exact: true });
  await trigger.click();
  const dialog = page.locator('dialog.dish-modal');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Salmon Oshi Sushi', exact: true })).toBeVisible();
  await expect(dialog).toContainText('ILLUSTRATIVE PHOTOGRAPHY · NOT THE ACTUAL DISH');
  await dialog.getByRole('button', { name: 'Next dish', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: 'Ebi Oshi Sushi', exact: true })).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(dialog.getByRole('heading', { name: 'Salmon Oshi Sushi', exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Previous dish', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: 'Miku Roll', exact: true })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByRole('heading', { name: 'Salmon Oshi Sushi', exact: true })).toBeVisible();
  await expectDialogFocus(page, dialog);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator('body')).not.toHaveClass(/dialog-open/);
});

test('editorial gallery opens a lightbox with buttons, keyboard navigation, and Escape', async ({ page }) => {
  await readyHero(page);
  await page.locator('#gallery').scrollIntoViewIfNeeded();
  await hydrated(page, '.gallery-experience');
  const trigger = page.getByRole('button', { name: 'Open A Pacific perspective in gallery lightbox', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Photography gallery', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'A Pacific perspective', exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Next lightbox photograph', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: 'The intimacy of a table', exact: true })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByRole('heading', { name: 'Behind every gesture', exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Previous lightbox photograph', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: 'The intimacy of a table', exact: true })).toBeVisible();
  await page.keyboard.press('ArrowLeft');
  await expect(dialog.getByRole('heading', { name: 'A Pacific perspective', exact: true })).toBeVisible();
  await expectDialogFocus(page, dialog);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('Hero pin and image mask reverse without document-height changes or horizontal overflow', async ({ page }) => {
  await readyHero(page);
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
  const before = await page.evaluate(() => ({ height: document.documentElement.scrollHeight, viewport: innerHeight, clip: getComputedStyle(document.querySelector('.hero-image')!).clipPath }));
  for (let iteration = 0; iteration < 2; iteration += 1) {
    await page.mouse.wheel(0, before.viewport * 1.35);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before.viewport);
    await expect.poll(() => page.locator('.hero-image').evaluate(element => getComputedStyle(element).clipPath)).not.toBe(before.clip);
    await expect.poll(() => page.locator('.hero-content').evaluate(element => Number(getComputedStyle(element).opacity))).toBeLessThan(.1);
    await expect(page.locator('.aburi-story')).toHaveAttribute('aria-hidden', 'false');
    const pin = await page.locator('.opening-pin').boundingBox();
    expect(Math.abs(pin!.y)).toBeLessThanOrEqual(2);
    expect(pin!.height).toBeCloseTo(before.viewport, 0);
    expect(Math.abs(await page.evaluate(() => document.documentElement.scrollHeight) - before.height)).toBeLessThanOrEqual(2);
    await noOverflow(page);
    await page.mouse.wheel(0, -before.viewport * 5);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect.poll(() => page.locator('.hero-content').evaluate(element => Number(getComputedStyle(element).opacity))).toBeGreaterThan(.98);
    await expect.poll(() => page.locator('.hero-image').evaluate(element => getComputedStyle(element).clipPath)).toBe(before.clip);
    await expect(page.locator('.aburi-story')).toHaveAttribute('aria-hidden', 'true');
    expect(await page.locator('.hero-content').evaluate(element => (element as HTMLElement).inert)).toBe(false);
  }
});

test('reservation preferences are handed to the official provider without booking locally', async ({ page, context }) => {
  const requests: string[] = [];
  await context.route('https://www.opentable.ca/**', async route => {
    requests.push(route.request().url());
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<title>Intercepted booking handoff</title>' });
  });
  await readyHero(page);
  await page.locator('#reservations').scrollIntoViewIfNeeded();
  await hydrated(page, '.booking-form');
  const date = page.getByLabel('Preferred dining date');
  await expect(date).not.toHaveValue('');
  const future = await page.evaluate(() => {
    const value = new Date(); value.setDate(value.getDate() + 7);
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  });
  await date.fill(future);
  await page.getByLabel('Preferred dining time').fill('20:30');
  await page.getByLabel('Party size').selectOption('6');
  await expect(page.locator('.booking-note')).toContainText('Preferences only, not live availability.');
  const [popup] = await Promise.all([context.waitForEvent('page'), page.getByRole('button', { name: /Continue to OpenTable/ }).click()]);
  await expect.poll(() => requests.length).toBeGreaterThan(0);
  const url = new URL(requests[0]);
  expect(url.hostname).toBe('www.opentable.ca');
  expect(url.pathname).toMatch(/miku-restaurant-vancouver-reservations/);
  expect(url.searchParams.get('restref')).toBe('24787');
  expect(url.searchParams.get('datetime')).toBe(`${future}T20:30`);
  expect(url.searchParams.get('covers')).toBe('6');
  await expect(page.locator('.booking-form')).not.toContainText(/(?:booking|reservation) confirmed/i);
  await popup.close();
});

test.describe('mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('full-screen Hero, dialog navigation, menu category selection, and overflow', async ({ page }) => {
    await readyHero(page);
    const photo = await page.locator('.hero-image img').boundingBox();
    expect(photo!.x).toBeCloseTo(0, 0);
    expect(photo!.width).toBeCloseTo(390, 0);
    expect(photo!.height).toBeCloseTo(844, 0);
    await noOverflow(page);
    const toggle = page.getByRole('button', { name: 'Open navigation', exact: true });
    await toggle.click();
    const navigation = page.getByRole('dialog', { name: 'Main navigation', exact: true });
    await expect(navigation).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expectDialogFocus(page, navigation);
    await page.keyboard.press('Escape');
    await expect(navigation).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    await toggle.click();
    await navigation.getByRole('button', { name: 'Close navigation', exact: true }).click();
    await expect(navigation).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    await toggle.click();
    await navigation.getByRole('link', { name: /Menu$/ }).click();
    await expect(page).toHaveURL(/\/miku-vancouver\/menu\/$/);
    await expect(page.getByRole('dialog', { name: 'Main navigation', exact: true })).toBeHidden();
    await hydrated(page, '.menu-explorer');
    const select = page.getByLabel('Explore a category');
    await select.selectOption('Desserts');
    await expect(page.getByRole('heading', { level: 2, name: 'Green Tea Opera', exact: true })).toBeVisible();
    await select.selectOption('Beverages');
    await expect(page.getByRole('heading', { level: 2, name: 'Espresso / Americano', exact: true })).toBeVisible();
    await noOverflow(page);
    await page.getByRole('button', { name: 'Open Espresso / Americano details', exact: true }).click();
    const dish = page.locator('dialog.dish-modal');
    await expect(dish).toBeVisible();
    await noOverflow(page);
    await dish.getByRole('button', { name: 'Close dish details', exact: true }).click();
    await expect(dish).toBeHidden();
  });

  test('Hero uses its mobile mask and reverses to the full-screen composition', async ({ page }) => {
    await readyHero(page);
    await expect(page.locator('.pin-spacer')).toHaveCount(1);
    const initial = await page.evaluate(() => ({ height: document.documentElement.scrollHeight, viewport: innerHeight, clip: getComputedStyle(document.querySelector('.hero-image')!).clipPath }));
    await page.mouse.wheel(0, initial.viewport * .95);
    await expect.poll(() => page.locator('.hero-content').evaluate(element => Number(getComputedStyle(element).opacity))).toBeLessThan(.1);
    await expect.poll(() => page.locator('.hero-image').evaluate(element => getComputedStyle(element).clipPath)).not.toBe(initial.clip);
    await expect(page.locator('.aburi-story')).toHaveAttribute('aria-hidden', 'false');
    await noOverflow(page);
    expect(Math.abs(await page.evaluate(() => document.documentElement.scrollHeight) - initial.height)).toBeLessThanOrEqual(2);
    await page.mouse.wheel(0, -initial.viewport * 3);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect.poll(() => page.locator('.hero-image').evaluate(element => getComputedStyle(element).clipPath)).toBe(initial.clip);
    await expect.poll(() => page.locator('.hero-content').evaluate(element => Number(getComputedStyle(element).opacity))).toBeGreaterThan(.98);
    await expect(page.locator('.aburi-story')).toHaveAttribute('aria-hidden', 'true');
    const image = await page.locator('.hero-image img').boundingBox();
    expect(image!.width).toBeCloseTo(390, 0);
    expect(image!.height).toBeCloseTo(844, 0);
  });

  test('gallery lightbox responds to a touch swipe', async ({ page }) => {
    await readyHero(page);
    await page.locator('#gallery').scrollIntoViewIfNeeded();
    await hydrated(page, '.gallery-experience');
    await page.getByRole('button', { name: 'Open A Pacific perspective in gallery lightbox', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Photography gallery', exact: true });
    await expect(dialog).toBeVisible();
    await dialog.locator('.lightbox-image').evaluate(element => {
      const start = new Touch({ identifier: 1, target: element, clientX: 300, clientY: 300 });
      const end = new Touch({ identifier: 1, target: element, clientX: 100, clientY: 300 });
      element.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [start], changedTouches: [start] }));
      element.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [end] }));
    });
    await expect(dialog.getByRole('heading', { name: 'The intimacy of a table', exact: true })).toBeVisible();
    await dialog.getByRole('button', { name: 'Close gallery', exact: true }).click();
    await expect(dialog).toBeHidden();
    await noOverflow(page);
  });
});

test.describe('tablet composition', () => {
  test.use({ viewport: { width: 800, height: 600 } });

  test('revealed story typography stays clear of the measured photograph mask', async ({ page }, testInfo) => {
    await readyHero(page);
    const travel = await page.locator('.pin-spacer').evaluate(element => (element as HTMLElement).offsetHeight - (element.querySelector('.opening-pin') as HTMLElement).offsetHeight);
    expect(travel, 'The responsive scene has a scroll runway').toBeGreaterThan(0);
    await page.mouse.wheel(0, travel * .97);
    await expect(page.locator('.aburi-story')).toHaveAttribute('aria-hidden', 'false');
    await expect.poll(() => page.locator('.story-copy').evaluate(element => Number(getComputedStyle(element).opacity))).toBeGreaterThan(.98);
    const composition = await page.evaluate(() => {
      const image = document.querySelector('.hero-image')!;
      const box = image.getBoundingClientRect();
      const clip = getComputedStyle(image).clipPath;
      const inset = clip.match(/^inset\(([^)]*)\)/)?.[1].trim().split(/\s+/) ?? [];
      const pixels = (value: string, extent: number) => Number.parseFloat(value) * (value.endsWith('%') ? extent / 100 : 1);
      const top = pixels(inset[0], box.height);
      const left = pixels(inset[3] ?? inset[1] ?? inset[0], box.width);
      const copy = document.querySelector('.story-copy')!.getBoundingClientRect();
      const headline = document.querySelector('.aburi-story h2')!.getBoundingClientRect();
      return { clip, horizontal: left / box.width >= .5, clipTop: box.top + top, clipLeft: box.left + left, copyBottom: copy.bottom, copyRight: copy.right, headlineRight: headline.right };
    });
    expect(composition.clip).toMatch(/^inset\(/);
    if (composition.horizontal) {
      expect(composition.copyRight, `Story copy must end before image starts: ${composition.clip}`).toBeLessThanOrEqual(composition.clipLeft);
      expect(composition.headlineRight, `Story heading must end before image starts: ${composition.clip}`).toBeLessThanOrEqual(composition.clipLeft);
    } else {
      expect(composition.copyBottom, `Story copy must end before image starts: ${composition.clip}`).toBeLessThanOrEqual(composition.clipTop);
    }
    await noOverflow(page);
    await expect(page.locator('.site-header')).toHaveCSS('color', 'rgb(17, 17, 17)');
    const screenshot = await page.screenshot({ path: testInfo.outputPath('tablet-masked-composition.png') });
    await testInfo.attach('Tablet story and mask composition', { body: screenshot, contentType: 'image/png' });
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('story and editorial content remain visible without a pinned Hero', async ({ page }) => {
    await readyHero(page);
    await expect(page.locator('html')).toHaveClass(/motion-lite/);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await expect(page.locator('.aburi-story')).toHaveAttribute('aria-hidden', 'false');
    await expect(page.locator('.aburi-story').getByRole('heading', { name: /FIRE\.\s*PRECISION\.\s*PERFECTION\./ })).toBeVisible();
    const invisible = await page.locator('[data-reveal]').evaluateAll(elements => elements.filter(element => Number(getComputedStyle(element).opacity) < 1 || getComputedStyle(element).visibility !== 'visible').map(element => element.textContent?.trim()));
    expect(invisible, 'Editorial content is readable with reduced motion').toEqual([]);
    expect(await page.locator('.hero-content').evaluate(element => (element as HTMLElement).inert)).toBe(false);
    await noOverflow(page);
    await page.goto('menu/');
    await hydrated(page, '.menu-explorer');
    await selectCategory(page, 'Desserts');
    await expect(page.getByRole('heading', { level: 2, name: 'Green Tea Opera', exact: true })).toBeVisible();
  });
});
