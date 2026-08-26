<script setup>
/**
 * تواصل معنا — mirrors the structure of doctol.com.sa/contact-us:
 * three contact channels, then the branch network with a map.
 *
 * The channels are real links (tel: / mailto: / maps) rather than plain text,
 * because on a phone the whole point of this page is one tap to reach someone.
 */
import { computed } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import FinalCta from '@/components/common/FinalCta.vue'
import {
  branches,
  contactChannels,
  contactInfo,
  mapCentre,
  socialLinks,
} from '@/data/content'
import { vReveal } from '@/composables/useScrollAnimation'

/** Keyless Google Maps embed — no API key, no script, just an iframe. */
const mapSrc = computed(
  () =>
    `https://maps.google.com/maps?q=${mapCentre.lat},${mapCentre.lng}&z=${mapCentre.zoom}&hl=ar&output=embed`,
)

const mapLink = computed(
  () => `https://maps.google.com/?q=${mapCentre.lat},${mapCentre.lng}`,
)
</script>

<template>
  <div>
    <PageHeader
      eyebrow="تواصل معنا"
      eyebrow-icon="headset"
      title="تواصل معنا"
      subtitle="يسعدنا نسمع منك ونخدمك في أي وقت"
    />

    <!-- channels -->
    <section class="section section--tight">
      <div class="container container--wide">
        <ul class="ch__grid">
          <li v-for="(channel, index) in contactChannels" :key="channel.id" v-reveal="{ delay: index * 90 }">
            <a
              class="ch"
              :href="channel.href"
              :target="channel.external ? '_blank' : undefined"
              :rel="channel.external ? 'noopener noreferrer' : undefined"
            >
              <span class="ch__icon"><DoctolIcon :name="channel.icon" :size="26" /></span>
              <h2 class="ch__title">{{ channel.title }}</h2>
              <p class="ch__hint">{{ channel.hint }}</p>
              <p class="ch__value" :class="{ num: channel.numeric }">{{ channel.display }}</p>
              <span class="ch__action">
                {{ channel.action }}
                <DoctolIcon name="arrow-left" :size="16" />
              </span>
            </a>
          </li>
        </ul>
      </div>
    </section>

    <!-- branches -->
    <section class="section section--sunken">
      <div class="container container--wide">
        <header class="br__head">
          <p class="br__kicker">نخدمك من أكثر من موقع لنوصل لك أسرع</p>
          <h2 class="br__title">
            <DoctolIcon name="pin" :size="22" />
            فروعنا
          </h2>
        </header>

        <div class="br__layout">
          <div v-reveal="'scale'" class="br__map">
            <iframe
              :src="mapSrc"
              title="خريطة مواقع فروع دكتول"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              allowfullscreen
            />
            <a class="br__map-link" :href="mapLink" target="_blank" rel="noopener noreferrer">
              <DoctolIcon name="pin" :size="16" />
              افتح في خرائط جوجل
            </a>
          </div>

          <ul class="br__list">
            <li v-for="(branch, index) in branches" :key="branch.id" v-reveal="{ delay: index * 90 }">
              <article class="br">
                <span class="br__badge"><DoctolIcon name="building" :size="22" /></span>
                <div class="br__body">
                  <h3 class="br__name">{{ branch.name }}</h3>
                  <p class="br__meta">
                    <DoctolIcon name="clock" :size="15" />
                    {{ branch.hours }}
                  </p>
                  <p class="br__meta">
                    <DoctolIcon name="pin" :size="15" />
                    {{ branch.address }}
                  </p>
                </div>
                <a
                  class="br__go"
                  :href="`https://maps.google.com/?q=${branch.lat},${branch.lng}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  :aria-label="`اتجاهات إلى ${branch.name}`"
                >
                  <DoctolIcon name="arrow-left" :size="18" />
                </a>
              </article>
            </li>

            <li v-reveal="{ delay: 140 }">
              <div class="br__quick">
                <p class="br__quick-title">تحتاج رد سريع؟</p>
                <div class="br__quick-actions">
                  <BaseButton :href="`tel:${contactInfo.phone}`" icon="phone" variant="outline">
                    <span class="num">{{ contactInfo.phone }}</span>
                  </BaseButton>
                  <BaseButton :href="`https://wa.me/${contactInfo.whatsapp}`" icon="whatsapp">
                    واتساب
                  </BaseButton>
                </div>
                <ul class="br__social" aria-label="حسابات دكتول">
                  <li v-for="item in socialLinks" :key="item.name">
                    <a
                      :href="item.href"
                      :aria-label="item.label"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <DoctolIcon :name="item.name" :size="18" />
                    </a>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <FinalCta />
  </div>
</template>

<style scoped>
/* ---------- channels ---------- */
.ch__grid {
  display: grid;
  gap: var(--dt-space-5);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
}

.ch__grid > li {
  min-width: 0;
}

