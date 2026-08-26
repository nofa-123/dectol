/**
 * Routing.
 *
 * Home is bundled eagerly (it is the entry point for almost every session);
 * everything else is dynamically imported so the first paint stays lean.
 */

import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import { landingSlugs } from '@/data/serviceLandings'
import { scrollBehavior as motionScrollBehavior } from '@/utils/motion'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { title: 'دكتول | بيتك يستحق نظافة استثنائية' },
  },
  {
    path: '/services',
    name: 'services',
    component: () => import('@/views/Services.vue'),
    meta: { title: 'خدمات دكتول | تنظيف الكنب والسجاد والمزيد' },
  },
  {
    /**
     * Service landing pages. The param is constrained to the seven known
     * slugs so this route is matched before — and never shadows — the
     * `/services/:slug` catalogue route declared below it.
     * `useSeo` sets the real title per page; `meta` is the pre-render fallback.
     */
    path: `/services/:landing(${landingSlugs.join('|')})`,
    name: 'service-landing',
    component: () => import('@/views/ServiceLanding.vue'),
    meta: { title: 'خدمات دكتول' },
  },
  {
    path: '/services/:slug',
    name: 'service-details',
    component: () => import('@/views/ServiceDetails.vue'),
    meta: { title: 'تفاصيل الخدمة | دكتول' },
  },
  {
    path: '/offers',
    name: 'offers',
    component: () => import('@/views/Offers.vue'),
    meta: { title: 'عروض دكتول | خصومات على خدمات التنظيف' },
  },
  {
    path: '/packages',
    name: 'packages',
    component: () => import('@/views/Packages.vue'),
    meta: { title: 'باقات دكتول | وفّر أكثر' },
  },
  {
    path: '/booking',
    name: 'booking',
    component: () => import('@/views/Booking.vue'),
    meta: { title: 'احجز خدمتك | دكتول' },
  },
  {
    path: '/blog',
    name: 'blog',
    component: () => import('@/views/Blog.vue'),
    meta: { title: 'مدونة دكتول | نصائح التنظيف والعناية بالمنزل' },
  },
  {
    path: '/blog/:slug',
    name: 'blog-article',
    component: () => import('@/views/BlogArticle.vue'),
    meta: { title: 'مدونة دكتول' },
  },
  {
    path: '/gift-card',
    name: 'gift-card',
    component: () => import('@/views/GiftCard.vue'),
    meta: { title: 'بطاقات الهدايا | دكتول' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/About.vue'),
    meta: { title: 'من نحن | دكتول' },
  },
  {
    path: '/contact-us',
    name: 'contact',
    component: () => import('@/views/Contact.vue'),
    meta: { title: 'تواصل معنا | دكتول' },
  },
  {
    path: '/complaints',
    name: 'complaints',
    component: () => import('@/views/Complaints.vue'),
    meta: { title: 'الشكاوى والمقترحات | دكتول' },
  },
  {
    path: '/privacy-policy',
    name: 'privacy',
    component: () => import('@/views/PrivacyPolicy.vue'),
    meta: { title: 'سياسة الخصوصية | دكتول' },
  },
  {
    path: '/terms-conditions',
    name: 'terms',
    component: () => import('@/views/Terms.vue'),
    meta: { title: 'الشروط والأحكام | دكتول' },
  },
  {
    path: '/account',
    name: 'account',
    component: () => import('@/views/Account.vue'),
    meta: { title: 'حسابي | دكتول' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: 'الصفحة غير موجودة | دكتول' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      return {
        el: to.hash,
        behavior: motionScrollBehavior(),
        // Anchors must clear the fixed header.
        top: 96,
      }
    }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  if (to.meta?.title) document.title = to.meta.title
})

export default router
