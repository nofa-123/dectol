<script setup>
/**
 * Floating quick-booking bar that overlaps the hero.
 *
 * It is a shortcut, not a second booking flow: each segment jumps into the
 * wizard at the matching step, carrying whatever has already been chosen.
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useBookingStore } from '@/stores/bookingStore'
import { useCartStore } from '@/stores/cartStore'
import { useServicesStore } from '@/stores/servicesStore'
import { formatTimeLabel, relativeDayLabel } from '@/utils/format'
import { vReveal } from '@/composables/useScrollAnimation'

const router = useRouter()
const booking = useBookingStore()
const cart = useCartStore()
const catalogue = useServicesStore()

const serviceLabel = computed(() => {
  const chosen = cart.items.filter((i) => i.valid)
  if (!chosen.length && !cart.bundles.length) return 'اختر الخدمة'
  const first = chosen[0]?.service.shortName ?? chosen[0]?.service.name ?? cart.bundles[0]?.name
  const rest = cart.itemCount - 1
  return rest > 0 ? `${first} +${rest}` : first
})

const locationLabel = computed(() => {
  const city = catalogue.cityById(booking.location.cityId)
  if (!city) return 'حدد موقعك'
  return booking.location.district ? `${city.name} — ${booking.location.district}` : city.name
})

const dateLabel = computed(() =>
  booking.schedule.date ? relativeDayLabel(booking.schedule.date) : 'اختر التاريخ',
)

const timeLabel = computed(() =>
  booking.schedule.time ? formatTimeLabel(booking.schedule.time) : 'اختر الوقت',
)

const segments = computed(() => [
  { id: 'services', icon: 'grid', label: 'الخدمة', value: serviceLabel.value, filled: cart.hasSelection },
  { id: 'schedule', icon: 'pin', label: 'الموقع', value: locationLabel.value, filled: Boolean(booking.location.district) },
  { id: 'schedule', icon: 'calendar', label: 'التاريخ', value: dateLabel.value, filled: Boolean(booking.schedule.date) },
  { id: 'schedule', icon: 'clock', label: 'الوقت', value: timeLabel.value, filled: Boolean(booking.schedule.time) },
])

/** Jumping to a later step is only allowed once earlier steps are complete. */
function goTo(stepId) {
  const index = booking.BOOKING_STEPS.findIndex((s) => s.id === stepId)
  router.push({ name: 'booking' }).then(() => booking.goToStep(Math.max(0, index)))
}

const submit = () => goTo(cart.hasSelection ? 'schedule' : 'services')
</script>

<template>
  <section class="qb" aria-labelledby="qb-title">
    <div class="container container--wide">
      <div v-reveal="'scale'" class="qb__card">
        <div class="qb__head">
          <h2 id="qb-title" class="qb__title">
            احجز خدمتك في أقل من دقيقة
            <DoctolIcon name="sparkle" :size="20" class="qb__title-icon" />
          </h2>
          <p class="qb__subtitle">اختر، حدّد الموعد، وخلّ الباقي علينا</p>
        </div>

        <div class="qb__form">
          <button
            v-for="(segment, index) in segments"
            :key="segment.label"
            type="button"
            class="qb__segment"
            :class="{ 'qb__segment--filled': segment.filled }"
            @click="goTo(segment.id)"
          >
            <span class="qb__segment-index num" aria-hidden="true">{{ index + 1 }}</span>
            <span class="qb__segment-icon"><DoctolIcon :name="segment.icon" :size="19" /></span>
            <span class="qb__segment-text">
              <span class="qb__segment-label">{{ segment.label }}</span>
              <span class="qb__segment-value">{{ segment.value }}</span>
            </span>
          </button>

          <BaseButton class="qb__submit" size="lg" icon-end="arrow-left" @click="submit">
            احجز الآن
          </BaseButton>
        </div>

        <ul class="qb__perks">
          <li><DoctolIcon name="check-circle" :size="16" /> بدون رسوم زيارة</li>
          <li><DoctolIcon name="check-circle" :size="16" /> إلغاء مجاني حتى 3 ساعات قبل الموعد</li>
          <li><DoctolIcon name="check-circle" :size="16" /> الدفع بعد إتمام الخدمة متاح</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.qb {
  position: relative;
  z-index: 2;
  /* Overlaps the hero above it */
  margin-block-start: clamp(-2rem, -1rem - 3vw, -5rem);
}

/**
 * Hidden on phones: the four-row form pushed the whole page down before the
 * visitor had seen a single service, and the sticky "احجز" tab in the mobile
 * nav already covers the same job in one tap. Desktop keeps it.
 */
@media (max-width: 767px) {
  .qb {
    display: none;
  }
}

.qb__card {
  padding: clamp(1.25rem, 1rem + 1.5vw, 2rem);
  border-radius: var(--dt-radius-2xl);
  background: rgb(255 255 255 / 0.86);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgb(255 255 255 / 0.9);
  box-shadow: var(--dt-shadow-xl);
}

.qb__head {
  margin-block-end: var(--dt-space-5);
}

.qb__title {
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  font-size: var(--dt-fs-h3);
}

.qb__title-icon {
  color: var(--dt-gold-500);
}

.qb__subtitle {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
  margin-block-start: 0.25rem;
}

.qb__form {
  display: grid;
  gap: var(--dt-space-2);
  grid-template-columns: 1fr;
}

.qb__segment {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
  min-height: 68px;
  padding: 0.7rem 1rem;
  text-align: start;
  border: 1.5px solid var(--dt-line);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface);
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    background-color var(--dt-dur-2) var(--dt-ease-out),
    box-shadow var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-2) var(--dt-ease-out);
}

.qb__segment:hover {
  border-color: var(--dt-teal-300);
  box-shadow: var(--dt-shadow-sm);
  transform: translateY(-2px);
}

.qb__segment--filled {
  border-color: var(--dt-teal-200);
  background: var(--dt-teal-50);
}

.qb__segment-index {
  position: absolute;
  inset-block-start: 0.45rem;
  inset-inline-end: 0.6rem;
  font-size: 0.66rem;
  font-weight: var(--dt-fw-bold);
  color: var(--dt-line-strong);
}

.qb__segment--filled .qb__segment-index {
  color: var(--dt-teal-300);
}

.qb__segment-icon {
  flex: none;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: var(--dt-radius-md);
  background: var(--dt-surface-sunken);
  color: var(--dt-navy-600);
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out);
}

.qb__segment--filled .qb__segment-icon,
.qb__segment:hover .qb__segment-icon {
  background: var(--dt-teal-500);
  color: #fff;
}

.qb__segment-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.qb__segment-label {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  font-weight: var(--dt-fw-medium);
}

.qb__segment-value {
  font-weight: var(--dt-fw-semibold);
  font-size: var(--dt-fs-sm);
  color: var(--dt-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qb__submit {
  min-height: 68px;
}

.qb__perks {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dt-space-2) var(--dt-space-5);
  margin-block-start: var(--dt-space-4);
  padding-block-start: var(--dt-space-4);
  border-block-start: 1px dashed var(--dt-line);
}

.qb__perks li {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.qb__perks :deep(svg) {
  color: var(--dt-success);
}

@media (min-width: 640px) {
  .qb__form {
    grid-template-columns: 1fr 1fr;
  }
  .qb__submit {
    grid-column: 1 / -1;
  }
}

@media (min-width: 1100px) {
  .qb__form {
    grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
    align-items: stretch;
  }
  .qb__submit {
    grid-column: auto;
    padding-inline: 2.2rem;
  }
}
</style>
