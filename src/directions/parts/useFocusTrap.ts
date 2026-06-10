// useFocusTrap — Task #93 accessibility round (Item 2).
//
// Constrains Tab/Shift+Tab keyboard navigation within a container element when
// `active` is true. Registers a keydown listener on the document so it fires
// regardless of where focus currently lives, then acts only when the active
// element is inside (or on) the container — or wraps when leaving the edges.
//
// Edge cases:
//   - Zero focusable elements: listener is a no-op (no throw).
//   - One focusable element: Tab/Shift+Tab keep focus on that element.
//   - Elements hidden via display:none are excluded (offsetParent check).
//   - Elements with tabindex="-1" are excluded (they are not keyboard-reachable
//     via Tab even though they appear in some broader selectors).
//   - Self-healing: if Tab fires while focus is OUTSIDE the container (e.g. after
//     a programmatic focus shift to body), the trap recovers by directing focus to
//     the first or last focusable rather than letting Tab walk the background.
//   - No focus-on-mount side-effects; callers already handle initial focus.

import { useEffect } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getVisible(container: HTMLElement): HTMLElement[] {
  const all = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
  return all.filter(el => {
    // Exclude elements explicitly removed from the tab order.
    if (el.getAttribute('tabindex') === '-1') return false
    // offsetParent is null for display:none or visibility:hidden ancestors,
    // EXCEPT for position:fixed elements.
    if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return false
    if (getComputedStyle(el).display === 'none') return false
    if (getComputedStyle(el).visibility === 'hidden') return false
    return true
  })
}

export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  active: boolean,
): void {
  // containerRef is intentionally omitted from deps: the ref object is stable
  // for the lifetime of the host component (React guarantees this). Adding it
  // would cause the listener to re-register on every render for no benefit.
  useEffect(() => {
    if (!active) return
    const container = containerRef.current
    if (!container) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusable = getVisible(container)
      if (focusable.length === 0) {
        // No focusable children — prevent Tab from leaving.
        e.preventDefault()
        return
      }

      const first = focusable[0]
      const last  = focusable[focusable.length - 1]

      if (!container.contains(document.activeElement)) {
        // Self-healing: focus is outside the container (e.g. shifted to body
        // programmatically). Redirect it to the correct edge instead of letting
        // Tab walk the background page.
        e.preventDefault()
        if (e.shiftKey) {
          last.focus()
        } else {
          first.focus()
        }
        return
      }

      if (e.shiftKey) {
        // Shift+Tab: if on or before first, wrap to last
        if (document.activeElement === first || document.activeElement === container) {
          e.preventDefault()
          last.focus()
        }
      } else {
        // Tab: if on last, wrap to first
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    // Listen on document so we get keydown regardless of which element has focus.
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])
}
