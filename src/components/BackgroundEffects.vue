<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  petals: { type: Boolean, default: true },
  intensity: { type: String, default: 'normal' }, // low | normal | high
})

const canvasRef = ref(null)
let animationId = null
let stars = []

function initStars(width, height, count) {
  stars = []
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.2 + 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.15 + 0.05,
      twinkle: Math.random() * Math.PI * 2,
    })
  }
}

function drawStars(ctx, width, height, time) {
  ctx.clearRect(0, 0, width, height)
  stars.forEach((star) => {
    const twinkle = Math.sin(time * 0.001 + star.twinkle) * 0.3 + 0.7
    ctx.beginPath()
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(216, 180, 254, ${star.opacity * twinkle})`
    ctx.fill()
    star.y -= star.speed
    if (star.y < -5) {
      star.y = height + 5
      star.x = Math.random() * width
    }
  })
}

function animate(time) {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const { width, height } = canvas
  drawStars(ctx, width, height, time)
  animationId = requestAnimationFrame(animate)
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const count =
    props.intensity === 'high' ? 120 : props.intensity === 'low' ? 50 : 80
  initStars(canvas.width, canvas.height, count)
}

const petalCount = props.intensity === 'high' ? 22 : 16
const fallingPetals = Array.from({ length: petalCount }, (_, i) => {
  const isLily = i % 3 !== 2 // ~2/3 lily, ~1/3 rose
  return {
    id: i,
    type: isLily ? 'lily' : 'rose',
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 18}s`,
    duration: `${22 + Math.random() * 16}s`,
    size: isLily ? 10 + Math.random() * 8 : 7 + Math.random() * 8,
    opacity: isLily ? 0.2 + Math.random() * 0.25 : 0.25 + Math.random() * 0.3,
    drift: `${-20 + Math.random() * 40}px`,
  }
})

const bgLilies = [
  { top: '8%', left: '-4%', scale: 1.1, opacity: 0.07, blur: 48 },
  { top: '55%', right: '-6%', scale: 0.9, opacity: 0.06, blur: 56 },
  { bottom: '12%', left: '20%', scale: 0.75, opacity: 0.05, blur: 40 },
]

