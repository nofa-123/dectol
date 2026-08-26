<script setup>
/**
 * Step 3 — date and time.
 * Days come from the availability endpoint (14-day window); slots load per day
 * with a skeleton state, and unavailable slots stay visible but disabled so the
 * calendar never appears to "jump".
 */
import { computed, onMounted } from 'vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import { formatShortDate, formatTimeLabel, relativeDayLabel, toISODate } from '@/utils/format'
import { useBookingStore } from '@/stores/bookingStore'

const booking = useBookingStore()

onMounted(async () => {
  await booking.loadBookableDays()
  if (!booking.schedule.date) booking.selectDate(toISODate(new Date()))
})

const hasSlots = computed(() => booking.availability.some((slot) => slot.available))
</script>

<template>
  <div class="sd">
    <section>
      <h3 class="sd__title">
        <DoctolIcon name="calendar" :size="18" />
        اختر اليوم
      </h3>

      <ul class="rail sd__days">
        <li v-for="day in booking.bookableDays" :key="day.date">
          <button
            type="button"
            class="sd__day"
            :class="{
              'sd__day--on': booking.schedule.date === day.date,
              'sd__day--full': day.full,
            }"
            :disabled="day.full"
            :aria-pressed="booking.schedule.date === day.date"
            @click="booking.selectDate(day.date)"
          >
            <span class="sd__day-name">{{ relativeDayLabel(day.date) }}</span>
            <span class="sd__day-date">{{ formatShortDate(day.date) }}</span>
            <span v-if="day.full" class="sd__day-full">مكتمل</span>
          </button>
        </li>
      </ul>
    </section>

    <section>
      <h3 class="sd__title">
        <DoctolIcon name="clock" :size="18" />
        اختر الوقت
      </h3>

      <div v-if="booking.availabilityLoading" class="sd__slots">
        <SkeletonBlock v-for="i in 7" :key="i" height="64px" radius="var(--dt-radius-md)" />
      </div>

      <p v-else-if="!booking.schedule.date" class="sd__hint">اختر اليوم أولاً لعرض المواعيد.</p>

      <p v-else-if="!hasSlots" class="sd__hint sd__hint--warn">
        <DoctolIcon name="alert" :size="16" />
        ما فيه مواعيد متاحة في هذا اليوم. جرّب يوماً آخر.
      </p>

      <ul v-else class="sd__slots">
        <li v-for="slot in booking.availability" :key="slot.time">
          <button
            type="button"
            class="sd__slot"
            :class="{
              'sd__slot--on': booking.schedule.time === slot.time,
              'sd__slot--low': slot.lowStock,
            }"
            :disabled="!slot.available"
            :aria-pressed="booking.schedule.time === slot.time"
            @click="booking.selectTime(slot.time)"
          >
            <span class="sd__slot-time">{{ formatTimeLabel(slot.time) }}</span>
            <span v-if="slot.lowStock" class="sd__slot-tag">آخر موعد</span>
            <span v-else-if="!slot.available" class="sd__slot-tag sd__slot-tag--muted">محجوز</span>
          </button>
        </li>
      </ul>
    </section>

    <p class="sd__note">
      <DoctolIcon name="info" :size="16" />
      الفريق يصل خلال نافذة 60 دقيقة من الموعد المحدد، ونتواصل معك قبل الوصول.
    </p>
  </div>
</template>

<style scoped>
.sd {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-6);
}

.sd__title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: var(--dt-fs-h4);
  font-weight: var(--dt-fw-semibold);
  margin-block-end: var(--dt-space-3);
}

.sd__title :deep(svg) {
  color: var(--dt-teal-500);
}

/* ---------- days ---------- */
.sd__days {
  gap: var(--dt-space-2);
}

.sd__day {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  width: 92px;
  min-height: 84px;
  padding: 0.6rem 0.4rem;
  border: 1.5px solid var(--dt-line);
  border-radius: var(--dt-radius-md);
  background: var(--dt-surface);
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    background-color var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-2) var(--dt-ease-spring);
}

.sd__day:hover:not(:disabled) {
  border-color: var(--dt-teal-300);
  transform: translateY(-2px);
}

.sd__day--on {
  border-color: var(--dt-teal-500);
  background: var(--dt-grad-primary);
  color: #fff;
  box-shadow: var(--dt-shadow-teal);
}

.sd__day--full {
  opacity: 0.5;
  cursor: not-allowed;
}

.sd__day-name {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
}

.sd__day-date {
  font-size: var(--dt-fs-xs);
  opacity: 0.8;
}

.sd__day-full {
  font-size: 0.62rem;
  color: var(--dt-danger);
  font-weight: var(--dt-fw-semibold);
}

/* ---------- slots ---------- */
.sd__slots {
  display: grid;
  gap: var(--dt-space-2);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr));
}

.sd__slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  min-height: 64px;
  padding: 0.6rem;
  border: 1.5px solid var(--dt-line);
  border-radius: var(--dt-radius-md);
  background: var(--dt-surface);
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    background-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out);
}

.sd__slot:hover:not(:disabled) {
  border-color: var(--dt-teal-300);
  background: var(--dt-teal-50);
}

.sd__slot--on {
  border-color: var(--dt-teal-500);
  background: var(--dt-grad-primary);
  color: #fff;
}

.sd__slot:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  background: var(--dt-surface-sunken);
}

.sd__slot-time {
  font-weight: var(--dt-fw-semibold);
  font-size: var(--dt-fs-sm);
}

.sd__slot-tag {
  font-size: 0.62rem;
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-warning);
}

.sd__slot--on .sd__slot-tag {
  color: var(--dt-gold-300);
}

.sd__slot-tag--muted {
  color: var(--dt-muted-soft);
}

/* ---------- notes ---------- */
.sd__hint {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: var(--dt-space-5);
  border-radius: var(--dt-radius-md);
  background: var(--dt-surface-sunken);
  color: var(--dt-muted);
  font-size: var(--dt-fs-sm);
  justify-content: center;
}

.sd__hint--warn {
  background: var(--dt-warning-soft);
  color: var(--dt-warning);
}

.sd__note {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
}

.sd__note :deep(svg) {
  flex: none;
  margin-block-start: 0.15rem;
  color: var(--dt-teal-500);
}
</style>
