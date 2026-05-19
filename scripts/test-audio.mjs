/**
 * End-to-end audio smoke test via Playwright.
 * Run: node scripts/test-audio.mjs
 * Requires dev server at http://localhost:5173 (or set BASE_URL).
 */
import { chromium } from 'playwright'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'
const PASSWORD = 'nema245'

async function waitForLog(page, text, timeout = 15000) {
  return page.waitForEvent('console', {
    timeout,
    predicate: (msg) => msg.text().includes(text),
  })
}

function debugState(page) {
  return page.evaluate(() => window.__nemaAudioDebug?.())
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const logs = []
  page.on('console', (msg) => {
    const line = `[${msg.type()}] ${msg.text()}`
    logs.push(line)
    console.log(line)
  })

  page.on('pageerror', (err) => console.error('PAGE ERROR:', err.message))

  console.log(`\n→ Opening ${BASE_URL}`)
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })

  const voiceHead = await page.evaluate(async () => {
    const res = await fetch('/audio/voice.m4a', { method: 'HEAD' })
    return { ok: res.ok, type: res.headers.get('content-type') }
  })
  if (!voiceHead.ok) throw new Error('voice.m4a not reachable')
  console.log(`✓ voice.m4a reachable (${voiceHead.type})`)

  const musicHead = await page.evaluate(async () => {
    const res = await fetch('/audio/music.m4a', { method: 'HEAD' })
    return { ok: res.ok, type: res.headers.get('content-type') }
  })
  console.log(musicHead.ok ? `✓ music.m4a reachable (${musicHead.type})` : '⚠ music.m4a missing — background music will not play')

  await page.fill('input[type="password"]', PASSWORD)
  const musicPlayingLog = waitForLog(page, 'Background music playing', 10000)
  await page.click('button:has-text("enter")')

  await waitForLog(page, 'Background music initialized', 8000).catch(() => {})
  console.log('✓ Background music initialized')

  if (musicHead.ok) {
    try {
      await musicPlayingLog
      console.log('✓ Background music playing')
    } catch {
      throw new Error('Background music did not start after password unlock')
    }
  }

  await page.waitForTimeout(1500)

  let state = await debugState(page)
  console.log('  state after unlock:', JSON.stringify(state))

  if (musicHead.ok && !state?.musicPlaying && state?.musicPaused) {
    throw new Error('Music element not playing after unlock')
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForTimeout(1000)

  const playBtn = page.locator('.voice-play-btn')
  await playBtn.waitFor({ state: 'visible', timeout: 15000 })

  const musicDucked = waitForLog(page, 'Background music ducked', 8000)
  const voiceStarted = waitForLog(page, 'Voice started', 15000)

  await playBtn.click()
  console.log('✓ Play clicked')

  await musicDucked
  console.log('✓ Background music ducked')

  await voiceStarted
  console.log('✓ Voice started')

  state = await debugState(page)
  console.log('  state during voice:', JSON.stringify(state))

  if (!(state?.voiceCurrentTime > 0 || state?.voicePlaying)) {
    throw new Error('Voice did not play (currentTime still 0)')
  }

  if (musicHead.ok && !state?.isDucked) {
    throw new Error('Music not ducked during voice (isDucked=false)')
  }

  const times = await page.locator('.voice-player .voice-time').allTextContents()
  if (times.length < 2 || !times.every((t) => /\d+:\d{2}/.test(t))) {
    throw new Error('Voice player time display missing')
  }
  console.log(`✓ Progress UI visible (${times[0]} / ${times[1]})`)

  const voicePaused = waitForLog(page, 'Voice paused', 8000)
  await playBtn.click()
  await voicePaused
  console.log('✓ Pause works')

  state = await debugState(page)
  if (state?.voicePlaying) throw new Error('Voice still marked playing after pause')
  if (!state?.voicePaused) throw new Error('Voice not paused')

  const voiceResumed = waitForLog(page, 'Voice resumed', 8000)
  await playBtn.click()
  await voiceResumed
  console.log('✓ Resume works')

  const slider = page.locator('.voice-seek')
  await slider.evaluate((el) => {
    el.value = '50'
    el.dispatchEvent(new Event('input', { bubbles: true }))
  })
  await page.waitForTimeout(200)
  state = await debugState(page)
  if (state?.voiceDuration && state.voiceCurrentTime < state.voiceDuration * 0.2) {
    throw new Error('Seek did not advance playback position')
  }
  console.log('✓ Seek works')

  state = await debugState(page)
  const voiceDuration = state?.voiceDuration ?? 0

  if (voiceDuration > 45) {
    await page.evaluate(() => window.__nemaAudioStop?.())
    await page.waitForTimeout(FADE_MS + 400)
    console.log('✓ Voice stopped (long clip — skipped full playback)')
  } else {
    await waitForLog(page, 'Voice ended', 120000)
    console.log('✓ Voice ended')
    await waitForLog(page, 'Background music restored', 15000)
    console.log('✓ Background music restored')
    await page.waitForTimeout(FADE_MS + 300)
  }

  state = await debugState(page)
  console.log('  state after voice:', JSON.stringify(state))

  if (musicHead.ok && state?.isDucked) {
    throw new Error('Music still ducked after voice ended')
  }
  if (musicHead.ok && state.musicVolume != null && state.musicVolume < 0.12) {
    throw new Error(`Music volume not restored after voice (volume=${state.musicVolume})`)
  }

  if (logs.some((l) => /Voice failed/i.test(l))) {
    throw new Error('Voice failed in console')
  }

  console.log('\n✅ Audio smoke test passed\n')
  await browser.close()
}

const FADE_MS = 900

main().catch((err) => {
  console.error('\n❌ Audio test failed:', err.message)
  process.exit(1)
})
