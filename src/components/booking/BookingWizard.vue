<script setup>
/**
 * Booking wizard shell.
 *
 * Owns the progress header, the step transition, the sticky action bar and
 * submission. Steps stay dumb — they read and write the stores, nothing else.
 */
import { computed, onMounted, ref, watch } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import BookingSummaryPanel from '@/components/booking/BookingSummaryPanel.vue'
import BookingSuccess from '@/components/booking/BookingSuccess.vue'
import LeadCaptureSheet from '@/components/booking/LeadCaptureSheet.vue'
import StepServiceSelect from '@/components/booking/StepServiceSelect.vue'
import StepPlan from '@/components/booking/StepPlan.vue'
import StepConfirm from '@/components/booking/StepConfirm.vue'
import { formatPrice } from '@/utils/format'
import { scrollBehavior } from '@/utils/motion'
import { useBooking } from '@/composables/useBooking'
import { useBookingStore } from '@/stores/bookingStore'
import { useCartStore } from '@/stores/cartStore'
import { useServicesStore } from '@/stores/servicesStore'
import { doctolApi } from '@/services/doctolApi'

const STEP_COMPONENTS = {
  services: StepServiceSelect,
  schedule: StepPlan,
  confirm: StepConfirm,
}

const booking = useBookingStore()
const cart = useCartStore()
const catalogue = useServicesStore()
const { confirm, hydrateCustomer } = useBooking()

const direction = ref('forward')
const stageTop = ref(null)

const currentComponent = computed(() => STEP_COMPONENTS[booking.currentStep.id])
const stepCounter = computed(
  () => `${booking.stepIndex + 1} من ${booking.BOOKING_STEPS.length}`,
)

onMounted(() => {
  catalogue.ensureLoaded()
  hydrateCustomer()
  if (booking.currentStep.id === 'schedule') booking.primeSchedule()
})

watch(
  () => booking.stepIndex,
  (next, previous) => {
    direction.value = next >= previous ? 'forward' : 'back'
    if (booking.BOOKING_STEPS[next].id === 'schedule') booking.primeSchedule()
    stageTop.value?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
  },
)

function onNext() {
  if (booking.currentStep.id === 'schedule' && !booking.validateCurrentStep()) return
  booking.next()
}

async function onSubmit() {
  if (!booking.validateCurrentStep()) return
  // Laravel creates bookings with a bearer token, not an OTP-only session.
  // A customer could previously dismiss the lead sheet and reach checkout
  // without registering; reopen registration instead of sending a request
  // that is guaranteed to fail.
  if (!doctolApi.isAuthenticated()) {
    booking.submitError = ''
    booking.leadCaptured = false
    return
  }
  await confirm()
}

function startAnother() {
  booking.reset({ keepCustomer: true })
}
</script>

<template>
  <BookingSuccess
    v-if="booking.confirmation"
    :booking="booking.confirmation"
    @new-booking="startAnother"
  />

  <div v-else class="wiz">
    <!-- progress -->
    <div ref="stageTop" class="wiz__progress">
      <div class="wiz__progress-head">
        <span class="wiz__progress-label">{{ booking.currentStep.label }}</span>
        <span class="wiz__progress-count num">{{ stepCounter }}</span>
      </div>
      <div
        class="wiz__bar"
        role="progressbar"
        :aria-valuenow="booking.stepIndex + 1"
        aria-valuemin="1"
        :aria-valuemax="booking.BOOKING_STEPS.length"
        :aria-label="`خطوة ${booking.stepIndex + 1} من ${booking.BOOKING_STEPS.length}`"
      >
        <span class="wiz__bar-fill" :style="{ width: `${booking.progress}%` }" />
      </div>
    </div>

    <div class="wiz__layout">
      <section class="wiz__stage">
        <Transition :name="`step-${direction}`" mode="out-in">
          <component :is="currentComponent" :key="booking.currentStep.id" />
        </Transition>
      </section>

      <BookingSummaryPanel class="wiz__summary" />
    </div>

    <!-- sticky actions -->
    <div class="wiz__actions">
      <div class="wiz__actions-inner">
        <BaseButton
          v-if="!booking.isFirstStep"
          class="wiz__back"
          variant="ghost"
          icon="chevron-right"
          @click="booking.back()"
        >
          السابق
        </BaseButton>

        <BaseButton
          v-if="!booking.isLastStep"
          class="wiz__cta"
          size="lg"
          icon-end="arrow-left"
          :disabled="!booking.canAdvance"
          @click="onNext"
        >
          {{ booking.ctaLabel }}
        </BaseButton>

        <BaseButton
          v-else
          class="wiz__cta"
          size="lg"
          icon="check-circle"
          :loading="booking.submitting"
          loading-text="جاري تأكيد الحجز…"
          :disabled="!booking.canAdvance"
          @click="onSubmit"
        >
          {{ booking.ctaLabel }}
        </BaseButton>

        <div class="wiz__total">
          <span>الإجمالي (<span class="num">{{ cart.itemCount }}</span>)</span>
          <strong class="money">{{ formatPrice(cart.total) }}</strong>
        </div>
      </div>

      <p v-if="!booking.canAdvance" class="wiz__note">
        <DoctolIcon name="info" :size="14" />
        {{
          booking.currentStep.id === 'services'
            ? 'اختر خدمة واحدة على الأقل للمتابعة'
            : booking.currentStep.id === 'confirm'
              ? 'راجع الاسم ورقم الجوال واختر طريقة الدفع لتفعيل تأكيد الحجز'
            : 'أكمل بيانات هذه الخطوة للمتابعة'
        }}
      </p>
    </div>

    <LeadCaptureSheet
      :open="!booking.leadCaptured"
      @submit="booking.captureLead($event)"
    />
  </div>
