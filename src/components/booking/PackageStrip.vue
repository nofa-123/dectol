<script setup>
/**
 * Bundle offers inside the service step. Selecting one adds it to the cart
 * alongside any individually configured services.
 */
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { formatPrice } from '@/utils/format'
import { useCarousel } from '@/composables/useCarousel'
import { useCartStore } from '@/stores/cartStore'
import { useServicesStore } from '@/stores/servicesStore'

defineProps({
  packages: { type: Array, required: true },
})

const emit = defineEmits(['details'])

const cart = useCartStore()
const catalogue = useServicesStore()
const { track, trackHandlers } = useCarousel({ loop: false })
</script>

<template>
  <section class="pks">
    <header class="pks__head">
      <h2 class="pks__title">
        <DoctolIcon name="tag" :size="20" />
        الباقات
      </h2>
      <p class="pks__hint">عروض متكاملة توفر عليك وتمتعك بأفضل سعر</p>
    </header>

    <ul ref="track" class="rail pks__rail" v-bind="trackHandlers">
      <li v-for="pkg in packages" :key="pkg.id">
        <article class="pk" :class="{ 'pk--on': cart.hasBundle(pkg.id) }">
          <span class="pk__save">وفّر {{ formatPrice(pkg.saving) }}</span>

          <h3 class="pk__name">{{ pkg.name }}</h3>
          <p class="pk__contents">{{ pkg.tagline }}</p>

          <ul class="pk__icons" aria-hidden="true">
            <li v-for="(item, index) in pkg.items.slice(0, 3)" :key="item.serviceId">
              <span class="pk__icon">
                <DoctolIcon
                  :name="catalogue.serviceById(item.serviceId)?.icon ?? 'sparkle'"
                  :size="20"
                />
              </span>
              <span v-if="index < Math.min(pkg.items.length, 3) - 1" class="pk__plus">+</span>
            </li>
          </ul>

          <div class="pk__foot">
            <p class="pk__price">
              <strong class="money">{{ formatPrice(pkg.price) }}</strong>
              <s class="money">{{ formatPrice(pkg.oldPrice) }}</s>
            </p>
            <button type="button" class="pk__details" @click="emit('details', pkg)">
              عرض التفاصيل
              <DoctolIcon name="chevron-left" :size="15" />
            </button>
          </div>

          <button
            type="button"
            class="pk__cta"
            :class="{ 'pk__cta--on': cart.hasBundle(pkg.id) }"
            @click="cart.toggleBundle(pkg)"
          >
            <DoctolIcon :name="cart.hasBundle(pkg.id) ? 'check' : 'plus'" :size="16" :stroke="2.4" />
            {{ cart.hasBundle(pkg.id) ? 'مضافة للطلب' : 'أضف الباقة' }}
          </button>
        </article>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.pks__head {
  margin-block-end: var(--dt-space-3);
}

.pks__title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: var(--dt-fs-h3);
}

.pks__title :deep(svg) {
  color: var(--dt-teal-500);
}

.pks__hint {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
  margin-block-start: 0.15rem;
}

/**
 * `.rail` sets `overflow-x: auto`, which makes the *vertical* overflow compute
 * to `auto` too — so anything sticking out above a card gets clipped. The
 * "وفّر …" badge hangs 11px over the card's top edge, so reserve room for it.
 */
.pks__rail {
  gap: var(--dt-space-3);
  padding-block: 14px 0.5rem;
}

/**
 * There are only three bundles. On a narrow screen the scroll rail is right,
 * but from tablet up the column is wide enough to show them all — as a rail the
 * third card was permanently cut in half at the container edge. Swap to a grid
 * so every package is fully visible and nothing needs horizontal scrolling.
 */
@media (min-width: 768px) {
  .pks__rail {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
    overflow: visible;
    scroll-snap-type: none;
  }

  .pks__rail > * {
    scroll-snap-align: none;
    flex: initial;
  }

  .pks__rail .pk {
    width: 100%;
  }
}

.pk {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
  width: min(80vw, 330px);
  height: 100%;
  padding: var(--dt-space-5) var(--dt-space-4) var(--dt-space-4);
  border: 1.5px solid var(--dt-line);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface);
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    box-shadow var(--dt-dur-2) var(--dt-ease-out);
}

.pk--on {
  border-color: var(--dt-teal-500);
  box-shadow: var(--dt-shadow-md);
}

.pk__save {
  position: absolute;
  inset-block-start: -11px;
  inset-inline-start: var(--dt-space-4);
  padding: 0.2rem 0.7rem;
  border-radius: var(--dt-radius-pill);
  background: #f2542d;
  color: #fff;
  font-size: 0.68rem;
  font-weight: var(--dt-fw-bold);
  white-space: nowrap;
}

.pk__name {
  font-size: var(--dt-fs-h4);
  font-weight: var(--dt-fw-bold);
}

.pk__contents {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
}

.pk__icons {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.pk__icons li {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.pk__icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: var(--dt-radius-pill);
  border: 1.5px solid var(--dt-teal-100);
  background: var(--dt-teal-50);
  color: var(--dt-teal-600);
}

.pk__plus {
  color: var(--dt-muted-soft);
  font-weight: var(--dt-fw-bold);
}

.pk__foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--dt-space-3);
  margin-block-start: auto;
}

.pk__price {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.pk__price strong {
  font-size: 1.5rem;
  font-weight: var(--dt-fw-bold);
  color: var(--dt-teal-600);
}

.pk__price s {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted-soft);
}

.pk__details {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-teal-700);
  padding: 0.35rem 0;
}

.pk__details:hover {
  text-decoration: underline;
}

.pk__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 46px;
  border-radius: var(--dt-radius-md);
  border: 1.5px solid var(--dt-teal-300);
  color: var(--dt-teal-700);
  font-weight: var(--dt-fw-semibold);
  font-size: var(--dt-fs-sm);
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    border-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out);
}

.pk__cta:hover {
  background: var(--dt-teal-50);
}

.pk__cta--on {
  background: var(--dt-grad-primary);
  border-color: transparent;
  color: #fff;
}
</style>
