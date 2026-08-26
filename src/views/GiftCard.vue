<script setup>
/**
 * بطاقات الهدايا.
 *
 * The live page asks for everything up front and only shows one fixed card.
 * The rework puts a **live preview** beside the form — you see exactly what the
 * recipient will get as you type — adds four card designs, and splits payment
 * into its own step so the details step stays short.
 */
import { computed, onMounted, ref, watch } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import PaymentBrandMark from '@/components/common/PaymentBrandMark.vue'
import BaseField from '@/components/common/BaseField.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import OptionChip from '@/components/common/OptionChip.vue'
import SuccessCheck from '@/components/common/SuccessCheck.vue'
import LogoMark from '@/components/header/LogoMark.vue'
import {
  PHONE_MAX_DIGITS,
  bookingReference,
  formatPhone,
  formatPrice,
  sanitizePhoneInput,
} from '@/utils/format'
import { validators } from '@/utils/validate'
import { scrollBehavior } from '@/utils/motion'
import { contactInfo, paymentMethods } from '@/data/content'
import { useUiStore } from '@/stores/uiStore'
import { useServicesStore } from '@/stores/servicesStore'
import { vReveal } from '@/composables/useScrollAnimation'
import { doctolApi } from '@/services/doctolApi'
import { apiData } from '@/services/apiMappers'

const THEMES = [
  { id: 'classic', label: 'إلى الغالي', emoji: '🎁', greeting: 'إلى الغالي', class: 'gc--classic' },
  { id: 'celebrate', label: 'مبروك', emoji: '🎉', greeting: 'مبروك!', class: 'gc--celebrate' },
  { id: 'thanks', label: 'شكراً لك', emoji: '💙', greeting: 'شكراً لك', class: 'gc--thanks' },
  { id: 'love', label: 'من القلب', emoji: '💝', greeting: 'من القلب', class: 'gc--love' },
]

const AMOUNTS = [200, 400, 500, 600, 800, 1000]
const MIN = 100
const MAX = 5000

const ui = useUiStore()
const catalogue = useServicesStore()

const step = ref('details')
const themeId = ref('classic')
const amount = ref(400)
const customAmount = ref('')
const sender = ref({ name: '', phone: '' })
const recipient = ref({ name: '', phone: '', cityId: '' })
const message = ref('')
const messageTouched = ref(false)
const paymentMethod = ref('mada')
const submitting = ref(false)
const cardCode = ref('')
const errors = ref({})
const backendDesigns = ref([])

const theme = computed(() => THEMES.find((t) => t.id === themeId.value) ?? THEMES[0])
// Laravel validates city_id as an integer. Always build this selector from the
// live /api/v1/cities response instead of the old local slugs (e.g. "jeddah").
const cityOptions = computed(() =>
  catalogue.cities
    .map((city) => ({ value: Number(city.id), label: city.name }))
    .filter((city) => Number.isInteger(city.value) && city.value > 0),
)

const selectedCityId = computed(() => {
  const value = Number(recipient.value.cityId)
  return Number.isInteger(value) && value > 0 ? value : null
})

const selectedBackendDesign = computed(() => {
  if (backendDesigns.value.includes(themeId.value)) return themeId.value
  return backendDesigns.value[0] ?? 'gift'
})

function extractGiftCardDesigns(response) {
  const data = apiData.unwrap(response, {})
  const settings = data.settings ?? data.config ?? data.gift_card_settings ?? data
  const source =
    settings.designs ??
    settings.card_designs ??
    settings.available_designs ??
    settings.themes ??
    []
  const items = Array.isArray(source) ? source : (source?.data ?? source?.items ?? [])
  return items
    .map((item) =>
      String(
        typeof item === 'string'
          ? item
          : item?.slug ?? item?.code ?? item?.value ?? item?.key ?? item?.id ?? '',
      ).trim(),
    )
    .filter(Boolean)
}