</template>

<style scoped>
.wiz {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-5);
  /* Room for the sticky bar plus the mobile nav */
  padding-block-end: 8rem;
  scroll-margin-top: calc(var(--dt-header-h) + 1rem);
}

/* ---------- progress ---------- */
.wiz__progress {
  scroll-margin-top: calc(var(--dt-header-h) + 1rem);
}

.wiz__progress-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--dt-space-3);
  margin-block-end: var(--dt-space-2);
}

.wiz__progress-label {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-ink-soft);
}

.wiz__progress-count {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.wiz__bar {
  height: 6px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-line);
  overflow: hidden;
}

.wiz__bar-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--dt-grad-primary);
  transition: width var(--dt-dur-4) var(--dt-ease-out);
}

/* ---------- layout ---------- */
.wiz__layout {
  display: grid;
  gap: var(--dt-space-6);
  align-items: start;
}

.wiz__stage {
  min-width: 0;
}

/**
 * `.rail` bleeds past its container by a negative inline margin so cards peek
 * off the viewport edge. That is right on a single-column page, but inside the
 * two-column wizard it lets the carousels slide out of their grid track and
 * run underneath the summary panel. Cancel the bleed here so the stage stays
 * inside its own column and never reaches the sidebar.
 */
.wiz__stage :deep(.rail) {
  margin-inline: 0;
  padding-inline: 0;
}

.wiz__summary {
  display: none;
}

/* ---------- sticky action bar ---------- */
.wiz__actions {
  position: fixed;
  inset-inline: 0;
  inset-block-end: var(--dt-mobilenav-h);
  z-index: 40;
  padding: var(--dt-space-3) var(--dt-gutter) calc(var(--dt-space-3) + env(safe-area-inset-bottom, 0px));
  background: rgb(255 255 255 / 0.94);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border-block-start: 1px solid var(--dt-line);
  box-shadow: 0 -10px 30px -22px rgb(7 59 76 / 0.6);
}

.wiz__actions-inner {
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
  max-width: var(--dt-container);
  margin-inline: auto;
}

.wiz__cta {
  flex: 1;
}

.wiz__back {
  flex: none;
}

.wiz__total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex: none;
  line-height: 1.25;
  padding-inline-start: var(--dt-space-3);
  border-inline-start: 1px solid var(--dt-line);
}

.wiz__total span {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.wiz__total strong {
  font-size: 1.3rem;
  font-weight: var(--dt-fw-bold);
  color: var(--dt-teal-700);
  white-space: nowrap;
}

.wiz__note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  margin-block-start: 0.4rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

/* ---------- step transitions (RTL: forward moves leftwards) ---------- */
.step-forward-enter-active,
.step-forward-leave-active,
.step-back-enter-active,
.step-back-leave-active {
  transition:
    opacity var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-3) var(--dt-ease-out);
}

.step-forward-enter-from {
  opacity: 0;
  transform: translateX(28px);
}
.step-forward-leave-to {
  opacity: 0;
  transform: translateX(-28px);
}
.step-back-enter-from {
  opacity: 0;
  transform: translateX(-28px);
}
.step-back-leave-to {
  opacity: 0;
  transform: translateX(28px);
}

@media (min-width: 1024px) {
  .wiz {
    padding-block-end: var(--dt-space-6);
  }
  .wiz__layout {
    grid-template-columns: minmax(0, 1fr) 340px;
  }
  .wiz__summary {
    display: flex;
    /* Own stacking context, above any card that gets a hover transform. */
    position: relative;
    z-index: 1;
    min-width: 0;
  }
  .wiz__actions {
    position: static;
    inset: auto;
    padding: var(--dt-space-4) var(--dt-space-5);
    background: var(--dt-surface);
    border: 1px solid var(--dt-line);
    border-radius: var(--dt-radius-xl);
    box-shadow: var(--dt-shadow-sm);
    backdrop-filter: none;
  }
  .wiz__cta {
    flex: 0 1 260px;
    margin-inline-start: auto;
  }
  .wiz__total {
    order: -1;
    align-items: flex-start;
    border-inline-start: 0;
    padding-inline-start: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .step-forward-enter-active,
  .step-forward-leave-active,
  .step-back-enter-active,
  .step-back-leave-active {
    transition: opacity var(--dt-dur-2) linear;
  }
  .step-forward-enter-from,
  .step-forward-leave-to,
  .step-back-enter-from,
  .step-back-leave-to {
    transform: none;
  }
}
</style>
