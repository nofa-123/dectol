/**
 * Cross-cutting UI state: toasts, overlay bookkeeping and scroll locking.
 * Overlays are counted rather than flagged so nested layers (sheet opened from
 * a modal) can't unlock the page while one is still open.
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

let toastId = 0

export const useUiStore = defineStore('ui', () => {
  const toasts = ref([])
  const openOverlays = ref(0)
  const drawerOpen = ref(false)
  const headerCondensed = ref(false)

  const isLocked = computed(() => openOverlays.value > 0)

  function pushToast({ type = 'info', title, message = '', duration = 4200, action = null }) {
    const id = ++toastId
    toasts.value.push({ id, type, title, message, action })
    if (duration > 0) {
      setTimeout(() => dismissToast(id), duration)
    }
    return id
  }

  const toast = {
    success: (title, message) => pushToast({ type: 'success', title, message }),
    error: (title, message) => pushToast({ type: 'error', title, message, duration: 6000 }),
    info: (title, message) => pushToast({ type: 'info', title, message }),
  }

  function dismissToast(id) {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index !== -1) toasts.value.splice(index, 1)
  }

  function registerOverlay() {
    openOverlays.value += 1
    syncLock()
  }

  function releaseOverlay() {
    openOverlays.value = Math.max(0, openOverlays.value - 1)
    syncLock()
  }

  function syncLock() {
    document.body.classList.toggle('is-locked', openOverlays.value > 0)
  }

  function openDrawer() {
    drawerOpen.value = true
  }

  function closeDrawer() {
    drawerOpen.value = false
  }

  return {
    toasts,
    toast,
    pushToast,
    dismissToast,
    isLocked,
    registerOverlay,
    releaseOverlay,
    drawerOpen,
    openDrawer,
    closeDrawer,
    headerCondensed,
  }
})
