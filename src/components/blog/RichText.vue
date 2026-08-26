<script setup>
/**
 * سطر نصّي يدعم التشديد بصيغة `**نص**` فقط.
 *
 * المقالات مكتوبة في ملف بيانات لا في قوالب، وبعض النقاط تحتاج كلمة بارزة في
 * أولها. إدخال HTML خام من البيانات عبر `v-html` يفتح باباً لا داعي له، فيُقسَّم
 * النص هنا إلى أجزاء ويُبنى بـ Vue — لا حقن، ولا اعتماد على مكتبة Markdown كاملة
 * من أجل صيغة واحدة.
 */
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  tag: { type: String, default: 'span' },
})

const parts = computed(() =>
  props.text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((chunk, index) =>
      chunk.startsWith('**') && chunk.endsWith('**')
        ? { key: index, strong: true, value: chunk.slice(2, -2) }
        : { key: index, strong: false, value: chunk },
    ),
)
</script>

<template>
  <component :is="tag">
    <template v-for="part in parts" :key="part.key">
      <strong v-if="part.strong">{{ part.value }}</strong>
      <template v-else>{{ part.value }}</template>
    </template>
  </component>
</template>

<style scoped>
strong {
  font-weight: var(--dt-fw-bold);
  color: var(--dt-navy-700);
}
</style>
