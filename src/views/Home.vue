<script setup>
/**
 * Home — the full narrative:
 * hook (hero) → act (quick booking) → orient (discovery) → browse (services)
 * → tempt (offers/packages) → prove (before/after, trust, reviews) →
 * explain (timeline) → educate (blog) → resolve (FAQ) → convert (CTA).
 */
import { onMounted } from 'vue'
import HeroSection from '@/components/hero/HeroSection.vue'
import GuaranteeBanner from '@/components/trust/GuaranteeBanner.vue'
import HowWeServe from '@/components/trust/HowWeServe.vue'
import RewardsBand from '@/components/trust/RewardsBand.vue'
import QuickBookingWidget from '@/components/booking/QuickBookingWidget.vue'
import QuickLinks from '@/components/navigation/QuickLinks.vue'
import TrustStrip from '@/components/trust/TrustStrip.vue'
import SmartDiscovery from '@/components/services/SmartDiscovery.vue'
import ServicesSection from '@/components/services/ServicesSection.vue'
import OffersSection from '@/components/offers/OffersSection.vue'
import PackagesSection from '@/components/packages/PackagesSection.vue'
import BeforeAfterSection from '@/components/beforeAfter/BeforeAfterSection.vue'
import VideoGallery from '@/components/video/VideoGallery.vue'
import ServiceLandingsGrid from '@/components/landing/ServiceLandingsGrid.vue'
import WhyDoctol from '@/components/trust/WhyDoctol.vue'
import ExperienceTimeline from '@/components/trust/ExperienceTimeline.vue'
import ReviewsSection from '@/components/reviews/ReviewsSection.vue'
import BlogSection from '@/components/blog/BlogSection.vue'
import FaqSection from '@/components/faq/FaqSection.vue'
import FinalCta from '@/components/common/FinalCta.vue'
import { useServicesStore } from '@/stores/servicesStore'

const catalogue = useServicesStore()

onMounted(() => catalogue.ensureLoaded())
</script>

<template>
  <div>
    <!-- Phone order follows the mobile design end to end. Sections the design
         doesn't include, or that a new section now duplicates, stay for desktop
         but are hidden on phones via .mobile-hidden. -->
    <HeroSection />
    <QuickLinks />
    <QuickBookingWidget />
    <ServicesSection />
    <TrustStrip />
    <SmartDiscovery />
    <ServiceLandingsGrid class="mobile-hidden" />
    <OffersSection />
    <PackagesSection />
    <RewardsBand />
    <BeforeAfterSection />
    <VideoGallery filterable tone="sunken" />
    <WhyDoctol class="mobile-hidden" />
    <ExperienceTimeline class="mobile-hidden" />
    <HowWeServe />
    <GuaranteeBanner />
    <ReviewsSection />
    <BlogSection />
    <FaqSection />
    <FinalCta />
  </div>
</template>
