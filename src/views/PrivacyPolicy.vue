<script setup>
/** سياسة الخصوصية — rendered by the shared legal reader. */
import LegalDocument from '@/components/legal/LegalDocument.vue'
import { privacyPolicy } from '@/data/legal'
</script>

<template>
  <LegalDocument :doc="privacyPolicy" />
</template>
