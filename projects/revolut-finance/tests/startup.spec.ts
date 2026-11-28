import { test, expect } from '@playwright/test';

declare const process: { env: Record<string, string | undefined> };
const destination = process.env.PLAYWRIGHT_BASE_URL ?? '';

type StartupFrame = {
  time: number;
  fontSize: string;
  fontFamily: string;
  width: number;
  height: number;
  opacity: number;
  visibility: string;
  lineOffsets: number[];
  imageReady: boolean;
  previewVisible: boolean;
  cinematic: boolean;
};

type StartupRecording = {
  frames: StartupFrame[];
  firstContentfulPaint: number | null;
  stopped: boolean;
};

declare global {
  interface Window {
    __heroStartup: StartupRecording;
  }
}

test.describe('hero first paint', () => {
  test.use({ reducedMotion: 'no-preference' });

  for (const width of [375, 1440]) {
    test(`keeps the first painted hero stable at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text());
      });

      // Routing disables the HTTP cache. Delay the two independent startup
      // dependencies so an already-painted SSR hero is observed before either
      // the photograph or the motion module can finish loading.
      await page.route('**/*', async route => {
        const request = route.request();
        const delay = /\/images\/editorial\/surf(?:-mobile)?-\d+\.webp(?:[?#].*)?$/.test(request.url())
          ? 1600
          : request.resourceType() === 'script' ? 1100 : 0;
        if (delay) await new Promise(resolve => setTimeout(resolve, delay));
        await route.continue();
      });

      await page.addInitScript(() => {
        const recording: StartupRecording = {
          frames: [], firstContentfulPaint: null, stopped: false,
        };
        window.__heroStartup = recording;
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') recording.firstContentfulPaint = entry.startTime;
          }
        }).observe({ type: 'paint', buffered: true });

        const sample = () => {
          if (recording.stopped) return;
          const title = document.getElementById('hero-title');
          const photograph = document.querySelector('.hero-photograph');
          const image = document.querySelector<HTMLImageElement>('.hero-photo');
          if (title && photograph && image) {
            const style = getComputedStyle(title);
            const box = title.getBoundingClientRect();
            if (box.width > 0 && box.height > 0) {
              let opacity = 1;
              for (let ancestor: Element | null = title; ancestor; ancestor = ancestor.parentElement) {
                opacity *= Number(getComputedStyle(ancestor).opacity);
              }
              const preview = getComputedStyle(photograph, '::before');
              recording.frames.push({
                time: performance.now(),
                fontSize: style.fontSize,
                // Compare metrics in the same browser without depending on
                // optional spaces around the serialized font-family commas.
                fontFamily: style.fontFamily.replace(/\s*,\s*/g, ',').replace(/\s+/g, ' '),
                width: box.width,
                height: box.height,
                opacity,
                visibility: style.visibility,
                lineOffsets: Array.from(title.querySelectorAll('.hero-title-line > span')).map(line => {
                  const transform = getComputedStyle(line).transform;
                  return transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42;
                }),
                imageReady: image.complete && image.naturalWidth > 0,
                previewVisible: /data:image\//.test(preview.backgroundImage)
                  && preview.content !== 'none' && preview.display !== 'none'
                  && preview.visibility === 'visible' && Number(preview.opacity) > 0,
                cinematic: document.querySelector('.cinematic-journey')?.hasAttribute('data-cinematic') ?? false,
              });
            }
          }
          requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      });

      // Waiting for load or DOMContentLoaded here would skip the exact period
      // under test: module scripts hold DOMContentLoaded until their download.
      await page.goto(destination, { waitUntil: 'commit' });
      await page.waitForFunction(() => {
        const recording = window.__heroStartup;
        return recording?.firstContentfulPaint != null && recording.frames.some(frame =>
          frame.time >= recording.firstContentfulPaint!
          && !frame.imageReady && !frame.cinematic && frame.previewVisible);
      });
      await testInfo.attach(`hero-${width}-before-image-and-motion`, {
        body: await page.screenshot(), contentType: 'image/png',
      });

      await expect(page.locator('#hero-title')).toHaveText(/Banking\s*&\s*Beyond/);
      await expect(page.locator('.cinematic-journey')).toHaveAttribute('data-cinematic');
      await expect.poll(() => page.locator('.hero-photo').evaluate(image =>
        (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0,
      )).toBe(true);
      await page.waitForLoadState('load');
      // Keep recording through the former entrance duration, so a late
      // opacity reset or title translation cannot hide between endpoints.
      await page.waitForTimeout(1500);
      const recording = await page.evaluate(() => {
        window.__heroStartup.stopped = true;
        return window.__heroStartup;
      });
      const frames = recording.frames.filter(frame => frame.time >= recording.firstContentfulPaint!);
      expect(frames.length, 'sample the painted hero before and after module initialization').toBeGreaterThan(10);
      expect(frames.some(frame => !frame.imageReady && !frame.cinematic && frame.previewVisible),
        'the inline photograph preview is present before the full image and motion module').toBe(true);
      expect(frames.some(frame => frame.imageReady && frame.cinematic),
        'the recording includes the fully loaded interactive hero').toBe(true);
      const final = frames.at(-1)!;
      for (const frame of frames) {
        expect(frame.opacity, `headline effective opacity at ${frame.time.toFixed(0)}ms`).toBeCloseTo(1, 4);
        expect(frame.visibility).toBe('visible');
        expect(frame.fontSize).toBe(final.fontSize);
        expect(frame.fontFamily).toBe(final.fontFamily);
        expect(Math.abs(frame.width - final.width), 'headline width stays stable after first paint').toBeLessThan(0.5);
        expect(Math.abs(frame.height - final.height), 'headline height stays stable after first paint').toBeLessThan(0.5);
        expect(frame.lineOffsets).toHaveLength(2);
        for (const offset of frame.lineOffsets) expect(offset, 'title lines never restart an entrance').toBeCloseTo(0, 3);
        if (!frame.imageReady) expect(frame.previewVisible, 'inline imagery covers the full-image download').toBe(true);
      }
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      expect(errors).toEqual([]);
      await testInfo.attach(`hero-${width}-startup-frames`, {
        body: JSON.stringify(recording), contentType: 'application/json',
      });
    });
  }
});
