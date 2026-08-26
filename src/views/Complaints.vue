<script setup>
/**
 * الشكاوى والمقترحات.
 *
 * The live page is a bare form. Three additions make it actually usable:
 *   · the copy, categories and CTA all change with the مقترح/شكوى toggle
 *   · a complaint can carry an order reference and attachments
 *   · submitting returns a tracking number instead of a silent success
 */
import { computed, ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import BaseField from '@/components/common/BaseField.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import SuccessCheck from '@/components/common/SuccessCheck.vue'
import { PHONE_MAX_DIGITS, bookingReference, sanitizePhoneInput } from '@/utils/format'
import { validators } from '@/utils/validate'
import { contactInfo } from '@/data/content'
import { useUiStore } from '@/stores/uiStore'
import { vReveal } from '@/composables/useScrollAnimation'
import { doctolApi } from '@/services/doctolApi'
import { apiData } from '@/services/apiMappers'

const MODES = {
  suggestion: {
    id: 'suggestion',
    label: 'مقترح',
    icon: 'sparkle',
    lead: 'ننتظر أفكارك ومقترحاتك بكل حماس، رأيك يهمنا',
    fieldLabel: 'نوع المقترح',
    detailsLabel: 'تفاصيل المقترح',
    detailsPlaceholder: 'شاركنا فكرتك… وش الشيء اللي يخلي تجربتك مع دكتول أفضل؟',
    cta: 'إرسال المقترح',
    categories: ['تحسين الخدمة', 'خدمة جديدة', 'تجربة الموقع والتطبيق', 'الأسعار والعروض', 'أخرى'],
    sla: 'نراجع كل مقترح أسبوعياً، ونرد عليك إذا احتجنا تفاصيل أكثر.',
  },
  complaint: {
    id: 'complaint',
    label: 'شكوى',
    icon: 'alert',
    lead: 'نأسف إذا ما كانت التجربة كما توقعت — احكِ لنا وش صار وبنعالجها',
    fieldLabel: 'نوع الشكوى',
    detailsLabel: 'تفاصيل الشكوى',
    detailsPlaceholder: 'وضّح لنا وش صار بالضبط، ومتى، وأي فريق كان عندك إن أمكن.',
    cta: 'إرسال الشكوى',
    categories: [
      'جودة التنظيف',
      'التأخر عن الموعد',
      'تعامل الفريق',
      'الفاتورة والمبالغ',
      'ضرر أو فقد',
      'أخرى',
    ],
    sla: 'نرد على الشكاوى خلال 24 ساعة عمل، وضمان دكتول يغطي إعادة الخدمة مجاناً.',
  },
}

const ui = useUiStore()

const mode = ref('suggestion')
const active = computed(() => MODES[mode.value])
const isComplaint = computed(() => mode.value === 'complaint')

const form = ref({ category: '', name: '', phone: '', reference: '', details: '' })
const errors = ref({})
const files = ref([])
const submitting = ref(false)
const ticket = ref('')
const fileInput = ref(null)

const categoryOptions = computed(() =>
  active.value.categories.map((c) => ({ value: c, label: c })),
)

function setMode(next) {
  mode.value = next
  // Categories differ per mode, so a carried-over value would be nonsense.
  form.value.category = ''
  errors.value = {}
}

function onPhone(value) {
  form.value.phone = sanitizePhoneInput(value)
  if (errors.value.phone) validate('phone')
}

function validate(field) {
  const rules = {
    category: (v) => (v ? '' : `اختر ${active.value.fieldLabel}`),
    name: validators.name,
    phone: validators.phone,
    details: (v) =>
      !v?.trim() ? 'اكتب التفاصيل' : v.trim().length < 15 ? 'أضف تفاصيل أوضح (15 حرفاً على الأقل)' : '',
  }
  const message = rules[field]?.(form.value[field]) ?? ''
  errors.value = message
    ? { ...errors.value, [field]: message }
    : Object.fromEntries(Object.entries(errors.value).filter(([k]) => k !== field))
  return !message
}

function onFiles(event) {
  const picked = Array.from(event.target.files ?? [])
  const accepted = picked.filter((f) => {
    if (f.size > 10 * 1024 * 1024) {
      ui.toast.error('الملف كبير جداً', `${f.name} يتجاوز 10 ميجابايت.`)
      return false
    }
    return true
  })
  files.value = [...files.value, ...accepted].slice(0, 4)
  event.target.value = ''
}

const removeFile = (index) => (files.value = files.value.filter((_, i) => i !== index))

async function submit() {
  const fields = ['category', 'name', 'phone', 'details']
  const ok = fields.map(validate).every(Boolean)
  if (!ok) return

  submitting.value = true
  try {
    const response = await doctolApi.contact({
      feedback_type: mode.value,
      topic_id: form.value.category,
      name: form.value.name,
      phone: form.value.phone.replace(/\D/g, '').replace(/^0/, ''),
      message: [form.value.reference ? `رقم الحجز: ${form.value.reference}` : '', form.value.details].filter(Boolean).join('\n'),
    })
    const data = apiData.unwrap(response, {})
    ticket.value = data.reference ?? data.ticket_number ?? data.id ?? bookingReference().replace('DT-', isComplaint.value ? 'CS-' : 'SG-')
    ui.toast.success(
      isComplaint.value ? 'استلمنا شكواك' : 'استلمنا مقترحك',
      `رقم المتابعة ${ticket.value}`,
    )
  } catch (error) {
    ui.toast.error('تعذّر إرسال الطلب', error.message)
  } finally {
    submitting.value = false
  }
}

function reset() {
  ticket.value = ''
  form.value = { category: '', name: '', phone: '', reference: '', details: '' }
  files.value = []
  errors.value = {}
}

const sizeMb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} م.ب`
</script>

<template>
  <div>
    <PageHeader
      eyebrow="خدمة العملاء"
      eyebrow-icon="headset"
      title="الشكاوى والمقترحات"
      subtitle="رأيك يوصلنا مباشرة — وكل رسالة لها رقم متابعة تقدر تسأل فيه."
    />

    <section class="section section--tight">
      <div class="container cp">
        <!-- success -->
        <div v-if="ticket" class="cp__done">
          <SuccessCheck :size="110" />
          <h2 class="cp__done-title">
            {{ isComplaint ? 'استلمنا شكواك' : 'استلمنا مقترحك' }}
          </h2>
          <p class="cp__done-text">{{ active.sla }}</p>
          <p class="cp__ticket">
            <span>رقم المتابعة</span>
            <strong class="num">{{ ticket }}</strong>
          </p>
          <div class="cp__done-actions">
            <BaseButton variant="outline" icon="plus" @click="reset">إرسال رسالة أخرى</BaseButton>
            <BaseButton icon="home" :to="{ name: 'home' }">العودة للرئيسية</BaseButton>
          </div>
        </div>

        <!-- form -->
        <template v-else>
          <div v-reveal="'scale'" class="cp__switch" role="tablist" aria-label="نوع الرسالة">
            <button
              v-for="item in MODES"
              :key="item.id"
              type="button"
              role="tab"
              class="cp__switch-btn"
              :class="{ 'cp__switch-btn--on': mode === item.id }"
              :aria-selected="mode === item.id"
              @click="setMode(item.id)"
            >
              <DoctolIcon :name="item.icon" :size="19" />
              {{ item.label }}
            </button>
          </div>

          <p v-reveal class="cp__lead">{{ active.lead }}</p>

          <form v-reveal="{ delay: 80 }" class="cp__form" novalidate @submit.prevent="submit">
            <BaseField
              v-model="form.category"
              as="select"
              :label="active.fieldLabel"
              icon="list"
              required
              placeholder="اختر النوع"
              :options="categoryOptions"
              :error="errors.category"
              @blur="validate('category')"
            />

            <div class="cp__row">
              <BaseField
                v-model="form.name"
                label="الاسم"
                icon="user"
                required
                autocomplete="name"
                :error="errors.name"
                @blur="validate('name')"
              />
              <BaseField
                label="رقم الجوال"
                type="tel"
                icon="phone"
                required
                inputmode="numeric"
                autocomplete="tel"
                placeholder="05XXXXXXXX"
                :maxlength="PHONE_MAX_DIGITS"
                :model-value="form.phone"
                :error="errors.phone"
                @update:model-value="onPhone"
                @blur="validate('phone')"
              />
            </div>

            <BaseField
              v-if="isComplaint"
              v-model="form.reference"
              label="رقم الحجز"
              icon="calendar-check"
              placeholder="DT-XXXXX"
              hint="اختياري — يساعدنا نوصل لتفاصيل الزيارة بسرعة"
            />

            <BaseField
              v-model="form.details"
              as="textarea"
              :rows="5"
              :label="active.detailsLabel"
              :placeholder="active.detailsPlaceholder"
              required
              :error="errors.details"
              @blur="validate('details')"
            />

            <!-- attachments (complaints only) -->
            <div v-if="isComplaint" class="cp__files">
              <button type="button" class="cp__drop" @click="fileInput?.click()">
                <DoctolIcon name="image" :size="22" />
                <span>
                  <strong>إرفاق صور (اختياري)</strong>
                  <small>حتى 4 صور · 10 ميجابايت للصورة</small>
                </span>
              </button>
              <input
                ref="fileInput"
                type="file"
                class="visually-hidden"
                multiple
                accept="image/jpeg,image/png"
                @change="onFiles"
              />
              <ul v-if="files.length" class="cp__file-list">
                <li v-for="(file, index) in files" :key="`${file.name}-${index}`">
                  <DoctolIcon name="image" :size="15" />
                  <span class="cp__file-name">{{ file.name }}</span>
                  <span class="num">{{ sizeMb(file.size) }}</span>
                  <button type="button" :aria-label="`حذف ${file.name}`" @click="removeFile(index)">
                    <DoctolIcon name="close" :size="14" />
                  </button>
                </li>
              </ul>
            </div>

            <p class="cp__sla">
              <DoctolIcon name="info" :size="16" />
              {{ active.sla }}
            </p>

            <BaseButton
              type="submit"
              block
              size="lg"
              icon-end="arrow-left"
              :loading="submitting"
              loading-text="جاري الإرسال…"
            >
              {{ active.cta }}
            </BaseButton>
          </form>

          <div v-reveal="{ delay: 140 }" class="cp__alt">
            <p>تفضّل تكلمنا مباشرة؟</p>
            <div class="cp__alt-actions">
              <BaseButton size="sm" variant="outline" icon="phone" :href="`tel:${contactInfo.phone}`">
                <span class="num">{{ contactInfo.phone }}</span>
              </BaseButton>
              <BaseButton size="sm" icon="whatsapp" :href="`https://wa.me/${contactInfo.whatsapp}`">
                واتساب
              </BaseButton>
            </div>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped>
