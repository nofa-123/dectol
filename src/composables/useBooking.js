/**
 * Booking facade.
 *
 * Components should not have to know that "start a booking" means touching
 * three stores and the router. This composable is the single entry point for
 * every booking CTA in the app.
 */

import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/bookingStore'
import { useCartStore } from '@/stores/cartStore'
import { useServicesStore } from '@/stores/servicesStore'
import { useUiStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore'
import { useAuthStore } from '@/stores/authStore'

export function useBooking() {
  const router = useRouter()
  const booking = useBookingStore()
  const cart = useCartStore()
  const catalogue = useServicesStore()
  const ui = useUiStore()
  const user = useUserStore()
  const auth = useAuthStore()

  /** Prefills contact details and the last-used address for a returning customer. */
  function hydrateCustomer() {
    auth.hydrate().then((person) => {
      if (person && !booking.customer.phone) {
        booking.setCustomer({ name: person.name ?? '', phone: person.phone ?? '', email: person.email ?? '' })
        booking.leadCaptured = true
        user.ensureLoaded()
      }
    })
    if (user.isKnown && !booking.customer.phone) {
      booking.setCustomer({ ...user.profile })
      booking.leadCaptured = true
    }
    const [lastAddress] = user.addresses
    if (lastAddress && !booking.location.cityId) {
      booking.setLocation({
        cityId: lastAddress.cityId,
        district: lastAddress.district,
        address: lastAddress.address,
      })
    }
  }

  /**
   * Opens the flow. Everything is additive — the cart keeps whatever the
   * customer already configured unless `reset` is asked for.
   */
  function open({ service = null, serviceId = null, pkg = null, category = null, reset = false } = {}) {
    booking.start({ service, serviceId, pkg, category, reset })
    hydrateCustomer()
    router.push({ name: 'booking' })
  }

  const startBlank = () => open()
  const startWithService = (service) => open({ service })
  const startWithPackage = (pkg) => open({ pkg })
  const startWithCategory = (categoryId) => open({ category: categoryId })

  /**
   * An offer is a fixed-price wrapper around a service, so it enters the cart
   * as a bundle rather than a configurable line — otherwise the configurator
   * would recompute the price and the discount would evaporate.
   */
  function startWithOffer(offer) {
    const service = catalogue.serviceById(offer.serviceId)
    if (!cart.hasBundle(offer.id)) {
      cart.toggleBundle({
        id: offer.id,
        slug: offer.slug,
        apiType: 'offer',
        name: offer.title,
        tagline: offer.subtitle,
        price: offer.price,
        oldPrice: offer.oldPrice,
        saving: offer.oldPrice - offer.price,
        duration: service?.duration ?? '',
        items: [{ serviceId: offer.serviceId, label: offer.subtitle }],
        perks: offer.highlights ?? [],
      })
    }
    open({ category: service?.categoryId ?? null })
  }

  /** Runs the submit → persist → notify sequence. */
  async function confirm() {
    try {
      const result = await booking.submit()
      user.recordBooking(result)
      ui.toast.success('تم إرسال حجزك بنجاح', `رقم الحجز ${result.reference}`)
      return result
    } catch (err) {
      ui.toast.error('تعذّر إتمام الحجز', err.message)
      return null
    }
  }

  const canSubmit = computed(
    () =>
      booking.stepValidity.services &&
      booking.stepValidity.schedule &&
      booking.stepValidity.confirm &&
      !booking.submitting,
  )

  return {
    booking,
    cart,
    open,
    startBlank,
    startWithService,
    startWithPackage,
    startWithCategory,
    startWithOffer,
    confirm,
    canSubmit,
    hydrateCustomer,
  }
}