onMounted(async () => {
  try {
    const [catalogueResult, giftCardsResult] = await Promise.allSettled([
      catalogue.ensureLoaded(),
      doctolApi.giftCards(),
    ])
    if (catalogueResult.status === 'rejected') throw catalogueResult.reason
    backendDesigns.value = giftCardsResult.status === 'fulfilled'
      ? extractGiftCardDesigns(giftCardsResult.value)
      : []
    // The API contract supplied in Postman uses "gift". Keep it as the safe
    // contract fallback when an older serializer omits the designs array.
    if (!backendDesigns.value.length) backendDesigns.value = ['gift']
    // The supplied backend currently exposes one city. Select it automatically
    // while still supporting multiple cities when the API adds them later.
    if (!selectedCityId.value && cityOptions.value.length === 1) {
      recipient.value.cityId = cityOptions.value[0].value
    }
  } catch (error) {
    ui.toast.error('تعذّر تحميل المدن', error.message)
  }
})

const suggestedMessage = computed(
  () =>
    `لأنك شخص عزيز، حبيت أقدّم لك بطاقة هدية بقيمة ${amount.value} ريال، تعبيراً عن اهتمامي واهتمام دكتول براحتك. بهذه البطاقة تقدر تستمتع بخدمة تنظيف مريحة تجعل يومك أخف وأنظف.`,
)

// Keep the suggested wording in sync with the amount until the sender edits it.
watch(
  suggestedMessage,
  (next) => {
    if (!messageTouched.value) message.value = next
  },
  { immediate: true },
)

function pickAmount(value) {
  amount.value = value
  customAmount.value = ''
  delete errors.value.amount
}

function onCustomAmount(value) {
  customAmount.value = value
  const parsed = Number(value)
  if (Number.isFinite(parsed) && parsed > 0) amount.value = Math.min(MAX, Math.max(0, parsed))
}

function validate(field) {
  const rules = {
    amount: () =>
      amount.value < MIN ? `الحد الأدنى ${formatPrice(MIN)}` : amount.value > MAX ? `الحد الأعلى ${formatPrice(MAX)}` : '',
    senderName: () => validators.name(sender.value.name),
    senderPhone: () => validators.phone(sender.value.phone),
    recipientName: () => validators.name(recipient.value.name),
    recipientPhone: () => validators.phone(recipient.value.phone),
    cityId: () => (selectedCityId.value ? '' : 'اختر مدينة متاحة'),
    message: () => (message.value.trim() ? '' : 'اكتب رسالتك'),
  }
  const msg = rules[field]?.() ?? ''
  errors.value = msg
    ? { ...errors.value, [field]: msg }
    : Object.fromEntries(Object.entries(errors.value).filter(([k]) => k !== field))
  return !msg
}

const FIELDS = ['amount', 'senderName', 'senderPhone', 'recipientName', 'recipientPhone', 'cityId', 'message']

const detailsValid = computed(
  () =>
    amount.value >= MIN &&
    amount.value <= MAX &&
    !validators.name(sender.value.name) &&
    !validators.phone(sender.value.phone) &&
    !validators.name(recipient.value.name) &&
    !validators.phone(recipient.value.phone) &&
    Boolean(selectedCityId.value) &&
    Boolean(message.value.trim()),
)

const vat = computed(() => Math.round(amount.value * 0.15))
const total = computed(() => amount.value + vat.value)

function goToPayment() {
  if (!FIELDS.map(validate).every(Boolean)) return
  step.value = 'payment'
  window.scrollTo({ top: 0, behavior: scrollBehavior() })
}

