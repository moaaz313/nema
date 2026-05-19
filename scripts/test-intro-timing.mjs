/**
 * Measures cake intro duration after password unlock.
 * Run: node scripts/test-intro-timing.mjs
 */
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL || 'http://localhost:5173'
const PASSWORD = 'nema245'
const MAX_INTRO_MS = 16000

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

await page.goto(BASE, { waitUntil: 'networkidle' })
const t0 = Date.now()
await page.fill('input[type="password"]', PASSWORD)
await page.click('button:has-text("enter")')
await page.waitForSelector('main', { timeout: MAX_INTRO_MS })
const elapsed = Date.now() - t0

console.log(`Intro → main: ${(elapsed / 1000).toFixed(1)}s`)

if (elapsed > MAX_INTRO_MS) {
  throw new Error(`Intro exceeded ${MAX_INTRO_MS / 1000}s cap`)
}

console.log(`✅ Intro within ${MAX_INTRO_MS / 1000}s cap\n`)
await browser.close()
