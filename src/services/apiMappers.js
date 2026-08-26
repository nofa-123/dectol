const unwrap = (response, fallback = null) => response?.data ?? response ?? fallback
const list = (response) => {
  const value = unwrap(response, [])
  if (Array.isArray(value)) return value
  return value?.items ?? value?.data ?? value?.results ?? []
}

const number = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const mediaValue = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return mediaValue(value[0])
  if (typeof value === 'object') {
    return mediaValue(value.url ?? value.original_url ?? value.full_url ?? value.path ?? value.src)
  }
  return ''
}

const normalizeAssetUrl = (value) => {
  const url = mediaValue(value).trim()
  if (!url || url.startsWith('data:') || url.startsWith('blob:')) return url

  const apiBase = String(import.meta.env.VITE_API_BASE_URL || '/backend-api').replace(/\/$/, '')
  // Keep Laravel media on the same origin in both development and Vercel.
  // Besides avoiding CORS, this prevents HTTPS pages from blocking HTTP media.
  if (apiBase.startsWith('/') && /^https?:\/\/(?:195\.250\.26\.84|jstaging\.system-11\.net)(?=\/|$)/i.test(url)) {
    return `${apiBase}${url.replace(/^https?:\/\/(?:195\.250\.26\.84|jstaging\.system-11\.net)/i, '')}`
  }
  if (/^https?:\/\//i.test(url)) return url
  if (url.startsWith('/')) return `${apiBase}${url}`
  return `${apiBase}/${url}`
}

const image = (item) => normalizeAssetUrl(
  item?.image_url ??
  item?.cover_image_url ??
  item?.featured_image_url ??
  item?.photo_url ??
  item?.thumbnail_url ??
  item?.image ??
  item?.cover_image ??
  item?.featured_image ??
  item?.thumbnail ??
  item?.media,
)

export function mapService(item, index = 0) {
  const categorySource = item.category ?? item.main_service
  const category = categorySource && typeof categorySource === 'object' && !Array.isArray(categorySource)
    ? categorySource
    : {}
  const categoryId = String(item.category_id ?? category.id ?? item.main_service_id ?? 'other')
  const rawConfig = item.configuration ?? item.config ?? item.options ?? {}
  return {
    ...item,
    id: item.id ?? item.slug ?? `service-${index}`,
    slug: item.slug ?? String(item.id ?? `service-${index}`),
    // Laravel's booking/quote endpoint accepts the slug of a bookable
    // sub-service, not the slug of its parent/main service.
    bookingSlug:
      item.booking_slug ??
      item.sub_service_slug ??
      item.bookable_slug ??
      item.slug ??
      String(item.id ?? `service-${index}`),
    // Availability can be exposed on the parent/main service even though the
    // quote itself requires the bookable sub-service slug.
    availabilitySlug:
      item.availability_slug ??
      item.parent_service_slug ??
      item.main_service_slug ??
      item.parentServiceSlug ??
      item.main_service?.slug ??
      item.parent_service?.slug ??
      item.slug ??
      '',
    isSubService: Boolean(item.is_sub_service ?? item.sub_service_id ?? item.parent_service_id),
    categoryId,
    name: item.title ?? item.name ?? 'خدمة دكتول',
    shortName: item.short_title ?? item.short_name ?? item.title ?? item.name,
    summary: item.short_description ?? item.summary ?? item.description ?? '',
    tagline: item.tagline ?? item.short_description ?? '',
    description: item.description ?? '',
    image: image(item),
    icon: item.icon_url ?? item.icon ?? 'sparkle',
    startingPrice: number(item.starting_price ?? item.price ?? item.final_price),
    oldPrice: number(item.old_price ?? item.original_price),
    duration: item.duration ?? item.duration_label ?? item.duration_minutes ?? '',
    popular: Boolean(item.popular ?? item.is_popular ?? item.featured),
    tags: item.tags ?? [],
    config: Object.keys(rawConfig).length ? rawConfig : {
      kind: 'simple',
      min: 1,
      price: number(item.starting_price ?? item.price),
      unitNoun: ['خدمة', 'خدمات'],
    },
  }
}

const nestedServices = (item) => {
  if (!item || typeof item !== 'object') return []
  const candidates = [
    item.sub_services,
    item.subservices,
    item.subServices,
    item.bookable_sub_services,
    item.bookable_services,
    item.children,
  ]
  const direct = candidates.find(Array.isArray)
  if (direct) return direct
  const paginated = candidates.find((value) => Array.isArray(value?.data))
  return paginated?.data ?? []
}

const isBookable = (item) => {
  const active = item.is_active ?? item.active ?? item.enabled
  const bookable = item.is_bookable ?? item.bookable ?? item.can_book
  const status = String(item.status ?? '').toLowerCase()
  const isOff = (value) => value === false || value === 0 || value === '0' || value === 'false'
  return !isOff(active) && !isOff(bookable) && !['inactive', 'disabled', 'draft'].includes(status)
}

/**
 * Converts Laravel's main-service -> sub-services tree into the actual rows
 * selectable by the booking wizard. Parent services are kept only when the
 * API explicitly marks them as bookable or when they have no nested data.
 */
export function mapBookableServices(items = []) {
  return items.flatMap((parent, parentIndex) => {
    const children = nestedServices(parent).filter(isBookable)
    if (!children.length) return isBookable(parent) ? [mapService(parent, parentIndex)] : []

    const parentCategory =
      parent.category_id ??
      parent.main_service_id ??
      parent.main_service?.id ??
      parent.id ??
      'other'

    return children.map((child, childIndex) => mapService({
      ...parent,
      ...child,
      id: child.id ?? child.sub_service_id ?? `${parent.id ?? parentIndex}-${childIndex}`,
      slug: child.slug ?? child.sub_service_slug ?? child.booking_slug,
      booking_slug: child.booking_slug ?? child.sub_service_slug ?? child.slug,
      title: child.title ?? child.name ?? child.label,
      short_description: child.short_description ?? child.description ?? parent.short_description,
      description: child.description ?? parent.description,
      image_url: child.image_url ?? child.image ?? parent.image_url ?? parent.image,
      starting_price: child.starting_price ?? child.price ?? child.final_price ?? parent.starting_price,
      duration_minutes: child.duration_minutes ?? child.duration ?? parent.duration_minutes,
      category_id: String(parentCategory),
      category: parent.category,
      is_sub_service: true,
      parentServiceId: parent.id,
      parentServiceSlug: parent.slug,
    }, childIndex))
  })
}

export function mapCategory(item, index = 0) {
  const source = item && typeof item === 'object' && !Array.isArray(item) ? item : {}
  const id = String(source.id ?? source.slug ?? `category-${index}`)
  return {
    ...source,
    id,
    slug: source.slug ?? id,
    name: source.title ?? source.name ?? 'خدمات أخرى',
    icon: source.icon_url || source.icon || 'grid',
    image: image(source),
    photo: normalizeAssetUrl(source.photo_url ?? source.photo),
  }
}

export function mapOffer(item, index = 0) {
  return {
    ...item,
    id: item.id ?? item.slug ?? `offer-${index}`,
    slug: item.slug ?? String(item.id ?? `offer-${index}`),
    title: item.title ?? item.name ?? 'عرض دكتول',
    subtitle: item.short_description ?? item.subtitle ?? item.description ?? '',
    description: item.description ?? '',
    image: image(item),
    price: number(item.sale_price ?? item.discounted_price ?? item.price),
    oldPrice: number(item.old_price ?? item.original_price ?? item.price_before_discount),
    discount: number(item.discount_percentage ?? item.discount),
    serviceId: item.service_id ?? item.service?.id ?? item.service_slug,
    highlights: item.highlights ?? item.includes ?? [],
    endsAt: item.ends_at ?? item.end_date ?? null,
  }
}

export function mapPackage(item, index = 0) {
  const itemSource = item.items ?? item.services ?? item.package_items ?? item.included_services ?? []
  const items = Array.isArray(itemSource) ? itemSource : (itemSource?.data ?? itemSource?.items ?? [])
  const perkSource = item.perks ?? item.highlights ?? item.features ?? []
  const perks = Array.isArray(perkSource) ? perkSource : (perkSource?.data ?? perkSource?.items ?? [])
  return {
    ...item,
    id: item.id ?? item.slug ?? `package-${index}`,
    slug: item.slug ?? String(item.id ?? `package-${index}`),
    name: item.title ?? item.name ?? 'باقة دكتول',
    tagline: item.short_description ?? item.tagline ?? item.description ?? '',
    description: item.description ?? '',
    image: image(item),
    price: number(item.sale_price ?? item.discounted_price ?? item.price),
    oldPrice: number(item.old_price ?? item.original_price),
    saving: number(item.saving ?? item.discount_amount ?? (number(item.old_price) - number(item.price))),
    isActive: item.is_active ?? item.active ?? item.enabled ?? true,
    isBookable: item.is_bookable ?? item.bookable ?? item.can_book ?? true,
    items: items.map((entry, itemIndex) => ({
      ...entry,
      serviceId:
        entry.sub_service_id ??
        entry.sub_service?.id ??
        entry.service_id ??
        entry.service?.id ??
        entry.id ??
        `item-${itemIndex}`,
      bookingSlug:
        entry.booking_slug ??
        entry.sub_service_slug ??
        entry.service_slug ??
        entry.sub_service?.slug ??
        entry.service?.slug ??
        entry.slug ??
        '',
      availabilitySlug:
        entry.availability_slug ??
        entry.parent_service_slug ??
        entry.main_service_slug ??
        entry.parent_service?.slug ??
        entry.main_service?.slug ??
        entry.service?.parent_service?.slug ??
        entry.service?.main_service?.slug ??
        entry.service?.slug ??
        entry.service_slug ??
        entry.slug ??
        '',
      label: entry.label ?? entry.title ?? entry.name ?? entry.service?.name ?? 'خدمة',
    })),
    perks,
  }
}

export function mapCity(item, index = 0) {
  const neighborhoods = item.neighborhoods ?? item.districts ?? []
  return {
    ...item,
    id: item.id ?? `city-${index}`,
    name: item.name ?? item.title ?? '',
    neighborhoods: neighborhoods.map((n) => ({ id: n.id ?? n.name ?? n, name: n.name ?? n.title ?? n })),
    districts: neighborhoods.map((n) => n.name ?? n.title ?? n),
  }
}

export function mapNeighborhood(item, index = 0) {
  return { id: item.id ?? `neighborhood-${index}`, name: item.name ?? item.title ?? '' }
}

export const apiData = { unwrap, list, number }
export const mapMediaUrl = normalizeAssetUrl
