<script setup>
import { ref, onMounted, watch } from 'vue'
import { provideAudio } from './composables/useAudio.js'
import { photoSections } from './data/content.js'

import BackgroundEffects from './components/BackgroundEffects.vue'
import PasswordScreen from './components/PasswordScreen.vue'
import BirthdayIntro from './components/BirthdayIntro.vue'
import IntroSection from './components/IntroSection.vue'
import ChildhoodSection from './components/ChildhoodSection.vue'
import PhotoSection from './components/PhotoSection.vue'
import FinalSection from './components/FinalSection.vue'
import AudioPlayer from './components/AudioPlayer.vue'

/** @type {import('vue').Ref<'password' | 'intro' | 'main'>} */
const phase = ref('password')
const audio = provideAudio()

onMounted(() => {
  audio.init()
})

function onUnlock() {
  phase.value = 'intro'
}

function onIntroComplete() {
  phase.value = 'main'
  window.scrollTo(0, 0)
}

watch(phase, (p) => {
  document.body.style.overflow = p === 'main' ? '' : 'hidden'
}, { immediate: true })
</script>

<template>
  <div class="relative min-h-screen bg-bg-dark text-soft-white">
    <BackgroundEffects :petals="true" intensity="normal" />

    <Transition name="fade">
      <PasswordScreen v-if="phase === 'password'" @unlock="onUnlock" />
    </Transition>

    <BirthdayIntro v-if="phase === 'intro'" @complete="onIntroComplete" />

    <Transition name="intro-to-main">
      <main v-if="phase === 'main'" class="relative z-10">
        <IntroSection />
        <ChildhoodSection />

        <template v-for="(photo, i) in photoSections" :key="i">
          <PhotoSection
            :image="photo.image"
            :lines="photo.lines"
            :index="i"
            :is-last="i === photoSections.length - 1"
          />
        </template>

        <FinalSection />
      </main>
    </Transition>

    <AudioPlayer v-show="phase !== 'password'" />
  </div>
</template>
