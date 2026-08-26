/**
 * DOCTOL illustration generator
 * ------------------------------------------------------------------
 * Produces every SVG scene used across the app into `src/assets/images`.
 *
 * Why generated rather than hand-authored: the before/after slider needs
 * pixel-identical scenes that differ only in "soiling", and the service grid
 * needs seven rooms that share one lighting model. Parameterising the scene
 * keeps them consistent and lets the whole art direction be retuned by editing
 * one palette object.
 *
 * These are production placeholders with a stable contract: each file keeps its
 * name and aspect ratio, so swapping in real photography later is a drop-in
 * replacement of the files (or of `image` fields in `src/data/*`).
 *
 * Run:  npm run gen:assets
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'src', 'assets', 'images')

/* ------------------------------------------------------------------ */
/* Palette                                                             */
/* ------------------------------------------------------------------ */

const P = {
  teal: '#009FA3',
  tealDeep: '#007377',
  tealLight: '#7FD2D3',
  navy: '#073B4C',
  gold: '#F5C542',
  sun: '#FFF1CE',
  wallTop: '#F6F1E9',
  wallBottom: '#EBE3D8',
  floor: '#DCCFC0',
  floorDark: '#C6B7A6',
  sofa: '#EFE6DA',
  sofaShade: '#DDD0BF',
  sofaDeep: '#C9B9A5',
  wood: '#B08757',
  woodDark: '#8A6739',
  plant: '#2F8F6B',
  plantDark: '#1F6B4F',
  white: '#FFFFFF',
  ink: '#0B1F27',
}

/** Deterministic pseudo-random so re-running produces identical files. */
function rng(seed) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    s >>>= 0
    return s / 4294967296
  }
}

const n = (v) => Math.round(v * 100) / 100

/* ------------------------------------------------------------------ */
/* Reusable scene pieces                                               */
/* ------------------------------------------------------------------ */

/** Shared <defs>: lighting, materials, and the grime filter used by "before". */
function defs(id, { warm = true } = {}) {
  return `
  <defs>
    <linearGradient id="${id}-wall" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0" stop-color="${warm ? P.wallTop : '#EFF4F5'}"/>
      <stop offset="1" stop-color="${warm ? P.wallBottom : '#DDE7E9'}"/>
    </linearGradient>
    <linearGradient id="${id}-floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${P.floor}"/>
      <stop offset="1" stop-color="${P.floorDark}"/>
    </linearGradient>
    <linearGradient id="${id}-sofa" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0" stop-color="${P.white}" stop-opacity="0.9"/>
      <stop offset="0.45" stop-color="${P.sofa}"/>
      <stop offset="1" stop-color="${P.sofaShade}"/>
    </linearGradient>
    <linearGradient id="${id}-teal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${P.teal}"/>
      <stop offset="1" stop-color="${P.tealDeep}"/>
    </linearGradient>
    <linearGradient id="${id}-glass" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="#DFF3F7"/>
      <stop offset="0.55" stop-color="#BFE4EC"/>
      <stop offset="1" stop-color="#9FD2DE"/>
    </linearGradient>
    <linearGradient id="${id}-beam" x1="0" y1="0" x2="0.35" y2="1">
      <stop offset="0" stop-color="${P.sun}" stop-opacity="0.85"/>
      <stop offset="1" stop-color="${P.sun}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="${id}-glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${P.sun}" stop-opacity="0.75"/>
      <stop offset="1" stop-color="${P.sun}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="${id}-shadow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${P.navy}" stop-opacity="0.28"/>
      <stop offset="1" stop-color="${P.navy}" stop-opacity="0"/>
    </radialGradient>
    <filter id="${id}-soft" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="14"/>
    </filter>
    <filter id="${id}-grime" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" seed="7" result="noise"/>
      <feColorMatrix in="noise" type="matrix" result="mono"
        values="0 0 0 0 0.32  0 0 0 0 0.27  0 0 0 0 0.18  0 0 0 0.55 0"/>
      <feComposite in="mono" in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>`
}

/** Room shell: wall, skirting, floor, ambient corner shading. */
function room(id, w, h, floorY) {
  return `
  <rect width="${w}" height="${h}" fill="url(#${id}-wall)"/>
  <rect y="${floorY}" width="${w}" height="${h - floorY}" fill="url(#${id}-floor)"/>
  <rect y="${floorY - 14}" width="${w}" height="14" fill="${P.white}" opacity="0.75"/>
  <rect y="${floorY - 14}" width="${w}" height="3" fill="${P.navy}" opacity="0.06"/>
  <ellipse cx="${w * 0.5}" cy="${floorY}" rx="${w * 0.6}" ry="${h * 0.16}" fill="url(#${id}-glow)" opacity="0.5"/>`
}

/** Sunlit window with light beams falling onto the floor. */
function window_(id, x, y, w, h, { beams = true } = {}) {
  return `
  <g>
    <rect x="${x - 10}" y="${y - 10}" width="${w + 20}" height="${h + 20}" rx="14" fill="${P.white}" opacity="0.9"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="url(#${id}-glass)"/>
    <rect x="${x + w / 2 - 3}" y="${y}" width="6" height="${h}" fill="${P.white}" opacity="0.85"/>
    <rect x="${x}" y="${y + h * 0.42}" width="${w}" height="6" fill="${P.white}" opacity="0.85"/>
    <path d="M${x + 8} ${y + h - 8} L${x + w * 0.55} ${y + 10} L${x + w * 0.78} ${y + 10} L${x + 22} ${y + h - 8} Z"
      fill="${P.white}" opacity="0.35"/>
    <!-- distant skyline -->
    <g opacity="0.28" fill="${P.navy}">
      <rect x="${x + 12}" y="${y + h * 0.55}" width="${w * 0.13}" height="${h * 0.45}" rx="3"/>
      <rect x="${x + w * 0.26}" y="${y + h * 0.44}" width="${w * 0.1}" height="${h * 0.56}" rx="3"/>
      <rect x="${x + w * 0.62}" y="${y + h * 0.62}" width="${w * 0.16}" height="${h * 0.38}" rx="3"/>
    </g>
    ${
      beams
        ? `<path d="M${x} ${y + h} L${x + w} ${y + h * 0.2} L${x + w * 1.9} ${y + h * 2.4} L${x - w * 0.2} ${y + h * 2.4} Z"
             fill="url(#${id}-beam)" opacity="0.5"/>`
        : ''
    }
  </g>`
}

