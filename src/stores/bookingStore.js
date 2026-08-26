/**
 * Booking flow store — the wizard's state machine.
 *
 * Three steps, matching the designs: choose services → where and when →
 * review and pay. Steps are declared once and everything else (progress bar,
 * next/back guards, the step rail) derives from that list.
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { fetchAvailability, fetchBookableDays } from '@/utils/api'
import { toISODate } from '@/utils/format'
import { normalisePhone, validateAll, validators } from '@/utils/validate'
import { useCartStore } from '@/stores/cartStore'
import { useServicesStore } from '@/stores/servicesStore'
import { doctolApi, tokenStorage } from '@/services/doctolApi'
import { apiData } from '@/services/apiMappers'

export const BOOKING_STEPS = [
  { id: 'services', label: 'اختيار الخدمة', icon: 'grid' },
  { id: 'schedule', label: 'الموقع والموعد', icon: 'calendar' },
  { id: 'confirm', label: 'التأكيد والدفع', icon: 'card' },
]

export const useBookingStore = defineStore('booking', () => {
  const cart = useCartStore()
  const catalogue = useServicesStore()

  const stepIndex = ref(0)

  /** Step 1 view state — which category tab, and which row to auto-open. */
  const categoryId = ref('furniture')
  const focusServiceId = ref('')

  /** Lead capture: name + phone taken before the flow starts. */
  const lead = ref({ name: '', phone: '' })
  const leadCaptured = ref(false)

  const location = ref({ cityId: '', neighborhoodId: '', district: '', address: '', notes: '' })
  const schedule = ref({ date: '', time: '' })
  const customer = ref({ name: '', phone: '', email: '' })
  const paymentMethod = ref('mada')

  const availability = ref([])
  const availabilityLoading = ref(false)
  const bookableDays = ref([])

  const submitting = ref(false)
  const submitError = ref('')
  const confirmation = ref(null)
  const lastQuote = ref(null)
  const errors = ref({})

  const currentStep = computed(() => BOOKING_STEPS[stepIndex.value])
  const isFirstStep = computed(() => stepIndex.value === 0)
  const isLastStep = computed(() => stepIndex.value === BOOKING_STEPS.length - 1)
  const progress = computed(() => ((stepIndex.value + 1) / BOOKING_STEPS.length) * 100)

  /** Per-step completeness — drives the CTA and the step rail. */
  const stepValidity = computed(() => ({
    services: cart.hasSelection,
    schedule: Boolean(
      location.value.cityId &&
        (location.value.neighborhoodId || location.value.district) &&
        location.value.address &&
        schedule.value.date &&
        schedule.value.time,
    ),
    confirm: Boolean(
      !validators.name(customer.value.name) &&
        !validators.phone(customer.value.phone) &&
        paymentMethod.value,
    ),
  }))

  const canAdvance = computed(() => stepValidity.value[currentStep.value.id] === true)

  const completedSteps = computed(() =>
    BOOKING_STEPS.filter((s, i) => i < stepIndex.value && stepValidity.value[s.id]).map((s) => s.id),
  )

  /** Label for the primary CTA in the sticky bar. */
  const ctaLabel = computed(() => (isLastStep.value ? 'تأكيد الحجز' : 'متابعة'))

  function goToStep(index) {
    const next = Math.min(Math.max(index, 0), BOOKING_STEPS.length - 1)
    // Never allow jumping forward past an incomplete step.
    for (let i = 0; i < next; i += 1) {
      if (!stepValidity.value[BOOKING_STEPS[i].id]) {
        stepIndex.value = i
        return
      }
    }
    stepIndex.value = next
  }

  function next() {
    if (!canAdvance.value) {
      validateCurrentStep()
      return false
    }
    if (!isLastStep.value) goToStep(stepIndex.value + 1)
    return true
  }

  function back() {
    if (!isFirstStep.value) goToStep(stepIndex.value - 1)
  }

  function validateCurrentStep() {
    if (currentStep.value.id === 'schedule') {
      errors.value = validateAll(location.value, {
        cityId: 'city',
        district: 'district',
        address: 'address',
      })
    } else if (currentStep.value.id === 'confirm') {
      errors.value = validateAll(customer.value, {
        name: 'name',
        phone: 'phone',
        email: 'email',
      })
    } else {
      errors.value = {}
    }
    return Object.keys(errors.value).length === 0
  }

  function clearError(field) {
    if (errors.value[field]) {
      const { [field]: _removed, ...rest } = errors.value
      errors.value = rest
    }
  }

  function setLocation(patch) {
    location.value = { ...location.value, ...patch }
    Object.keys(patch).forEach(clearError)
  }

  function setCustomer(patch) {
    customer.value = { ...customer.value, ...patch }
    Object.keys(patch).forEach(clearError)
  }

  /** Stores the pre-flow lead and seeds the customer fields from it. */
  function captureLead({ name, phone }) {
    lead.value = { name, phone }
    leadCaptured.value = true
    setCustomer({ name, phone })
  }

  async function selectDate(dateISO) {
    schedule.value = { date: dateISO, time: '' }
    submitError.value = ''
    availabilityLoading.value = true
    try {
      const slugs = []

      cart.lines.forEach(({ service }) => {
        const slug = service.availabilitySlug ?? service.parentServiceSlug ?? service.slug
        if (slug) slugs.push(slug)
      })

      cart.bundles.forEach((bundle) => {
        if (bundle.availabilitySlug) slugs.push(bundle.availabilitySlug)
        ;(bundle.items ?? []).forEach((item) => {
          const service = catalogue.serviceById(item.serviceId)
          const slug =
            service?.availabilitySlug ??
            service?.parentServiceSlug ??
            item.availabilitySlug ??
            item.parentServiceSlug ??
            item.serviceSlug ??
            item.bookingSlug
          if (slug) slugs.push(slug)
        })
      })

      const uniqueSlugs = [...new Set(slugs.map(String).filter(Boolean))]
      if (!uniqueSlugs.length) {
        availability.value = []
        return
      }

      // Laravel validates the selected time against every service contained
      // in a package. Show only the intersection shared by all of them.
      const groups = await Promise.all(
        uniqueSlugs.map((slug) => fetchAvailability(dateISO, slug)),
      )
      if (groups.some((slots) => !slots.length)) {
        availability.value = []
        return
      }

      const indexes = groups.map((slots) =>
        new Map(slots.map((slot) => [String(slot.time), slot])),
      )
      availability.value = groups[0].map((first) => {
        const matches = indexes.map((index) => index.get(String(first.time)))
        const available = matches.every((slot) => slot?.available)
        const remainingValues = matches
          .map((slot) => Number(slot?.remaining))
          .filter(Number.isFinite)
        const remaining = remainingValues.length ? Math.min(...remainingValues) : (available ? 1 : 0)
        return {
          ...first,
          available,
          remaining,
          lowStock: available && (remaining === 1 || matches.some((slot) => slot?.lowStock)),
        }
      })
    } finally {
      availabilityLoading.value = false
    }
  }

  function selectTime(time) {
    schedule.value = { ...schedule.value, time }
    submitError.value = ''
  }

  async function loadBookableDays() {
    if (bookableDays.value.length) return
    bookableDays.value = await fetchBookableDays()
  }

  /**
   * Entry point for every booking CTA. Optionally focuses a service or a
   * category so the customer lands exactly where they clicked.
   */
  function start({
    service = null,
    serviceId = null,
    pkg = null,
    category = null,
    reset: doReset = false,
  } = {}) {
    if (doReset) reset({ keepCustomer: true })
    stepIndex.value = 0
    if (category) categoryId.value = category
    // An id alone is enough: the service step resolves it once the catalogue
    // is loaded, so CTAs never depend on fetch timing.
    const focusId = service?.id ?? serviceId
    if (focusId) {
      if (service?.categoryId) categoryId.value = service.categoryId
      focusServiceId.value = focusId
    }
    if (pkg) {
      // Do not force the legacy local `furniture` category. Backend packages
      // may combine services from several categories and Laravel category ids
      // are not guaranteed to use that slug.
      if (!cart.hasBundle(pkg.id)) cart.toggleBundle(pkg)
    }
  }

  async function submit() {
    submitting.value = true
    submitError.value = ''
    try {
      if (!tokenStorage.get()) {
        throw new Error('يجب التحقق من رقم الجوال قبل تأكيد الحجز.')
      }

      const localPayload = cart.toPayload()
      const serviceItems = localPayload.services.map((item) => {
        const service = cart.lines.find((line) => line.service.id === item.serviceId)?.service
        return {
          type: 'service',
          // The v1 quote API validates this against active, bookable
          // sub-services. Never send the parent/main service slug here.
          service_slug: service?.bookingSlug ?? service?.subServiceSlug ?? service?.slug ?? String(item.serviceId),
          quantity: 1,
          configuration: item.config,
        }
      })
      const bundleItems = cart.bundles.map((bundle) => ({
        type: bundle.apiType ?? 'package',
        [`${bundle.apiType === 'offer' ? 'offer' : 'package'}_slug`]: bundle.slug ?? String(bundle.id),
        quantity: 1,
        configuration: bundle.configuration ?? {},
      }))

      const quoteResponse = await doctolApi.quoteBooking({
        city_id: location.value.cityId,
        neighborhood_id: location.value.neighborhoodId || null,
        selected_date: schedule.value.date,
        selected_start_time: schedule.value.time,
        ...(cart.promo?.code ? { promo_code: cart.promo.code } : {}),
        items: [...serviceItems, ...bundleItems],
      })
      const quote = apiData.unwrap(quoteResponse, {})
      const quoteToken = quote.quote_token ?? quote.token
      if (!quoteToken) throw new Error('لم يرجع السيرفر quote_token لإكمال الحجز.')
      lastQuote.value = quote

      const paymentMap = { cash: 'pay_on_visit', pay_on_visit: 'pay_on_visit' }
      const bookingResponse = await doctolApi.createBooking({
        quote_token: quoteToken,
        address_details: [location.value.district, location.value.address].filter(Boolean).join('، '),
        team_notes: location.value.notes || '',
        payment_method: paymentMap[paymentMethod.value] ?? paymentMethod.value,
      })
      const data = apiData.unwrap(bookingResponse, {})
      const reference = data.booking_reference ?? data.reference ?? data.booking?.reference
      const result = {
        ...data,
        reference,
        status: data.status ?? data.booking?.status ?? 'pending',
        location: { ...location.value },
        schedule: { ...schedule.value },
        customer: { ...customer.value, phoneE164: normalisePhone(customer.value.phone) },
        pricing: {
          subtotal: Number(quote.subtotal ?? localPayload.pricing.subtotal),
          discount: Number(quote.discount ?? quote.discount_amount ?? localPayload.pricing.discount),
          vat: Number(quote.vat ?? quote.tax ?? localPayload.pricing.vat),
          total: Number(quote.total ?? quote.grand_total ?? localPayload.pricing.total),
          currency: quote.currency ?? 'SAR',
        },
        services: localPayload.services,
        packageIds: localPayload.packageIds,
        paymentMethod: paymentMethod.value,
        createdAt: data.created_at ?? new Date().toISOString(),
      }
      confirmation.value = result
      return result
    } catch (err) {
      const rawMessage = err.message ?? ''
      const timeUnavailable = /selected time is no longer available/i.test(rawMessage)
      submitError.value = timeUnavailable
        ? 'الموعد الذي اخترته لم يعد متاحًا. اختر موعدًا آخر.'
        : /Only active bookable sub-services can be selected/i.test(rawMessage)
          ? 'الخدمة المختارة ليست خدمة فرعية فعّالة وقابلة للحجز. حدّث الصفحة واختر الخدمة الفرعية مرة أخرى.'
          : rawMessage || 'حدث خطأ غير متوقع، حاول مرة أخرى.'
      if (timeUnavailable) {
        schedule.value = { ...schedule.value, time: '' }
        availability.value = []
        stepIndex.value = 1
        if (schedule.value.date) await selectDate(schedule.value.date)
      }
      if (err && typeof err === 'object') err.message = submitError.value
      throw err
    } finally {
      submitting.value = false
    }
  }

  function reset({ keepCustomer = false } = {}) {
    stepIndex.value = 0
    categoryId.value = 'furniture'
    focusServiceId.value = ''
    location.value = { cityId: '', neighborhoodId: '', district: '', address: '', notes: '' }
    schedule.value = { date: '', time: '' }
    if (!keepCustomer) customer.value = { name: '', phone: '', email: '' }
    paymentMethod.value = 'mada'
    availability.value = []
    submitError.value = ''
    confirmation.value = null
    lastQuote.value = null
    errors.value = {}
    cart.reset()
  }

  /** Pre-selects today so the schedule step is never empty on arrival. */
  function primeSchedule() {
    if (!schedule.value.date) selectDate(toISODate(new Date()))
  }

  return {
    BOOKING_STEPS,
    stepIndex,
    categoryId,
    focusServiceId,
    lead,
    leadCaptured,
    location,
    schedule,
    customer,
    paymentMethod,
    availability,
    availabilityLoading,
    bookableDays,
    submitting,
    submitError,
    confirmation,
    lastQuote,
    errors,
    currentStep,
    isFirstStep,
    isLastStep,
    progress,
    stepValidity,
    canAdvance,
    completedSteps,
    ctaLabel,
    goToStep,
    next,
    back,
    validateCurrentStep,
    clearError,
    setLocation,
    setCustomer,
    captureLead,
    selectDate,
    selectTime,
    loadBookableDays,
    start,
    submit,
    reset,
    primeSchedule,
  }
})
