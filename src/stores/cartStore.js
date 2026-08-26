/**
 * Cart store.
 *
 * The booking flow lets a customer configure several services in one order, so
 * the cart is a list of lines rather than a single selection. Each line is
 * `{ service, config }`; all money comes from `utils/pricing`, so the
 * accordion header, sticky bar, summary and API payload always agree.
 */

import { defineStore } from 'pinia'
import { computed, ref, toRaw } from 'vue'
import { defaultConfig, priceFor, reconcile, totalsFor } from '@/utils/pricing'
import { validatePromo } from '@/utils/api'

export const useCartStore = defineStore('cart', () => {
  /** Service lines, in the order the customer added them. */
  const lines = ref([])
  /** Bundled packages, kept separate because they are priced as a whole. */
  const bundles = ref([])

  const promo = ref(null)
  const promoError = ref('')
  const promoLoading = ref(false)

  /* ---------------- selectors ---------------- */

  const findLine = (serviceId) => lines.value.find((l) => l.service.id === serviceId)

  const isSelected = computed(() => (serviceId) => Boolean(findLine(serviceId)))
  const hasBundle = computed(() => (packageId) => bundles.value.some((b) => b.id === packageId))

  const configFor = computed(() => (serviceId) => findLine(serviceId)?.config ?? null)

  /** Priced view of every line — the single source for all display. */
  const items = computed(() =>
    lines.value.map((line) => {
      const priced = priceFor(line.service, line.config)
      return { ...priced, service: line.service, config: line.config }
    }),
  )

  const priceOf = computed(() => (serviceId) => {
    const line = findLine(serviceId)
    return line ? priceFor(line.service, line.config) : null
  })

  const bundleItems = computed(() =>
    bundles.value.map((pkg) => ({
      pkg,
      total: pkg.price,
      count: pkg.items.length,
      summary: pkg.tagline,
    })),
  )

  const hasSelection = computed(() => items.value.some((i) => i.valid) || bundles.value.length > 0)

  /** Badge number on the sticky bar: configured services + packages. */
  const itemCount = computed(
    () => items.value.filter((i) => i.valid).length + bundles.value.length,
  )

  const subtotal = computed(
    () =>
      items.value.reduce((sum, i) => sum + (i.valid ? i.total : 0), 0) +
      bundles.value.reduce((sum, b) => sum + b.price, 0),
  )

  const discount = computed(() => {
    if (!promo.value) return 0
    const raw =
      promo.value.type === 'percent'
        ? (subtotal.value * promo.value.value) / 100
        : promo.value.value
    return Math.min(Math.round(raw), subtotal.value)
  })

  const totals = computed(() => totalsFor(subtotal.value, discount.value))
  const vat = computed(() => totals.value.vat)
  const total = computed(() => totals.value.total)

  /** Bundle savings plus any promo — what the customer avoided paying. */
  const savings = computed(
    () => discount.value + bundles.value.reduce((sum, b) => sum + b.saving, 0),
  )

  /** Flat rows for the review step. */
  const lineItems = computed(() => {
    const rows = []
    bundles.value.forEach((pkg) => {
      rows.push({ id: `pkg-${pkg.id}`, label: pkg.name, price: pkg.price })
      pkg.items.forEach((item) =>
        rows.push({ id: `pkg-${pkg.id}-${item.serviceId}`, label: item.label, included: true }),
      )
    })
    items.value
      .filter((i) => i.valid)
      .forEach((item) => {
        rows.push({ id: item.service.id, label: item.service.name, price: item.total })
        item.lines.forEach((sub, index) =>
          rows.push({ id: `${item.service.id}-${index}`, label: sub.label, sub: true }),
        )
      })
    return rows
  })

  /* ---------------- mutations ---------------- */

  function select(service, config = null) {
    const existing = findLine(service.id)
    const next = reconcile(service, config ?? existing?.config ?? defaultConfig(service))
    if (existing) existing.config = next
    else lines.value.push({ service, config: next })
    return next
  }

  function remove(serviceId) {
    const index = lines.value.findIndex((l) => l.service.id === serviceId)
    if (index !== -1) lines.value.splice(index, 1)
  }

  function toggle(service) {
    if (findLine(service.id)) remove(service.id)
    else select(service)
  }

  /** Merges a partial change into a line's config and re-reconciles it. */
  function setConfig(serviceId, patch) {
    const line = findLine(serviceId)
    if (!line) return
    line.config = reconcile(line.service, { ...line.config, ...patch })
  }

  function toggleBundle(pkg) {
    const index = bundles.value.findIndex((b) => b.id === pkg.id)
    if (index === -1) bundles.value.push(pkg)
    else bundles.value.splice(index, 1)
  }

  async function applyPromo(code) {
    promoLoading.value = true
    promoError.value = ''
    try {
      promo.value = await validatePromo(code)
      return true
    } catch (err) {
      promo.value = null
      promoError.value = err.message
      return false
    } finally {
      promoLoading.value = false
    }
  }

  function clearPromo() {
    promo.value = null
    promoError.value = ''
  }

  function reset() {
    lines.value = []
    bundles.value = []
    clearPromo()
  }

  /** Serialised for `POST /bookings`. */
  function toPayload() {
    return {
      services: items.value
        .filter((i) => i.valid)
        .map((i) => ({
          serviceId: i.service.id,
          categoryId: i.service.categoryId,
          kind: i.service.config.kind,
          config: plainConfig(i.config),
          price: i.total,
          summary: i.summary,
        })),
      packageIds: bundles.value.map((b) => b.id),
      promoCode: promo.value?.code ?? null,
      pricing: {
        subtotal: subtotal.value,
        discount: discount.value,
        vat: vat.value,
        total: total.value,
        currency: 'SAR',
      },
    }
  }

  /**
   * Serialises a config for transport.
   *
   * Two things make a naive clone fail: the config is a Vue reactive proxy
   * (not structured-cloneable), and `files` holds real `File` objects that the
   * JSON body must not carry — the upload goes over multipart separately, so
   * only the metadata belongs here.
   */
  function plainConfig(config) {
    const raw = toRaw(config) ?? {}
    const files = (raw.files ?? []).map((f) => ({ name: f.name, size: f.size, type: f.type }))
    const clone = JSON.parse(JSON.stringify({ ...raw, files: undefined }))
    return files.length ? { ...clone, files } : clone
  }

  return {
    lines,
    bundles,
    promo,
    promoError,
    promoLoading,
    items,
    bundleItems,
    isSelected,
    hasBundle,
    configFor,
    priceOf,
    hasSelection,
    itemCount,
    subtotal,
    discount,
    vat,
    total,
    savings,
    lineItems,
    select,
    remove,
    toggle,
    setConfig,
    toggleBundle,
    applyPromo,
    clearPromo,
    reset,
    toPayload,
  }
})