async function pay() {
  submitting.value = true
  try {
    const quoteResponse = await doctolApi.quoteGiftCard({
      amount: amount.value,
      sender_name: sender.value.name,
      sender_phone: sender.value.phone.replace(/\D/g, '').replace(/^0/, ''),
      receiver_name: recipient.value.name,
      receiver_phone: recipient.value.phone.replace(/\D/g, '').replace(/^0/, ''),
      city_id: selectedCityId.value,
      message: message.value,
      // The visual theme is a frontend concern. Laravel must receive one of
      // the design codes advertised by GET /api/v1/gift-cards.
      design: selectedBackendDesign.value,
    })
    const quote = apiData.unwrap(quoteResponse, {})
    const quoteToken = quote.quote_token ?? quote.token
    if (!quoteToken) throw new Error('لم يرجع السيرفر رمز تسعير البطاقة.')
    const response = await doctolApi.createGiftCard({ quote_token: quoteToken, payment_method: paymentMethod.value })
    const data = apiData.unwrap(response, {})
    cardCode.value = data.gift_card_reference ?? data.reference ?? data.code ?? ''
    step.value = 'done'
    ui.toast.success('تم إنشاء البطاقة', `رقم البطاقة ${cardCode.value}`)
    window.scrollTo({ top: 0, behavior: scrollBehavior() })
  } catch (error) {
    ui.toast.error('تعذّر إكمال الطلب', error.message)
  } finally {
    submitting.value = false
  }
}

const shareText = computed(
  () =>
    `${theme.value.greeting}%0A${encodeURIComponent(message.value)}%0A%0A${encodeURIComponent(
      `كود البطاقة: ${cardCode.value} — فعّلها عبر ${contactInfo.phone}`,
    )}`,
)

function reset() {
  step.value = 'details'
  cardCode.value = ''
  messageTouched.value = false
  sender.value = { name: '', phone: '' }
  recipient.value = { name: '', phone: '', cityId: '' }
  errors.value = {}
}

const onPhoneInput = (target, value) => {
  target.phone = sanitizePhoneInput(value)
}
</script>