/** Three-seat sofa. `state` toggles the soiled treatment. */
function sofa(id, x, y, w, state) {
  const h = w * 0.52
  const soiled = state === 'before'
  const seatFill = soiled ? '#D8CBB6' : `url(#${id}-sofa)`
  const r = rng(21)
  const stains = soiled
    ? Array.from({ length: 9 }, () => {
        const cx = x + w * (0.12 + r() * 0.76)
        const cy = y + h * (0.34 + r() * 0.42)
        const rx = 8 + r() * 22
        return `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(rx * 0.62)}" fill="#8A7351" opacity="${n(0.14 + r() * 0.18)}"/>`
      }).join('')
    : ''

  return `
  <g>
    <ellipse cx="${x + w / 2}" cy="${y + h + 14}" rx="${w * 0.52}" ry="${h * 0.16}" fill="url(#${id}-shadow)"/>
    <!-- back -->
    <rect x="${x}" y="${y}" width="${w}" height="${h * 0.62}" rx="${h * 0.22}" fill="${seatFill}"/>
    <!-- arms -->
    <rect x="${x - w * 0.045}" y="${y + h * 0.28}" width="${w * 0.15}" height="${h * 0.6}" rx="${h * 0.2}" fill="${seatFill}"/>
    <rect x="${x + w * 0.895}" y="${y + h * 0.28}" width="${w * 0.15}" height="${h * 0.6}" rx="${h * 0.2}" fill="${seatFill}"/>
    <!-- seat cushions -->
    <g>
      <rect x="${x + w * 0.09}" y="${y + h * 0.5}" width="${w * 0.27}" height="${h * 0.34}" rx="${h * 0.12}" fill="${seatFill}"/>
      <rect x="${x + w * 0.37}" y="${y + h * 0.5}" width="${w * 0.27}" height="${h * 0.34}" rx="${h * 0.12}" fill="${seatFill}"/>
      <rect x="${x + w * 0.65}" y="${y + h * 0.5}" width="${w * 0.27}" height="${h * 0.34}" rx="${h * 0.12}" fill="${seatFill}"/>
    </g>
    <!-- back seams -->
    <g stroke="${P.sofaDeep}" stroke-width="2" opacity="0.55" fill="none">
      <path d="M${x + w * 0.335} ${y + h * 0.08} V${y + h * 0.5}"/>
      <path d="M${x + w * 0.665} ${y + h * 0.08} V${y + h * 0.5}"/>
    </g>
    <!-- accent cushions -->
    <g transform="rotate(-8 ${x + w * 0.18} ${y + h * 0.34})">
      <rect x="${x + w * 0.1}" y="${y + h * 0.16}" width="${w * 0.17}" height="${w * 0.17}" rx="${w * 0.03}"
        fill="${soiled ? '#7FA8A6' : P.teal}" opacity="${soiled ? 0.7 : 0.92}"/>
    </g>
    <g transform="rotate(9 ${x + w * 0.82} ${y + h * 0.34})">
      <rect x="${x + w * 0.73}" y="${y + h * 0.16}" width="${w * 0.17}" height="${w * 0.17}" rx="${w * 0.03}"
        fill="${soiled ? '#B9B096' : P.gold}" opacity="${soiled ? 0.6 : 0.85}"/>
    </g>
    ${stains}
    <!-- legs -->
    <rect x="${x + w * 0.06}" y="${y + h * 0.86}" width="${w * 0.035}" height="${h * 0.18}" rx="3" fill="${P.woodDark}"/>
    <rect x="${x + w * 0.9}" y="${y + h * 0.86}" width="${w * 0.035}" height="${h * 0.18}" rx="3" fill="${P.woodDark}"/>
    ${soiled ? `<rect x="${x - w * 0.05}" y="${y}" width="${w * 1.1}" height="${h * 1.05}" rx="${h * 0.2}" filter="url(#${id}-grime)" opacity="0.5"/>` : ''}
    ${!soiled ? sparkles(x + w * 0.5, y + h * 0.1, w * 0.5, 5) : ''}
  </g>`
}

/** Patterned area rug in perspective. */
function rug(id, cx, cy, w, state) {
  const soiled = state === 'before'
  const h = w * 0.42
  const base = soiled ? '#CBBDA4' : '#F2EBE0'
  const motif = soiled ? '#9A8B70' : P.teal
  const r = rng(88)
  const dirt = soiled
    ? Array.from({ length: 12 }, () => {
        const x = cx - w / 2 + r() * w
        const y = cy - h / 2 + r() * h
        return `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(10 + r() * 26)}" ry="${n(6 + r() * 12)}" fill="#7A6849" opacity="${n(0.1 + r() * 0.16)}"/>`
      }).join('')
    : ''

  return `
  <g>
    <path d="M${cx - w / 2} ${cy + h / 2} L${cx - w * 0.4} ${cy - h / 2} L${cx + w * 0.4} ${cy - h / 2} L${cx + w / 2} ${cy + h / 2} Z"
      fill="${base}"/>
    <path d="M${cx - w * 0.44} ${cy + h * 0.36} L${cx - w * 0.35} ${cy - h * 0.36} L${cx + w * 0.35} ${cy - h * 0.36} L${cx + w * 0.44} ${cy + h * 0.36} Z"
      fill="none" stroke="${motif}" stroke-width="3" opacity="0.55"/>
    <g fill="${motif}" opacity="0.35">
      <ellipse cx="${cx}" cy="${cy}" rx="${w * 0.17}" ry="${h * 0.24}"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${w * 0.09}" ry="${h * 0.13}" fill="${base}"/>
      <ellipse cx="${cx - w * 0.28}" cy="${cy}" rx="${w * 0.05}" ry="${h * 0.09}"/>
      <ellipse cx="${cx + w * 0.28}" cy="${cy}" rx="${w * 0.05}" ry="${h * 0.09}"/>
    </g>
    ${dirt}
    ${soiled ? `<path d="M${cx - w / 2} ${cy + h / 2} L${cx - w * 0.4} ${cy - h / 2} L${cx + w * 0.4} ${cy - h / 2} L${cx + w / 2} ${cy + h / 2} Z" filter="url(#${id}-grime)" opacity="0.45"/>` : ''}
  </g>`
}

/** Floor-to-ceiling curtain pair. */
function curtains(id, x, y, w, h, state) {
  const soiled = state === 'before'
  const cloth = soiled ? '#CFC6B4' : '#F3EEE6'
  const clothShade = soiled ? '#B3A896' : '#DFD6C7'
  const fold = (ox, dir) => {
    let d = ''
    for (let i = 0; i < 4; i += 1) {
      const fx = ox + dir * i * (w * 0.06)
      d += `<path d="M${n(fx)} ${y} q ${dir * 10} ${h * 0.4} 0 ${h}" stroke="${clothShade}" stroke-width="3" fill="none" opacity="0.7"/>`
    }
    return d
  }
  return `
  <g>
    <rect x="${x - 12}" y="${y - 18}" width="${w * 2.4 + 24}" height="10" rx="5" fill="${P.woodDark}"/>
    <path d="M${x} ${y} h ${w} q ${-w * 0.18} ${h * 0.5} 0 ${h} h ${-w} Z" fill="${cloth}"/>
    <path d="M${x + w * 1.4} ${y} h ${w} v ${h} h ${-w} q ${w * 0.18} ${-h * 0.5} 0 ${-h} Z" fill="${cloth}"/>
    ${fold(x + w * 0.2, 1)}
    ${fold(x + w * 2.2, -1)}
    ${soiled ? `<rect x="${x}" y="${y}" width="${w * 2.4}" height="${h}" filter="url(#${id}-grime)" opacity="0.4"/>` : ''}
  </g>`
}

