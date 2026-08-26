/**
 * API layer.
 *
 * Every network-shaped read/write in the app goes through this module. Today it
 * resolves from `src/data/*` with simulated latency; to connect the Laravel
 * backend, replace each function body with a `request()` call and delete the
 * `mock*` helpers — no component or store needs to change.
 *
 *   const BASE = import.meta.env.VITE_API_BASE ?? '/api/v1'
 *   export const fetchServices = () => request('/services')
 */

import { services, discoveryOptions, categories } from '@/data/services'
import { offers } from '@/data/offers'
import { packages } from '@/data/packages'
import { reviews, ratingSummary } from '@/data/reviews'
import {
  articles,
  beforeAfterCases,
  cities,
  experienceSteps,
  faqs,
  stats,
  trustFeatures,
} from '@/data/content'
import { toISODate } from '@/utils/format'
import { doctolApi } from '@/services/doctolApi'
import {
  apiData,
  mapCategory,
  mapCity,
  mapOffer,
  mapPackage,
  mapService,
  mapBookableServices,
  mapMediaUrl,
} from '@/services/apiMappers'

/** Simulated latency band, kept short enough that the demo stays snappy. */
const LATENCY = [180, 420]

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function delay() {
  const [min, max] = LATENCY
  return wait(min + Math.random() * (max - min))
}

/**
 * Deep copy that behaves like a JSON round-trip over the wire.
 *
 * Deliberately not `structuredClone`: everything crossing this boundary is
 * about to become a JSON request or response body, and `structuredClone`
 * throws on values JSON simply drops — Vue reactive proxies, `File` handles,
 * functions. A real `fetch` would never fail for those reasons, so the mock
 * must not either.
 */
function wireClone(payload) {
  return payload === undefined ? undefined : JSON.parse(JSON.stringify(payload))
}

async function resolve(payload) {
  await delay()
  // A fresh object every call, exactly as a real fetch would hand back.
  return wireClone(payload)
}

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */

let remoteServices = []

const categorySlugMap = {
  'rehabilitation-cleaning': 'rehab',
  'furniture-cleaning': 'furniture',
  'pools-and-tanks': 'pools',
  'mosque-cleaning': 'mosques',
  'commercial-cleaning': 'commercial',
  'car-cleaning': 'cars',
  'pest-control': 'pest',
}

function localCategoryFor(item, index = 0) {
  const remoteSlug = item?.parentServiceSlug ?? item?.parent_service_slug ?? item?.slug
  const localId = categorySlugMap[remoteSlug]
  return categories.find((entry) => entry.id === localId)
    ?? categories.find((entry) => entry.name === (item?.title ?? item?.name))
    ?? categories[index % categories.length]
}

function withLocalServiceMedia(item, index = 0) {
  const local = services.find((entry) => entry.id === item.slug || entry.slug === item.slug)
    ?? services.find((entry) => entry.name === item.name)
  const category = localCategoryFor(item, index)
  const fallbackImage = local?.image || category?.photo || category?.image || ''
  return {
    ...(local ?? {}),
    ...item,
    image: item.image || fallbackImage,
    fallbackImage,
    icon: item.icon || local?.icon || category?.icon || 'sparkle',
  }
}

async function remoteOrFallback(loader, fallback) {
  try {
    const value = await loader()
    return value ?? fallback
  } catch (error) {
    if (import.meta.env.DEV) console.warn('[Doctol API] Using local fallback:', error.message)
    return resolve(fallback)
  }
}

export const fetchServices = () =>
  remoteOrFallback(async () => {
    const source = apiData.list(await doctolApi.services())
    let mapped = mapBookableServices(source)

    // Some Laravel list serializers expose only the parent service. The
    // detail resource contains its sub-services, so enrich those parents
    // before falling back to the list representation.
    if (mapped.length && mapped.every((item) => !item.isSubService)) {
      const detailed = await Promise.all(source.map(async (item) => {
        try {
          return apiData.unwrap(await doctolApi.service(item.slug), item)
        } catch {
          return item
        }
      }))
      const expanded = mapBookableServices(detailed)
      if (expanded.some((item) => item.isSubService)) mapped = expanded
    }

    remoteServices = mapped.map(withLocalServiceMedia)
    return remoteServices.length ? remoteServices : services
  }, services)

