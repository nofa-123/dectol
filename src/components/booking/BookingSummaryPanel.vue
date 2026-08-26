<script setup>
/**
 * Persistent order summary. Sticky sidebar on desktop; on mobile the wizard's
 * sticky bar carries the total instead, so this stays desktop-only.
 */
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { formatDate, formatPrice, formatTimeLabel, relativeDayLabel } from '@/utils/format'
import { useBookingStore } from '@/stores/bookingStore'
import { useCartStore } from '@/stores/cartStore'
import { useServicesStore } from '@/stores/servicesStore'

const booking = useBookingStore()
const cart = useCartStore()
const catalogue = useServicesStore()
</script>

<template>
  <aside class="bsp" aria-label="ملخص الطلب">
    <h2 class="bsp__title">
      ملخص طلبك
      <span v-if="cart.itemCount" class="bsp__count num">{{ cart.itemCount }}</span>
    </h2>

    <ul v-if="cart.itemCount" class="bsp__items">
      <li v-for="bundle in cart.bundleItems" :key="bundle.pkg.id" class="bsp__item">
        <span class="bsp__item-icon"><DoctolIcon name="gift" :size="18" /></span>
        <span class="bsp__item-text">
          <strong>{{ bundle.pkg.name }}</strong>
          <small>{{ bundle.summary }}</small>
        </span>
        <span class="bsp__item-price money">{{ formatPrice(bundle.total) }}</span>
        <button
          type="button"
          class="bsp__remove"
          :aria-label="`إزالة ${bundle.pkg.name}`"
          @click="cart.toggleBundle(bundle.pkg)"
        >
          <DoctolIcon name="close" :size="14" />
        </button>
      </li>

      <li v-for="item in cart.items.filter((i) => i.valid)" :key="item.service.id" class="bsp__item">
        <span class="bsp__item-icon"><DoctolIcon :name="item.service.icon" :size="18" /></span>
        <span class="bsp__item-text">
          <strong>{{ item.service.shortName ?? item.service.name }}</strong>
          <small>{{ item.summary }}</small>
        </span>
        <span class="bsp__item-price money">{{ formatPrice(item.total) }}</span>
        <button
          type="button"
          class="bsp__remove"
          :aria-label="`إزالة ${item.service.name}`"
          @click="cart.remove(item.service.id)"
        >
          <DoctolIcon name="close" :size="14" />
        </button>
      </li>
    </ul>

    <p v-else class="bsp__empty">لم تختر خدمة بعد</p>

    <dl v-if="booking.location.district || booking.schedule.date" class="bsp__facts">
      <div v-if="booking.location.district">
        <dt><DoctolIcon name="pin" :size="15" /> الموقع</dt>
        <dd>
          {{ catalogue.cityById(booking.location.cityId)?.name }} — {{ booking.location.district }}
        </dd>
      </div>
      <div v-if="booking.schedule.date">
        <dt><DoctolIcon name="calendar" :size="15" /> الموعد</dt>
        <dd>
          {{ relativeDayLabel(booking.schedule.date) }}، {{ formatDate(booking.schedule.date) }}
          <template v-if="booking.schedule.time">
            — {{ formatTimeLabel(booking.schedule.time) }}
          </template>
        </dd>
      </div>
    </dl>

    <div v-if="cart.itemCount" class="bsp__totals">
      <div>
        <span>المجموع الفرعي</span>
        <span class="money">{{ formatPrice(cart.subtotal) }}</span>
      </div>
      <div v-if="cart.discount" class="bsp__discount">
        <span>الخصم</span>
        <span class="money">− {{ formatPrice(cart.discount) }}</span>
      </div>
      <div>
        <span>الضريبة 15٪</span>
        <span class="money">{{ formatPrice(cart.vat) }}</span>
      </div>
      <div class="bsp__total">
        <span>الإجمالي</span>
        <span class="money">{{ formatPrice(cart.total) }}</span>
      </div>
    </div>

    <ul class="bsp__assurances">
      <li><DoctolIcon name="shield" :size="15" /> ضمان 24 ساعة</li>
      <li><DoctolIcon name="refresh" :size="15" /> إلغاء مجاني حتى 3 ساعات قبل الموعد</li>
      <li><DoctolIcon name="truck" :size="15" /> بدون رسوم زيارة</li>
    </ul>
  </aside>
</template>

<style scoped>
.bsp {
  position: sticky;
  top: calc(var(--dt-header-h) + var(--dt-space-5));
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
  padding: var(--dt-space-5);
  border-radius: var(--dt-radius-xl);
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-md);
  max-height: calc(100dvh - var(--dt-header-h) - 3rem);
  overflow-y: auto;
}

.bsp__title {
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  font-size: var(--dt-fs-h4);
}

.bsp__count {
  display: grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  padding-inline: 0.3rem;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-teal-500);
  color: #fff;
  font-size: 0.7rem;
  font-weight: var(--dt-fw-bold);
}

.bsp__items {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
  padding-block-end: var(--dt-space-4);
  border-block-end: 1px solid var(--dt-line);
}

.bsp__item {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: var(--dt-space-2);
}

.bsp__item-icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: var(--dt-radius-sm);
  background: var(--dt-teal-50);
  color: var(--dt-teal-600);
}

.bsp__item-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.bsp__item-text strong {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
}

.bsp__item-text small {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bsp__item-price {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-bold);
  color: var(--dt-teal-700);
  white-space: nowrap;
}

.bsp__remove {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: var(--dt-radius-pill);
  color: var(--dt-muted-soft);
}

.bsp__remove:hover {
  background: var(--dt-danger-soft);
  color: var(--dt-danger);
}

.bsp__empty {
  padding-block: var(--dt-space-3);
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted-soft);
}

.bsp__facts {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
}

.bsp__facts > div {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.bsp__facts dt {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.bsp__facts dt :deep(svg) {
  color: var(--dt-teal-500);
}

.bsp__facts dd {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-medium);
}

.bsp__totals {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding-block-start: var(--dt-space-4);
  border-block-start: 1px dashed var(--dt-line);
}

.bsp__totals > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--dt-space-3);
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
}

.bsp__discount {
  color: var(--dt-success) !important;
  font-weight: var(--dt-fw-semibold);
}

.bsp__total {
  padding-block-start: var(--dt-space-3);
  border-block-start: 1px solid var(--dt-line);
  font-weight: var(--dt-fw-bold);
  color: var(--dt-ink) !important;
  font-size: var(--dt-fs-body) !important;
}

.bsp__total span:last-child {
  color: var(--dt-teal-700);
  font-size: 1.25rem;
}

.bsp__assurances {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding-block-start: var(--dt-space-4);
  border-block-start: 1px solid var(--dt-line);
}

.bsp__assurances li {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.bsp__assurances :deep(svg) {
  color: var(--dt-teal-500);
  flex: none;
}
</style>
