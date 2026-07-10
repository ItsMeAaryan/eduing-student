import { useEffect, useRef } from 'react'

/**
 * Traps keyboard focus within a modal/dialog while it is open:
 * - focuses the container (or first focusable element) on open
 * - Tab/Shift+Tab cycle within the container instead of escaping to the page
 * - Escape calls onClose
 * - focus is restored to the previously focused element on close
 *
 * Usage:
 *   const ref = useFocusTrap<HTMLDivElement>(isOpen, onClose)
 *   <div ref={ref} role="dialog" aria-modal="true">...</div>
 */
export function useFocusTrap<T extends HTMLElement>(
  isOpen: boolean,
  onClose?: () => void
) {
  const containerRef = useRef<T | null>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    previouslyFocused.current = document.activeElement as HTMLElement | null

    const container = containerRef.current
    if (!container) return

    const getFocusable = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null)

    const focusable = getFocusable()
    ;(focusable[0] ?? container).focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
        return
      }

      if (e.key !== 'Tab') return

      const items = getFocusable()
      if (items.length === 0) {
        e.preventDefault()
        return
      }

      const first = items[0]
      const last = items[items.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused.current?.focus()
    }
  }, [isOpen, onClose])

  return containerRef
}