<template>
  <div>
    <PageHeader
      eyebrow="بطاقات الهدايا"
      eyebrow-icon="gift"
      title="هدية بسيطة… أثرها كبير"
      subtitle="اختر بطاقة الهدية المناسبة وشارك من تحب تجربة تنظيف مريحة ترفع عنهم عناء التفاصيل اليومية."
    />

    <section class="section section--tight">
      <div class="container container--wide gcp">
        <!-- ------------------------------ preview ------------------------------ -->
        <aside class="gcp__preview" aria-label="معاينة البطاقة">
          <div class="gcp__preview-inner">
            <p class="gcp__preview-label">
              <DoctolIcon name="image" :size="15" />
              هكذا ستصل البطاقة
            </p>

            <article class="gc" :class="theme.class">
              <div class="gc__glow" aria-hidden="true" />
              <header class="gc__head">
                <LogoMark size="sm" light />
                <span class="gc__emoji" aria-hidden="true">{{ theme.emoji }}</span>
              </header>

              <p class="gc__greeting">{{ theme.greeting }}</p>
              <p class="gc__to">
                {{ recipient.name ? `عزيزي ${recipient.name}` : 'اسم المُهدى إليه' }}
              </p>

              <p class="gc__message">{{ message }}</p>

              <footer class="gc__foot">
                <span class="gc__amount">
                  <small>قيمة البطاقة</small>
                  <strong class="money">{{ formatPrice(amount) }}</strong>
                </span>
                <span class="gc__from">
                  <small>مهديكم</small>
                  <strong>{{ sender.name || '—' }}</strong>
                </span>
              </footer>

              <p v-if="cardCode" class="gc__code num">{{ cardCode }}</p>
            </article>

            <ul class="gcp__perks">
              <li><DoctolIcon name="clock" :size="15" /> صالحة 12 شهراً من تاريخ الشراء</li>
              <li><DoctolIcon name="whatsapp" :size="15" /> يصل الكود عبر الواتساب</li>
              <li><DoctolIcon name="grid" :size="15" /> تُستخدم على أي خدمة من دكتول</li>
            </ul>
          </div>
        </aside>

        <!-- ------------------------------ form ------------------------------ -->
        <div class="gcp__form">
          <!-- success -->
          <div v-if="step === 'done'" class="gcp__done">
            <SuccessCheck :size="110" />
            <h2 class="gcp__done-title">تم شراء البطاقة بنجاح</h2>
            <p class="gcp__done-text">
              أرسلنا كود البطاقة إلى
              <strong class="num">{{ formatPhone(recipient.phone) }}</strong>
              عبر الواتساب، ونسخة لك على رقمك.
            </p>
            <p class="gcp__code-box">
              <span>كود البطاقة</span>
              <strong class="num">{{ cardCode }}</strong>
            </p>
            <div class="gcp__done-actions">
              <BaseButton
                icon="whatsapp"
                :href="`https://wa.me/966${recipient.phone.replace(/^0/, '')}?text=${shareText}`"
              >
                أرسلها الآن
              </BaseButton>
              <BaseButton variant="outline" icon="gift" @click="reset">بطاقة أخرى</BaseButton>
            </div>
            <p class="gcp__terms-hint">
              <DoctolIcon name="info" :size="15" />
              راجع
              <RouterLink :to="{ name: 'terms' }">شروط بطاقة الإهداء</RouterLink>
              — لا تُستبدل نقداً وصلاحيتها 12 شهراً.
            </p>
          </div>

          <!-- payment -->
          <template v-else-if="step === 'payment'">
            <button type="button" class="gcp__back" @click="step = 'details'">
              <DoctolIcon name="chevron-right" :size="17" />
              العودة إلى تفاصيل الهدية
            </button>

            <div class="gcp__card">
              <h2 class="gcp__title"><DoctolIcon name="card" :size="20" /> الدفع</h2>

              <dl class="gcp__summary">
                <div>
                  <dt>قيمة البطاقة</dt>
                  <dd class="money">{{ formatPrice(amount) }}</dd>
                </div>
                <div>
                  <dt>ضريبة القيمة المضافة (15٪)</dt>
                  <dd class="money">{{ formatPrice(vat) }}</dd>
                </div>
                <div class="gcp__summary-total">
                  <dt>الإجمالي</dt>
                  <dd class="money">{{ formatPrice(total) }}</dd>
                </div>
              </dl>

              <fieldset class="gcp__methods">
                <legend>طريقة الدفع</legend>
                <div class="gcp__methods-grid">
                  <label
                    v-for="method in paymentMethods.filter((m) => m.id !== 'cash')"
                    :key="method.id"
                    class="gcp__method"
                    :class="{ 'gcp__method--on': paymentMethod === method.id }"
                  >
                    <input
                      type="radio"
                      name="gift-payment"
                      class="visually-hidden"
                      :value="method.id"
                      :checked="paymentMethod === method.id"
                      @change="paymentMethod = method.id"
                    />
                    <PaymentBrandMark class="gcp__method-mark" :name="method.id" :size="18" />
                    <span class="gcp__method-label">{{ method.label }}</span>
                    <span class="gcp__method-hint">{{ method.hint }}</span>
                  </label>
                </div>
              </fieldset>

              <p class="gcp__notice">
                <DoctolIcon name="lock" :size="17" />
                نسخة تجريبية — لن يتم خصم أي مبلغ. الدفع الفعلي يتم عبر بوابة مؤمّنة ولا نحتفظ
                ببيانات بطاقتك.
              </p>

              <BaseButton
                block
                size="lg"
                icon="check-circle"
                :loading="submitting"
                loading-text="جاري إتمام الدفع…"
                @click="pay"
              >
                إتمام الدفع
              </BaseButton>
            </div>
          </template>

          <!-- details -->
          <template v-else>
            <div class="gcp__card">
              <h2 class="gcp__title"><DoctolIcon name="sparkle" :size="20" /> تصميم البطاقة</h2>
              <div class="gcp__themes">
                <button
                  v-for="item in THEMES"
                  :key="item.id"
                  type="button"
                  class="gcp__theme"
                  :class="[item.class, { 'gcp__theme--on': themeId === item.id }]"
                  :aria-pressed="themeId === item.id"
                  @click="themeId = item.id"
                >
                  <span aria-hidden="true">{{ item.emoji }}</span>
                  {{ item.label }}
                </button>
              </div>
            </div>

            <div v-reveal class="gcp__card">
              <h2 class="gcp__title"><DoctolIcon name="wallet" :size="20" /> اختر مبلغ الهدية</h2>
              <div class="gcp__amounts">
                <OptionChip
                  v-for="value in AMOUNTS"
                  :key="value"
                  name="gift-amount"
                  :value="value"
                  :label="formatPrice(value)"
                  :selected="amount === value && !customAmount"
                  @select="pickAmount"
                />
              </div>
              <BaseField
                label="أو أدخل مبلغاً آخر"
                type="number"
                icon="wallet"
                inputmode="numeric"
                :placeholder="`من ${MIN} إلى ${MAX} ريال`"
                :model-value="customAmount"
                :error="errors.amount"
                @update:model-value="onCustomAmount"
                @blur="validate('amount')"
              />
            </div>

            <div v-reveal class="gcp__card">
              <h2 class="gcp__title"><DoctolIcon name="user" :size="20" /> المُرسِل</h2>
              <div class="gcp__row">
                <BaseField
                  v-model="sender.name"
                  label="الاسم"
                  icon="user"
                  required
                  autocomplete="name"
                  :error="errors.senderName"
                  @blur="validate('senderName')"
                />
                <BaseField
                  label="رقم الجوال"
                  type="tel"
                  icon="phone"
                  required
                  inputmode="numeric"
                  placeholder="05XXXXXXXX"
                  :maxlength="PHONE_MAX_DIGITS"
                  :model-value="sender.phone"
                  :error="errors.senderPhone"
                  @update:model-value="(v) => onPhoneInput(sender, v)"
                  @blur="validate('senderPhone')"
                />
              </div>
            </div>

            <div v-reveal class="gcp__card">
              <h2 class="gcp__title"><DoctolIcon name="users" :size="20" /> المُرسَل إليه</h2>
              <div class="gcp__row">
                <BaseField
                  v-model="recipient.name"
                  label="الاسم"
                  icon="user"
                  required
                  :error="errors.recipientName"
                  @blur="validate('recipientName')"
                />
                <BaseField
                  label="رقم الجوال"
                  type="tel"
                  icon="phone"
                  required
                  inputmode="numeric"
                  placeholder="05XXXXXXXX"
                  :maxlength="PHONE_MAX_DIGITS"
                  hint="نرسل كود البطاقة على هذا الرقم"
                  :model-value="recipient.phone"
                  :error="errors.recipientPhone"
                  @update:model-value="(v) => onPhoneInput(recipient, v)"
                  @blur="validate('recipientPhone')"
                />
              </div>
              <BaseField
                v-model="recipient.cityId"
                as="select"
                label="المدينة"
                icon="pin"
                required
                placeholder="اختر المدينة"
                :options="cityOptions"
                :error="errors.cityId"
                @blur="validate('cityId')"
              />
            </div>

            <div v-reveal class="gcp__card">
              <div class="gcp__title-row">
                <h2 class="gcp__title"><DoctolIcon name="quote" :size="20" /> اكتب رسالتك</h2>
                <button
                  v-if="messageTouched"
                  type="button"
                  class="gcp__reset"
                  @click="
                    () => {
                      messageTouched = false
                      message = suggestedMessage
                    }
                  "
                >
                  <DoctolIcon name="refresh" :size="14" />
                  الرسالة المقترحة
                </button>
              </div>
              <BaseField
                as="textarea"
                label="نص الرسالة"
                :rows="4"
                :maxlength="300"
                required
                :model-value="message"
                :error="errors.message"
                :hint="`${message.length} / 300 حرف`"
                @update:model-value="
                  (v) => {
                    message = v
                    messageTouched = true
                  }
                "
                @blur="validate('message')"
              />
            </div>

            <BaseButton
              block
              size="lg"
              icon-end="arrow-left"
              :disabled="!detailsValid"
              @click="goToPayment"
            >
              انتقل إلى الدفع · {{ formatPrice(total) }}
            </BaseButton>

            <p v-if="!detailsValid" class="gcp__hint">
              <DoctolIcon name="info" :size="14" />
              أكمل بيانات المُرسِل والمُرسَل إليه للمتابعة
            </p>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.gcp {
  display: grid;
  gap: var(--dt-space-6);
  align-items: start;
}

