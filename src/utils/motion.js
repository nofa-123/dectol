/**
 * Motion preference helpers.
 *
 * CSS already neutralises transitions via the duration tokens, but anything
 * scripted — Motion One sequences, rAF loops, and programmatic scrolling —
 * has to ask explicitly. Everything that animates goes through here so the
 * preference is honoured in exactly one place.
 *
 * Read live rather than cached: users can flip the OS setting mid-session.
 */

export function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
}

/**
 * Behaviour for `scrollTo` / `scrollBy` / `scrollIntoView`. An explicit
 * `behavior` option overrides the CSS `scroll-behavior` property, so passing
 * 'smooth' unconditionally would animate scrolling for users who opted out.
 */
export function scrollBehavior() {
  return prefersReducedMotion() ? 'auto' : 'smooth'
}
