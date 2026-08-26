<script setup>
/**
 * Fixed bottom navigation for phones, with the booking FAB as the visual
 * centre of gravity — the primary conversion action is never more than one tap
 * away, on any screen.
 *
 * Hides itself while an overlay owns the screen so it can't overlap a sheet.
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { useBooking } from '@/composables/useBooking'
import { useUiStore } from '@/stores/uiStore'

/**
 * Order follows the mobile design: home and offers to the right of the booking
 * FAB, account and "المزيد" to its left. "المزيد" isn't a route — it opens the
 * drawer, which is where the rest of the navigation already lives.
 */
const ITEMS = [
  { label: 'الرئيسية', icon: 'home', to: { name: 'home' } },
  { label: 'العروض', icon: 'percent', to: { name: 'offers' } },
  { label: 'حسابي', icon: 'user', to: { name: 'account' } },
  { label: 'المزيد', icon: 'more', action: 'drawer' },
]

const route = useRoute()
const ui = useUiStore()
const { startBlank } = useBooking()

const onBooking = computed(() => route.name === 'booking')
/** Split evenly around the FAB. */
const start = computed(() => ITEMS.slice(0, 2))
const end = computed(() => ITEMS.slice(2))
</script>

<template>
  <nav class="mnav" :class="{ 'mnav--hidden': ui.isLocked }" aria-label="التنقل السريع">
    <div class="mnav__group">
      <RouterLink v-for="item in start" :key="item.label" :to="item.to" class="mnav__item">
        <DoctolIcon :name="item.icon" :size="22" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </div>

    <button
      type="button"
      class="mnav__fab"
      :class="{ 'mnav__fab--active': onBooking }"
      aria-label="احجز الآن"
      @click="startBlank"
    >
      <span class="mnav__fab-ring" aria-hidden="true" />
      <DoctolIcon name="calendar-check" :size="24" :stroke="1.9" />
      <span class="mnav__fab-label">احجز الآن</span>
    </button>

    <div class="mnav__group">
      <template v-for="item in end" :key="item.label">
        <button
          v-if="item.action === 'drawer'"
          type="button"
          class="mnav__item"
          :aria-expanded="ui.drawerOpen"
          @click="ui.openDrawer()"
        >
          <DoctolIcon :name="item.icon" :size="22" />
          <span>{{ item.label }}</span>
        </button>
        <RouterLink v-else :to="item.to" class="mnav__item">
          <DoctolIcon :name="item.icon" :size="22" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </template>
    </div>
  </nav>
</template>

<style scoped>
.mnav {
  position: fixed;
  inset-block-end: 0;
  inset-inline: 0;
  z-index: var(--dt-z-mobilenav);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--dt-space-2);
  height: calc(var(--dt-mobilenav-h) + env(safe-area-inset-bottom, 0px));
  padding: 0.5rem var(--dt-space-3) calc(0.4rem + env(safe-area-inset-bottom, 0px));
  background: rgb(255 255 255 / 0.88);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-block-start: 1px solid rgb(7 59 76 / 0.07);
  box-shadow: 0 -8px 28px -20px rgb(7 59 76 / 0.5);
  transition:
    translate var(--dt-dur-3) var(--dt-ease-out),
    opacity var(--dt-dur-2) var(--dt-ease-out);
}

.mnav--hidden {
  translate: 0 110%;
  opacity: 0;
  pointer-events: none;
}

.mnav__group {
  display: flex;
  flex: 1;
  justify-content: space-around;
}

.mnav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  min-width: 56px;
  min-height: 48px;
  padding: 0.25rem 0.35rem;
  border-radius: var(--dt-radius-md);
  font-size: 0.68rem;
  font-weight: var(--dt-fw-medium);
  color: var(--dt-muted);
  transition:
    color var(--dt-dur-2) var(--dt-ease-out),
    background-color var(--dt-dur-2) var(--dt-ease-out);
}

.mnav__item :deep(svg) {
  transition: transform var(--dt-dur-3) var(--dt-ease-spring);
}

.mnav__item.router-link-active {
  color: var(--dt-teal-600);
  font-weight: var(--dt-fw-semibold);
}

.mnav__item.router-link-active :deep(svg) {
  transform: translateY(-2px) scale(1.06);
}

.mnav__item:active {
  background: var(--dt-teal-50);
}

.mnav__fab {
  position: relative;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.1rem;
  width: 66px;
  height: 66px;
  margin-block-start: -26px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-grad-primary);
  color: #fff;
  box-shadow: var(--dt-shadow-teal);
  border: 4px solid var(--dt-white);
  transition: transform var(--dt-dur-2) var(--dt-ease-spring);
}

.mnav__fab:active {
  transform: scale(0.94);
}

.mnav__fab-label {
  font-size: 0.63rem;
  font-weight: var(--dt-fw-semibold);
}

.mnav__fab-ring {
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  background: var(--dt-teal-500);
  z-index: -1;
  animation: dt-pulse-ring 2.8s var(--dt-ease-out) infinite;
}

.mnav__fab--active .mnav__fab-ring {
  animation: none;
}

@media (min-width: 1024px) {
  .mnav {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mnav__fab-ring {
    animation: none;
  }
}
</style>
