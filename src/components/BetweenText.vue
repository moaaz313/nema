<script setup>
import { ref, onMounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

defineProps({
  text: { type: String, required: true },
})

const elRef = ref(null)

onMounted(() => {
  if (!elRef.value) return
  gsap.from(elRef.value, {
    scrollTrigger: {
      trigger: elRef.value,
      start: 'top 85%',
    },
    opacity: 0,
    y: 30,
    duration: 1,
    ease: 'power3.out',
  })
})
</script>

<template>
  <div ref="elRef" class="relative z-10 px-8 py-16 text-center md:py-24">
    <p
      class="font-body mx-auto max-w-lg text-lg leading-relaxed text-lavender/90 md:text-xl"
      dir="rtl"
    >
      {{ text }}
    </p>
  </div>
</template>