/* ---------- preview ---------- */
.gcp__preview-inner {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
}

.gcp__preview-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-muted);
}

.gc {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
  padding: var(--dt-space-6);
  border-radius: var(--dt-radius-2xl);
  color: #fff;
  overflow: hidden;
  isolation: isolate;
  box-shadow: var(--dt-shadow-xl);
  min-height: 380px;
  transition: background var(--dt-dur-4) var(--dt-ease-out);
}

.gc--classic {
  background: linear-gradient(140deg, #00a79d 0%, #05606a 60%, #073b4c 100%);
}
.gc--celebrate {
  background: linear-gradient(140deg, #f7cf62 0%, #e08b2f 55%, #8a4b1f 100%);
}
.gc--thanks {
  background: linear-gradient(140deg, #0d5468 0%, #073b4c 55%, #041e28 100%);
}
.gc--love {
  background: linear-gradient(140deg, #f4899b 0%, #b8557a 50%, #4a2450 100%);
}

.gc__glow {
  position: absolute;
  inset-block-start: -30%;
  inset-inline-end: -20%;
  width: 60%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(255 255 255 / 0.3), transparent 70%);
  z-index: -1;
}

.gc__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-3);
}

.gc__emoji {
  font-size: 2rem;
  line-height: 1;
}

.gc__greeting {
  font-size: var(--dt-fs-h2);
  font-weight: var(--dt-fw-bold);
  line-height: 1.15;
}

.gc__to {
  font-size: var(--dt-fs-body-lg);
  font-weight: var(--dt-fw-semibold);
  color: rgb(255 255 255 / 0.86);
}

.gc__message {
  flex: 1;
  font-size: var(--dt-fs-sm);
  line-height: var(--dt-lh-normal);
  color: rgb(255 255 255 / 0.9);
}

.gc__foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--dt-space-4);
  padding-block-start: var(--dt-space-4);
  border-block-start: 1px solid rgb(255 255 255 / 0.25);
}

