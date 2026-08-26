<script setup>
/** Live countdown. Announces politely once, then updates silently each second. */
import { computed } from 'vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { useCountdown } from '@/composables/useCountUp'

const props = defineProps({
  endsAt: { type: String, required: true },
  compact: { type: Boolean, default: false },
  light: { type: Boolean, default: false },
})

const { parts } = useCountdown(props.endsAt)

const pad = (n) => String(n).padStart(2, '0')

const cells = computed(() => [
  { key: 'days', value: pad(parts.value.days), label: 'يوم' },
  { key: 'hours', value: pad(parts.value.hours), label: 'ساعة' },
  { key: 'minutes', value: pad(parts.value.minutes), label: 'دقيقة' },
  { key: 'seconds', value: pad(parts.value.seconds), label: 'ثانية' },
])
</script>

<template>
  <div
    class="cd"
    :class="{ 'cd--compact': compact, 'cd--light': light, 'cd--expired': parts.expired }"
  >
    <span class="cd__icon"><DoctolIcon name="clock" :size="compact ? 15 : 17" /></span>
    <span v-if="parts.expired" class="cd__expired">انتهى العرض</span>
    <template v-else>
      <span class="cd__prefix">ينتهي خلال</span>
      <span class="cd__cells">
        <span v-for="cell in cells" :key="cell.key" class="cd__cell">
          <span class="cd__value">{{ cell.value }}</span>
          <span class="cd__label">{{ cell.label }}</span>
        </span>
      </span>
    </template>
  </div>
</template>

<style scoped>
.cd {
  display: inline-flex;
  align-items: center;
  gap: var(--dt-space-2);
  padding: 0.4rem 0.75rem;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-danger-soft);
  color: var(--dt-danger);
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-semibold);
}

.cd__prefix {
  white-space: nowrap;
}

.cd__cells {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.cd__cell {
  display: inline-flex;
  align-items: baseline;
  gap: 0.15rem;
}

.cd__value {
  min-width: 1.6em;
  padding: 0.1rem 0.3rem;
  border-radius: var(--dt-radius-xs);
  background: rgb(255 255 255 / 0.75);
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-weight: var(--dt-fw-bold);
}

.cd__label {
  font-size: 0.62rem;
  opacity: 0.85;
  font-weight: var(--dt-fw-medium);
}

.cd--compact .cd__label {
  display: none;
}

.cd--light {
  background: rgb(255 255 255 / 0.16);
  color: #fff;
}

.cd--light .cd__value {
  background: rgb(255 255 255 / 0.22);
}

.cd--expired {
  background: var(--dt-surface-sunken);
  color: var(--dt-muted);
}
</style>
