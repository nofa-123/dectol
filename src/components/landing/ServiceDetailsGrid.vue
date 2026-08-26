<script setup>
/**
 * The full sub-service list, as cards rather than a bulleted list.
 *
 * Accepts either a flat `items` array or `groups` (used where the brief splits
 * a service in two, e.g. tanks vs pools, offices vs shops vs contracts).
 * Nothing is truncated — the whole list is the point of this section.
 */
import { computed } from 'vue'
import SectionHeader from '@/components/common/SectionHeader.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { vReveal } from '@/composables/useScrollAnimation'

const props = defineProps({
  details: { type: Object, required: true },
})

const emit = defineEmits(['book'])

/** Normalise both shapes into one list of groups. */
const groups = computed(() =>
  props.details.groups ?? [{ title: null, icon: null, items: props.details.items ?? [] }],
)

const total = computed(() => groups.value.reduce((sum, g) => sum + g.items.length, 0))
</script>

<template>
  <section id="details" class="sd section">
    <div class="container container--wide">
      <SectionHeader
        align="center"
        eyebrow="الخدمات التفصيلية"
        eyebrow-icon="list"
        :title="details.title"
        :subtitle="details.lead"
      />

      <div v-for="(group, gi) in groups" :key="group.title ?? gi" class="sd__group">
        <h3 v-if="group.title" v-reveal class="sd__group-title">
          <span class="sd__group-icon"><DoctolIcon :name="group.icon" :size="20" /></span>
          {{ group.title }}
          <span class="sd__group-count num">{{ group.items.length }}</span>
        </h3>

        <ul class="sd__grid">
          <li
            v-for="(item, index) in group.items"
            :key="item.title"
            v-reveal="{ delay: Math.min(index, 6) * 55 }"
          >
            <article class="sd__card">
              <span class="sd__icon"><DoctolIcon :name="item.icon" :size="22" /></span>
              <h4 class="sd__title">{{ item.title }}</h4>
              <p class="sd__text">{{ item.text }}</p>
              <span class="sd__arrow" aria-hidden="true">
                <DoctolIcon name="arrow-left" :size="16" />
              </span>
            </article>
          </li>
        </ul>
      </div>

      <div v-reveal class="sd__cta">
        <p>
          <strong class="num">{{ total }}</strong>
          خدمة فرعية ضمن هذه الخدمة — احجز ما تحتاجه فقط.
        </p>
        <BaseButton icon-end="arrow-left" @click="emit('book')">احجز الآن</BaseButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.sd__group + .sd__group {
  margin-block-start: var(--dt-space-10);
}

.sd__group-title {
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
  font-size: var(--dt-fs-h3);
  margin-block-end: var(--dt-space-5);
}

.sd__group-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--dt-radius-md);
  background: var(--sl-accent-soft);
  color: var(--sl-accent);
}

.sd__group-count {
  display: grid;
  place-items: center;
  min-width: 26px;
  height: 26px;
  padding-inline: 0.4rem;
  border-radius: var(--dt-radius-pill);
  background: var(--sl-accent);
  color: #fff;
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-bold);
}

.sd__grid {
  display: grid;
  gap: var(--dt-space-3);
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
}

.sd__grid > li {
  min-width: 0;
}

.sd__card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
  height: 100%;
  padding: var(--dt-space-5);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface);
  border: 1.5px solid var(--dt-line);
  overflow: hidden;
  transition:
    transform var(--dt-dur-3) var(--dt-ease-out),
    box-shadow var(--dt-dur-3) var(--dt-ease-out),
    border-color var(--dt-dur-3) var(--dt-ease-out);
}

.sd__card::before {
  content: '';
  position: absolute;
  inset-block-start: 0;
  inset-inline: 0;
  height: 3px;
  background: var(--sl-accent);
  transform: scaleX(0);
  transform-origin: inline-end;
  transition: transform var(--dt-dur-3) var(--dt-ease-out);
}

.sd__card:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 40px -22px color-mix(in srgb, var(--sl-accent) 55%, transparent);
  border-color: var(--sl-accent-line);
}

.sd__card:hover::before {
  transform: scaleX(1);
}

.sd__icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: var(--dt-radius-md);
  background: var(--sl-accent-soft);
  color: var(--sl-accent);
  transition:
    background-color var(--dt-dur-3) var(--dt-ease-out),
    color var(--dt-dur-3) var(--dt-ease-out),
    transform var(--dt-dur-3) var(--dt-ease-spring);
}

.sd__card:hover .sd__icon {
  background: var(--sl-accent);
  color: #fff;
  transform: rotate(-6deg) scale(1.06);
}

.sd__title {
  font-size: var(--dt-fs-h4);
  font-weight: var(--dt-fw-bold);
  line-height: var(--dt-lh-snug);
}

.sd__text {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
}

.sd__arrow {
  position: absolute;
  inset-block-end: var(--dt-space-4);
  inset-inline-end: var(--dt-space-5);
  color: var(--sl-accent);
  opacity: 0;
  transform: translateX(8px);
  transition:
    opacity var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-2) var(--dt-ease-out);
}

.sd__card:hover .sd__arrow {
  opacity: 1;
  transform: translateX(0);
}

.sd__cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--dt-space-4);
  margin-block-start: var(--dt-space-8);
  padding: var(--dt-space-5) var(--dt-space-6);
  border-radius: var(--dt-radius-xl);
  background: var(--sl-accent-soft);
  border: 1px solid var(--sl-accent-line);
}

.sd__cta p {
  font-size: var(--dt-fs-body-lg);
  color: var(--dt-ink-soft);
}

.sd__cta strong {
  color: var(--sl-accent-deep);
  font-size: 1.5rem;
}

/* Touch devices never hover — reveal the affordances by default. */
@media (hover: none) {
  .sd__arrow {
    opacity: 0.6;
    transform: none;
  }
  .sd__card::before {
    transform: scaleX(1);
    opacity: 0.35;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sd__card,
  .sd__icon,
  .sd__arrow,
  .sd__card::before {
    transition: none;
  }
  .sd__card:hover {
    transform: none;
  }
  .sd__card:hover .sd__icon {
    transform: none;
  }
}
</style>
