<script setup>
/**
 * Lightbox player.
 *
 * Handles the three states a clip can be in: a hosted file (`kind: 'file'`),
 * a third-party embed (`kind: 'embed'`), and not-yet-published (`src: null`),
 * which renders an honest placeholder rather than a dead player.
 *
 * Playback is stopped on close so audio never survives the modal.
 */
import { ref, watch } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import RatingStars from '@/components/common/RatingStars.vue'
import { contactInfo } from '@/data/content'

const props = defineProps({
  video: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const player = ref(null)

watch(
  () => props.video,
  (next) => {
    if (next) return
    const el = player.value
    if (el) {
      el.pause?.()
      el.currentTime = 0
    }
  },
)
</script>

<template>
  <BaseModal
    :open="Boolean(video)"
    variant="dialog"
    size="lg"
    :title="video?.title"
    :subtitle="video?.serviceName"
    @close="emit('close')"
  >
    <div v-if="video" class="vm">
      <div class="vm__stage">
        <video
          v-if="video.src && video.kind === 'file'"
          ref="player"
          class="vm__player"
          :poster="video.poster"
          controls
          autoplay
          playsinline
          preload="none"
        >
          <source :src="video.src" />
          متصفحك لا يدعم تشغيل الفيديو.
        </video>

        <iframe
          v-else-if="video.src"
          class="vm__player"
          :src="video.src"
          :title="video.title"
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
          allowfullscreen
          loading="lazy"
        />

        <!-- not published yet -->
        <div v-else class="vm__pending">
          <img :src="video.poster" :alt="video.title" class="vm__pending-bg" />
          <div class="vm__pending-inner">
            <span class="vm__pending-icon"><DoctolIcon name="image" :size="30" /></span>
            <h3>المقطع قيد الإضافة</h3>
            <p>
              نصوّر حالياً مقاطع حقيقية من مواقع العمل. لن نعرض هنا أي فيديو أو شهادة غير حقيقية —
              وسيظهر المقطع فور اعتماده.
            </p>
            <BaseButton
              size="sm"
              variant="outline"
              icon="whatsapp"
              :href="`https://wa.me/${contactInfo.whatsapp}`"
            >
              اسألنا عن نتائج مشابهة
            </BaseButton>
          </div>
        </div>
      </div>

      <div v-if="video.quote || video.customer" class="vm__quote">
        <DoctolIcon name="quote" :size="22" />
        <div>
          <p v-if="video.quote">«{{ video.quote }}»</p>
          <p v-if="video.customer" class="vm__customer">
            <RatingStars v-if="video.rating" :value="video.rating" :size="14" />
            {{ video.customer }}
          </p>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<style scoped>
.vm {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
}

.vm__stage {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: var(--dt-radius-lg);
  overflow: hidden;
  background: var(--dt-navy-900);
}

.vm__player {
  width: 100%;
  height: 100%;
  display: block;
  border: 0;
  object-fit: contain;
  background: var(--dt-navy-900);
}

/* ---------- pending state ---------- */
.vm__pending {
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}

.vm__pending-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(6px) saturate(0.7);
  opacity: 0.35;
}

.vm__pending-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dt-space-3);
  padding: var(--dt-space-6);
  text-align: center;
  color: #fff;
  max-width: 42ch;
}

.vm__pending-icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: var(--dt-radius-pill);
  background: rgb(255 255 255 / 0.14);
  border: 1px solid rgb(255 255 255 / 0.24);
}

.vm__pending-inner h3 {
  font-size: var(--dt-fs-h3);
}

.vm__pending-inner p {
  font-size: var(--dt-fs-sm);
  color: rgb(255 255 255 / 0.8);
  line-height: var(--dt-lh-snug);
}

/* ---------- quote ---------- */
.vm__quote {
  display: flex;
  align-items: flex-start;
  gap: var(--dt-space-3);
  padding: var(--dt-space-4);
  border-radius: var(--dt-radius-md);
  background: var(--dt-grad-mint);
  border: 1px solid var(--dt-teal-100);
  font-size: var(--dt-fs-sm);
  line-height: var(--dt-lh-snug);
}

.vm__quote :deep(svg) {
  flex: none;
  color: var(--dt-teal-300);
  fill: currentColor;
  stroke: none;
}

.vm__customer {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-block-start: 0.35rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}
</style>