.gc__amount,
.gc__from {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.gc__amount small,
.gc__from small {
  font-size: var(--dt-fs-xs);
  color: rgb(255 255 255 / 0.7);
}

.gc__amount strong {
  font-size: 1.6rem;
  font-weight: var(--dt-fw-bold);
}

.gc__from {
  align-items: flex-end;
  text-align: end;
}

.gc__from strong {
  font-weight: var(--dt-fw-semibold);
}

.gc__code {
  align-self: center;
  padding: 0.4rem 1.2rem;
  border-radius: var(--dt-radius-pill);
  background: rgb(255 255 255 / 0.18);
  border: 1px dashed rgb(255 255 255 / 0.5);
  font-weight: var(--dt-fw-bold);
  letter-spacing: 0.08em;
}

.gcp__perks {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: var(--dt-space-4);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface-sunken);
}

.gcp__perks li {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.gcp__perks :deep(svg) {
  color: var(--dt-teal-500);
  flex: none;
}

/* ---------- form ---------- */
.gcp__form {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
  min-width: 0;
}

.gcp__card {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
  padding: var(--dt-space-5);
  border-radius: var(--dt-radius-xl);
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-sm);
}

.gcp__title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: var(--dt-fs-h4);
  font-weight: var(--dt-fw-bold);
}

.gcp__title :deep(svg) {
  color: var(--dt-teal-500);
}

.gcp__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-3);
  flex-wrap: wrap;
}

.gcp__reset {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-teal-600);
  padding: 0.3rem 0.5rem;
  border-radius: var(--dt-radius-xs);
}

.gcp__reset:hover {
  background: var(--dt-teal-50);
}

/* themes */
.gcp__themes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 130px), 1fr));
  gap: var(--dt-space-2);
}

.gcp__theme {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 62px;
  border-radius: var(--dt-radius-md);
  color: #fff;
  font-weight: var(--dt-fw-semibold);
  font-size: var(--dt-fs-sm);
  border: 3px solid transparent;
  opacity: 0.62;
  transition:
    opacity var(--dt-dur-2) var(--dt-ease-out),
    border-color var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-2) var(--dt-ease-spring);
}

