import { ref, inject, provide } from 'vue'
import * as audioManager from '../lib/audioManager.js'

const AUDIO_KEY = Symbol('nema-audio')

export function provideAudio() {
  const isMusicPlaying = ref(audioManager.isMusicPlaying())
  const isVoicePlaying = ref(audioManager.isVoicePlaying())
  const isVoicePaused = ref(audioManager.isVoicePaused())
  const musicVolume = ref(audioManager.getMusicVolume())
  const dimmedForVoice = ref(audioManager.isDimmedForVoice())
  const voiceProgress = ref(audioManager.getVoiceProgress())

  audioManager.subscribe('musicPlaying', (v) => { isMusicPlaying.value = v })
  audioManager.subscribe('voicePlaying', (v) => { isVoicePlaying.value = v })
  audioManager.subscribe('voicePaused', (v) => { isVoicePaused.value = v })
  audioManager.subscribe('musicVolume', (v) => { musicVolume.value = v })
  audioManager.subscribe('dimmed', (v) => { dimmedForVoice.value = v })
  audioManager.subscribe('voiceProgress', (p) => { voiceProgress.value = p })

  const api = {
    isMusicPlaying,
    isVoicePlaying,
    isVoicePaused,
    musicVolume,
    dimmedForVoice,
    voiceProgress,
    init: () => audioManager.getMusicElement(),
    startMusic: () => audioManager.startMusic(),
    startMusicOnGesture: () => audioManager.startMusic(),
    toggleMusic: () => audioManager.toggleMusic(),
    setMusicVolume: (v) => audioManager.setMusicVolume(v),
    playVoice: () => audioManager.playVoice(),
    pauseVoice: () => audioManager.pauseVoice(),
    resumeVoice: () => audioManager.resumeVoice(),
    toggleVoicePlayback: () => audioManager.toggleVoicePlayback(),
    seekVoice: (t) => audioManager.seekVoice(t),
    stopVoice: () => audioManager.stopVoice(),
  }

  provide(AUDIO_KEY, api)
  return api
}

export function useAudio() {
  const audio = inject(AUDIO_KEY)
  if (!audio) {
    throw new Error('useAudio must be used within provideAudio')
  }
  return audio
}
