import { X } from 'lucide-react'
import { CHECK_CATALOG } from '../lib/rules'

const AUTONOMY: Record<string, { dot: string; text: string }> = {
  auto: { dot: 'bg-green-500', text: '🟢 Auto' },
  semi: { dot: 'bg-amber-400', text: '🟡 Semi' },
}

export function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md animate-[scale-up_0.2s_ease-out] flex-col overflow-hidden rounded-lg border-2 border-black bg-white shadow-primary"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center border-b-2 border-black px-5 py-3.5">
          <span className="text-sm font-black text-black">10 check tự động</span>
          <button
            data-tap-zone="plain"
            className="ml-auto cursor-pointer rounded-[6px] p-1 text-black hover:bg-zinc-100"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          <p className="mb-1 text-xs font-semibold text-zinc-500">
            Tool tự quyết 10 check dưới đây. Nhóm 🔴 (cần giấy tờ/ngữ cảnh) chỉ
            được liệt kê để nhắc human review.
          </p>
          <div className="divide-y divide-zinc-200">
            {CHECK_CATALOG.map((c) => {
              const a = AUTONOMY[c.autonomy]
              return (
                <div key={c.check} className="flex items-center gap-2.5 py-2.5">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${a.dot}`} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black text-black">
                      {c.label}
                    </div>
                    <div className="font-mono text-[10px] text-zinc-400">
                      {c.check}
                    </div>
                  </div>
                  <span className="shrink-0 rounded border border-black bg-white px-1.5 text-[10px] font-black">
                    {c.rule}
                  </span>
                  <span className="w-14 shrink-0 text-right text-[11px] font-bold">
                    {a.text}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
