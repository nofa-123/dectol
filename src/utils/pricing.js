/**
 * Pricing engine.
 *
 * One module owns the arithmetic for every service kind, so the configurator,
 * the accordion header, the sticky bar, the summary step and the API payload
 * can never disagree about a price. Configurators only edit a plain config
 * object; they never compute money themselves.
 *
 * All amounts are SAR excluding VAT.
 */

export const VAT_RATE = 0.15

/** `1 ستارة` / `4 ستائر` — Arabic drops the dual here to match the designs. */
export function countLabel(n, [singular, plural]) {
  return `${n} ${n === 1 ? singular : plural}`
}

/* ------------------------------------------------------------------ */
/* Default configs                                                     */
/* ------------------------------------------------------------------ */

/** The state a service starts in when the customer first expands it. */
export function defaultConfig(service) {
  const c = service.config
  switch (c.kind) {
    case 'capacity':
      return { tierId: c.tiers[0].id, count: c.tiers[0].seats }

    case 'units':
      return {
        counts: Object.fromEntries(c.units.map((u, i) => [u.id, i === 0 ? 1 : 0])),
        addons: Object.fromEntries((c.addonGroup?.items ?? []).map((a) => [a.id, 0])),
        custom: [],
        customOpen: false,
      }

    case 'area':
      return { area: c.minArea }

    case 'simple':
      return { count: c.min ?? 1 }

    case 'choice':
      return { variantId: c.variants[0].id }

    case 'property':
      return {
        state: 'before',
        areaId: c.areaOptions.before[0].id,
        counters: Object.fromEntries(c.counters.map((x) => [x.id, x.default])),
        kitchenCabinet: true,
        notes: [],
        files: [],
      }

    default:
      return {}
  }
}

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

/** The tier a given headcount falls into, plus any overflow charge. */
function capacityBreakdown(c, count) {
  const tier = c.tiers.find((t) => count <= t.seats) ?? c.tiers[c.tiers.length - 1]
  const overflow = Math.max(0, count - c.extraAfter)
  return { tier, overflow, extra: overflow * c.extraPerUnit }
}

export function tierForCount(service, count) {
  return capacityBreakdown(service.config, count).tier
}

const areaOf = (row) => Math.max(0, Number(row.width) || 0) * Math.max(0, Number(row.height) || 0)

/**
 * Price + item count + a one-line summary for a configured service.
 * `valid` is false when the customer has expanded a service but not actually
 * chosen anything countable — the cart ignores those lines.
 */
