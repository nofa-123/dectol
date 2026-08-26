<script setup>
/** Booking route — thin wrapper; all logic lives in BookingWizard. */
import BookingWizard from '@/components/booking/BookingWizard.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { contactInfo } from '@/data/content'
</script>

<template>
  <div class="bkg">
    <div class="container">
      <div class="bkg__intro">
        <span class="eyebrow">
          <DoctolIcon name="calendar-check" :size="16" />
          حجز خدمة
        </span>
        <a class="bkg__help" :href="`tel:${contactInfo.phone}`">
          <DoctolIcon name="headset" :size="17" />
          تحتاج مساعدة؟ <span class="num">{{ contactInfo.phone }}</span>
        </a>
      </div>

      <BookingWizard />
    </div>
  </div>
</template>

<style scoped>
.bkg {
  padding-block: calc(var(--dt-header-h) + var(--dt-space-6)) var(--dt-space-10);
  min-height: 100dvh;
  background:
    radial-gradient(ellipse 70% 40% at 50% 0%, rgb(0 159 163 / 0.06), transparent 70%),
    var(--dt-canvas);
}

.bkg__intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-4);
  flex-wrap: wrap;
  margin-block-end: var(--dt-space-6);
}

.bkg__help {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--dt-fs-sm);
  color: var(--dt-ink-soft);
  padding: 0.5rem 0.9rem;
  border-radius: var(--dt-radius-pill);
  border: 1px solid var(--dt-line);
  background: var(--dt-surface);
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out);
}

.bkg__help:hover {
  border-color: var(--dt-teal-300);
  color: var(--dt-teal-700);
}

.bkg__help :deep(svg) {
  color: var(--dt-teal-500);
}
</style>
