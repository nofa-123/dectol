<script setup>
/**
 * Toast stack. Lives once in App.vue and renders whatever uiStore holds.
 * Uses a polite live region so announcements never interrupt the user.
 */
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { useUiStore } from '@/stores/uiStore'

const ui = useUiStore()

const ICONS = {
  success: 'check-circle',
  error: 'alert',
  info: 'info',
}
</script>

<template>
  <div class="toasts" role="region" aria-live="polite" aria-label="التنبيهات">
    <TransitionGroup name="toast">
      <div v-for="t in ui.toasts" :key="t.id" class="toast" :class="`toast--${t.type}`">
        <span class="toast__icon">
          <DoctolIcon :name="ICONS[t.type] ?? 'info'" :size="20" />
        </span>
        <div class="toast__body">
          <p class="toast__title">{{ t.title }}</p>
          <p v-if="t.message" class="toast__message">{{ t.message }}</p>
        </div>
        <button class="toast__close" type="button" aria-label="إغلاق التنبيه" @click="ui.dismissToast(t.id)">
          <DoctolIcon name="close" :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  z-index: var(--dt-z-toast);
  inset-block-start: calc(var(--dt-header-h) + 12px);
  inset-inline-end: var(--dt-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
  width: min(380px, calc(100vw - 2rem));
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--dt-space-3);
  padding: var(--dt-space-4);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-lg);
  pointer-events: auto;
}

.toast__icon {
  flex: none;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: var(--dt-radius-sm);
}

.toast--success .toast__icon {
  background: var(--dt-success-soft);
  color: var(--dt-success);
}
.toast--error .toast__icon {
  background: var(--dt-danger-soft);
  color: var(--dt-danger);
}
.toast--info .toast__icon {
  background: var(--dt-teal-50);
  color: var(--dt-teal-600);
}

.toast--success {
  border-inline-start: 4px solid var(--dt-success);
}
.toast--error {
  border-inline-start: 4px solid var(--dt-danger);
}
.toast--info {
  border-inline-start: 4px solid var(--dt-teal-500);
}

.toast__body {
  flex: 1;
  min-width: 0;
}

.toast__title {
  font-weight: var(--dt-fw-semibold);
  line-height: var(--dt-lh-snug);
}

.toast__message {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
  margin-block-start: 0.15rem;
}

.toast__close {
  flex: none;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: var(--dt-radius-pill);
  color: var(--dt-muted-soft);
}

.toast__close:hover {
  background: var(--dt-surface-sunken);
  color: var(--dt-ink);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity var(--dt-dur-3) var(--dt-ease-out),
    transform var(--dt-dur-3) var(--dt-ease-spring);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-24px) scale(0.96);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-24px) scale(0.96);
}

.toast-move {
  transition: transform var(--dt-dur-3) var(--dt-ease-out);
}

@media (max-width: 767px) {
  .toasts {
    inset-block-start: auto;
    inset-block-end: calc(var(--dt-mobilenav-h) + 16px);
    inset-inline: var(--dt-space-4);
    width: auto;
  }
  .toast-enter-from,
  .toast-leave-to {
    transform: translateY(24px) scale(0.96);
  }
}
</style>