export function priceFor(service, config) {
  const c = service.config
  const cfg = config ?? defaultConfig(service)

  switch (c.kind) {
    case 'capacity': {
      const count = Math.max(1, cfg.count ?? 1)
      const { tier, extra } = capacityBreakdown(c, count)
      return {
        total: tier.price + extra,
        count,
        valid: count > 0,
        summary: countLabel(count, c.unitNoun),
        lines: [
          { label: `${service.name} — ${tier.label}`, amount: tier.price },
          ...(extra ? [{ label: c.extraNote, amount: extra }] : []),
        ],
      }
    }

    case 'units': {
      const lines = []
      let total = 0
      let count = 0

      c.units.forEach((unit) => {
        const n = cfg.counts?.[unit.id] ?? 0
        if (!n) return
        total += n * unit.price
        count += n
        lines.push({ label: `${unit.name} × ${n}`, amount: n * unit.price })
      })

      ;(c.addonGroup?.items ?? []).forEach((addon) => {
        const n = cfg.addons?.[addon.id] ?? 0
        if (!n) return
        total += n * addon.price
        count += n
        lines.push({ label: `${addon.name} × ${n}`, amount: n * addon.price })
      })

      ;(cfg.custom ?? []).forEach((row, i) => {
        const n = Math.max(0, Number(row.count) || 0)
        const sqm = areaOf(row) * n
        if (!sqm) return
        const amount = Math.round(sqm * c.custom.pricePerSqm)
        total += amount
        count += n
        lines.push({
          label: `مقاس مخصص ${i + 1} — ${row.width}م × ${row.height}م × ${n}`,
          amount,
        })
      })

      return {
        total,
        count,
        valid: count > 0,
        summary: count ? countLabel(count, c.unitNoun) : '',
        lines,
      }
    }

    case 'area': {
      const area = Math.max(0, Number(cfg.area) || 0)
      const billable = Math.max(area, c.minArea)
      const total = Math.round(billable * c.pricePerSqm)
      return {
        total,
        count: area ? 1 : 0,
        valid: area > 0,
        summary: area ? `${area} م²` : '',
        lines: [{ label: `${service.name} — ${billable} م²`, amount: total }],
      }
    }

    case 'simple': {
      const count = Math.max(0, cfg.count ?? 0)
      return {
        total: count * c.price,
        count,
        valid: count > 0,
        summary: count ? countLabel(count, c.unitNoun) : '',
        lines: [{ label: `${service.name} × ${count}`, amount: count * c.price }],
      }
    }

    case 'choice': {
      const variant = c.variants.find((v) => v.id === cfg.variantId) ?? c.variants[0]
      return {
        total: variant.price,
        count: 1,
        valid: true,
        summary: variant.label,
        lines: [{ label: `${service.name} — ${variant.label}`, amount: variant.price }],
      }
    }

    case 'property': {
      const state = cfg.state ?? 'before'
      const bands = c.areaOptions[state]
      const band = bands.find((b) => b.id === cfg.areaId) ?? bands[0]
      const stateLabel = c.states.find((s) => s.id === state)?.label ?? ''
      return {
        total: band.price,
        count: 1,
        valid: true,
        summary: `${stateLabel} • ${band.label}`,
        lines: [{ label: `${service.name} — ${band.label}`, amount: band.price }],
      }
    }

    default:
      return { total: 0, count: 0, valid: false, summary: '', lines: [] }
  }
}

/**
 * Keeps a config internally consistent after an edit — e.g. switching a
 * property from "before" to "after" invalidates the selected area band.
 */
export function reconcile(service, config) {
  const c = service.config
  const cfg = { ...config }

  if (c.kind === 'property') {
    const bands = c.areaOptions[cfg.state] ?? c.areaOptions.before
    if (!bands.some((b) => b.id === cfg.areaId)) cfg.areaId = bands[0].id
    // Finishing notes and attachments only exist for the post-finishing flow.
    if (cfg.state !== 'after') {
      cfg.notes = []
      cfg.files = []
    }
  }

  if (c.kind === 'capacity') {
    cfg.count = Math.max(1, cfg.count ?? 1)
    cfg.tierId = capacityBreakdown(c, cfg.count).tier.id
  }

  if (c.kind === 'simple') {
    cfg.count = Math.max(c.min ?? 0, cfg.count ?? 0)
  }

  return cfg
}

/* ------------------------------------------------------------------ */
/* Display helpers                                                     */
/* ------------------------------------------------------------------ */

/** Rows for the price table on a service detail page. */
export function priceTable(service) {
  const c = service.config
  switch (c.kind) {
    case 'capacity':
      return c.tiers.map((t) => ({ label: t.label, price: t.price }))
    case 'units':
      return [
        ...c.units.map((u) => ({ label: u.name, price: u.price })),
        ...(c.addonGroup?.items ?? []).map((a) => ({ label: a.name, price: a.price, addon: true })),
      ]
    case 'area':
      return (c.presets ?? []).map((p) => ({
        label: p.label,
        price: Math.round(Math.max(p.area, c.minArea) * c.pricePerSqm),
      }))
    case 'simple':
      return [1, 4, 8].map((n) => ({ label: countLabel(n, c.unitNoun), price: n * c.price }))
    case 'choice':
      return c.variants.map((v) => ({ label: v.label, price: v.price }))
    case 'property':
      return c.areaOptions.before.map((b) => ({ label: b.label, price: b.price }))
    default:
      return []
  }
}

/** Cart-level totals from a list of `{ price }` lines. */
export function totalsFor(subtotal, discount = 0) {
  const net = Math.max(0, subtotal - discount)
  const vat = Math.round(net * VAT_RATE)
  return { subtotal, discount, net, vat, total: net + vat }
}
