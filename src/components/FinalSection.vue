<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAudio } from '../composables/useAudio.js'
import { assetUrl } from '../lib/assetUrl.js'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  image: { type: String, default: () => assetUrl('/images/main.png') },
})

const placeholderSrc = assetUrl('/images/placeholder.svg')

const {
  toggleVoicePlayback,
  seekVoice,
  isVoicePlaying,
  isVoicePaused,
  voiceProgress,
} = useAudio()

const sectionRef = ref(null)
const imageRef = ref(null)
const glowRef = ref(null)
const titleRef = ref(null)
const playerRef = ref(null)
const contentRef = ref(null)
const revealed = ref(false)
const isSeeking = ref(false)
const seekValue = ref(0)

let zoomTween = null
let glowTween = null
let scrollTriggerInstance = null

const isActive = computed(() => isVoicePlaying.value || isVoicePaused.value)
const duration = computed(() => voiceProgress.value.duration || 0)
const currentTime = computed(() =>
  isSeeking.value ? seekValue.value : voiceProgress.value.currentTime || 0,
)
const progressPercent = computed(() => {
  if (!duration.value) return 0
  return Math.min(100, (currentTime.value / duration.value) * 100)
})
const hasStarted = computed(
  () => isActive.value || (voiceProgress.value.currentTime ?? 0) > 0,
)

const playLabel = computed(() => {
  if (isVoicePlaying.value) return 'Pause voice message'
  if (isVoicePaused.value) return 'Resume voice message'
  return 'Play voice message'
})

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function startPlaybackVisuals() {
  if (imageRef.value) {
    zoomTween?.kill()
    zoomTween = gsap.to(imageRef.value, {
      scale: 1.14,
      duration: 22,
      ease: 'none',
    })
  }
  if (glowRef.value) {
    glowTween?.kill()
    glowTween = gsap.to(glowRef.value, {
      opacity: 0.85,
      duration: 2,
      ease: 'power2.inOut',
    })
  }
}

function pausePlaybackVisuals() {
  zoomTween?.pause()
  glowTween?.pause()
}

function resumePlaybackVisuals() {
  zoomTween?.resume()
  glowTween?.resume()
}

function resetPlaybackVisuals() {
  zoomTween?.kill()
  glowTween?.kill()
  if (glowRef.value) {
    gsap.to(glowRef.value, { opacity: 0.4, duration: 1.2, ease: 'power2.out' })
  }
  if (imageRef.value) {
    gsap.to(imageRef.value, { scale: 1, duration: 1.4, ease: 'power2.out' })
  }
}

onMounted(() => {
  if (!sectionRef.value) return

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.value,
      start: 'top 78%',
      once: true,
      onEnter: () => { revealed.value = true },
    },
  })

  if (contentRef.value) {
    tl.fromTo(
      contentRef.value,
      { opacity: 0, y: 36 },
      { opacity: 1, y: 0, duration: 1.4, ease: 'power3.out', immediateRender: false },
    )
  }

  if (titleRef.value) {
    tl.fromTo(
      titleRef.value,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', immediateRender: false },
      '-=1',
    )
  }

  if (playerRef.value) {
    tl.fromTo(
      playerRef.value,
      { opacity: 0, y: 20, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out', immediateRender: false },
      '-=0.75',
    )
  }

  scrollTriggerInstance = ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1.2,
    onUpdate: (self) => {
      if (!isVoicePlaying.value && imageRef.value) {
        const scale = 1 + self.progress * 0.04
        gsap.set(imageRef.value, { scale })
      }
    },
  })
})

watch(isVoicePlaying, (playing, wasPlaying) => {
  if (playing) {
    resumePlaybackVisuals()
    if (!wasPlaying && !zoomTween) startPlaybackVisuals()
  } else if (!isVoicePaused.value) {
    resetPlaybackVisuals()
  }
})

watch(isVoicePaused, (paused) => {
  if (paused) pausePlaybackVisuals()
})

async function onTogglePlay() {
  await toggleVoicePlayback()
}

function onSeekInput(event) {
  const value = Number(event.target.value)
  seekValue.value = value
  if (duration.value) {
    seekVoice((value / 100) * duration.value)
  }
}

function onSeekStart() {
  isSeeking.value = true
  seekValue.value = progressPercent.value
}

function onSeekEnd(event) {
  onSeekInput(event)
  isSeeking.value = false
}

onUnmounted(() => {
  zoomTween?.kill()
  glowTween?.kill()
  scrollTriggerInstance?.kill()
})
</script>

