<script setup>
/** Order review: every configured service, the promo field and the totals. */
import { ref } from 'vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { formatDate, formatPrice, formatTimeLabel, relativeDayLabel } from '@/utils/format'
import { useBookingStore } from '@/stores/bookingStore'
import { useCartStore } from '@/stores/cartStore'
import { useServicesStore } from '@/stores/servicesStore'
import { useUiStore } from '@/stores/uiStore'

const booking = useBookingStore()
const cart = useCartStore()
const catalogue = useServicesStore()
const ui = useUiStore()

const promoInput = ref('')

async function applyPromo() {
  if (!promoInput.value.trim()) return
  const ok = await cart.applyPromo(promoInput.value)
  if (ok) {
    ui.toast.success('تم تطبيق كود الخصم', cart.promo.label)
    promoInput.value = ''
  }
}
</script>

<template>
  <div class="sum">
    <!-- services -->
    <section class="sum__block">
      <header class="sum__block-head">
        <h3><DoctolIcon name="grid" :size="17" /> الخدمات المختارة</h3>
        <button type="button" class="sum__edit" @click="booking.goToStep(0)">تعديل</button>
      </header>

      <ul class="sum__services">
        <li v-for="bundle in cart.bundleItems" :key="bundle.pkg.id" class="sum__service">
          <span class="sum__service-icon"><DoctolIcon name="gift" :size="19" /></span>
          <span class="sum__service-text">
            <strong>{{ bundle.pkg.name }}</strong>
            <small>{{ bundle.pkg.items.map((i) => i.label).join(' · ') }}</small>
          </span>
          <span class="sum__service-price money">{{ formatPrice(bundle.total) }}</span>
        </li>

        <li
          v-for="item in cart.items.filter((i) => i.valid)"
          :key="item.service.id"
          class="sum__service"
        >
          <span class="sum__service-icon"><DoctolIcon :name="item.service.icon" :size="19" /></span>
          <span class="sum__service-text">
            <strong>{{ item.service.shortName ?? item.service.name }}</strong>
            <small>{{ item.summary }}</small>
            <ul v-if="item.lines.length > 1" class="sum__breakdown">
              <li v-for="(line, index) in item.lines" :key="index">
                {{ line.label }}
                <span class="money">{{ formatPrice(line.amount) }}</span>
              </li>
            </ul>
          </span>
          <span class="sum__service-price money">{{ formatPrice(item.total) }}</span>
        </li>
      </ul>
    </section>

    <!-- where & when -->
    <section class="sum__block">
      <header class="sum__block-head">
        <h3><DoctolIcon name="pin" :size="17" /> الموقع والموعد</h3>
        <button type="button" class="sum__edit" @click="booking.goToStep(1)">تعديل</button>
      </header>
      <p class="sum__line">
        {{ catalogue.cityById(booking.location.cityId)?.name }} — {{ booking.location.district }}
      </p>
      <p class="sum__line sum__line--muted">{{ booking.location.address }}</p>
      <p v-if="booking.location.notes" class="sum__line sum__line--muted">
        ملاحظات: {{ booking.location.notes }}
      </p>
      <p v-if="booking.schedule.date" class="sum__line sum__line--strong">
        {{ relativeDayLabel(booking.schedule.date) }} — {{ formatDate(booking.schedule.date) }}
        <template v-if="booking.schedule.time">
          · {{ formatTimeLabel(booking.schedule.time) }}
        </template>
      </p>
    </section>

    <!-- promo -->
    <section class="sum__block sum__promo">
      <h3 class="sum__promo-title"><DoctolIcon name="tag" :size="17" /> كود الخصم</h3>

      <div v-if="cart.promo" class="sum__promo-applied">
        <span>
          <DoctolIcon name="check-circle" :size="17" />
          <strong>{{ cart.promo.code }}</strong> — {{ cart.promo.label }}
        </span>
        <button type="button" class="sum__edit" @click="cart.clearPromo()">إزالة</button>
      </div>

      <form v-else class="sum__promo-form" @submit.prevent="applyPromo">
        <input
          v-model="promoInput"
          type="text"
          class="sum__promo-input"
          placeholder="أدخل كود الخصم"
          aria-label="كود الخصم"
          :aria-invalid="Boolean(cart.promoError)"
        />
        <BaseButton
          type="submit"
          variant="outline"
          :loading="cart.promoLoading"
          loading-text="جاري التحقق…"
        >
          تطبيق
        </BaseButton>
      </form>

      <p v-if="cart.promoError" class="sum__promo-error" role="alert">
        <DoctolIcon name="alert" :size="14" />
        {{ cart.promoError }}
      </p>
      <p v-else-if="!cart.promo" class="sum__promo-hint">
        جرّب <code>DOCTOL10</code> أو <code>WELCOME</code>
      </p>
    </section>

    <!-- totals -->
    <section class="sum__totals">
      <dl class="sum__math">
        <div>
          <dt>المجموع الفرعي</dt>
          <dd class="money">{{ formatPrice(cart.subtotal) }}</dd>
        </div>
        <div v-if="cart.discount" class="sum__math-discount">
          <dt>الخصم</dt>
          <dd class="money">− {{ formatPrice(cart.discount) }}</dd>
        </div>
        <div>
          <dt>ضريبة القيمة المضافة (15٪)</dt>
          <dd class="money">{{ formatPrice(cart.vat) }}</dd>
        </div>
        <div class="sum__math-total">
          <dt>الإجمالي</dt>
          <dd class="money">{{ formatPrice(cart.total) }}</dd>
        </div>
      </dl>

      <p v-if="cart.savings" class="sum__savings">
        <DoctolIcon name="sparkle" :size="16" />
        وفّرت <strong class="money">{{ formatPrice(cart.savings) }}</strong> على هذا الحجز
      </p>
    </section>
  </div>