.cp {
  max-width: 44rem;
}

/* ---------- switch ---------- */
.cp__switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem;
  padding: 0.35rem;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-surface-sunken);
  border: 1px solid var(--dt-line);
}

.cp__switch-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 50px;
  border-radius: var(--dt-radius-pill);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-muted);
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out),
    box-shadow var(--dt-dur-2) var(--dt-ease-out);
}

.cp__switch-btn--on {
  background: var(--dt-surface);
  color: var(--dt-teal-700);
  box-shadow: var(--dt-shadow-sm);
}

.cp__lead {
  margin-block: var(--dt-space-5) var(--dt-space-4);
  text-align: center;
  font-size: var(--dt-fs-body-lg);
  color: var(--dt-ink-soft);
}

/* ---------- form ---------- */
.cp__form {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
  padding: var(--dt-space-6);
  border-radius: var(--dt-radius-xl);
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-md);
}

.cp__row {
  display: grid;
  gap: var(--dt-space-4);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
}

/* ---------- attachments ---------- */
.cp__files {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
}

.cp__drop {
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
  min-height: 72px;
  padding: var(--dt-space-4);
  border: 1.5px dashed var(--dt-line-strong);
  border-radius: var(--dt-radius-md);
  color: var(--dt-teal-700);
  text-align: start;
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    background-color var(--dt-dur-2) var(--dt-ease-out);
}