/** Bed with mattress — the mattress itself carries the soiling. */
function mattress(id, x, y, w, state) {
  const soiled = state === 'before'
  const h = w * 0.34
  const fill = soiled ? '#DED3BE' : '#FBF8F3'
  const r = rng(303)
  const stains = soiled
    ? Array.from({ length: 7 }, () => {
        const cx = x + w * (0.15 + r() * 0.7)
        const cy = y + h * (0.25 + r() * 0.5)
        const rx = 14 + r() * 30
        return `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(rx)}" ry="${n(rx * 0.5)}" fill="#9E8A62" opacity="${n(0.12 + r() * 0.16)}"/>`
      }).join('')
    : ''
  return `
  <g>
    <ellipse cx="${x + w / 2}" cy="${y + h + 22}" rx="${w * 0.5}" ry="${h * 0.22}" fill="url(#${id}-shadow)"/>
    <rect x="${x - w * 0.03}" y="${y - h * 0.62}" width="${w * 0.06}" height="${h * 1.7}" rx="6" fill="${P.woodDark}"/>
    <rect x="${x - w * 0.03}" y="${y - h * 0.62}" width="${w * 1.06}" height="${h * 0.62}" rx="14" fill="${P.wood}" opacity="0.55"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * 0.22}" fill="${fill}"/>
    <g stroke="#DED6C7" stroke-width="2" opacity="0.8" fill="none">
      <path d="M${x + w * 0.03} ${y + h * 0.72} h ${w * 0.94}"/>
    </g>
    <g fill="#D9D0BE" opacity="0.7">
      ${Array.from({ length: 6 }, (_, i) => `<circle cx="${n(x + w * (0.12 + i * 0.152))}" cy="${n(y + h * 0.36)}" r="4"/>`).join('')}
    </g>
    ${stains}
    ${soiled ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h * 0.22}" filter="url(#${id}-grime)" opacity="0.45"/>` : ''}
    <rect x="${x + w * 0.08}" y="${y - h * 0.22}" width="${w * 0.3}" height="${h * 0.34}" rx="${h * 0.16}" fill="${P.white}" opacity="${soiled ? 0.6 : 0.95}"/>
    <rect x="${x + w * 0.62}" y="${y - h * 0.22}" width="${w * 0.3}" height="${h * 0.34}" rx="${h * 0.16}" fill="${P.white}" opacity="${soiled ? 0.6 : 0.95}"/>
  </g>`
}

/** Kitchen counter run with upper cabinets. */
function kitchen(id, x, y, w, h, state) {
  const soiled = state === 'before'
  const cab = soiled ? '#C9C0B2' : '#EFEAE2'
  const top = soiled ? '#8E8579' : '#2E4A54'
  const r = rng(555)
  const grease = soiled
    ? Array.from({ length: 10 }, () => {
        const cx = x + r() * w
        const cy = y + h * (0.2 + r() * 0.7)
        return `<ellipse cx="${n(cx)}" cy="${n(cy)}" rx="${n(8 + r() * 24)}" ry="${n(5 + r() * 14)}" fill="#7C6742" opacity="${n(0.1 + r() * 0.18)}"/>`
      }).join('')
    : ''
  return `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h * 0.3}" rx="10" fill="${cab}"/>
    <g stroke="${P.navy}" stroke-width="1.5" opacity="0.12" fill="none">
      <path d="M${x + w * 0.33} ${y} v ${h * 0.3}"/><path d="M${x + w * 0.66} ${y} v ${h * 0.3}"/>
    </g>
    <rect x="${x}" y="${y + h * 0.55}" width="${w}" height="${h * 0.08}" rx="6" fill="${top}"/>
    <rect x="${x}" y="${y + h * 0.63}" width="${w}" height="${h * 0.37}" rx="10" fill="${cab}"/>
    <g stroke="${P.navy}" stroke-width="1.5" opacity="0.12" fill="none">
      <path d="M${x + w * 0.4} ${y + h * 0.63} v ${h * 0.37}"/><path d="M${x + w * 0.72} ${y + h * 0.63} v ${h * 0.37}"/>
    </g>
    <g fill="${P.navy}" opacity="0.35">
      <rect x="${x + w * 0.14}" y="${y + h * 0.2}" width="${w * 0.06}" height="5" rx="2.5"/>
      <rect x="${x + w * 0.52}" y="${y + h * 0.72}" width="${w * 0.06}" height="5" rx="2.5"/>
    </g>
    <path d="M${x + w * 0.16} ${y + h * 0.55} v ${-h * 0.16} q 0 ${-h * 0.08} ${w * 0.07} ${-h * 0.08}"
      stroke="${soiled ? '#9AA5A3' : P.teal}" stroke-width="6" fill="none" stroke-linecap="round"/>
    <rect x="${x + w * 0.72}" y="${y + h * 0.4}" width="${w * 0.14}" height="${h * 0.15}" rx="6" fill="${P.white}" opacity="0.8"/>
    ${grease}
    ${soiled ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" filter="url(#${id}-grime)" opacity="0.4"/>` : ''}
  </g>`
}

/** Potted plant — a recurring "lived-in" prop. */
function plant(id, x, baseY, s = 1) {
  const leaves = Array.from({ length: 7 }, (_, i) => {
    const a = -80 + i * 26
    return `<ellipse cx="${n(x)}" cy="${n(baseY - 96 * s)}" rx="${n(15 * s)}" ry="${n(46 * s)}"
      fill="${i % 2 ? P.plant : P.plantDark}" opacity="0.92"
      transform="rotate(${a} ${n(x)} ${n(baseY - 52 * s)})"/>`
  }).join('')
  return `
  <g>
    <ellipse cx="${x}" cy="${baseY + 6}" rx="${34 * s}" ry="${9 * s}" fill="url(#${id}-shadow)"/>
    ${leaves}
    <path d="M${x - 26 * s} ${baseY - 46 * s} h ${52 * s} l ${-7 * s} ${46 * s} h ${-38 * s} Z" fill="${P.wallBottom}"/>
    <path d="M${x - 26 * s} ${baseY - 46 * s} h ${52 * s} l ${-3 * s} ${12 * s} h ${-46 * s} Z" fill="${P.floorDark}" opacity="0.6"/>
  </g>`
}

/** Coffee table with a mug. */
function table(id, cx, cy, w) {
  const h = w * 0.3
  return `
  <g>
    <ellipse cx="${cx}" cy="${cy + h + 10}" rx="${w * 0.44}" ry="${h * 0.3}" fill="url(#${id}-shadow)"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${w * 0.5}" ry="${w * 0.14}" fill="${P.wood}"/>
    <ellipse cx="${cx}" cy="${cy - 5}" rx="${w * 0.5}" ry="${w * 0.14}" fill="#C99B67"/>
    <path d="M${cx - w * 0.3} ${cy + 4} l ${-w * 0.05} ${h} M${cx + w * 0.3} ${cy + 4} l ${w * 0.05} ${h}"
      stroke="${P.woodDark}" stroke-width="${w * 0.035}" stroke-linecap="round"/>
    <rect x="${cx - w * 0.08}" y="${cy - w * 0.1}" width="${w * 0.12}" height="${w * 0.09}" rx="3" fill="${P.white}"/>
    <ellipse cx="${cx - w * 0.02}" cy="${cy - w * 0.1}" rx="${w * 0.06}" ry="${w * 0.018}" fill="${P.teal}" opacity="0.7"/>
  </g>`
}

/** Professional cleaning machine — the DOCTOL hero prop. */
function extractor(id, x, baseY, s = 1) {
  const w = 120 * s
  const h = 130 * s
  const y = baseY - h
  return `
  <g>
    <ellipse cx="${x + w / 2}" cy="${baseY + 6}" rx="${w * 0.55}" ry="${12 * s}" fill="url(#${id}-shadow)"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h * 0.55}" rx="${18 * s}" fill="url(#${id}-teal)"/>
    <rect x="${x}" y="${y + h * 0.5}" width="${w}" height="${h * 0.42}" rx="${16 * s}" fill="${P.white}"/>
    <rect x="${x + w * 0.12}" y="${y + h * 0.62}" width="${w * 0.76}" height="${h * 0.16}" rx="${6 * s}" fill="${P.navy}" opacity="0.1"/>
    <circle cx="${x + w * 0.24}" cy="${baseY - 8 * s}" r="${13 * s}" fill="${P.navy}"/>
    <circle cx="${x + w * 0.76}" cy="${baseY - 8 * s}" r="${13 * s}" fill="${P.navy}"/>
    <circle cx="${x + w * 0.24}" cy="${baseY - 8 * s}" r="${5 * s}" fill="${P.tealLight}"/>
    <circle cx="${x + w * 0.76}" cy="${baseY - 8 * s}" r="${5 * s}" fill="${P.tealLight}"/>
    <!-- hose -->
    <path d="M${x + w * 0.9} ${y + h * 0.16} q ${70 * s} ${-30 * s} ${86 * s} ${60 * s} q ${10 * s} ${60 * s} ${-40 * s} ${74 * s}"
      stroke="${P.navy}" stroke-width="${11 * s}" fill="none" stroke-linecap="round" opacity="0.85"/>
    <rect x="${x + w * 1.05}" y="${baseY - 22 * s}" width="${52 * s}" height="${14 * s}" rx="${7 * s}" fill="${P.navy}"/>
    <rect x="${x + w * 0.18}" y="${y + h * 0.16}" width="${w * 0.64}" height="${h * 0.2}" rx="${7 * s}" fill="${P.white}" opacity="0.9"/>
  </g>`
}

/** Uniformed technician (stylised, back-turned so no face detail is implied). */
function technician(id, x, baseY, s = 1) {
  return `
  <g>
    <ellipse cx="${x}" cy="${baseY + 4}" rx="${34 * s}" ry="${9 * s}" fill="url(#${id}-shadow)"/>
    <path d="M${x - 26 * s} ${baseY} l ${6 * s} ${-96 * s} h ${40 * s} l ${6 * s} ${96 * s} Z" fill="${P.navy}"/>
    <path d="M${x - 30 * s} ${baseY - 96 * s} q ${30 * s} ${-26 * s} ${60 * s} 0 l ${-6 * s} ${52 * s} h ${-48 * s} Z" fill="url(#${id}-teal)"/>
    <circle cx="${x}" cy="${baseY - 122 * s}" r="${19 * s}" fill="#E8C9A8"/>
    <path d="M${x - 20 * s} ${baseY - 128 * s} q ${20 * s} ${-20 * s} ${40 * s} 0 z" fill="${P.navy}"/>
    <rect x="${x + 26 * s}" y="${baseY - 96 * s}" width="${11 * s}" height="${54 * s}" rx="${5 * s}" fill="url(#${id}-teal)"
      transform="rotate(14 ${x + 26 * s} ${baseY - 96 * s})"/>
    <rect x="${x - 14 * s}" y="${baseY - 74 * s}" width="${28 * s}" height="${8 * s}" rx="${4 * s}" fill="${P.gold}" opacity="0.9"/>
  </g>`
}

/** Pest-control operative with a sprayer. */
function pestTech(id, x, baseY, s = 1) {
  return `
  <g>
    <ellipse cx="${x}" cy="${baseY + 4}" rx="${36 * s}" ry="${10 * s}" fill="url(#${id}-shadow)"/>
    <path d="M${x - 28 * s} ${baseY} l ${4 * s} ${-104 * s} h ${48 * s} l ${4 * s} ${104 * s} Z" fill="#F4F6F6"/>
    <path d="M${x - 32 * s} ${baseY - 104 * s} q ${32 * s} ${-28 * s} ${64 * s} 0 l ${-8 * s} ${56 * s} h ${-48 * s} Z" fill="#FBFCFC"/>
    <circle cx="${x}" cy="${baseY - 128 * s}" r="${21 * s}" fill="#F4F6F6"/>
    <ellipse cx="${x + 2 * s}" cy="${baseY - 126 * s}" rx="${15 * s}" ry="${11 * s}" fill="${P.tealLight}" opacity="0.85"/>
    <rect x="${x - 46 * s}" y="${baseY - 96 * s}" width="${22 * s}" height="${44 * s}" rx="${8 * s}" fill="url(#${id}-teal)"/>
    <path d="M${x + 24 * s} ${baseY - 70 * s} l ${46 * s} ${-16 * s}" stroke="${P.navy}" stroke-width="${8 * s}" stroke-linecap="round"/>
    <g fill="${P.tealLight}" opacity="0.65">
      <circle cx="${x + 84 * s}" cy="${baseY - 84 * s}" r="${4 * s}"/>
      <circle cx="${x + 96 * s}" cy="${baseY - 72 * s}" r="${3 * s}"/>
      <circle cx="${x + 92 * s}" cy="${baseY - 96 * s}" r="${2.5 * s}"/>
      <circle cx="${x + 104 * s}" cy="${baseY - 88 * s}" r="${3.5 * s}"/>
    </g>
  </g>`
}

/** Four-point sparkles used to signal "cleaned". */
function sparkles(cx, cy, spread, count = 5, color = P.gold) {
  const r = rng(1234)
  return Array.from({ length: count }, () => {
    const x = cx + (r() - 0.5) * spread * 2
    const y = cy + (r() - 0.5) * spread * 0.9
    const s = 6 + r() * 10
    return `<path d="M${n(x)} ${n(y - s)} Q${n(x)} ${n(y)} ${n(x + s)} ${n(y)} Q${n(x)} ${n(y)} ${n(x)} ${n(y + s)} Q${n(x)} ${n(y)} ${n(x - s)} ${n(y)} Q${n(x)} ${n(y)} ${n(x)} ${n(y - s)} Z"
      fill="${color}" opacity="${n(0.5 + r() * 0.45)}"/>`
  }).join('')
}

/** Framed wall art. */
function art(id, x, y, w, h) {
  return `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${P.white}"/>
    <rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" rx="3" fill="${P.teal}" opacity="0.14"/>
    <path d="M${x + 8} ${y + h - 8} l ${w * 0.3} ${-h * 0.42} l ${w * 0.22} ${h * 0.24} l ${w * 0.2} ${-h * 0.3} l ${w * 0.12} ${h * 0.48} Z"
      fill="${P.teal}" opacity="0.4"/>
    <circle cx="${x + w * 0.74}" cy="${y + h * 0.28}" r="${h * 0.09}" fill="${P.gold}" opacity="0.75"/>
  </g>`
}

/** Swimming pool seen from the deck. `before` turns the water algae-green. */
function poolScene(id, w, h, state = 'after') {
  const soiled = state === 'before'
  const r = rng(909)
  const ripples = Array.from({ length: 7 }, (_, i) => {
    const y = h * (0.5 + i * 0.06)
    return `<path d="M${w * 0.1} ${n(y)} q ${w * 0.2} ${-8} ${w * 0.4} 0 t ${w * 0.4} 0"
      stroke="#FFFFFF" stroke-width="2" fill="none" opacity="${n(0.14 + r() * 0.2)}"/>`
  }).join('')
  return `
  <rect width="${w}" height="${h}" fill="#DCEFF3"/>
  <rect width="${w}" height="${h * 0.34}" fill="#CFE7EC"/>
  <rect y="${h * 0.3}" width="${w}" height="${h * 0.1}" fill="${P.wallBottom}"/>
  <rect y="${h * 0.4}" width="${w}" height="${h * 0.46}" fill="${soiled ? '#6E8A4B' : '#3FA9C4'}"/>
  <rect y="${h * 0.4}" width="${w}" height="${h * 0.46}" fill="${soiled ? '#4E6B33' : `url(#${id}-teal)`}" opacity="0.5"/>
  ${soiled ? `<rect y="${h * 0.4}" width="${w}" height="${h * 0.46}" filter="url(#${id}-grime)" opacity="0.55"/>` : ''}
  ${ripples}
  <rect y="${h * 0.86}" width="${w}" height="${h * 0.14}" fill="${P.floor}"/>
  <g opacity="0.9">
    <rect x="${w * 0.06}" y="${h * 0.18}" width="${w * 0.1}" height="${h * 0.14}" rx="4" fill="${P.plant}"/>
    <rect x="${w * 0.1}" y="${h * 0.28}" width="${w * 0.02}" height="${h * 0.06}" fill="${P.woodDark}"/>
  </g>
  <g fill="${P.white}" opacity="0.85">
    <rect x="${w * 0.62}" y="${h * 0.2}" width="${w * 0.3}" height="${h * 0.11}" rx="6"/>
    <rect x="${w * 0.66}" y="${h * 0.31}" width="${w * 0.05}" height="${h * 0.05}" rx="2"/>
  </g>
  ${soiled ? '' : sparkles(w * 0.5, h * 0.6, w * 0.34, 5, '#FFFFFF')}`
}

/** Car interior. `before` adds seat staining and haze on the glass. */
function carScene(id, w, h, state = 'after') {
  const soiled = state === 'before'
  const seat = soiled ? '#5A5348' : '#43535B'
  const r = rng(3131)
  const stains = soiled
    ? Array.from({ length: 9 }, () => {
        const x = w * 0.2 + r() * w * 0.6
        const y = h * 0.68 + r() * h * 0.28
        return `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(10 + r() * 24)}" ry="${n(6 + r() * 12)}" fill="#2B2418" opacity="${n(0.2 + r() * 0.25)}"/>`
      }).join('')
    : ''
  return `
  <rect width="${w}" height="${h}" fill="#1B242A"/>
  <rect y="${h * 0.55}" width="${w}" height="${h * 0.45}" fill="#2B383F"/>
  <path d="M0 ${h * 0.55} Q ${w * 0.5} ${h * 0.38} ${w} ${h * 0.55} L${w} ${h * 0.62} Q ${w * 0.5} ${h * 0.46} 0 ${h * 0.62} Z" fill="#3A4A52"/>
  <!-- windscreen -->
  <path d="M${w * 0.08} ${h * 0.42} Q ${w * 0.5} ${h * 0.16} ${w * 0.92} ${h * 0.42} L${w * 0.92} ${h * 0.5} Q ${w * 0.5} ${h * 0.26} ${w * 0.08} ${h * 0.5} Z"
    fill="url(#${id}-glass)" opacity="0.55"/>
  <!-- seat -->
  <g>
    <path d="M${w * 0.18} ${h}
             L${w * 0.2} ${h * 0.66}
             q ${w * 0.02} ${-h * 0.08} ${w * 0.14} ${-h * 0.08}
             l ${w * 0.3} 0
             q ${w * 0.12} 0 ${w * 0.14} ${h * 0.08}
             L${w * 0.86} ${h} Z" fill="${seat}"/>
    <path d="M${w * 0.28} ${h * 0.74} h ${w * 0.44}" stroke="#5B6C75" stroke-width="3"/>
    <path d="M${w * 0.28} ${h * 0.86} h ${w * 0.44}" stroke="#5B6C75" stroke-width="3"/>
    ${stains}
  </g>
  <!-- steering wheel -->
  <g opacity="0.9">
    <circle cx="${w * 0.5}" cy="${h * 0.56}" r="${w * 0.16}" fill="none" stroke="#0F171B" stroke-width="${w * 0.045}"/>
    <path d="M${w * 0.5} ${h * 0.56} h ${w * 0.15} M${w * 0.5} ${h * 0.56} l ${-w * 0.11} ${h * 0.06} M${w * 0.5} ${h * 0.56} l ${-w * 0.11} ${-h * 0.06}"
      stroke="#0F171B" stroke-width="${w * 0.035}"/>
  </g>
  ${soiled ? `<rect width="${w}" height="${h}" filter="url(#${id}-grime)" opacity="0.3"/>` : sparkles(w * 0.5, h * 0.5, w * 0.36, 6)}`
}

