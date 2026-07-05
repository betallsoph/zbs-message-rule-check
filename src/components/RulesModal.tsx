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
        className="flex max-h-[85vh] w-full max-w-[980px] animate-[scale-up_0.2s_ease-out] flex-col overflow-hidden rounded-lg border-2 border-black bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-lg font-black text-black">10 mục máy tự kiểm</h2>
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
            10 mục máy tự kiểm, xếp theo mức quan trọng (cái hay bị từ chối
            nhất để trên đầu). Mã G/P là mã mình tự map; phần sau là mục gốc
            của Zalo để đối chiếu.
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
                  {c.rule} · {c.source} · {c.check}
                </div>
              </div>
              <span className="shrink-0 text-xs font-black text-blue-600">
                {AUTONOMY[c.autonomy]}
              </span>
            </div>
          ))}

          <p className="mt-5 text-sm font-black text-blue-600">
            Mấy cái này mình để yên, không cho nó tự động
          </p>
          <p className="mb-1 text-[11px] font-semibold text-zinc-500">
            Không phải vì AI không làm tool được, mà làm ẩu thì dễ báo sai, và
            nó có nhiều kiểu khác nhau. Nên mình để cho người check phần này sẽ
            kỹ hơn, lý do cụ thể ở từng dòng.
          </p>
          {EXCLUDED_CATALOG.map((e) => (
            <div key={e.rule} className="border-b border-black/10 py-2.5">
              <div className="text-sm font-black text-black">
                {e.label}{' '}
                <span className="font-mono text-[10px] text-zinc-400">
                  {e.rule} · {e.source}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-zinc-500">
                {e.reason}
              </p>
            </div>
          ))}
          <p className="mt-3 text-xs font-semibold text-zinc-500">
            Nhóm cần người kiểm duyệt (thanh toán đúng chủ, đối tượng nhận
            tin, quyền logo, dịp lễ, ngành hạn chế…) cần giấy tờ/ngữ cảnh → chỉ
            liệt kê ở checklist, máy không tự phán.
          </p>
        </div>
      </div>
    </div>
  )
}
