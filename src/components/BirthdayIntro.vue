<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { useAudio } from '../composables/useAudio.js'

const emit = defineEmits(['complete'])
const { setMusicVolume } = useAudio()

const MUSIC_INTRO = 0.2
const MUSIC_CANDLE = 0.27

const rootRef = ref(null)
const backdropRef = ref(null)
const cameraRef = ref(null)
const cakeStageRef = ref(null)
const cakeRef = ref(null)
const glowRef = ref(null)
const ambientGlowRef = ref(null)
const textStageRef = ref(null)
const lineHappyRef = ref(null)
const lineNemaRef = ref(null)
const dateRef = ref(null)
const subRef = ref(null)
const nemaGhostRef = ref(null)

let timeline = null
let breatheTween = null
/** @type {(e: MouseEvent) => void | null} */
let onParallax = null
const NORMAL_VOLUME = MUSIC_INTRO

/** @param {Element} el */
function prepDraw(el) {
  if (!(el instanceof SVGGeometryElement)) return
  const len = el.getTotalLength()
  gsap.set(el, {
    strokeDasharray: len,
    strokeDashoffset: len,
    opacity: 1,
  })
}

/** @param {NodeListOf<Element> | Element[]} els */
function drawGroup(els, duration = 2, stagger = 0) {
  return {
    strokeDashoffset: 0,
    duration,
    stagger,
    ease: 'power2.inOut',
  }
}

