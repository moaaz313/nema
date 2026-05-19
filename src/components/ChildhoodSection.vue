<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { assetUrl } from '../lib/assetUrl.js'

gsap.registerPlugin(ScrollTrigger)

const sectionRef = ref(null)
const openerLine1Ref = ref(null)
const openerLine2Ref = ref(null)
const memory1Ref = ref(null)
const polaroid1Ref = ref(null)
const image1Ref = ref(null)
const text1aRef = ref(null)
const text1bRef = ref(null)
const memory2Ref = ref(null)
const polaroid2Ref = ref(null)
const image2Ref = ref(null)
const text2aRef = ref(null)
const text2bRef = ref(null)
const outroTextRef = ref(null)

const photo1 = { src: assetUrl('/images/childhood-1.png'), alt: 'Nema childhood memory', rotate: -3.5 }
const photo2 = { src: assetUrl('/images/childhood-2.png'), alt: 'Nema childhood memory', rotate: 3 }

/** Early trigger — element animates as soon as it enters view */
const SCROLL_START = 'top 92%'
const POP = { duration: 0.85, ease: 'power2.out' }
const TEXT = { duration: 0.7, ease: 'power2.out' }

/** @type {import('gsap').Tween | null} */
let floatTween1 = null
/** @type {import('gsap').Tween | null} */
let floatTween2 = null
/** @type {import('gsap').ScrollTrigger[]} */
const triggers = []

/**
 * Memory pop-in: fade, slight rise, scale 0.95 → 1
 * @param {HTMLElement} container
 * @param {object} els
 */
function bindMemoryReveal(container, { polaroid, image, texts, rotate, onDone }) {
  gsap.set([polaroid, ...texts], { opacity: 0 })
  gsap.set(image, { scale: 0.95 })

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: SCROLL_START,
      once: true,
    },
    onComplete: onDone,
  })
  if (tl.scrollTrigger) triggers.push(tl.scrollTrigger)

  tl.fromTo(
    polaroid,
    { opacity: 0, y: 22, scale: 0.95, rotation: rotate + (rotate > 0 ? 2 : -2) },
    { opacity: 1, y: 0, scale: 1, rotation: rotate, ...POP },
  )
  tl.fromTo(image, { scale: 0.95 }, { scale: 1, duration: 1, ease: 'power1.out' }, '-=0.55')
  tl.fromTo(texts[0], { opacity: 0, y: 12 }, { opacity: 1, y: 0, ...TEXT }, '-=0.5')
  tl.fromTo(texts[1], { opacity: 0, y: 10 }, { opacity: 1, y: 0, ...TEXT }, '-=0.35')

  return tl
}

function startFloat(el, duration = 3.2) {
  return gsap.to(el, {
    y: -5,
    duration,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  })
}

