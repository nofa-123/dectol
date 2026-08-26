import { destroy, get, post, put, tokenStorage } from '@/services/http'

export const doctolApi = {
  // Public catalogue
  home: () => get('/api/v1/home'),
  settings: () => get('/api/v1/setting'),
  services: () => get('/api/v1/services'),
  service: (slug) => get(`/api/v1/services/${encodeURIComponent(slug)}`),
  offers: () => get('/api/v1/offers'),
  offer: (slug) => get(`/api/v1/offers/${encodeURIComponent(slug)}`),
  packages: () => get('/api/v1/packages'),
  package: (slug) => get(`/api/v1/packages/${encodeURIComponent(slug)}`),
  blog: (params = '') => get(`/api/v1/blog${params ? `?${params}` : ''}`),
  article: (slug) => get(`/api/v1/blog/${encodeURIComponent(slug)}`),
  faqs: (page = 'home') => get(`/api/v1/faqs?page=${encodeURIComponent(page)}`),
  cities: () => get('/api/v1/cities'),
  neighborhoods: (cityId) => get(`/api/v1/neighborhoods?city_id=${encodeURIComponent(cityId)}`),
  availability: (slug, date) =>
    get(`/api/v1/services/${encodeURIComponent(slug)}/availability?date=${encodeURIComponent(date)}`),

  // OTP authentication
  requestOtp: (payload) => post('/api/v1/customer/auth/request-otp', payload),
  async verifyOtp(payload) {
    const response = await post('/api/v1/customer/auth/verify-otp', payload)
    const token = response?.data?.access_token
    if (token) tokenStorage.set(token)
    return response
  },
  async register(payload) {
    const response = await post('/api/v1/customer/auth/register', payload)
    const data = response?.data ?? response ?? {}
    const token =
      data.access_token ??
      data.token?.access_token ??
      data.token?.plainTextToken ??
      data.token ??
      response?.access_token
    if (typeof token === 'string' && token) tokenStorage.set(token)
    return response
  },
  logout: () => tokenStorage.clear(),
  isAuthenticated: () => Boolean(tokenStorage.get()),

  // Authenticated account
  account: () => get('/api/v1/account'),
  accountBookings: (status = '') =>
    get(`/api/v1/account/bookings?status=${encodeURIComponent(status)}`),
  notifications: () => get('/api/v1/account/notifications'),
  markNotificationRead: (id) => post(`/api/v1/account/notifications/${encodeURIComponent(id)}/read`, {}),
  bookingDetails: (reference, phone = '') =>
    get(`/api/v1/bookings/${encodeURIComponent(reference)}?phone=${encodeURIComponent(phone)}`),
  cancelBooking: (reference, reason = '') =>
    post(`/api/v1/bookings/${encodeURIComponent(reference)}/cancel`, { reason }),

  // Quote then booking, matching the Laravel collection exactly
  quoteBooking: (payload) => post('/api/v1/booking/quote', payload),
  createBooking: (payload) => post('/api/v1/bookings', payload),

  // Remaining public features exposed by the supplied Laravel collection
  giftCards: () => get('/api/v1/gift-cards'),
  quoteGiftCard: (payload) => post('/api/v1/gift-cards/quote', payload),
  createGiftCard: (payload) => post('/api/v1/gift-cards', payload),
  validatePromo: (code, phone = '') =>
    get(`/api/v1/promo/check-has-valid-code?code=${encodeURIComponent(code)}&phone=${encodeURIComponent(phone)}`),
  contact: (payload) => post('/api/v1/feedback', payload),

  // Rewards
  spinRewards: () => get('/api/v1/spin-rewards'),
  spin: (payload) => post('/api/v1/spin', payload),
}

// Re-export token helpers for stores without exposing localStorage details.
export { tokenStorage }