.ch {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dt-space-2);
  height: 100%;
  padding: var(--dt-space-8) var(--dt-space-5) var(--dt-space-6);
  text-align: center;
  border: 1px solid var(--dt-line);
  border-radius: var(--dt-radius-xl);
  background: var(--dt-surface);
  box-shadow: var(--dt-shadow-sm);
  transition:
    transform var(--dt-dur-3) var(--dt-ease-out),
    box-shadow var(--dt-dur-3) var(--dt-ease-out),
    border-color var(--dt-dur-3) var(--dt-ease-out);
}

.ch:hover {
  transform: translateY(-6px);
  box-shadow: var(--dt-shadow-lg);
  border-color: var(--dt-teal-200);
}

.ch__icon {
  display: grid;
  place-items: center;
  width: 68px;
  height: 68px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-teal-50);
  color: var(--dt-teal-600);
  margin-block-end: var(--dt-space-2);
  transition:
    background-color var(--dt-dur-3) var(--dt-ease-out),
    color var(--dt-dur-3) var(--dt-ease-out),
    transform var(--dt-dur-3) var(--dt-ease-spring);
}

.ch:hover .ch__icon {
  background: var(--dt-grad-primary);
  color: #fff;
  transform: scale(1.06);
}

.ch__title {
  font-size: var(--dt-fs-h3);
}

.ch__hint {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
}

.ch__value {
  font-size: var(--dt-fs-body-lg);
  font-weight: var(--dt-fw-bold);
  color: var(--dt-teal-700);
  word-break: break-word;
  margin-block-start: var(--dt-space-2);
}

.ch__action {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-block-start: auto;
  padding-block-start: var(--dt-space-4);
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-teal-600);
}

.ch__action :deep(svg) {
  transition: transform var(--dt-dur-2) var(--dt-ease-out);
}

.ch:hover .ch__action :deep(svg) {
  transform: translateX(-4px);
}

/* ---------- branches ---------- */
.br__head {
  text-align: center;
  margin-block-end: var(--dt-space-8);
}

.br__kicker {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
}

.br__title {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--dt-fs-h2);
  margin-block-start: 0.35rem;
}

.br__title :deep(svg) {
  color: var(--dt-teal-500);
}

.br__layout {
  display: grid;
  gap: var(--dt-space-5);
  align-items: start;
}

.br__map {
  position: relative;
  border-radius: var(--dt-radius-xl);
  overflow: hidden;
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-md);
  background: var(--dt-teal-50);
  min-height: 320px;
}

.br__map iframe {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 320px;
  border: 0;
}

.br__map-link {
  position: absolute;
  inset-block-end: var(--dt-space-4);
  inset-inline-start: var(--dt-space-4);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.9rem;
  border-radius: var(--dt-radius-pill);
  background: rgb(255 255 255 / 0.94);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: var(--dt-shadow-md);
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-teal-700);
}

.br__map-link:hover {
  background: #fff;
}

.br__list {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
}

.br {
  display: flex;
  align-items: center;
  gap: var(--dt-space-4);
  padding: var(--dt-space-5);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-sm);
  transition:
    border-color var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-2) var(--dt-ease-out);
}

.br:hover {
  border-color: var(--dt-teal-300);
  transform: translateY(-2px);
}

.br__badge {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  flex: none;
  border-radius: var(--dt-radius-md);
  background: var(--dt-teal-50);
  color: var(--dt-teal-600);
}

.br__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.br__name {
  font-size: var(--dt-fs-h4);
  font-weight: var(--dt-fw-bold);
}

.br__meta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
}

.br__meta :deep(svg) {
  color: var(--dt-teal-500);
  flex: none;
}

.br__go {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: none;
  border-radius: var(--dt-radius-pill);
  border: 1px solid var(--dt-line);
  color: var(--dt-teal-600);
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out);
}

.br__go:hover {
  background: var(--dt-teal-500);
  color: #fff;
}

/* ---------- quick contact ---------- */
.br__quick {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
  padding: var(--dt-space-5);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-grad-mint);
  border: 1px solid var(--dt-teal-100);
}

.br__quick-title {
  font-size: var(--dt-fs-h4);
  font-weight: var(--dt-fw-bold);
}

.br__quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dt-space-2);
}

.br__social {
  display: flex;
  gap: var(--dt-space-2);
  padding-block-start: var(--dt-space-3);
  border-block-start: 1px dashed var(--dt-teal-200);
}

.br__social a {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-surface);
  border: 1px solid var(--dt-teal-100);
  color: var(--dt-teal-700);
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-2) var(--dt-ease-spring);
}

.br__social a:hover {
  background: var(--dt-teal-500);
  color: #fff;
  transform: translateY(-3px);
}

@media (min-width: 900px) {
  .br__layout {
    grid-template-columns: 1.35fr 1fr;
  }
  .br__map,
  .br__map iframe {
    min-height: 420px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ch,
  .ch__icon,
  .br,
  .br__social a {
    transition: none;
  }
  .ch:hover,
  .br:hover,
  .br__social a:hover {
    transform: none;
  }
  .ch:hover .ch__icon {
    transform: none;
  }
}
</style>
