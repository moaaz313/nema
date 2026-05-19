<script setup>
import { ref, onMounted } from 'vue'
import { useAudio } from '../composables/useAudio.js'

const {
  init,
  isMusicPlaying,
  isVoicePlaying,
  musicVolume,
  toggleMusic,
  setMusicVolume,
  dimmedForVoice,
} = useAudio()

const expanded = ref(false)

onMounted(() => {
  init()
})

function onVolumeInput(e) {
  setMusicVolume(parseFloat(e.target.value))
}
</script>

<template>
  <div
    class="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2"
  >
    <transition name="fade">
      <div
        v-if="expanded"
        class="glass mb-2 flex items-center gap-3 rounded-2xl px-4 py-3"
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          :value="musicVolume"
          class="h-1 w-24 cursor-pointer appearance-none rounded-full bg-lavender/20 accent-primary"
          :disabled="dimmedForVoice"
          @input="onVolumeInput"
        />
        <span class="text-xs text-lavender/50">
          {{ dimmedForVoice ? 'voice playing' : 'music' }}
        </span>
      </div>
    </transition>

    <button
      type="button"
      class="glass group flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 hover:shadow-[0_0_24px_rgba(168,85,247,0.3)]"
      :aria-label="isMusicPlaying ? 'Pause music' : 'Play music'"
      @click="toggleMusic"
    >
      <svg
        v-if="isMusicPlaying && !isVoicePlaying"
        class="h-5 w-5 text-lavender"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
      </svg>
      <svg
        v-else
        class="h-5 w-5 text-lavender transition-transform group-hover:scale-110"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>

    <button
      type="button"
      class="text-xs text-lavender/40 transition-colors hover:text-lavender/70"
      @click="expanded = !expanded"
    >
      {{ expanded ? '−' : 'vol' }}
    </button>
  </div>
</template>