/** Bare, freshly finished apartment — the "rehabilitation cleaning" card. */
function bareRoomScene(id, w, h) {
  const floorY = h * 0.72
  return `
  ${room(id, w, h, floorY)}
  ${window_(id, w * 0.55, h * 0.2, w * 0.36, h * 0.36)}
  <rect x="${w * 0.06}" y="${floorY - h * 0.05}" width="${w * 0.16}" height="${h * 0.05}" rx="3" fill="${P.wallBottom}"/>
  <g opacity="0.5" stroke="${P.floorDark}" stroke-width="1.5" fill="none">
    ${Array.from({ length: 5 }, (_, i) => `<path d="M0 ${n(floorY + (h - floorY) * (i / 5))} H${w}"/>`).join('')}
  </g>
  ${extractor(id, w * 0.1, floorY + h * 0.12, (w / 320) * 0.85)}
  ${sparkles(w * 0.55, h * 0.55, w * 0.3, 6)}`
}

/** Mosque interior: mihrab arch, columns and prayer-rug rows. */
function mosqueScene(id, w, h, state = 'after') {
  const soiled = state === 'before'
  const floorY = h * 0.62
  const rug = soiled ? '#9E9376' : '#1F7A5A'
  const rugAlt = soiled ? '#8A8067' : '#186349'
  const rows = Array.from({ length: 5 }, (_, i) => {
    const y = floorY + (h - floorY) * (i / 5)
    const inset = w * 0.04 * (5 - i) * 0.2
    return `<rect x="${n(inset)}" y="${n(y)}" width="${n(w - inset * 2)}" height="${n((h - floorY) / 5 - 3)}"
      fill="${i % 2 ? rugAlt : rug}" opacity="${soiled ? 0.75 : 0.92}"/>`
  }).join('')
  const r = rng(4242)
  const dirt = soiled
    ? Array.from({ length: 14 }, () => {
        const x = r() * w
        const y = floorY + r() * (h - floorY)
        return `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(10 + r() * 26)}" ry="${n(5 + r() * 11)}" fill="#5C5238" opacity="${n(0.12 + r() * 0.2)}"/>`
      }).join('')
    : ''

  return `
  <rect width="${w}" height="${h}" fill="url(#${id}-wall)"/>
  <!-- mihrab -->
  <path d="M${w * 0.36} ${floorY} V${h * 0.3} a ${w * 0.14} ${w * 0.14} 0 0 1 ${w * 0.28} 0 V${floorY} Z"
    fill="${P.teal}" opacity="0.14"/>
  <path d="M${w * 0.4} ${floorY} V${h * 0.32} a ${w * 0.1} ${w * 0.1} 0 0 1 ${w * 0.2} 0 V${floorY} Z"
    fill="${P.tealDeep}" opacity="0.2"/>
  <path d="M${w * 0.44} ${floorY} V${h * 0.35} a ${w * 0.06} ${w * 0.06} 0 0 1 ${w * 0.12} 0 V${floorY} Z"
    fill="${P.gold}" opacity="0.35"/>
  <!-- columns -->
  <g fill="${P.white}" opacity="0.85">
    <rect x="${w * 0.1}" y="${h * 0.24}" width="${w * 0.055}" height="${floorY - h * 0.24}" rx="6"/>
    <rect x="${w * 0.845}" y="${h * 0.24}" width="${w * 0.055}" height="${floorY - h * 0.24}" rx="6"/>
  </g>
  <g fill="${P.gold}" opacity="0.5">
    <circle cx="${w * 0.127}" cy="${h * 0.24}" r="${w * 0.035}"/>
    <circle cx="${w * 0.872}" cy="${h * 0.24}" r="${w * 0.035}"/>
  </g>
  <!-- chandelier -->
  <path d="M${w * 0.5} 0 V${h * 0.12}" stroke="${P.woodDark}" stroke-width="3"/>
  <circle cx="${w * 0.5}" cy="${h * 0.16}" r="${w * 0.045}" fill="${P.gold}" opacity="0.75"/>
  <rect y="${floorY - 8}" width="${w}" height="8" fill="${P.white}" opacity="0.7"/>
  ${rows}
  ${dirt}
  ${soiled ? `<rect y="${floorY}" width="${w}" height="${h - floorY}" filter="url(#${id}-grime)" opacity="0.4"/>` : sparkles(w * 0.5, h * 0.75, w * 0.35, 6)}`
}

