/**
 * Catalogue store — services, offers, packages, reviews, editorial and the
 * static home-page content. Every fetch is idempotent: components can call
 * `ensureLoaded()` freely and only the first call hits the API.
 */

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  fetchArticles,
  fetchCategories,
  fetchCities,
  fetchHomeContent,
  fetchOffers,
  fetchPackages,
  fetchReviews,
  fetchServices,
  fetchService,
} from '@/utils/api'
import { doctolApi } from '@/services/doctolApi'
import { apiData, mapNeighborhood } from '@/services/apiMappers'

export const useServicesStore = defineStore('services', () => {
  const services = ref([])
  const categories = ref([])
  const offers = ref([])
  const packages = ref([])
  const reviews = ref([])
  const ratingSummary = ref(null)
  const articles = ref([])
  const cities = ref([])
  const trustFeatures = ref([])
  const stats = ref([])
  const experienceSteps = ref([])
  const beforeAfterCases = ref([])
  const faqs = ref([])
  const discoveryOptions = ref([])
  const homeHero = ref({})
  const neighborhoodsByCity = ref({})

  const loading = ref(false)
  const error = ref(null)
  let loadPromise = null

  const isReady = computed(() => services.value.length > 0)

  const popularServices = computed(() => services.value.filter((s) => s.popular))

  const serviceById = computed(
    () => (id) => services.value.find((s) => String(s.id) === String(id) || s.slug === id) ?? null,
  )

  const cityById = computed(() => (id) => cities.value.find((c) => String(c.id) === String(id)) ?? null)

  const neighborhoodsForCity = computed(() => (cityId) => {
    const city = cityById.value(cityId)
    const items = neighborhoodsByCity.value[cityId] ?? city?.neighborhoods ?? city?.districts ?? []
    return items.map((item, index) =>
      typeof item === 'string' ? { id: item, name: item } : { id: item.id ?? index, name: item.name ?? item.title ?? '' },
    )
  })

  /** Cheapest starting price across the catalogue — used in hero copy. */
  const lowestPrice = computed(() =>
    services.value.length ? Math.min(...services.value.map((s) => s.startingPrice)) : 0,
  )

  async function ensureLoaded() {
    if (isReady.value) return
    if (loadPromise) return loadPromise

    loading.value = true
    error.value = null

    loadPromise = Promise.all([
      fetchServices(),
      fetchOffers(),
      fetchPackages(),
      fetchReviews(),
      fetchArticles(),
      fetchHomeContent(),
      fetchCities(),
      fetchCategories(),
    ])
      .then(([svc, off, pkg, rev, art, home, cty, cat]) => {
        services.value = svc
        categories.value = cat
        offers.value = off
        packages.value = pkg
        reviews.value = rev.items
        ratingSummary.value = rev.summary
        articles.value = art
        cities.value = cty
        trustFeatures.value = home.trustFeatures
        stats.value = home.stats
        experienceSteps.value = home.experienceSteps
        beforeAfterCases.value = home.beforeAfterCases
        faqs.value = home.faqs
        discoveryOptions.value = home.discoveryOptions
        homeHero.value = home.hero ?? {}
      })
      .catch((err) => {
        error.value = err?.message ?? 'تعذّر تحميل البيانات'
        throw err
      })
      .finally(() => {
        loading.value = false
        loadPromise = null
      })

    return loadPromise
  }

  async function loadNeighborhoods(cityId) {
    if (!cityId) return []
    // Keep successful results cached, but retry an earlier empty/failed load.
    // Otherwise a transient request failure permanently leaves the district
    // select empty for the rest of the session.
    if (neighborhoodsByCity.value[cityId]?.length) return neighborhoodsByCity.value[cityId]
    try {
      const items = apiData.list(await doctolApi.neighborhoods(cityId)).map(mapNeighborhood)
      neighborhoodsByCity.value = { ...neighborhoodsByCity.value, [cityId]: items }
      return items
    } catch {
      const fallback = neighborhoodsForCity.value(cityId)
      neighborhoodsByCity.value = { ...neighborhoodsByCity.value, [cityId]: fallback }
      return fallback
    }
  }

  async function loadService(idOrSlug) {
    if (!idOrSlug) return null
    const detail = await fetchService(idOrSlug)
    if (!detail) return null
    const index = services.value.findIndex(
      (item) => String(item.id) === String(detail.id) || item.slug === detail.slug || item.slug === idOrSlug,
    )
    if (index >= 0) services.value.splice(index, 1, { ...services.value[index], ...detail })
    else services.value.push(detail)
    return detail
  }

  /** Filters the catalogue by category id and free-text query. */
  function filterServices({ category = 'all', query = '' } = {}) {
    const q = query.trim()
    return services.value.filter((service) => {
      const inCategory =
        category === 'all' ||
        service.categoryId === category ||
        (category === 'other' && ['pools', 'cars', 'pest'].includes(service.categoryId))
      if (!inCategory) return false
      if (!q) return true
      const haystack = [service.name, service.summary, service.tagline, ...(service.tags ?? [])]
        .join(' ')
        .toLowerCase()
      return haystack.includes(q.toLowerCase())
    })
  }

  return {
    services,
    categories,
    offers,
    packages,
    reviews,
    ratingSummary,
    articles,
    cities,
    trustFeatures,
    stats,
    experienceSteps,
    beforeAfterCases,
    faqs,
    discoveryOptions,
    homeHero,
    neighborhoodsByCity,
    loading,
    error,
    isReady,
    popularServices,
    serviceById,
    cityById,
    neighborhoodsForCity,
    lowestPrice,
    ensureLoaded,
    loadNeighborhoods,
    loadService,
    filterServices,
  }
})
