<script setup>
/** A single verified customer testimonial. */
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import RatingStars from '@/components/common/RatingStars.vue'

const props = defineProps({
  review: { type: Object, required: true },
})

/** Two-letter monogram stands in for a photo we don't have consent to show. */
const initials = props.review.name
  .split(' ')
  .slice(0, 2)
  .map((part) => part[0])
  .join('')
</script>

<template>
  <article class="rc" :class="{ 'rc--with-photo': review.photo }">
    <img
      v-if="review.photo"
      class="rc__photo"
      :src="review.photo"
      :alt="`نتيجة ${review.serviceLabel} لدى ${review.name}`"
      width="317"
      height="341"
      loading="lazy"
      decoding="async"
    />

    <DoctolIcon name="quote" :size="30" class="rc__quote" />

    <header class="rc__head">
      <span class="rc__avatar" aria-hidden="true">{{ initials }}</span>
      <span class="rc__ident">
        <span class="rc__name">
          {{ review.name }}
          <DoctolIcon v-if="review.verified" name="check-circle" :size="15" class="rc__verified" />
        </span>
        <span class="rc__place">
          <DoctolIcon name="pin" :size="13" />
          {{ review.city }} — {{ review.district }}
        </span>
      </span>
      <RatingStars :value="review.rating" :size="15" />
    </header>

    <p class="rc__text">{{ review.text }}</p>

    <footer class="rc__foot">
      <span class="rc__service">{{ review.serviceLabel }}</span>
      <span class="rc__date">
        <DoctolIcon name="calendar" :size="13" />
        {{ review.date }}
      </span>
    </footer>
  </article>
</template>

<style scoped>
.rc {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
  height: 100%;
  padding: var(--dt-space-5);
  border-radius: var(--dt-radius-xl);
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-sm);
  overflow: hidden;
  transition:
    transform var(--dt-dur-3) var(--dt-ease-out),
    box-shadow var(--dt-dur-3) var(--dt-ease-out);
}

.rc:hover {
  transform: translateY(-4px);
  box-shadow: var(--dt-shadow-md);
}

/**
 * A testimonial can carry a job photo. When it does the card becomes a two-part
 * layout — image beside the words, as in the design — so the padding moves off
 * the card and onto the text column.
 */
.rc--with-photo {
  display: grid;
  /* RTL: column 1 is the RIGHT-hand track. The design puts the words on the
     right and the photo on the left, so the text takes column 1. */
  grid-template-columns: minmax(0, 1fr) 38%;
  align-items: stretch;
  gap: 0;
  padding: 0;
  overflow: hidden;
}

.rc--with-photo > :not(.rc__photo) {
  grid-column: 1;
}

.rc--with-photo .rc__photo {
  grid-column: 2;
  grid-row: 1 / -1;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rc--with-photo .rc__head {
  padding: var(--dt-space-5) var(--dt-space-5) 0;
}

.rc--with-photo .rc__text {
  padding-inline: var(--dt-space-5);
}

.rc--with-photo .rc__foot {
  padding: 0 var(--dt-space-5) var(--dt-space-5);
}

.rc--with-photo .rc__quote {
  display: none;
}

.rc__quote {
  position: absolute;
  inset-block-start: var(--dt-space-4);
  inset-inline-end: var(--dt-space-4);
  color: var(--dt-teal-100);
  fill: currentColor;
  stroke: none;
}

.rc__head {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--dt-space-3);
  align-items: center;
}

.rc__avatar {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-grad-primary);
  color: #fff;
  font-weight: var(--dt-fw-bold);
  font-size: var(--dt-fs-sm);
}

.rc__ident {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.rc__name {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: var(--dt-fw-bold);
  font-size: var(--dt-fs-sm);
}

.rc__verified {
  color: var(--dt-teal-500);
}

.rc__place {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.rc__head :deep(.rating) {
  grid-column: 1 / -1;
}

.rc__text {
  font-size: var(--dt-fs-sm);
  line-height: var(--dt-lh-normal);
  color: var(--dt-ink-soft);
  flex: 1;
}

.rc__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-3);
  padding-block-start: var(--dt-space-3);
  border-block-start: 1px dashed var(--dt-line);
  font-size: var(--dt-fs-xs);
}

.rc__service {
  padding: 0.2rem 0.65rem;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-teal-50);
  color: var(--dt-teal-700);
  font-weight: var(--dt-fw-semibold);
}

.rc__date {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--dt-muted-soft);
}

@media (prefers-reduced-motion: reduce) {
  .rc {
    transition: none;
  }
  .rc:hover {
    transform: none;
  }
}
</style>
