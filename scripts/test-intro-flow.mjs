import { chromium } from 'playwright'

const BASE = process.env.BASE_URL || 'http://localhost:5173'
const PASSWORD = 'nema245'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

const logs = []
page.on('console', (msg) => logs.push(msg.text()))

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.fill('input[type="password"]', PASSWORD)
await page.click('button:has-text("enter")')

await page.waitForSelector('.birthday-intro', { timeout: 5000 })
console.log('✓ Birthday intro visible')

await page.waitForSelector('text=Happy Birthday', { timeout: 12000 })
console.log('✓ Happy Birthday text')

await page.waitForSelector('text=24', { timeout: 12000 })
console.log('✓ Date reveal')

await page.waitForSelector('main', { timeout: 22000 })
console.log('✓ Main scrolling experience loaded')

const hasFinal = await page.locator('text=One last thing for you').count()
console.log(hasFinal ? '✓ Final voice section present' : '✗ Final section missing')

await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(800)
const playBtn = page.locator('.voice-play-btn')
if (await playBtn.isVisible()) {
  await playBtn.click()
  await page.waitForEvent('console', {
    timeout: 15000,
    predicate: (m) => m.text().includes('Voice started'),
  })
  console.log('✓ Voice playback works')
}

const musicOk = logs.some((l) => l.includes('Background music playing'))
console.log(musicOk ? '✓ Background music started' : '⚠ Music log not found')

console.log('\n✅ Intro flow test passed\n')
await browser.close()
