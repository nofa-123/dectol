/**
 * Formatting helpers.
 * Arabic UI, Gregorian calendar, Latin digits everywhere — prices, dates,
 * counters and phone numbers all render as 0-9, which is what Saudi users
 * expect on invoices and what keeps numbers readable inside an RTL layout.
 */

/** Any Arabic-Indic (٠-٩) or Persian (۰-۹) digit that sneaks in, mapped to 0-9. */
const NON_LATIN_DIGITS = /[\u0660-\u0669\u06F0-\u06F9]/g

/** "١٢٥٠" → "1250" — also a safe pass-through for values that are already Latin. */
export function toLatinDigits(value) {
  return String(value ?? '').replace(NON_LATIN_DIGITS, (d) => {
    const code = d.charCodeAt(0)
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660)
  })
}

const priceFormatter = new Intl.NumberFormat('ar-SA-u-nu-latn', {
  maximumFractionDigits: 0,
})

/** 1250 → "1,250 ريال" */
export function formatPrice(value, { withCurrency = true } = {}) {
  const num = priceFormatter.format(Math.round(Number(value) || 0))
  return withCurrency ? `${num} ريال` : num
}

const dayFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn', {
  weekday: 'long',
})

const dateFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const shortDateFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn', {
  day: 'numeric',
  month: 'long',
})

export const formatWeekday = (date) => dayFormatter.format(new Date(date))
export const formatDate = (date) => dateFormatter.format(new Date(date))
export const formatShortDate = (date) => shortDateFormatter.format(new Date(date))

/** ISO `YYYY-MM-DD` in local time — avoids the UTC shift of toISOString(). */
export function toISODate(date) {
  const d = new Date(date)
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function isSameDay(a, b) {
  return toISODate(a) === toISODate(b)
}

/** "اليوم" / "غداً" / weekday name — used on the date chips. */
export function relativeDayLabel(date) {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  if (isSameDay(date, today)) return 'اليوم'
  if (isSameDay(date, tomorrow)) return 'غداً'
  return formatWeekday(date)
}

/** "10:00" → "10:00 صباحاً" */
export function formatTimeLabel(time24) {
  const [h, m] = time24.split(':').map(Number)
  const period = h < 12 ? 'صباحاً' : h < 17 ? 'ظهراً' : 'مساءً'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

/** Splits a future timestamp into countdown parts, clamped at zero. */
export function countdownParts(target) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now())
  const totalSeconds = Math.floor(diff / 1000)
  return {
    expired: diff === 0,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

export const PHONE_MAX_DIGITS = 10

/**
 * Sanitiser for phone *inputs*: normalises Arabic-Indic digits, drops anything
 * that isn't 0-9 and caps the length. Returns bare digits with no grouping —
 * inserting spaces while the user types breaks editing (the caret jumps to the
 * end on every keystroke) and, under `dir="rtl"`, the bidi algorithm reorders
 * the space-separated groups so the number renders scrambled. Group for display
 * only, via `formatPhone` below.
 */
export function sanitizePhoneInput(value) {
  const digits = toLatinDigits(value).replace(/\D/g, '')
  if (/^9665\d{0,8}$/.test(digits)) return `0${digits.slice(3)}`.slice(0, PHONE_MAX_DIGITS)
  if (/^5\d{8}$/.test(digits)) return `0${digits}`
  return digits.slice(0, PHONE_MAX_DIGITS)
}

/**
 * Saudi mobile display grouping: 0512345678 → 05 1234 5678.
 * Read-only surfaces only (summaries, receipts, confirmation cards) and always
 * inside a `.num` element so the LTR isolation keeps the groups in order.
 */
export function formatPhone(value) {
  const digits = sanitizePhoneInput(value)
  const parts = [digits.slice(0, 2), digits.slice(2, 6), digits.slice(6, 10)].filter(Boolean)
  return parts.join(' ')
}

/** Stable short reference for a booking, e.g. "DT-4F29K". */
export function bookingReference() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < 5; i += 1) out += chars[Math.floor(Math.random() * chars.length)]
  return `DT-${out}`
}
