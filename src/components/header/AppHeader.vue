<script setup>
/**
 * Sticky application header.
 *
 * Two visual states: a transparent-ish resting state over the hero, and a
 * condensed glassmorphism bar once the page scrolls. The switch happens at a
 * single threshold with hysteresis-free CSS transitions so it never flickers.
 */
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import LogoMark from '@/components/header/LogoMark.vue'
import NotificationBell from '@/components/header/NotificationBell.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useBooking } from '@/composables/useBooking'
import { useScrollPosition } from '@/composables/useResponsive'
import { useUiStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore'

const NAV = [
  { label: 'الرئيسية', to: { name: 'home' } },
  { label: 'الخدمات', to: { name: 'services' } },
  { label: 'العروض', to: { name: 'offers' } },
  { label: 'الباقات', to: { name: 'packages' } },
  { label: 'بطاقات الهدايا', to: { name: 'gift-card' } },
  { label: 'المدونة', to: { name: 'blog' } },
  { label: 'من نحن', to: { name: 'about' } },
  { label: 'تواصل معنا', to: { name: 'contact' } },
]

const route = useRoute()
const ui = useUiStore()
const user = useUserStore()
const { startBlank } = useBooking()
const { y } = useScrollPosition()

const condensed = computed(() => y.value > 24)

watch(condensed, (value) => {
  ui.headerCondensed = value
})

/** Hash links only count as active while we're actually on that page. */
function isActive(item) {
  if (item.to.hash) return route.name === 'home' && route.hash === item.to.hash
  return route.name === item.to.name
}
</script>

<template>
  <header class="header" :class="{ 'header--condensed': condensed }">
    <div class="header__inner container container--wide">
      <button
        class="header__icon-btn header__menu"
        type="button"
        aria-label="فتح القائمة"
        :aria-expanded="ui.drawerOpen"
        @click="ui.openDrawer()"
      >
        <DoctolIcon name="menu" :size="24" />
      </button>

      <RouterLink :to="{ name: 'home' }" class="header__logo" aria-label="الصفحة الرئيسية">
        <LogoMark size="sm" />
      </RouterLink>

      <nav class="header__nav" aria-label="التنقل الرئيسي">
        <RouterLink
          v-for="item in NAV"
          :key="item.label"
          :to="item.to"
          class="header__link"
          :class="{ 'header__link--active': isActive(item) }"
        >
          {{ item.label }}
          <span class="header__link-underline" aria-hidden="true" />
        </RouterLink>
      </nav>

      <div class="header__actions">
        <NotificationBell />

        <RouterLink
          :to="{ name: 'account' }"
          class="header__icon-btn header__account"
          :aria-label="user.isKnown ? `حسابي — ${user.profile.name}` : 'حسابي'"
        >
          <DoctolIcon name="user" :size="21" />
        </RouterLink>

        <BaseButton class="header__cta" size="sm" icon="calendar-check" @click="startBlank">
          احجز الآن
        </BaseButton>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  inset-block-start: 0;
  inset-inline: 0;
  z-index: var(--dt-z-header);
  height: var(--dt-header-h);
  display: flex;
  align-items: center;
  background: rgb(255 255 255 / 0.86);
  border-block-end: 1px solid transparent;
  transition:
    background-color var(--dt-dur-3) var(--dt-ease-out),
    box-shadow var(--dt-dur-3) var(--dt-ease-out),
    border-color var(--dt-dur-3) var(--dt-ease-out),
    height var(--dt-dur-3) var(--dt-ease-out),
    backdrop-filter var(--dt-dur-3) var(--dt-ease-out);
}

.header--condensed {
  background: rgb(255 255 255 / 0.72);
  backdrop-filter: blur(22px) saturate(180%);
  -webkit-backdrop-filter: blur(22px) saturate(180%);
  border-block-end-color: rgb(7 59 76 / 0.08);
  box-shadow: 0 12px 32px -22px rgb(7 59 76 / 0.35);
}

.header__inner {
  display: flex;
  align-items: center;
  gap: var(--dt-space-4);
  width: 100%;
}

.header__logo {
  display: flex;
  align-items: center;
  border-radius: var(--dt-radius-sm);
  transition: transform var(--dt-dur-2) var(--dt-ease-spring);
}

.header__logo:hover {
  transform: scale(1.03);
}

.header__nav {
  display: none;
  align-items: center;
  gap: 0.15rem;
  margin-inline-end: auto;
  margin-inline-start: var(--dt-space-6);
}

.header__link {
  position: relative;
  padding: 0.55rem 0.7rem;
  border-radius: var(--dt-radius-sm);
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-medium);
  color: var(--dt-ink-soft);
  white-space: nowrap;
  transition: color var(--dt-dur-2) var(--dt-ease-out);
}

.header__link:hover {
  color: var(--dt-teal-600);
}

.header__link-underline {
  position: absolute;
  inset-block-end: 0.15rem;
  inset-inline-start: 0.7rem;
  width: calc(100% - 1.4rem);
  height: 2px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-teal-500);
  transform: scaleX(0);
  transform-origin: inline-end;
  transition: transform var(--dt-dur-3) var(--dt-ease-out);
}

.header__link:hover .header__link-underline,
.header__link--active .header__link-underline {
  transform: scaleX(1);
}

.header__link--active {
  color: var(--dt-teal-700);
  font-weight: var(--dt-fw-semibold);
}

.header__actions {
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  margin-inline-start: auto;
}

.header__icon-btn {
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

.header__icon-btn:hover {
  background: var(--dt-teal-50);
  color: var(--dt-teal-600);
}

.header__cta {
  display: none;
}

/* ---------- mobile: centred logo, menu on the start edge ---------- */
@media (max-width: 1023px) {
  .header__logo {
    position: absolute;
    inset-inline-start: 50%;
    translate: 50% 0;
  }
  .header__account {
    display: none;
  }
}

@media (min-width: 1024px) {
  .header__menu {
    display: none;
  }
  .header__nav {
    display: flex;
  }
  .header__cta {
    display: inline-flex;
    margin-inline-start: var(--dt-space-2);
  }
}

@media (min-width: 1280px) {
  .header__link {
    font-size: var(--dt-fs-body);
    padding-inline: 0.9rem;
  }
}
</style>
