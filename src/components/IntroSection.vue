<script setup>
import { ref, onMounted } from 'vue'
import gsap from 'gsap'

const sectionRef = ref(null)
const line1Ref = ref(null)
const line2Ref = ref(null)
const scrollLines = [
  'You became part of my everyday life.',
  'Some people change your whole mood just by existing.',
  'Still my favorite notification.',
]

const visibleLines = ref([])

onMounted(() => {
  const tl = gsap.timeline({ delay: 0.5 })

  if (line1Ref.value) {
    tl.from(line1Ref.value, {
      opacity: 0,
      y: 30,
      duration: 1.4,
      ease: 'power3.out',
    })
  }

  if (line2Ref.value) {
    tl.from(
      line2Ref.value,
      {
        opacity: 0,
        y: 20,
        duration: 1.2,
        ease: 'power3.out',
      },
      '-=0.6',
    )
  }

  scrollLines.forEach((_, i) => {
    tl.call(
      () => {
        visibleLines.value.push(scrollLines[i])
      },
      null,
      `+=${i === 0 ? 1.5 : 2}`,
    )
  })
})
</script>

<template>
  <section
    ref="sectionRef"
    class="relative flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center"
  >
    <div class="relative z-10 max-w-2xl">
      <h1
        ref="line1Ref"
        class="font-display text-glow mb-6 text-4xl font-medium leading-tight text-soft-white md:text-6xl lg:text-7xl"
      >
        Happy Birthday, Nema ❤️
      </h1>

      <p
        ref="line2Ref"
        class="text-lg font-light leading-relaxed text-lavender/90 md:text-xl"
      >
        I wanted to make you something that feels like you.
      </p>

      <div class="mt-20 space-y-8">
        <p
          v-for="(line, i) in visibleLines"
          :key="i"
          class="reveal font-display text-base italic text-lavender/60 md:text-lg"
          style="animation: fadeIn 1s ease forwards"
        >
          {{ line }}
        </p>
      </div>
    </div>

    <div class="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-40">
      <div
        class="h-8 w-5 rounded-full border border-lavender/30"
        style="animation: float-slow 3s ease-in-out infinite"
      >
        <div
          class="mx-auto mt-2 h-1.5 w-1 rounded-full bg-lavender/50"
          style="animation: pulse-glow 2s ease-in-out infinite"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
