<script setup>
/**
 * Top-level category rail. Snap-scrolling image cards with page dots — the
 * entry point that decides which service list is shown below.
 */
import { computed } from 'vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { useCarousel } from '@/composables/useCarousel'

const props = defineProps({
  categories: { type: Array, required: true },
  modelValue: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])

const { track, trackHandlers, activeIndex, scrollToIndex } = useCarousel({ loop: false })

/** Dots represent pages of roughly three cards, matching the designs. */
const pageCount = computed(() => Math.max(1, Math.ceil(props.categories.length / 2)))
const activePage = computed(() =>
  Math.min(pageCount.value - 1, Math.floor(activeIndex.value / 2)),
)
</script>

<template>
  <div class="cats">
    <ul ref="track" class="rail cats__rail" v-bind="trackHandlers">
      <li v-for="category in categories" :key="category.id">
        <button
          type="button"
          class="cats__card"
          :class="{ 'cats__card--on': modelValue === category.id }"
          :aria-pressed="modelValue === category.id"
          @click="emit('update:modelValue', category.id)"
        >
          <img
            class="cats__img"
            :src="category.photo || category.image || category.fallbackImage"
            v-image-fallback="category.fallbackImage"
            :alt="category.name"
            width="320"
            height="400"
            loading="lazy"
            decoding="async"
            draggable="false"
          />
          <span class="cats__badge">
            <DoctolIcon :name="category.icon" :size="22" />
          </span>
          <span class="cats__label">{{ category.name }}</span>
        </button>
      </li>
    </ul>

    <div class="cats__dots" aria-hidden="true">
      <button
        v-for="page in pageCount"
        :key="page"
        type="button"
        class="cats__dot"
        :class="{ 'cats__dot--on': page - 1 === activePage }"
        tabindex="-1"
        @click="scrollToIndex((page - 1) * 2)"
      />
    </div>
  </div>
</template>

<style scoped>
.cats__rail {
  gap: var(--dt-space-3);
  padding-block: 0.25rem 0.5rem;
}

.cats__card {
  position: relative;
  display: block;
  width: 150px;
  border-radius: var(--dt-radius-lg);
  overflow: hidden;
  background: var(--dt-surface);
  border: 2px solid transparent;
  box-shadow: var(--dt-shadow-sm);
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    box-shadow var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-2) var(--dt-ease-out);
}

.cats__card:hover {
  transform: translateY(-3px);
  box-shadow: var(--dt-shadow-md);
}

.cats__card--on {
  border-color: var(--dt-teal-500);
  box-shadow: var(--dt-shadow-md);
}

/**
 * Was 4/5 (portrait) — a 150px-wide card carried a 187px-tall image, so the
 * label sat below the fold. On phones 3/2 gives a 100px image: about half the
 * original height, but still deep enough to read the illustration. Desktop has
 * the room for a 4/3 crop.
 */
.cats__img {
  width: 100%;
  aspect-ratio: 3 / 2;
  object-fit: cover;
  display: block;
}

.cats__badge {
  position: absolute;
  inset-block-end: 52px;
  inset-inline: 0;
  margin-inline: auto;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-surface);
  color: var(--dt-teal-600);
  box-shadow: var(--dt-shadow-sm);
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out);
}

.cats__card--on .cats__badge {
  background: var(--dt-grad-primary);
  color: #fff;
}

.cats__label {
  position: absolute;
  inset-block-end: 0;
  inset-inline: 0;
  padding: 0.65rem 0.5rem;
  background: var(--dt-surface);
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-navy-700);
  text-align: center;
}

.cats__card--on .cats__label {
  color: var(--dt-teal-700);
}

.cats__dots {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  margin-block-start: var(--dt-space-3);
}

.cats__dot {
  width: 26px;
  height: 6px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-line-strong);
  transition: background-color var(--dt-dur-2) var(--dt-ease-out);
}

.cats__dot--on {
  background: var(--dt-teal-500);
}

@media (min-width: 768px) {
  .cats__card {
    width: 170px;
  }
  .cats__img {
    aspect-ratio: 4 / 3;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cats__card {
    transition: none;
  }
  .cats__card:hover {
    transform: none;
  }
}
</style>
