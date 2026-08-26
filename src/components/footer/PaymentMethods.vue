<script setup>
/**
 * Payment badges shown in the footer and, in compact form, beside the booking
 * summary. Brand artwork lives in PaymentBrandMark so the checkout step and
 * this strip always show the same logos.
 */
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import PaymentBrandMark from '@/components/common/PaymentBrandMark.vue'

defineProps({
  compact: { type: Boolean, default: false },
})

const BRANDS = [
  { id: 'mada', label: 'مدى' },
  { id: 'visa', label: 'Visa' },
  { id: 'mastercard', label: 'Mastercard' },
  { id: 'applepay', label: 'Apple Pay' },
  { id: 'stcpay', label: 'stc pay' },
  { id: 'tabby', label: 'تابي — قسّمها على 4 دفعات' },
  { id: 'tamara', label: 'تمارا — ادفع بعد 30 يوم' },
]
</script>

<template>
  <div class="pm" :class="{ 'pm--compact': compact }">
    <p class="pm__title">
      <DoctolIcon name="lock" :size="16" />
      طرق دفع آمنة ومتنوعة
    </p>

    <ul class="pm__list">
      <li v-for="brand in BRANDS" :key="brand.id" class="pm__item">
        <PaymentBrandMark :name="brand.id" :size="22" :label="brand.label" />
      </li>
    </ul>

    <p class="pm__note">
      <DoctolIcon name="shield" :size="15" />
      دفع مشفّر بالكامل — لا نحتفظ ببيانات بطاقتك
    </p>
  </div>
</template>

<style scoped>
.pm {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dt-space-3);
  padding-block: var(--dt-space-6);
  border-block-start: 1px solid rgb(255 255 255 / 0.12);
  text-align: center;
}

.pm__title {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  color: rgb(255 255 255 / 0.9);
}

.pm__list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--dt-space-2);
}

.pm__item {
  display: grid;
  place-items: center;
  min-width: 58px;
  padding: 0.35rem 0.55rem;
  border-radius: var(--dt-radius-sm);
  background: rgb(255 255 255 / 0.94);
  box-shadow: var(--dt-shadow-xs);
  transition: transform var(--dt-dur-2) var(--dt-ease-spring);
}

.pm__item:hover {
  transform: translateY(-3px);
}

.pm__note {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--dt-fs-xs);
  color: rgb(255 255 255 / 0.6);
}

/* Compact variant is used on light surfaces inside the booking summary. */
.pm--compact {
  border: 0;
  padding-block: 0;
  align-items: flex-start;
  text-align: start;
}

.pm--compact .pm__title,
.pm--compact .pm__note {
  color: var(--dt-muted);
}

.pm--compact .pm__item {
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
}

@media (prefers-reduced-motion: reduce) {
  .pm__item:hover {
    transform: none;
  }
}
</style>
