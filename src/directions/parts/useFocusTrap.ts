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
//   - No focus-on-mount side-effects; callers already handle initial focus.

import { useEffect } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getVisible(container: HTMLElement): HTMLElement[] {
  const all = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
  return all.filter(el => {
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
  useEffect(() => {
    if (!active) return
    const container = containerRef.current
    if (!container) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      // Only trap if focus is currently inside the container, or on it.
      if (!container.contains(document.activeElement)) return

      const focusable = getVisible(container)
      if (focusable.length === 0) {
        // No focusable children — prevent Tab from leaving.
        e.preventDefault()
        return
      }

      const first = focusable[0]
      const last  = focusable[focusable.length - 1]

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
  }, [containerRef, active])
}
