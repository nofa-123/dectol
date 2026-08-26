<script setup>
/** Packages page — bundles plus a comparison table. */
import { computed, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import PackagesSection from '@/components/packages/PackagesSection.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import FaqSection from '@/components/faq/FaqSection.vue'
import FinalCta from '@/components/common/FinalCta.vue'
import { formatPrice } from '@/utils/format'
import { useServicesStore } from '@/stores/servicesStore'
import { vReveal } from '@/composables/useScrollAnimation'

const catalogue = useServicesStore()

onMounted(() => catalogue.ensureLoaded())

/** Rows = every service that appears in at least one package. */
const rows = computed(() => {
  const ids = new Set()
  catalogue.packages.forEach((pkg) => pkg.items.forEach((item) => ids.add(item.serviceId)))
  return [...ids].map((id) => catalogue.serviceById(id)).filter(Boolean)
})

const includes = (pkg, serviceId) => pkg.items.some((item) => item.serviceId === serviceId)
</script>

<template>
  <div>
    <PageHeader
      eyebrow="باقات دكتول"
      eyebrow-icon="gift"
      title="وفّر أكثر مع الباقات"
      subtitle="اجمع أكثر من خدمة في زيارة واحدة، وادفع أقل مما لو حجزتها منفصلة."
    />

    <PackagesSection :show-action="false" />

    <section v-if="rows.length" class="section section--sunken">
      <div class="container container--wide">
        <h2 class="pkv__title">مقارنة الباقات</h2>
        <div class="pkv__scroll">
          <table v-reveal class="pkv__table">
            <caption class="visually-hidden">
              مقارنة محتويات وأسعار باقات دكتول
            </caption>
            <thead>
              <tr>
                <th scope="col">الخدمة</th>
                <th v-for="pkg in catalogue.packages" :key="pkg.id" scope="col">
                  {{ pkg.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="service in rows" :key="service.id">
                <th scope="row">
                  <DoctolIcon :name="service.icon" :size="17" />
                  {{ service.name }}
                </th>
                <td v-for="pkg in catalogue.packages" :key="pkg.id">
                  <DoctolIcon
                    v-if="includes(pkg, service.id)"
                    name="check"
                    :size="17"
                    :stroke="2.6"
                    class="pkv__yes"
                    label="مشمول"
                  />
                  <span v-else class="pkv__no" aria-label="غير مشمول">—</span>
                </td>
              </tr>
              <tr class="pkv__price-row">
                <th scope="row">السعر</th>
                <td v-for="pkg in catalogue.packages" :key="pkg.id" class="money">
                  {{ formatPrice(pkg.price) }}
                </td>
              </tr>
              <tr class="pkv__save-row">
                <th scope="row">التوفير</th>
                <td v-for="pkg in catalogue.packages" :key="pkg.id" class="money">
                  {{ formatPrice(pkg.saving) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <FaqSection />
    <FinalCta />
  </div>
</template>

<style scoped>
.pkv__title {
  font-size: var(--dt-fs-h2);
  margin-block-end: var(--dt-space-6);
}

/* Wide tables scroll inside their own container, never the page. */
.pkv__scroll {
  overflow-x: auto;
  border-radius: var(--dt-radius-xl);
  border: 1px solid var(--dt-line);
  background: var(--dt-surface);
}

.pkv__table {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
}

.pkv__table th,
.pkv__table td {
  padding: var(--dt-space-4);
  text-align: start;
  border-block-end: 1px solid var(--dt-line);
  font-size: var(--dt-fs-sm);
}

.pkv__table thead th {
  background: var(--dt-teal-50);
  color: var(--dt-navy-700);
  font-weight: var(--dt-fw-bold);
  position: sticky;
  inset-block-start: 0;
}

.pkv__table tbody th {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: var(--dt-fw-medium);
  color: var(--dt-ink-soft);
}

.pkv__table tbody th :deep(svg) {
  color: var(--dt-teal-500);
}

.pkv__table td {
  text-align: center;
}

.pkv__yes {
  display: inline-block;
  color: var(--dt-success);
}

.pkv__no {
  color: var(--dt-line-strong);
}

.pkv__price-row td,
.pkv__save-row td {
  font-weight: var(--dt-fw-bold);
  color: var(--dt-teal-700);
}

.pkv__save-row td {
  color: var(--dt-success);
}

.pkv__save-row th,
.pkv__save-row td {
  border-block-end: 0;
}
</style>
