<script setup>
/** Account: profile, bookings, saved addresses, favourites, notifications. */
import { computed, onMounted, ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import BaseField from '@/components/common/BaseField.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import ServiceCard from '@/components/services/ServiceCard.vue'
import { formatDate, formatPrice, formatTimeLabel } from '@/utils/format'
import { validateAll } from '@/utils/validate'
import { useBooking } from '@/composables/useBooking'
import { useServicesStore } from '@/stores/servicesStore'
import { useUiStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore'

const TABS = [
  { id: 'bookings', label: 'حجوزاتي', icon: 'calendar' },
  { id: 'favourites', label: 'المفضلة', icon: 'heart' },
  { id: 'addresses', label: 'عناويني', icon: 'pin' },
  { id: 'profile', label: 'بياناتي', icon: 'user' },
]

const user = useUserStore()
const catalogue = useServicesStore()
const ui = useUiStore()
const { startBlank } = useBooking()

const tab = ref('bookings')
const form = ref({ ...user.profile })
const errors = ref({})
const saving = ref(false)
const saved = ref(false)

const favourites = computed(() =>
  user.favourites.map((id) => catalogue.serviceById(id)).filter(Boolean),
)

const bookings = computed(() => user.bookings.slice().reverse())

onMounted(() => {
  catalogue.ensureLoaded()
  user.ensureLoaded()
})

async function saveProfile() {
  errors.value = validateAll(form.value, { name: 'name', phone: 'phone', email: 'email' })
  if (Object.keys(errors.value).length) return

  saving.value = true
  await new Promise((resolve) => setTimeout(resolve, 700))
  user.saveProfile(form.value)
  saving.value = false
  saved.value = true
  ui.toast.success('تم حفظ بياناتك')
  setTimeout(() => (saved.value = false), 2200)
}
</script>

<template>
  <div>
    <PageHeader
      eyebrow="حسابي"
      eyebrow-icon="user"
      :title="user.isKnown ? `أهلاً ${user.profile.name}` : 'حسابك في دكتول'"
      :subtitle="
        user.isKnown
          ? 'تابع حجوزاتك، وعناوينك، وخدماتك المفضلة من مكان واحد.'
          : 'احجز خدمتك الأولى وسنحفظ لك بياناتك لتسهيل الحجوزات القادمة.'
      "
    />

    <section class="section section--tight">
      <div class="container container--wide acc">
        <nav class="acc__tabs" role="tablist" aria-label="أقسام الحساب">
          <button
            v-for="item in TABS"
            :key="item.id"
            type="button"
            role="tab"
            class="acc__tab"
            :class="{ 'acc__tab--on': tab === item.id }"
            :aria-selected="tab === item.id"
            @click="tab = item.id"
          >
            <DoctolIcon :name="item.icon" :size="18" />
            {{ item.label }}
            <span v-if="item.id === 'bookings' && bookings.length" class="acc__count num">
              {{ bookings.length }}
            </span>
            <span v-if="item.id === 'favourites' && favourites.length" class="acc__count num">
              {{ favourites.length }}
            </span>
          </button>
        </nav>

        <div class="acc__panel">
          <!-- bookings -->
          <template v-if="tab === 'bookings'">
            <div v-if="!bookings.length" class="acc__empty">
              <DoctolIcon name="calendar" :size="44" />
              <h2>ما عندك حجوزات بعد</h2>
              <p>ابدأ بحجز خدمتك الأولى وستظهر هنا مع كل تفاصيلها.</p>
              <BaseButton icon="calendar-check" @click="startBlank">احجز الآن</BaseButton>
            </div>

            <ul v-else class="acc__bookings">
              <li v-for="item in bookings" :key="item.reference" class="acc__booking">
                <div class="acc__booking-head">
                  <span class="acc__ref num">{{ item.reference }}</span>
                  <span class="acc__status">
                    <DoctolIcon name="check-circle" :size="14" />
                    مؤكد
                  </span>
                </div>
                <dl class="acc__booking-body">
                  <div>
                    <dt>الموعد</dt>
                    <dd>
                      {{ formatDate(item.schedule.date) }} — {{ formatTimeLabel(item.schedule.time) }}
                    </dd>
                  </div>
                  <div>
                    <dt>الموقع</dt>
                    <dd>
                      {{ catalogue.cityById(item.location.cityId)?.name }} — {{ item.location.district }}
                    </dd>
                  </div>
                  <div>
                    <dt>الإجمالي</dt>
                    <dd class="money">{{ formatPrice(item.pricing.total) }}</dd>
                  </div>
                </dl>
              </li>
            </ul>
          </template>

          <!-- favourites -->
          <template v-else-if="tab === 'favourites'">
            <div v-if="!favourites.length" class="acc__empty">
              <DoctolIcon name="heart" :size="44" />
              <h2>قائمة المفضلة فاضية</h2>
              <p>اضغط على القلب في أي خدمة لحفظها هنا.</p>
              <BaseButton variant="outline" :to="{ name: 'services' }">تصفح الخدمات</BaseButton>
            </div>

            <ul v-else class="acc__favs">
              <li v-for="service in favourites" :key="service.id">
                <ServiceCard :service="service" />
              </li>
            </ul>
          </template>

          <!-- addresses -->
          <template v-else-if="tab === 'addresses'">
            <div v-if="!user.addresses.length" class="acc__empty">
              <DoctolIcon name="pin" :size="44" />
              <h2>ما فيه عناوين محفوظة</h2>
              <p>عناوينك تُحفظ تلقائياً بعد أول حجز.</p>
            </div>

            <ul v-else class="acc__addresses">
              <li v-for="address in user.addresses" :key="address.id">
                <span class="acc__addr-icon"><DoctolIcon name="pin" :size="18" /></span>
                <div>
                  <strong>
                    {{ catalogue.cityById(address.cityId)?.name }} — {{ address.district }}
                  </strong>
                  <p>{{ address.address }}</p>
                  <p v-if="address.notes" class="acc__addr-note">{{ address.notes }}</p>
                </div>
              </li>
            </ul>
          </template>

          <!-- profile -->
          <template v-else>
            <form class="acc__form" @submit.prevent="saveProfile">
              <BaseField
                v-model="form.name"
                label="الاسم الكامل"
                icon="user"
                autocomplete="name"
                :error="errors.name"
              />
              <BaseField
                v-model="form.phone"
                label="رقم الجوال"
                type="tel"
                icon="phone"
                inputmode="numeric"
                autocomplete="tel"
                :error="errors.phone"
              />
              <BaseField
                v-model="form.email"
                label="البريد الإلكتروني"
                type="email"
                icon="mail"
                autocomplete="email"
                :error="errors.email"
              />
              <BaseButton
                type="submit"
                :loading="saving"
                :success="saved"
                loading-text="جاري الحفظ…"
              >
                {{ saved ? 'تم الحفظ' : 'حفظ البيانات' }}
              </BaseButton>
            </form>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.acc {
  display: grid;
  gap: var(--dt-space-6);
  align-items: start;
}

.acc__tabs {
  display: flex;
  gap: var(--dt-space-2);
  overflow-x: auto;
  scrollbar-width: none;
}

.acc__tabs::-webkit-scrollbar {
  display: none;
}

.acc__tab {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 48px;
  padding: 0.6rem 1.1rem;
  white-space: nowrap;
  border-radius: var(--dt-radius-md);
  border: 1.5px solid var(--dt-line);
  background: var(--dt-surface);
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-medium);
  color: var(--dt-ink-soft);
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    background-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out);
}

