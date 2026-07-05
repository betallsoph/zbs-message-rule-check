import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

// Dropdown tuỳ biến theo style Roomio (border-2 đen, popover riêng, phím mũi
// tên) — thay cho <select> mặc định của browser. Port từ roomio-web/RoomioSelect.
export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export function RoomioSelect({
  value,
  options,
  placeholder = 'Chọn một mục',
  compact = false,
  className = '',
  onChange,
}: {
  value: string
  options: SelectOption[]
  placeholder?: string
  compact?: boolean
  className?: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const selected = options.find((o) => o.value === value)

  // Click ra ngoài → đóng menu.
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [open])

  function openMenu() {
    setOpen(true)
    const sel = options.findIndex((o) => o.value === value && !o.disabled)
    setActiveIndex(sel >= 0 ? sel : options.findIndex((o) => !o.disabled))
  }

  function choose(o: SelectOption) {
    if (o.disabled) return
    onChange(o.value)
    setOpen(false)
    triggerRef.current?.focus()
  }

  function moveActive(dir: 1 | -1) {
    if (!open) {
      openMenu()
      return
    }
    if (!options.length) return
    let next = activeIndex
    for (let attempts = 0; attempts < options.length; attempts += 1) {
      next = (next + dir + options.length) % options.length
      if (!options[next]?.disabled) {
        setActiveIndex(next)
        break
      }
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      moveActive(1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      moveActive(-1)
    } else if ((e.key === 'Enter' || e.key === ' ') && open) {
      e.preventDefault()
      const o = options[activeIndex]
      if (o) choose(o)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openMenu()
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        data-tap-zone="plain"
        aria-haspopup="listbox"
        aria-expanded={open}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border-2 border-black bg-white text-left font-semibold text-black transition-colors hover:bg-blue-50 focus:ring-2 focus:ring-blue-300 focus:outline-none ${
          compact ? 'min-h-9 px-2.5 py-1.5 text-xs' : 'min-h-11 px-3 py-2 text-sm'
        }`}
      >
        <span className={`truncate ${selected ? '' : 'text-zinc-400'}`}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-600 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute top-[calc(100%+6px)] right-0 left-0 z-50 max-h-72 overflow-y-auto rounded-lg border-2 border-black bg-white p-1 shadow-secondary"
        >
          {options.map((o, index) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={value === o.value}
              disabled={o.disabled}
              data-tap-zone="plain"
              onPointerEnter={() => setActiveIndex(index)}
              onClick={() => choose(o)}
              className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-[6px] px-3 py-2 text-left text-sm font-bold text-black transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:text-zinc-300 ${
                value === o.value || activeIndex === index ? 'bg-blue-100' : ''
              }`}
            >
              <span className="truncate">{o.label}</span>
              {value === o.value && (
                <Check className="h-4 w-4 shrink-0 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
