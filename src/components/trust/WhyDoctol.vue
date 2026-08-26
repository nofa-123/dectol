<script setup>
/**
 * Trust pillars + animated counters.
 * Icons animate in sequence the first time the section enters the viewport;
 * counters run off the same trigger via useCountUp.
 */
import SectionHeader from '@/components/common/SectionHeader.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import StatCounter from '@/components/trust/StatCounter.vue'
import { useServicesStore } from '@/stores/servicesStore'
import { vReveal } from '@/composables/useScrollAnimation'

const catalogue = useServicesStore()
</script>

<template>
  <section id="why" class="section why">
    <div class="container container--wide">
      <SectionHeader
        align="center"
        eyebrow="لماذا دكتول"
        eyebrow-icon="shield"
        title="نظافة تقدر تعتمد عليها"
        subtitle="ما نبيع وعوداً — نبني ثقة بمعايير واضحة في كل زيارة."
      />

      <ul class="why__grid">
        <li
          v-for="(feature, index) in catalogue.trustFeatures"
          :key="feature.id"
          v-reveal="{ preset: 'up', delay: index * 110 }"
          class="why__card"
        >
          <span class="why__icon">
            <DoctolIcon :name="feature.icon" :size="26" />
            <span class="why__icon-ring" aria-hidden="true" />
          </span>
          <h3 class="why__title">{{ feature.title }}</h3>
          <p class="why__text">{{ feature.text }}</p>
        </li>
      </ul>

      <div v-reveal="'scale'" class="why__stats">
        <StatCounter v-for="stat in catalogue.stats" :key="stat.id" :stat="stat" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.why {
  background:
    radial-gradient(ellipse 60% 50% at 50% 0%, rgb(0 159 163 / 0.07), transparent 70%),
    var(--dt-canvas);
}

.why__grid {
  display: grid;
  gap: var(--dt-space-4);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
}

.why__card {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
  padding: var(--dt-space-6) var(--dt-space-5);
  border-radius: var(--dt-radius-xl);
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-sm);
  transition:
    transform var(--dt-dur-3) var(--dt-ease-out),
    box-shadow var(--dt-dur-3) var(--dt-ease-out),
    border-color var(--dt-dur-3) var(--dt-ease-out);
}

.why__card:hover {
  transform: translateY(-6px);
  box-shadow: var(--dt-shadow-lg);
  border-color: var(--dt-teal-200);
}

.why__icon {
  position: relative;
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  border-radius: var(--dt-radius-lg);
  background: var(--dt-teal-50);
  color: var(--dt-teal-600);
  transition:
    background-color var(--dt-dur-3) var(--dt-ease-out),
    color var(--dt-dur-3) var(--dt-ease-out),
    transform var(--dt-dur-3) var(--dt-ease-spring);
}

.why__card:hover .why__icon {
  background: var(--dt-grad-primary);
  color: #fff;
  transform: rotate(-5deg) scale(1.05);
}

.why__icon-ring {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid var(--dt-teal-300);
  opacity: 0;
  transition: opacity var(--dt-dur-3) var(--dt-ease-out);
}

.why__card:hover .why__icon-ring {
  opacity: 1;
  animation: dt-pulse-ring 1.6s var(--dt-ease-out) infinite;
}

.why__title {
  font-size: var(--dt-fs-h4);
  font-weight: var(--dt-fw-bold);
}

.why__text {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
}

.why__stats {
  display: grid;
  gap: var(--dt-space-4);
  grid-template-columns: repeat(2, 1fr);
  margin-block-start: var(--dt-space-8);
  padding: var(--dt-space-6) var(--dt-space-5);
  border-radius: var(--dt-radius-2xl);
  background: var(--dt-grad-deep);
  box-shadow: var(--dt-shadow-lg);
}

@media (min-width: 768px) {
  .why__stats {
    grid-template-columns: repeat(4, 1fr);
    padding: var(--dt-space-8);
  }
}

@media (prefers-reduced-motion: reduce) {
  .why__card,
  .why__icon {
    transition: none;
  }
  .why__card:hover {
    transform: none;
  }
  .why__card:hover .why__icon {
    transform: none;
  }
  .why__card:hover .why__icon-ring {
    animation: none;
  }
}
</style>
