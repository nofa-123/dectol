/** Replace a failed remote image once with its bundled frontend fallback. */
export const vImageFallback = {
  mounted(element, binding) {
    element.__doctolFallback = binding.value || ''
    element.__doctolFallbackHandler = () => {
      const fallback = element.__doctolFallback
      if (!fallback || element.dataset.fallbackApplied === 'true') return
      element.dataset.fallbackApplied = 'true'
      element.src = fallback
    }
    element.addEventListener('error', element.__doctolFallbackHandler)
  },
  updated(element, binding) {
    if (binding.value !== binding.oldValue) {
      element.__doctolFallback = binding.value || ''
      delete element.dataset.fallbackApplied
    }
  },
  unmounted(element) {
    element.removeEventListener('error', element.__doctolFallbackHandler)
    delete element.__doctolFallback
    delete element.__doctolFallbackHandler
  },
}
