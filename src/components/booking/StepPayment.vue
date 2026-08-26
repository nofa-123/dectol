<script setup>
/**
 * Step 6 — payment method selection.
 *
 * This is a front-end simulation only: no card fields, no tokenisation, no
 * charge. The real integration will swap this component for the provider's
 * hosted widget, which is why nothing here collects sensitive data.
 */
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import PaymentBrandMark from '@/components/common/PaymentBrandMark.vue'
import { formatPrice } from '@/utils/format'
import { paymentMethods } from '@/data/content'
import { useBookingStore } from '@/stores/bookingStore'
import { useCartStore } from '@/stores/cartStore'

const booking = useBookingStore()
const cart = useCartStore()
</script>

<template>
  <div class="sp">
    <div class="sp__total">
      <span>المبلغ المستحق</span>
      <strong class="money">{{ formatPrice(cart.total) }}</strong>
    </div>

    <fieldset class="sp__group">
      <legend class="sp__legend">اختر طريقة الدفع</legend>
      <div class="sp__methods">
        <label
          v-for="method in paymentMethods"
          :key="method.id"
          class="sp__method"
          :class="{ 'sp__method--on': booking.paymentMethod === method.id }"
        >
          <input
            type="radio"
            name="payment"
            class="visually-hidden"
            :value="method.id"
            :checked="booking.paymentMethod === method.id"
            @change="booking.paymentMethod = method.id"
          />
          <span class="sp__method-icon">
            <PaymentBrandMark :name="method.id" :size="20" />
          </span>
          <span class="sp__method-text">
            <strong>{{ method.label }}</strong>
            <small>{{ method.hint }}</small>
          </span>
          <span class="sp__method-radio" aria-hidden="true" />
        </label>
      </div>
    </fieldset>

    <div class="sp__notice">
      <DoctolIcon name="lock" :size="18" />
      <p>
        هذه نسخة تجريبية للواجهة — لن يتم خصم أي مبلغ. عند الربط الفعلي ستتم عملية الدفع عبر بوابة
        مؤمّنة ومشفّرة، ولا تُخزَّن بيانات بطاقتك لدى دكتول.
      </p>
    </div>

    <div v-if="booking.submitError" class="sp__error" role="alert">
      <DoctolIcon name="alert" :size="18" />
      {{ booking.submitError }}
    </div>

    <p class="sp__terms">
      بالضغط على «تأكيد الحجز» فإنك توافق على
      <RouterLink :to="{ name: 'contact' }">الشروط والأحكام</RouterLink> و<RouterLink
        :to="{ name: 'contact' }"
        >سياسة الإلغاء</RouterLink
      >.
    </p>
  </div>
</template>

<style scoped>
.sp {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-5);
}

.sp__total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-3);
  padding: var(--dt-space-4) var(--dt-space-5);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-grad-primary);
  color: #fff;
  box-shadow: var(--dt-shadow-teal);
}

.sp__total strong {
  font-size: 1.5rem;
  font-weight: var(--dt-fw-bold);
}

.sp__group {
  border: 0;
  padding: 0;
  margin: 0;
}

.sp__legend {
  font-weight: var(--dt-fw-semibold);
  margin-block-end: var(--dt-space-3);
}

.sp__methods {
  display: grid;
  gap: var(--dt-space-2);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
}

.sp__method {
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
  min-height: 68px;
  padding: 0.7rem 1rem;
  border: 1.5px solid var(--dt-line);
  border-radius: var(--dt-radius-md);
  background: var(--dt-surface);
  cursor: pointer;
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    background-color var(--dt-dur-2) var(--dt-ease-out);
}

.sp__method:hover {
  border-color: var(--dt-teal-300);
}

.sp__method--on {
  border-color: var(--dt-teal-500);
  background: var(--dt-teal-50);
}

.sp__method:focus-within {
  box-shadow: 0 0 0 4px var(--dt-focus-ring);
}

/* Wider than a square so the brand wordmarks fit without being squeezed. */
.sp__method-icon {
  display: grid;
  place-items: center;
  width: 68px;
  height: 42px;
  flex: none;
  padding-inline: 0.4rem;
  border-radius: var(--dt-radius-sm);
  border: 1px solid var(--dt-line);
  background: var(--dt-white, #fff);
}

.sp__method--on .sp__method-icon {
  border-color: var(--dt-teal-400);
}

.sp__method-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.sp__method-text strong {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
}

.sp__method-text small {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.sp__method-radio {
  flex: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--dt-line-strong);
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    box-shadow var(--dt-dur-2) var(--dt-ease-out);
}

.sp__method--on .sp__method-radio {
  border-color: var(--dt-teal-500);
  box-shadow: inset 0 0 0 4px var(--dt-teal-500);
}

.sp__notice {
  display: flex;
  align-items: flex-start;
  gap: var(--dt-space-3);
  padding: var(--dt-space-4);
  border-radius: var(--dt-radius-md);
  background: var(--dt-surface-sunken);
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
}

.sp__notice :deep(svg) {
  flex: none;
  color: var(--dt-teal-500);
}

.sp__error {
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  padding: var(--dt-space-4);
  border-radius: var(--dt-radius-md);
  background: var(--dt-danger-soft);
  color: var(--dt-danger);
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-medium);
}

.sp__terms {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  text-align: center;
}

.sp__terms :deep(a) {
  color: var(--dt-teal-600);
  text-decoration: underline;
}
</style>
