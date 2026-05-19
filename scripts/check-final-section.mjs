import { chromium } from 'playwright'

const BASE = process.env.BASE_URL || 'http://localhost:5174'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
await page.goto(BASE, { waitUntil: 'networkidle' })
await page.fill('input[type="password"]', 'nema245')
await page.click('button:has-text("enter")')
await page.waitForTimeout(2000)
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(2000)

const info = await page.evaluate(() => {
  const final = [...document.querySelectorAll('section')].find((s) =>
    s.textContent?.includes('One last thing'),
  )
  const btn = document.querySelector('button[aria-label="Play voice message"]')
  const title = final?.querySelector('h2')
  return {
    hasFinal: !!final,
    hasButton: !!btn,
    buttonVisible: btn ? parseFloat(getComputedStyle(btn).opacity) >= 0.99 : false,
    titleOpacity: title ? getComputedStyle(title).opacity : null,
    btnOpacity: btn ? getComputedStyle(btn).opacity : null,
    titleDisplay: title ? getComputedStyle(title).display : null,
    finalHeight: final?.offsetHeight,
    finalTop: final?.getBoundingClientRect().top,
    scrollY: window.scrollY,
    innerHeight: window.innerHeight,
  }
})
console.log(info)
await browser.close()