.acc__tab:hover {
  border-color: var(--dt-teal-300);
}

.acc__tab--on {
  background: var(--dt-teal-50);
  border-color: var(--dt-teal-500);
  color: var(--dt-teal-700);
  font-weight: var(--dt-fw-semibold);
}

.acc__count {
  padding: 0.05rem 0.4rem;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-teal-500);
  color: #fff;
  font-size: 0.66rem;
  font-weight: var(--dt-fw-bold);
}

.acc__panel {
  min-width: 0;
}

/* ---------- empty ---------- */
.acc__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dt-space-3);
  padding: var(--dt-space-16) var(--dt-space-4);
  text-align: center;
  border-radius: var(--dt-radius-xl);
  border: 1px dashed var(--dt-line-strong);
  background: var(--dt-surface);
  color: var(--dt-muted);
}

.acc__empty :deep(svg) {
  color: var(--dt-line-strong);
}

.acc__empty h2 {
  font-size: var(--dt-fs-h3);
  color: var(--dt-ink);
}

/* ---------- bookings ---------- */
.acc__bookings {
  display: grid;
  gap: var(--dt-space-4);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
}

.acc__booking {
  padding: var(--dt-space-5);
  border-radius: var(--dt-radius-lg);
  border: 1px solid var(--dt-line);
  background: var(--dt-surface);
  box-shadow: var(--dt-shadow-sm);
}