<template>
  <section
    id="final-voice-section"
    ref="sectionRef"
    class="final-voice-section relative flex min-h-screen min-h-[100dvh] items-center justify-center overflow-hidden"
    aria-label="Voice message for Nema"
  >
    <div class="absolute inset-0 min-h-full min-w-full">
      <img
        ref="imageRef"
        :src="image"
        alt="For Nema"
        class="absolute inset-0 block h-full w-full min-h-full object-cover object-center will-change-transform"
        style="transform-origin: center center"
        @error="($event.target).src = placeholderSrc"
      />

      <div
        class="absolute inset-0"
        style="background: linear-gradient(
          to bottom,
          rgba(15, 10, 31, 0.75) 0%,
          rgba(15, 10, 31, 0.35) 45%,
          rgba(15, 10, 31, 0.9) 100%
        )"
      />

      <div
        ref="glowRef"
        class="final-glow absolute inset-0 opacity-40 transition-opacity duration-1000"
        style="background: radial-gradient(ellipse at center, rgba(168, 85, 247, 0.35) 0%, rgba(124, 58, 237, 0.12) 45%, transparent 70%)"
      />

      <div
        class="pointer-events-none absolute inset-0"
        style="box-shadow: inset 0 0 120px 40px rgba(15, 10, 31, 0.65)"
      />
    </div>

    <div
      class="pointer-events-none absolute bottom-[12%] left-[8%] hidden opacity-20 md:block"
      aria-hidden="true"
    >
      <svg class="h-16 w-16 text-lavender/60" viewBox="0 0 64 64" fill="currentColor">
        <ellipse cx="32" cy="48" rx="8" ry="14" opacity="0.5" />
        <path d="M32 8c-6 14-10 24-10 32 0 8 4 14 10 14s10-6 10-14c0-8-4-18-10-32z" opacity="0.7" />
        <path d="M20 36c-8-4-12 0-10 8 2 6 10 8 14 4M44 36c8-4 12 0 10 8-2 6-10 8-14 4" opacity="0.4" />
      </svg>
    </div>
    <div
      class="pointer-events-none absolute right-[10%] top-[18%] hidden opacity-15 md:block"
      aria-hidden="true"
    >
      <svg class="h-12 w-12 text-primary/50" viewBox="0 0 64 64" fill="currentColor">
        <ellipse cx="32" cy="48" rx="6" ry="10" opacity="0.4" />
        <path d="M32 12c-4 10-6 18-6 24 0 6 3 10 6 10s6-4 6-10c0-6-2-14-6-24z" />
      </svg>
    </div>

    <div
      ref="contentRef"
      class="final-voice-content relative z-30 flex w-full max-w-lg flex-col items-center px-6 text-center opacity-100"
    >
      <p class="mb-4 text-xs font-light uppercase tracking-[0.35em] text-lavender/50">
        for you
      </p>

      <h2
        ref="titleRef"
        class="font-display text-glow mb-10 max-w-2xl text-3xl font-medium leading-snug text-soft-white opacity-100 md:mb-12 md:text-5xl md:leading-tight"
      >
        One last thing for you, Nema.
      </h2>

      <!-- Mini voice player -->
      <div
        ref="playerRef"
        class="voice-player glass-strong glow-purple w-full max-w-md rounded-2xl border border-lavender/15 p-4 shadow-2xl md:p-5"
        :class="{ 'voice-player--active': isActive }"
      >
        <div class="flex items-center gap-4">
          <button
            type="button"
            class="voice-play-btn group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-transform duration-300 hover:scale-105 active:scale-95"
            :aria-label="playLabel"
            @click="onTogglePlay"
          >
            <span
              class="absolute inset-0 rounded-full border border-lavender/30 bg-white/8 backdrop-blur-md transition-colors duration-300 group-hover:border-primary/50"
              :class="{ 'border-primary/60 shadow-[0_0_28px_rgba(168,85,247,0.35)]': isActive }"
            />
            <span
              class="absolute inset-1 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style="background: radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)"
            />

            <!-- Play -->
            <svg
              v-if="!isVoicePlaying"
              class="relative ml-0.5 h-5 w-5 text-soft-white"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            <!-- Pause -->
            <svg
              v-else
              class="relative h-5 w-5 text-soft-white"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
            </svg>
          </button>

          <div class="min-w-0 flex-1">
            <p class="mb-2 text-left text-xs font-light tracking-wide text-lavender/55" dir="rtl">
              رسالة صوتية
            </p>

            <div class="voice-progress relative h-1.5 w-full overflow-hidden rounded-full bg-white/8">
              <div
                class="voice-progress__fill absolute inset-y-0 left-0 rounded-full transition-[width] duration-150 ease-linear"
                :style="{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, rgba(168,85,247,0.7), rgba(216,180,254,0.9))',
                  boxShadow: '0 0 12px rgba(168, 85, 247, 0.45)',
                }"
              />
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                :value="progressPercent"
                :disabled="!hasStarted && !duration"
                class="voice-seek absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="Voice message progress"
                @input="onSeekInput"
                @mousedown="onSeekStart"
                @touchstart="onSeekStart"
                @mouseup="onSeekEnd"
                @touchend="onSeekEnd"
              />
            </div>

            <div class="mt-2 flex justify-between text-[11px] tabular-nums tracking-wide text-lavender/50">
              <span class="voice-time tabular-nums">{{ formatTime(currentTime) }}</span>
              <span class="voice-time tabular-nums">{{ formatTime(duration) }}</span>
            </div>
          </div>
        </div>
      </div>

      <p
        v-if="isVoicePlaying"
        class="mt-8 text-sm font-light tracking-[0.18em] text-lavender/60"
      >
        listen when you're ready
      </p>
      <p
        v-else-if="isVoicePaused"
        class="mt-8 text-sm font-light tracking-[0.18em] text-lavender/55"
      >
        paused — tap play to continue
      </p>
      <p
        v-else-if="revealed"
        class="mt-8 text-xs font-light tracking-widest text-lavender/40"
      >
        tap play when you're ready
      </p>
    </div>
  </section>
</template>

<style scoped>
.final-voice-section {
  isolation: isolate;
}

.voice-player {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow:
    0 0 40px rgba(168, 85, 247, 0.12),
    0 12px 40px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition: box-shadow 0.4s ease, border-color 0.4s ease;
}

.voice-player--active {
  border-color: rgba(168, 85, 247, 0.28);
  box-shadow:
    0 0 56px rgba(168, 85, 247, 0.2),
    0 12px 40px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.voice-seek {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}

.voice-seek:disabled {
  cursor: default;
  pointer-events: none;
}

.voice-seek::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #f5f0ff;
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.6);
  cursor: pointer;
}

.voice-seek::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: none;
  border-radius: 50%;
  background: #f5f0ff;
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.6);
  cursor: pointer;
}
</style>