/** Open-plan office: desks, chairs and a glazed partition. */
function officeScene(id, w, h, state = 'after') {
  const soiled = state === 'before'
  const floorY = h * 0.66
  const desk = soiled ? '#C9BFAE' : '#EDE7DD'
  const r = rng(7171)
  const dust = soiled
    ? Array.from({ length: 12 }, () => {
        const x = r() * w
        const y = h * 0.4 + r() * (h * 0.55)
        return `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(12 + r() * 24)}" ry="${n(5 + r() * 10)}" fill="#7C7053" opacity="${n(0.1 + r() * 0.16)}"/>`
      }).join('')
    : ''

  const workstation = (x, y, s) => `
    <g>
      <rect x="${n(x)}" y="${n(y)}" width="${n(150 * s)}" height="${n(10 * s)}" rx="4" fill="${desk}"/>
      <rect x="${n(x + 10 * s)}" y="${n(y + 10 * s)}" width="${n(8 * s)}" height="${n(46 * s)}" fill="${P.floorDark}"/>
      <rect x="${n(x + 132 * s)}" y="${n(y + 10 * s)}" width="${n(8 * s)}" height="${n(46 * s)}" fill="${P.floorDark}"/>
      <rect x="${n(x + 46 * s)}" y="${n(y - 34 * s)}" width="${n(60 * s)}" height="${n(34 * s)}" rx="3" fill="${P.navy}" opacity="0.82"/>
      <rect x="${n(x + 50 * s)}" y="${n(y - 30 * s)}" width="${n(52 * s)}" height="${n(26 * s)}" rx="2" fill="${P.tealLight}" opacity="0.5"/>
      <rect x="${n(x + 68 * s)}" y="${n(y + 2 * s)}" width="${n(18 * s)}" height="${n(6 * s)}" fill="${P.navy}" opacity="0.3"/>
      <g>
        <rect x="${n(x + 56 * s)}" y="${n(y + 22 * s)}" width="${n(42 * s)}" height="${n(12 * s)}" rx="5" fill="${P.teal}" opacity="0.85"/>
        <rect x="${n(x + 60 * s)}" y="${n(y - 4 * s)}" width="${n(34 * s)}" height="${n(28 * s)}" rx="6" fill="${P.teal}" opacity="0.65"/>
        <rect x="${n(x + 74 * s)}" y="${n(y + 34 * s)}" width="${n(6 * s)}" height="${n(22 * s)}" fill="${P.navy}" opacity="0.6"/>
      </g>
    </g>`

  return `
  ${room(id, w, h, floorY)}
  <!-- glazed partition -->
  <g opacity="0.55">
    <rect x="${w * 0.6}" y="${h * 0.12}" width="${w * 0.36}" height="${floorY - h * 0.12}" fill="url(#${id}-glass)" opacity="0.6"/>
    <rect x="${w * 0.6}" y="${h * 0.12}" width="${w * 0.36}" height="${floorY - h * 0.12}" fill="none" stroke="${P.white}" stroke-width="4"/>
    <path d="M${w * 0.78} ${h * 0.12} V${floorY}" stroke="${P.white}" stroke-width="4"/>
  </g>
  ${workstation(w * 0.05, h * 0.52, (w / 800) * 1.05)}
  ${workstation(w * 0.62, h * 0.5, (w / 800) * 0.78)}
  ${plant(id, w * 0.55, floorY, (w / 800) * 0.7)}
  ${dust}
  ${soiled ? `<rect width="${w}" height="${h}" filter="url(#${id}-grime)" opacity="0.32"/>` : sparkles(w * 0.35, h * 0.35, w * 0.25, 5)}`
}

