<script setup>
/** 404 — offers a way forward rather than a dead end. */
import BaseButton from '@/components/common/BaseButton.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
</script>

<template>
  <section class="nf">
    <div class="container nf__inner">
      <span class="nf__code num">404</span>
      <h1 class="nf__title">ما لقينا هذي الصفحة</h1>
      <p class="nf__text">
        يمكن الرابط تغيّر أو الصفحة انحذفت. تقدر ترجع للرئيسية أو تتصفح خدماتنا مباشرة.
      </p>
      <div class="nf__actions">
        <BaseButton icon="home" :to="{ name: 'home' }">العودة للرئيسية</BaseButton>
        <BaseButton variant="outline" icon="grid" :to="{ name: 'services' }">
          تصفح الخدمات
        </BaseButton>
      </div>
      <p class="nf__help">
        <DoctolIcon name="headset" :size="16" />
        تحتاج مساعدة؟ اتصل على <a href="tel:920015210" class="num">920015210</a>
      </p>
    </div>
  </section>
</template>

<style scoped>
.nf {
  min-height: 70dvh;
  display: grid;
  place-items: center;
  padding-block: calc(var(--dt-header-h) + var(--dt-space-10)) var(--dt-space-16);
  background: var(--dt-grad-mint);
}

.nf__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dt-space-4);
  text-align: center;
}

.nf__code {
  font-size: clamp(4rem, 3rem + 8vw, 8rem);
  font-weight: var(--dt-fw-bold);
  line-height: 1;
  color: var(--dt-teal-200);
  letter-spacing: -0.04em;
}

.nf__title {
  font-size: var(--dt-fs-h1);
}

.nf__text {
  color: var(--dt-muted);
  max-width: 44ch;
}

.nf__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--dt-space-2);
}

.nf__help {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
}

.nf__help a {
  color: var(--dt-teal-600);
  font-weight: var(--dt-fw-semibold);
}
</style>
