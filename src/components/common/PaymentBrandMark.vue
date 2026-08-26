<script setup>
/**
 * Payment brand wordmarks, drawn as inline SVG on a shared 68×24 grid.
 *
 * Inline rather than bitmap logos: no extra requests, sharp at any size, and
 * one component feeding both the checkout step and the footer strip so the two
 * can never drift apart again.
 *
 * These are brand-accurate *renditions* (correct colours, correct lockup) — not
 * the licensed originals. Before going live, drop the official SVGs from each
 * provider's brand kit into `src/assets/payments/` and swap `MARKS` for imports;
 * mada, Apple Pay, stc pay, Tabby and Tamara all require their own artwork under
 * their brand guidelines.
 */
const props = defineProps({
  name: { type: String, required: true },
  /** Rendered height in px; width follows the 68:24 aspect ratio. */
  size: { type: [Number, String], default: 24 },
  /** Accessible name. Falls back to the brand's own label. */
  label: { type: String, default: '' },
})

const LABELS = {
  mada: 'مدى',
  applepay: 'Apple Pay',
  stcpay: 'stc pay',
  tabby: 'تابي',
  tamara: 'تمارا',
  visa: 'Visa',
  mastercard: 'Mastercard',
  cash: 'الدفع نقداً',
}

const MARKS = {
  /* mada — Saudi national debit scheme. Navy wordmark, green + blue chevrons. */
  mada: `
    <path d="M6.4 6.6 10.9 12l-4.5 5.4H3.1L7.6 12 3.1 6.6Z" fill="#84C441"/>
    <path d="M12.2 6.6 16.7 12l-4.5 5.4H8.9L13.4 12 8.9 6.6Z" fill="#1A5EA8"/>
    <text x="44" y="16.6" text-anchor="middle" textLength="42" lengthAdjust="spacingAndGlyphs"
          font-family="Helvetica, Arial, sans-serif" font-size="12.5" font-weight="700"
          fill="#1B2A3B">mada</text>
  `,

  /* Apple Pay — black lockup: apple glyph + "Pay". */
  applepay: `
    <g fill="#000">
      <path d="M17.9 8.5c-.6.7-1.5 1.2-2.4 1.1-.1-.9.3-1.9.9-2.5.6-.7 1.6-1.1 2.4-1.2.1.9-.3 1.9-.9 2.6Zm.9 1.4c-1.3-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.2 2-1.4 2.4-.4 5.9 1 7.8.7.9 1.5 2 2.5 1.9 1 0 1.4-.6 2.6-.6s1.5.6 2.6.6c1.1 0 1.8-.9 2.4-1.9.5-.8.8-1.5 1-1.6-1.5-.6-2.1-1.7-2.1-3.1 0-1.9 1.5-2.9 1.6-3-.9-1.3-2.3-1.5-2.8-1.6Z"
            transform="translate(9 -3.2) scale(.86)"/>
      <text x="45" y="16.8" text-anchor="middle" textLength="30" lengthAdjust="spacingAndGlyphs"
            font-family="Helvetica, Arial, sans-serif" font-size="13" font-weight="500">Pay</text>
    </g>
  `,

  /* stc pay — stc purple lockup, lowercase, as in the brand guide. */
  stcpay: `
    <text x="34" y="17" text-anchor="middle" textLength="50" lengthAdjust="spacingAndGlyphs"
          font-family="Helvetica, Arial, sans-serif" font-size="13.5" fill="#4F008C">
      <tspan font-weight="700">stc</tspan><tspan dx="3.5">pay</tspan>
    </text>
  `,

  /* Tabby — black wordmark on the brand mint pill. */
  tabby: `
    <rect x="0" y="1" width="68" height="22" rx="11" fill="#3EEBC5"/>
    <text x="34" y="16.4" text-anchor="middle" textLength="36" lengthAdjust="spacingAndGlyphs"
          font-family="Helvetica, Arial, sans-serif" font-size="12.5" font-weight="700"
          fill="#12242B">tabby</text>
  `,

  /* Tamara — wordmark in the brand's magenta→violet gradient. */
  tamara: `
    <defs>
      <linearGradient id="dt-pm-tamara" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#F45C8C"/>
        <stop offset="1" stop-color="#7B5BD6"/>
      </linearGradient>
    </defs>
    <text x="34" y="16.6" text-anchor="middle" textLength="46" lengthAdjust="spacingAndGlyphs"
          font-family="Helvetica, Arial, sans-serif" font-size="13" font-weight="700"
          fill="url(#dt-pm-tamara)">tamara</text>
  `,

  /* Visa — the classic navy wordmark with its raised italic axis. */
  visa: `
    <text x="34" y="17" text-anchor="middle" textLength="42" lengthAdjust="spacingAndGlyphs"
          font-family="Helvetica, Arial, sans-serif" font-size="14.5" font-style="italic"
          font-weight="700" fill="#1A1F71">VISA</text>
  `,

  /* Mastercard — interlocking red/amber discs with the overlap in between. */
  mastercard: `
    <circle cx="27" cy="12" r="8" fill="#EB001B"/>
    <circle cx="39" cy="12" r="8" fill="#F79E1B"/>
    <path d="M33 6.1a8 8 0 0 0 0 11.8 8 8 0 0 0 0-11.8Z" fill="#FF5F00"/>
  `,

  /* Cash on delivery — banknote plus coin, in the app's own line style. */
  cash: `
    <g fill="none" stroke="#1B2A3B" stroke-width="1.6"
       stroke-linecap="round" stroke-linejoin="round">
      <rect x="8" y="5.5" width="34" height="13" rx="2.5"/>
      <circle cx="25" cy="12" r="3.2"/>
      <path d="M12.5 12h.01M37.5 12h.01"/>
      <path d="M48 9.5a3.5 3.5 0 0 1 0 5"/>
      <path d="M53 7.5a7 7 0 0 1 0 9"/>
    </g>
  `,

}
</script>

<template>
  <svg
    class="pbm"
    viewBox="0 0 68 24"
    xmlns="http://www.w3.org/2000/svg"
    :style="{ height: `${size}px` }"
    :role="label || LABELS[name] ? 'img' : 'presentation'"
    :aria-label="label || LABELS[name] || undefined"
    v-html="MARKS[name] || ''"
  />
</template>

<style scoped>
.pbm {
  display: block;
  width: auto;
  /* Wordmarks are pre-coloured; never let a parent's currentColor bleed in. */
  color: initial;
  /**
   * The document runs `dir="rtl"`, and SVG <text> inherits it. With RTL
   * direction a `text-anchor: start` run grows *leftwards* from its `x`, so
   * every Latin wordmark ran off the left edge of the viewBox and got clipped
   * ("mada" → "ada", "stc pay" → "tc pay", and Apple's glyph landed on top of
   * "Pay"). These are Latin brand names and must always lay out left-to-right.
   */
  direction: ltr;
}
</style>
