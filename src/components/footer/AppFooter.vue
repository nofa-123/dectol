<script setup>
/** Site footer: navigation columns, contact, payment methods, social. */
import LogoMark from '@/components/header/LogoMark.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import PaymentMethods from '@/components/footer/PaymentMethods.vue'
import { contactInfo, socialLinks } from '@/data/content'
import { services } from '@/data/services'

/**
 * The catalogue carries 21 services. Listing them all made the footer column
 * taller than the rest of the footer combined, so surface the headline ones and
 * send everyone else to the services page.
 */
const FOOTER_SERVICE_LIMIT = 6

const topServices = [
  ...services.filter((s) => s.featured || s.popular),
  ...services.filter((s) => !s.featured && !s.popular),
].slice(0, FOOTER_SERVICE_LIMIT)

const COLUMNS = [
  {
    title: 'خدماتنا',
    links: [
      ...topServices.map((s) => ({
        label: s.name,
        to: { name: 'service-details', params: { slug: s.slug } },
      })),
      { label: 'كل الخدمات', to: { name: 'services' }, strong: true },
    ],
  },
  {
    title: 'الشركة',
    links: [
      { label: 'من نحن', to: { name: 'about' } },
      { label: 'بطاقات الهدايا', to: { name: 'gift-card' } },
      { label: 'الأسئلة الشائعة', to: { name: 'home', hash: '#faq' } },
      { label: 'المدونة', to: { name: 'blog' } },
      { label: 'لماذا دكتول', to: { name: 'home', hash: '#why' } },
    ],
  },
  {
    title: 'الدعم',
    links: [
      { label: 'تواصل معنا', to: { name: 'contact' } },
      { label: 'الشكاوى والمقترحات', to: { name: 'complaints' } },
      { label: 'سياسة الخصوصية', to: { name: 'privacy' } },
      { label: 'الشروط والأحكام', to: { name: 'terms' } },
      { label: 'ضمان 24 ساعة', to: { name: 'home', hash: '#why' } },
    ],
  },
]

const SOCIAL = socialLinks

const year = new Date().getFullYear()
</script>

<template>
  <footer id="contact" class="footer">
    <div class="container container--wide">
      <div class="footer__top">
        <div class="footer__brand">
          <LogoMark size="md" light />
          <p class="footer__tagline">{{ contactInfo.tagline }}</p>
          <ul class="footer__social" aria-label="حسابات دكتول">
            <li v-for="item in SOCIAL" :key="item.name">
              <a
                :href="item.href"
                :aria-label="item.label"
                target="_blank"
                rel="noopener noreferrer"
              >
                <DoctolIcon :name="item.name" :size="19" />
              </a>
            </li>
          </ul>
        </div>

        <nav v-for="column in COLUMNS" :key="column.title" class="footer__column">
          <h2 class="footer__column-title">{{ column.title }}</h2>
          <ul>
            <li v-for="link in column.links" :key="link.label">
              <RouterLink :to="link.to" :class="{ 'footer__link--all': link.strong }">
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </nav>

        <div class="footer__column footer__contact">
          <h2 class="footer__column-title">تواصل معنا</h2>
          <ul>
            <li>
              <a :href="`tel:${contactInfo.phone}`">
                <DoctolIcon name="phone" :size="17" />
                <span class="num">{{ contactInfo.phone }}</span>
              </a>
            </li>
            <li>
              <a :href="`https://wa.me/${contactInfo.whatsapp}`" target="_blank" rel="noopener noreferrer">
                <DoctolIcon name="whatsapp" :size="17" />
                واتساب
              </a>
            </li>
            <li>
              <a :href="`mailto:${contactInfo.email}`">
                <DoctolIcon name="mail" :size="17" />
                {{ contactInfo.email }}
              </a>
            </li>
            <li class="footer__hours">
              <DoctolIcon name="clock" :size="17" />
              {{ contactInfo.workingHours }}
            </li>
          </ul>
        </div>
      </div>

      <PaymentMethods />

      <div class="footer__bottom">
        <p>© {{ year }} دكتول لخدمات النظافة. جميع الحقوق محفوظة.</p>
        <p class="footer__vat">الرقم الضريبي <span class="num">30045678900003</span></p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--dt-grad-deep);
  color: rgb(255 255 255 / 0.82);
  padding-block: var(--dt-space-12) var(--dt-space-6);
  /* Clears the fixed mobile nav */
  padding-block-end: calc(var(--dt-space-6) + var(--dt-mobilenav-h));
}

.footer__link--all {
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-teal-200, #9fe3e0);
}

/**
 * Two columns from the smallest screen up. Stacked, the four link groups made
 * the footer taller than the page content above it; side by side they fit in
 * roughly half the height and stay comfortably tappable.
 */
.footer__top {
  display: grid;
  gap: var(--dt-space-6) var(--dt-space-5);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding-block-end: var(--dt-space-8);
}

/* The brand block (logo, tagline, socials) keeps the full width. */
.footer__brand {
  grid-column: 1 / -1;
}

.footer__brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--dt-space-4);
}

.footer__tagline {
  font-size: var(--dt-fs-sm);
  color: rgb(255 255 255 / 0.7);
  max-width: 30ch;
}

.footer__social {
  display: flex;
  gap: var(--dt-space-2);
}

.footer__social a {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: var(--dt-radius-pill);
  background: rgb(255 255 255 / 0.1);
  border: 1px solid rgb(255 255 255 / 0.14);
  color: #fff;
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-2) var(--dt-ease-spring);
}

.footer__social a:hover {
  background: var(--dt-teal-500);
  transform: translateY(-3px);
}

.footer__column-title {
  font-size: var(--dt-fs-h4);
  color: #fff;
  margin-block-end: var(--dt-space-4);
}

.footer__column ul {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
}

.footer__column a,
.footer__hours {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--dt-fs-sm);
  color: rgb(255 255 255 / 0.74);
  transition:
    color var(--dt-dur-2) var(--dt-ease-out),
    transform var(--dt-dur-2) var(--dt-ease-out);
}

.footer__column a:hover {
  color: #fff;
  transform: translateX(-4px);
}

.footer__hours {
  color: rgb(255 255 255 / 0.55);
  line-height: var(--dt-lh-snug);
}

.footer__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--dt-space-3);
  padding-block-start: var(--dt-space-5);
  border-block-start: 1px solid rgb(255 255 255 / 0.12);
  font-size: var(--dt-fs-xs);
  color: rgb(255 255 255 / 0.6);
}

@media (min-width: 640px) {
  .footer__top {
    gap: var(--dt-space-8);
  }
}

@media (min-width: 1024px) {
  .footer {
    padding-block-end: var(--dt-space-6);
  }
  .footer__top {
    grid-template-columns: 1.4fr repeat(3, 1fr) 1.2fr;
    gap: var(--dt-space-6);
  }
  .footer__brand {
    grid-column: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .footer__social a:hover,
  .footer__column a:hover {
    transform: none;
  }
}
</style>
