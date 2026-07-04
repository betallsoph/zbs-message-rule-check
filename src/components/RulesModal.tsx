import { X } from 'lucide-react'
import { CHECK_CATALOG } from '../lib/rules'

const AUTONOMY: Record<string, string> = {
  auto: 'Auto',
  semi: 'Semi',
}

export function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md animate-[scale-up_0.2s_ease-out] flex-col overflow-hidden rounded-lg border-2 border-black bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-lg font-black text-black">10 check tự động</h2>
          <button
            data-tap-zone="plain"
            className="cursor-pointer rounded-[6px] p-1.5 text-black hover:bg-zinc-100"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-6">
          <p className="mb-2 text-xs font-semibold text-zinc-500">
            Tool tự quyết 10 check dưới đây. Nhóm Human (cần giấy tờ/ngữ cảnh)
            chỉ được liệt kê để nhắc người kiểm duyệt.
          </p>
          {CHECK_CATALOG.map((c) => (
            <div
              key={c.check}
              className="flex items-center gap-3 border-b border-black/10 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-black text-black">
                  {c.label}
                </div>
                <div className="font-mono text-[10px] text-zinc-400">
                  {c.rule} · {c.check}
                </div>
              </div>
              <span className="shrink-0 text-xs font-black text-blue-600">
                {AUTONOMY[c.autonomy]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
