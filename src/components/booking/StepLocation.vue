<script setup>
/** Step 2 — city, district, address details and access notes. */
import { computed, onMounted, ref } from 'vue'
import BaseField from '@/components/common/BaseField.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { useBookingStore } from '@/stores/bookingStore'
import { useServicesStore } from '@/stores/servicesStore'
import { useUserStore } from '@/stores/userStore'

const booking = useBookingStore()
const catalogue = useServicesStore()
const user = useUserStore()
const neighborhoodsLoading = ref(false)

const cityOptions = computed(() =>
  catalogue.cities.map((city) => ({ value: city.id, label: city.name })),
)

const districts = computed(() => catalogue.neighborhoodsForCity(booking.location.cityId))

async function loadCityNeighborhoods(cityId, { autoSelectSingle = true } = {}) {
  if (!cityId) return []
  neighborhoodsLoading.value = true
  try {
    const items = await catalogue.loadNeighborhoods(cityId)
    if (
      autoSelectSingle &&
      items.length === 1 &&
      !booking.location.neighborhoodId
    ) {
      booking.setLocation({
        neighborhoodId: items[0].id,
        district: items[0].name,
      })
    }
    return items
  } finally {
    neighborhoodsLoading.value = false
  }
}

async function onCity(cityId) {
  booking.setLocation({ cityId, neighborhoodId: '', district: '' })
  await loadCityNeighborhoods(cityId)
}

function onDistrict(neighborhoodId) {
  const selected = districts.value.find((item) => String(item.id) === String(neighborhoodId))
  booking.setLocation({ neighborhoodId, district: selected?.name ?? '' })
}

async function useSavedAddress(address) {
  booking.setLocation({
    cityId: address.cityId,
    neighborhoodId: address.neighborhoodId ?? '',
    district: address.district,
    address: address.address,
    notes: address.notes ?? '',
  })
  await loadCityNeighborhoods(address.cityId, { autoSelectSingle: false })
}

onMounted(async () => {
  // The location step normally mounts after the catalogue is ready, but a
  // direct/deep link can arrive earlier.
  await catalogue.ensureLoaded()

  let cityId = booking.location.cityId
  if (!cityId && catalogue.cities.length === 1) {
    cityId = catalogue.cities[0].id
    booking.setLocation({ cityId })
  }

  // Selecting the only city programmatically does not fire the native select
  // change event, so explicitly fetch its Laravel neighborhoods here.
  if (cityId) await loadCityNeighborhoods(cityId)
})
</script>

<template>
  <div class="sl">
    <div v-if="user.addresses.length" class="sl__saved">
      <p class="sl__saved-title">
        <DoctolIcon name="pin" :size="16" />
        عناوين محفوظة
      </p>
      <div class="sl__saved-list">
        <button
          v-for="address in user.addresses.slice(0, 3)"
          :key="address.id"
          type="button"
          class="sl__saved-chip"
          :class="{
            'sl__saved-chip--on':
              booking.location.district === address.district &&
              booking.location.address === address.address,
          }"
          @click="useSavedAddress(address)"
        >
          <strong>{{ catalogue.cityById(address.cityId)?.name }} — {{ address.district }}</strong>
          <small>{{ address.address }}</small>
        </button>
      </div>
    </div>

    <div class="sl__grid">
      <BaseField
        label="المدينة"
        as="select"
        icon="pin"
        required
        placeholder="اختر المدينة"
        :options="cityOptions"
        :model-value="booking.location.cityId"
        :error="booking.errors.cityId"
        @update:model-value="onCity"
      />

      <BaseField
        label="الحي"
        as="select"
        icon="home"
        required
        :placeholder="neighborhoodsLoading ? 'جاري تحميل الأحياء…' : booking.location.cityId ? 'اختر الحي' : 'اختر المدينة أولاً'"
        :disabled="!booking.location.cityId || neighborhoodsLoading"
        :options="districts.map((d) => ({ value: d.id, label: d.name }))"
        :model-value="booking.location.neighborhoodId"
        :error="booking.errors.district"
        @update:model-value="onDistrict"
      />
    </div>

    <BaseField
      label="تفاصيل العنوان"
      placeholder="اسم الشارع، رقم المبنى، الدور، رقم الشقة"
      icon="list"
      required
      autocomplete="street-address"
      :model-value="booking.location.address"
      :error="booking.errors.address"
      @update:model-value="(value) => booking.setLocation({ address: value })"
    />

    <BaseField
      label="ملاحظات للفريق"
      as="textarea"
      :rows="3"
      placeholder="مثال: البوابة الجانبية، يوجد كلب أليف، الرجاء الاتصال قبل الوصول بـ 15 دقيقة"
      hint="اختياري — يساعد الفريق يوصل لك بسرعة"
      :model-value="booking.location.notes"
      @update:model-value="(value) => booking.setLocation({ notes: value })"
    />

    <p class="sl__coverage">
      <DoctolIcon name="info" :size="16" />
      نغطي حالياً {{ catalogue.cities.length }} مدن. ما لقيت مدينتك؟ تواصل معنا وبنخبرك أول ما نوصلها.
    </p>
  </div>
</template>

<style scoped>
.sl {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-5);
}

.sl__saved {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
  padding: var(--dt-space-4);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface-sunken);
}

.sl__saved-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-ink-soft);
}

.sl__saved-list {
  display: flex;
  gap: var(--dt-space-2);
  flex-wrap: wrap;
}

.sl__saved-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  padding: 0.6rem 0.9rem;
  border-radius: var(--dt-radius-md);
  border: 1.5px solid var(--dt-line);
  background: var(--dt-surface);
  text-align: start;
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    background-color var(--dt-dur-2) var(--dt-ease-out);
}

.sl__saved-chip:hover {
  border-color: var(--dt-teal-300);
}

.sl__saved-chip--on {
  border-color: var(--dt-teal-500);
  background: var(--dt-teal-50);
}

.sl__saved-chip strong {
  font-size: var(--dt-fs-sm);
}

.sl__saved-chip small {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  max-width: 26ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sl__grid {
  display: grid;
  gap: var(--dt-space-4);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
}

.sl__coverage {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
}

.sl__coverage :deep(svg) {
  flex: none;
  margin-block-start: 0.15rem;
  color: var(--dt-teal-500);
}
</style>