/** Retail unit: shelving, display window and counter. */
function shopScene(id, w, h) {
  const floorY = h * 0.72
  const shelf = (x, y, cw, ch) => `
    <g>
      <rect x="${n(x)}" y="${n(y)}" width="${n(cw)}" height="${n(ch)}" rx="4" fill="${P.wallBottom}"/>
      ${Array.from({ length: 3 }, (_, i) => `<rect x="${n(x)}" y="${n(y + (ch / 3) * (i + 1) - 4)}" width="${n(cw)}" height="4" fill="${P.woodDark}" opacity="0.5"/>`).join('')}
      ${Array.from({ length: 6 }, (_, i) => {
        const bx = x + 8 + (i % 3) * (cw / 3)
        const by = y + 8 + Math.floor(i / 3) * (ch / 3)
        return `<rect x="${n(bx)}" y="${n(by)}" width="${n(cw / 4)}" height="${n(ch / 5)}" rx="3" fill="${i % 2 ? P.teal : P.gold}" opacity="0.7"/>`
      }).join('')}
    </g>`
  return `
  ${room(id, w, h, floorY)}
  ${window_(id, w * 0.56, h * 0.16, w * 0.36, h * 0.44)}
  ${shelf(w * 0.05, h * 0.24, w * 0.2, h * 0.42)}
  ${shelf(w * 0.28, h * 0.24, w * 0.2, h * 0.42)}
  <g>
    <rect x="${w * 0.55}" y="${h * 0.62}" width="${w * 0.34}" height="${h * 0.1}" rx="6" fill="${P.wood}"/>
    <rect x="${w * 0.55}" y="${h * 0.6}" width="${w * 0.34}" height="${h * 0.03}" rx="4" fill="#C99B67"/>
    <rect x="${w * 0.72}" y="${h * 0.52}" width="${w * 0.1}" height="${h * 0.08}" rx="4" fill="${P.navy}" opacity="0.8"/>
  </g>
  ${plant(id, w * 0.94, floorY, (w / 800) * 0.7)}
  ${sparkles(w * 0.45, h * 0.4, w * 0.3, 6)}`
}

/** Water tank, cut away so the inside reads as clean or fouled. */
function tankScene(id, w, h, state = 'after') {
  const soiled = state === 'before'
  const floorY = h * 0.78
  const water = soiled ? '#7E8C5A' : '#57C2D8'
  const waterDeep = soiled ? '#5E6B3E' : '#2E9CB8'
  const r = rng(1919)
  const sludge = soiled
    ? Array.from({ length: 10 }, () => {
        const x = w * 0.24 + r() * w * 0.5
        const y = h * 0.6 + r() * h * 0.12
        return `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(14 + r() * 30)}" ry="${n(5 + r() * 9)}" fill="#4A4326" opacity="${n(0.3 + r() * 0.3)}"/>`
      }).join('')
    : ''
  return `
  ${room(id, w, h, floorY)}
  <g>
    <rect x="${w * 0.2}" y="${h * 0.2}" width="${w * 0.6}" height="${h * 0.56}" rx="18" fill="${P.white}" opacity="0.95"/>
    <rect x="${w * 0.23}" y="${h * 0.24}" width="${w * 0.54}" height="${h * 0.48}" rx="12" fill="#E7EFF1"/>
    <path d="M${w * 0.23} ${h * 0.44} h ${w * 0.54} v ${h * 0.28} a 12 12 0 0 1 -12 12 h ${w * 0.54 - 24} a 12 12 0 0 1 -12 -12 Z"
      fill="${water}"/>
    <path d="M${w * 0.23} ${h * 0.44} q ${w * 0.135} ${-h * 0.03} ${w * 0.27} 0 t ${w * 0.27} 0 v ${h * 0.05} h ${-w * 0.54} Z"
      fill="${waterDeep}" opacity="0.55"/>
    ${sludge}
    <rect x="${w * 0.42}" y="${h * 0.14}" width="${w * 0.16}" height="${h * 0.07}" rx="6" fill="${P.wallBottom}"/>
    <rect x="${w * 0.45}" y="${h * 0.1}" width="${w * 0.1}" height="${h * 0.05}" rx="4" fill="${P.floorDark}"/>
    <path d="M${w * 0.8} ${h * 0.34} h ${w * 0.1}" stroke="${P.navy}" stroke-width="${w * 0.022}" stroke-linecap="round" opacity="0.7"/>
    <path d="M${w * 0.2} ${h * 0.62} h ${-w * 0.1}" stroke="${P.navy}" stroke-width="${w * 0.022}" stroke-linecap="round" opacity="0.7"/>
  </g>
  ${soiled ? '' : sparkles(w * 0.5, h * 0.5, w * 0.24, 6, '#FFFFFF')}`
}

/* ------------------------------------------------------------------ */
/* Scene compositions                                                  */
/* ------------------------------------------------------------------ */

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">${body}</svg>\n`

/** Wide hero: living room, technician, extractor, sunlight. */
function sceneHero() {
  const id = 'h'
  const W = 1200
  const H = 900
  const floorY = 620
  return svg(
    W,
    H,
    `${defs(id)}
    ${room(id, W, H, floorY)}
    ${window_(id, 690, 110, 330, 340)}
    ${art(id, 200, 150, 150, 190)}
    ${curtains(id, 650, 92, 110, 400, 'after')}
    ${rug(id, 560, 750, 760, 'after')}
    ${sofa(id, 235, 380, 470, 'after')}
    ${plant(id, 1120, 645, 1.15)}
    ${technician(id, 975, 655, 2.2)}
    ${table(id, 700, 720, 210)}
    ${extractor(id, 120, 700, 1.15)}
    ${sparkles(430, 330, 230, 7)}
    <ellipse cx="820" cy="500" rx="300" ry="240" fill="url(#${id}-glow)" opacity="0.5"/>`,
  )
}

