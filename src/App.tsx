import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { moderate } from './lib/rules'
import type {
  ModerationResult,
  TemplateType,
  InputFormat,
  Finding,
} from './lib/types'
import type { JsonValue } from './lib/adapter'
import {
  detectFormat,
  isJsonObject,
  normalizeZbs,
  normalizeFlat,
  TEMPLATE_TYPES,
} from './lib/adapter'
import { SAMPLES, DEFAULT_SAMPLE } from './lib/samples'
import { RulesModal } from './components/RulesModal'
import { installTapInteractions } from './lib/tapInteractions'

function toJson(v: unknown): string {
  return JSON.stringify(v, null, 2)
}

type ParseState =
  | { ok: true; result: ModerationResult; format: InputFormat }
  | { ok: false; error: string }

// Nhận diện format hiển thị của sheet (pseudo-JSON), không phải JSON chuẩn.
const PSEUDO_RE = /(string"|bool(true|false)|\{\d+ item|\[\d+ item|:NULL)/

function analyze(raw: string, type: TemplateType): ParseState {
  const trimmed = raw.trim()
  if (!trimmed) return { ok: false, error: 'Chưa có nội dung JSON.' }
  if (PSEUDO_RE.test(trimmed)) {
    return {
      ok: false,
      error:
        'Đây là format hiển thị của sheet (string"…", "{7 items"…), không phải JSON chuẩn. Hãy dán JSON thật (có "root" / "sections").',
    }
  }

  // Ranh giới duy nhất mà dữ liệu là `any` — JSON.parse. Ép về JsonValue rồi
  // từ đó trở đi mọi thứ đều có kiểu chặt chẽ.
  let parsed: JsonValue
  try {
    parsed = JSON.parse(trimmed) as JsonValue
  } catch (e) {
    return { ok: false, error: 'JSON không hợp lệ: ' + (e as Error).message }
  }
  if (!isJsonObject(parsed))
    return { ok: false, error: 'JSON phải là một object mẫu tin.' }

  const format = detectFormat(parsed)

  // Chuẩn hoá + chấm điểm được bọc try/catch: dữ liệu méo mó bất thường
  // (lồng sâu, kiểu sai) không được làm sập app — chỉ báo lỗi mềm.
  try {
    const template =
      format === 'zbs'
        ? normalizeZbs(parsed, type)
        : normalizeFlat(parsed, type)

    if (!template.content && !template.buttons?.length)
      return {
        ok: false,
        error:
          format === 'zbs'
            ? 'Không trích được nội dung nào từ root.sections[].'
            : 'Thiếu trường "content" (nội dung mẫu).',
      }
    return { ok: true, result: moderate(template), format }
  } catch (e) {
    return {
      ok: false,
      error: 'Không xử lý được dữ liệu mẫu: ' + (e as Error).message,
    }
  }
}

export default function App() {
  const [input, setInput] = useState<string>(() => toJson(DEFAULT_SAMPLE.raw))
  const [activeKey, setActiveKey] = useState<string>(DEFAULT_SAMPLE.key)
  const [templateType, setTemplateType] = useState<TemplateType>(
    DEFAULT_SAMPLE.type,
  )
  const [showRules, setShowRules] = useState(false)

  useEffect(() => installTapInteractions(), [])

  // Gõ vào textarea cập nhật `input` ngay (UI mượt), nhưng phần phân tích nặng
  // chỉ chạy trên giá trị đã hoãn (deferred) → tránh re-render nặng mỗi phím.
  const deferredInput = useDeferredValue(input)
  const state = useMemo(
    () => analyze(deferredInput, templateType),
    [deferredInput, templateType],
  )
  const isStale = deferredInput !== input

  function loadSample(key: string) {
    const s = SAMPLES.find((x) => x.key === key)
    if (!s) return
    setInput(toJson(s.raw))
    setTemplateType(s.type)
    setActiveKey(key)
  }

  return (
    <div className="relative min-h-screen bg-white font-sans text-black">
      <div className="roomio-grid-bg fixed inset-0 -z-10 opacity-50" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-white/80 via-white/60 to-white/80" />

      <main className="mx-auto w-full max-w-5xl space-y-6 px-5 py-6 sm:px-6 sm:py-10">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-black tracking-tight sm:text-2xl">
              ZBS Rule Check
            </h1>
            <p className="text-xs font-semibold text-zinc-500">
              Kiểm duyệt mẫu tin nhắn · 10 check tự động + checklist người
            </p>
          </div>
          <button
            onClick={() => setShowRules(true)}
            className="toolbar-action rounded-[6px] border-2 border-black bg-blue-300 px-4 py-2 text-sm font-black shadow-secondary transition-[transform,box-shadow] active:translate-x-[1px] active:translate-y-[1px]"
          >
            <span className="toolbar-action-label">Bảng rule</span>
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <InputPanel
            input={input}
            activeKey={activeKey}
            templateType={templateType}
            format={state.ok ? state.format : null}
            onChange={(v) => {
              setInput(v)
              setActiveKey('')
            }}
            onChangeType={setTemplateType}
            onLoadSample={loadSample}
          />
          <ResultPanel state={state} isStale={isStale} />
        </div>
      </main>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  )
}

// ── Input ──────────────────────────────────────────────────────────
const SELECT_CLS =
  'cursor-pointer rounded-lg border-2 border-black bg-white px-3 py-1.5 text-xs font-black text-black focus:ring-2 focus:ring-blue-300 focus:outline-none'

function InputPanel({
  input,
  activeKey,
  templateType,
  format,
  onChange,
  onChangeType,
  onLoadSample,
}: {
  input: string
  activeKey: string
  templateType: TemplateType
  format: InputFormat | null
  onChange: (v: string) => void
  onChangeType: (t: TemplateType) => void
  onLoadSample: (key: string) => void
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-blue-600">Mẫu tin JSON</p>
        {format && (
          <span className="text-[11px] font-bold text-zinc-500">
            {format === 'zbs' ? 'Đã nhận: JSON ZBS' : 'Đã nhận: schema phẳng'}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          data-tap-zone="plain"
          value={activeKey}
          onChange={(e) => onLoadSample(e.target.value)}
          className={SELECT_CLS}
        >
          <option value="" disabled>
            Chọn mẫu thử…
          </option>
          {SAMPLES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.title}
            </option>
          ))}
        </select>
        <select
          data-tap-zone="plain"
          value={templateType}
          onChange={(e) => onChangeType(e.target.value as TemplateType)}
          className={SELECT_CLS}
        >
          {TEMPLATE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              Loại: {t.label}
            </option>
          ))}
        </select>
      </div>

      <textarea
        value={input}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="h-[440px] w-full resize-none rounded-lg border-2 border-black bg-white px-3 py-2.5 font-mono text-[12px] leading-relaxed text-black focus:ring-2 focus:ring-blue-300 focus:outline-none"
      />
      <p className="text-[11px] font-semibold text-zinc-400">
        Dán JSON ZBS thật (root.sections) hoặc schema phẳng — tool tự nhận diện.
      </p>
    </section>
  )
}

