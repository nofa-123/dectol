<script setup>
/**
 * من نحن — the story page.
 *
 * Same sections as the live page (intro, counters, story, certifications,
 * partners, FAQ) but restructured so it reads as a narrative: who we are →
 * proof in numbers → how we got here → what we stand for → what backs it up.
 * The original page's counters sit at zero; these animate to real figures.
 */
import PageHeader from '@/components/common/PageHeader.vue'
import SectionHeader from '@/components/common/SectionHeader.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import StatCounter from '@/components/trust/StatCounter.vue'
import FaqSection from '@/components/faq/FaqSection.vue'
import FinalCta from '@/components/common/FinalCta.vue'
import LogoMark from '@/components/header/LogoMark.vue'
import {
  aboutFaqs,
  aboutIntro,
  aboutStats,
  aboutStory,
  aboutValues,
  certifications,
  partners,
} from '@/data/about'
import { useBooking } from '@/composables/useBooking'
import { vReveal } from '@/composables/useScrollAnimation'
import heroImage from '@/assets/images/hero-living-room.svg'

const { startBlank } = useBooking()
</script>

<template>
  <div>
    <PageHeader
      :eyebrow="aboutIntro.eyebrow"
      eyebrow-icon="building"
      :title="aboutIntro.title"
      :subtitle="aboutIntro.slogan"
    />

    <!-- intro + numbers -->
    <section class="section section--tight">
      <div class="container container--wide ab__intro">
        <div v-reveal="'start'" class="ab__intro-copy">
          <LogoMark size="lg" class="ab__logo" />
          <p class="ab__body">{{ aboutIntro.body }}</p>
          <div class="ab__actions">
            <BaseButton size="lg" icon-end="arrow-left" magnetic @click="startBlank">
              احجز خدمتك
            </BaseButton>
            <BaseButton variant="outline" size="lg" icon="headset" :to="{ name: 'contact' }">
              تواصل معنا
            </BaseButton>
          </div>
        </div>

        <figure v-reveal="'end'" class="ab__visual">
          <img
            :src="heroImage"
            alt="فريق دكتول أثناء تنفيذ خدمة تنظيف منزلية"
            width="1200"
            height="900"
            loading="lazy"
            decoding="async"
          />
        </figure>
      </div>

      <div class="container container--wide">
        <div v-reveal="'scale'" class="ab__stats">
          <StatCounter v-for="stat in aboutStats" :key="stat.id" :stat="stat" />
        </div>
      </div>
    </section>

    <!-- story -->
    <section class="section section--mint">
      <div class="container container--wide">
        <SectionHeader
          align="center"
          :eyebrow="aboutStory.eyebrow"
          eyebrow-icon="quote"
          :title="aboutStory.title"
          :subtitle="aboutStory.body"
        />

        <ol class="ab__timeline">
          <li
            v-for="(step, index) in aboutStory.milestones"
            :key="step.id"
            v-reveal="{ delay: index * 110 }"
            class="ab__milestone"
          >
            <span class="ab__year num">{{ step.year }}</span>
            <span class="ab__dot" aria-hidden="true" />
            <div class="ab__milestone-body">
              <h3>{{ step.title }}</h3>
              <p>{{ step.text }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- values -->
    <section class="section">
      <div class="container container--wide">
        <SectionHeader
          align="center"
          eyebrow="مبادئنا"
          eyebrow-icon="shield"
          title="على وش نشتغل كل يوم"
        />
        <ul class="ab__values">
          <li
            v-for="(value, index) in aboutValues"
            :key="value.id"
            v-reveal="{ delay: index * 90 }"
            class="ab__value"
          >
            <span class="ab__value-icon"><DoctolIcon :name="value.icon" :size="24" /></span>
            <h3>{{ value.title }}</h3>
            <p>{{ value.text }}</p>
          </li>
        </ul>
      </div>
    </section>

    <!-- certifications + partners -->
    <section class="section section--sunken">
      <div class="container container--wide">
        <SectionHeader
          align="center"
          eyebrow="اعتماداتنا"
          eyebrow-icon="check-circle"
          title="شهادات واعتمادات دكتول"
          subtitle="معايير موثّقة تقف خلف كل زيارة ننفذها."
        />

        <ul class="ab__certs">
          <li
            v-for="(cert, index) in certifications"
            :key="cert.id"
            v-reveal="{ delay: index * 90 }"
            class="ab__cert"
          >
            <span class="ab__cert-icon"><DoctolIcon :name="cert.icon" :size="26" /></span>
            <h3>{{ cert.title }}</h3>
            <p>{{ cert.text }}</p>
          </li>
        </ul>

        <div v-reveal class="ab__partners">
          <p class="ab__partners-title">شراكات نفخر بها</p>
          <ul>
            <li v-for="partner in partners" :key="partner.id">{{ partner.name }}</li>
          </ul>
        </div>
      </div>
    </section>

    <FaqSection
      :items="aboutFaqs"
      eyebrow="أسئلة قد تخطر على بالك"
      title="أسئلة قد تخطر على بالك"
      subtitle="وإذا بقي عندك سؤال، إحنا على بُعد مكالمة."
    />

    <FinalCta />
  </div>
</template>

<style scoped>
/* ---------- intro ---------- */
.ab__intro {
  display: grid;
  gap: clamp(2rem, 1rem + 4vw, 3.5rem);
  align-items: center;
  margin-block-end: var(--dt-space-10);
}

.ab__intro-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--dt-space-4);
}