const cornerLilies = [
  { top: '6%', left: '2%', rotate: -12, size: 72 },
  { top: '10%', right: '3%', rotate: 18, size: 64 },
  { bottom: '14%', left: '4%', rotate: 8, size: 56 },
  { bottom: '18%', right: '2%', rotate: -15, size: 68 },
]

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  animationId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
    <!-- Ambient gradient orbs -->
    <div
      class="absolute -top-1/4 left-1/4 h-[50vh] w-[50vh] rounded-full opacity-20 blur-[120px]"
      style="background: radial-gradient(circle, #a855f7 0%, transparent 70%)"
    />
    <div
      class="absolute -bottom-1/4 right-1/4 h-[40vh] w-[40vh] rounded-full opacity-15 blur-[100px]"
      style="background: radial-gradient(circle, #7c3aed 0%, transparent 70%)"
    />

    <!-- Subtle background lilies (5–10% opacity, heavy blur) -->
    <svg
      v-for="(lily, i) in bgLilies"
      :key="'bg-lily-' + i"
      class="absolute text-lavender"
      :class="lily.left !== undefined ? '' : ''"
      :style="{
        top: lily.top,
        left: lily.left,
        right: lily.right,
        bottom: lily.bottom,
        width: `${180 * lily.scale}px`,
        height: `${220 * lily.scale}px`,
        opacity: lily.opacity,
        filter: `blur(${lily.blur}px)`,
        transform: `rotate(${i % 2 === 0 ? -8 : 12}deg)`,
      }"
      viewBox="0 0 120 150"
      fill="none"
    >
      <ellipse cx="60" cy="118" rx="8" ry="28" fill="currentColor" opacity="0.5" />
      <path
        d="M60 95 C45 70 25 55 30 35 C38 50 50 62 60 72 C70 62 82 50 90 35 C95 55 75 70 60 95Z"
        fill="currentColor"
        opacity="0.35"
      />
      <path
        d="M60 72 C52 45 40 25 60 8 C80 25 68 45 60 72Z"
        fill="currentColor"
        opacity="0.45"
      />
      <path
        d="M60 72 C35 58 18 40 22 18 C42 38 52 55 60 72 C68 55 78 38 98 18 C102 40 85 58 60 72Z"
        fill="currentColor"
        opacity="0.3"
      />
      <ellipse cx="60" cy="42" rx="4" ry="6" fill="#f5f0ff" opacity="0.25" />
    </svg>

    <!-- Star canvas -->
    <canvas ref="canvasRef" class="absolute inset-0 h-full w-full" />

    <!-- Falling petals: lily + rose mix -->
    <template v-if="petals">
      <template v-for="petal in fallingPetals" :key="petal.id">
        <!-- Lily petal -->
        <svg
          v-if="petal.type === 'lily'"
          class="petal petal-lily"
          :style="{
            left: petal.left,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
            width: `${petal.size}px`,
            height: `${petal.size * 1.6}px`,
            opacity: petal.opacity,
            '--petal-drift': petal.drift,
          }"
          viewBox="0 0 12 20"
          fill="none"
        >
          <ellipse
            cx="6"
            cy="10"
            rx="4"
            ry="9"
            fill="#f5f0ff"
            opacity="0.85"
            transform="rotate(15 6 10)"
          />
          <ellipse
            cx="6"
            cy="10"
            rx="3"
            ry="8"
            fill="#e9d5ff"
            opacity="0.5"
            transform="rotate(15 6 10)"
          />
        </svg>
        <!-- Rose petal -->
        <svg
          v-else
          class="petal petal-rose"
          :style="{
            left: petal.left,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
            width: `${petal.size}px`,
            height: `${petal.size}px`,
            opacity: petal.opacity,
            '--petal-drift': petal.drift,
          }"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 2C10 6 6 8 4 12c2 4 6 6 8 10 2-4 6-6 8-10-2-4-6-6-8-10z"
            fill="#c084fc"
            opacity="0.8"
          />
        </svg>
      </template>
    </template>

    <!-- Corner lily accents (minimal, soft glow) -->
    <svg
      v-for="(corner, i) in cornerLilies"
      :key="'corner-' + i"
      class="absolute text-lavender/40"
      :style="{
        top: corner.top,
        left: corner.left,
        right: corner.right,
        bottom: corner.bottom,
        width: `${corner.size}px`,
        height: `${corner.size * 1.25}px`,
        transform: `rotate(${corner.rotate}deg)`,
        filter: 'blur(1px) drop-shadow(0 0 20px rgba(168, 85, 247, 0.15))',
        opacity: 0.12,
        animation: `float-slow ${10 + i * 2}s ease-in-out infinite`,
        animationDelay: `${i * 1.5}s`,
      }"
      viewBox="0 0 80 100"
      fill="none"
    >
      <ellipse cx="40" cy="78" rx="5" ry="18" fill="currentColor" opacity="0.6" />
      <path
        d="M40 62 C30 48 18 38 22 24 C28 36 34 44 40 50 C46 44 52 36 58 24 C62 38 50 48 40 62Z"
        fill="currentColor"
        opacity="0.5"
      />
      <path
        d="M40 50 C34 32 28 18 40 6 C52 18 46 32 40 50Z"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M40 50 C24 40 12 28 14 12 C26 28 34 40 40 50 C46 40 54 28 66 12 C68 28 56 40 40 50Z"
        fill="currentColor"
        opacity="0.4"
      />
    </svg>

    <!-- Vignette -->
    <div
      class="absolute inset-0"
      style="background: radial-gradient(ellipse at center, transparent 40%, #0f0a1f 100%)"
    />
  </div>
</template>
