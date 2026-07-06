import type { ZbsTemplate, ZbsButton, TemplateType, InputFormat } from './types'

// ═══════════════════════════════════════════════════════════════════
//  Input adapter — nhận diện & chuẩn hoá JSON đầu vào.
//  Hỗ trợ 3 format:
//   1. JSON ZBS thật:  { "root": { "sections": [...] } }  (như sheet đề bài)
//   2. Schema phẳng:   { "content": "...", "buttons": [...], "params": [...] }
//   3. Pseudo JSON copy từ Excel: string"...", {7 items, booltrue...
//  Tất cả được đưa về cùng một ZbsTemplate để chạy 10 check.
// ═══════════════════════════════════════════════════════════════════

// ── Kiểu JSON đệ quy — thay cho `unknown`/`any` khi duyệt cây ────────
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }
export type JsonObject = { [key: string]: JsonValue }

export function isJsonObject(v: JsonValue | undefined): v is JsonObject {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}
function asString(v: JsonValue | undefined): string {
  return typeof v === 'string' ? v : ''
}

const URL_RE = /https?:\/\/[^\s"'<>]+/gi
const CTA_URL_KEYS = new Set(['data', 'c_data', 'data_detail', 'click_extend_info'])
const BODY_TEXT_KEYS = new Set([
  'text',
  'paragraph',
  'c_title',
  'c_paragraph',
  'des',
  'title',
])

// Map loại template (dropdown) → Tag mặc định theo rule map.
//  Giao dịch = Tag 1 · Chăm sóc KH = Tag 2 · Hậu mãi = Tag 3
// Lưu ý: đây là default để demo khi JSON không có Tag. Trong thực tế, "mục đích
// gửi" nên được người dùng chọn/ghi rõ vì cùng một format có thể thuộc nhiều Tag.
const TAG_OF_TYPE: Record<TemplateType, string> = {
  payment: 'Tag 1',
  otp: 'Tag 1',
  custom: 'Tag 1',
  voucher: 'Tag 3',
  carousel: 'Tag 2',
  rating: 'Tag 2',
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
export function detectFormat(parsed: JsonValue): InputFormat {
  if (isJsonObject(parsed) && ('root' in parsed || 'sections' in parsed))
    return 'zbs'
  return 'flat'
}

// Loại bỏ wrapper HTML mà ZBS hay bọc quanh tham số: <span class="param">…</span>
// LƯU Ý: chỉ strip <span> (định dạng thật trong dữ liệu). KHÔNG strip HTML
// tổng quát vì biến 1 từ như <otp>, <price> trông y hệt thẻ HTML → sẽ mất biến.
function stripHtml(s: string): string {
  return s.replace(/<\/?span\b[^>]*>/gi, '')
}

interface Extracted {
  bodyTexts: string[]
  ctaUrls: string[]
  hasLogo: boolean
  hasImage: boolean
}

// map_info: ghép nhãn (key) + giá trị (value) trên CÙNG một dòng để giữ
// quan hệ "nhãn → biến" (tránh cờ sai G9 khi biến nằm ở dòng value riêng).
function collectMapInfo(mapInfo: JsonValue | undefined, acc: Extracted): void {
  if (!isJsonObject(mapInfo)) return
  const items = mapInfo.items
  if (!Array.isArray(items)) return
  for (const item of items) {
    const keyText = deepText(item, ['key', 'title', 'text'])
    const valText = deepText(item, ['value', 'title', 'text'])
    const line = [keyText, valText].filter(Boolean).join(' ')
    if (line) acc.bodyTexts.push(line)
  }
}

// Duyệt cây root.sections[], gom text nội dung + URL trong CTA + cờ logo.
function extract(root: JsonValue): Extracted {
  const acc: Extracted = {
    bodyTexts: [],
    ctaUrls: [],
    hasLogo: false,
    hasImage: false,
  }

  const pushUrls = (s: string): void => {
    const matches = s.match(URL_RE)
    if (matches) acc.ctaUrls.push(...matches)
  }

  const walk = (node: JsonValue, inButtons: boolean): void => {
    if (Array.isArray(node)) {
      for (const child of node) walk(child, inButtons)
      return
    }
    if (!isJsonObject(node)) return

    // Có logo / OA info → phục vụ checklist G10.
    if ('logo' in node || 'oa_info' in node)
      acc.hasLogo = true

    // Module hình ảnh / ảnh header → phục vụ checklist H1.
    if ('map_image' in node || 'image' in node)
      acc.hasImage = true

    for (const key of Object.keys(node)) {
      const value = node[key]
      const nowInButtons =
        inButtons || key === 'buttons' || key === 'c_buttons'

      if (key === 'map_info') {
        collectMapInfo(value, acc) // không duyệt sâu vào map_info nữa
        continue
      }

      // Text nội dung (không nằm trong nút CTA).
      if (
        !nowInButtons &&
        typeof value === 'string' &&
        value.length > 0 &&
        BODY_TEXT_KEYS.has(key)
      ) {
        acc.bodyTexts.push(value)
      }

      // URL trong click/CTA (mọi vị trí).
      if (typeof value === 'string' && CTA_URL_KEYS.has(key)) pushUrls(value)

      walk(value, nowInButtons)
    }
  }

  walk(root, false)
  return acc
}

// Lấy chuỗi tại đường dẫn lồng, an toàn với null / thiếu key ở bất kỳ tầng nào.
function deepText(node: JsonValue, path: string[]): string {
  let cur: JsonValue | undefined = node
  for (const key of path) {
    if (!isJsonObject(cur)) return ''
    cur = cur[key]
  }
  return typeof cur === 'string' ? cur : ''
}

// Chuẩn hoá JSON ZBS thật → ZbsTemplate.
export function normalizeZbs(parsed: JsonObject, type: TemplateType): ZbsTemplate {
  // root có thể thiếu / null / sai kiểu → fallback duyệt chính object gốc.
  const root = isJsonObject(parsed.root) ? parsed.root : parsed
  const { bodyTexts, ctaUrls, hasLogo, hasImage } = extract(root)

  return {
    id: asString(root.extend_info) || undefined,
    type,
    tag: tagOfType(type),
    content: stripHtml(bodyTexts.join('\n')),
    buttons: ctaUrls.map((url) => ({ url })),
    hasLogo,
    hasImage,
    otpExempt: type === 'otp',
  }
}

// ── Chuẩn hoá pseudo JSON copy trực tiếp từ file Excel đề bài ────────
// File "Json Template.xlsx" hiển thị JSON theo dạng viewer dump:
//   "text":string"..."
//   "sections":[6 items
//   "show":booltrue
// Đây không phải JSON parse được, nhưng vẫn chứa đủ text/CTA/param để pre-check.
function pseudoString(line: string): { key: string; value: string } | null {
  const marker = line.match(/^"([^"]+)":string"/)
  if (!marker) return null
  let value = line.slice(marker[0].length)
  if (value.endsWith('"')) value = value.slice(0, -1)
  return { key: marker[1], value }
}

