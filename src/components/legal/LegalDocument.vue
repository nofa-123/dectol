<script setup>
/**
 * Reader for long legal documents.
 *
 * The source pages are a single uninterrupted scroll, which makes finding a
 * specific clause hard. This adds the three things that fix that:
 *   · a sticky table of contents with scroll-spy highlighting
 *   · live filtering, so typing "إلغاء" hides everything else
 *   · per-clause anchors you can link a customer straight to
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import DoctolIcon from '@/components/common/DoctolIcon.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { contactInfo } from '@/data/content'
import { scrollBehavior } from '@/utils/motion'
import { useUiStore } from '@/stores/uiStore'

const props = defineProps({
  doc: { type: Object, required: true },
})

const ui = useUiStore()
const query = ref('')
const activeId = ref(props.doc.sections[0]?.id ?? '')
let observer = null

const normalise = (value) =>
  value
    .toLowerCase()
    // Strip Arabic diacritics and normalise alef/ya so search is forgiving.
    .replace(/[ً-ْ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')

const sectionText = (section) =>
  normalise(
    [
      section.title,
      ...section.blocks.flatMap((b) => (b.type === 'list' ? b.items : [b.text])),
    ].join(' '),
  )

const visibleSections = computed(() => {
  const q = normalise(query.value.trim())
  if (!q) return props.doc.sections
  return props.doc.sections.filter((s) => sectionText(s).includes(q))
})

/** Scroll-spy: the section nearest the top of the reading area wins. */
function observeSections() {
  observer?.disconnect()
  if (!('IntersectionObserver' in window)) return
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      if (visible[0]) activeId.value = visible[0].target.id
    },
    { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
  )
  document.querySelectorAll('[data-legal-section]').forEach((el) => observer.observe(el))
}

onMounted(observeSections)
watch(visibleSections, () => requestAnimationFrame(observeSections))
onBeforeUnmount(() => observer?.disconnect())

function goTo(id) {
  activeId.value = id
  document.getElementById(id)?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
}

async function copyLink(id) {
  const url = `${window.location.origin}${window.location.pathname}#${id}`
  try {
    await navigator.clipboard.writeText(url)
    ui.toast.success('تم نسخ الرابط', 'يمكنك مشاركته مباشرة مع هذا البند.')
  } catch {
    ui.toast.error('تعذّر نسخ الرابط')
  }
}
</script>

