import type { ZbsTemplate, TemplateType, InputFormat } from './types'

// ═══════════════════════════════════════════════════════════════════
//  Input adapter — nhận diện & chuẩn hoá JSON đầu vào.
//  Hỗ trợ 2 format:
//   1. JSON ZBS thật:  { "root": { "sections": [...] } }  (như sheet đề bài)
//   2. Schema phẳng:   { "content": "...", "buttons": [...], "params": [...] }
//  Cả hai được đưa về cùng một ZbsTemplate để chạy 10 check.
// ═══════════════════════════════════════════════════════════════════

const URL_RE = /https?:\/\/[^\s"'<>]+/gi

// Map loại template (dropdown) → Tag theo rule map.
//  Giao dịch = Tag 1 · Chăm sóc KH = Tag 2 · Hậu mãi = Tag 3
const TAG_OF_TYPE: Record<TemplateType, string> = {
  payment: 'Tag 1',
  otp: 'Tag 1',
  custom: 'Tag 1',
  voucher: 'Tag 2',
  carousel: 'Tag 2',
  rating: 'Tag 3',
}

export const TEMPLATE_TYPES: { value: TemplateType; label: string }[] = [
  { value: 'custom', label: 'Tuỳ chỉnh' },
  { value: 'payment', label: 'Payment' },
  { value: 'voucher', label: 'Voucher' },
  { value: 'rating', label: 'Rating' },
  { value: 'otp', label: 'OTP / Xác thực' },
  { value: 'carousel', label: 'Carousel' },
]

export function tagOfType(type: TemplateType): string {
  return TAG_OF_TYPE[type]
}

// Nhận diện: có "root" hoặc "sections" → JSON ZBS thật.
export function detectFormat(parsed: unknown): InputFormat {
  if (parsed && typeof parsed === 'object') {
    const o = parsed as Record<string, unknown>
    if (o.root || o.sections) return 'zbs'
  }
  return 'flat'
}

// Loại bỏ wrapper HTML mà ZBS hay bọc quanh tham số: <span class="param">…</span>
function stripHtml(s: string): string {
  return s.replace(/<\/?span[^>]*>/gi, '')
}

interface Extracted {
  bodyTexts: string[]
  ctaUrls: string[]
  hasLogo: boolean
}

// Duyệt cây root.sections[], gom text nội dung + URL trong CTA + cờ logo.
function extract(root: unknown): Extracted {
  const acc: Extracted = { bodyTexts: [], ctaUrls: [], hasLogo: false }

  const pushUrls = (s: string) => {
    const us = s.match(URL_RE)
    if (us) acc.ctaUrls.push(...us)
  }

  const walk = (node: unknown, inButtons: boolean) => {
    if (Array.isArray(node)) {
      node.forEach((n) => walk(n, inButtons))
      return
    }
    if (!node || typeof node !== 'object') return
    const obj = node as Record<string, unknown>

    // Có logo / OA info / ảnh banner → phục vụ checklist G10.
    if ('logo' in obj || 'oa_info' in obj) acc.hasLogo = true
    if (obj.img && typeof obj.img === 'object') acc.hasLogo = true

    for (const [k, v] of Object.entries(obj)) {
      const nowInButtons = inButtons || k === 'buttons' || k === 'c_buttons'

      // map_info: ghép nhãn (key) + giá trị (value) trên CÙNG một dòng
      // để giữ quan hệ "nhãn → biến" (tránh cờ sai G9).
      if (k === 'map_info' && v && typeof v === 'object') {
        const items = (v as Record<string, unknown>).items
        if (Array.isArray(items)) {
          for (const it of items) {
            const keyText = deepText(it, ['key', 'title', 'text'])
            const valText = deepText(it, ['value', 'title', 'text'])
            const line = [keyText, valText].filter(Boolean).join(' ')
            if (line) acc.bodyTexts.push(line)
          }
        }
        continue // không duyệt sâu vào map_info nữa
      }

      // Text nội dung (không nằm trong nút CTA).
      if (
        !nowInButtons &&
        typeof v === 'string' &&
        (k === 'text' ||
          k === 'paragraph' ||
          k === 'c_title' ||
          k === 'c_paragraph' ||
          k === 'des' ||
          (k === 'title' && v.length > 0))
      ) {
        acc.bodyTexts.push(v)
      }

      // URL trong click/CTA (mọi vị trí).
      if (
        typeof v === 'string' &&
        (k === 'data' || k === 'c_data' || k === 'data_detail' || k === 'click_extend_info')
      ) {
        pushUrls(v)
      }

      walk(v, nowInButtons)
    }
  }

  walk(root, false)
  return acc
}

// Lấy chuỗi tại đường dẫn lồng, an toàn với NULL/thiếu key.
function deepText(node: unknown, path: string[]): string {
  let cur: unknown = node
  for (const p of path) {
    if (!cur || typeof cur !== 'object') return ''
    cur = (cur as Record<string, unknown>)[p]
  }
  return typeof cur === 'string' ? cur : ''
}

// Chuẩn hoá JSON ZBS thật → ZbsTemplate.
export function normalizeZbs(
  parsed: Record<string, unknown>,
  type: TemplateType,
): ZbsTemplate {
  const root = (parsed.root ?? parsed) as Record<string, unknown>
  const { bodyTexts, ctaUrls, hasLogo } = extract(root)

  const content = stripHtml(bodyTexts.join('\n'))
  const id = typeof root.extend_info === 'string' ? root.extend_info : undefined

  return {
    id,
    type,
    tag: tagOfType(type),
    content,
    buttons: ctaUrls.map((url) => ({ url })),
    hasLogo,
    otpExempt: type === 'otp',
  }
}

// Chuẩn hoá schema phẳng → ZbsTemplate (giữ tương thích cũ).
export function normalizeFlat(
  parsed: Record<string, unknown>,
  type: TemplateType,
): ZbsTemplate {
  return {
    id: typeof parsed.id === 'string' ? parsed.id : undefined,
    type,
    // Ưu tiên tag ghi sẵn trong JSON; nếu không có, lấy theo loại đã chọn.
    tag: typeof parsed.tag === 'string' ? parsed.tag : tagOfType(type),
    content: typeof parsed.content === 'string' ? stripHtml(parsed.content) : '',
    buttons: Array.isArray(parsed.buttons) ? (parsed.buttons as ZbsTemplate['buttons']) : [],
    params: Array.isArray(parsed.params) ? (parsed.params as string[]) : undefined,
    hasLogo:
      typeof parsed.hasLogo === 'boolean'
        ? parsed.hasLogo
        : /logo/i.test(String(parsed.content ?? '')),
    otpExempt: type === 'otp',
  }
}
