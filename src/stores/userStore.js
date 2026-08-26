/**
 * User store — profile, saved addresses, booking history, favourites and
 * notifications. Persists to localStorage so a demo survives a refresh; swap
 * `persist()` for API calls when auth lands.
 */

import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { doctolApi, tokenStorage } from '@/services/doctolApi'
import { apiData } from '@/services/apiMappers'

const STORAGE_KEY = 'doctol:user:v1'

function readStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
  } catch {
    return null
  }
}

const seedNotifications = [
  {
    id: 'n1',
    title: 'عرض تنظيف الكنب بخصم 50٪',
    body: 'العرض ساري حتى نهاية الأسبوع على الأطقم حتى 9 مقاعد.',
    time: 'قبل ساعتين',
    read: false,
    type: 'offer',
  },
  {
    id: 'n2',
    title: 'تقييم خدمتك السابقة',
    body: 'كيف كانت تجربتك مع تنظيف السجاد؟ رأيك يساعدنا نتحسن.',
    time: 'أمس',
    read: false,
    type: 'review',
  },
  {
    id: 'n3',
    title: 'ضمان دكتول 24 ساعة',
    body: 'تذكير: تقدر تطلب إعادة الخدمة مجاناً خلال 24 ساعة من التسليم.',
    time: 'قبل 3 أيام',
    read: true,
    type: 'info',
  },
]

export const useUserStore = defineStore('user', () => {
  const stored = readStored()

  const profile = ref(
    stored?.profile ?? {
      name: '',
      phone: '',
      email: '',
    },
  )
  const addresses = ref(stored?.addresses ?? [])
  const bookings = ref(stored?.bookings ?? [])
  const favourites = ref(stored?.favourites ?? [])
  const notifications = ref(stored?.notifications ?? seedNotifications)
  const loading = ref(false)
  const error = ref('')

  const isKnown = computed(() => Boolean(profile.value.phone))
  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)

  const upcomingBookings = computed(() =>
    bookings.value.filter((b) => b.status === 'confirmed').slice().reverse(),
  )
  const pastBookings = computed(() => bookings.value.filter((b) => b.status === 'completed'))

  const isFavourite = computed(() => (serviceId) => favourites.value.includes(serviceId))

  function toggleFavourite(serviceId) {
    const index = favourites.value.indexOf(serviceId)
    if (index === -1) favourites.value.push(serviceId)
    else favourites.value.splice(index, 1)
  }

  function saveProfile(patch) {
    profile.value = { ...profile.value, ...patch }
  }

  function addAddress(address) {
    const exists = addresses.value.some(
      (a) => a.cityId === address.cityId && a.district === address.district && a.address === address.address,
    )
    if (!exists) addresses.value.unshift({ id: `addr-${Date.now()}`, ...address })
  }

  function recordBooking(booking) {
    bookings.value.push(booking)
    if (booking.customer) {
      saveProfile({
        name: booking.customer.name,
        phone: booking.customer.phone,
        email: booking.customer.email,
      })
    }
    if (booking.location) addAddress(booking.location)
    notifications.value.unshift({
      id: `n-${booking.reference}`,
      title: `تم تأكيد حجزك ${booking.reference}`,
      body: 'سيتواصل معك فريق دكتول لتأكيد الموعد وتفاصيل الوصول.',
      time: 'الآن',
      read: false,
      type: 'booking',
    })
  }

  function markAllRead() {
    notifications.value = notifications.value.map((n) => ({ ...n, read: true }))
  }

  function markRead(id) {
    const item = notifications.value.find((n) => n.id === id)
    if (item) item.read = true
    if (tokenStorage.get()) doctolApi.markNotificationRead(id).catch(() => {})
  }

  function mapBooking(item) {
    const scheduled = item.scheduled_at ?? item.selected_date ?? item.date
    return {
      ...item,
      reference: item.booking_reference ?? item.reference ?? item.id,
      status: item.status ?? 'pending',
      schedule: item.schedule ?? {
        date: scheduled ? String(scheduled).slice(0, 10) : '',
        time: item.selected_start_time ?? item.start_time ?? (scheduled ? String(scheduled).slice(11, 16) : ''),
      },
      location: item.location ?? {
        cityId: item.city_id ?? item.city?.id ?? '',
        neighborhoodId: item.neighborhood_id ?? item.neighborhood?.id ?? '',
        district: item.neighborhood?.name ?? item.district ?? '',
        address: item.address_details ?? item.address ?? '',
        notes: item.team_notes ?? '',
      },
      pricing: item.pricing ?? {
        total: Number(item.total ?? item.grand_total ?? 0),
        subtotal: Number(item.subtotal ?? 0),
        discount: Number(item.discount ?? 0),
        vat: Number(item.vat ?? item.tax ?? 0),
        currency: item.currency ?? 'SAR',
      },
    }
  }

  async function ensureLoaded() {
    if (!tokenStorage.get() || loading.value) return
    loading.value = true
    error.value = ''
    try {
      const [accountResponse, bookingsResponse, notificationsResponse] = await Promise.all([
        doctolApi.account(),
        doctolApi.accountBookings(),
        doctolApi.notifications(),
      ])
      const account = apiData.unwrap(accountResponse, {})
      const person = account.customer ?? account.user ?? account
      profile.value = {
        name: person.name ?? profile.value.name,
        phone: person.phone ?? profile.value.phone,
        email: person.email ?? profile.value.email,
      }
      const remoteAddresses = account.addresses ?? person.addresses
      if (Array.isArray(remoteAddresses)) addresses.value = remoteAddresses
      bookings.value = apiData.list(bookingsResponse).map(mapBooking)
      notifications.value = apiData.list(notificationsResponse).map((item) => ({
        ...item,
        id: item.id ?? item.notification_id,
        title: item.title ?? item.subject ?? 'إشعار دكتول',
        body: item.body ?? item.message ?? '',
        time: item.time ?? item.created_at ?? '',
        read: Boolean(item.read ?? item.is_read ?? item.read_at),
      }))
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  function persist() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          profile: profile.value,
          addresses: addresses.value,
          bookings: bookings.value,
          favourites: favourites.value,
          notifications: notifications.value,
        }),
      )
    } catch {
      /* storage unavailable (private mode) — the app still works in-memory */
    }
  }

  watch([profile, addresses, bookings, favourites, notifications], persist, { deep: true })

  return {
    profile,
    addresses,
    bookings,
    favourites,
    notifications,
    loading,
    error,
    isKnown,
    unreadCount,
    upcomingBookings,
    pastBookings,
    isFavourite,
    toggleFavourite,
    saveProfile,
    addAddress,
    recordBooking,
    markAllRead,
    markRead,
    ensureLoaded,
  }
})