<template>
  <div>
    <PageHeader :eyebrow="doc.title" eyebrow-icon="list" :title="doc.title" :subtitle="doc.subtitle">
      <p class="lg__updated">
        <DoctolIcon name="refresh" :size="15" />
        آخر تحديث: {{ doc.updated }}
      </p>
    </PageHeader>

    <section class="section section--tight">
      <div class="container container--wide lg">
        <!-- table of contents -->
        <aside class="lg__toc" aria-label="محتويات الوثيقة">
          <div class="lg__toc-inner">
            <label class="lg__search">
              <DoctolIcon name="search" :size="18" />
              <input
                v-model="query"
                type="search"
                placeholder="ابحث في البنود…"
                aria-label="ابحث داخل الوثيقة"
              />
            </label>

            <p class="lg__toc-title">
              المحتويات
              <span class="num">{{ visibleSections.length }}</span>
            </p>

            <ol class="lg__toc-list">
              <li v-for="section in visibleSections" :key="section.id">
                <button
                  type="button"
                  class="lg__toc-link"
                  :class="{ 'lg__toc-link--on': activeId === section.id }"
                  @click="goTo(section.id)"
                >
                  <span v-if="section.number" class="lg__toc-num num">{{ section.number }}</span>
                  {{ section.title }}
                </button>
              </li>
            </ol>

            <div class="lg__help">
              <p>عندك سؤال عن بند معيّن؟</p>
              <BaseButton size="sm" variant="outline" icon="whatsapp" :href="`https://wa.me/${contactInfo.whatsapp}`">
                كلّم الدعم
              </BaseButton>
            </div>
          </div>
        </aside>

        <!-- document -->
        <article class="lg__doc">
          <p class="lg__intro">{{ doc.intro }}</p>

          <p v-if="query && !visibleSections.length" class="lg__empty">
            <DoctolIcon name="search" :size="32" />
            ما لقينا بنداً يطابق «{{ query }}».
          </p>

          <section
            v-for="section in visibleSections"
            :id="section.id"
            :key="section.id"
            data-legal-section
            class="lg__section"
          >
            <header class="lg__section-head">
              <span class="lg__section-icon"><DoctolIcon :name="section.icon" :size="20" /></span>
              <h2 class="lg__section-title">
                <span v-if="section.number" class="lg__section-num num">{{ section.number }}</span>
                {{ section.title }}
              </h2>
              <button
                type="button"
                class="lg__anchor"
                :aria-label="`نسخ رابط بند ${section.title}`"
                @click="copyLink(section.id)"
              >
                <DoctolIcon name="share" :size="16" />
              </button>
            </header>

            <template v-for="(block, index) in section.blocks" :key="index">
              <p v-if="block.type === 'p'" class="lg__p">{{ block.text }}</p>

              <ul v-else-if="block.type === 'list'" class="lg__list">
                <li v-for="item in block.items" :key="item">
                  <DoctolIcon name="check" :size="15" :stroke="2.6" />
                  <span>{{ item }}</span>
                </li>
              </ul>

              <p v-else class="lg__note">
                <DoctolIcon name="info" :size="18" />
                <span>{{ block.text }}</span>
              </p>
            </template>
          </section>

          <footer class="lg__foot">
            <DoctolIcon name="shield" :size="20" />
            <p>
              هذه الوثيقة تخضع لأنظمة المملكة العربية السعودية. لأي استفسار تواصل معنا على
              <a :href="`tel:${contactInfo.phone}`" class="num">{{ contactInfo.phone }}</a>
              أو
              <a :href="`mailto:${contactInfo.email}`">{{ contactInfo.email }}</a>
            </p>
          </footer>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.lg__updated {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.85rem;
  border-radius: var(--dt-radius-pill);
  background: var(--dt-surface);
  border: 1px solid var(--dt-teal-100);
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

.lg {
  display: grid;
  gap: var(--dt-space-6);
  align-items: start;
}

/* ---------- table of contents ---------- */
.lg__toc-inner {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-4);
  padding: var(--dt-space-5);
  border-radius: var(--dt-radius-xl);
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  box-shadow: var(--dt-shadow-sm);
}

.lg__search {
  display: flex;
  align-items: center;
  gap: var(--dt-space-2);
  padding-inline-start: var(--dt-space-3);
  border: 1.5px solid var(--dt-line);
  border-radius: var(--dt-radius-md);
  background: var(--dt-surface-sunken);
  color: var(--dt-muted);
}

.lg__search:focus-within {
  border-color: var(--dt-teal-400);
  background: var(--dt-surface);
  box-shadow: 0 0 0 4px var(--dt-focus-ring);
}

.lg__search input {
  flex: 1;
  min-width: 0;
  min-height: 46px;
  border: 0;
  outline: none;
  background: none;
  color: var(--dt-ink);
  font-size: var(--dt-fs-sm);
}

.lg__toc-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--dt-fs-xs);
  font-weight: var(--dt-fw-bold);
  color: var(--dt-muted);
  letter-spacing: 0.04em;
}

.lg__toc-title span {
  color: var(--dt-teal-600);
}

.lg__toc-list {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  max-height: 46vh;
  overflow-y: auto;
}

.lg__toc-link {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  width: 100%;
  padding: 0.55rem 0.7rem;
  text-align: start;
  border-radius: var(--dt-radius-sm);
  font-size: var(--dt-fs-sm);
  line-height: var(--dt-lh-snug);
  color: var(--dt-ink-soft);
  border-inline-start: 2px solid transparent;
  transition:
    background-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out),
    border-color var(--dt-dur-2) var(--dt-ease-out);
}

.lg__toc-link:hover {
  background: var(--dt-teal-50);
  color: var(--dt-teal-700);
}

.lg__toc-link--on {
  background: var(--dt-teal-50);
  border-inline-start-color: var(--dt-teal-500);
  color: var(--dt-teal-800);
  font-weight: var(--dt-fw-semibold);
}

.lg__toc-num {
  color: var(--dt-teal-500);
  font-weight: var(--dt-fw-bold);
  flex: none;
}

