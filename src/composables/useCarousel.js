/**
 * Carousel engine shared by offers, reviews, packages and the services rail.
 *
 * Deliberately built on native scroll + scroll-snap rather than a transform
 * track: momentum, snapping and accessibility come free from the platform, and
 * RTL works without mirroring anything. We only add drag-to-scroll for mice,
 * arrow buttons, autoplay and index tracking on top.
 *
 * Note on RTL: in `direction: rtl` containers `scrollLeft` runs 0 → negative,
 * so all arithmetic uses the absolute value and "next" means *decreasing*
 * visual position. `scrollBy` handles the sign for us.
 */

import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { prefersReducedMotion, scrollBehavior } from '@/utils/motion'

export function useCarousel({ autoplay = false, interval = 5200, loop = true } = {}) {
  const track = ref(null)
  const activeIndex = ref(0)
  const canPrev = ref(false)
  const canNext = ref(true)
  const isDragging = ref(false)

  let autoplayTimer = 0
  let paused = false
  let rafId = 0
  let dragStartX = 0
  let dragStartScroll = 0
  let pointerId = null
  let moved = false

  const items = () => Array.from(track.value?.children ?? [])

  function measure() {
    rafId = 0
    const el = track.value
    if (!el) return

    const scroll = Math.abs(el.scrollLeft)
    const max = el.scrollWidth - el.clientWidth
    canPrev.value = scroll > 8
    canNext.value = scroll < max - 8

    // Active item = the child whose *start* edge sits nearest the container's
    // start edge. Comparing client rects keeps this direction-agnostic: the
    // start edge is `right` in RTL and `left` in LTR.
    const children = items()
    if (!children.length) return
    const rtl = getComputedStyle(el).direction === 'rtl'
    const box = el.getBoundingClientRect()
    const containerStart = rtl ? box.right : box.left

    let best = 0
    let bestDelta = Infinity
    children.forEach((child, index) => {
      const rect = child.getBoundingClientRect()
      const delta = Math.abs((rtl ? rect.right : rect.left) - containerStart)
      if (delta < bestDelta) {
        bestDelta = delta
        best = index
      }
    })
    activeIndex.value = best
  }

  function onScroll() {
    if (rafId) return
    rafId = requestAnimationFrame(measure)
  }

  /** Distance of one "page" — the first child's width plus the gap. */
  function step() {
    const el = track.value
    const first = items()[0]
    if (!el || !first) return 320
    const styles = getComputedStyle(el)
    const gap = parseFloat(styles.columnGap || styles.gap || '16') || 16
    return first.getBoundingClientRect().width + gap
  }

  /** +1 in LTR, -1 in RTL — the scrollLeft delta that advances the rail. */
  function advanceSign() {
    const el = track.value
    return el && getComputedStyle(el).direction === 'rtl' ? -1 : 1
  }

  /**
   * Aligns a child with the container's start edge. The visual delta between
   * the two rects equals the required `scrollLeft` delta in both directions,
   * because RTL scroll containers run 0 → −max.
   */
  function scrollToIndex(index, behavior = scrollBehavior()) {
    const el = track.value
    const child = items()[index]
    if (!el || !child) return
    const rtl = getComputedStyle(el).direction === 'rtl'
    const box = el.getBoundingClientRect()
    const rect = child.getBoundingClientRect()
    const delta = rtl ? rect.right - box.right : rect.left - box.left
    el.scrollBy({ left: delta, behavior })
  }

  function next() {
    const el = track.value
    if (!el) return
    if (!canNext.value) {
      if (loop) scrollToIndex(0)
      return
    }
    el.scrollBy({ left: advanceSign() * step(), behavior: scrollBehavior() })
  }

  function prev() {
    const el = track.value
    if (!el) return
    if (!canPrev.value) {
      if (loop) scrollToIndex(items().length - 1)
      return
    }
    el.scrollBy({ left: -advanceSign() * step(), behavior: scrollBehavior() })
  }

  /* ---------- drag to scroll (pointer, mouse only) ---------- */

  function onPointerDown(event) {
    // Touch already scrolls natively; hijacking it breaks momentum.
    if (event.pointerType === 'touch') return
    const el = track.value
    if (!el) return
    pointerId = event.pointerId
    dragStartX = event.clientX
    dragStartScroll = el.scrollLeft
    moved = false
    isDragging.value = true
    /**
     * Deliberately *not* capturing the pointer here. While a capture is active
     * the click that follows is retargeted to the capturing element, so every
     * button inside the rail ("أضف الباقة", "عرض التفاصيل", the cards
     * themselves) silently stopped receiving clicks. Capture is claimed in
     * onPointerMove instead, once the gesture is actually a drag.
     */
  }

  function onPointerMove(event) {
    if (!isDragging.value || event.pointerId !== pointerId) return
    const el = track.value
    if (!el) return
    const delta = event.clientX - dragStartX
    // Below the threshold this is still a click, so leave the pointer alone.
    if (!moved) {
      if (Math.abs(delta) <= 4) return
      moved = true
      el.setPointerCapture?.(pointerId)
    }
    el.scrollLeft = dragStartScroll - delta
  }

  function endDrag(event) {
    if (pointerId === null) return
    const el = track.value
    if (el && moved && el.hasPointerCapture?.(pointerId)) {
      el.releasePointerCapture?.(pointerId)
    }
    pointerId = null
    isDragging.value = false
    // Swallow the click that follows a real drag so cards don't navigate.
    if (moved) {
      const swallow = (e) => {
        e.stopPropagation()
        e.preventDefault()
      }
      el?.addEventListener('click', swallow, { capture: true, once: true })
      setTimeout(() => el?.removeEventListener('click', swallow, { capture: true }), 60)
    }
  }

  /* ---------- autoplay ---------- */

  function startAutoplay() {
    if (!autoplay || autoplayTimer) return
    if (prefersReducedMotion()) return
    autoplayTimer = setInterval(() => {
      if (paused || isDragging.value || document.hidden) return
      next()
    }, interval)
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer)
    autoplayTimer = 0
  }

  const pause = () => {
    paused = true
  }
  const resume = () => {
    paused = false
  }

  onMounted(() => {
    const el = track.value
    if (!el) return
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    measure()
    startAutoplay()
  })

  onBeforeUnmount(() => {
    const el = track.value
    el?.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    if (rafId) cancelAnimationFrame(rafId)
    stopAutoplay()
  })

  /** Bind straight onto the scroll container. */
  const trackHandlers = computed(() => ({
    onPointerdown: onPointerDown,
    onPointermove: onPointerMove,
    onPointerup: endDrag,
    onPointercancel: endDrag,
    onPointerleave: endDrag,
    onMouseenter: pause,
    onMouseleave: resume,
    onFocusin: pause,
    onFocusout: resume,
  }))

  return {
    track,
    trackHandlers,
    activeIndex,
    canPrev,
    canNext,
    isDragging,
    next,
    prev,
    scrollToIndex,
    pause,
    resume,
  }
}
