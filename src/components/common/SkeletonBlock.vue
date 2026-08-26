<script setup>
/** Shimmer placeholder used while catalogue data resolves. */
defineProps({
  height: { type: String, default: '1rem' },
  width: { type: String, default: '100%' },
  radius: { type: String, default: 'var(--dt-radius-sm)' },
  lines: { type: Number, default: 1 },
})
</script>

<template>
  <div v-if="lines === 1" class="skeleton" :style="{ height, width, borderRadius: radius }" />
  <div v-else class="skeleton-stack">
    <div
      v-for="i in lines"
      :key="i"
      class="skeleton"
      :style="{
        height,
        width: i === lines ? '62%' : width,
        borderRadius: radius,
      }"
    />
  </div>
</template>

<style scoped>
.skeleton-stack {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-2);
  width: 100%;
}
</style>
