<script setup>
/**
 * Mobile sticky conversion bar.
 *
 * Deliberately not shown until the hero has scrolled away — the hero already
 * carries the same CTA, and a bar that appears immediately just covers content.
 * Hides while an overlay owns the screen, and sits above the app's bottom nav.
 */
import { computed } from 'vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { formatPrice } from '@/utils/format'
import { contactInfo } from '@/data/content'
import { useScrollPosition } from '@/composables/useResponsive'
import { useUiStore } from '@/stores/uiStore'

defineProps({
  landing: { type: Object, required: true },
})

defineEmits(['book'])

const ui = useUiStore()
const { y } = useScrollPosition()

const visible = computed(() => y.value > 520 && !ui.isLocked)
</script>

<template>
  <Transition name="sbb">
    <div v-if="visible" class="sbb">
      <a class="sbb__call" :href="`tel:${contactInfo.phone}`" aria-label="اتصل بنا">
        <DoctolIcon name="phone" :size="20" />
        <span>اتصل بنا</span>
      </a>

      <button type="button" class="sbb__book" @click="$emit('book')">
        <span class="sbb__book-label">احجز الآن</span>
        <span v-if="landing.priceFrom" class="sbb__book-price money">
          من {{ formatPrice(landing.priceFrom) }}
        </span>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.sbb {
  position: fixed;
  inset-inline: 0;
  inset-block-end: var(--dt-mobilenav-h);
  z-index: 45;
  display: flex;
  align-items: stretch;
  gap: var(--dt-space-2);
  padding: var(--dt-space-3) var(--dt-gutter) calc(var(--dt-space-3) + env(safe-area-inset-bottom, 0px));
  background: rgb(255 255 255 / 0.94);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border-block-start: 1px solid var(--dt-line);
  box-shadow: 0 -10px 30px -22px rgb(7 59 76 / 0.6);
}

.sbb__call {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.1rem;
  flex: none;
  min-width: 86px;
  padding-inline: var(--dt-space-3);
  border-radius: var(--dt-radius-md);
  border: 1.5px solid var(--sl-accent-line, var(--dt-line));
  color: var(--sl-accent-deep, var(--dt-teal-700));
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-semibold);
}

.sbb__call:active {
  background: var(--sl-accent-soft, var(--dt-teal-50));
}

.sbb__book {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.05rem;
  flex: 1;
  min-height: 56px;
  border-radius: var(--dt-radius-md);
  background: var(--dt-grad-primary);
  color: #fff;
  box-shadow: var(--dt-shadow-teal);
  transition: transform var(--dt-dur-1) var(--dt-ease-out);
}

.sbb__book:active {
  transform: scale(0.98);
}

.sbb__book-label {
  font-size: var(--dt-fs-body);
  font-weight: var(--dt-fw-bold);
}

.sbb__book-price {
  font-size: var(--dt-fs-xs);
  opacity: 0.85;
}

.sbb-enter-active,
.sbb-leave-active {
  transition:
    translate var(--dt-dur-3) var(--dt-ease-out),
    opacity var(--dt-dur-2) var(--dt-ease-out);
}

.sbb-enter-from,
.sbb-leave-to {
  translate: 0 110%;
  opacity: 0;
}

/* Desktop keeps the header CTA; no bar needed. */
@media (min-width: 1024px) {
  .sbb {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sbb-enter-active,
  .sbb-leave-active {
    transition: opacity var(--dt-dur-2) linear;
  }
  .sbb-enter-from,
  .sbb-leave-to {
    translate: none;
  }
}
</style>
