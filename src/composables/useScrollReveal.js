import { onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function useScrollReveal(containerRef, selector = '.reveal') {
  let ctx

  onMounted(() => {
    if (!containerRef.value) return

    ctx = gsap.context(() => {
      gsap.utils.toArray(selector).forEach((el) => {
        gsap.from(el, {
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          y: 40,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out',
        })
      })
    }, containerRef.value)
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}

export function revealElement(el, options = {}) {
  if (!el) return

  const { y = 50, duration = 1.2, delay = 0 } = options

  gsap.from(el, {
    y,
    opacity: 0,
    duration,
    delay,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    },
  })
}
