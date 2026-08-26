<script setup>
/**
 * Notification bell with an inline popover.
 * Closes on outside click, Escape, or route change; the trigger keeps an
 * `aria-expanded` relationship with the panel.
 */
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { useUserStore } from '@/stores/userStore'

const user = useUserStore()
const route = useRoute()

const open = ref(false)
const root = ref(null)

const TYPE_ICON = {
  offer: 'percent',
  review: 'star',
  booking: 'calendar-check',
  info: 'info',
}

function toggle() {
  open.value = !open.value
  if (open.value) document.addEventListener('pointerdown', onOutside, true)
  else document.removeEventListener('pointerdown', onOutside, true)
}

function close() {
  if (!open.value) return
  open.value = false
  document.removeEventListener('pointerdown', onOutside, true)
}

function onOutside(event) {
  if (!root.value?.contains(event.target)) close()
}

function onKeydown(event) {
  if (event.key === 'Escape') close()
}

watch(() => route.fullPath, close)
onBeforeUnmount(() => document.removeEventListener('pointerdown', onOutside, true))
</script>

<template>
  <div ref="root" class="bell" @keydown="onKeydown">
    <button
      type="button"
      class="bell__trigger"
      :aria-label="`الإشعارات${user.unreadCount ? ` (${user.unreadCount} غير مقروء)` : ''}`"
      :aria-expanded="open"
      @click="toggle"
    >
      <DoctolIcon name="bell" :size="21" />
      <span v-if="user.unreadCount" class="bell__badge num">{{ user.unreadCount }}</span>
    </button>

    <Transition name="pop">
      <div v-if="open" class="bell__panel" role="dialog" aria-label="الإشعارات">
        <header class="bell__head">
          <h3 class="bell__title">الإشعارات</h3>
          <button
            v-if="user.unreadCount"
            type="button"
            class="bell__mark"
            @click="user.markAllRead()"
          >
            تعليم الكل كمقروء
          </button>
        </header>

        <ul v-if="user.notifications.length" class="bell__list">
          <li v-for="item in user.notifications.slice(0, 6)" :key="item.id">
            <button
              type="button"
              class="bell__item"
              :class="{ 'bell__item--unread': !item.read }"
              @click="user.markRead(item.id)"
            >
              <span class="bell__icon" :class="`bell__icon--${item.type}`">
                <DoctolIcon :name="TYPE_ICON[item.type] ?? 'info'" :size="17" />
              </span>
              <span class="bell__text">
                <span class="bell__item-title">{{ item.title }}</span>
                <span class="bell__item-body">{{ item.body }}</span>
                <span class="bell__time">{{ item.time }}</span>
              </span>
              <span v-if="!item.read" class="bell__dot" aria-hidden="true" />
            </button>
          </li>
        </ul>

        <p v-else class="bell__empty">لا توجد إشعارات حالياً</p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.bell {
  position: relative;
}

.bell__trigger {
  position: relative;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--dt-radius-pill);
  color: var(--dt-navy-700);
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out);
}

.bell__trigger:hover {
  background: var(--dt-teal-50);
  color: var(--dt-teal-600);
}

.bell__badge {
  position: absolute;
  inset-block-start: 6px;
  inset-inline-end: 6px;
  min-width: 17px;
  height: 17px;
  padding-inline: 3px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-danger);
  color: #fff;
  font-size: 0.62rem;
  font-weight: var(--dt-fw-bold);
  display: grid;
  place-items: center;
  border: 2px solid var(--dt-white);
}

.bell__panel {
  position: absolute;
  inset-block-start: calc(100% + 10px);
  inset-inline-end: 0;
  width: min(360px, calc(100vw - 2rem));
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  border-radius: var(--dt-radius-lg);
  box-shadow: var(--dt-shadow-lg);
  overflow: hidden;
  transform-origin: top var(--dt-panel-origin, left);
}

.bell__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dt-space-3);
  padding: var(--dt-space-4);
  border-block-end: 1px solid var(--dt-line);
}

.bell__title {
  font-size: var(--dt-fs-h4);
}

.bell__mark {
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-teal-600);
}

.bell__mark:hover {
  text-decoration: underline;
}

.bell__list {
  max-height: 340px;
  overflow-y: auto;
}

.bell__item {
  display: flex;
  align-items: flex-start;
  gap: var(--dt-space-3);
  width: 100%;
  padding: var(--dt-space-3) var(--dt-space-4);
  text-align: start;
  border-block-end: 1px solid var(--dt-line);
  transition: background-color var(--dt-dur-2) var(--dt-ease-out);
}

.bell__item:hover {
  background: var(--dt-teal-50);
}

.bell__item--unread {
  background: color-mix(in srgb, var(--dt-teal-50) 60%, transparent);
}

.bell__icon {
  flex: none;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: var(--dt-radius-sm);
  background: var(--dt-surface-sunken);
  color: var(--dt-navy-600);
}

.bell__icon--offer {
  background: var(--dt-gold-300);
  color: var(--dt-navy-800);
}

.bell__icon--booking {
  background: var(--dt-success-soft);
  color: var(--dt-success);
}

.bell__text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.bell__item-title {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  line-height: var(--dt-lh-snug);
}

.bell__item-body {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
}

.bell__time {
  font-size: 0.7rem;
  color: var(--dt-muted-soft);
}

.bell__dot {
  flex: none;
  width: 8px;
  height: 8px;
  margin-block-start: 0.5rem;
  border-radius: 50%;
  background: var(--dt-teal-500);
}

.bell__empty {
  padding: var(--dt-space-8);
  text-align: center;
  color: var(--dt-muted);
  font-size: var(--dt-fs-sm);
}

.pop-enter-active,
.pop-leave-active {
  transition:
    opacity var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-2) var(--dt-ease-out);
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}
</style>
