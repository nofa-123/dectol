<script setup>
/** Confirmation screen shown after a successful booking. */
import { computed } from 'vue'
import SuccessCheck from '@/components/common/SuccessCheck.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { formatDate, formatPrice, formatTimeLabel, relativeDayLabel } from '@/utils/format'
import { contactInfo } from '@/data/content'
import { useServicesStore } from '@/stores/servicesStore'

const props = defineProps({
  booking: { type: Object, required: true },
})

defineEmits(['new-booking'])

const catalogue = useServicesStore()

const cityName = computed(() => catalogue.cityById(props.booking.location.cityId)?.name ?? '')

const rows = computed(() => [
  { icon: 'list', label: 'رقم الحجز', value: props.booking.reference, mono: true },
  {
    icon: 'calendar',
    label: 'الموعد',
    value: `${relativeDayLabel(props.booking.schedule.date)} — ${formatDate(props.booking.schedule.date)}`,
  },
  { icon: 'clock', label: 'الوقت', value: formatTimeLabel(props.booking.schedule.time) },
  {
    icon: 'pin',
    label: 'الموقع',
    value: `${cityName.value} — ${props.booking.location.district}`,
  },
  { icon: 'card', label: 'الإجمالي', value: formatPrice(props.booking.pricing.total), money: true },
])
</script>

<template>
  <div class="bs">
    <SuccessCheck :size="118" />

    <h1 class="bs__title">تم تأكيد حجزك بنجاح</h1>
    <p class="bs__lead">
      شكراً لثقتك بدكتول. سيتواصل معك فريقنا خلال دقائق لتأكيد التفاصيل وتنسيق وصول الفني.
    </p>

    <dl class="bs__card">
      <div v-for="row in rows" :key="row.label" class="bs__row">
        <dt>
          <DoctolIcon :name="row.icon" :size="17" />
          {{ row.label }}
        </dt>
        <dd :class="{ num: row.mono, money: row.money }">{{ row.value }}</dd>
      </div>
    </dl>

    <div class="bs__next">
      <h2 class="bs__next-title">ماذا بعد؟</h2>
      <ol class="bs__steps">
        <li>
          <span class="bs__step-num num">1</span>
          مكالمة تأكيد خلال 15 دقيقة من فريق خدمة العملاء
        </li>
        <li>
          <span class="bs__step-num num">2</span>
          رسالة تذكير قبل الموعد بـ 24 ساعة وأخرى قبل وصول الفريق
        </li>
        <li>
          <span class="bs__step-num num">3</span>
          تنفيذ الخدمة، ثم تقييمك — وضمان 24 ساعة يبدأ من لحظة التسليم
        </li>
      </ol>
    </div>

    <div class="bs__actions">
      <BaseButton variant="outline" icon="home" :to="{ name: 'home' }">العودة للرئيسية</BaseButton>
      <BaseButton variant="ghost" icon="user" :to="{ name: 'account' }">عرض حجوزاتي</BaseButton>
      <BaseButton icon="plus" @click="$emit('new-booking')">حجز خدمة أخرى</BaseButton>
    </div>

    <p class="bs__help">
      تحتاج تعديل أو إلغاء؟ اتصل على
      <a :href="`tel:${contactInfo.phone}`" class="num">{{ contactInfo.phone }}</a>
      — الإلغاء مجاني حتى 3 ساعات قبل الموعد.
    </p>
  </div>
</template>

<style scoped>
.bs {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dt-space-4);
  text-align: center;
  padding-block: var(--dt-space-6);
}

.bs__title {
  font-size: var(--dt-fs-h1);
  color: var(--dt-navy-700);
}

.bs__lead {
  color: var(--dt-muted);
  max-width: 48ch;
  line-height: var(--dt-lh-normal);
}

.bs__card {
  width: 100%;
  max-width: 34rem;
  display: flex;
  flex-direction: column;
  margin-block-start: var(--dt-space-3);
  border: 1px solid var(--dt-line);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface);
  box-shadow: var(--dt-shadow-sm);
  overflow: hidden;
}

.bs__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-4);
  padding: var(--dt-space-3) var(--dt-space-5);
  text-align: start;
}

.bs__row + .bs__row {
  border-block-start: 1px solid var(--dt-line);
}

.bs__row dt {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
}

.bs__row dt :deep(svg) {
  color: var(--dt-teal-500);
}

.bs__row dd {
  font-weight: var(--dt-fw-semibold);
  font-size: var(--dt-fs-sm);
  text-align: end;
}

.bs__next {
  width: 100%;
  max-width: 34rem;
  padding: var(--dt-space-5);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-grad-mint);
  border: 1px solid var(--dt-teal-100);
  text-align: start;
}

.bs__next-title {
  font-size: var(--dt-fs-h4);
  margin-block-end: var(--dt-space-3);
}

.bs__steps {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
}

.bs__steps li {
  display: flex;
  align-items: flex-start;
  gap: var(--dt-space-3);
  font-size: var(--dt-fs-sm);
  color: var(--dt-ink-soft);
  line-height: var(--dt-lh-snug);
}

.bs__step-num {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  flex: none;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-teal-500);
  color: #fff;
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-bold);
}

.bs__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--dt-space-2);
  margin-block-start: var(--dt-space-3);
}

.bs__help {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.bs__help a {
  color: var(--dt-teal-600);
  font-weight: var(--dt-fw-semibold);
}
</style>
