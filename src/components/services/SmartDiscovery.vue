<script setup>
/**
 * "What does your home need today?"
 *
 * A one-tap alternative to browsing the catalogue: the customer names a
 * symptom, we name the service. Multi-select is supported — picking three
 * needs recommends the package that covers them, which is how bundles actually
 * get discovered.
 */
import { computed, ref } from 'vue'
import SectionHeader from '@/components/common/SectionHeader.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { formatPrice } from '@/utils/format'
import { useBooking } from '@/composables/useBooking'
import { useServicesStore } from '@/stores/servicesStore'
import { vReveal } from '@/composables/useScrollAnimation'

const catalogue = useServicesStore()
const { startWithService, startWithPackage } = useBooking()

const selected = ref([])

function toggle(option) {
  const index = selected.value.indexOf(option.serviceId)
  if (index === -1) selected.value.push(option.serviceId)
  else selected.value.splice(index, 1)
}

const isSelected = (id) => selected.value.includes(id)

/** One need → that service. Three or more → the package that covers them. */
const recommendation = computed(() => {
  if (!selected.value.length) return null

  if (selected.value.length >= 3) {
    const best = catalogue.packages
      .map((pkg) => ({
        pkg,
        hits: pkg.items.filter((item) => selected.value.includes(item.serviceId)).length,
      }))
      .sort((a, b) => b.hits - a.hits)[0]
    if (best?.hits >= 2) {
      return {
        type: 'package',
        pkg: best.pkg,
        title: best.pkg.name,
        note: `تغطي ${best.hits} من احتياجاتك وتوفّر عليك ${formatPrice(best.pkg.saving)}`,
        price: best.pkg.price,
        image: best.pkg.image,
        fallbackImage: best.pkg.fallbackImage,
      }
    }
  }

  const service = catalogue.serviceById(selected.value[selected.value.length - 1])
  if (!service) return null
  return {
    type: 'service',
    service,
    title: service.name,
    note: service.summary,
    price: service.startingPrice,
    image: service.image,
    fallbackImage: service.fallbackImage,
  }
})

function bookRecommendation() {
  if (!recommendation.value) return
  if (recommendation.value.type === 'package') startWithPackage(recommendation.value.pkg)
  else startWithService(recommendation.value.service)
}
</script>

<template>
  <section id="discovery" class="section section--mint">
    <div class="container">
      <SectionHeader
        align="center"
        eyebrow="مساعد دكتول"
        eyebrow-icon="sparkle"
        title="ماذا يحتاج منزلك اليوم؟"
        subtitle="اختر ما ينطبق عليك، ونقترح عليك الخدمة المناسبة فوراً."
      />

      <ul class="disc__options">
        <li
          v-for="(option, index) in catalogue.discoveryOptions"
          :key="option.id"
          v-reveal="{ preset: 'scale', delay: index * 55 }"
        >
          <button
            type="button"
            class="disc__option"
            :class="{ 'disc__option--on': isSelected(option.serviceId) }"
            :aria-pressed="isSelected(option.serviceId)"
            @click="toggle(option)"
          >
            <span class="disc__emoji" aria-hidden="true">{{ option.emoji }}</span>
            <span class="disc__label">{{ option.label }}</span>
            <span class="disc__check" aria-hidden="true">
              <DoctolIcon name="check" :size="14" :stroke="2.6" />
            </span>
          </button>
        </li>
      </ul>

      <Transition name="reco">
        <div v-if="recommendation" class="disc__reco" role="status">
          <img
            class="disc__reco-img"
            :src="recommendation.image"
            v-image-fallback="recommendation.fallbackImage"
            :alt="recommendation.title"
            width="400"
            height="300"
            loading="lazy"
            decoding="async"
          />
          <div class="disc__reco-body">
            <span class="disc__reco-eyebrow">
              <DoctolIcon name="sparkle" :size="15" />
              نقترح عليك
            </span>
            <h3 class="disc__reco-title">{{ recommendation.title }}</h3>
            <p class="disc__reco-note">{{ recommendation.note }}</p>
            <p class="disc__reco-price">
              <span>يبدأ من</span>
              <strong class="num">{{ formatPrice(recommendation.price, { withCurrency: false }) }}</strong>
              <span>ريال</span>
            </p>
          </div>
          <div class="disc__reco-actions">
            <BaseButton size="lg" icon-end="arrow-left" @click="bookRecommendation">
              احجز الخدمة
            </BaseButton>
            <BaseButton variant="ghost" size="sm" @click="selected = []">ابدأ من جديد</BaseButton>
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
.disc__options {
  display: grid;
  gap: var(--dt-space-3);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
}

.disc__option {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
  width: 100%;
  min-height: 76px;
  padding: var(--dt-space-4);
  text-align: start;
  background: var(--dt-surface);
  border: 1.5px solid var(--dt-line);
  border-radius: var(--dt-radius-lg);
  font-weight: var(--dt-fw-medium);
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    background-color var(--dt-dur-2) var(--dt-ease-out),
    box-shadow var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-2) var(--dt-ease-spring);
}

.disc__option:hover {
  border-color: var(--dt-teal-300);
  transform: translateY(-3px);
  box-shadow: var(--dt-shadow-md);
}

.disc__option--on {
  border-color: var(--dt-teal-500);
  background: var(--dt-white);
  box-shadow: 0 0 0 3px var(--dt-teal-100), var(--dt-shadow-md);
}

.disc__emoji {
  font-size: 1.6rem;
  line-height: 1;
  transition: transform var(--dt-dur-3) var(--dt-ease-spring);
}

.disc__option--on .disc__emoji {
  transform: scale(1.15) rotate(-6deg);
}

.disc__label {
  flex: 1;
}

.disc__check {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: var(--dt-radius-pill);
  border: 1.5px solid var(--dt-line-strong);
  color: transparent;
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    border-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out);
}

.disc__option--on .disc__check {
  background: var(--dt-teal-500);
  border-color: var(--dt-teal-500);
  color: #fff;
}

/* ---------- recommendation ---------- */
.disc__reco {
  display: grid;
  gap: var(--dt-space-5);
  align-items: center;
  margin-block-start: var(--dt-space-8);
  padding: var(--dt-space-4);
  border-radius: var(--dt-radius-xl);
  background: var(--dt-surface);
  border: 1px solid var(--dt-teal-100);
  box-shadow: var(--dt-shadow-lg);
}

.disc__reco-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: var(--dt-radius-lg);
  background: var(--dt-teal-50);
}

.disc__reco-body {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
}

.disc__reco-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-teal-600);
}

.disc__reco-title {
  font-size: var(--dt-fs-h3);
}

.disc__reco-note {
  color: var(--dt-muted);
  font-size: var(--dt-fs-sm);
  line-height: var(--dt-lh-snug);
}

.disc__reco-price {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
}

.disc__reco-price strong {
  font-size: 1.5rem;
  color: var(--dt-teal-600);
}

.disc__reco-actions {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
  align-items: stretch;
}

.reco-enter-active,
.reco-leave-active {
  transition:
    opacity var(--dt-dur-3) var(--dt-ease-out),
    transform var(--dt-dur-4) var(--dt-ease-out);
}

.reco-enter-from,
.reco-leave-to {
  opacity: 0;
  transform: translateY(18px) scale(0.98);
}

@media (min-width: 768px) {
  .disc__reco {
    grid-template-columns: 200px 1fr auto;
    padding: var(--dt-space-5);
  }
  .disc__reco-img {
    aspect-ratio: 1;
  }
}
</style>