const SCENES = {
  /* --- service cards (4:3) --- */
  'service-sofa': (id) =>
    svg(
      800,
      600,
      `${defs(id)}${room(id, 800, 600, 430)}${window_(id, 540, 70, 210, 230)}
      ${rug(id, 400, 505, 560, 'after')}${sofa(id, 175, 245, 400, 'after')}
      ${plant(id, 740, 445, 0.85)}${sparkles(300, 220, 150, 5)}`,
    ),
  'service-carpet': (id) =>
    svg(
      800,
      600,
      `${defs(id)}${room(id, 800, 600, 380)}${window_(id, 70, 60, 190, 210)}
      ${rug(id, 400, 470, 640, 'after')}
      ${technician(id, 190, 430, 1.45)}${extractor(id, 470, 430, 0.85)}
      ${plant(id, 730, 390, 0.8)}${sparkles(430, 430, 190, 6)}`,
    ),
  'service-curtains': (id) =>
    svg(
      800,
      600,
      `${defs(id)}${room(id, 800, 600, 470)}${window_(id, 300, 90, 240, 300)}
      ${curtains(id, 248, 70, 142, 400, 'after')}
      ${plant(id, 700, 485, 0.85)}${sparkles(400, 190, 180, 5)}`,
    ),
  'service-mattress': (id) =>
    svg(
      800,
      600,
      `${defs(id)}${room(id, 800, 600, 440)}${window_(id, 560, 70, 200, 200)}
      ${mattress(id, 150, 330, 480, 'after')}${plant(id, 730, 455, 0.75)}
      ${sparkles(380, 300, 200, 6)}`,
    ),
  'service-deep': (id) =>
    svg(
      800,
      600,
      `${defs(id)}${room(id, 800, 600, 420)}${window_(id, 60, 60, 200, 220)}
      ${kitchen(id, 400, 175, 370, 240, 'after')}
      ${rug(id, 300, 505, 400, 'after')}
      ${technician(id, 195, 470, 1.4)}${extractor(id, 590, 470, 0.75)}
      ${sparkles(500, 240, 190, 6)}`,
    ),
  'service-pest': (id) =>
    svg(
      800,
      600,
      `${defs(id)}${room(id, 800, 600, 440)}${window_(id, 580, 70, 180, 200)}
      ${kitchen(id, 55, 190, 300, 240, 'after')}
      ${pestTech(id, 470, 500, 1.55)}
      ${plant(id, 740, 460, 0.7)}`,
    ),
  'service-majlis': (id) =>
    svg(
      800,
      600,
      `${defs(id)}${room(id, 800, 600, 420)}${window_(id, 320, 55, 170, 180)}
      ${rug(id, 400, 505, 660, 'after')}
      <g>
        <rect x="60" y="330" width="230" height="70" rx="24" fill="url(#${id}-sofa)"/>
        <rect x="60" y="288" width="230" height="52" rx="20" fill="url(#${id}-sofa)"/>
        <rect x="510" y="330" width="230" height="70" rx="24" fill="url(#${id}-sofa)"/>
        <rect x="510" y="288" width="230" height="52" rx="20" fill="url(#${id}-sofa)"/>
        <rect x="300" y="300" width="200" height="60" rx="22" fill="url(#${id}-sofa)"/>
        <rect x="100" y="250" width="60" height="60" rx="12" fill="${P.teal}" opacity="0.85" transform="rotate(-6 130 280)"/>
        <rect x="620" y="250" width="60" height="60" rx="12" fill="${P.gold}" opacity="0.8" transform="rotate(7 650 280)"/>
      </g>
      ${sparkles(400, 250, 220, 6)}`,
    ),

  /* --- service scenes for the landing pages (4:3) --- */
  'service-mosque': (id) => svg(800, 600, `${defs(id)}${mosqueScene(id, 800, 600)}`),
  'service-office': (id) => svg(800, 600, `${defs(id)}${officeScene(id, 800, 600)}`),
  'service-shop': (id) => svg(800, 600, `${defs(id)}${shopScene(id, 800, 600)}`),
  'service-tank': (id) => svg(800, 600, `${defs(id)}${tankScene(id, 800, 600)}`),
  'service-pool': (id) => svg(800, 600, `${defs(id)}${poolScene(id, 800, 600)}`),
  'service-car': (id) => svg(800, 600, `${defs(id)}${carScene(id, 800, 600)}`),

  /* --- landing heroes (16:10) --- */
  'hero-mosque': (id) => svg(1200, 750, `${defs(id)}${mosqueScene(id, 1200, 750)}`),
  'hero-office': (id) => svg(1200, 750, `${defs(id)}${officeScene(id, 1200, 750)}`),
  'hero-pool': (id) => svg(1200, 750, `${defs(id)}${poolScene(id, 1200, 750)}`),
  'hero-car': (id) => svg(1200, 750, `${defs(id)}${carScene(id, 1200, 750)}`),
  'hero-tank': (id) => svg(1200, 750, `${defs(id)}${tankScene(id, 1200, 750)}`),
  'hero-shop': (id) => svg(1200, 750, `${defs(id)}${shopScene(id, 1200, 750)}`),
  'hero-rehab': (id) => svg(1200, 750, `${defs(id)}${bareRoomScene(id, 1200, 750)}`),

  /* --- new before / after pairs (3:2) --- */
  'ba-car-before': (id) => svg(1200, 800, `${defs(id)}${carScene(id, 1200, 800, 'before')}`),
  'ba-car-after': (id) => svg(1200, 800, `${defs(id)}${carScene(id, 1200, 800, 'after')}`),
  'ba-pool-before': (id) => svg(1200, 800, `${defs(id)}${poolScene(id, 1200, 800, 'before')}`),
  'ba-pool-after': (id) => svg(1200, 800, `${defs(id)}${poolScene(id, 1200, 800, 'after')}`),
  'ba-tank-before': (id) => svg(1200, 800, `${defs(id)}${tankScene(id, 1200, 800, 'before')}`),
  'ba-tank-after': (id) => svg(1200, 800, `${defs(id)}${tankScene(id, 1200, 800, 'after')}`),
  'ba-mosque-before': (id) => svg(1200, 800, `${defs(id)}${mosqueScene(id, 1200, 800, 'before')}`),
  'ba-mosque-after': (id) => svg(1200, 800, `${defs(id)}${mosqueScene(id, 1200, 800, 'after')}`),
  'ba-office-before': (id) => svg(1200, 800, `${defs(id)}${officeScene(id, 1200, 800, 'before')}`),
  'ba-office-after': (id) => svg(1200, 800, `${defs(id)}${officeScene(id, 1200, 800, 'after')}`),

  /* --- category cards (4:5 portrait) --- */
  'cat-mosque': (id) => svg(320, 400, `${defs(id)}${mosqueScene(id, 320, 400)}`),
  'cat-commercial': (id) => svg(320, 400, `${defs(id)}${officeScene(id, 320, 400)}`),
  'cat-rehab': (id) => svg(320, 400, `${defs(id)}${bareRoomScene(id, 320, 400)}`),
  'cat-furniture': (id) =>
    svg(
      320,
      400,
      `${defs(id)}${room(id, 320, 400, 290)}${window_(id, 190, 60, 110, 150)}
      ${rug(id, 160, 340, 280, 'after')}${sofa(id, 30, 190, 230, 'after')}
      ${plant(id, 286, 300, 0.6)}${sparkles(150, 150, 90, 5)}`,
    ),
  'cat-pools': (id) => svg(320, 400, `${defs(id)}${poolScene(id, 320, 400)}`),
  'cat-cars': (id) => svg(320, 400, `${defs(id)}${carScene(id, 320, 400)}`),
  'cat-pest': (id) =>
    svg(
      320,
      400,
      `${defs(id)}${room(id, 320, 400, 300)}${window_(id, 200, 60, 100, 130)}
      ${kitchen(id, 20, 120, 150, 170, 'after')}${pestTech(id, 215, 330, 1.1)}`,
    ),

  /* --- before / after pairs (3:2) --- */
  'ba-sofa-before': (id) => baSofa(id, 'before'),
  'ba-sofa-after': (id) => baSofa(id, 'after'),
  'ba-carpet-before': (id) => baCarpet(id, 'before'),
  'ba-carpet-after': (id) => baCarpet(id, 'after'),
  'ba-mattress-before': (id) => baMattress(id, 'before'),
  'ba-mattress-after': (id) => baMattress(id, 'after'),
  'ba-kitchen-before': (id) => baKitchen(id, 'before'),
  'ba-kitchen-after': (id) => baKitchen(id, 'after'),

  /* --- editorial (3:2) --- */
  'blog-sofa-care': (id) =>
    svg(
      720,
      480,
      `${defs(id)}${room(id, 720, 480, 350)}${window_(id, 470, 50, 200, 210)}
      ${sofa(id, 90, 200, 380, 'after')}${plant(id, 655, 360, 0.7)}${sparkles(250, 180, 140, 4)}`,
    ),
  'blog-carpet-deep': (id) =>
    svg(
      720,
      480,
      `${defs(id)}${room(id, 720, 480, 320)}${window_(id, 60, 50, 170, 180)}
      ${rug(id, 380, 390, 540, 'after')}${technician(id, 170, 375, 1.15)}
      ${extractor(id, 430, 375, 0.72)}`,
    ),
  'blog-curtains': (id) =>
    svg(
      720,
      480,
      `${defs(id)}${room(id, 720, 480, 400)}${window_(id, 280, 70, 210, 260)}
      ${curtains(id, 205, 50, 125, 355, 'after')}${plant(id, 645, 408, 0.7)}`,
    ),
  'blog-mattress': (id) =>
    svg(
      720,
      480,
      `${defs(id)}${room(id, 720, 480, 360)}${window_(id, 500, 50, 180, 180)}
      ${mattress(id, 110, 260, 420, 'after')}${sparkles(320, 240, 170, 5)}`,
    ),
  'blog-car-interior': (id) => svg(720, 480, `${defs(id)}${carScene(id, 720, 480, 'after')}`),
  'blog-water-tank': (id) => svg(720, 480, `${defs(id)}${tankScene(id, 720, 480, 'after')}`),
  'blog-mosque-carpet': (id) => svg(720, 480, `${defs(id)}${mosqueScene(id, 720, 480, 'after')}`),
  'blog-pest-kitchen': (id) =>
    svg(
      720,
      480,
      `${defs(id)}${room(id, 720, 480, 370)}${window_(id, 520, 50, 160, 170)}
      ${kitchen(id, 60, 130, 330, 240, 'after')}${pestTech(id, 470, 400, 1.25)}
      ${sparkles(230, 200, 150, 4)}`,
    ),

  /* --- offers & packages (16:10) --- */
  'offer-sofa-9': (id) =>
    svg(
      900,
      560,
      `${defs(id)}${room(id, 900, 560, 400)}${window_(id, 640, 50, 210, 220)}
      ${rug(id, 430, 470, 620, 'after')}${sofa(id, 130, 210, 470, 'after')}
      ${sparkles(400, 190, 230, 7)}`,
    ),
  'offer-carpet-bundle': (id) =>
    svg(
      900,
      560,
      `${defs(id)}${room(id, 900, 560, 350)}${window_(id, 70, 50, 190, 200)}
      ${rug(id, 470, 430, 700, 'after')}${technician(id, 250, 415, 1.4)}
      ${extractor(id, 560, 415, 0.85)}${sparkles(480, 330, 230, 6)}`,
    ),
  'offer-deep-home': (id) =>
    svg(
      900,
      560,
      `${defs(id)}${room(id, 900, 560, 390)}${window_(id, 60, 50, 190, 200)}
      ${kitchen(id, 430, 150, 420, 250, 'after')}${technician(id, 240, 440, 1.5)}
      ${extractor(id, 30, 440, 0.85)}${sparkles(600, 210, 220, 6)}`,
    ),
  'package-fresh-home': (id) =>
    svg(
      900,
      560,
      `${defs(id)}${room(id, 900, 560, 400)}${window_(id, 620, 60, 220, 230)}
      ${curtains(id, 578, 45, 130, 360, 'after')}
      ${rug(id, 420, 470, 660, 'after')}${sofa(id, 130, 220, 430, 'after')}
      ${plant(id, 862, 412, 0.8)}${sparkles(420, 200, 240, 7)}`,
    ),
  'package-full-care': (id) =>
    svg(
      900,
      560,
      `${defs(id)}${room(id, 900, 560, 380)}${window_(id, 70, 50, 190, 200)}
      ${mattress(id, 440, 235, 420, 'after')}${rug(id, 280, 465, 440, 'after')}
      ${technician(id, 200, 430, 1.4)}${sparkles(620, 205, 200, 6)}`,
    ),
  'package-seasonal': (id) =>
    svg(
      900,
      560,
      `${defs(id)}${room(id, 900, 560, 400)}${window_(id, 330, 60, 230, 260)}
      ${curtains(id, 252, 42, 140, 370, 'after')}${kitchen(id, 630, 185, 240, 215, 'after')}
      ${extractor(id, 70, 415, 0.9)}${sparkles(460, 215, 230, 6)}`,
    ),
}

