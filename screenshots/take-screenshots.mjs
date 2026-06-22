/**
 * Automated screenshot script using Playwright.
 *
 * Setup:
 *   cd screenshots && npm install
 *   npx playwright install chromium
 *
 * Usage:
 *   TEST_EMAIL=you@example.com TEST_PASSWORD=yourpass APP_URL=https://happy-bi-weekly-budget.vercel.app node take-screenshots.mjs
 *
 * Screenshots saved to:
 *   screenshots/desktop/  — 1440×900
 *   screenshots/mobile/   — 390×844  (iPhone 14 Pro)
 */

import { chromium, devices } from 'playwright';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const EMAIL    = process.env.TEST_EMAIL    ?? '';
const PASSWORD = process.env.TEST_PASSWORD ?? '';
const APP_URL  = (process.env.APP_URL ?? 'https://happy-bi-weekly-budget.vercel.app').replace(/\/$/, '');

if (!EMAIL || !PASSWORD) {
  console.error('Set TEST_EMAIL and TEST_PASSWORD env vars before running.');
  process.exit(1);
}

const DESKTOP = { width: 1440, height: 900 };
const MOBILE  = devices['iPhone 14 Pro'];

const DESKTOP_DIR = join(__dirname, 'desktop');
const MOBILE_DIR  = join(__dirname, 'mobile');

async function ensureDirs() {
  await mkdir(DESKTOP_DIR, { recursive: true });
  await mkdir(MOBILE_DIR,  { recursive: true });
}

async function login(page) {
  await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]',    EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${APP_URL}/dashboard`, { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function shot(page, name, dir) {
  const pad = name.replace(/\//g, '-').replace(/^-/, '');
  await page.screenshot({ path: join(dir, `${pad}.png`), fullPage: true });
  console.log(`  ✓ ${pad}.png`);
}

async function waitForData(page) {
  // Wait for loading spinners to disappear and data to appear
  try {
    await page.waitForFunction(() => !document.querySelector('[data-loading="true"]'), { timeout: 10000 });
  } catch {}
  await page.waitForTimeout(800);
}

async function captureAll(browser, viewport, dir, label) {
  console.log(`\n── ${label} ─────────────────────────────────────`);

  const context = await browser.newContext({ viewport, ...( label === 'Mobile' ? { userAgent: MOBILE.userAgent } : {} ) });
  const page    = await context.newPage();

  // ── Public pages ──────────────────────────────────────────────────────────
  await page.goto(`${APP_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await shot(page, '01-landing', dir);

  await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle' });
  await shot(page, '02-login', dir);

  await page.goto(`${APP_URL}/signup`, { waitUntil: 'networkidle' });
  await shot(page, '03-signup', dir);

  await page.goto(`${APP_URL}/contact`, { waitUntil: 'networkidle' });
  await shot(page, '04-contact', dir);

  // ── Login ─────────────────────────────────────────────────────────────────
  console.log('  → Logging in...');
  await login(page);
  await shot(page, '05-dashboard', dir);

  // ── App pages ─────────────────────────────────────────────────────────────
  const appPages = [
    { path: '/periods',      name: '06-periods'      },
    { path: '/bills',        name: '07-bills'        },
    { path: '/expenses',     name: '08-expenses'     },
    { path: '/budget',       name: '09-budget'       },
    { path: '/monthly',      name: '10-monthly'      },
    { path: '/savings',      name: '11-savings'      },
    { path: '/sinking-funds',name: '12-sinking-funds'},
    { path: '/debts',        name: '13-debts'        },
    { path: '/settings',     name: '14-settings'     },
    { path: '/feedback',     name: '15-feedback'     },
  ];

  for (const p of appPages) {
    await page.goto(`${APP_URL}${p.path}`, { waitUntil: 'networkidle' });
    await waitForData(page);
    await shot(page, p.name, dir);
  }

  // ── Period detail (grab first period ID from the list) ───────────────────
  await page.goto(`${APP_URL}/periods`, { waitUntil: 'networkidle' });
  await waitForData(page);
  const periodLink = await page.locator('a[href^="/periods/"]').first().getAttribute('href');
  if (periodLink) {
    await page.goto(`${APP_URL}${periodLink}`, { waitUntil: 'networkidle' });
    await waitForData(page);
    await shot(page, '16-period-detail', dir);
  }

  await context.close();
}

async function main() {
  await ensureDirs();
  console.log(`App URL : ${APP_URL}`);
  console.log(`Account : ${EMAIL}`);

  const browser = await chromium.launch({ headless: true });

  await captureAll(browser, DESKTOP, DESKTOP_DIR, 'Desktop (1440×900)');
  await captureAll(browser, { width: MOBILE.viewport.width, height: MOBILE.viewport.height }, MOBILE_DIR, 'Mobile (390×844)');

  await browser.close();
  console.log('\n🎉 All screenshots saved!');
  console.log(`   Desktop: ${DESKTOP_DIR}`);
  console.log(`   Mobile : ${MOBILE_DIR}`);
}

main().catch(err => { console.error(err); process.exit(1); });