</template>

<style scoped>
.sum {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
}

.sum__block {
  padding: var(--dt-space-4) var(--dt-space-5);
  border: 1px solid var(--dt-line);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface);
}

.sum__block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-3);
  margin-block-end: var(--dt-space-3);
}

.sum__block-head h3,
.sum__promo-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-ink-soft);
}

.sum__block-head :deep(svg),
.sum__promo-title :deep(svg) {
  color: var(--dt-teal-500);
}

.sum__edit {
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-teal-600);
  padding: 0.35rem 0.6rem;
  border-radius: var(--dt-radius-xs);
  min-height: 32px;
}

.sum__edit:hover {
  background: var(--dt-teal-50);
  text-decoration: underline;
}

/* ---------- services ---------- */
.sum__services {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
}

.sum__service {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: start;
  gap: var(--dt-space-3);
}

.sum__service + .sum__service {
  padding-block-start: var(--dt-space-3);
  border-block-start: 1px dashed var(--dt-line);
}

.sum__service-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex: none;
  border-radius: var(--dt-radius-sm);
  background: var(--dt-teal-50);
  color: var(--dt-teal-600);
}

.sum__service-text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.sum__service-text strong {
  font-size: var(--dt-fs-sm);
}

.sum__service-text small {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.sum__breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  margin-block-start: 0.35rem;
}

.sum__breakdown li {
  display: flex;
  justify-content: space-between;
  gap: var(--dt-space-3);
  font-size: 0.72rem;
  color: var(--dt-muted-soft);
}

.sum__service-price {
  font-weight: var(--dt-fw-bold);
  color: var(--dt-teal-700);
  white-space: nowrap;
}

.sum__line {
  font-size: var(--dt-fs-sm);
  line-height: var(--dt-lh-snug);
}

.sum__line--muted {
  color: var(--dt-muted);
}

.sum__line--strong {
  margin-block-start: var(--dt-space-2);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-teal-700);
}

/* ---------- promo ---------- */
.sum__promo {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
}

.sum__promo-form {
  display: flex;
  gap: var(--dt-space-2);
}

.sum__promo-input {
  flex: 1;
  min-width: 0;
  min-height: 48px;
  padding-inline: var(--dt-space-4);
  border: 1.5px solid var(--dt-line);
  border-radius: var(--dt-radius-md);
  background: var(--dt-surface);
  text-transform: uppercase;
}

.sum__promo-input:focus {
  outline: none;
  border-color: var(--dt-teal-400);
  box-shadow: 0 0 0 4px var(--dt-focus-ring);
}

.sum__promo-applied {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-3);
  padding: 0.7rem 1rem;
  border-radius: var(--dt-radius-md);
  background: var(--dt-success-soft);
  color: var(--dt-success);
  font-size: var(--dt-fs-sm);
}

.sum__promo-applied span {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.sum__promo-error {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-danger);
}

.sum__promo-hint {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.sum__promo-hint code {
  padding: 0.1rem 0.35rem;
  border-radius: var(--dt-radius-xs);
  background: var(--dt-surface-sunken);
  font-family: inherit;
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-teal-700);
}

/* ---------- totals ---------- */
.sum__totals {
  padding: var(--dt-space-5);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-grad-mint);
  border: 1px solid var(--dt-teal-100);
}

.sum__math {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sum__math > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--dt-space-3);
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
}

.sum__math-discount {
  color: var(--dt-success) !important;
  font-weight: var(--dt-fw-semibold);
}

.sum__math-total {
  padding-block-start: var(--dt-space-3);
  border-block-start: 1px solid var(--dt-teal-200);
  font-size: var(--dt-fs-body-lg) !important;
  font-weight: var(--dt-fw-bold);
  color: var(--dt-ink) !important;
}

.sum__math-total dd {
  color: var(--dt-teal-700);
  font-size: 1.35rem;
}

.sum__savings {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-block-start: var(--dt-space-4);
  padding: 0.6rem 0.9rem;
  border-radius: var(--dt-radius-md);
  background: var(--dt-surface);
  font-size: var(--dt-fs-sm);
  color: var(--dt-ink-soft);
}

.sum__savings :deep(svg) {
  color: var(--dt-gold-600);
}

.sum__savings strong {
  color: var(--dt-success);
}
</style>
