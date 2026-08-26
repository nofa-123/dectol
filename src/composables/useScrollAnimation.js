/**
 * Scroll-reveal system.
 *
 * One shared IntersectionObserver services the whole page — cheaper than an
 * observer per element and keeps reveal timing consistent between sections.
 * Elements opt in with the `v-reveal` directive:
 *
 *   <div v-reveal>…</div>                    // fade + rise
 *   <div v-reveal="'scale'">…</div>          // named preset
 *   <div v-reveal="{ preset: 'start', delay: 120 }">…</div>
 *
 * Reduced-motion users get the content immediately with no transform.
 */

import { onBeforeUnmount, onMounted, ref } from 'vue'
import { prefersReducedMotion } from '@/utils/motion'

const PRESETS = new Set(['up', 'down', 'start', 'end', 'scale', 'fade'])

let observer = null

function getObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.setAttribute('data-revealed', '')
        observer.unobserve(entry.target)
      }
    },
    // Fire slightly before the element is fully on screen so the motion has
    // finished by the time the user's eye lands on it.
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
  )
  return observer
}

export const vReveal = {
  mounted(el, binding) {
    const value = binding.value ?? {}
    const preset = typeof value === 'string' ? value : (value.preset ?? 'up')
    const delay = typeof value === 'object' ? (value.delay ?? 0) : 0

    el.setAttribute('data-reveal', PRESETS.has(preset) ? preset : 'up')
    if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`)

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      el.setAttribute('data-revealed', '')
      return
    }
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}

/**
 * Imperative variant for components that need to know when they entered view
 * (counters, timelines, lazily-started animations).
 */
export function useInView(options = {}) {
  const target = ref(null)
  const isInView = ref(false)
  let localObserver = null

  onMounted(() => {
    if (!target.value) return
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      isInView.value = true
      return
    }
    localObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          if (options.once === false) isInView.value = false
          return
        }
        isInView.value = true
        if (options.once !== false) localObserver?.disconnect()
      },
      { threshold: options.threshold ?? 0.25, rootMargin: options.rootMargin ?? '0px' },
    )
    localObserver.observe(target.value)
  })

  onBeforeUnmount(() => localObserver?.disconnect())

  return { target, isInView }
}

/**
 * Lightweight parallax: translates an element as it crosses the viewport.
 * Reads layout in a rAF tick and writes only transforms, so it never triggers
 * layout thrash during scroll.
 */
export function useParallax(strength = 24) {
  const target = ref(null)
  let frame = 0
  let active = false

  function update() {
    frame = 0
    const el = target.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    const viewport = window.innerHeight
    if (rect.bottom < -200 || rect.top > viewport + 200) return
    // -1 at the bottom of the viewport, +1 at the top.
    const progress = 1 - (rect.top + rect.height / 2) / (viewport / 2 + rect.height / 2)
    el.style.transform = `translate3d(0, ${(-progress * strength).toFixed(2)}px, 0)`
  }

  function onScroll() {
    if (frame) return
    frame = requestAnimationFrame(update)
  }

  onMounted(() => {
    if (prefersReducedMotion()) return
    active = true
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    update()
  })

  onBeforeUnmount(() => {
    if (!active) return
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    if (frame) cancelAnimationFrame(frame)
  })

  return { target }
}
