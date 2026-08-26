<script setup>
/**
 * Step 3 — contact details, order review and payment method.
 * Details come first because they are prefilled from the lead sheet and take
 * a second to confirm; the money is the last thing the customer looks at.
 */
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import StepDetails from '@/components/booking/StepDetails.vue'
import StepSummary from '@/components/booking/StepSummary.vue'
import StepPayment from '@/components/booking/StepPayment.vue'
</script>

<template>
  <div class="confirm">
    <section class="confirm__section">
      <h2 class="confirm__heading">
        <DoctolIcon name="user" :size="19" />
        بيانات التواصل
      </h2>
      <StepDetails />
    </section>

    <section class="confirm__section">
      <h2 class="confirm__heading">
        <DoctolIcon name="list" :size="19" />
        مراجعة الطلب
      </h2>
      <StepSummary />
    </section>

    <section class="confirm__section">
      <h2 class="confirm__heading">
        <DoctolIcon name="card" :size="19" />
        الدفع
      </h2>
      <StepPayment />
    </section>
  </div>
</template>

<style scoped>
.confirm {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-8);
}

.confirm__heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--dt-fs-h3);
  margin-block-end: var(--dt-space-4);
}

.confirm__heading :deep(svg) {
  color: var(--dt-teal-500);
}
</style>