export const fetchCategories = () =>
  remoteOrFallback(async () => {
    const serviceSource = apiData.list(await doctolApi.services())
    if (!remoteServices.length) remoteServices = mapBookableServices(serviceSource).map(withLocalServiceMedia)
    const source = serviceSource
      .map((item) => {
        const nested = item.category ?? (typeof item.main_service === 'object' ? item.main_service : null)
        return nested || (item.main_service === true ? item : null)
      })
      .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    if (source.length) {
      return [...new Map(source.map((item) => [item.id ?? item.slug, item])).values()]
        .map((item, index) => {
          const remote = mapCategory(item, index)
          const local = localCategoryFor(item, index)
          const fallbackImage = local?.photo || local?.image || ''
          return {
            ...local,
            ...remote,
            name: remote.name === 'خدمات أخرى' ? (local?.name ?? remote.name) : remote.name,
            image: remote.image || local?.image || fallbackImage,
            photo: remote.photo || local?.photo || local?.image || '',
            fallbackImage,
            icon: remote.icon === 'grid' ? (local?.icon ?? remote.icon) : remote.icon,
          }
        })
    }
    const derived = [...new Map(remoteServices.map((item) => [
      String(item.categoryId || 'other'),
      {
        id: String(item.categoryId || 'other'),
        slug: String(item.categoryId || 'other'),
        name: item.category?.name ?? item.category_name ?? 'خدمات أخرى',
        icon: item.category?.icon ?? 'grid',
      },
    ])).values()]
    return derived.length ? derived.map(mapCategory) : categories
  }, categories)
export const fetchService = (idOrSlug) =>
  remoteOrFallback(async () => {
    const response = apiData.unwrap(await doctolApi.service(idOrSlug), {})
    const source = response?.service ?? response?.item ?? response
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      throw new ApiError('الخدمة غير موجودة', 404)
    }
    const mapped = mapService(source)
    return withLocalServiceMedia(mapped)
  }, services.find((s) => s.id === idOrSlug || s.slug === idOrSlug) ?? null)
export const fetchOffers = () =>
  remoteOrFallback(async () => {
    const result = apiData.list(await doctolApi.offers()).map(mapOffer)
    return result.length ? result.map((item, index) => {
      const local = offers.find((entry) => entry.id === item.slug || entry.id === item.id) ?? offers[index % offers.length]
      return {
        ...local,
        ...item,
        image: item.image || local.image,
        fallbackImage: local.image,
        highlights: item.highlights?.length ? item.highlights : local.highlights,
      }
    }) : offers
  }, offers)
export const fetchPackages = () =>
  remoteOrFallback(async () => {
    const source = apiData.list(await doctolApi.packages())
    if (!source.length) return []

    // The list serializer may omit package services, media or perks. Enrich
    // every row from Laravel's package-detail endpoint, but never merge it
    // with src/data/packages.js: a successful remote response must remain the
    // single source of truth for the name, price, image and included services.
    const detailed = await Promise.all(source.map(async (summary) => {
      const slug = summary.slug ?? summary.id
      if (!slug) return summary
      try {
        const response = apiData.unwrap(await doctolApi.package(slug), summary)
        const detail = response?.package ?? response?.item ?? response
        return detail && typeof detail === 'object' && !Array.isArray(detail)
          ? { ...summary, ...detail }
          : summary
      } catch {
        // A failed detail request must not discard a valid package returned by
        // the list endpoint. It also must not substitute local demo content.
        return summary
      }
    }))

    return detailed
      .map(mapPackage)
      .map((item, index) => {
        const local = packages.find((entry) => entry.id === item.slug || entry.id === item.id)
          ?? packages.find((entry) => entry.name === item.name)
          ?? packages[index % packages.length]
        return {
          ...item,
          image: item.image || local?.image || '',
          fallbackImage: local?.image || '',
        }
      })
      .filter((item) => item.slug && item.isActive !== false && item.isBookable !== false)
  }, [])
