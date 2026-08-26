/**
 * Small interaction primitives: magnetic hover, ripple feedback and focus
 * trapping for overlays. Each one is pointer-aware and reduced-motion aware.
 */

import { onBeforeUnmount, onMounted, ref } from 'vue'
import { prefersReducedMotion as reduced } from '@/utils/motion'

/**
 * Magnetic CTA: the element leans a few pixels toward the cursor.
 * Fine pointers only — on touch there is no cursor to lean toward.
 */
export function useMagnetic(strength = 0.28, max = 10) {
  const el = ref(null)
  let frame = 0
  let enabled = false

  function onMove(event) {
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      const node = el.value
      if (!node) return
      const rect = node.getBoundingClientRect()
      const dx = event.clientX - (rect.left + rect.width / 2)
      const dy = event.clientY - (rect.top + rect.height / 2)
      const x = Math.max(-max, Math.min(max, dx * strength))
      const y = Math.max(-max, Math.min(max, dy * strength))
      node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
    })
  }

  function onLeave() {
    const node = el.value
    if (node) node.style.transform = ''
  }

  onMounted(() => {
    const node = el.value
    if (!node) return
    if (reduced() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    enabled = true
    node.addEventListener('pointermove', onMove)
    node.addEventListener('pointerleave', onLeave)
  })

  onBeforeUnmount(() => {
    if (!enabled) return
    const node = el.value
    node?.removeEventListener('pointermove', onMove)
    node?.removeEventListener('pointerleave', onLeave)
    if (frame) cancelAnimationFrame(frame)
  })

  return el
}

/**
 * Material-style ripple. Returns a pointerdown handler; the host element needs
 * `position: relative; overflow: hidden`.
 */
export function useRipple() {
  return function ripple(event) {
    if (reduced()) return
    const host = event.currentTarget
    if (!host) return
    const rect = host.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2
    const span = document.createElement('span')
    span.className = 'dt-ripple'
    span.style.width = `${size}px`
    span.style.height = `${size}px`
    span.style.left = `${event.clientX - rect.left - size / 2}px`
    span.style.top = `${event.clientY - rect.top - size / 2}px`
    host.appendChild(span)
    span.addEventListener('animationend', () => span.remove(), { once: true })
  }
}

/**
 * Traps Tab inside a container while it is open, restores focus on close and
 * reports Escape. Used by every overlay (modal, sheet, drawer).
 */
export function useFocusTrap(containerRef, { onEscape } = {}) {
  let previouslyFocused = null

  const SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',')

  function focusables() {
    const root = containerRef.value
    if (!root) return []
    return Array.from(root.querySelectorAll(SELECTOR)).filter(
      (node) => node.offsetParent !== null || node === document.activeElement,
    )
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onEscape?.()
      return
    }
    if (event.key !== 'Tab') return
    const nodes = focusables()
    if (!nodes.length) {
      event.preventDefault()
      return
    }
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  function activate() {
    previouslyFocused = document.activeElement
    document.addEventListener('keydown', onKeydown, true)
    requestAnimationFrame(() => {
      const [first] = focusables()
      ;(first ?? containerRef.value)?.focus?.()
    })
  }

  function deactivate() {
    document.removeEventListener('keydown', onKeydown, true)
    previouslyFocused?.focus?.()
    previouslyFocused = null
  }

  return { activate, deactivate }
}
