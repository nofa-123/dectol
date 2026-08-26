<script setup>
/**
 * Full-height slide-in navigation for tablet and phone.
 * Enters from the inline-start edge (the right, in RTL) so the motion matches
 * the direction the burger button sits on.
 */
import { nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import LogoMark from '@/components/header/LogoMark.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useBooking } from '@/composables/useBooking'
import { useFocusTrap } from '@/composables/useInteractions'
import { useUiStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore'
import { contactInfo } from '@/data/content'

const LINKS = [
  { label: 'الرئيسية', icon: 'home', to: { name: 'home' } },
  { label: 'الخدمات', icon: 'grid', to: { name: 'services' } },
  { label: 'العروض', icon: 'percent', to: { name: 'offers' } },
  { label: 'الباقات', icon: 'gift', to: { name: 'packages' } },
  { label: 'آراء العملاء', icon: 'star', to: { name: 'home', hash: '#reviews' } },
  { label: 'بطاقات الهدايا', icon: 'gift', to: { name: 'gift-card' } },
  { label: 'المدونة', icon: 'quote', to: { name: 'blog' } },
  { label: 'من نحن', icon: 'building', to: { name: 'about' } },
  { label: 'تواصل معنا', icon: 'headset', to: { name: 'contact' } },
  { label: 'الشكاوى والمقترحات', icon: 'quote', to: { name: 'complaints' } },
  { label: 'حسابي', icon: 'user', to: { name: 'account' } },
]

const ui = useUiStore()
const user = useUserStore()
const route = useRoute()
const { startBlank } = useBooking()

const panel = ref(null)
const { activate, deactivate } = useFocusTrap(panel, { onEscape: () => ui.closeDrawer() })

watch(
  () => ui.drawerOpen,
  async (open) => {
    if (open) {
      ui.registerOverlay()
      await nextTick()
      activate()
    } else {
      deactivate()
      ui.releaseOverlay()
    }
  },
)

watch(() => route.fullPath, () => ui.closeDrawer())

function book() {
  ui.closeDrawer()
  startBlank()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="ui.drawerOpen" class="drawer" @click.self="ui.closeDrawer()">
        <aside ref="panel" class="drawer__panel" role="dialog" aria-modal="true" aria-label="القائمة" tabindex="-1">
          <header class="drawer__head">
            <LogoMark size="sm" />
            <button type="button" class="drawer__close" aria-label="إغلاق القائمة" @click="ui.closeDrawer()">
              <DoctolIcon name="close" :size="22" />
            </button>
          </header>

          <RouterLink :to="{ name: 'account' }" class="drawer__user">
            <span class="drawer__avatar">
              <DoctolIcon name="user" :size="22" />
            </span>
            <span class="drawer__user-text">
              <strong>{{ user.isKnown ? user.profile.name : 'مرحباً بك في دكتول' }}</strong>
              <small>{{ user.isKnown ? 'عرض حسابي وحجوزاتي' : 'سجّل حجزك الأول اليوم' }}</small>
            </span>
            <DoctolIcon name="chevron-left" :size="18" class="drawer__user-chevron" />
          </RouterLink>

          <nav class="drawer__nav" aria-label="التنقل">
            <RouterLink
              v-for="(link, index) in LINKS"
              :key="link.label"
              :to="link.to"
              class="drawer__link"
              :style="{ '--i': index }"
            >
              <span class="drawer__link-icon"><DoctolIcon :name="link.icon" :size="20" /></span>
              {{ link.label }}
              <DoctolIcon name="chevron-left" :size="17" class="drawer__link-chevron" />
            </RouterLink>
          </nav>

          <div class="drawer__footer">
            <BaseButton block size="lg" icon="calendar-check" @click="book">احجز الآن</BaseButton>
            <a class="drawer__contact" :href="`tel:${contactInfo.phone}`">
              <DoctolIcon name="phone" :size="18" />
              <span class="num">{{ contactInfo.phone }}</span>
            </a>
            <p class="drawer__hours">{{ contactInfo.workingHours }}</p>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer {
  position: fixed;
  inset: 0;
  z-index: var(--dt-z-drawer);
  background: rgb(4 30 40 / 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.drawer__panel {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  width: min(340px, 88vw);
  display: flex;
  flex-direction: column;
  background: var(--dt-surface);
  box-shadow: var(--dt-shadow-xl);
  padding: var(--dt-space-5) var(--dt-space-5) calc(var(--dt-space-5) + env(safe-area-inset-bottom, 0));
  overflow-y: auto;
}

.drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-block-end: var(--dt-space-5);
}

.drawer__close {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: var(--dt-radius-pill);
  color: var(--dt-muted);
}

.drawer__close:hover {
  background: var(--dt-surface-sunken);
  color: var(--dt-ink);
}

.drawer__user {
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
  padding: var(--dt-space-4);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-grad-mint);
  border: 1px solid var(--dt-teal-100);
  margin-block-end: var(--dt-space-5);
}

.drawer__avatar {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-teal-500);
  color: #fff;
}

.drawer__user-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.drawer__user-text strong {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
}

.drawer__user-text small {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.drawer__user-chevron {
  color: var(--dt-muted-soft);
}

.drawer__nav {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  flex: 1;
}

.drawer__link {
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
  padding: 0.85rem var(--dt-space-3);
  border-radius: var(--dt-radius-md);
  font-weight: var(--dt-fw-medium);
  color: var(--dt-ink-soft);
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out);
  /* Staggered entrance driven by index */
  animation: drawer-item var(--dt-dur-4) var(--dt-ease-out) backwards;
  animation-delay: calc(120ms + var(--i) * 40ms);
}

.drawer__link:hover,
.drawer__link.router-link-active {
  background: var(--dt-teal-50);
  color: var(--dt-teal-700);
}

.drawer__link-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: var(--dt-radius-sm);
  background: var(--dt-surface-sunken);
  color: var(--dt-navy-600);
}

.drawer__link:hover .drawer__link-icon,
.drawer__link.router-link-active .drawer__link-icon {
  background: var(--dt-teal-500);
  color: #fff;
}

.drawer__link-chevron {
  margin-inline-start: auto;
  color: var(--dt-muted-soft);
}

.drawer__footer {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
  padding-block-start: var(--dt-space-5);
  margin-block-start: var(--dt-space-4);
  border-block-start: 1px solid var(--dt-line);
  text-align: center;
}

.drawer__contact {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--dt-space-2);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-teal-700);
}

.drawer__hours {
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

/* ---------- transitions ---------- */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity var(--dt-dur-3) var(--dt-ease-out);
}

.drawer-enter-active .drawer__panel,
.drawer-leave-active .drawer__panel {
  transition: translate var(--dt-dur-4) var(--dt-ease-out);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

/* RTL: the panel is docked to the right, so it exits to the right (+X). */
.drawer-enter-from .drawer__panel,
.drawer-leave-to .drawer__panel {
  translate: 100% 0;
}

@keyframes drawer-item {
  from {
    opacity: 0;
    transform: translateX(-16px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .drawer__link {
    animation: none;
  }
  .drawer-enter-from .drawer__panel,
  .drawer-leave-to .drawer__panel {
    translate: none;
  }
}
</style>
