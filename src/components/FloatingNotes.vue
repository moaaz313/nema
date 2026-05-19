<script setup>
const notes = [
  { text: 'ينيما انتي لطيفة زيادة عن اللزوم', side: 'left', top: '18%', delay: '0s' },
  { text: 'لسه بابتسم لما أشوف اسمك', side: 'right', top: '32%', delay: '2s' },
  { text: 'tota فاكرة نفسها؟ 😭', side: 'left', top: '48%', delay: '4s' },
  { text: 'y nema — still hits different', side: 'right', top: '62%', delay: '1s' },
  { text: 'مستقبل دكتورة ولسه بتتوتر من رسالة', side: 'left', top: '76%', delay: '3s' },
  { text: 'bsbosa mode: on', side: 'right', top: '88%', delay: '5s' },
  { text: 'ytota knows', side: 'left', top: '92%', delay: '2.5s' },
]
</script>

<template>
  <section class="pointer-events-none relative z-20 hidden min-h-[40vh] md:block">
    <div
      v-for="(note, i) in notes"
      :key="i"
      class="glass absolute max-w-[200px] rounded-2xl px-4 py-3 text-xs leading-relaxed text-lavender/80 shadow-lg"
      :class="note.side === 'left' ? 'left-4 lg:left-8' : 'right-4 lg:right-8'"
      :style="{
        top: note.top,
        animation: `float-slow ${8 + i}s ease-in-out infinite`,
        animationDelay: note.delay,
      }"
      dir="rtl"
    >
      {{ note.text }}
    </div>
  </section>

  <!-- Mobile: inline scattered notes between sections -->
  <div class="relative z-20 px-6 py-8 md:hidden">
    <div class="flex flex-wrap justify-center gap-3">
      <span
        v-for="(note, i) in notes.slice(0, 4)"
        :key="i"
        class="glass rounded-full px-4 py-2 text-xs text-lavender/70"
        dir="rtl"
      >
        {{ note.text }}
      </span>
    </div>
  </div>
</template>
