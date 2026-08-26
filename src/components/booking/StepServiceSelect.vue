<script setup>
/**
 * Step 1 — "وش الخدمة اللي تحتاجها؟"
 *
 * Category rail → bundles → the category's services as configurable
 * accordions. Only one accordion is open at a time so the page never becomes
 * a wall of controls, but any number of services can stay selected.
 *
 * Rehabilitation is single-pick: you clean one property per visit, so
 * selecting a property type replaces the previous one.
 */
import { computed, ref, watch } from 'vue'
import CategoryCarousel from '@/components/booking/CategoryCarousel.vue'
import PackageStrip from '@/components/booking/PackageStrip.vue'
import ServiceAccordion from '@/components/booking/ServiceAccordion.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import SkeletonBlock from '@/components/common/SkeletonBlock.vue'
import { formatPrice } from '@/utils/format'
import { useCartStore } from '@/stores/cartStore'
import { useServicesStore } from '@/stores/servicesStore'
import { useBookingStore } from '@/stores/bookingStore'

const catalogue = useServicesStore()
const cart = useCartStore()
const booking = useBookingStore()

const openId = ref('')
const detailsPackage = ref(null)

const category = computed(
  () => catalogue.categories.find((c) => String(c.id) === String(booking.categoryId)) ?? catalogue.categories[0],
)

const servicesInCategory = computed(() =>
  catalogue.services.filter((s) => String(s.categoryId) === String(booking.categoryId)),
)

/** One property per visit — the rehab list behaves like a radio group. */
const isSinglePick = computed(() => booking.categoryId === 'rehab')

/**
 * Packages are their own backend catalogue and are not tied to a hard-coded
 * local category id. Laravel category ids can be numeric (and packages can
 * combine several categories), so keep the package rail available throughout
 * the service-selection step whenever the API returned bookable packages.
 */
const showPackages = computed(() => catalogue.packages.length > 0)

// Opening a different category collapses whatever was expanded before.
watch(
  () => booking.categoryId,
  () => {
    openId.value = ''
  },
)

watch(
  () => catalogue.isReady,
  (ready) => {
    if (ready && !catalogue.categories.some((item) => String(item.id) === String(booking.categoryId))) {
      booking.categoryId = catalogue.categories[0]?.id ?? ''
    }
  },
  { immediate: true },
)

/**
 * Deep links (home cards, landing-page CTAs) pre-open the requested service.
 *
 * Watches catalogue readiness as well as the id: arriving from a landing page
 * can beat the catalogue fetch, and looking the service up too early would
 * silently drop the selection with no second attempt.
 */
watch(
  [() => booking.focusServiceId, () => catalogue.isReady],
  ([id, ready]) => {
    if (!id || !ready) return
    const service = catalogue.serviceById(id)
    if (!service) {
      booking.focusServiceId = ''
      return
    }
    booking.categoryId = service.categoryId
    openId.value = id
    if (!cart.isSelected(id)) cart.select(service)
    booking.focusServiceId = ''
  },
  { immediate: true },
)

function onToggleOpen(service) {
  if (openId.value === service.id) {
    openId.value = ''
    return
  }
  openId.value = service.id
  // Expanding commits the default configuration so the price is real at once.
  if (!cart.isSelected(service.id)) onSelect(service, { keepOpen: true })
}

function onSelect(service, { keepOpen = false } = {}) {
  if (cart.isSelected(service.id) && !keepOpen) {
    cart.remove(service.id)
    if (openId.value === service.id) openId.value = ''
    return
  }
  if (isSinglePick.value) {
    servicesInCategory.value
      .filter((s) => s.id !== service.id && cart.isSelected(s.id))
      .forEach((s) => cart.remove(s.id))
  }
  cart.select(service)
}
</script>