.acc__booking-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-3);
  padding-block-end: var(--dt-space-3);
  border-block-end: 1px dashed var(--dt-line);
}

.acc__ref {
  font-weight: var(--dt-fw-bold);
  color: var(--dt-navy-700);
}

.acc__status {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.6rem;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-success-soft);
  color: var(--dt-success);
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-semibold);
}

.acc__booking-body {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
  padding-block-start: var(--dt-space-3);
}

.acc__booking-body > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--dt-space-3);
  font-size: var(--dt-fs-sm);
}

.acc__booking-body dt {
  color: var(--dt-muted);
}

.acc__booking-body dd {
  font-weight: var(--dt-fw-medium);
  text-align: end;
}

/* ---------- favourites / addresses ---------- */
.acc__favs {
  display: grid;
  gap: var(--dt-space-5);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr));
}

.acc__favs > li {
  min-width: 0;
}

.acc__addresses {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
}

.acc__addresses li {
  display: flex;
  align-items: flex-start;
  gap: var(--dt-space-3);
  padding: var(--dt-space-4);
  border-radius: var(--dt-radius-lg);
  border: 1px solid var(--dt-line);
  background: var(--dt-surface);
}

.acc__addr-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex: none;
  border-radius: var(--dt-radius-sm);
  background: var(--dt-teal-50);
  color: var(--dt-teal-600);
}

.acc__addresses strong {
  font-size: var(--dt-fs-sm);
}

.acc__addresses p {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
}

.acc__addr-note {
  font-size: var(--dt-fs-xs) !important;
  color: var(--dt-muted-soft) !important;
}

/* ---------- profile ---------- */
.acc__form {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
  max-width: 30rem;
  padding: var(--dt-space-6);
  border-radius: var(--dt-radius-xl);
  border: 1px solid var(--dt-line);
  background: var(--dt-surface);
  box-shadow: var(--dt-shadow-sm);
}

@media (min-width: 900px) {
  .acc {
    grid-template-columns: 220px minmax(0, 1fr);
  }
  .acc__tabs {
    flex-direction: column;
    overflow: visible;
  }
}

/**
 * Phone layout. The tabs were a horizontal scroller, so two of the four
 * sections sat off-screen with nothing to suggest they were there — a 2×2 grid
 * shows all four at once. The empty state also carried 4rem of vertical
 * padding, which filled the whole viewport with an empty dashed box.
 */
@media (max-width: 899px) {
  .acc__tabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--dt-space-2);
    overflow: visible;
  }

  .acc__tab {
    justify-content: center;
    min-height: 44px;
    padding-inline: 0.6rem;
  }

  .acc__empty {
    padding-block: var(--dt-space-8);
  }

  .acc__empty h2 {
    font-size: var(--dt-fs-h4);
  }
}
</style>
