<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps({
  image: { type: String, required: true },
  lines: { type: Array, required: true },
  index: { type: Number, default: 0 },
  isLast: { type: Boolean, default: false },
  alt: { type: String, default: 'A moment with Nema' },
})

const sectionRef = ref(null)
const chapterRef = ref(null)
const cardRef = ref(null)
const imageRef = ref(null)
const textWrapRef = ref(null)
const glowRef = ref(null)
const blurRef = ref(null)
const lineRefs = ref([])

/** Appear slightly earlier for a smoother scroll feel */
const SCROLL_START = 'top 88%'
const REVEAL = { duration: 1.2, ease: 'power3.out' }
const TEXT_REVEAL = { duration: 0.82, ease: 'power2.out' }

/** @type {import('gsap').Tween | null} */
let floatTween = null
/** @type {import('gsap').ScrollTrigger[]} */
const triggers = []

const normalizedLines = computed(() =>
  props.lines.map((line) => String(line).replace(/\\n/g, '\n')),
)

function setLineRef(el, i) {
  if (el) lineRefs.value[i] = el
}

function startFloat(el) {
  return gsap.to(el, {
    y: -5,
    duration: 3.8 + props.index * 0.12,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  })
}

onMounted(async () => {
  await nextTick()
  if (!sectionRef.value || !cardRef.value || !imageRef.value) return

  const texts = lineRefs.value.filter(Boolean)
  gsap.set(cardRef.value, { opacity: 0, y: 26, scale: 0.96, filter: 'blur(6px)' })
  gsap.set(imageRef.value, { scale: 0.98, opacity: 0.92 })
  gsap.set(texts, { opacity: 0, y: 12 })
  if (textWrapRef.value) gsap.set(textWrapRef.value, { opacity: 1 })
  if (blurRef.value) gsap.set(blurRef.value, { opacity: 0.2, scale: 0.92 })

  const revealTl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.value,
      start: SCROLL_START,
      once: true,
    },
    onComplete: () => {
      floatTween = startFloat(cardRef.value)
    },
  })
  if (revealTl.scrollTrigger) triggers.push(revealTl.scrollTrigger)

  revealTl.fromTo(
    blurRef.value,
    { opacity: 0.2, scale: 0.92 },
    { opacity: 0.45, scale: 1, duration: 1.35, ease: 'power2.out' },
    0,
  )
  revealTl.fromTo(
    cardRef.value,
    { opacity: 0, y: 26, scale: 0.96, filter: 'blur(6px)' },
    { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', ...REVEAL },
    0.05,
  )
  revealTl.fromTo(
    imageRef.value,
    { scale: 0.98, opacity: 0.92 },
    { scale: 1, opacity: 1, duration: 1.35, ease: 'power1.out' },
    '-=0.95',
  )

  texts.forEach((lineEl, i) => {
    revealTl.fromTo(
      lineEl,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, ...TEXT_REVEAL },
      i === 0 ? '-=0.65' : `+=${0.14}`,
    )
  })

  const parallax = ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1.6,
    onUpdate: (self) => {
      const drift = (self.progress - 0.5) * 2
      gsap.set(imageRef.value, { y: drift * 6 })
      if (blurRef.value) gsap.set(blurRef.value, { y: drift * 14 })
    },
  })
  triggers.push(parallax)

  if (glowRef.value) {
    const glowPulse = gsap.to(glowRef.value, {
      opacity: 0.55,
      duration: 3.4 + props.index * 0.18,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
    triggers.push({ kill: () => glowPulse.kill() })
  }
})

onUnmounted(() => {
  floatTween?.kill()
  triggers.forEach((t) => t.kill?.())
})
</script>

<template>
  <section
    ref="sectionRef"
    class="memory-chapter relative flex items-center justify-center overflow-hidden px-5"
    :class="
      isLast
        ? 'min-h-[76vh] pb-10 pt-12 md:min-h-[78vh] md:pb-14 md:pt-14'
        : 'min-h-[76vh] py-12 md:min-h-[78vh] md:py-14'
    "
  >
    <div
      ref="blurRef"
      class="pointer-events-none absolute left-1/2 top-[42%] h-[52vh] w-[min(90vw,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[80px] md:top-1/2"
      style="background: radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, transparent 68%)"
      aria-hidden="true"
    />

    <div
      ref="glowRef"
      class="pointer-events-none absolute inset-0 opacity-30"
      aria-hidden="true"
    >
      <div
        class="absolute left-1/2 top-[42%] h-[48vh] w-[min(85vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px] md:top-1/2"
        style="background: radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)"
      />
    </div>

    <div
      ref="chapterRef"
      class="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center gap-7 md:max-w-xl md:gap-8"
    >
      <div ref="cardRef" class="memory-card relative w-full will-change-transform">
        <div class="glass-strong glow-purple memory-card__frame overflow-hidden rounded-2xl p-1.5 shadow-2xl">
          <div class="relative aspect-[3/4] overflow-hidden rounded-xl md:aspect-[4/5]">
            <img
              ref="imageRef"
              :src="image"
              :alt="alt"
              class="h-full w-full object-cover will-change-transform"
              loading="lazy"
            />
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-dark/55 via-transparent to-bg-dark/10"
            />
          </div>
        </div>

        <div
          v-for="n in 4"
          :key="n"
          class="pointer-events-none absolute rounded-full bg-lavender/25"
          :style="{
            width: `${2 + n}px`,
            height: `${2 + n}px`,
            top: `${8 + n * 14}%`,
            left: n % 2 === 0 ? '-6px' : 'auto',
            right: n % 2 === 1 ? '-6px' : 'auto',
            animation: `float-slow ${4.5 + n * 0.4}s ease-in-out infinite`,
            animationDelay: `${n * 0.25 + index * 0.1}s`,
          }"
          aria-hidden="true"
        />
      </div>

      <div
        ref="textWrapRef"
        class="memory-text flex w-full flex-col items-center gap-3.5 text-center md:gap-4"
        dir="rtl"
      >
        <p
          v-for="(line, i) in normalizedLines"
          :key="i"
          :ref="(el) => setLineRef(el, i)"
          class="font-body text-base leading-relaxed text-lavender/92 whitespace-pre-line md:text-lg md:leading-loose"
          :class="i === 0 ? 'max-w-md' : 'max-w-lg text-lavender/78'"
        >
          {{ line }}
        </p>
      </div>
    </div>

    <div
      v-if="isLast"
      class="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg-dark/80 to-transparent"
      aria-hidden="true"
    />
  </section>
</template>

<style scoped>
.memory-card__frame {
  box-shadow:
    0 0 60px rgba(168, 85, 247, 0.18),
    0 0 120px rgba(168, 85, 247, 0.08),
    0 24px 48px rgba(0, 0, 0, 0.35);
  transition: box-shadow 0.6s ease;
}

.memory-chapter + .memory-chapter::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: min(50%, 10rem);
  height: 1px;
  transform: translateX(-50%);
  background: linear-gradient(
    90deg,
    transparent,
    rgba(216, 180, 254, 0.1) 50%,
    transparent
  );
  pointer-events: none;
}
</style>