.gcp__theme span {
  font-size: 1.2rem;
}

.gcp__theme:hover {
  opacity: 0.85;
}

.gcp__theme--on {
  opacity: 1;
  border-color: var(--dt-navy-700);
  transform: scale(1.03);
}

.gcp__amounts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 110px), 1fr));
  gap: var(--dt-space-2);
}

.gcp__row {
  display: grid;
  gap: var(--dt-space-4);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
}

.gcp__hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

/* ---------- payment ---------- */
.gcp__back {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  align-self: flex-start;
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-teal-700);
  padding: 0.4rem 0.6rem;
  border-radius: var(--dt-radius-sm);
}

.gcp__back:hover {
  background: var(--dt-teal-50);
}

.gcp__summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: var(--dt-space-4);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-grad-mint);
  border: 1px solid var(--dt-teal-100);
}

.gcp__summary > div {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--dt-space-3);
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
}

.gcp__summary-total {
  padding-block-start: var(--dt-space-3);
  border-block-start: 1px solid var(--dt-teal-200);
  font-weight: var(--dt-fw-bold);
  color: var(--dt-ink) !important;
}

.gcp__summary-total dd {
  font-size: 1.3rem;
  color: var(--dt-teal-700);
}

.gcp__methods {
  border: 0;
  padding: 0;
  margin: 0;
}

.gcp__methods legend {
  font-weight: var(--dt-fw-semibold);
  margin-block-end: var(--dt-space-3);
}

.gcp__methods-grid {
  display: grid;
  gap: var(--dt-space-2);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 170px), 1fr));
}

.gcp__method {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-height: 66px;
  padding: 0.7rem 1rem;
  border: 1.5px solid var(--dt-line);
  border-radius: var(--dt-radius-md);
  cursor: pointer;
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    background-color var(--dt-dur-2) var(--dt-ease-out);
}

.gcp__method:hover {
  border-color: var(--dt-teal-300);
}

.gcp__method--on {
  border-color: var(--dt-teal-500);
  background: var(--dt-teal-50);
}

.gcp__method:focus-within {
  box-shadow: 0 0 0 4px var(--dt-focus-ring);
}

.gcp__method-mark {
  margin-block-end: 0.35rem;
}

.gcp__method-label {
  font-weight: var(--dt-fw-semibold);
  font-size: var(--dt-fs-sm);
}

.gcp__method-hint {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.gcp__notice {
  display: flex;
  align-items: flex-start;
  gap: var(--dt-space-2);
  padding: var(--dt-space-4);
  border-radius: var(--dt-radius-md);
  background: var(--dt-surface-sunken);
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
}

.gcp__notice :deep(svg) {
  flex: none;
  color: var(--dt-teal-500);
}

/* ---------- success ---------- */
.gcp__done {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dt-space-3);
  padding: var(--dt-space-8) var(--dt-space-5);
  text-align: center;
  border-radius: var(--dt-radius-xl);
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-md);
}

.gcp__done-title {
  font-size: var(--dt-fs-h2);
  color: var(--dt-navy-700);
}

.gcp__done-text {
  color: var(--dt-muted);
  max-width: 42ch;
}

.gcp__code-box {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: var(--dt-space-4) var(--dt-space-6);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-grad-mint);
  border: 1px dashed var(--dt-teal-300);
}

.gcp__code-box span {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.gcp__code-box strong {
  font-size: 1.5rem;
  font-weight: var(--dt-fw-bold);
  color: var(--dt-teal-700);
  letter-spacing: 0.06em;
}

.gcp__done-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--dt-space-2);
}

.gcp__terms-hint {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.gcp__terms-hint a {
  color: var(--dt-teal-600);
  font-weight: var(--dt-fw-semibold);
  text-decoration: underline;
}

@media (min-width: 1024px) {
  .gcp {
    grid-template-columns: 400px minmax(0, 1fr);
  }
  .gcp__preview-inner {
    position: sticky;
    top: calc(var(--dt-header-h) + var(--dt-space-5));
  }
}
</style>