function mapReview(item, index = 0) {
  const local = reviews[index % reviews.length] ?? {}
  return {
    ...local,
    ...item,
    id: item.id ?? `review-${index}`,
    name: localizedText(item.customer_name ?? item.client_name ?? item.name, local.name ?? 'عميل دكتول'),
    city: localizedText(item.city?.name ?? item.city_name ?? item.city, local.city ?? ''),
    district: localizedText(item.neighborhood?.name ?? item.district ?? item.neighborhood_name, local.district ?? ''),
    rating: Number(item.rating ?? item.stars ?? local.rating ?? 5),
    text: localizedText(item.comment ?? item.review ?? item.content ?? item.text, local.text ?? ''),
    serviceLabel: localizedText(item.service?.name ?? item.service_name ?? item.service, local.serviceLabel ?? ''),
    date: localizedText(item.date_label ?? item.created_at ?? item.date, local.date ?? ''),
    verified: item.verified ?? item.is_verified ?? true,
    photo: mapMediaUrl(mediaUrl(item.photo_url ?? item.image_url ?? item.photo ?? item.image)) || local.photo || '',
  }
}

export const fetchReviews = () =>
  remoteOrFallback(async () => {
    const home = apiData.unwrap(await doctolApi.home(), {})
    const source =
      home.reviews ??
      home.testimonials ??
      home.customer_reviews ??
      home.reviews_section?.items ??
      home.testimonials_section?.items ??
      []
    const items = Array.isArray(source) ? source.map(mapReview) : []
    const summarySource = home.rating_summary ?? home.reviews_summary ?? home.reviews_section?.summary ?? {}
    const summary = {
      average: Number(summarySource.average ?? summarySource.rating ?? home.average_rating ?? ratingSummary.average),
      total: Number(summarySource.total ?? summarySource.count ?? home.reviews_count ?? ratingSummary.total),
      breakdown: summarySource.breakdown ?? ratingSummary.breakdown,
    }
    return { items: items.length ? items : reviews, summary }
  }, { items: reviews, summary: ratingSummary })
/**
 * The index only ever renders the teaser fields, so the list endpoint projects
 * them out and leaves the article body to `fetchArticle`. A real API would draw
 * the same line; keeping it here means the store never holds eight full bodies
 * it has no use for.
 */
const teaser = ({ sections, faq, takeaways, cta, intro, related, ...rest }) => rest

function localizedText(value, fallback = '') {
  if (value == null) return fallback
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        return localizedText(JSON.parse(trimmed), fallback)
      } catch {
        return trimmed
      }
    }
    return trimmed || fallback
  }
  if (typeof value === 'object') {
    return localizedText(
      value.ar ?? value.name_ar ?? value.title_ar ?? value.name ?? value.title ?? value.label ?? value.en,
      fallback,
    )
  }
  return String(value)
}

function mediaUrl(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return mediaUrl(value[0])
  if (typeof value === 'object') {
    return mediaUrl(value.url ?? value.original_url ?? value.full_url ?? value.path ?? value.src)
  }
  return ''
}