<template>
  <div class="sss">
    <header class="sss__head">
      <h1 class="sss__title">
        وش الخدمة اللي تحتاجها؟
        <DoctolIcon name="sparkle" :size="22" class="sss__spark" />
      </h1>
      <p class="sss__hint">اختر الخدمة الرئيسية للبدء</p>
    </header>

    <div v-if="!catalogue.isReady" class="sss__loading">
      <SkeletonBlock height="190px" radius="var(--dt-radius-lg)" />
      <SkeletonBlock height="64px" radius="var(--dt-radius-lg)" />
      <SkeletonBlock height="64px" radius="var(--dt-radius-lg)" />
      <SkeletonBlock height="64px" radius="var(--dt-radius-lg)" />
    </div>

    <template v-else>
      <CategoryCarousel
        v-model="booking.categoryId"
        :categories="catalogue.categories"
      />

      <PackageStrip
        v-if="showPackages"
        :packages="catalogue.packages"
        @details="detailsPackage = $event"
      />

      <section class="sss__list">
        <header class="sss__list-head">
          <h2 class="sss__list-title">
            <DoctolIcon :name="category.icon" :size="20" />
            {{ category.headline }}
          </h2>
          <p class="sss__list-hint">{{ category.hint }}</p>
        </header>

        <div
          class="sss__rows"
          :role="isSinglePick ? 'radiogroup' : 'group'"
          :aria-label="category.headline"
        >
          <ServiceAccordion
            v-for="service in servicesInCategory"
            :key="service.id"
            :service="service"
            :open="openId === service.id"
            :selected="cart.isSelected(service.id)"
            :config="cart.configFor(service.id)"
            :indicator="isSinglePick ? 'radio' : 'check'"
            @toggle-open="onToggleOpen(service)"
            @toggle-select="onSelect(service)"
            @update-config="(patch) => cart.setConfig(service.id, patch)"
          />
        </div>
      </section>
    </template>

    <!-- package details -->
    <BaseModal
      :open="Boolean(detailsPackage)"
      :title="detailsPackage?.name"
      :subtitle="detailsPackage?.tagline"
      size="sm"
      @close="detailsPackage = null"
    >
      <template v-if="detailsPackage">
        <ul class="pkd__items">
          <li v-for="item in detailsPackage.items" :key="item.serviceId">
            <DoctolIcon name="check-circle" :size="17" />
            {{ item.label }}
          </li>
        </ul>
        <ul class="pkd__perks">
          <li v-for="perk in detailsPackage.perks" :key="perk">
            <DoctolIcon name="sparkle" :size="15" />
            {{ perk }}
          </li>
        </ul>
        <p class="pkd__duration">
          <DoctolIcon name="clock" :size="16" />
          {{ detailsPackage.duration }}
        </p>
      </template>

      <template #footer>
        <div class="pkd__foot">
          <p class="pkd__price">
            <strong class="money">{{ formatPrice(detailsPackage?.price ?? 0) }}</strong>
            <s class="money">{{ formatPrice(detailsPackage?.oldPrice ?? 0) }}</s>
          </p>
          <BaseButton
            :icon="cart.hasBundle(detailsPackage?.id) ? 'check' : 'plus'"
            @click="
              () => {
                cart.toggleBundle(detailsPackage)
                detailsPackage = null
              }
            "
          >
            {{ cart.hasBundle(detailsPackage?.id) ? 'إزالة الباقة' : 'أضف الباقة' }}
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.sss {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-6);
}

.sss__head {
  text-align: center;
}

.sss__title {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: var(--dt-fs-h2);
}

.sss__spark {
  color: var(--dt-gold-500);
}

.sss__hint {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
  margin-block-start: 0.25rem;
}

.sss__loading {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
}

.sss__list-head {
  margin-block-end: var(--dt-space-3);
}

.sss__list-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: var(--dt-fs-h3);
}

.sss__list-title :deep(svg) {
  color: var(--dt-teal-500);
}

.sss__list-hint {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
  margin-block-start: 0.15rem;
}

.sss__rows {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
}

/* ---------- package details modal ---------- */
.pkd__items,
.pkd__perks {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
}

.pkd__items li,
.pkd__perks li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--dt-fs-sm);
}

.pkd__items :deep(svg) {
  color: var(--dt-success);
  flex: none;
}

.pkd__perks {
  margin-block-start: var(--dt-space-4);
  padding-block-start: var(--dt-space-4);
  border-block-start: 1px dashed var(--dt-line);
}

.pkd__perks li {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.pkd__perks :deep(svg) {
  color: var(--dt-gold-600);
  flex: none;
}

.pkd__duration {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-block-start: var(--dt-space-4);
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.pkd__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-4);
  flex-wrap: wrap;
}

.pkd__price {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.pkd__price strong {
  font-size: 1.4rem;
  color: var(--dt-teal-600);
  font-weight: var(--dt-fw-bold);
}

.pkd__price s {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted-soft);
}
</style>
