<script setup>
/**
 * Customer video album.
 *
 * Two modes from one component:
 *   · `filterable` (home page) — chips across all services, grid layout
 *   · plain (landing pages)    — the clips for that service only, in a rail
 */
import { computed, ref } from 'vue'
import SectionHeader from '@/components/common/SectionHeader.vue'
import CarouselControls from '@/components/common/CarouselControls.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import VideoCard from '@/components/video/VideoCard.vue'
import VideoModal from '@/components/video/VideoModal.vue'
import { useCarousel } from '@/composables/useCarousel'
import { vReveal } from '@/composables/useScrollAnimation'
import { videoFilters, videos as allVideos } from '@/data/videos'

const props = defineProps({
  /** Defaults to the whole album. */
  items: { type: Array, default: null },
  filterable: { type: Boolean, default: false },
  eyebrow: { type: String, default: 'ألبوم الفيديوهات' },
  title: { type: String, default: 'تجارب حقيقية من عملائنا' },
  subtitle: {
    type: String,
    default: 'لا نخبرك فقط بما نستطيع فعله… شاهد ما يقوله عملاؤنا.',
  },
  /** 'grid' or 'rail'. */
  layout: { type: String, default: 'grid' },
  tone: { type: String, default: 'default' },
})

const active = ref('all')
const openVideo = ref(null)

const source = computed(() => props.items ?? allVideos)
const filters = computed(() => (props.filterable ? videoFilters() : []))

const shown = computed(() =>
  active.value === 'all' ? source.value : source.value.filter((v) => v.landing === active.value),
)

const { track, trackHandlers, activeIndex, canPrev, canNext, next, prev, scrollToIndex } =
  useCarousel({ loop: false })

/** Every clip is a placeholder until real footage lands — say so once, up top. */
const allPending = computed(() => shown.value.every((v) => !v.src))
</script>

<template>
  <section id="videos" class="section vg" :class="`vg--${tone}`">
    <div class="container container--wide">
      <SectionHeader
        :align="filterable ? 'center' : 'start'"
        :eyebrow="eyebrow"
        eyebrow-icon="image"
        :title="title"
        :subtitle="subtitle"
        :light="tone === 'dark'"
      />

      <div v-if="filterable && filters.length > 2" class="vg__filters" role="tablist" aria-label="تصفية الفيديوهات">
        <button
          v-for="filter in filters"
          :key="filter.id"
          type="button"
          role="tab"
          class="vg__filter"
          :class="{ 'vg__filter--on': active === filter.id }"
          :aria-selected="active === filter.id"
          @click="active = filter.id"
        >
          {{ filter.label }}
        </button>
      </div>

      <p v-if="allPending" class="vg__notice">
        <DoctolIcon name="info" :size="16" />
        المقاطع قيد التصوير — نعرض هنا مقاطع حقيقية فقط من مواقع عمل دكتول.
      </p>

      <!-- rail (landing pages) -->
      <template v-if="layout === 'rail'">
        <ul ref="track" class="rail vg__rail" v-bind="trackHandlers">
          <li v-for="video in shown" :key="video.id" class="vg__rail-item">
            <VideoCard :video="video" :show-service="false" @open="openVideo = $event" />
          </li>
        </ul>
        <CarouselControls
          v-if="shown.length > 1"
          class="vg__controls"
          :can-prev="canPrev"
          :can-next="canNext"
          :count="shown.length"
          :active-index="activeIndex"
          @prev="prev"
          @next="next"
          @go="scrollToIndex"
        />
      </template>

      <!-- grid (home) -->
      <ul v-else class="vg__grid">
        <li
          v-for="(video, index) in shown"
          :key="video.id"
          v-reveal="{ delay: Math.min(index, 6) * 70 }"
        >
          <VideoCard :video="video" @open="openVideo = $event" />
        </li>
      </ul>
    </div>

    <VideoModal :video="openVideo" @close="openVideo = null" />
  </section>
</template>

<style scoped>
.vg--dark {
  background: var(--dt-grad-deep);
}

.vg--sunken {
  background: var(--dt-surface-sunken);
}

.vg__filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--dt-space-2);
  margin-block-end: var(--dt-space-6);
}

.vg__filter {
  min-height: 44px;
  padding: 0.5rem 1.1rem;
  border-radius: var(--dt-radius-pill);
  border: 1.5px solid var(--dt-line);
  background: var(--dt-surface);
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-medium);
  color: var(--dt-ink-soft);
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    background-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out);
}

.vg__filter:hover {
  border-color: var(--dt-teal-300);
  color: var(--dt-teal-700);
}

.vg__filter--on {
  background: var(--dt-grad-primary);
  border-color: transparent;
  color: #fff;
  box-shadow: var(--dt-shadow-teal);
}

.vg--dark .vg__filter {
  background: rgb(255 255 255 / 0.08);
  border-color: rgb(255 255 255 / 0.18);
  color: rgb(255 255 255 / 0.8);
}

.vg--dark .vg__filter--on {
  background: #fff;
  color: var(--dt-teal-700);
}

.vg__notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  margin-block-end: var(--dt-space-5);
  padding: var(--dt-space-3) var(--dt-space-4);
  border-radius: var(--dt-radius-md);
  background: var(--dt-teal-50);
  color: var(--dt-teal-800);
  font-size: var(--dt-fs-xs);
  text-align: center;
}

.vg__notice :deep(svg) {
  flex: none;
  color: var(--dt-teal-600);
}

.vg--dark .vg__notice {
  background: rgb(255 255 255 / 0.1);
  color: rgb(255 255 255 / 0.85);
}

.vg--dark .vg__notice :deep(svg) {
  color: var(--dt-teal-300);
}

.vg__grid {
  display: grid;
  gap: var(--dt-space-5);
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 290px), 1fr));
}

.vg__grid > li {
  min-width: 0;
}

/**
 * On phones the gallery becomes a single swipeable row instead of a stacked
 * grid: eight full-width cards made the home page enormous, and the filter
 * chips alone wrapped onto four lines. Both turn into horizontal rails that
 * bleed to the screen edge so it's obvious there's more to swipe to.
 */
@media (max-width: 767px) {
  .vg__filters {
    flex-wrap: nowrap;
    justify-content: flex-start;
    overflow-x: auto;
    scrollbar-width: none;
    margin-inline: calc(var(--dt-gutter) * -1);
    padding-inline: var(--dt-gutter);
    margin-block-end: var(--dt-space-5);
  }

  .vg__filters::-webkit-scrollbar,
  .vg__grid::-webkit-scrollbar {
    display: none;
  }

  .vg__filter {
    flex: 0 0 auto;
  }

  .vg__grid {
    display: flex;
    gap: var(--dt-space-4);
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    margin-inline: calc(var(--dt-gutter) * -1);
    padding-inline: var(--dt-gutter);
    padding-block-end: var(--dt-space-2);
  }

  .vg__grid > li {
    flex: 0 0 auto;
    width: min(78vw, 300px);
    scroll-snap-align: start;
  }
}

.vg__rail-item {
  width: min(84vw, 330px);
}

.vg__controls {
  margin-block-start: var(--dt-space-5);
}
</style>
