/**
 * Viewport helpers backed by matchMedia (not resize listeners) so components
 * only re-render when a breakpoint is actually crossed.
 * Breakpoints match the CSS: 390 / 768 / 1024 / 1440 / 1920.
 */

import { onBeforeUnmount, onMounted, ref } from 'vue'

export const BREAKPOINTS = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1440,
  xxl: 1920,
}

/** Reactive `matchMedia` for an arbitrary query. */
export function useMediaQuery(query) {
  const matches = ref(false)
  let mql = null

  const onChange = (event) => {
    matches.value = event.matches
  }

  onMounted(() => {
    mql = window.matchMedia(query)
    matches.value = mql.matches
    mql.addEventListener('change', onChange)
  })

  onBeforeUnmount(() => mql?.removeEventListener('change', onChange))

  return matches
}

export function useResponsive() {
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.md - 1}px)`)
  const isTablet = useMediaQuery(
    `(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`,
  )
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`)
  const isWide = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`)
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const canHover = useMediaQuery('(hover: hover) and (pointer: fine)')

  return { isMobile, isTablet, isDesktop, isWide, prefersReducedMotion, canHover }
}

/** Tracks window scroll offset and direction, throttled to one rAF per frame. */
export function useScrollPosition() {
  const y = ref(0)
  const direction = ref('down')
  let frame = 0
  let last = 0

  function read() {
    frame = 0
    const next = window.scrollY
    direction.value = next > last ? 'down' : 'up'
    last = next
    y.value = next
  }

  function onScroll() {
    if (frame) return
    frame = requestAnimationFrame(read)
  }

  onMounted(() => {
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    if (frame) cancelAnimationFrame(frame)
  })

  return { y, direction }
}
