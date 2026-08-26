<script setup>
/**
 * Step 2 — where and when.
 * Two related questions on one screen: the customer already knows both
 * answers, so splitting them across screens only adds taps.
 */
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import StepLocation from '@/components/booking/StepLocation.vue'
import StepSchedule from '@/components/booking/StepSchedule.vue'
</script>

<template>
  <div class="plan">
    <section class="plan__section">
      <h2 class="plan__heading">
        <span class="plan__num num">1</span>
        <DoctolIcon name="pin" :size="19" />
        أين نصلك؟
      </h2>
      <StepLocation />
    </section>

    <section class="plan__section">
      <h2 class="plan__heading">
        <span class="plan__num num">2</span>
        <DoctolIcon name="calendar" :size="19" />
        متى يناسبك؟
      </h2>
      <StepSchedule />
    </section>
  </div>
</template>

<style scoped>
.plan {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-8);
}

.plan__heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--dt-fs-h3);
  margin-block-end: var(--dt-space-4);
}

.plan__heading :deep(svg) {
  color: var(--dt-teal-500);
}

.plan__num {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-teal-500);
  color: #fff;
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-bold);
}
</style>
