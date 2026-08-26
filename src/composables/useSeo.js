/**
 * Per-page SEO without a meta framework.
 *
 * Vue's router only sets `document.title`; everything a crawler and a social
 * card need — description, canonical, Open Graph, Twitter, JSON-LD — is applied
 * here and torn down on unmount so pages never leak each other's tags.
 *
 * Tags this composable owns are marked `data-seo`, so removal is exact and
 * hand-written tags in `index.html` survive untouched.
 */

import { onBeforeUnmount, unref, watchEffect } from 'vue'

const SITE = 'دكتول'
const OWNED = 'data-seo'
const TAKEN = 'data-seo-was'

/**
 * Finds the existing tag and updates it in place, creating one only when none
 * exists. Appending a second `<meta name="description">` would leave the static
 * tag from index.html first in the document — and that is the one crawlers and
 * `querySelector` read. Tags we take over remember their original value so
 * cleanup can restore rather than delete them.
 */
function claim(selector, create) {
  let el = document.head.querySelector(`${selector}[${OWNED}]`)
  if (el) return el

  el = document.head.querySelector(selector)
  if (el) {
    el.setAttribute(TAKEN, el.getAttribute('content') ?? el.getAttribute('href') ?? '')
    el.setAttribute(OWNED, '')
    return el
  }

  el = create()
  el.setAttribute(OWNED, '')
  document.head.appendChild(el)
  return el
}

function upsertMeta(selector, attrs) {
  const el = claim(selector, () => document.createElement('meta'))
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
}

function upsertLink(rel, href) {
  const el = claim(`link[rel="${rel}"]`, () => {
    const link = document.createElement('link')
    link.setAttribute('rel', rel)
    return link
  })
  el.setAttribute('href', href)
}

function setJsonLd(id, data) {
  const selector = `script[type="application/ld+json"][data-seo-id="${id}"]`
  let el = document.head.querySelector(selector)
  if (!data) {
    el?.remove()
    return
  }
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.setAttribute(OWNED, '')
    el.setAttribute('data-seo-id', id)
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

/** Restores tags we took over; removes the ones we created. */
function clearOwned() {
  document.head.querySelectorAll(`[${OWNED}]`).forEach((el) => {
    if (!el.hasAttribute(TAKEN)) {
      el.remove()
      return
    }
    const original = el.getAttribute(TAKEN)
    if (el.tagName === 'LINK') el.setAttribute('href', original)
    else el.setAttribute('content', original)
    el.removeAttribute(TAKEN)
    el.removeAttribute(OWNED)
  })
}

/**
 * @param {import('vue').Ref<Object>|Object} source
 *   { title, description, keywords?, image?, type?, jsonLd?: Object[] }
 */
export function useSeo(source) {
  watchEffect(() => {
    const seo = unref(source)
    if (!seo) return

    const title = seo.title?.includes(SITE) ? seo.title : `${seo.title} | ${SITE}`
    const url = window.location.origin + window.location.pathname
    const image = seo.image ? new URL(seo.image, window.location.origin).href : undefined

    document.title = title
    upsertMeta('meta[name="description"]', { name: 'description', content: seo.description ?? '' })
    if (seo.keywords?.length) {
      upsertMeta('meta[name="keywords"]', { name: 'keywords', content: seo.keywords.join('، ') })
    }
    upsertLink('canonical', url)

    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: seo.description ?? '',
    })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: seo.type ?? 'website' })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url })
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'ar_SA' })
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE })
    if (image) upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image })

    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: image ? 'summary_large_image' : 'summary',
    })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: seo.description ?? '',
    })
    if (image) upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image })

    // Structured data — replaced wholesale on every change.
    document.head
      .querySelectorAll('script[data-seo-id]')
      .forEach((el) => el.remove())
    ;(seo.jsonLd ?? []).forEach((block, i) => setJsonLd(`b${i}`, block))
  })

  onBeforeUnmount(clearOwned)
}

/* ------------------------------------------------------------------ */
/* Schema.org builders                                                 */
/* ------------------------------------------------------------------ */

export const faqSchema = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
})

export const serviceSchema = ({ name, description, url, image, priceFrom }) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name,
  description,
  serviceType: name,
  provider: {
    '@type': 'LocalBusiness',
    name: 'دكتول',
    telephone: '+966920015210',
    email: 'Info@doctol.com.sa',
    address: { '@type': 'PostalAddress', addressLocality: 'جدة', addressCountry: 'SA' },
  },
  areaServed: ['الرياض', 'جدة', 'مكة المكرمة', 'الدمام', 'الخبر', 'الظهران', 'الطائف'].map(
    (city) => ({ '@type': 'City', name: city }),
  ),
  url,
  ...(image ? { image } : {}),
  ...(priceFrom
    ? { offers: { '@type': 'Offer', priceCurrency: 'SAR', price: priceFrom, availability: 'https://schema.org/InStock' } }
    : {}),
})

export const breadcrumbSchema = (crumbs) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: c.url,
  })),
})
