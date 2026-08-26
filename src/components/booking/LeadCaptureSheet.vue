<script setup>
/**
 * "حياك في دكتول" — name and phone taken once, before the customer starts
 * configuring. Two fields only: anything more here costs conversions, and the
 * rest of the detail is collected later when the customer is already invested.
 */
import { computed, ref } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { PHONE_MAX_DIGITS, sanitizePhoneInput } from '@/utils/format'
import { validators } from '@/utils/validate'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'submit'])

const form = ref({ name: '', phone: '' })
const serverError = ref('')
const auth = useAuthStore()
const errors = ref({})
const touched = ref({})

const digits = computed(() => form.value.phone.replace(/\D/g, ''))
const isValid = computed(
  () => !validators.name(form.value.name) && !validators.phone(digits.value),
)

function onPhone(event) {
  form.value.phone = sanitizePhoneInput(event.target.value)
  if (touched.value.phone) validate('phone')
}

function validate(field) {
  touched.value[field] = true
  const message = field === 'phone' ? validators.phone(digits.value) : validators.name(form.value.name)
  errors.value = message
    ? { ...errors.value, [field]: message }
    : Object.fromEntries(Object.entries(errors.value).filter(([k]) => k !== field))
}

async function onSubmit() {
  validate('name')
  validate('phone')
  if (!isValid.value) return
  serverError.value = ''
  try {
    await auth.registerCustomer({ name: form.value.name.trim(), phone: digits.value })
    emit('submit', { name: form.value.name.trim(), phone: digits.value })
  } catch (error) {
    serverError.value = error.message
  }
}
</script>

<template>
  <BaseModal
    :open="open"
    variant="sheet"
    size="sm"
    :dismissable="false"
  >
    <template #header>
      <div class="lead__header">
        <h2 class="lead__title">
          حياك في دكتول
          <DoctolIcon name="sparkle" :size="22" class="lead__spark" />
        </h2>
        <p class="lead__sub">نحتاج بيانات التواصل لإكمال طلبك</p>
      </div>
    </template>

    <form class="lead" novalidate @submit.prevent="onSubmit">
      <label class="lead__field">
        <span class="lead__label">الاسم</span>
        <span class="lead__control" :class="{ 'lead__control--error': errors.name }">
          <DoctolIcon name="user" :size="19" />
          <input
            v-model="form.name"
            type="text"
            autocomplete="name"
            placeholder="اكتب اسمك"
            :aria-invalid="Boolean(errors.name)"
            @blur="validate('name')"
          />
        </span>
        <span v-if="errors.name" class="lead__error" role="alert">{{ errors.name }}</span>
      </label>

      <label class="lead__field">
        <span class="lead__label">رقم الجوال</span>
        <span class="lead__control lead__control--phone" :class="{ 'lead__control--error': errors.phone }">
          <span class="lead__cc">
            <span class="lead__flag" aria-hidden="true">🇸🇦</span>
            <span class="num">+966</span>
          </span>
          <input
            type="tel"
            inputmode="numeric"
            autocomplete="tel"
            placeholder="5XXXXXXXX"
            :maxlength="PHONE_MAX_DIGITS"
            :value="form.phone"
            :aria-invalid="Boolean(errors.phone)"
            @input="onPhone"
            @blur="validate('phone')"
          />
        </span>
        <span v-if="errors.phone" class="lead__error" role="alert">{{ errors.phone }}</span>
      </label>

      <p class="lead__privacy">
        <DoctolIcon name="lock" :size="15" />
        بياناتك محفوظة وتستخدم لخدمتك فقط
      </p>

      <p v-if="serverError" class="lead__error" role="alert">{{ serverError }}</p>

      <BaseButton type="submit" block size="lg" icon-end="chevron-left" :disabled="!isValid" :loading="auth.loading">
        تسجيل ومتابعة الحجز
      </BaseButton>
    </form>
  </BaseModal>
</template>

<style scoped>
.lead__header {
  width: 100%;
  text-align: center;
}

.lead__title {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: var(--dt-fs-h2);
}

.lead__spark {
  color: var(--dt-gold-500);
}

.lead__sub {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
  margin-block-start: 0.35rem;
}

.lead {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
}

.lead__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.lead__label {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-ink-soft);
}

.lead__control {
  display: flex;
  align-items: center;
  /**
   * The height belongs on the control, not the input. When the input carried
   * `min-height` it became the tallest flex item and sized the row itself,
   * which left its text block top-aligned instead of centred — the number
   * rendered above the box. With the height here the input can stretch and
   * centre its own text the way the browser intends.
   */
  min-height: 56px;
  gap: var(--dt-space-3);
  padding-inline-start: var(--dt-space-4);
  border: 1.5px solid var(--dt-line);
  border-radius: var(--dt-radius-md);
  background: var(--dt-surface);
  color: var(--dt-muted-soft);
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    box-shadow var(--dt-dur-2) var(--dt-ease-out);
}

.lead__control:focus-within {
  border-color: var(--dt-teal-400);
  box-shadow: 0 0 0 4px var(--dt-focus-ring);
}

.lead__control--error {
  border-color: var(--dt-danger);
}

.lead__control input {
  flex: 1;
  min-width: 0;
  align-self: stretch;
  padding-block: 0;
  padding-inline-end: var(--dt-space-4);
  border: 0;
  outline: none;
  background: none;
  color: var(--dt-ink);
  line-height: normal;
}

.lead__control--phone {
  padding-inline-start: 0;
}

/* The value is bare digits, so no bidi isolation is needed here. */
.lead__control--phone input {
  padding-inline-start: var(--dt-space-4);
  text-align: start;
  font-variant-numeric: tabular-nums;
}

.lead__cc {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  align-self: stretch;
  padding-inline: var(--dt-space-4);
  border-inline-end: 1px solid var(--dt-line);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-ink);
}

.lead__flag {
  font-size: 1.1rem;
  line-height: 1;
}

.lead__error {
  font-size: var(--dt-fs-xs);
  color: var(--dt-danger);
  font-weight: var(--dt-fw-medium);
}

.lead__privacy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}
</style>
