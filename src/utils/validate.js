/**
 * Field validators. Each returns an Arabic error string, or '' when valid,
 * so callers can do `const error = validators.phone(value)`.
 */
import { toLatinDigits } from '@/utils/format'

export const validators = {
  name(value) {
    const v = (value ?? '').trim()
    if (!v) return 'الاسم مطلوب'
    if (v.length < 3) return 'اكتب الاسم كاملاً'
    if (!/^[؀-ۿa-zA-Z\s'-]+$/.test(v)) return 'الاسم يحتوي على رموز غير مسموحة'
    return ''
  },

  /**
   * Saudi mobile: 05XXXXXXXX. Spaces are tolerated and Arabic-Indic digits are
   * normalised first, so a pasted "٠٥٠١٢٣٤٥٦٧" validates like its Latin twin.
   */
  phone(value) {
    const digits = toLatinDigits(value).replace(/\D/g, '')
    if (!digits) return 'رقم الجوال مطلوب'
    const local = toSaudiLocalPhone(digits)
    if (!/^05\d{8}$/.test(local)) return 'أدخل رقم جوال سعودي صحيح'
    return ''
  },

  email(value) {
    const v = (value ?? '').trim()
    if (!v) return '' // optional field
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'صيغة البريد الإلكتروني غير صحيحة'
    return ''
  },

  city(value) {
    return value ? '' : 'اختر المدينة'
  },

  district(value) {
    return value ? '' : 'اختر الحي'
  },

  address(value) {
    const v = (value ?? '').trim()
    if (!v) return 'اكتب تفاصيل العنوان'
    if (v.length < 8) return 'أضف تفاصيل أوضح (اسم الشارع أو رقم المبنى)'
    return ''
  },
}

/** Accepts 05XXXXXXXX, 5XXXXXXXX and +9665XXXXXXXX and returns 05XXXXXXXX. */
export function toSaudiLocalPhone(value) {
  const digits = toLatinDigits(value).replace(/\D/g, '')
  if (/^9665\d{8}$/.test(digits)) return `0${digits.slice(3)}`
  if (/^5\d{8}$/.test(digits)) return `0${digits}`
  return digits
}

/** Runs a `{ field: value }` object against a `{ field: validatorName }` map. */
export function validateAll(values, schema) {
  const errors = {}
  for (const [field, rule] of Object.entries(schema)) {
    const fn = typeof rule === 'function' ? rule : validators[rule]
    const message = fn ? fn(values[field]) : ''
    if (message) errors[field] = message
  }
  return errors
}

/** 05XXXXXXXX → +9665XXXXXXXX for the API layer. */
export function normalisePhone(value) {
  const local = toSaudiLocalPhone(value)
  return `+966${local.replace(/^0/, '')}`
}