// ── Result ─────────────────────────────────────────────────────────
const STATUS = {
  pass: {
    word: 'ĐẠT',
    text: 'text-green-700',
    line: 'Không phát hiện vi phạm trong 10 check tự động.',
  },
  review: {
    word: 'CẦN SOÁT',
    text: 'text-amber-700',
    line: 'Có cảnh báo bán tự động — cần người xác nhận.',
  },
  fail: {
    word: 'TỪ CHỐI',
    text: 'text-red-700',
    line: 'Vi phạm rule tự động — sửa rồi gửi duyệt lại.',
  },
} as const

function ResultPanel({
  state,
  isStale,
}: {
  state: ParseState
  isStale: boolean
}) {
  if (!state.ok) {
    return (
      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-black text-blue-600">Kết quả</p>
          <span className="text-xs font-black text-red-600">LỖI JSON</span>
        </div>
        <p className="text-xs font-bold text-red-600">{state.error}</p>
      </section>
    )
  }

  const { result } = state
  const s = STATUS[result.status]

  return (
    <section
      className={`space-y-5 transition-opacity duration-150 ${
        isStale ? 'opacity-60' : ''
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-black text-blue-600">Kết quả</p>
          <span className={`text-xs font-black ${s.text}`}>{s.word}</span>
        </div>
        <p className="mt-1 text-xs font-bold text-zinc-600">{s.line}</p>
        <p className="mt-1 text-[11px] font-bold text-zinc-500">
          <span className={result.tag ? 'text-blue-600' : 'text-amber-600'}>
            {result.tag ?? 'Chưa gắn Tag'}
          </span>
          {' · '}
          {result.paramCount} tham số{' · '}
          <span className={result.errors.length ? 'text-red-600' : ''}>
            {result.errors.length} lỗi
          </span>
          {' · '}
          <span className={result.warnings.length ? 'text-amber-600' : ''}>
            {result.warnings.length} cảnh báo
          </span>
        </p>
      </div>

      {result.errors.length > 0 && (
        <FindingGroup title="Lỗi tự động" findings={result.errors} />
      )}
      {result.warnings.length > 0 && (
        <FindingGroup title="Cảnh báo" findings={result.warnings} />
      )}
      {result.errors.length === 0 && result.warnings.length === 0 && (
        <p className="py-8 text-center text-sm font-bold text-zinc-400">
          Sạch 10 check tự động.
        </p>
      )}

      <HumanChecklist items={result.checklist} />
    </section>
  )
}

function FindingGroup({
  title,
  findings,
}: {
  title: string
  findings: Finding[]
}) {
  return (
    <div>
      <p className="mb-1 text-sm font-black text-blue-600">{title}</p>
      {findings.map((f) => (
        <FindingRow key={f.check} f={f} />
      ))}
    </div>
  )
}

function FindingRow({ f }: { f: Finding }) {
  const dot = f.severity === 'error' ? 'bg-red-500' : 'bg-amber-400'
  return (
    <div className="border-b border-black/10 py-3">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
        <span className="text-sm font-black text-black">{f.label}</span>
        <span className="ml-auto shrink-0 text-[10px] font-bold text-zinc-400">
          {f.rule} · {f.check}
        </span>
      </div>
      <p className="mt-1 text-xs font-semibold text-zinc-500">{f.message}</p>
      {f.evidence && f.evidence.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {f.evidence.map((e, i) => (
            <code
              key={i}
              className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-700"
            >
              {e}
            </code>
          ))}
        </div>
      )}
      {f.suggestion && (
        <p className="mt-1.5 text-[11px] font-bold text-blue-600">
          → {f.suggestion}
        </p>
      )}
    </div>
  )
}

// ── Human review checklist ─────────────────────────────────────────
function HumanChecklist({ items }: { items: ModerationResult['checklist'] }) {
  const triggered = items.filter((i) => i.triggered).length
  return (
    <div>
      <p className="mb-1 text-sm font-black text-blue-600">
        Cần người kiểm duyệt
        {triggered > 0 && (
          <span className="font-bold text-zinc-400">
            {' · '}
            {triggered} mục có dấu hiệu
          </span>
        )}
      </p>
      {items.map((it) => (
        <div key={it.rule} className="border-b border-black/10 py-3">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                it.triggered ? 'bg-purple-500' : 'bg-zinc-300'
              }`}
            />
            <span className="text-sm font-black text-black">{it.label}</span>
            <span className="ml-auto shrink-0 text-[10px] font-bold text-zinc-400">
              {it.rule}
              {it.triggered && (
                <span className="ml-1 font-black text-purple-600">
                  · có dấu hiệu
                </span>
              )}
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-zinc-500">{it.note}</p>
          {it.triggered && it.hint && (
            <p className="mt-1 text-[11px] font-bold text-purple-700">
              {it.hint}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