.ab__logo {
  margin-block-end: var(--dt-space-2);
}

.ab__body {
  font-size: var(--dt-fs-body-lg);
  color: var(--dt-ink-soft);
  line-height: var(--dt-lh-normal);
  max-width: 52ch;
}

.ab__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--dt-space-2);
}

.ab__visual img {
  width: 100%;
  border-radius: var(--dt-radius-2xl);
  box-shadow: var(--dt-shadow-xl);
  border: 1px solid rgb(255 255 255 / 0.7);
}

.ab__stats {
  display: grid;
  gap: var(--dt-space-4);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
  padding: var(--dt-space-8) var(--dt-space-5);
  border-radius: var(--dt-radius-2xl);
  background: var(--dt-grad-deep);
  box-shadow: var(--dt-shadow-lg);
}

/* ---------- timeline ---------- */
.ab__timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-5);
  max-width: 46rem;
  margin-inline: auto;
}

.ab__timeline::before {
  content: '';
  position: absolute;
  inset-block: 1.4rem;
  inset-inline-start: 4.6rem;
  width: 2px;
  background: var(--dt-teal-200);
}

.ab__milestone {
  position: relative;
  display: grid;
  grid-template-columns: 4rem auto 1fr;
  align-items: start;
  gap: var(--dt-space-4);
}

.ab__year {
  font-weight: var(--dt-fw-bold);
  color: var(--dt-teal-700);
  padding-block-start: 0.4rem;
  text-align: center;
}

.ab__dot {
  width: 14px;
  height: 14px;
  margin-block-start: 0.65rem;
  border-radius: 50%;
  background: var(--dt-surface);
  border: 3px solid var(--dt-teal-500);
  box-shadow: 0 0 0 4px var(--dt-teal-50);
  z-index: 1;
}

.ab__milestone-body {
  padding: var(--dt-space-4) var(--dt-space-5);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface);
  border: 1px solid var(--dt-teal-100);
  box-shadow: var(--dt-shadow-sm);
}

.ab__milestone-body h3 {
  font-size: var(--dt-fs-h4);
  margin-block-end: 0.25rem;
}

.ab__milestone-body p {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
}

/* ---------- values ---------- */
.ab__values,
.ab__certs {
  display: grid;
  gap: var(--dt-space-4);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
}

.ab__value,
.ab__cert {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
  padding: var(--dt-space-6) var(--dt-space-5);
  border-radius: var(--dt-radius-xl);
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-sm);
  transition:
    transform var(--dt-dur-3) var(--dt-ease-out),
    box-shadow var(--dt-dur-3) var(--dt-ease-out),
    border-color var(--dt-dur-3) var(--dt-ease-out);
}

.ab__value:hover,
.ab__cert:hover {
  transform: translateY(-5px);
  box-shadow: var(--dt-shadow-lg);
  border-color: var(--dt-teal-200);
}

.ab__value-icon,
.ab__cert-icon {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: var(--dt-radius-lg);
  background: var(--dt-teal-50);
  color: var(--dt-teal-600);
  margin-block-end: var(--dt-space-2);
  transition:
    background-color var(--dt-dur-3) var(--dt-ease-out),
    color var(--dt-dur-3) var(--dt-ease-out);
}

.ab__value:hover .ab__value-icon,
.ab__cert:hover .ab__cert-icon {
  background: var(--dt-grad-primary);
  color: #fff;
}

.ab__value h3,
.ab__cert h3 {
  font-size: var(--dt-fs-h4);
}

.ab__value p,
.ab__cert p {
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
}

/* ---------- partners ---------- */
.ab__partners {
  margin-block-start: var(--dt-space-8);
  padding: var(--dt-space-6);
  border-radius: var(--dt-radius-xl);
  background: var(--dt-surface);
  border: 1px dashed var(--dt-line-strong);
  text-align: center;
}

.ab__partners-title {
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-muted);
  margin-block-end: var(--dt-space-4);
}

.ab__partners ul {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--dt-space-3);
}

.ab__partners li {
  padding: 0.5rem 1.2rem;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-surface-sunken);
  color: var(--dt-navy-700);
  font-weight: var(--dt-fw-semibold);
  font-size: var(--dt-fs-sm);
}

@media (min-width: 900px) {
  .ab__intro {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .ab__timeline::before {
    inset-inline-start: 3.4rem;
  }
  .ab__milestone {
    grid-template-columns: 3rem auto 1fr;
    gap: var(--dt-space-3);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ab__value,
  .ab__cert,
  .ab__value-icon,
  .ab__cert-icon {
    transition: none;
  }
  .ab__value:hover,
  .ab__cert:hover {
    transform: none;
  }
}
</style>