onMounted(() => {
  if (!sectionRef.value) return

  gsap.set([openerLine1Ref.value, openerLine2Ref.value, outroTextRef.value], { opacity: 0 })

  // Opener — quick, continuous
  const openerTl = gsap.timeline({
    scrollTrigger: { trigger: sectionRef.value, start: SCROLL_START, once: true },
  })
  if (openerTl.scrollTrigger) triggers.push(openerTl.scrollTrigger)

  openerTl.fromTo(
    openerLine1Ref.value,
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
  )
  openerTl.fromTo(
    openerLine2Ref.value,
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' },
    '-=0.4',
  )

  bindMemoryReveal(memory1Ref.value, {
    polaroid: polaroid1Ref.value,
    image: image1Ref.value,
    texts: [text1aRef.value, text1bRef.value],
    rotate: photo1.rotate,
    onDone: () => { floatTween1 = startFloat(polaroid1Ref.value) },
  })

  bindMemoryReveal(memory2Ref.value, {
    polaroid: polaroid2Ref.value,
    image: image2Ref.value,
    texts: [text2aRef.value, text2bRef.value],
    rotate: photo2.rotate,
    onDone: () => { floatTween2 = startFloat(polaroid2Ref.value, 3.6) },
  })

  const outroTl = gsap.timeline({
    scrollTrigger: { trigger: outroTextRef.value, start: SCROLL_START, once: true },
  })
  if (outroTl.scrollTrigger) triggers.push(outroTl.scrollTrigger)

  outroTl.fromTo(
    outroTextRef.value,
    { opacity: 0, y: 14 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
  )
})

onUnmounted(() => {
  floatTween1?.kill()
  floatTween2?.kill()
  triggers.forEach((st) => st.kill())
})
</script>

<template>
  <section
    ref="sectionRef"
    class="memory-reveal relative px-6"
    aria-label="Childhood memories for Nema"
  >
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg-dark to-transparent"
      aria-hidden="true"
    />

    <!-- Opener -->
    <div class="memory-block flex flex-col items-center justify-center py-14 text-center md:py-16">
      <p
        ref="openerLine1Ref"
        class="font-display mb-3 text-xl font-medium text-soft-white/90 md:text-2xl"
      >
        قبل أي حاجة…
      </p>
      <p
        ref="openerLine2Ref"
        class="max-w-md text-base font-light leading-relaxed text-lavender/85 md:text-lg"
        dir="rtl"
      >
        يلا أوريكي حاجة من الأول
      </p>
    </div>

    <!-- Memory 1 -->
    <div
      ref="memory1Ref"
      class="memory-block flex flex-col items-center py-10 md:py-12"
    >
      <div
        ref="polaroid1Ref"
        class="memory-polaroid group relative"
        :style="{ transform: `rotate(${photo1.rotate}deg)` }"
      >
        <div class="absolute -top-6 left-1/2 h-6 w-px -translate-x-1/2 bg-lavender/25" />
        <div
          class="absolute -top-8 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-lavender/35 shadow-[0_0_10px_rgba(216,180,254,0.35)]"
        />

        <div
          class="glass-strong memory-card relative overflow-hidden rounded-sm p-3 pb-4 shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_32px_rgba(168,85,247,0.1)]"
          style="width: min(280px, 86vw)"
        >
          <div class="relative aspect-[4/5] overflow-hidden bg-bg-dark">
            <img
              ref="image1Ref"
              :src="photo1.src"
              :alt="photo1.alt"
              class="h-full w-full object-cover will-change-transform"
              style="transform-origin: center center"
              loading="lazy"
            />
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-dark/45 via-transparent to-lavender/5"
            />
            <div class="pointer-events-none absolute inset-0 ring-1 ring-inset ring-lavender/10" />
          </div>
        </div>
      </div>

      <div class="memory-copy mt-7 max-w-md space-y-2.5 text-center" dir="rtl">
        <p
          ref="text1aRef"
          class="text-[0.95rem] font-light leading-relaxed text-lavender/90 md:text-base"
        >
          يبسبوسه… إيه الصغنطوطة دي 😭
        </p>
        <p
          ref="text1bRef"
          class="text-sm font-light leading-relaxed text-lavender/60 md:text-[0.95rem]"
        >
         كتكوتة من يومك يبت
        </p>
      </div>
    </div>

    <!-- Soft bridge — no pause act, just breath -->
    <div class="memory-bridge mx-auto h-px w-12 bg-lavender/15" aria-hidden="true" />

    <!-- Memory 2 -->
    <div
      ref="memory2Ref"
      class="memory-block flex flex-col items-center py-10 md:py-12"
    >
      <div
        ref="polaroid2Ref"
        class="memory-polaroid group relative"
        :style="{ transform: `rotate(${photo2.rotate}deg)` }"
      >
        <div class="absolute -top-6 left-1/2 h-6 w-px -translate-x-1/2 bg-lavender/25" />
        <div
          class="absolute -top-8 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-lavender/35 shadow-[0_0_10px_rgba(216,180,254,0.35)]"
        />

        <div
          class="glass-strong memory-card relative overflow-hidden rounded-sm p-3 pb-4 shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_32px_rgba(168,85,247,0.1)]"
          style="width: min(280px, 86vw)"
        >
          <div class="relative aspect-[4/5] overflow-hidden bg-bg-dark">
            <img
              ref="image2Ref"
              :src="photo2.src"
              :alt="photo2.alt"
              class="h-full w-full object-cover will-change-transform"
              style="transform-origin: center center"
              loading="lazy"
            />
            <div
              class="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg-dark/45 via-transparent to-lavender/5"
            />
            <div class="pointer-events-none absolute inset-0 ring-1 ring-inset ring-lavender/10" />
          </div>
        </div>
      </div>

      <div class="memory-copy mt-7 max-w-md space-y-2.5 text-center" dir="rtl">
        <p
          ref="text2aRef"
          class="text-[0.95rem] font-light leading-relaxed text-lavender/90 md:text-base"
        >
         صغنطوطة كده ومش مستوعبة إني هبقى متعلق بيها بعدين
        </p>
        <p
          ref="text2bRef"
          class="text-sm font-light leading-relaxed text-lavender/60 md:text-[0.95rem]"
        >
        عجله من وانتي قد كدا 
        </p>
      </div>
    </div>

    <!-- Outro -->
    <div class="memory-block flex flex-col items-center py-12 pb-20 text-center md:py-14">
      <p
        ref="outroTextRef"
        class="text-lg font-light text-lavender/65 md:text-xl"
        dir="rtl"
      >
        يلا نكمل شويه…
      </p>
      <div class="mt-6 h-px w-16 bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
    </div>

    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-bg-dark to-transparent"
      aria-hidden="true"
    />
  </section>
</template>

<style scoped>
.memory-reveal {
  isolation: isolate;
}

.memory-block {
  position: relative;
  z-index: 1;
}

.memory-bridge {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

.memory-polaroid {
  transform-origin: center center;
  will-change: transform, opacity;
}

.memory-card {
  transition: box-shadow 0.5s ease;
}

.memory-polaroid:hover .memory-card {
  box-shadow:
    0 24px 56px rgba(0, 0, 0, 0.45),
    0 0 40px rgba(168, 85, 247, 0.15);
}

.memory-copy p {
  text-shadow: 0 0 24px rgba(168, 85, 247, 0.06);
}
</style>
