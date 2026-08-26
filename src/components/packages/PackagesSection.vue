<script setup>
/** Packages grid with single-open expansion. */
import { ref } from 'vue'
import SectionHeader from '@/components/common/SectionHeader.vue'
import PackageCard from '@/components/packages/PackageCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useServicesStore } from '@/stores/servicesStore'
import { vReveal } from '@/composables/useScrollAnimation'

defineProps({
  showAction: { type: Boolean, default: true },
})

const catalogue = useServicesStore()
const expandedId = ref('')

function toggle(id) {
  expandedId.value = expandedId.value === id ? '' : id
}
</script>

<template>
  <section id="packages" class="section">
    <div class="container container--wide">
      <SectionHeader
        eyebrow="وفّر أكثر"
        eyebrow-icon="gift"
        title="باقات دكتول"
        subtitle="اجمع أكثر من خدمة في زيارة واحدة، وادفع أقل مما لو حجزتها منفصلة."
      >
        <template v-if="showAction" #action>
          <BaseButton variant="outline" icon-end="arrow-left" :to="{ name: 'packages' }">
            كل الباقات
          </BaseButton>
        </template>
      </SectionHeader>

      <ul class="packages__grid">
        <li
          v-for="(pkg, index) in catalogue.packages"
          :key="pkg.id"
          v-reveal="{ delay: index * 90 }"
        >
          <PackageCard :pkg="pkg" :expanded="expandedId === pkg.id" @toggle="toggle" />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.packages__grid {
  display: grid;
  gap: var(--dt-space-5);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
  align-items: stretch;
}

.packages__grid > li {
  min-width: 0;
}
</style>
