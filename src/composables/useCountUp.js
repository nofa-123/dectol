/**
 * Animated counter that starts when its element scrolls into view.
 * Uses a single rAF loop with an ease-out curve, and snaps straight to the
 * final value for reduced-motion users.
 */

import { onScopeDispose, ref, watch } from 'vue'
import { useInView } from '@/composables/useScrollAnimation'
import { prefersReducedMotion } from '@/utils/motion'

const easeOutExpo = (t) => (t === 1 ? 1 : 1 - 2 ** (-10 * t))

export function useCountUp(target, { duration = 1600, decimals = 0, delay = 0 } = {}) {
  const { target: el, isInView } = useInView({ threshold: 0.35 })
  const displayed = ref(0)
  let frame = 0

  function run() {
    if (prefersReducedMotion()) {
      displayed.value = target
      return
    }
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration)
      const value = target * easeOutExpo(progress)
      displayed.value = decimals ? Number(value.toFixed(decimals)) : Math.round(value)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
  }

  watch(isInView, (visible) => {
    if (!visible) return
    if (frame) cancelAnimationFrame(frame)
    if (delay) setTimeout(run, delay)
    else run()
  })

  onScopeDispose(() => {
    if (frame) cancelAnimationFrame(frame)
  })

  return { el, displayed, isInView }
}

/** Live countdown to an ISO timestamp; ticks once per second. */
export function useCountdown(endsAt) {
  const parts = ref({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false })
  let timer = 0

  function tick() {
    const diff = Math.max(0, new Date(endsAt).getTime() - Date.now())
    const total = Math.floor(diff / 1000)
    parts.value = {
      expired: diff === 0,
      days: Math.floor(total / 86400),
      hours: Math.floor((total % 86400) / 3600),
      minutes: Math.floor((total % 3600) / 60),
      seconds: total % 60,
    }
    if (diff === 0 && timer) {
      clearInterval(timer)
      timer = 0
    }
  }

  tick()
  timer = setInterval(tick, 1000)

  const stop = () => {
    if (timer) clearInterval(timer)
    timer = 0
  }

  onScopeDispose(stop)

  return { parts, stop }
}
