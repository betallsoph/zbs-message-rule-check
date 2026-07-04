// Global interaction logic từ Roomio design system (mục 4).
// Cung cấp physical bounce cho touch + toạ độ radial hover cho .modal-action.
// (Bỏ phần delay điều hướng vì đây là SPA, không có chuyển trang.)

function findTapTarget(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null
  const interactive = target.closest<HTMLElement>(
    'button, a[href], [role="button"]',
  )
  if (!interactive || interactive.dataset.tapImmediate === 'true') return null
  if (interactive.closest('[data-tap-zone="plain"]')) return null
  if (interactive.matches(':disabled, [aria-disabled="true"]')) return null
  return interactive
}

function bounceTouchTarget(element: HTMLElement) {
  element.classList.remove('tap-sink', 'tap-bounce')
  void element.offsetWidth // trigger reflow
  element.classList.add('tap-sink')

  window.setTimeout(() => {
    if (!document.body.contains(element)) return
    element.classList.remove('tap-sink')
    void element.offsetWidth
    element.classList.add('tap-bounce')
  }, 100)
}

let installed = false

export function installTapInteractions() {
  if (installed) return
  installed = true

  // 1. Touch/mobile bounce
  document.addEventListener(
    'pointerdown',
    (event) => {
      if (event.pointerType !== 'touch') return
      const interactive = findTapTarget(event.target)
      if (interactive) bounceTouchTarget(interactive)
    },
    { passive: true },
  )

  // 2. Track mouse for radial clip-path hover origin
  document.addEventListener(
    'pointerover',
    (event) => {
      if (!(event.target instanceof Element)) return
      const action = event.target.closest<HTMLElement>(
        '.toolbar-action, .modal-action',
      )
      if (!action || action.matches(':disabled')) return

      const bounds = action.getBoundingClientRect()
      action.style.setProperty('--hover-x', `${event.clientX - bounds.left}px`)
      action.style.setProperty('--hover-y', `${event.clientY - bounds.top}px`)
    },
    { passive: true },
  )

  // 3. Cleanup animation classes
  document.addEventListener(
    'animationend',
    (event) => {
      if (
        event.animationName === 'tap-bounce' &&
        event.target instanceof HTMLElement
      ) {
        event.target.classList.remove('tap-bounce')
      }
    },
    { passive: true },
  )
}
