<script setup>
/**
 * Service landing page.
 *
 * One view renders all seven landings; everything comes from
 * `src/data/serviceLandings.js`. The `sl sl--{accent}` class on the root sets
 * the palette variables that every section below reads, so pages differ
 * visually without differing structurally.
 *
 * Every CTA routes into the existing booking flow with the right category and
 * service pre-selected — no separate booking form is introduced.
 */
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ServiceHero from '@/components/landing/ServiceHero.vue'
import ServiceTrustBar from '@/components/landing/ServiceTrustBar.vue'
import ServiceProblemSolution from '@/components/landing/ServiceProblemSolution.vue'
import ServiceDetailsGrid from '@/components/landing/ServiceDetailsGrid.vue'
import ServiceWhy from '@/components/landing/ServiceWhy.vue'
import ServiceProcess from '@/components/landing/ServiceProcess.vue'
import ServiceBookingCta from '@/components/landing/ServiceBookingCta.vue'
import StickyBookingBar from '@/components/landing/StickyBookingBar.vue'
import RelatedServices from '@/components/landing/RelatedServices.vue'
import BeforeAfterSection from '@/components/beforeAfter/BeforeAfterSection.vue'
import VideoGallery from '@/components/video/VideoGallery.vue'
import FaqSection from '@/components/faq/FaqSection.vue'
import { landingBySlug } from '@/data/serviceLandings'
import { videosFor } from '@/data/videos'
import { breadcrumbSchema, faqSchema, serviceSchema, useSeo } from '@/composables/useSeo'
import { useBooking } from '@/composables/useBooking'
import { useServicesStore } from '@/stores/servicesStore'
import { scrollBehavior } from '@/utils/motion'

const route = useRoute()
const router = useRouter()
const catalogue = useServicesStore()
const { open } = useBooking()

const landing = computed(() => landingBySlug(route.params.landing))
const videos = computed(() => (landing.value ? videosFor(landing.value.slug) : []))

/** Pages alternate the problem/solution order so the set doesn't feel cloned. */
const FLIPPED = new Set(['furniture-cleaning', 'mosque-cleaning', 'pest-control'])
const flip = computed(() => FLIPPED.has(landing.value?.slug))

watch(
  landing,
  (value) => {
    if (!value) router.replace({ name: 'not-found' })
  },
  { immediate: true },
)

watch(
  () => route.params.landing,
  () => window.scrollTo({ top: 0, behavior: scrollBehavior() }),
)

catalogue.ensureLoaded()

useSeo(
  computed(() => {
    if (!landing.value) return null
    const url = `${window.location.origin}/services/${landing.value.slug}`
    return {
      title: landing.value.seo.title,
      description: landing.value.seo.description,
      keywords: landing.value.seo.keywords,
      image: landing.value.heroImage,
      type: 'website',
      jsonLd: [
        serviceSchema({
          name: landing.value.name,
          description: landing.value.seo.description,
          url,
          image: new URL(landing.value.heroImage, window.location.origin).href,
          priceFrom: landing.value.priceFrom,
        }),
        faqSchema(landing.value.faq),
        breadcrumbSchema([
          { name: 'الرئيسية', url: window.location.origin + '/' },
          { name: 'الخدمات', url: window.location.origin + '/services' },
          { name: landing.value.name, url },
        ]),
      ],
    }
  }),
)

/** Hands the visitor to the real booking flow with this service pre-selected. */
function book() {
  open({
    category: landing.value.booking.category,
    serviceId: landing.value.booking.service ?? null,
  })
}
</script>

<template>
  <div v-if="landing" class="sl" :class="`sl--${landing.accent}`">
    <ServiceHero :landing="landing" @book="book" />
    <ServiceTrustBar :items="landing.trust" />
    <ServiceProblemSolution :problem="landing.problem" :solution="landing.solution" :flip="flip" />
    <ServiceDetailsGrid :details="landing.details" @book="book" />
    <ServiceWhy :items="landing.why" />
    <ServiceProcess :steps="landing.process" />

    <BeforeAfterSection
      v-if="landing.beforeAfter?.length"
      :cases="landing.beforeAfter"
      title="شاهد الفرق"
      subtitle="اسحب الفاصل وشوف النتيجة بنفسك — كل الصور من أعمال نفّذها فريق دكتول."
      :cta-label="`احجز ${landing.navLabel}`"
      @book="book"
    />

    <VideoGallery
      :items="videos"
      layout="rail"
      tone="sunken"
      eyebrow="ألبوم الفيديوهات"
      title="تجارب حقيقية من عملائنا"
      subtitle="لا نخبرك فقط بما نستطيع فعله… شاهد ما يقوله عملاؤنا."
    />

    <FaqSection
      :items="landing.faq"
      eyebrow="أسئلة شائعة"
      :title="`أسئلة عن ${landing.navLabel}`"
      subtitle="ما لقيت جوابك؟ فريق دكتول جاهز يرد عليك مباشرة."
    />

    <ServiceBookingCta :landing="landing" @book="book" />
    <RelatedServices :slugs="landing.related" />

    <StickyBookingBar :landing="landing" @book="book" />
  </div>
</template>

<style scoped>
/* Accent variables come from src/styles/landing.css via the .sl--* class. */
.sl {
  display: block;
}
</style>
