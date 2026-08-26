<script setup>
/** Article teaser card. */
import DoctolIcon from '@/components/common/DoctolIcon.vue'

defineProps({
  article: { type: Object, required: true },
})
</script>

<template>
  <article class="bc">
    <RouterLink
      class="bc__link"
      :to="{ name: 'blog-article', params: { slug: article.slug } }"
      :aria-label="article.title"
    >
      <div class="bc__media">
        <img
          :src="article.image"
          v-image-fallback="article.fallbackImage"
          :alt="article.title"
          width="720"
          height="480"
          loading="lazy"
          decoding="async"
        />
        <span class="bc__category">{{ article.category }}</span>
      </div>

      <div class="bc__body">
        <h3 class="bc__title">{{ article.title }}</h3>
        <p class="bc__excerpt">{{ article.excerpt }}</p>

        <footer class="bc__foot">
          <span class="bc__meta">
            <DoctolIcon name="clock" :size="14" />
            {{ article.readingTime }}
          </span>
          <span class="bc__more">
            اقرأ المقال
            <DoctolIcon name="arrow-left" :size="15" />
          </span>
        </footer>
      </div>
    </RouterLink>
  </article>
</template>

<style scoped>
.bc {
  height: 100%;
}

.bc__link {
  display: flex;
  flex-direction: column;
  height: 100%;
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

.bc__link:hover {
  transform: translateY(-5px);
  box-shadow: var(--dt-shadow-lg);
  border-color: var(--dt-teal-200);
}

.bc__media {
  position: relative;
  aspect-ratio: 3 / 2;
  overflow: hidden;
  background: var(--dt-teal-50);
}

.bc__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--dt-dur-5) var(--dt-ease-out);
}

.bc__link:hover .bc__media img {
  transform: scale(1.06);
}

.bc__category {
  position: absolute;
  inset-block-end: var(--dt-space-3);
  inset-inline-end: var(--dt-space-3);
  padding: 0.28rem 0.75rem;
  border-radius: var(--dt-radius-pill);
  background: rgb(0 159 163 / 0.92);
  color: #fff;
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-semibold);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.bc__body {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
  padding: var(--dt-space-5);
  flex: 1;
}

.bc__title {
  font-size: var(--dt-fs-h4);
  font-weight: var(--dt-fw-bold);
  line-height: var(--dt-lh-snug);
}

.bc__excerpt {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bc__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-3);
  margin-block-start: auto;
  padding-block-start: var(--dt-space-3);
  border-block-start: 1px solid var(--dt-line);
  font-size: var(--dt-fs-xs);
}

.bc__meta {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--dt-muted);
}

.bc__more {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-teal-600);
}

.bc__more :deep(svg) {
  transition: transform var(--dt-dur-2) var(--dt-ease-out);
}

.bc__link:hover .bc__more :deep(svg) {
  transform: translateX(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .bc__link,
  .bc__media img {
    transition: none;
  }
  .bc__link:hover {
    transform: none;
  }
  .bc__link:hover .bc__media img {
    transform: none;
  }
}
</style>
