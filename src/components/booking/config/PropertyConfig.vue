<script setup>
/**
 * Rehabilitation-cleaning configurator.
 *
 * Condition drives everything below it: switching to "بعد التشطيب" swaps the
 * area bands (the store re-reconciles the selection) and reveals the finishing
 * notes, the attachment picker and the construction-debris warning. "قبل السكن"
 * hides all three and shows a reassurance note instead.
 */
import { computed, ref, useId } from 'vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import OptionChip from '@/components/common/OptionChip.vue'
import QuantityStepper from '@/components/common/QuantityStepper.vue'
import { useUiStore } from '@/stores/uiStore'

const props = defineProps({
  service: { type: Object, required: true },
  config: { type: Object, required: true },
})

const emit = defineEmits(['update'])

const uid = useId()
const ui = useUiStore()
const fileInput = ref(null)

const c = computed(() => props.service.config)
const bands = computed(() => c.value.areaOptions[props.config.state] ?? c.value.areaOptions.before)
const isAfter = computed(() => props.config.state === 'after')
const files = computed(() => props.config.files ?? [])

function setCounter(id, value) {
  emit('update', { counters: { ...props.config.counters, [id]: value } })
}

function toggleNote(noteId) {
  const notes = props.config.notes ?? []
  emit('update', {
    notes: notes.includes(noteId) ? notes.filter((n) => n !== noteId) : [...notes, noteId],
  })
}

function onFiles(event) {
  const picked = Array.from(event.target.files ?? [])
  const accepted = []
  for (const file of picked) {
    if (file.size > c.value.upload.maxBytes) {
      ui.toast.error('الملف كبير جداً', `${file.name} يتجاوز الحد المسموح.`)
      continue
    }
    accepted.push(file)
  }
  if (accepted.length) emit('update', { files: [...files.value, ...accepted].slice(0, 5) })
  event.target.value = ''
}

function removeFile(index) {
  emit('update', { files: files.value.filter((_, i) => i !== index) })
}

