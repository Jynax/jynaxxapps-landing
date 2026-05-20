import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  /** Sheet height in dvh units. Default 85. Use 90 or 100 for full-takeover surfaces. */
  heightVh?: number
  /** Close affordance glyph. Default ×. Terminal passes [ESC] per §10 no-icon rule. */
  closeGlyph?: ReactNode
  'aria-label': string
  children: ReactNode
}

export function BottomSheet({
  open,
  onClose,
  heightVh = 85,
  closeGlyph = '×',
  'aria-label': ariaLabel,
  children,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragStartYRef = useRef(0)
  const dragCurrentYRef = useRef(0)
  const isDragging = useRef(false)

  // Lock page scroll while sheet is open
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  // Pointer events (covers both touch and mouse — Playwright-testable without CDPSession)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Don't intercept clicks on interactive elements inside the sheet
    const target = e.target as HTMLElement
    if (target.closest('button, a, input, textarea, select, [role="button"]')) return

    dragStartYRef.current = e.clientY
    dragCurrentYRef.current = e.clientY
    isDragging.current = true
    const sheet = sheetRef.current
    if (sheet) {
      sheet.setPointerCapture(e.pointerId)
      sheet.style.transition = 'none'
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return
    dragCurrentYRef.current = e.clientY
    const delta = dragCurrentYRef.current - dragStartYRef.current
    const sheet = sheetRef.current
    if (sheet && delta > 0) {
      sheet.style.transform = `translateY(${delta}px)`
    }
  }

  const handlePointerUp = () => {
    if (!isDragging.current) return
    isDragging.current = false
    const sheet = sheetRef.current
    if (!sheet) return
    const delta = dragCurrentYRef.current - dragStartYRef.current
    const sheetHeight = sheet.offsetHeight
    if (delta > sheetHeight * 0.3) {
      onClose()
    } else {
      sheet.style.transition = 'transform .2s ease'
      sheet.style.transform = ''
    }
  }

  const handlePointerCancel = () => {
    isDragging.current = false
    const sheet = sheetRef.current
    if (sheet) {
      sheet.style.transition = 'transform .2s ease'
      sheet.style.transform = ''
    }
  }

  return (
    <div
      data-bottom-sheet-root
      style={{ position: 'fixed', inset: 0, zIndex: 20000 }}
    >
      {/* Backdrop */}
      <div
        data-sheet-backdrop
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
      />

      {/* Sheet panel */}
      <div
        ref={sheetRef}
        data-bottom-sheet
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${heightVh}dvh`,
          background: 'var(--term-bg)',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'sheet-slide-in .28s cubic-bezier(.2,.7,.3,1) both',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {/* Drag handle — 36×4px centered, 8px below sheet top */}
        <div
          data-sheet-handle
          style={{ display: 'flex', justifyContent: 'center', paddingTop: 8, flexShrink: 0 }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.2)',
            }}
          />
        </div>

        {/* Sheet header with 44×44px close button */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            paddingRight: 4,
            paddingTop: 2,
            flexShrink: 0,
          }}
        >
          <button
            data-sheet-close
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              color: 'rgba(255,255,255,0.55)',
              fontSize: 14,
            }}
          >
            {closeGlyph}
          </button>
        </div>

        {/* Scrollable content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