.lg__help {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--dt-space-2);
  padding-block-start: var(--dt-space-4);
  border-block-start: 1px dashed var(--dt-line);
  font-size: var(--dt-fs-xs);
  color: var(--dt-muted);
}

/* ---------- document ---------- */
.lg__doc {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-5);
}

.lg__intro {
  padding: var(--dt-space-5);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-grad-mint);
  border: 1px solid var(--dt-teal-100);
  color: var(--dt-ink-soft);
  line-height: var(--dt-lh-normal);
}

.lg__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dt-space-3);
  padding: var(--dt-space-16) var(--dt-space-4);
  text-align: center;
  color: var(--dt-muted);
}

.lg__empty :deep(svg) {
  color: var(--dt-line-strong);
}

.lg__section {
  padding: var(--dt-space-5);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface);
  border: 1px solid var(--dt-line);
  scroll-margin-top: calc(var(--dt-header-h) + 1.5rem);
}

.lg__section-head {
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
  margin-block-end: var(--dt-space-4);
  padding-block-end: var(--dt-space-3);
  border-block-end: 1px solid var(--dt-line);
}

.lg__section-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  flex: none;
  border-radius: var(--dt-radius-sm);
  background: var(--dt-teal-50);
  color: var(--dt-teal-600);
}

.lg__section-title {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  font-size: var(--dt-fs-h4);
  font-weight: var(--dt-fw-bold);
  line-height: var(--dt-lh-snug);
}

.lg__section-num {
  color: var(--dt-teal-500);
}

.lg__anchor {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex: none;
  border-radius: var(--dt-radius-pill);
  color: var(--dt-muted-soft);
  opacity: 0;
  transition:
    opacity var(--dt-dur-2) var(--dt-ease-out),
    background-color var(--dt-dur-2) var(--dt-ease-out),
    color var(--dt-dur-2) var(--dt-ease-out);
}

.lg__section:hover .lg__anchor,
.lg__anchor:focus-visible {
  opacity: 1;
}

.lg__anchor:hover {
  background: var(--dt-teal-50);
  color: var(--dt-teal-600);
}

.lg__p {
  color: var(--dt-ink-soft);
  line-height: var(--dt-lh-normal);
}

.lg__p + .lg__p {
  margin-block-start: var(--dt-space-3);
}

.lg__list {
  display: flex;
  flex-direction: column;
  gap: var(--dt-space-3);
}

.lg__p + .lg__list,
.lg__list + .lg__p {
  margin-block-start: var(--dt-space-3);
}

.lg__list li {
  display: flex;
  align-items: flex-start;
  gap: var(--dt-space-3);
  color: var(--dt-ink-soft);
  line-height: var(--dt-lh-normal);
}

.lg__list :deep(svg) {
  flex: none;
  margin-block-start: 0.42em;
  color: var(--dt-teal-500);
}

.lg__note {
  display: flex;
  align-items: flex-start;
  gap: var(--dt-space-3);
  margin-block-start: var(--dt-space-4);
  padding: var(--dt-space-4);
  border-radius: var(--dt-radius-md);
  background: var(--dt-warning-soft);
  color: var(--dt-ink-soft);
  font-size: var(--dt-fs-sm);
  line-height: var(--dt-lh-normal);
}

.lg__note :deep(svg) {
  flex: none;
  margin-block-start: 0.15rem;
  color: var(--dt-warning);
}

.lg__foot {
  display: flex;
  align-items: center;
  gap: var(--dt-space-3);
  padding: var(--dt-space-5);
  border-radius: var(--dt-radius-lg);
  background: var(--dt-surface-sunken);
  font-size: var(--dt-fs-sm);
  color: var(--dt-muted);
  line-height: var(--dt-lh-snug);
}

.lg__foot :deep(svg) {
  flex: none;
  color: var(--dt-teal-500);
}

.lg__foot a {
  color: var(--dt-teal-700);
  font-weight: var(--dt-fw-semibold);
}

@media (min-width: 1024px) {
  .lg {
    grid-template-columns: 300px minmax(0, 1fr);
  }
  .lg__toc-inner {
    position: sticky;
    top: calc(var(--dt-header-h) + var(--dt-space-5));
  }
}
</style>