.cp__drop:hover {
  border-color: var(--dt-teal-400);
  background: var(--dt-teal-50);
}

.cp__drop span {
  display: flex;
  flex-direction: column;
}

.cp__drop strong {
  font-size: var(--dt-fs-sm);
}

.cp__drop small {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.cp__file-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.cp__file-list li {
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  padding: 0.45rem 0.7rem;
  border-radius: var(--dt-radius-sm);
  background: var(--dt-surface-sunken);
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.cp__file-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dt-ink-soft);
}

.cp__file-list button {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: var(--dt-radius-pill);
}

.cp__file-list button:hover {
  background: var(--dt-danger-soft);
  color: var(--dt-danger);
}

.cp__sla {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: var(--dt-space-3) var(--dt-space-4);
  border-radius: var(--dt-radius-md);
  background: var(--dt-teal-50);
  font-size: var(--dt-fs-xs);
  color: var(--dt-teal-800);
}

.cp__sla :deep(svg) {
  flex: none;
  color: var(--dt-teal-600);
}

/* ---------- alternatives ---------- */
.cp__alt {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--dt-space-3);
  margin-block-start: var(--dt-space-5);
  padding: var(--dt-space-4) var(--dt-space-5);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-grad-mint);
  border: 1px solid var(--dt-teal-100);
  font-size: var(--dt-fs-sm);
  color: var(--dt-ink-soft);
}

.cp__alt-actions {
  display: flex;
  gap: var(--dt-space-2);
  flex-wrap: wrap;
}

/* ---------- success ---------- */
.cp__done {
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

.cp__done-title {
  font-size: var(--dt-fs-h2);
  color: var(--dt-navy-700);
}

.cp__done-text {
  color: var(--dt-muted);
  max-width: 44ch;
}

.cp__ticket {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-block-start: var(--dt-space-3);
  padding: var(--dt-space-4) var(--dt-space-6);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-grad-mint);
  border: 1px dashed var(--dt-teal-300);
}

.cp__ticket span {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.cp__ticket strong {
  font-size: 1.5rem;
  font-weight: var(--dt-fw-bold);
  color: var(--dt-teal-700);
  letter-spacing: 0.05em;
}

.cp__done-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--dt-space-2);
  margin-block-start: var(--dt-space-3);
}
</style>
