import { X } from 'lucide-react'
import { CHECK_CATALOG, EXCLUDED_CATALOG } from '../lib/rules'

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
            10 check được chọn tự động, xếp theo ưu tiên (impact = tần suất
            reject thật + giá trị chặn).
          </p>
          {CHECK_CATALOG.map((c, i) => (
            <div
              key={c.check}
              className="flex items-center gap-3 border-b border-black/10 py-2.5"
            >
              <span className="w-4 shrink-0 text-sm font-black text-blue-600">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-black text-black">
                  {c.label}
                </div>
                <div className="truncate text-[11px] font-semibold text-zinc-500">
                  {c.why}
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

          <p className="mt-4 mb-1 text-sm font-black text-blue-600">
            Cố tình không tự động (dù máy làm được)
          </p>
          {EXCLUDED_CATALOG.map((e) => (
            <div key={e.rule} className="border-b border-black/10 py-2.5">
              <div className="text-sm font-black text-black">
                {e.label}{' '}
                <span className="font-mono text-[10px] text-zinc-400">
                  {e.rule}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-zinc-500">
                {e.reason}
              </p>
            </div>
          ))}
          <p className="mt-3 text-[11px] font-semibold text-zinc-400">
            Nhóm Human (S1/S2/S3/S5/P2/G10) cần giấy tờ/ngữ cảnh → chỉ liệt kê
            ở checklist để nhắc người kiểm duyệt, máy không tự phán.
          </p>
        </div>
      </div>
    </div>
  )
}