export const fetchArticles = () =>
  remoteOrFallback(async () => {
    const result = apiData.list(await doctolApi.blog('page=1&per_page=20'))
    return result.length ? result.map((item, index) => {
      const local = articles.find((entry) => entry.slug === item.slug) ?? articles[index % articles.length]
      const category = item.category ?? item.blog_category ?? item.category_name
      const remoteImage = mapMediaUrl(mediaUrl(
        item.image_url ??
        item.cover_image_url ??
        item.featured_image_url ??
        item.thumbnail_url ??
        item.image ??
        item.cover_image ??
        item.featured_image ??
        item.thumbnail ??
        item.media,
      ))
      return {
        ...local,
        ...item,
        id: item.id ?? local.id,
        slug: item.slug ?? local.slug,
        title: localizedText(item.title ?? item.name, local.title),
        excerpt: localizedText(
          item.excerpt ?? item.short_description ?? item.description,
          local.excerpt,
        ),
        category: localizedText(category?.name ?? category?.title ?? category, local.category),
        categoryId: category?.slug ?? item.category_slug ?? item.category_id ?? local.categoryId,
        image: remoteImage || local.image,
        fallbackImage: local.image,
        readingTime: localizedText(
          item.reading_time ?? item.read_time ?? item.display_reading_time,
          local.readingTime,
        ),
        iso: item.published_at ?? item.date ?? item.created_at ?? local.iso,
      }
    }) : articles.map(teaser)
  }, articles.map(teaser))
export const fetchArticle = (slug) =>
  remoteOrFallback(async () => {
    const response = apiData.unwrap(await doctolApi.article(slug), {})
    const item = response?.article ?? response?.item ?? response
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new ApiError('المقال غير موجود', 404)
    }
    const local = articles.find((entry) => entry.slug === slug) ?? {}
    const remoteImage = mapMediaUrl(mediaUrl(
      item.image_url ?? item.cover_image_url ?? item.featured_image_url ?? item.image ?? item.media,
    ))
    return {
      ...local,
      ...item,
      slug: item.slug ?? slug,
      title: localizedText(item.title ?? item.name, local.title),
      excerpt: localizedText(item.excerpt ?? item.short_description ?? item.description, local.excerpt),
      intro: localizedText(item.intro ?? item.summary ?? item.description, local.intro),
      category: localizedText(item.category?.name ?? item.category_name ?? item.category, local.category),
      image: remoteImage || local.image,
      fallbackImage: local.image || '',
      readingTime: localizedText(item.reading_time ?? item.read_time, local.readingTime),
      iso: item.published_at ?? item.created_at ?? item.date ?? local.iso,
      sections: Array.isArray(item.sections) && item.sections.length ? item.sections : local.sections,
      faq: Array.isArray(item.faq) ? item.faq : local.faq,
      takeaways: Array.isArray(item.takeaways) ? item.takeaways : local.takeaways,
      related: Array.isArray(item.related) ? item.related : local.related,
      cta: item.cta ?? local.cta,
    }
  }, articles.find((a) => a.slug === slug) ?? null)
export const fetchHomeContent = () =>
  remoteOrFallback(async () => {
    const home = apiData.unwrap(await doctolApi.home(), {})
    const remoteFaqs = apiData.list(await doctolApi.faqs('home'))
    const heroSection = home.heroes_section ?? home.hero_section ?? home.hero ?? {}
    const heroInfo = heroSection.info ?? heroSection.content ?? heroSection
    return {
      trustFeatures: home.trust_features ?? home.features ?? trustFeatures,
      stats: home.stats ?? stats,
      experienceSteps: home.experience_steps ?? home.how_it_works ?? experienceSteps,
      beforeAfterCases: home.before_after ?? home.before_after_cases ?? beforeAfterCases,
      faqs: remoteFaqs.length ? remoteFaqs : (home.faqs ?? faqs),
      discoveryOptions: home.discovery_options ?? discoveryOptions,
      hero: {
        title: localizedText(heroInfo.title ?? heroInfo.heading, ''),
        description: localizedText(heroInfo.description ?? heroInfo.subtitle, ''),
        eyebrow: localizedText(heroInfo.eyebrow ?? heroInfo.badge_text, ''),
        buttonText: localizedText(heroInfo.button_1_text ?? heroInfo.button_text, ''),
        image: mapMediaUrl(mediaUrl(heroInfo.image_url ?? heroInfo.image ?? heroSection.image)),
        checks: Array.isArray(heroInfo.features ?? heroInfo.checks)
          ? (heroInfo.features ?? heroInfo.checks).map((item) => localizedText(item?.title ?? item?.label ?? item)).filter(Boolean)
          : [],
      },
      raw: home,
    }
  }, { trustFeatures, stats, experienceSteps, beforeAfterCases, faqs, discoveryOptions, hero: {}, raw: {} })
