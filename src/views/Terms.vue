<script setup>
/** الشروط والأحكام — rendered by the shared legal reader. */
import LegalDocument from '@/components/legal/LegalDocument.vue'
import { termsConditions } from '@/data/legal'
</script>

<template>
  <LegalDocument :doc="termsConditions" />
</template>
