<script setup>
/**
 * Application shell: header, routed view, footer and the global overlay hosts.
 * The booking route hides the footer so the wizard owns the full screen.
 */
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/header/AppHeader.vue'
import AppFooter from '@/components/footer/AppFooter.vue'
import MobileNav from '@/components/navigation/MobileNav.vue'
import MobileDrawer from '@/components/navigation/MobileDrawer.vue'
import ToastHost from '@/components/common/ToastHost.vue'

const route = useRoute()
const showFooter = computed(() => route.name !== 'booking')
</script>

<template>
  <a class="skip-link" href="#main">تخطَّ إلى المحتوى</a>

  <AppHeader />
  <MobileDrawer />

  <main id="main" class="app__main">
    <RouterView v-slot="{ Component }">
      <Transition name="route-fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>

  <AppFooter v-if="showFooter" />

  <MobileNav />
  <ToastHost />
</template>

<style scoped>
.app__main {
  /* Keeps content clear of the fixed bottom nav on phones. */
  padding-block-end: var(--dt-mobilenav-h);
  min-height: 60dvh;
}

@media (min-width: 1024px) {
  .app__main {
    padding-block-end: 0;
  }
}
</style>