function baSofa(id, state) {
  return svg(
    1200,
    800,
    `${defs(id)}${room(id, 1200, 800, 560)}${window_(id, 860, 90, 260, 290)}
    ${rug(id, 600, 680, 900, state)}${sofa(id, 240, 300, 620, state)}
    ${plant(id, 1110, 575, 0.9)}
    ${state === 'after' ? sparkles(520, 280, 300, 8) : ''}`,
  )
}

function baCarpet(id, state) {
  return svg(
    1200,
    800,
    `${defs(id)}${room(id, 1200, 800, 470)}${window_(id, 100, 70, 240, 260)}
    ${rug(id, 620, 620, 940, state)}
    ${art(id, 700, 120, 190, 230)}
    ${plant(id, 1090, 480, 0.95)}
    ${state === 'after' ? sparkles(620, 560, 320, 8) : ''}`,
  )
}

function baMattress(id, state) {
  return svg(
    1200,
    800,
    `${defs(id)}${room(id, 1200, 800, 560)}${window_(id, 880, 80, 240, 250)}
    ${mattress(id, 200, 380, 700, state)}${plant(id, 1110, 570, 0.85)}
    ${state === 'after' ? sparkles(540, 350, 280, 7) : ''}`,
  )
}

function baKitchen(id, state) {
  return svg(
    1200,
    800,
    `${defs(id)}${room(id, 1200, 800, 600)}${window_(id, 90, 90, 230, 250)}
    ${kitchen(id, 420, 210, 700, 380, state)}
    ${plant(id, 360, 610, 0.8)}
    ${state === 'after' ? sparkles(760, 280, 280, 7) : ''}`,
  )
}

/* ------------------------------------------------------------------ */
/* Emit                                                                */
/* ------------------------------------------------------------------ */

mkdirSync(OUT, { recursive: true })

let count = 0
writeFileSync(join(OUT, 'hero-living-room.svg'), sceneHero())
count += 1

for (const [name, build] of Object.entries(SCENES)) {
  writeFileSync(join(OUT, `${name}.svg`), build(name.slice(0, 3)))
  count += 1
}

// NOTE: the favicon and logo are the brand's own vector assets
// (`public/favicon.svg`, `src/assets/brand/`) and are deliberately NOT
// generated here — regenerating would overwrite the real logo.

console.log(`✓ generated ${count} assets → src/assets/images`)
