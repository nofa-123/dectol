<script setup>
/** Editorial teasers — builds authority and captures long-tail search intent. */
import { computed } from 'vue'
import SectionHeader from '@/components/common/SectionHeader.vue'
import BlogCard from '@/components/blog/BlogCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useServicesStore } from '@/stores/servicesStore'
import { vReveal } from '@/composables/useScrollAnimation'

const catalogue = useServicesStore()

/** أحدث ثلاثة فقط — البقية خلف زر «عرض جميع المقالات». */
const latest = computed(() =>
  [...catalogue.articles]
    .sort((a, b) => (a.iso < b.iso ? 1 : a.iso > b.iso ? -1 : 0))
    .slice(0, 3),
)
</script>

<template>
  <section id="tips" class="section section--sunken">
    <div class="container container--wide">
      <SectionHeader
        eyebrow="مدونة دكتول"
        eyebrow-icon="quote"
        title="نصائح دكتول"
        subtitle="خبرات عملية من فريقنا تساعدك تحافظ على بيتك نظيفاً لفترة أطول."
      >
        <template #action>
          <BaseButton variant="outline" icon-end="arrow-left" :to="{ name: 'blog' }">
            عرض جميع المقالات
          </BaseButton>
        </template>
      </SectionHeader>

      <ul class="blog__grid">
        <li
          v-for="(article, index) in latest"
          :key="article.id"
          v-reveal="{ delay: index * 80 }"
        >
          <BlogCard :article="article" />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.blog__grid {
  display: grid;
  gap: var(--dt-space-5);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 270px), 1fr));
}

.blog__grid > li {
  min-width: 0;
}
</style>
