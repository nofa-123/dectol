<script setup>
/**
 * Single inline icon set — line icons on a 24×24 grid, inheriting currentColor.
 * Inlining beats an icon font or sprite here: no extra request, no FOUT, and
 * every icon can be recoloured/animated by its parent.
 */
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 24 },
  stroke: { type: [Number, String], default: 1.7 },
  /** Decorative by default; pass a label to expose it to screen readers. */
  label: { type: String, default: '' },
})

const PATHS = {
  /* --- services --- */
  sofa: '<path d="M4 11V8.5A2.5 2.5 0 0 1 6.5 6h11A2.5 2.5 0 0 1 20 8.5V11"/><path d="M4 11a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2 2 2 0 0 0-2 2v1H6v-1a2 2 0 0 0-2-2Z"/><path d="M5 18v2M19 18v2"/>',
  carpet:
    '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M5.5 8h13M5.5 16h13"/><ellipse cx="12" cy="12" rx="3.6" ry="2.4"/><path d="M2.5 5 1 3.5M21.5 5 23 3.5M2.5 19 1 20.5M21.5 19 23 20.5"/>',
  curtains:
    '<path d="M3 3h18"/><path d="M6 3v18c2.6-1 4-4.6 4-9S8.6 4 6 3Z"/><path d="M18 3v18c-2.6-1-4-4.6-4-9s1.4-8 4-9Z"/><path d="M4 21h4M16 21h4"/>',
  mattress:
    '<rect x="2.5" y="8" width="19" height="9" rx="3"/><path d="M4.5 17v3M19.5 17v3"/><path d="M6 8V6.5A2.5 2.5 0 0 1 8.5 4h7A2.5 2.5 0 0 1 18 6.5V8"/><path d="M8 12.5h.01M12 12.5h.01M16 12.5h.01"/>',
  deep: '<path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9.6 13.6 12 8l2.4 5.6L20 16l-5.6 2.4"/><path d="M12 8v0"/>',
  pest: '<path d="M12 7a4 4 0 0 1 4 4v3a4 4 0 0 1-8 0v-3a4 4 0 0 1 4-4Z"/><path d="M9.5 7.5 8 5M14.5 7.5 16 5"/><path d="M8 11H4.5M16 11H19.5M8 15H4.5M16 15H19.5"/><path d="M12 7V4"/>',
  majlis:
    '<path d="M3 16v-3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3"/><rect x="2" y="16" width="20" height="4" rx="1.6"/><path d="M6.5 11V8.5A1.5 1.5 0 0 1 8 7h8a1.5 1.5 0 0 1 1.5 1.5V11"/><path d="M12 7V5"/>',
  chair:
    '<path d="M7 4h10l-1 9H8Z"/><path d="M6 13h12"/><path d="M8 13v7M16 13v7"/><path d="M8.5 17h7"/>',
  'carpet-roll':
    '<ellipse cx="6.5" cy="12" rx="2.5" ry="7"/><path d="M6.5 5h11a2.5 7 0 0 1 0 14h-11"/><path d="M17.5 9.5a2 3.5 0 0 1 0 5"/>',
  moquette:
    '<path d="M3 8.5 9.5 4.5h11.5L14.5 8.5Z"/><path d="M3 8.5v7l11.5 4V12.5Z"/><path d="M14.5 12.5 21 8.5v7l-6.5 4Z"/>',

  /* --- sizes & fixtures --- */
  'bed-single':
    '<path d="M3.5 18v-6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v6"/><rect x="2.5" y="18" width="19" height="2.5" rx="1"/><rect x="7" y="6.5" width="10" height="3.5" rx="1.4"/>',
  'bed-double':
    '<path d="M3.5 18v-6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v6"/><rect x="2.5" y="18" width="19" height="2.5" rx="1"/><rect x="5.5" y="6.5" width="7" height="3.5" rx="1.4"/><rect x="13.5" y="6.5" width="5" height="3.5" rx="1.4"/>',
  headboard:
    '<path d="M4.5 19v-8a7.5 7.5 0 0 1 15 0v8"/><path d="M3 19h18"/>',
  'headboard-wide':
    '<path d="M3 19v-6.5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4V19"/><path d="M2 19h20"/><path d="m7.5 12 1.6 2M16.5 12l-1.6 2"/>',
  window:
    '<rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M12 3.5v17M4 12h16"/>',
  kitchen:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M3.5 12h17"/><path d="M8 7h.01M8 16.5h.01"/><path d="M13 6.5h4M13 16h4"/>',
  toilet:
    '<path d="M5 4v6.5h13"/><path d="M5.5 10.5A6.5 6.5 0 0 0 12 17h1l-1 3.5"/><path d="M18 10.5v-6a1 1 0 0 0-1-1h-1"/>',
  roller:
    '<rect x="4" y="4" width="12" height="5" rx="1.5"/><path d="M16 6.5h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-6a1 1 0 0 0-1 1v1.5"/><rect x="10" y="14" width="4" height="6.5" rx="1.4"/>',
  ruler:
    '<rect x="1.5" y="8" width="21" height="8" rx="2" transform="rotate(-20 12 12)"/><path d="m7 10 1 2M10.5 8.6l1.4 2.6M14 7.2l1 2M17.5 5.8l1.4 2.6"/>',
  trash:
    '<path d="M4 6.5h16"/><path d="M9 6.5V4.8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1.7"/><path d="M6 6.5 6.9 20a1 1 0 0 0 1 .9h8.2a1 1 0 0 0 1-.9L18 6.5"/><path d="M10 10.5v6M14 10.5v6"/>',
  image:
    '<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><circle cx="8.5" cy="10" r="1.6"/><path d="m4 17 4.5-4.5 3.5 3.5 3-3L20 17.5"/>',

  /* --- property types --- */
  building:
    '<path d="M4.5 20.5V5a1.5 1.5 0 0 1 1.5-1.5h8A1.5 1.5 0 0 1 15.5 5v15.5"/><path d="M15.5 9.5h3A1.5 1.5 0 0 1 20 11v9.5"/><path d="M3 20.5h18"/><path d="M8 7.5h.01M12 7.5h.01M8 11.5h.01M12 11.5h.01M8 15.5h.01M12 15.5h.01"/>',
  villa:
    '<path d="m2.5 11 9.5-7 9.5 7"/><path d="M5 9.6V20a.8.8 0 0 0 .8.8h12.4a.8.8 0 0 0 .8-.8V9.6"/><path d="M9.5 20.8v-5h5v5"/><path d="M16 6.6V4h2.5v4.4"/>',
  palm: '<path d="M12 21v-9"/><path d="M12 12c0-3-2.5-5-5.5-4.6M12 12c0-3 2.5-5 5.5-4.6M12 12c-1-2.6.3-5.4 3-6.6M12 12c1-2.6-.3-5.4-3-6.6"/><circle cx="12" cy="11.5" r="1.2"/><path d="M9.5 21h5"/>',
  desk: '<path d="M2.5 9.5h19"/><path d="M4 9.5V6a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 20 6v3.5"/><path d="M6 9.5V20M18 9.5V20"/><path d="M6 14.5h5"/>',
  store:
    '<path d="M3.5 9.5h17V20a.8.8 0 0 1-.8.8H4.3a.8.8 0 0 1-.8-.8Z"/><path d="M3 9.5 4.6 4.2A1 1 0 0 1 5.6 3.5h12.8a1 1 0 0 1 1 .7L21 9.5"/><path d="M8 9.5a2.5 2.5 0 0 1-5 0M13 9.5a2.5 2.5 0 0 1-5 0M18 9.5a2.5 2.5 0 0 1-5 0M21 9.5a2.5 2.5 0 0 1-5 0"/><path d="M9.5 20.8v-6h5v6"/>',
  'car-seat':
    '<path d="M7 4.5a2 2 0 0 1 4 0v7.5l5 1.5a2 2 0 0 1 1.4 2.4l-.6 2.3a2 2 0 0 1-2.4 1.4l-7-2A3 3 0 0 1 5 14.7Z"/><path d="M5.5 20.5h11"/>',
  pool: '<path d="M3 16.5c1.6 0 1.6 1.4 3.2 1.4s1.6-1.4 3.2-1.4 1.6 1.4 3.2 1.4 1.6-1.4 3.2-1.4 1.6 1.4 3.2 1.4"/><path d="M3 20c1.6 0 1.6 1.4 3.2 1.4"/><path d="M7 14V6a2 2 0 0 1 4 0M13 14V6a2 2 0 0 1 4 0"/><path d="M7 9.5h4M13 9.5h4"/>',
  mosque:
    '<path d="M12 2.5c2.4 2 3.6 3.7 3.6 5.3 0 1.4-1.2 2.4-3.6 2.4S8.4 9.2 8.4 7.8c0-1.6 1.2-3.3 3.6-5.3Z"/><path d="M6 20.5v-7a6 6 0 0 1 12 0v7"/><path d="M3.5 20.5v-8.2M20.5 20.5v-8.2"/><path d="M3.5 12.3a1.6 1.6 0 0 1 3.2 0M17.3 12.3a1.6 1.6 0 0 1 3.2 0"/><path d="M2.5 20.5h19"/><path d="M10.3 20.5v-3.2a1.7 1.7 0 0 1 3.4 0v3.2"/>',
  tank: '<rect x="4" y="6" width="16" height="13" rx="3"/><path d="M4 12.5h16"/><path d="M9.5 6V4.2A1.2 1.2 0 0 1 10.7 3h2.6a1.2 1.2 0 0 1 1.2 1.2V6"/><path d="M20 9.5h1.8M2.2 15.5H4"/>',

  /* --- trust & marketing --- */
  shield:
    '<path d="M12 3 4.5 6v6c0 4.2 3 7.6 7.5 9 4.5-1.4 7.5-4.8 7.5-9V6Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  team: '<circle cx="9" cy="8.5" r="3"/><path d="M3 19a6 6 0 0 1 12 0"/><path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 19a6 6 0 0 0-2.2-4.6"/>',
  leaf: '<path d="M20 4c0 9-5.5 13-11 13-2.2 0-4-.7-5-1.6"/><path d="M4 20c0-6 3.5-10.5 9-12"/><path d="M20 4c-8 0-12 3-12 8"/>',
  pin: '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  truck:
    '<path d="M2.5 16V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v9"/><path d="M14.5 9h3.2l2.8 3.3V16"/><circle cx="7" cy="17.5" r="2"/><circle cx="17.5" cy="17.5" r="2"/><path d="M9 17.5h6.5M2.5 16h2.6"/>',
  refresh:
    '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4.5V9h-4.5"/>',
  sparkle:
    '<path d="M12 3.5 13.9 9l5.6 2-5.6 2L12 18.5 10.1 13 4.5 11l5.6-2Z"/><path d="M18.5 3.5v3M20 5h-3"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.8"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.8"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.8"/>',
  headset:
    '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2.5" y="13" width="4.5" height="6" rx="2"/><rect x="17" y="13" width="4.5" height="6" rx="2"/><path d="M19.2 19v.5a2.5 2.5 0 0 1-2.5 2.5H13"/>',
  gift: '<rect x="3" y="8.5" width="18" height="4" rx="1"/><path d="M4.5 12.5V20a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-7.5"/><path d="M12 8.5V21"/><path d="M12 8.5S10.5 4 8 4a2.2 2.2 0 0 0 0 4.5ZM12 8.5S13.5 4 16 4a2.2 2.2 0 0 1 0 4.5Z"/>',
  tag: '<path d="M11.5 3H20a1 1 0 0 1 1 1v8.5a2 2 0 0 1-.6 1.4l-6.5 6.5a2 2 0 0 1-2.8 0l-7-7a2 2 0 0 1 0-2.8l6.5-6.5A2 2 0 0 1 11.5 3Z"/><circle cx="16.5" cy="7.5" r="1.4"/>',
  percent: '<path d="M6 18 18 6"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/>',

  /* --- ui --- */
  star: '<path d="m12 3.6 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9Z"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8 12.2 2.7 2.7L16 9.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.3 2"/>',
  calendar:
    '<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 10h17M8 3.5V6.5M16 3.5V6.5"/><path d="M8 14h2M14 14h2M8 17.5h2"/>',
  'calendar-check':
    '<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 10h17M8 3.5V6.5M16 3.5V6.5"/><path d="m9 15.2 2 2 4-4"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  users: '<circle cx="9" cy="8.5" r="3"/><path d="M3 19a6 6 0 0 1 12 0"/><circle cx="17.5" cy="9.5" r="2.2"/><path d="M15.5 19a6 6 0 0 1 5.5-4.4"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 9.5h19"/><path d="M6 14.5h3.5"/>',
  list: '<path d="M8 6.5h12M8 12h12M8 17.5h12"/><path d="M4 6.5h.01M4 12h.01M4 17.5h.01"/>',
  bell: '<path d="M6 10a6 6 0 1 1 12 0c0 4 1.4 5.4 1.9 6H4.1C4.6 15.4 6 14 6 10Z"/><path d="M10 19.5a2.2 2.2 0 0 0 4 0"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h11"/>',
  close: '<path d="M6 6 18 18M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  filter: '<path d="M3.5 6h17M6.5 12h11M10 18h4"/>',
  'chevron-left': '<path d="M14.5 5 8 12l6.5 7"/>',
  'chevron-right': '<path d="M9.5 5 16 12l-6.5 7"/>',
  'chevron-down': '<path d="M5 9.5 12 16l7-6.5"/>',
  'arrow-left': '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  phone:
    '<path d="M6.5 3.5h3l1.6 4-2 1.4a12 12 0 0 0 6 6l1.4-2 4 1.6v3a2 2 0 0 1-2.2 2A16.8 16.8 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z"/>',
  whatsapp:
    '<path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.4-4.3A8.5 8.5 0 1 1 20.5 11.7Z"/><path d="M8.8 8.6c.3-.6 1.3-.6 1.6 0l.6 1.3-.8.9a5 5 0 0 0 3 3l.9-.8 1.3.6c.6.3.6 1.3 0 1.6-1.3.7-3 .3-4.7-1.2s-2.6-3.4-1.9-5.4Z"/>',
  mail: '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
  quote: '<path d="M9.5 6C6.5 7.2 5 9.6 5 13v5h5.5v-5.5H8c0-2 .6-3.4 2.4-4.2ZM19 6c-3 1.2-4.5 3.6-4.5 7v5H20v-5.5h-2.5c0-2 .6-3.4 2.4-4.2Z"/>',
  drag: '<path d="M9 6.5 5.5 12 9 17.5M15 6.5 18.5 12 15 17.5"/><path d="M12 4v16"/>',
  logout: '<path d="M14 5.5H6.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1H14"/><path d="M18.5 12H10"/><path d="m15 8.5 3.5 3.5L15 15.5"/>',
  heart:
    '<path d="M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.7C19 15.6 12 20 12 20Z"/>',
  share: '<circle cx="17.5" cy="6" r="2.5"/><circle cx="6.5" cy="12" r="2.5"/><circle cx="17.5" cy="18" r="2.5"/><path d="m8.7 10.8 6.6-3.6M8.7 13.2l6.6 3.6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><path d="M12 7.8h.01"/>',
  alert: '<path d="M12 4 2.8 20h18.4Z"/><path d="M12 10v4"/><path d="M12 17.2h.01"/>',
  spinner: '<path d="M12 3.5a8.5 8.5 0 1 1-8.5 8.5" />',
  lock: '<rect x="4.5" y="10" width="15" height="10.5" rx="2.5"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>',
  wallet:
    '<path d="M3.5 7.5A2 2 0 0 1 5.5 5.5H17a1 1 0 0 1 1 1v1.8"/><rect x="3.5" y="7.5" width="17" height="12" rx="2.5"/><circle cx="16.5" cy="13.5" r="1.3"/>',
  home: '<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9.8V20a.8.8 0 0 0 .8.8h11.4a.8.8 0 0 0 .8-.8V9.8"/><path d="M9.8 20.8v-5.4h4.4v5.4"/>',
  more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',

  /* --- social --- */
  instagram:
    '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17" cy="7" r="1"/>',
  x: '<path d="M4 4h3.6l4.2 5.6L16.8 4H20l-6.4 7.6L20.4 20h-3.6l-4.6-6.1L6.8 20H3.6l6.8-8Z"/>',
  tiktok:
    '<path d="M14 4v9.8a3.4 3.4 0 1 1-3-3.4"/><path d="M14 4c.4 2.4 2 3.9 4.5 4.1"/>',
  snapchat:
    '<path d="M12 3.5c2.7 0 4.3 2 4.3 4.6 0 1 .1 1.7.3 2.2.5.2 1 .1 1.4 0 .7-.2 1.2.7.6 1.2-.5.4-1.2.7-1.7.9.3 1.4 1.7 2.8 3.1 3.1.5.1.6.8.1 1-1 .5-2 .5-2.4.9-.2.2-.1.7-.5.9-.6.3-1.6-.2-2.7 0-1 .2-1.7 1.2-2.5 1.2s-1.5-1-2.5-1.2c-1.1-.2-2.1.3-2.7 0-.4-.2-.3-.7-.5-.9-.4-.4-1.4-.4-2.4-.9-.5-.2-.4-.9.1-1 1.4-.3 2.8-1.7 3.1-3.1-.5-.2-1.2-.5-1.7-.9-.6-.5-.1-1.4.6-1.2.4.1.9.2 1.4 0 .2-.5.3-1.2.3-2.2C7.7 5.5 9.3 3.5 12 3.5Z"/>',
}

const body = computed(() => PATHS[props.name] ?? PATHS.info)
const px = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <svg
    class="dt-icon"
    :class="{ 'dt-icon--spin': name === 'spinner' }"
    :style="{ width: px, height: px }"
    viewBox="0 0 24 24"
    fill="none"
    :stroke-width="stroke"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    :role="label ? 'img' : 'presentation'"
    :aria-hidden="label ? undefined : 'true'"
    :aria-label="label || undefined"
    v-html="body"
  />
</template>

<style scoped>
.dt-icon {
  flex: none;
  display: block;
}

.dt-icon--spin {
  animation: dt-spin 0.75s linear infinite;
}
</style>
