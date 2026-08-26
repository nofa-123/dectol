<script setup>
/** Before/after showcase with case tabs. */
import { computed, ref, watch } from 'vue'
import SectionHeader from '@/components/common/SectionHeader.vue'
import BeforeAfterSlider from '@/components/beforeAfter/BeforeAfterSlider.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { useBooking } from '@/composables/useBooking'
import { useResponsive } from '@/composables/useResponsive'
import { useServicesStore } from '@/stores/servicesStore'
import { vReveal } from '@/composables/useScrollAnimation'

const props = defineProps({
  /** Defaults to the catalogue set; landings pass their own cases. */
  cases: { type: Array, default: null },
  title: { type: String, default: 'قبل وبعد' },
  subtitle: {
    type: String,
    default: 'اسحب الفاصل وشوف الفرق بنفسك — كل الصور من أعمال نفّذها فريق دكتول.',
  },
  ctaLabel: { type: String, default: '' },
})

/** When a page owns the CTA it listens for `book` instead of using the store. */
const emit = defineEmits(['book'])

const catalogue = useServicesStore()
const { startWithService } = useBooking()
const { isMobile } = useResponsive()

const activeIndex = ref(0)
const items = computed(() => props.cases ?? catalogue.beforeAfterCases)
const active = computed(() => items.value[activeIndex.value] ?? null)
const activeService = computed(() =>
  active.value?.serviceId ? catalogue.serviceById(active.value.serviceId) : null,
)

const ctaText = computed(
  () => props.ctaLabel || (activeService.value ? 'احجز الخدمة' : 'احجز الآن'),
)

function bookActive() {
  if (props.cases) emit('book')
  else if (activeService.value) startWithService(activeService.value)
}

// Switching data sets (e.g. navigating between landings) resets the tab.
watch(items, () => {
  activeIndex.value = 0
})
</script>

<template>
  <section id="before-after" class="section">
    <div class="container">
      <SectionHeader
        eyebrow="نتائج حقيقية"
        eyebrow-icon="sparkle"
        :title="title"
        :subtitle="subtitle"
      />

      <div v-if="isMobile && items.length" class="ba-sec__mobile-grid">
        <article v-for="item in items.slice(0, 2)" :key="item.id" class="ba-sec__mobile-card">
          <BeforeAfterSlider
            :before="item.before"
            :after="item.after"
            :alt="item.label"
          />
        </article>
      </div>

      <div v-else-if="active" class="ba-sec__layout">
        <div v-reveal="'scale'" class="ba-sec__stage">
          <BeforeAfterSlider
            :key="active.id"
            :before="active.before"
            :after="active.after"
            :alt="active.label"
          />
          <p class="ba-sec__hint">
            <DoctolIcon name="drag" :size="15" />
            اسحب الدائرة يميناً ويساراً — أو استخدم أسهم لوحة المفاتيح
          </p>
        </div>

        <div class="ba-sec__side">
          <div class="ba-sec__tabs" role="tablist" aria-label="أمثلة قبل وبعد">
            <button
              v-for="(item, index) in items"
              :key="item.id"
              type="button"
              role="tab"
              class="ba-sec__tab"
              :class="{ 'ba-sec__tab--active': index === activeIndex }"
              :aria-selected="index === activeIndex"
              @click="activeIndex = index"
            >
              <span class="ba-sec__tab-icon">
                <DoctolIcon
                  :name="catalogue.serviceById(item.serviceId)?.icon ?? 'sparkle'"
                  :size="18"
                />
              </span>
              <span class="ba-sec__tab-text">
                <strong>{{ item.label }}</strong>
                <small>{{ item.note }}</small>
              </span>
            </button>
          </div>

          <div v-if="activeService || cases" class="ba-sec__cta">
            <p class="ba-sec__cta-text">
              نفس النتيجة ممكنة عندك — احجز
              <strong>{{ activeService?.name ?? 'الخدمة' }}</strong>
              اليوم.
            </p>
            <BaseButton block icon-end="arrow-left" @click="bookActive">{{ ctaText }}</BaseButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ba-sec__layout {
  display: grid;
  gap: var(--dt-space-6);
}

.ba-sec__mobile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.ba-sec__mobile-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--dt-line);
  border-radius: var(--dt-radius-lg);
  box-shadow: var(--dt-shadow-sm);
}

.ba-sec__hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-block-start: var(--dt-space-3);
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.ba-sec__side {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
}

.ba-sec__tabs {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
}

.ba-sec__tab {
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
  padding: var(--dt-space-3) var(--dt-space-4);
  text-align: start;
  border: 1.5px solid var(--dt-line);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface);
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    background-color var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-2) var(--dt-ease-out);
}

.ba-sec__tab:hover {
  border-color: var(--dt-teal-300);
  transform: translateY(-2px);
}

.ba-sec__tab--active {
  border-color: var(--dt-teal-500);
  background: var(--dt-teal-50);
}

.ba-sec__tab-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex: none;
  border-radius: var(--dt-radius-sm);
  background: var(--dt-surface-sunken);
  color: var(--dt-navy-600);
}

.ba-sec__tab--active .ba-sec__tab-icon {
  background: var(--dt-teal-500);
  color: #fff;
}

.ba-sec__tab-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ba-sec__tab-text strong {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
}

.ba-sec__tab-text small {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
}

.ba-sec__cta {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
  padding: var(--dt-space-5);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-grad-mint);
  border: 1px solid var(--dt-teal-100);
  margin-block-start: auto;
}

.ba-sec__cta-text {
  font-size: var(--dt-fs-sm);
  color: var(--dt-ink-soft);
  line-height: var(--dt-lh-snug);
}

.ba-sec__cta-text strong {
  color: var(--dt-teal-700);
}

@media (min-width: 900px) {
  .ba-sec__layout {
    grid-template-columns: 1.55fr 1fr;
    align-items: stretch;
  }
}
</style>