const sizeMb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} م.ب`
</script>

<template>
  <div class="prop">
    <!-- condition -->
    <fieldset class="prop__block">
      <legend class="prop__label">{{ c.stateLabel }}</legend>
      <div class="prop__pair">
        <OptionChip
          v-for="state in c.states"
          :key="state.id"
          :name="`${uid}-state`"
          :value="state.id"
          :label="state.label"
          :icon="state.icon"
          :selected="config.state === state.id"
          @select="(id) => emit('update', { state: id })"
        />
      </div>
    </fieldset>

    <!-- area band -->
    <fieldset class="prop__block">
      <legend class="prop__label">{{ c.areaLabel }}</legend>
      <div class="prop__bands">
        <OptionChip
          v-for="band in bands"
          :key="band.id"
          :name="`${uid}-band`"
          :value="band.id"
          :label="band.label"
          :selected="config.areaId === band.id"
          @select="(id) => emit('update', { areaId: id })"
        />
      </div>
    </fieldset>

    <!-- room counts -->
    <div class="prop__block">
      <p class="prop__label">{{ c.detailsLabel }}</p>
      <div class="prop__counters">
        <div v-for="counter in c.counters" :key="counter.id" class="prop__counter">
          <span class="prop__counter-label">
            <DoctolIcon :name="counter.icon" :size="20" />
            {{ counter.label }}
          </span>
          <QuantityStepper
            size="sm"
            :model-value="config.counters?.[counter.id] ?? counter.default"
            :min="counter.min"
            :max="counter.max"
            :label="counter.label"
            @update:model-value="(v) => setCounter(counter.id, v)"
          />
        </div>
      </div>
    </div>

    <!-- kitchen cabinet -->
    <div class="prop__block prop__cabinet">
      <div class="prop__cabinet-text">
        <p class="prop__label prop__label--tight">{{ c.kitchenCabinet.label }}</p>
        <p class="prop__question">{{ c.kitchenCabinet.question }}</p>
      </div>
      <div class="prop__pair prop__pair--compact">
        <OptionChip
          :name="`${uid}-cabinet`"
          :value="'yes'"
          label="نعم"
          tone="solid"
          :selected="config.kitchenCabinet === true"
          @select="() => emit('update', { kitchenCabinet: true })"
        />
        <OptionChip
          :name="`${uid}-cabinet`"
          :value="'no'"
          label="لا"
          tone="solid"
          :selected="config.kitchenCabinet === false"
          @select="() => emit('update', { kitchenCabinet: false })"
        />
      </div>
    </div>

    <!-- post-finishing extras -->
    <template v-if="isAfter">
      <div class="prop__block">
        <p class="prop__label">ملاحظات التشطيب (اختياري)</p>
        <div class="prop__notes">
          <label
            v-for="note in c.finishingNotes"
            :key="note.id"
            class="prop__note"
            :class="{ 'prop__note--on': config.notes?.includes(note.id) }"
          >
            <input
              type="checkbox"
              class="visually-hidden"
              :checked="config.notes?.includes(note.id)"
              @change="toggleNote(note.id)"
            />
            <span class="prop__box" aria-hidden="true">
              <DoctolIcon name="check" :size="13" :stroke="3" />
            </span>
            {{ note.label }}
          </label>
        </div>
      </div>

      <div class="prop__block prop__upload">
        <div class="prop__upload-text">
          <p class="prop__label prop__label--tight">{{ c.upload.title }}</p>
          <p class="prop__question">{{ c.upload.hint }}</p>
        </div>

        <button type="button" class="prop__dropzone" @click="fileInput?.click()">
          <DoctolIcon name="image" :size="24" />
          <span>
            <strong>{{ c.upload.cta }}</strong>
            <small>{{ c.upload.limits }}</small>
          </span>
        </button>
        <input
          ref="fileInput"
          type="file"
          class="visually-hidden"
          multiple
          :accept="c.upload.accept"
          @change="onFiles"
        />

        <ul v-if="files.length" class="prop__files">
          <li v-for="(file, index) in files" :key="`${file.name}-${index}`">
            <DoctolIcon name="image" :size="16" />
            <span class="prop__file-name">{{ file.name }}</span>
            <span class="prop__file-size num">{{ sizeMb(file.size) }}</span>
            <button type="button" :aria-label="`حذف ${file.name}`" @click="removeFile(index)">
              <DoctolIcon name="close" :size="15" />
            </button>
          </li>
        </ul>
      </div>

      <p class="prop__warning" role="note">
        <DoctolIcon name="info" :size="18" />
        <span><strong>تنبيه:</strong> {{ c.warning }}</span>
      </p>
    </template>

    <p v-else class="prop__hint">
      <DoctolIcon name="info" :size="18" />
      {{ c.beforeNote }}
    </p>
  </div>
</template>

<style scoped>
.prop {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-5);
}

.prop__block {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
}

.prop__label {
  display: block;
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-bold);
  color: var(--dt-ink);
  margin-block-end: var(--dt-space-3);
}

.prop__label--tight {
  margin-block-end: 0.15rem;
}

.prop__question {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.prop__pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--dt-space-2);
}

.prop__pair--compact {
  max-width: 260px;
}

.prop__bands {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr));
  gap: var(--dt-space-2);
}

/* ---------- counters ---------- */
.prop__counters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 230px), 1fr));
  gap: var(--dt-space-2);
}

.prop__counter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-3);
  padding: 0.45rem 0.5rem 0.45rem 0.5rem;
  padding-inline-start: var(--dt-space-4);
  border: 1.5px solid var(--dt-line);
  border-radius: var(--dt-radius-md);
  background: var(--dt-surface);
}

.prop__counter-label {
  display: inline-flex;
  align-items: center;
  gap: var(--dt-space-2);
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-medium);
}

.prop__counter-label :deep(svg) {
  color: var(--dt-teal-600);
}

/* ---------- cabinet ---------- */
.prop__cabinet {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-4);
  flex-wrap: wrap;
  padding: var(--dt-space-4);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface-sunken);
}

/* ---------- finishing notes ---------- */
.prop__notes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 170px), 1fr));
  gap: var(--dt-space-2);
}

.prop__note {
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
  min-height: 52px;
  padding: 0.6rem 1rem;
  border: 1.5px solid var(--dt-line);
  border-radius: var(--dt-radius-md);
  background: var(--dt-surface);
  font-size: var(--dt-fs-sm);
  cursor: pointer;
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    background-color var(--dt-dur-2) var(--dt-ease-out);
}

.prop__note:hover {
  border-color: var(--dt-teal-300);
}

.prop__note--on {
  border-color: var(--dt-teal-500);
  background: var(--dt-teal-50);
}

.prop__note:focus-within {
  outline: 3px solid var(--dt-focus-ring);
  outline-offset: 2px;
}

.prop__box {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  flex: none;
  border: 1.5px solid var(--dt-line-strong);
  border-radius: var(--dt-radius-xs);
  color: transparent;
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    border-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out);
}

.prop__note--on .prop__box {
  background: var(--dt-teal-500);
  border-color: var(--dt-teal-500);
  color: #fff;
}

/* ---------- upload ---------- */
.prop__upload {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
}

.prop__dropzone {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--dt-space-3);
  min-height: 84px;
  padding: var(--dt-space-4);
  border: 1.5px dashed var(--dt-line-strong);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface);
  color: var(--dt-teal-700);
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    background-color var(--dt-dur-2) var(--dt-ease-out);
}

.prop__dropzone:hover {
  border-color: var(--dt-teal-400);
  background: var(--dt-teal-50);
}

.prop__dropzone span {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
}

.prop__dropzone strong {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
}

.prop__dropzone small {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.prop__files {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
}

.prop__files li {
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  padding: 0.5rem 0.75rem;
  border-radius: var(--dt-radius-sm);
  background: var(--dt-surface-sunken);
  font-size: var(--dt-fs-xs);
}

.prop__file-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.prop__file-size {
  color: var(--dt-muted);
}

.prop__files button {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: var(--dt-radius-pill);
  color: var(--dt-muted);
}

.prop__files button:hover {
  background: var(--dt-danger-soft);
  color: var(--dt-danger);
}

/* ---------- notices ---------- */
.prop__warning,
.prop__hint {
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
  padding: var(--dt-space-4);
  border-radius: var(--dt-radius-md);
  font-size: var(--dt-fs-sm);
  line-height: var(--dt-lh-snug);
}

.prop__warning {
  background: var(--dt-danger-soft);
  border: 1px solid color-mix(in srgb, var(--dt-danger) 25%, transparent);
  color: var(--dt-ink-soft);
}

.prop__warning :deep(svg) {
  flex: none;
  color: var(--dt-danger);
}

.prop__warning strong {
  color: var(--dt-danger);
}

.prop__hint {
  background: var(--dt-teal-50);
  color: var(--dt-teal-800);
}

.prop__hint :deep(svg) {
  flex: none;
  color: var(--dt-teal-600);
}

@media (max-width: 520px) {
  .prop__pair {
    grid-template-columns: 1fr;
  }
  .prop__pair--compact {
    max-width: none;
    grid-template-columns: 1fr 1fr;
  }
  .prop__cabinet {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
