import { useMediaQuery } from './useMediaQuery'

/** Returns true when the viewport is < 640px (mobile breakpoint from mobile-foundations §1). */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 639px)')
}
