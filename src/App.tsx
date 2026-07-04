import { useEffect, useMemo, useState } from 'react'
import {
  ShieldCheck,
  BookOpen,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import { moderate } from './lib/rules'
import type {
  ModerationResult,
  TemplateType,
  InputFormat,
  Finding,
} from './lib/types'
import {
  detectFormat,
  normalizeZbs,
  normalizeFlat,
  TEMPLATE_TYPES,
} from './lib/adapter'
import { SAMPLES, DEFAULT_SAMPLE } from './lib/samples'
import { RulesModal } from './components/RulesModal'
import { installTapInteractions } from './lib/tapInteractions'

function toJson(v: unknown) {
  return JSON.stringify(v, null, 2)
}

type ParseState =
  | { ok: true; result: ModerationResult; format: InputFormat }
  | { ok: false; error: string }

// Nhận diện format hiển thị của sheet (pseudo-JSON), không phải JSON chuẩn.
const PSEUDO_RE = /(string"|bool(true|false)|\{\d+ item|\[\d+ item|:NULL)/

function analyze(raw: string, type: TemplateType): ParseState {
  if (PSEUDO_RE.test(raw)) {
    return {
      ok: false,
      error:
        'Đây là format hiển thị của sheet (string"…", "{7 items"…), không phải JSON chuẩn. Hãy dán JSON thật (có "root" / "sections").',
    }
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    return { ok: false, error: 'JSON không hợp lệ: ' + (e as Error).message }
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed))
    return { ok: false, error: 'JSON phải là một object mẫu tin.' }

  const format = detectFormat(parsed)
  const obj = parsed as Record<string, unknown>
  const template =
    format === 'zbs' ? normalizeZbs(obj, type) : normalizeFlat(obj, type)

  if (!template.content && (!template.buttons || template.buttons.length === 0))
    return {
      ok: false,
      error:
        format === 'zbs'
          ? 'Không trích được nội dung nào từ root.sections[].'
          : 'Thiếu trường "content" (nội dung mẫu).',
    }
  return { ok: true, result: moderate(template), format }
}

export default function App() {
  const [input, setInput] = useState(() => toJson(DEFAULT_SAMPLE.raw))
  const [activeKey, setActiveKey] = useState(DEFAULT_SAMPLE.key)
  const [templateType, setTemplateType] = useState<TemplateType>(
    DEFAULT_SAMPLE.type,
  )
  const [showRules, setShowRules] = useState(false)

  useEffect(() => installTapInteractions(), [])

  const state = useMemo(
    () => analyze(input, templateType),
    [input, templateType],
  )

  function loadSample(key: string) {
    const s = SAMPLES.find((x) => x.key === key)
    if (!s) return
    setInput(toJson(s.raw))
    setTemplateType(s.type)
    setActiveKey(key)
  }

  return (
    <div className="relative min-h-screen">
      <div className="roomio-grid-bg fixed inset-0 -z-10 opacity-50" />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-white/80 via-white/60 to-white/80" />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <Header onOpenRules={() => setShowRules(true)} />

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InputWindow
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
          <ResultWindow state={state} />
        </div>

        <p className="mt-10 text-center text-[11px] font-semibold text-zinc-400">
          Dựng theo{' '}
          <span className="font-black text-zinc-500">zbs_rule_map.md</span> · giao
          diện{' '}
          <span className="font-black text-zinc-500">Roomio</span>
        </p>
      </div>

      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  )
}

// ── Header ─────────────────────────────────────────────────────────
function Header({ onOpenRules }: { onOpenRules: () => void }) {
  return (
    <header className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-blue-300 shadow-secondary">
        <ShieldCheck className="h-6 w-6" strokeWidth={2.5} />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-black tracking-tight sm:text-2xl">
          ZBS Rule Check
        </h1>
        <p className="text-xs font-semibold text-zinc-500">
          Kiểm duyệt mẫu tin nhắn · 10 check tự động + checklist người
        </p>
      </div>
      <button onClick={onOpenRules} className="roomio-button-white shrink-0">
        <BookOpen className="h-4 w-4" />
        <span className="hidden sm:inline">Bảng rule</span>
      </button>
    </header>
  )
}

// ── Window chrome ──────────────────────────────────────────────────
function WindowBar({
  title,
  right,
}: {
  title: string
  right?: React.ReactNode
}) {
  return (
    <div className="roomio-window-bar">
      <div className="roomio-window-dots">
        <div className="roomio-window-dot bg-red-500" />
        <div className="roomio-window-dot bg-yellow-400" />
        <div className="roomio-window-dot bg-green-500" />
      </div>
      <h2 className="text-sm font-black text-black">{title}</h2>
      {right && <div className="ml-auto">{right}</div>}
    </div>
  )
}

// ── Input window ───────────────────────────────────────────────────
function InputWindow({
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
  const selectCls =
    'cursor-pointer rounded-[6px] border-2 border-black bg-white px-2 py-1 text-xs font-black text-black focus:outline-none'
  return (
    <section className="roomio-window flex flex-col">
      <WindowBar
        title="Mẫu tin (JSON)"
        right={
          <select
            data-tap-zone="plain"
            value={activeKey}
            onChange={(e) => onLoadSample(e.target.value)}
            className={selectCls}
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
        }
      />
      <div className="p-4">
        {/* Toolbar: loại template + format nhận diện */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <label className="text-[11px] font-black text-zinc-500">
            Loại template:
          </label>
          <select
            data-tap-zone="plain"
            value={templateType}
            onChange={(e) => onChangeType(e.target.value as TemplateType)}
            className={selectCls}
          >
            {TEMPLATE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {format && (
            <span
              className={`ml-auto rounded-full border-2 border-black px-2 py-0.5 text-[10px] font-black ${
                format === 'zbs' ? 'bg-primary-blue' : 'bg-zinc-100'
              }`}
            >
              {format === 'zbs' ? 'JSON ZBS (root.sections)' : 'schema phẳng'}
            </span>
          )}
        </div>
        <textarea
          value={input}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="h-[420px] w-full resize-none rounded-lg border-2 border-black bg-blue-50 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-black focus:ring-2 focus:ring-blue-300 focus:outline-none"
        />
        <p className="mt-2.5 text-[11px] font-semibold text-zinc-400">
          Dán JSON ZBS thật (root.sections) hoặc schema phẳng — tool tự nhận diện.
        </p>
      </div>
    </section>
  )
}

// ── Result window ──────────────────────────────────────────────────
const STATUS = {
  pass: {
    word: 'ĐẠT',
    text: 'text-green-700',
    banner: 'border-green-600 bg-green-50',
    icon: CheckCircle2,
    line: 'Không phát hiện vi phạm trong 10 check tự động.',
  },
  review: {
    word: 'CẦN SOÁT',
    text: 'text-amber-700',
    banner: 'border-amber-500 bg-amber-50',
    icon: AlertTriangle,
    line: 'Có cảnh báo bán tự động — cần người xác nhận.',
  },
  fail: {
    word: 'TỪ CHỐI',
    text: 'text-red-700',
    banner: 'border-red-600 bg-red-50',
    icon: XCircle,
    line: 'Vi phạm rule tự động — sửa rồi gửi duyệt lại.',
  },
} as const

function ResultWindow({ state }: { state: ParseState }) {
  if (!state.ok) {
    return (
      <section className="roomio-window flex flex-col">
        <WindowBar title="Kết quả" />
        <div className="p-4">
          <div className="rounded-lg border-l-4 border-red-600 bg-red-50 px-4 py-3">
            <div className="text-sm font-black text-red-700">
              Không đọc được JSON
            </div>
            <div className="mt-0.5 text-xs font-semibold text-zinc-600">
              {state.error}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const { result } = state
  const s = STATUS[result.status]
  const Icon = s.icon

  return (
    <section className="roomio-window flex flex-col">
      <WindowBar
        title="Kết quả"
        right={
          <span className={`text-xs font-black ${s.text}`}>{s.word}</span>
        }
      />
      <div className="p-4">
        {/* Status banner — slim, single tinted row */}
        <div
          className={`flex items-center gap-2.5 rounded-lg border-l-4 px-3.5 py-2.5 ${s.banner}`}
        >
          <Icon className={`h-5 w-5 shrink-0 ${s.text}`} strokeWidth={2.5} />
          <span className="text-xs font-bold text-zinc-700">{s.line}</span>
        </div>

        {/* Summary line */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold text-zinc-500">
          <span
            className={result.tag ? 'text-blue-600' : 'text-amber-600'}
          >
            {result.tag ?? 'Chưa gắn Tag'}
          </span>
          <Dot />
          <span>{result.paramCount} tham số</span>
          <Dot />
          <span className={result.errors.length ? 'text-red-600' : ''}>
            {result.errors.length} lỗi
          </span>
          <Dot />
          <span className={result.warnings.length ? 'text-amber-600' : ''}>
            {result.warnings.length} cảnh báo
          </span>
        </div>

        {/* Findings */}
        {result.errors.length > 0 && (
          <FindingSection title="Lỗi tự động" findings={result.errors} />
        )}
        {result.warnings.length > 0 && (
          <FindingSection title="Cảnh báo" findings={result.warnings} />
        )}
        {result.errors.length === 0 && result.warnings.length === 0 && (
          <p className="mt-5 rounded-lg bg-green-50 py-6 text-center text-xs font-bold text-green-700">
            Sạch 10 check tự động 🎯
          </p>
        )}

        {/* Human checklist */}
        <HumanChecklist items={result.checklist} />
      </div>
    </section>
  )
}

function Dot() {
  return <span className="text-zinc-300">·</span>
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-5 mb-1 text-xs font-black text-blue-600">{children}</h3>
  )
}

function FindingSection({
  title,
  findings,
}: {
  title: string
  findings: Finding[]
}) {
  return (
    <>
      <SectionHeading>{title}</SectionHeading>
      <div className="divide-y divide-zinc-200 border-y border-zinc-200">
        {findings.map((f) => (
          <FindingRow key={f.check} f={f} />
        ))}
      </div>
    </>
  )
}

function FindingRow({ f }: { f: Finding }) {
  const isError = f.severity === 'error'
  return (
    <div className="py-3">
      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            isError ? 'bg-red-500' : 'bg-amber-400'
          }`}
        />
        <span className="rounded border border-black bg-white px-1.5 text-[10px] font-black">
          {f.rule}
        </span>
        <span className="text-sm font-black text-black">{f.label}</span>
        <span className="ml-auto font-mono text-[10px] text-zinc-400">
          {f.check}
        </span>
      </div>
      <p className="mt-1 pl-4 text-xs font-semibold text-zinc-600">
        {f.message}
      </p>
      {f.evidence && f.evidence.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5 pl-4">
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
        <div className="mt-1.5 flex items-start gap-1 pl-4 text-[11px] font-bold text-blue-600">
          <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {f.suggestion}
        </div>
      )}
    </div>
  )
}

// ── Human review checklist ─────────────────────────────────────────
function HumanChecklist({ items }: { items: ModerationResult['checklist'] }) {
  const triggered = items.filter((i) => i.triggered).length
  return (
    <>
      <SectionHeading>
        Cần người kiểm duyệt 🔴
        {triggered > 0 && (
          <span className="ml-1 font-bold text-zinc-400">
            · {triggered} mục có dấu hiệu
          </span>
        )}
      </SectionHeading>
      <div className="divide-y divide-zinc-200 border-y border-zinc-200">
        {items.map((it) => (
          <div key={it.rule} className="py-3">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  it.triggered ? 'bg-purple-500' : 'bg-zinc-300'
                }`}
              />
              <span className="rounded border border-black bg-white px-1.5 text-[10px] font-black">
                {it.rule}
              </span>
              <span className="text-sm font-black text-black">{it.label}</span>
              {it.triggered && (
                <span className="ml-auto rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-black text-purple-700">
                  có dấu hiệu
                </span>
              )}
            </div>
            <p className="mt-1 pl-4 text-xs font-semibold text-zinc-500">
              {it.note}
            </p>
            {it.triggered && it.hint && (
              <p className="mt-1 pl-4 text-[11px] font-bold text-purple-700">
                {it.hint}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
