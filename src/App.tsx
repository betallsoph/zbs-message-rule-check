import { useEffect, useMemo, useState } from 'react'
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
import { RoomioSelect } from './components/RoomioSelect'
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
  if (!trimmed) return { ok: false, error: 'Bạn chưa dán nội dung nào.' }
  if (PSEUDO_RE.test(trimmed)) {
    return {
      ok: false,
      error:
        'Đây là kiểu hiển thị trong file Excel (string"…", "{7 items"…), không phải JSON thật. Bạn mở JSON gốc rồi dán vào nha.',
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
    return {
      ok: false,
      error: 'JSON phải là một object mẫu tin (bắt đầu bằng dấu {).',
    }

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
            ? 'Không đọc được nội dung nào trong JSON này.'
            : 'Thiếu phần nội dung (content) của mẫu.',
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

  // Chạy thủ công: chỉ phân tích snapshot đã "submit", không tự chạy mỗi phím.
  const [submitted, setSubmitted] = useState(() => ({
    input: toJson(DEFAULT_SAMPLE.raw),
    type: DEFAULT_SAMPLE.type,
  }))

  useEffect(() => installTapInteractions(), [])

  const state = useMemo(
    () => analyze(submitted.input, submitted.type),
    [submitted],
  )
  // Đang có thay đổi chưa kiểm tra → làm mờ kết quả cũ để nhắc bấm lại.
  const isDirty = input !== submitted.input || templateType !== submitted.type

  function run() {
    setSubmitted({ input, type: templateType })
  }

  function loadSample(key: string) {
    const s = SAMPLES.find((x) => x.key === key)
    if (!s) return
    const json = toJson(s.raw)
    setInput(json)
    setTemplateType(s.type)
    setActiveKey(key)
    setSubmitted({ input: json, type: s.type }) // mẫu mẫu chạy luôn cho tiện xem
  }

  return (
    <div className="relative min-h-screen bg-white font-sans text-black">
      <div className="roomio-grid-bg fixed inset-0 -z-10 opacity-50" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-white/80 via-white/60 to-white/80" />

      <main className="w-full space-y-6 px-5 py-6 sm:px-8 sm:py-10">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-black tracking-tight sm:text-2xl">
              Zalo Business Message Rule Check by antt
            </h1>
          </div>
          <button
            onClick={() => setShowRules(true)}
            className="toolbar-action rounded-[6px] border-2 border-black bg-blue-300 px-4 py-2 text-sm font-black shadow-secondary transition-[transform,box-shadow] active:translate-x-[1px] active:translate-y-[1px]"
          >
            <span className="toolbar-action-label">Bảng rule</span>
          </button>
        </div>

        <div className="grid gap-y-8 lg:grid-cols-3 lg:gap-x-0">
          <div className="lg:pr-8">
            <InputPanel
              input={input}
              activeKey={activeKey}
              templateType={templateType}
              format={state.ok ? state.format : null}
              dirty={isDirty}
              onChange={(v) => {
                setInput(v)
                setActiveKey('')
              }}
              onChangeType={setTemplateType}
              onLoadSample={loadSample}
              onRun={run}
            />
          </div>
          <div className="lg:border-l lg:border-black/10 lg:px-8">
            <ResultPanel state={state} isStale={isDirty} />
          </div>
          <div className="lg:border-l lg:border-black/10 lg:pl-8">
            <ChecklistPanel state={state} isStale={isDirty} />
          </div>
        </div>
      </main>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  )
}

// ── Input ──────────────────────────────────────────────────────────
function InputPanel({
  input,
  activeKey,
  templateType,
  format,
  dirty,
  onChange,
  onChangeType,
  onLoadSample,
  onRun,
}: {
  input: string
  activeKey: string
  templateType: TemplateType
  format: InputFormat | null
  dirty: boolean
  onChange: (v: string) => void
  onChangeType: (t: TemplateType) => void
  onLoadSample: (key: string) => void
  onRun: () => void
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-blue-600">Mẫu tin JSON</p>
        {format && (
          <span className="text-[11px] font-bold text-zinc-500">
            {format === 'zbs' ? 'Đã nhận: JSON ZBS' : 'Đã nhận: kiểu gọn'}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <RoomioSelect
          compact
          className="min-w-52 flex-[2]"
          value={activeKey}
          placeholder="Chọn mẫu thử…"
          options={SAMPLES.map((s) => ({ value: s.key, label: s.title }))}
          onChange={onLoadSample}
        />
        <RoomioSelect
          compact
          className="min-w-32 flex-1"
          value={templateType}
          options={TEMPLATE_TYPES.map((t) => ({
            value: t.value,
            label: `Loại: ${t.label}`,
          }))}
          onChange={(v) => onChangeType(v as TemplateType)}
        />
      </div>

      <textarea
        value={input}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="h-[420px] w-full resize-none rounded-lg border-2 border-black bg-white px-3 py-2.5 font-mono text-[12px] leading-relaxed text-black focus:ring-2 focus:ring-blue-300 focus:outline-none"
      />

      <button
        onClick={onRun}
        className="modal-action w-full rounded-[6px] border-2 border-black bg-blue-300 px-4 py-2.5 text-sm font-black text-black shadow-secondary transition-[transform,box-shadow] active:translate-x-[1px] active:translate-y-[1px]"
      >
        <span className="modal-action-label">Kiểm tra thử ngay!</span>
      </button>
      <p className="text-[11px] font-semibold text-zinc-400">
        {dirty
          ? 'Bạn vừa sửa nội dung — bấm Kiểm tra thử ngay! để chạy lại nha.'
          : 'Dán JSON của mẫu tin vào đây rồi bấm nút. Tool tự hiểu định dạng.'}
      </p>
    </section>
  )
}

// ── Result ─────────────────────────────────────────────────────────
const STATUS = {
  pass: {
    word: 'ĐẠT',
    text: 'text-green-700',
    line: 'Máy không thấy lỗi nào trong 10 mục tự kiểm.',
  },
  review: {
    word: 'CẦN SOÁT',
    text: 'text-amber-700',
    line: 'Có vài chỗ máy nghi nghi — bạn xem lại giúp nha.',
  },
  fail: {
    word: 'TỪ CHỐI',
    text: 'text-red-700',
    line: 'Có lỗi máy bắt được — sửa rồi hẵng gửi duyệt nha.',
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
          <span className="text-xs font-black text-red-600">
            JSON CHƯA ĐÚNG
          </span>
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
          {result.paramCount} ô điền{' · '}
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
    </section>
  )
}

// Cột 3 — checklist cần người kiểm duyệt (tách riêng cho bố cục 3 cột).
function ChecklistPanel({
  state,
  isStale,
}: {
  state: ParseState
  isStale: boolean
}) {
  if (!state.ok) return null
  return (
    <section
      className={`transition-opacity duration-150 ${
        isStale ? 'opacity-60' : ''
      }`}
    >
      <HumanChecklist items={state.result.checklist} />
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
          {f.rule} · {f.source} · {f.check}
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
// Chỉ hiện chi tiết các mục CÓ DẤU HIỆU; các mục còn lại gom 1 dòng gọn
// để đỡ rối (checklist nhắc, không phải danh sách bắt buộc đọc từng dòng).
function HumanChecklist({ items }: { items: ModerationResult['checklist'] }) {
  const flagged = items.filter((i) => i.triggered)
  const rest = items.filter((i) => !i.triggered)
  return (
    <div>
      <p className="mb-1 text-sm font-black text-blue-600">
        Cần người kiểm duyệt
        <span className="font-bold text-zinc-400">
          {' · '}
          {flagged.length} mục có dấu hiệu
        </span>
      </p>

      {flagged.map((it) => (
        <div key={it.rule} className="border-b border-black/10 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-purple-500" />
            <span className="text-sm font-black text-black">{it.label}</span>
            <span className="ml-auto shrink-0 text-[10px] font-black text-purple-600">
              {it.rule} · {it.source}
            </span>
          </div>
          <p className="mt-1 text-[11px] font-bold text-purple-700">
            {it.hint ?? it.note}
          </p>
        </div>
      ))}

      {rest.length > 0 && (
        <p className="mt-2 text-[11px] leading-relaxed font-semibold text-zinc-400">
          {flagged.length > 0 ? 'Nhớ tự kiểm thêm khi gửi: ' : 'Cần tự kiểm thêm khi gửi: '}
          {rest.map((it) => `${it.label} (${it.rule} · ${it.source})`).join(' · ')}
        </p>
      )}
    </div>
  )
}
