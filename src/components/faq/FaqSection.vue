<script setup>
/**
 * FAQ accordion.
 *
 * Height is animated with the grid-rows 0fr → 1fr technique, which animates
 * real content height without measuring anything in JS. Only one panel is open
 * at a time; the trigger/panel pair carries proper `aria-controls` wiring.
 */
import { computed, ref, useId } from 'vue'
import SectionHeader from '@/components/common/SectionHeader.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { contactInfo } from '@/data/content'
import { useServicesStore } from '@/stores/servicesStore'
import { vReveal } from '@/composables/useScrollAnimation'

const props = defineProps({
  /** Defaults to the catalogue FAQ; pages can pass their own set. */
  items: { type: Array, default: null },
  eyebrow: { type: String, default: 'الأسئلة الشائعة' },
  title: { type: String, default: 'أجوبة سريعة على أكثر الأسئلة شيوعاً' },
  subtitle: { type: String, default: 'ما لقيت جوابك؟ فريق دكتول جاهز يرد عليك مباشرة.' },
})

const catalogue = useServicesStore()
const uid = useId()
const openId = ref('')

const faqs = computed(() => props.items ?? catalogue.faqs)

function toggle(id) {
  openId.value = openId.value === id ? '' : id
}
</script>

<template>
  <section id="faq" class="section">
    <div class="container">
      <SectionHeader
        align="center"
        :eyebrow="eyebrow"
        eyebrow-icon="info"
        :title="title"
        :subtitle="subtitle"
      />

      <ul class="faq__list">
        <li
          v-for="(item, index) in faqs"
          :key="item.id"
          v-reveal="{ delay: index * 55 }"
          class="faq__item"
          :class="{ 'faq__item--open': openId === item.id }"
        >
          <h3 class="faq__heading">
            <button
              :id="`${uid}-btn-${item.id}`"
              type="button"
              class="faq__trigger"
              :aria-expanded="openId === item.id"
              :aria-controls="`${uid}-panel-${item.id}`"
              @click="toggle(item.id)"
            >
              <span class="faq__icon"><DoctolIcon :name="item.icon" :size="19" /></span>
              <span class="faq__question">{{ item.question }}</span>
              <span class="faq__chevron">
                <DoctolIcon name="chevron-down" :size="20" />
              </span>
            </button>
          </h3>

          <div
            :id="`${uid}-panel-${item.id}`"
            class="faq__panel"
            role="region"
            :aria-labelledby="`${uid}-btn-${item.id}`"
          >
            <!-- `inert` keeps collapsed answers out of the tab order and the
                 a11y tree without breaking the height transition. -->
            <div class="faq__panel-inner" :inert="openId !== item.id">
              <p class="faq__answer">{{ item.answer }}</p>
            </div>
          </div>
        </li>
      </ul>

      <div v-reveal class="faq__help">
        <div class="faq__help-text">
          <h3 class="faq__help-title">عندك سؤال ثاني؟</h3>
          <p>كلّمنا مباشرة، نرد عليك خلال دقائق طوال أيام الأسبوع.</p>
        </div>
        <div class="faq__help-actions">
          <BaseButton :href="`tel:${contactInfo.phone}`" icon="phone" variant="outline">
            <span class="num">{{ contactInfo.phone }}</span>
          </BaseButton>
          <BaseButton :href="`https://wa.me/${contactInfo.whatsapp}`" icon="whatsapp">
            واتساب
          </BaseButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq__list {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
}

.faq__item {
  border: 1.5px solid var(--dt-line);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface);
  overflow: hidden;
  transition:
    border-color var(--dt-dur-3) var(--dt-ease-out),
    box-shadow var(--dt-dur-3) var(--dt-ease-out);
}

.faq__item:hover {
  border-color: var(--dt-teal-200);
}

.faq__item--open {
  border-color: var(--dt-teal-400);
  box-shadow: var(--dt-shadow-md);
}

.faq__heading {
  font-size: inherit;
  font-weight: inherit;
}

.faq__trigger {
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
  width: 100%;
  min-height: 68px;
  padding: var(--dt-space-4) var(--dt-space-5);
  text-align: start;
}

.faq__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex: none;
  border-radius: var(--dt-radius-sm);
  background: var(--dt-teal-50);
  color: var(--dt-teal-600);
  transition:
    background-color var(--dt-dur-3) var(--dt-ease-out),
    color var(--dt-dur-3) var(--dt-ease-out);
}

.faq__item--open .faq__icon {
  background: var(--dt-teal-500);
  color: #fff;
}

.faq__question {
  flex: 1;
  font-weight: var(--dt-fw-semibold);
  line-height: var(--dt-lh-snug);
}

.faq__chevron {
  flex: none;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: var(--dt-radius-pill);
  color: var(--dt-muted);
  transition:
    transform var(--dt-dur-3) var(--dt-ease-out),
    background-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out);
}

.faq__item--open .faq__chevron {
  transform: rotate(180deg);
  background: var(--dt-teal-50);
  color: var(--dt-teal-600);
}

/* grid-rows trick: animates to the content's natural height. */
.faq__panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--dt-dur-3) var(--dt-ease-out);
}

.faq__item--open .faq__panel {
  grid-template-rows: 1fr;
}

.faq__panel-inner {
  overflow: hidden;
}

.faq__answer {
  padding: 0 var(--dt-space-5) var(--dt-space-5) calc(var(--dt-space-5) + 52px);
  color: var(--dt-muted);
  font-size: var(--dt-fs-sm);
  line-height: var(--dt-lh-normal);
}

/* ---------- help card ---------- */
.faq__help {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--dt-space-5);
  margin-block-start: var(--dt-space-8);
  padding: var(--dt-space-6);
  border-radius: var(--dt-radius-xl);
  background: var(--dt-grad-mint);
  border: 1px solid var(--dt-teal-100);
}

.faq__help-title {
  font-size: var(--dt-fs-h4);
  margin-block-end: 0.25rem;
}

.faq__help-text p {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
}

.faq__help-actions {
  display: flex;
  gap: var(--dt-space-2);
  flex-wrap: wrap;
}

@media (max-width: 560px) {
  .faq__answer {
    padding-inline: var(--dt-space-5);
  }
  .faq__help-actions {
    width: 100%;
  }
  .faq__help-actions > * {
    flex: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .faq__panel {
    transition: none;
  }
}
</style>
