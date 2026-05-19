<script setup>
import { ref } from 'vue'
import { useAudio } from '../composables/useAudio.js'

const emit = defineEmits(['unlock'])
const { startMusicOnGesture } = useAudio()

const password = ref('')
const shaking = ref(false)
const unlocking = ref(false)
const error = ref(false)

const CORRECT = 'nema245'

function submit() {
  if (unlocking.value) return

  if (password.value === CORRECT) {
    unlocking.value = true
    error.value = false
    startMusicOnGesture()
    setTimeout(() => emit('unlock'), 800)
  } else {
    error.value = true
    shaking.value = true
    password.value = ''
    setTimeout(() => {
      shaking.value = false
    }, 500)
  }
}

function onKeydown(e) {
  if (e.key === 'Enter') submit()
}
</script>

<template>
  <section
    class="password-screen fixed inset-0 z-50 flex min-h-screen items-center justify-center px-6"
    :class="{ 'password-screen--unlocking': unlocking }"
  >
    <div
      class="glass glow-purple password-card relative w-full max-w-sm rounded-3xl p-8 transition-shadow duration-500 md:p-10"
      :class="{ shake: shaking, 'password-card--unlocking': unlocking }"
    >
      <div
        class="absolute -inset-px rounded-3xl opacity-50"
        style="background: linear-gradient(135deg, rgba(168,85,247,0.3), transparent, rgba(216,180,254,0.2))"
      />

      <div class="relative text-center">
        <p class="font-display mb-2 text-2xl font-medium tracking-wide text-soft-white md:text-3xl">
          For Nema only ✨
        </p>
        <p class="mb-8 text-sm font-light text-lavender/70">
          something made just for you
        </p>

        <div class="relative">
          <input
            v-model="password"
            type="password"
            placeholder="•••••••"
            autocomplete="off"
            class="password-input w-full rounded-2xl border border-lavender/20 bg-white/5 px-5 py-4 text-center font-body text-soft-white placeholder-lavender/30 outline-none transition-all duration-300 hover:border-lavender/35 hover:bg-white/[0.07] focus:border-primary/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-primary/25 focus:shadow-[0_0_28px_rgba(168,85,247,0.15)]"
            :class="{ 'border-red-400/40': error }"
            @keydown="onKeydown"
          />
        </div>

        <p
          v-if="error"
          class="mt-3 text-xs text-lavender/50 transition-opacity"
        >
          not quite, try again
        </p>

        <button
          type="button"
          class="password-btn mt-6 w-full rounded-2xl bg-primary/80 py-3.5 text-sm font-medium tracking-wide text-white transition-all duration-300 hover:bg-primary hover:shadow-[0_0_36px_rgba(168,85,247,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-dark active:scale-[0.98]"
          @click="submit"
        >
          enter
        </button>
      </div>
    </div>
  </section>
</template>
