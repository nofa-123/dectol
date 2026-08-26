<script setup>
/**
 * One clip in the album. Posters are lazy; the video file itself is never
 * touched until the card is opened, which is the whole point of the poster.
 */
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import RatingStars from '@/components/common/RatingStars.vue'

defineProps({
  video: { type: Object, required: true },
  /** Shows which service the clip belongs to (home album only). */
  showService: { type: Boolean, default: true },
})

defineEmits(['open'])
</script>

<template>
  <button type="button" class="vc" @click="$emit('open', video)">
    <span class="vc__media">
      <img
        :src="video.poster"
        :alt="`معاينة فيديو: ${video.title}`"
        width="800"
        height="600"
        loading="lazy"
        decoding="async"
      />
      <span class="vc__scrim" aria-hidden="true" />
      <span class="vc__play" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22"><path d="M9 6.5 18 12l-9 5.5Z" fill="currentColor" /></svg>
      </span>
      <span v-if="video.duration" class="vc__duration num">{{ video.duration }}</span>
      <span v-else class="vc__soon">قريباً</span>
    </span>

    <span class="vc__body">
      <span v-if="showService" class="vc__service">{{ video.serviceName }}</span>
      <span class="vc__title">{{ video.title }}</span>

      <span v-if="video.quote" class="vc__quote">«{{ video.quote }}»</span>

      <span v-if="video.customer || video.rating" class="vc__meta">
        <RatingStars v-if="video.rating" :value="video.rating" :size="13" />
        <span v-if="video.customer" class="vc__customer">{{ video.customer }}</span>
      </span>
      <span v-else class="vc__meta vc__meta--pending">
        <DoctolIcon name="info" :size="13" />
        سيُضاف المقطع قريباً
      </span>
    </span>
  </button>
</template>

<style scoped>
.vc {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  text-align: start;
  border-radius: var(--dt-radius-xl);
  overflow: hidden;
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-sm);
  transition:
    transform var(--dt-dur-3) var(--dt-ease-out),
    box-shadow var(--dt-dur-3) var(--dt-ease-out),
    border-color var(--dt-dur-3) var(--dt-ease-out);
}

.vc:hover {
  transform: translateY(-5px);
  box-shadow: var(--dt-shadow-lg);
  border-color: var(--dt-teal-200);
}

.vc__media {
  position: relative;
  display: block;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--dt-teal-50);
}

.vc__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--dt-dur-5) var(--dt-ease-out);
}

.vc:hover .vc__media img {
  transform: scale(1.06);
}

.vc__scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgb(4 30 40 / 0.5), transparent 55%);
}

.vc__play {
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  translate: 50% -50%;
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: var(--dt-radius-pill);
  background: rgb(255 255 255 / 0.92);
  color: var(--dt-teal-700);
  box-shadow: var(--dt-shadow-lg);
  padding-inline-start: 3px;
  transition:
    transform var(--dt-dur-3) var(--dt-ease-spring),
    background-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out);
}

.vc:hover .vc__play {
  transform: translate(50%, -50%) scale(1.12);
  background: var(--dt-teal-500);
  color: #fff;
}

.vc__duration,
.vc__soon {
  position: absolute;
  inset-block-end: var(--dt-space-3);
  inset-inline-end: var(--dt-space-3);
  padding: 0.2rem 0.55rem;
  border-radius: var(--dt-radius-xs);
  background: rgb(4 30 40 / 0.75);
  color: #fff;
  font-size: 0.68rem;
  font-weight: var(--dt-fw-semibold);
}

.vc__soon {
  background: rgb(255 255 255 / 0.9);
  color: var(--dt-navy-700);
}

.vc__body {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: var(--dt-space-4) var(--dt-space-5) var(--dt-space-5);
  flex: 1;
}

.vc__service {
  align-self: flex-start;
  padding: 0.15rem 0.6rem;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-teal-50);
  color: var(--dt-teal-700);
  font-size: 0.68rem;
  font-weight: var(--dt-fw-semibold);
}

.vc__title {
  font-weight: var(--dt-fw-bold);
  font-size: var(--dt-fs-sm);
  line-height: var(--dt-lh-snug);
}

.vc__quote {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
}

.vc__meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-block-start: auto;
  padding-block-start: var(--dt-space-3);
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.vc__meta--pending {
  color: var(--dt-muted-soft);
}

.vc__customer {
  font-weight: var(--dt-fw-medium);
  color: var(--dt-ink-soft);
}

@media (prefers-reduced-motion: reduce) {
  .vc,
  .vc__media img,
  .vc__play {
    transition: none;
  }
  .vc:hover {
    transform: none;
  }
  .vc:hover .vc__media img {
    transform: none;
  }
  .vc:hover .vc__play {
    transform: translate(50%, -50%);
  }
}
</style>
