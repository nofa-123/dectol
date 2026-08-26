<script setup>
/**
 * "مكافآت دكتول" + "شارك واربح" — placeholder band from the mobile design.
 *
 * PLACEHOLDER, NOT A FEATURE. There is no rewards or referral backend, no
 * route, and no data model yet, so both cards are presentational only: the
 * buttons announce themselves as coming soon rather than linking anywhere.
 * When the real feature lands, swap the two `<button>`s for RouterLinks and
 * delete `comingSoon`.
 */
import { ref } from 'vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import { vReveal } from '@/composables/useScrollAnimation'
import wheelArt from '@/assets/mockup/prize-wheel.webp'
import { doctolApi } from '@/services/doctolApi'
import { apiData } from '@/services/apiMappers'
import { useUserStore } from '@/stores/userStore'

const notice = ref('')
const spinning = ref(false)
/** Accumulated rotation, so each spin continues from where the last stopped. */
const angle = ref(0)
const user = useUserStore()

/**
 * The wheel only turns on demand — a permanently spinning wheel reads as a
 * loading spinner and gives no feedback that the tap registered. Each press
 * adds several full turns plus a random offset, easing to a stop.
 */
async function spin() {
  if (spinning.value) return
  if (!user.profile.phone) {
    notice.value = 'سجّلي دخولك من حسابي أولاً للمشاركة'
    return
  }
  spinning.value = true
  notice.value = ''
  angle.value += 360 * 4 + Math.floor(Math.random() * 360)
  try {
    const response = await doctolApi.spin({ name: user.profile.name, phone: user.profile.phone.replace(/\D/g, '').replace(/^0/, '') })
    const data = apiData.unwrap(response, {})
    window.setTimeout(() => {
      spinning.value = false
      notice.value = data.message ?? `مبروك! ${data.reward?.name ?? data.reward_name ?? data.prize ?? 'ربحت مكافأة من دكتول'}`
    }, 3200)
  } catch (error) {
    window.setTimeout(() => {
      spinning.value = false
      notice.value = error.message
    }, 800)
  }
}

function comingSoon(what) {
  notice.value = `${what} — قريباً`
}
</script>

<template>
  <section id="rewards" v-reveal class="rw section" aria-labelledby="rw-title">
    <div class="container container--wide">
      <h2 id="rw-title" class="visually-hidden">مكافآت دكتول وبرنامج المشاركة</h2>

      <div class="rw__grid">
        <!-- Rewards -->
        <article class="rw__card rw__card--rewards">
          <div class="rw__copy">
            <h3 class="rw__title">
              <DoctolIcon name="gift" :size="18" />
              مكافآت دكتول
            </h3>
            <p class="rw__text">جرّب كل واحدة واحصل على خصومات ومكافآت رائعة</p>
            <button type="button" class="rw__cta" :disabled="spinning" @click="spin">
              {{ spinning ? 'جارٍ اللف…' : 'لف الآن' }}
              <DoctolIcon name="arrow-left" :size="16" />
            </button>
          </div>

          <img
            class="rw__wheel"
            :style="{ transform: `rotate(${angle}deg)` }"
            :src="wheelArt"
            alt=""
            width="260"
            height="236"
            loading="lazy"
            decoding="async"
          />
          <p v-if="notice.startsWith('مبروك')" class="rw__win" role="status">
            {{ notice }}
          </p>
        </article>

        <!-- Referral -->
        <article class="rw__card rw__card--share">
          <div class="rw__copy">
            <h3 class="rw__title">شارك واربح</h3>
            <p class="rw__text">شارك رابطك مع أصدقائك واحصل على 30 ريال رصيد لكل صديق يحجز</p>
            <button type="button" class="rw__cta rw__cta--solid" @click="comingSoon('شارك واربح')">
              <DoctolIcon name="share" :size="16" />
              شارك الآن
            </button>
          </div>

          <!-- After the copy in source order so RTL places it on the left,
               matching the design. -->
          <span class="rw__avatar" aria-hidden="true">
            <DoctolIcon name="users" :size="26" />
          </span>
        </article>
      </div>

      <p v-if="notice && !notice.startsWith('مبروك')" class="rw__notice" role="status">{{ notice }}</p>
    </div>
  </section>
</template>

<style scoped>
.rw__grid {
  display: grid;
  gap: var(--dt-space-4);
  grid-template-columns: 1fr;
}

.rw__card {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
  padding: var(--dt-space-4);
  border-radius: var(--dt-radius-xl);
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-sm);
  overflow: hidden;
}

.rw__copy {
  flex: 1;
  min-width: 0;
}

.rw__title {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--dt-fs-base);
  font-weight: var(--dt-fw-bold);
}

.rw__title :deep(svg) {
  color: var(--dt-teal-600);
}

.rw__text {
  margin-block-start: 0.3rem;
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
  line-height: var(--dt-lh-relaxed);
  text-wrap: pretty;
}

.rw__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-block-start: var(--dt-space-3);
  padding: 0.5rem 1rem;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-teal-600);
  color: #fff;
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  cursor: pointer;
}

.rw__cta--solid {
  background: var(--dt-navy-700);
}

.rw__wheel {
  width: 40%;
  max-width: 130px;
  flex: none;
  transform-origin: 50% 50%;
  /* Long ease-out so it coasts to a stop like a real wheel. */
  transition: transform 3.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.rw__cta:disabled {
  opacity: 0.75;
  cursor: default;
}

.rw__avatar {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  flex: none;
  align-self: flex-start;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-teal-50);
  color: var(--dt-teal-600);
}

.rw__notice {
  margin-block-start: var(--dt-space-3);
  text-align: center;
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-semibold);
  color: var(--dt-teal-700);
}

.rw__win {
  position: absolute;
  inset: 10px;
  z-index: 4;
  display: grid;
  place-items: center;
  padding: 12px;
  border-radius: var(--dt-radius-lg);
  background: rgb(255 255 255 / 0.94);
  color: var(--dt-teal-700);
  font-size: var(--dt-fs-sm);
  font-weight: var(--dt-fw-bold);
  text-align: center;
  box-shadow: var(--dt-shadow-md);
}

@media (min-width: 768px) {
  .rw__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .rw__wheel {
    transition: none;
  }
}
</style>
