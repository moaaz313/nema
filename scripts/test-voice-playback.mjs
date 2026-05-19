import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const logs = []
page.on('console', (msg) => logs.push(`${msg.type()}: ${msg.text()}`))

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.fill('input[type=password]', 'nema245')
await page.click('button:text-is("enter")')
await page.waitForTimeout(1200)
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(800)

const playBtn = page.locator('button[aria-label="Play voice message"]')
await playBtn.scrollIntoViewIfNeeded()
await playBtn.click()
await page.waitForTimeout(3500)

const audioState = await page.evaluate(() => {
  const a = window.__nemaVoiceDebug
  if (!a) return { exists: false }
  return {
    exists: true,
    paused: a.paused,
    currentTime: a.currentTime,
    muted: a.muted,
    volume: a.volume,
    readyState: a.readyState,
    error: a.error ? { code: a.error.code, message: a.error.message } : null,
    duration: a.duration,
  }
})

console.log('LOGS:\n', logs.join('\n'))
console.log('AUDIO_STATE:', JSON.stringify(audioState, null, 2))

await browser.close()
process.exit(audioState.exists && !audioState.paused && audioState.currentTime > 0 ? 0 : 1)
