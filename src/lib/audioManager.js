/**
 * Persistent audio manager — Audio instances live at module scope so Vue
 * rerenders, transitions, and v-if mounts never destroy playback.
 */

import { assetUrl } from './assetUrl.js'

const MUSIC_SRC = assetUrl('/audio/music.m4a')
const VOICE_SRC = assetUrl('/audio/voice.m4a')

const MUSIC_NORMAL = 0.2
const MUSIC_DIM = 0.06
const FADE_MS = 900

/** @type {HTMLAudioElement | null} */
let musicEl = null
/** @type {HTMLAudioElement | null} */
let voiceEl = null
/** @type {number | null} */
let fadeRaf = null

let musicTargetVolume = MUSIC_NORMAL
let isDucked = false
let musicPlaying = false
let voicePlaying = false
let voicePaused = false
let userInteracted = false

const listeners = {
  musicPlaying: new Set(),
  voicePlaying: new Set(),
  voicePaused: new Set(),
  voiceProgress: new Set(),
  musicVolume: new Set(),
  dimmed: new Set(),
}

function notify(set, value) {
  set.forEach((fn) => fn(value))
}

function notifyVoiceProgress() {
  if (!voiceEl) return
  notify(listeners.voiceProgress, {
    currentTime: voiceEl.currentTime,
    duration: Number.isFinite(voiceEl.duration) ? voiceEl.duration : 0,
  })
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

function cancelFade() {
  if (fadeRaf != null) {
    cancelAnimationFrame(fadeRaf)
    fadeRaf = null
  }
}

/**
 * @param {HTMLAudioElement} el
 * @param {number} to
 * @param {number} [duration]
 * @returns {Promise<void>}
 */
function fadeTo(el, to, duration = FADE_MS) {
  cancelFade()
  const from = el.volume
  if (Math.abs(from - to) < 0.001) {
    el.volume = to
    return Promise.resolve()
  }
  const start = performance.now()
  return new Promise((resolve) => {
    function step(now) {
      const t = Math.min(1, (now - start) / duration)
      el.volume = from + (to - from) * easeInOut(t)
      if (t < 1) {
        fadeRaf = requestAnimationFrame(step)
      } else {
        fadeRaf = null
        el.volume = to
        resolve()
      }
    }
    fadeRaf = requestAnimationFrame(step)
  })
}

function getMusic() {
  if (!musicEl) {
    musicEl = new Audio(MUSIC_SRC)
    musicEl.loop = true
    musicEl.preload = 'auto'
    musicEl.volume = MUSIC_NORMAL
    musicEl.addEventListener('error', () => {
      console.error('Background music error:', musicEl?.error)
    })
    console.log('Background music initialized')
  }
  return musicEl
}

function detachVoiceListeners(el) {
  el.removeEventListener('ended', onVoiceEnded)
  el.removeEventListener('error', onVoiceError)
  el.removeEventListener('timeupdate', notifyVoiceProgress)
  el.removeEventListener('loadedmetadata', notifyVoiceProgress)
  el.removeEventListener('durationchange', notifyVoiceProgress)
}

function attachVoiceListeners(el) {
  el.addEventListener('ended', onVoiceEnded)
  el.addEventListener('error', onVoiceError)
  el.addEventListener('timeupdate', notifyVoiceProgress)
  el.addEventListener('loadedmetadata', notifyVoiceProgress)
  el.addEventListener('durationchange', notifyVoiceProgress)
}

function createVoiceElement() {
  if (voiceEl) {
    detachVoiceListeners(voiceEl)
    voiceEl.pause()
    voiceEl = null
  }

  voiceEl = new Audio(VOICE_SRC)
  voiceEl.preload = 'auto'
  voiceEl.volume = 1
  attachVoiceListeners(voiceEl)
  return voiceEl
}

function onVoiceError() {
  console.error('Voice failed', voiceEl?.error)
  voicePlaying = false
  voicePaused = false
  notify(listeners.voicePlaying, false)
  notify(listeners.voicePaused, false)
  isDucked = false
  notify(listeners.dimmed, false)
  restoreMusicAfterVoice()
  notifyVoiceProgress()
}

function onVoiceEnded() {
  console.log('Voice ended')
  voicePlaying = false
  voicePaused = false
  notify(listeners.voicePlaying, false)
  notify(listeners.voicePaused, false)
  restoreMusicAfterVoice()
  notifyVoiceProgress()
}

async function duckMusic() {
  const music = getMusic()
  isDucked = true
  notify(listeners.dimmed, true)
  console.log('Background music ducked')
  await fadeTo(music, MUSIC_DIM)
}

async function restoreMusicAfterVoice() {
  const music = getMusic()
  isDucked = false
  notify(listeners.dimmed, false)
  if (!musicPlaying) return
  const target = musicTargetVolume
  console.log('Background music restored')
  await fadeTo(music, target)
}

/**
 * Call synchronously inside a user gesture (password submit / unlock).
 */
export function markUserInteracted() {
  userInteracted = true
  getMusic()
}

/**
 * Start background music — must run inside or immediately after user gesture.
 */
export function startMusic() {
  markUserInteracted()
  const music = getMusic()
  music.volume = isDucked ? MUSIC_DIM : musicTargetVolume
  const playPromise = music.play()
  if (!playPromise) {
    console.warn('Background music play() returned undefined')
    return Promise.resolve(false)
  }
  return playPromise
    .then(() => {
      musicPlaying = true
      notify(listeners.musicPlaying, true)
      console.log('Background music playing')
      return true
    })
    .catch((err) => {
      console.warn('Background music play blocked or failed:', err?.message || err)
      return false
    })
}

export function toggleMusic() {
  const music = getMusic()
  if (musicPlaying) {
    music.pause()
    musicPlaying = false
    notify(listeners.musicPlaying, false)
  } else {
    return startMusic()
  }
}

export function setMusicVolume(v) {
  musicTargetVolume = Math.max(0, Math.min(1, v))
  notify(listeners.musicVolume, musicTargetVolume)
  if (musicEl && !isDucked) {
    musicEl.volume = musicTargetVolume
  }
}

export function getMusicVolume() {
  return musicTargetVolume
}

export function isMusicPlaying() {
  return musicPlaying
}

export function isVoicePlaying() {
  return voicePlaying
}

export function isVoicePaused() {
  return voicePaused
}

export function isDimmedForVoice() {
  return isDucked
}

export function getVoiceProgress() {
  return {
    currentTime: voiceEl?.currentTime ?? 0,
    duration: voiceEl && Number.isFinite(voiceEl.duration) ? voiceEl.duration : 0,
  }
}

/**
 * Play voice on user click. play() is invoked synchronously in the click stack.
 * @returns {Promise<boolean>}
 */
export function playVoice() {
  markUserInteracted()

  const music = getMusic()
  const voice = createVoiceElement()
  voicePaused = false
  notify(listeners.voicePaused, false)

  duckMusic()

  const playPromise = voice.play()
  if (!playPromise) {
    console.error('Voice failed: play() returned undefined')
    restoreMusicAfterVoice()
    return Promise.resolve(false)
  }

  return playPromise
    .then(() => {
      voicePlaying = true
      notify(listeners.voicePlaying, true)
      console.log('Voice started')
      notifyVoiceProgress()
      if (music.paused && musicPlaying) {
        music.play().catch(() => {})
      }
      return true
    })
    .catch((err) => {
      console.error('Voice failed:', err?.message || err)
      voicePlaying = false
      voicePaused = false
      notify(listeners.voicePlaying, false)
      notify(listeners.voicePaused, false)
      isDucked = false
      notify(listeners.dimmed, false)
      if (voiceEl) {
        voiceEl.pause()
        voiceEl = null
      }
      restoreMusicAfterVoice()
      return false
    })
}

export function pauseVoice() {
  if (!voiceEl || !voicePlaying) return false
  voiceEl.pause()
  voicePlaying = false
  voicePaused = true
  notify(listeners.voicePlaying, false)
  notify(listeners.voicePaused, true)
  console.log('Voice paused')
  restoreMusicAfterVoice()
  notifyVoiceProgress()
  return true
}

/**
 * @returns {Promise<boolean>}
 */
export function resumeVoice() {
  if (!voiceEl || !voicePaused) return Promise.resolve(false)
  markUserInteracted()
  duckMusic()
  const playPromise = voiceEl.play()
  if (!playPromise) return Promise.resolve(false)
  return playPromise
    .then(() => {
      voicePlaying = true
      voicePaused = false
      notify(listeners.voicePlaying, true)
      notify(listeners.voicePaused, false)
      console.log('Voice resumed')
      notifyVoiceProgress()
      return true
    })
    .catch((err) => {
      console.error('Voice resume failed:', err?.message || err)
      return false
    })
}

/**
 * @returns {Promise<boolean>}
 */
export function toggleVoicePlayback() {
  if (voicePlaying) {
    pauseVoice()
    return Promise.resolve(true)
  }
  if (voicePaused && voiceEl) {
    return resumeVoice()
  }
  return playVoice()
}

/**
 * @param {number} time
 */
export function seekVoice(time) {
  if (!voiceEl) return
  const duration = Number.isFinite(voiceEl.duration) ? voiceEl.duration : 0
  voiceEl.currentTime = Math.max(0, Math.min(time, duration || time))
  notifyVoiceProgress()
}

export function stopVoice() {
  if (voiceEl) {
    voiceEl.pause()
    voiceEl.currentTime = 0
  }
  voicePlaying = false
  voicePaused = false
  notify(listeners.voicePlaying, false)
  notify(listeners.voicePaused, false)
  restoreMusicAfterVoice()
  notifyVoiceProgress()
}

/** @returns {HTMLAudioElement} */
export function getMusicElement() {
  return getMusic()
}

/** @returns {HTMLAudioElement | null} */
export function getVoiceElement() {
  return voiceEl
}

export function subscribe(event, fn) {
  const set = listeners[event]
  if (!set) return () => {}
  set.add(fn)
  return () => set.delete(fn)
}

export function hasUserInteracted() {
  return userInteracted
}

/** @returns {object} Snapshot for tests / debugging */
export function getAudioDebugState() {
  return {
    musicPlaying,
    voicePlaying,
    voicePaused,
    isDucked,
    musicTargetVolume,
    userInteracted,
    musicVolume: musicEl?.volume ?? null,
    musicPaused: musicEl?.paused ?? null,
    musicCurrentTime: musicEl?.currentTime ?? null,
    voicePausedElement: voiceEl?.paused ?? null,
    voiceCurrentTime: voiceEl?.currentTime ?? null,
    voiceDuration: voiceEl?.duration ?? null,
    musicReadyState: musicEl?.readyState ?? null,
    voiceReadyState: voiceEl?.readyState ?? null,
    musicError: musicEl?.error?.code ?? null,
    voiceError: voiceEl?.error?.code ?? null,
  }
}

if (typeof window !== 'undefined') {
  window.__nemaAudioDebug = getAudioDebugState
  window.__nemaAudioStop = stopVoice
}
