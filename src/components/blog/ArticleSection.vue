<script setup>
/**
 * فقرة واحدة من جسم المقال: عنوان + فقرات + قائمة اختيارية + تنبيه اختياري.
 *
 * العنوان يحمل `id` القسم حتى يعمل فهرس المحتوى الجانبي والروابط العميقة،
 * ويُزاح بمقدار ارتفاع الهيدر الثابت عبر `scroll-margin` لا عبر حشو وهمي.
 */
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import RichText from '@/components/blog/RichText.vue'

defineProps({
  section: { type: Object, required: true },
})

const CALLOUT_ICON = { tip: 'sparkle', warn: 'alert', info: 'info' }
</script>

<template>
  <section class="as">
    <h2 :id="section.id" class="as__heading">{{ section.heading }}</h2>

    <RichText
      v-for="(paragraph, i) in section.paragraphs ?? []"
      :key="`p${i}`"
      tag="p"
      class="as__p"
      :text="paragraph"
    />

    <component
      :is="section.list?.ordered ? 'ol' : 'ul'"
      v-if="section.list"
      class="as__list"
      :class="{ 'as__list--ordered': section.list.ordered }"
    >
      <li v-for="(item, i) in section.list.items" :key="`l${i}`">
        <DoctolIcon v-if="!section.list.ordered" name="check" :size="16" :stroke="2.6" />
        <RichText :text="item" />
      </li>
    </component>

    <aside v-if="section.callout" class="as__callout" :class="`as__callout--${section.callout.tone}`">
      <DoctolIcon :name="CALLOUT_ICON[section.callout.tone] ?? 'info'" :size="20" />
      <div>
        <p class="as__callout-title">{{ section.callout.title }}</p>
        <p class="as__callout-text">{{ section.callout.text }}</p>
      </div>
    </aside>
  </section>
</template>

<style scoped>
.as + .as {
  margin-block-start: var(--dt-space-8);
}

.as__heading {
  font-size: clamp(1.25rem, 1.05rem + 0.8vw, 1.6rem);
  line-height: 1.4;
  color: var(--dt-navy-700);
  margin-block-end: var(--dt-space-4);
  /* Anchors must clear the fixed header. */
  scroll-margin-block-start: calc(var(--dt-header-h) + var(--dt-space-4));
}

.as__p {
  font-size: 1.0625rem;
  line-height: 2;
  color: var(--dt-ink-soft);
}

.as__p + .as__p {
  margin-block-start: var(--dt-space-3);
}

.as__list {
  margin-block-start: var(--dt-space-4);
  display: grid;
  gap: var(--dt-space-3);
}

.as__list li {
  display: flex;
  align-items: start;
  gap: 0.65rem;
  font-size: 1.0625rem;
  line-height: 1.9;
  color: var(--dt-ink-soft);
}

.as__list :deep(svg) {
  flex: none;
  margin-block-start: 0.45rem;
  color: var(--dt-teal-500);
}

/* Numbered steps get a real counter chip — the marker carries meaning here. */
.as__list--ordered {
  counter-reset: step;
}

.as__list--ordered li {
  counter-increment: step;
}

.as__list--ordered li::before {
  content: counter(step);
  flex: none;
  inline-size: 1.7rem;
  block-size: 1.7rem;
  margin-block-start: 0.2rem;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--dt-teal-50);
  color: var(--dt-teal-700);
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-bold);
  font-variant-numeric: tabular-nums;
}

.as__callout {
  margin-block-start: var(--dt-space-5);
  display: flex;
  gap: var(--dt-space-3);
  padding: var(--dt-space-4) var(--dt-space-5);
  border-radius: var(--dt-radius-lg);
  border-inline-start: 3px solid var(--dt-teal-500);
  background: var(--dt-teal-50);
}

.as__callout :deep(svg) {
  flex: none;
  margin-block-start: 0.15rem;
  color: var(--dt-teal-600);
}

.as__callout--warn {
  border-inline-start-color: var(--dt-gold-500);
  background: var(--dt-warning-soft);
}

.as__callout--warn :deep(svg) {
  color: var(--dt-gold-600);
}

.as__callout-title {
  font-weight: var(--dt-fw-bold);
  color: var(--dt-navy-700);
  margin-block-end: 0.25rem;
}

.as__callout-text {
  font-size: var(--dt-fs-sm);
  line-height: 1.85;
  color: var(--dt-ink-soft);
}
</style>