export function normalizeExcelDump(raw: string, type: TemplateType): ZbsTemplate {
  const bodyTexts: string[] = []
  const ctaUrls: string[] = []
  let id: string | undefined
  let currentSection = ''
  let hasLogo = /"oa_info"|"logo"/.test(raw)
  let hasImage = /"map_image"|"image"/.test(raw)

  const pushUrls = (s: string): void => {
    const matches = s.match(URL_RE)
    if (matches) ctaUrls.push(...matches)
  }

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue

    if (/^\d+:\{1 item/.test(line)) currentSection = ''
    if (/"buttons"|"c_buttons"/.test(line)) currentSection = 'buttons'
    else if (/"map_info"/.test(line)) currentSection = 'map_info'
    else if (/"map_image"/.test(line)) {
      currentSection = 'image'
      hasImage = true
    } else if (/"banner"/.test(line)) currentSection = 'banner'
    else if (/"oa_info"|"logo"/.test(line)) {
      currentSection = currentSection || 'brand'
      hasLogo = true
    }

    const found = pseudoString(line)
    if (!found) continue

    if (found.key === 'extend_info' && !id) id = found.value
    if (CTA_URL_KEYS.has(found.key)) pushUrls(found.value)
    if (found.key === 'text' && currentSection !== 'buttons') {
      bodyTexts.push(found.value)
    }
  }

  return {
    id,
    type,
    tag: tagOfType(type),
    content: stripHtml(bodyTexts.join('\n')),
    buttons: [...new Set(ctaUrls)].map((url) => ({ url })),
    hasLogo,
    hasImage,
    otpExempt: type === 'otp',
  }
}

// ── Guard cho schema phẳng (dữ liệu người dùng có thể méo mó) ────────
function toButtons(value: JsonValue | undefined): ZbsButton[] {
  if (!Array.isArray(value)) return []
  const out: ZbsButton[] = []
  for (const b of value) {
    if (!isJsonObject(b)) continue // bỏ qua null / string / number lẫn trong mảng
    out.push({
      type: typeof b.type === 'string' ? b.type : undefined,
      title: typeof b.title === 'string' ? b.title : undefined,
      url: typeof b.url === 'string' ? b.url : undefined,
      phone: typeof b.phone === 'string' ? b.phone : undefined,
    })
  }
  return out
}
function toStringArray(value: JsonValue | undefined): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.filter((x): x is string => typeof x === 'string')
}

// Chuẩn hoá schema phẳng → ZbsTemplate (giữ tương thích cũ).
export function normalizeFlat(parsed: JsonObject, type: TemplateType): ZbsTemplate {
  const content = asString(parsed.content)
  return {
    id: asString(parsed.id) || undefined,
    type,
    // Ưu tiên tag ghi sẵn trong JSON; nếu không có, lấy theo loại đã chọn.
    tag: typeof parsed.tag === 'string' ? parsed.tag : tagOfType(type),
    content: stripHtml(content),
    buttons: toButtons(parsed.buttons),
    params: toStringArray(parsed.params),
    hasLogo:
      typeof parsed.hasLogo === 'boolean'
        ? parsed.hasLogo
        : /logo/i.test(content),
    hasImage:
      typeof parsed.hasImage === 'boolean'
        ? parsed.hasImage
        : /image|hình ảnh|ảnh/i.test(content),
    otpExempt: type === 'otp',
  }
}
