<script setup>
/** Step 4 — who we're serving and how to reach them. */
import BaseField from '@/components/common/BaseField.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { PHONE_MAX_DIGITS, sanitizePhoneInput } from '@/utils/format'
import { validators } from '@/utils/validate'
import { useBookingStore } from '@/stores/bookingStore'

const booking = useBookingStore()

/** Digits in, digits out — grouping is left to read-only surfaces. */
function onPhone(value) {
  booking.setCustomer({ phone: sanitizePhoneInput(value) })
}

function validateField(field) {
  const message = validators[field]?.(booking.customer[field]) ?? ''
  booking.errors = message
    ? { ...booking.errors, [field]: message }
    : Object.fromEntries(Object.entries(booking.errors).filter(([key]) => key !== field))
}
</script>

<template>
  <div class="sdet">
    <BaseField
      label="الاسم الكامل"
      placeholder="مثال: أحمد الشهري"
      icon="user"
      required
      autocomplete="name"
      :model-value="booking.customer.name"
      :error="booking.errors.name"
      @update:model-value="(value) => booking.setCustomer({ name: value })"
      @blur="validateField('name')"
    />

    <BaseField
      label="رقم الجوال"
      type="tel"
      placeholder="05XXXXXXXX"
      icon="phone"
      required
      inputmode="numeric"
      autocomplete="tel"
      :maxlength="PHONE_MAX_DIGITS"
      hint="نستخدمه لتأكيد الحجز وتنسيق وصول الفريق"
      :model-value="booking.customer.phone"
      :error="booking.errors.phone"
      @update:model-value="onPhone"
      @blur="validateField('phone')"
    />

    <BaseField
      label="البريد الإلكتروني"
      type="email"
      placeholder="you@example.com"
      icon="mail"
      autocomplete="email"
      hint="اختياري — لإرسال الفاتورة وتفاصيل الحجز"
      :model-value="booking.customer.email"
      :error="booking.errors.email"
      @update:model-value="(value) => booking.setCustomer({ email: value })"
      @blur="validateField('email')"
    />

    <p class="sdet__privacy">
      <DoctolIcon name="lock" :size="16" />
      بياناتك محفوظة وتُستخدم فقط لتنفيذ الخدمة. لا نشاركها مع أي جهة خارجية.
    </p>
  </div>
</template>

<style scoped>
.sdet {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-5);
  max-width: 34rem;
}

.sdet__privacy {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  padding: var(--dt-space-4);
  border-radius: var(--dt-radius-md);
  background: var(--dt-surface-sunken);
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
}

.sdet__privacy :deep(svg) {
  flex: none;
  margin-block-start: 0.1rem;
  color: var(--dt-teal-500);
}
</style>
