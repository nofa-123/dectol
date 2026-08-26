<script setup>
/**
 * Shortcut rail under the hero, per the mobile design.
 *
 * Two entries — "العب واربح" and "مكافآتي" — have no page yet, so they scroll
 * to the placeholder rewards band on the home page instead of dead-linking.
 * Give them real routes when the rewards feature ships.
 */
import DoctolIcon from '@/components/common/DoctolIcon.vue'

const LINKS = [
  { label: 'الأكثر طلباً', icon: 'star', to: { name: 'services' } },
  { label: 'العروض', icon: 'percent', to: { name: 'offers' }, badge: 'جديد' },
  { label: 'الباقات', icon: 'gift', to: { name: 'packages' } },
  { label: 'العب واربح', icon: 'refresh', hash: '#rewards' },
  { label: 'مكافآتي', icon: 'heart', hash: '#rewards' },
]

function scrollToRewards() {
  document.getElementById('rewards')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <nav class="ql" aria-label="اختصارات">
    <div class="container container--wide">
      <ul class="ql__rail">
        <li v-for="link in LINKS" :key="link.label" class="ql__item">
          <component
            :is="link.to ? 'RouterLink' : 'button'"
            v-bind="link.to ? { to: link.to } : { type: 'button' }"
            class="ql__link"
            @click="!link.to && scrollToRewards()"
          >
            <span class="ql__icon">
              <DoctolIcon :name="link.icon" :size="24" />
              <span v-if="link.badge" class="ql__badge">{{ link.badge }}</span>
            </span>
            <span class="ql__label">{{ link.label }}</span>
          </component>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.ql {
  margin-block-start: calc(var(--dt-space-5) * -1);
  position: relative;
  z-index: 3;
}

.ql__rail {
  display: flex;
  align-items: stretch;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: var(--dt-space-3) 0;
  border-radius: var(--dt-radius-xl);
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-md);
  /* Five shortcuts don't fit a phone — swipe, with hairlines between them. */
  overflow-x: auto;
  scrollbar-width: none;
  overscroll-behavior-x: contain;
}

.ql__rail::-webkit-scrollbar {
  display: none;
}

.ql__item {
  flex: 0 0 auto;
  min-width: 0;
}

.ql__item + .ql__item {
  border-inline-start: 1px solid var(--dt-line);
}

.ql__link {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  width: 84px;
  height: 100%;
  padding-inline: 0.35rem;
  color: var(--dt-ink);
  cursor: pointer;
}

.ql__icon {
  position: relative;
  color: var(--dt-teal-600);
  line-height: 0;
}

.ql__badge {
  position: absolute;
  inset-block-start: -8px;
  inset-inline-start: -14px;
  padding: 0.1rem 0.35rem;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-danger, #e5484d);
  color: #fff;
  font-size: 0.58rem;
  font-weight: var(--dt-fw-bold);
  line-height: 1.4;
}

.ql__label {
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-semibold);
  text-align: center;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .ql__rail {
    justify-content: center;
    overflow-x: visible;
  }
  .ql__link {
    width: 118px;
  }
}
</style>