export const fetchCities = () =>
  remoteOrFallback(async () => {
    const result = apiData.list(await doctolApi.cities()).map(mapCity)
    return result.length ? result : cities
  }, cities)

/* ------------------------------------------------------------------ */
/* Availability                                                        */
/* ------------------------------------------------------------------ */

const SLOT_TIMES = [
  '08:00',
  '10:00',
  '12:00',
  '14:00',
  '16:00',
  '18:00',
  '20:00',
]

/**
 * Deterministic pseudo-availability so a given date always looks the same
 * within a session (a real endpoint reads the dispatch calendar).
 */
function slotSeed(dateISO, time) {
  let h = 0
  const key = `${dateISO}${time}`
  for (let i = 0; i < key.length; i += 1) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return h
}

export async function fetchAvailability(dateISO, serviceSlug = '') {
  if (serviceSlug) {
    try {
      const response = await doctolApi.availability(serviceSlug, dateISO)
      const data = apiData.unwrap(response, {})
      const slots = Array.isArray(data)
        ? data
        : (
            data.slots ??
            data.available_slots ??
            data.time_slots ??
            data.available_times ??
            data.times ??
            data.windows ??
            data.availability ??
            []
          )
      if (slots.length) {
        return slots.map((slot) => {
          const time = typeof slot === 'string'
            ? slot
            : (slot.time ?? slot.start_time ?? slot.start ?? slot.from)
          const available = typeof slot === 'string' ? true : Boolean(slot.available ?? slot.is_available ?? slot.status !== 'booked')
          const remaining = Number(slot.remaining ?? slot.remaining_teams ?? (available ? 1 : 0))
          return { time, available, remaining, lowStock: available && remaining === 1 }
        }).filter((slot) => Boolean(slot.time))
      }
      return []
    } catch (error) {
      if (import.meta.env.DEV) console.warn('[Doctol API] Availability request failed:', error.message)
      // Never invent selectable times after a Laravel failure. A synthetic
      // slot can look valid in Vue but will be rejected by booking/quote.
      return []
    }
  }
  return []
}

/** Next 14 bookable days. */
export async function fetchBookableDays() {
  await delay()
  const out = []
  const today = new Date()
  for (let i = 0; i < 14; i += 1) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    out.push({ date: toISODate(d), full: slotSeed(toISODate(d), 'day') % 11 === 0 })
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Bookings                                                            */
/* ------------------------------------------------------------------ */

export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/**
 * Simulated create-booking. Rejects for one magic phone number so the error
 * state is reachable in a demo without touching code.
 */
export async function createBooking(payload) {
  return doctolApi.createBooking(payload)
}

/** Promo codes accepted by the demo checkout. */
const PROMOS = {
  DOCTOL10: { type: 'percent', value: 10, label: 'خصم 10٪' },
  CLEAN50: { type: 'fixed', value: 50, label: 'خصم 50 ريال' },
  WELCOME: { type: 'percent', value: 15, label: 'خصم الترحيب 15٪' },
}

export async function validatePromo(code) {
  const key = String(code || '').trim().toUpperCase()
  try {
    const response = await doctolApi.validatePromo(key)
    const data = apiData.unwrap(response, {})
    if (data.valid === false) throw new ApiError(data.message ?? 'كود الخصم غير صالح.', 422)
    return {
      code: key,
      type: data.type ?? data.discount_type ?? 'percent',
      value: Number(data.value ?? data.discount_value ?? data.discount ?? 0),
      label: data.label ?? data.message ?? `تم تطبيق الكود ${key}`,
    }
  } catch (error) {
    if (!import.meta.env.DEV) throw error
    const promo = PROMOS[key]
    if (!promo) throw error
    return { code: key, ...promo }
  }
}