onMounted(() => {
  document.body.style.overflow = 'hidden'

  const plate = cakeRef.value?.querySelectorAll('.layer-plate') ?? []
  const base = cakeRef.value?.querySelectorAll('.layer-base') ?? []
  const mid = cakeRef.value?.querySelectorAll('.layer-mid') ?? []
  const top = cakeRef.value?.querySelectorAll('.layer-top') ?? []
  const decor = cakeRef.value?.querySelectorAll('.layer-decor') ?? []
  const candles = cakeRef.value?.querySelectorAll('.layer-candle') ?? []
  const flames = cakeRef.value?.querySelectorAll('.layer-flame') ?? []
  const shadows = cakeRef.value?.querySelectorAll('.layer-shadow') ?? []
  const highlights = cakeRef.value?.querySelectorAll('.layer-highlight') ?? []

  ;[...plate, ...base, ...mid, ...top, ...decor, ...candles].forEach(prepDraw)

  gsap.set(flames, { opacity: 0, scale: 0.5, transformOrigin: 'center bottom' })
  gsap.set(shadows, { opacity: 0 })
  gsap.set(highlights, { opacity: 0 })
  gsap.set(textStageRef.value, { opacity: 0, y: 20 })
  gsap.set(cakeStageRef.value, { scale: 0.88, y: 24 })
  gsap.set(cameraRef.value, { scale: 0.94 })

  timeline = gsap.timeline({
    onComplete: exitIntro,
  })

  // ─── STEP 1 — Atmosphere shift (tightened) ───────────────────
  timeline.fromTo(
    rootRef.value,
    { opacity: 0 },
    { opacity: 1, duration: 0.65, ease: 'power2.out' },
  )
  timeline.fromTo(
    backdropRef.value,
    { opacity: 0, backdropFilter: 'blur(0px)' },
    { opacity: 1, backdropFilter: 'blur(10px)', duration: 0.85, ease: 'power2.inOut' },
    '-=0.5',
  )
  timeline.fromTo(
    glowRef.value,
    { opacity: 0 },
    { opacity: 1, duration: 0.9, ease: 'power2.out' },
    '-=0.7',
  )
  timeline.fromTo(
    ambientGlowRef.value,
    { opacity: 0, scale: 0.85 },
    { opacity: 0.6, scale: 1, duration: 1, ease: 'power2.out' },
    '-=0.75',
  )
  timeline.to(cameraRef.value, {
    scale: 1,
    duration: 1.35,
    ease: 'power1.inOut',
  }, '-=0.85')

  if (nemaGhostRef.value) {
    timeline.fromTo(
      nemaGhostRef.value,
      { opacity: 0, scale: 1.05 },
      { opacity: 0.28, scale: 1, duration: 0.65, ease: 'power2.out' },
      '-=0.5',
    )
  }

  // ─── STEP 2 — Base formation ─────────────────────────────────
  timeline.to(plate, drawGroup(plate, 0.85))
  timeline.to(base, drawGroup(base, 1.05), '-=0.65')
  timeline.to(shadows, { opacity: 0.35, duration: 0.55, stagger: 0.06 }, '-=0.75')

  if (nemaGhostRef.value) {
    timeline.to(nemaGhostRef.value, { opacity: 0, duration: 0.4, ease: 'power2.in' }, '-=0.85')
  }

  // ─── STEP 3 — Structure build ────────────────────────────────
  timeline.to(mid, drawGroup(mid, 0.95))
  timeline.to(top, drawGroup(top, 0.85), '-=0.4')
  timeline.to(cakeStageRef.value, {
    scale: 0.96,
    y: 12,
    duration: 1.15,
    ease: 'power1.inOut',
  }, '-=0.9')

  // ─── STEP 4 — Decoration phase ───────────────────────────────
  timeline.to(decor, drawGroup(decor, 0.75, 0.06))
  timeline.to(highlights, { opacity: 0.5, duration: 0.6, stagger: 0.05 }, '-=0.55')
  timeline.to(cakeRef.value?.querySelector('.cake-glow'), {
    opacity: 0.45,
    duration: 0.75,
    ease: 'power2.out',
  }, '-=0.65')

  // ─── STEP 5 — Candles ────────────────────────────────────────
  timeline.to(candles, drawGroup(candles, 0.45, 0.12))

  flames.forEach((flame, i) => {
    timeline.to(flame, {
      opacity: 1,
      scale: 1,
      duration: 0.32,
      ease: 'power2.out',
      onStart: () => flame.classList.add('flame-lit'),
    }, `+=${i === 0 ? 0.05 : 0.1}`)

    if (i === 0) {
      timeline.call(() => setMusicVolume(MUSIC_CANDLE), null, '<')
    }
  })

  // ─── STEP 6 — Glow + text payoff ─────────────────────────────
  timeline.to(ambientGlowRef.value, {
    opacity: 0.9,
    scale: 1.08,
    duration: 0.85,
    ease: 'power2.inOut',
  }, '-=0.15')
  timeline.to(cakeRef.value?.querySelector('.cake-glow'), {
    opacity: 0.7,
    duration: 0.75,
    ease: 'power2.out',
  }, '-=0.7')

  timeline.call(startBreathing, null, '-=0.25')

  timeline.to(textStageRef.value, {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: 'power3.out',
  }, '-=0.35')

  timeline.fromTo(
    lineHappyRef.value,
    { opacity: 0, y: 14, filter: 'blur(4px)' },
    { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.65, ease: 'power3.out' },
    '-=0.45',
  )
  timeline.fromTo(
    lineNemaRef.value,
    { opacity: 0, y: 10, scale: 0.98 },
    { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' },
    '-=0.5',
  )
  timeline.fromTo(
    dateRef.value,
    { opacity: 0, y: 8, scale: 0.97 },
    { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out' },
    '-=0.5',
  )
  timeline.fromTo(
    subRef.value,
    { opacity: 0, y: 5 },
    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
    '-=0.45',
  )

  timeline.to({}, { duration: 0.55 })

  onParallax = (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 10
    const y = (e.clientY / window.innerHeight - 0.5) * 6
    gsap.to(cameraRef.value, { x, y, duration: 1.4, ease: 'power2.out' })
  }
  window.addEventListener('mousemove', onParallax)
})

function startBreathing() {
  breatheTween = gsap.to(cakeStageRef.value, {
    y: '+=6',
    scale: '+=0.015',
    duration: 3.2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  })
}

function exitIntro() {
  breatheTween?.kill()
  setMusicVolume(NORMAL_VOLUME)

  gsap.to(rootRef.value, {
    opacity: 0,
    scale: 1.05,
    filter: 'blur(14px)',
    duration: 0.95,
    ease: 'power2.inOut',
    onComplete: () => {
      document.body.style.overflow = ''
      emit('complete')
    },
  })
}

onUnmounted(() => {
  timeline?.kill()
  breatheTween?.kill()
  if (onParallax) window.removeEventListener('mousemove', onParallax)
  document.body.style.overflow = ''
  setMusicVolume(NORMAL_VOLUME)
})
</script>

<template>
  <section
    ref="rootRef"
    class="birthday-intro fixed inset-0 z-40 flex min-h-screen min-h-[100dvh] items-center justify-center overflow-hidden opacity-0"
    aria-label="Birthday celebration"
  >
    <!-- Layered cinematic backdrop -->
    <div
      ref="backdropRef"
      class="absolute inset-0 opacity-0 backdrop-blur-0"
      style="background: radial-gradient(ellipse at 50% 35%, rgba(25, 12, 48, 0.95) 0%, #0a0614 75%)"
    />

    <div
      ref="glowRef"
      class="pointer-events-none absolute inset-0 opacity-0"
      style="background: radial-gradient(ellipse at 50% 45%, rgba(168, 85, 247, 0.18) 0%, transparent 60%)"
    />

    <div
      ref="ambientGlowRef"
      class="pointer-events-none absolute left-1/2 top-[38%] h-[55vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
      style="background: radial-gradient(circle, rgba(168, 85, 247, 0.28) 0%, transparent 68%)"
    />

    <!-- Sparkles -->
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <span
        v-for="i in 16"
        :key="i"
        class="intro-sparkle absolute rounded-full bg-lavender"
        :style="{
          width: `${2 + (i % 3)}px`,
          height: `${2 + (i % 3)}px`,
          left: `${6 + (i * 6.2) % 88}%`,
          top: `${8 + (i * 9.3) % 84}%`,
          animationDelay: `${i * 0.4}s`,
          opacity: 0.12 + (i % 4) * 0.06,
        }"
      />
    </div>

    <!-- Camera + parallax stage -->
    <div
      ref="cameraRef"
      class="intro-camera relative z-10 flex w-full max-w-4xl flex-col items-center px-4"
    >
      <!-- Large-scale cake stage -->
      <div ref="cakeStageRef" class="intro-cake-stage relative mb-6 md:mb-8">
        <p
          ref="nemaGhostRef"
          class="font-display pointer-events-none absolute left-1/2 top-[42%] z-0 -translate-x-1/2 -translate-y-1/2 text-6xl font-medium tracking-[0.2em] text-lavender/20 opacity-0 md:text-8xl"
          aria-hidden="true"
        >
          Nema
        </p>

        <svg
          ref="cakeRef"
          class="intro-cake relative z-10 h-[min(52vh,420px)] w-[min(85vw,380px)] md:h-[min(58vh,480px)] md:w-[min(72vw,440px)]"
          viewBox="0 0 240 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="intro-cake-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="intro-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#faf5ff" />
              <stop offset="45%" stop-color="#e9d5ff" />
              <stop offset="100%" stop-color="#a855f7" />
            </linearGradient>
            <linearGradient id="intro-cream" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#f5f0ff" stop-opacity="0.9" />
              <stop offset="100%" stop-color="#d8b4fe" stop-opacity="0.3" />
            </linearGradient>
            <radialGradient id="intro-flame-grad" cx="50%" cy="80%" r="60%">
              <stop offset="0%" stop-color="#fffbeb" />
              <stop offset="50%" stop-color="#fcd34d" />
              <stop offset="100%" stop-color="#f59e0b" />
            </radialGradient>
          </defs>

          <!-- Depth shadows -->
          <ellipse class="layer-shadow cake-glow" cx="120" cy="218" rx="88" ry="22" fill="rgba(168,85,247,0.12)" opacity="0" />
          <path class="layer-shadow" d="M42 198 L198 198 L192 178 L48 178 Z" fill="rgba(0,0,0,0.25)" opacity="0" />
          <path class="layer-shadow" d="M52 172 L188 172 L182 152 L58 152 Z" fill="rgba(0,0,0,0.2)" opacity="0" />

          <!-- Ambient under-glow -->
          <ellipse class="cake-glow" cx="120" cy="200" rx="90" ry="30" fill="rgba(168, 85, 247, 0.14)" opacity="0" />

          <!-- Plate -->
          <path
            class="layer-plate draw-line"
            d="M24 208 L216 208"
            stroke="url(#intro-stroke)"
            stroke-width="1.4"
            stroke-linecap="round"
            opacity="0.75"
          />
          <ellipse
            class="layer-plate draw-line"
            cx="120"
            cy="208"
            rx="96"
            ry="6"
            stroke="url(#intro-stroke)"
            stroke-width="1"
            fill="none"
            opacity="0.5"
          />

          <!-- Tier 1 — base -->
          <path
            class="layer-base draw-line"
            d="M46 198 L194 198 L186 168 L54 168 Z"
            stroke="url(#intro-stroke)"
            stroke-width="1.6"
            stroke-linejoin="round"
            filter="url(#intro-cake-glow)"
          />

          <!-- Tier 2 — middle -->
          <path
            class="layer-mid draw-line"
            d="M56 168 L184 168 L178 140 L62 140 Z"
            stroke="url(#intro-stroke)"
            stroke-width="1.5"
            stroke-linejoin="round"
            filter="url(#intro-cake-glow)"
          />

          <!-- Tier 3 — top -->
          <path
            class="layer-top draw-line"
            d="M66 140 L174 140 L168 114 L72 114 Z"
            stroke="url(#intro-stroke)"
            stroke-width="1.5"
            stroke-linejoin="round"
            filter="url(#intro-cake-glow)"
          />

          <!-- Cream / decor strokes -->
          <path
            class="layer-decor draw-line"
            d="M54 182 Q120 174 186 182"
            stroke="url(#intro-cream)"
            stroke-width="2"
            stroke-linecap="round"
            fill="none"
            opacity="0.85"
          />
          <path
            class="layer-decor draw-line"
            d="M64 154 Q120 148 176 154"
            stroke="url(#intro-cream)"
            stroke-width="1.6"
            stroke-linecap="round"
            fill="none"
            opacity="0.7"
          />
          <path
            class="layer-decor draw-line"
            d="M74 128 Q120 122 166 128"
            stroke="url(#intro-cream)"
            stroke-width="1.4"
            stroke-linecap="round"
            fill="none"
            opacity="0.65"
          />

          <!-- Highlight accents -->
          <circle class="layer-highlight" cx="82" cy="182" r="2.5" fill="#f5f0ff" opacity="0" />
          <circle class="layer-highlight" cx="120" cy="180" r="2" fill="#e9d5ff" opacity="0" />
          <circle class="layer-highlight" cx="158" cy="182" r="2.5" fill="#f5f0ff" opacity="0" />
          <circle class="layer-highlight" cx="100" cy="152" r="1.8" fill="#e9d5ff" opacity="0" />
          <circle class="layer-highlight" cx="140" cy="152" r="1.8" fill="#e9d5ff" opacity="0" />

          <!-- Three candles -->
          <line class="layer-candle draw-line" x1="92" y1="114" x2="92" y2="82" stroke="url(#intro-stroke)" stroke-width="1.4" stroke-linecap="round" />
          <line class="layer-candle draw-line" x1="120" y1="114" x2="120" y2="76" stroke="url(#intro-stroke)" stroke-width="1.5" stroke-linecap="round" />
          <line class="layer-candle draw-line" x1="148" y1="114" x2="148" y2="82" stroke="url(#intro-stroke)" stroke-width="1.4" stroke-linecap="round" />

          <!-- Flames (light one by one) -->
          <g class="layer-flame" style="transform-origin: 92px 80px">
            <path d="M92 82 C88 74 89 64 92 58 C95 64 96 74 92 82Z" fill="url(#intro-flame-grad)" filter="url(#intro-cake-glow)" />
            <path d="M92 80 C90 74 91 68 92 64 C93 68 94 74 92 80Z" fill="#fef9c3" opacity="0.85" />
          </g>
          <g class="layer-flame" style="transform-origin: 120px 74px">
            <path d="M120 76 C116 66 117 54 120 46 C123 54 124 66 120 76Z" fill="url(#intro-flame-grad)" filter="url(#intro-cake-glow)" />
            <path d="M120 74 C118 66 119 58 120 52 C121 58 122 66 120 74Z" fill="#fef9c3" opacity="0.9" />
          </g>
          <g class="layer-flame" style="transform-origin: 148px 80px">
            <path d="M148 82 C144 74 145 64 148 58 C151 64 152 74 148 82Z" fill="url(#intro-flame-grad)" filter="url(#intro-cake-glow)" />
            <path d="M148 80 C146 74 147 68 148 64 C149 68 150 74 148 80Z" fill="#fef9c3" opacity="0.85" />
          </g>
        </svg>
      </div>

      <!-- Text — hidden until cake sequence completes -->
      <div ref="textStageRef" class="intro-text max-w-xl opacity-0">
        <p
          ref="lineHappyRef"
          class="font-display text-glow mb-3 text-2xl font-medium tracking-[0.22em] text-soft-white opacity-0 md:text-4xl"
        >
          Happy Birthday
        </p>
        <p
          ref="lineNemaRef"
          class="font-display mb-8 text-3xl font-medium text-lavender opacity-0 md:text-5xl"
        >
          Nema <span class="text-primary/90">❤️</span>
        </p>
        <p
          ref="dateRef"
          class="font-display text-glow mb-3 text-4xl font-medium tracking-[0.28em] text-lavender opacity-0 md:text-6xl"
        >
          24 <span class="mx-2 text-primary/50">•</span> 05
        </p>
        <p
          ref="subRef"
          class="text-xs font-light tracking-[0.32em] text-lavender/45 uppercase opacity-0"
        >
          A very important day.
        </p>
      </div>
    </div>

    <!-- Vignette -->
    <div
      class="pointer-events-none absolute inset-0"
      style="background: radial-gradient(ellipse at center, transparent 35%, #0a0614 100%)"
      aria-hidden="true"
    />
  </section>
</template>

<style scoped>
.birthday-intro {
  isolation: isolate;
}

.intro-camera {
  transform-origin: center 42%;
  will-change: transform;
}

.intro-cake-stage {
  transform-origin: center center;
  will-change: transform;
}

.intro-sparkle {
  animation: intro-sparkle 4s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(216, 180, 254, 0.45);
}

.layer-flame {
  opacity: 0;
}

.layer-flame.flame-lit {
  animation: flame-flicker 2.4s ease-in-out infinite;
}

.draw-line {
  fill: none;
}

@keyframes intro-sparkle {
  0%,
  100% {
    opacity: 0.15;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(1.35);
  }
}

@keyframes flame-flicker {
  0%,
  100% {
    transform: scale(1) translateY(0);
  }
  35% {
    transform: scale(1.04, 0.96) translateY(-1px);
  }
  65% {
    transform: scale(0.97, 1.03) translateY(0.5px);
  }
}
</style>
