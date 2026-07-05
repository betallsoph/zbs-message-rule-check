import type {
  ZbsTemplate,
  Finding,
  ChecklistItem,
  ModerationResult,
} from './types'

// ═══════════════════════════════════════════════════════════════════
//  ZBS Template Moderation — Rule Engine
//  10 check tự động (🟢 auto / 🟡 semi) + checklist 🔴 cho human review.
//  Xem public/design/zbs_rule_map.md để biết nguồn gốc từng rule.
// ═══════════════════════════════════════════════════════════════════

// Gom toàn bộ URL trong các nút CTA (để loại trừ khỏi check "URL trong body").
// Phòng thủ với phần tử button méo mó (null / thiếu url) từ input người dùng.
function buttonUrls(t: ZbsTemplate): string[] {
  return (t.buttons ?? [])
    .map((b) => (b && typeof b.url === 'string' ? b.url : ''))
    .filter(Boolean)
}

function allLinks(t: ZbsTemplate): string[] {
  return [...buttonUrls(t), t.content]
}

// Trích mọi token dạng <...> xuất hiện trong nội dung.
function paramTokens(content: string): string[] {
  return content.match(/<[^<>]*>/g) ?? []
}

// ── 1. PHONE_IN_BODY (G2) — SĐT trong nội dung ────────────────────
const ACCOUNT_CTX = /(tài\s*khoản|\bstk\b|\bsố\s*tk\b|account)/i
function checkPhoneInBody(t: ZbsTemplate): Finding[] {
  // Hotline 1800/1900 hoặc số di động/cố định VN 9-11 chữ số (cho phép . - space).
  const re =
    /(?:\+?84|0)(?:[\s.-]?\d){8,10}|\b1[89]00[\s.-]?\d{3,6}\b/g
  const hits: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(t.content))) {
    const raw = m[0].trim()
    if (/[<>]/.test(raw)) continue // số nằm trong token tham số
    // Bỏ qua số tài khoản (thuộc checklist S2 - human review), không phải SĐT.
    if (ACCOUNT_CTX.test(t.content.slice(Math.max(0, m.index - 24), m.index)))
      continue
    hits.push(raw)
  }
  if (!hits.length) return []
  return [
    {
      check: 'PHONE_IN_BODY',
      rule: 'G2',
      tier: 2,
      label: 'SĐT trong nội dung',
      message:
        'Số điện thoại/hotline không được đặt trong nội dung — chỉ để ở nút CTA.',
      severity: 'error',
      autonomy: 'auto',
      evidence: [...new Set(hits)],
      suggestion: 'Chuyển số điện thoại vào nút thao tác (CTA gọi điện).',
    },
  ]
}

// ── 2. URL_IN_BODY (G1) — Link trong nội dung ─────────────────────
function checkUrlInBody(t: ZbsTemplate): Finding[] {
  const re =
    /\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.(?:com|vn|net|org|info|io|me|link|shop|store|xyz|top|site|online|app)(?:\/\S*)?/gi
  const hits = (t.content.match(re) ?? []).map((s) =>
    s.replace(/[.,)]+$/, ''),
  )
  if (!hits.length) return []
  return [
    {
      check: 'URL_IN_BODY',
      rule: 'G1',
      tier: 2,
      label: 'Link trong nội dung',
      message: 'URL phải đặt ở nút CTA, không được nằm trong phần nội dung.',
      severity: 'error',
      autonomy: 'auto',
      evidence: [...new Set(hits)],
      suggestion: 'Đưa đường dẫn vào nút thao tác (CTA mở link).',
    },
  ]
}

// ── 3. GROUP_CHAT_LINK (G4) — Link nhóm/chat MXH ──────────────────
// Chỉ bắt các link nhóm/chat RÕ RÀNG. Không bắt oa.zalo.me/<id> (link OA
// hợp lệ) hay zalo.me/s/ (mini app) để tránh false positive.
const GROUP_PATTERNS: { re: RegExp; what: string }[] = [
  { re: /zalo\.me\/g\//i, what: 'nhóm Zalo' },
  { re: /chat\.zalo\.me/i, what: 'chat Zalo' },
  { re: /(?:facebook|fb)\.com\/groups/i, what: 'nhóm Facebook' },
  { re: /m\.me\//i, what: 'Messenger' },
  { re: /messenger\.com/i, what: 'Messenger' },
  { re: /t\.me\//i, what: 'Telegram' },
  { re: /(?:chat\.)?whatsapp\.com/i, what: 'WhatsApp' },
]
function checkGroupChatLink(t: ZbsTemplate): Finding[] {
  const evidence: string[] = []
  for (const link of allLinks(t)) {
    for (const p of GROUP_PATTERNS) {
      if (p.re.test(link)) evidence.push(`${link}  ·  (${p.what})`)
    }
  }
  if (!evidence.length) return []
  return [
    {
      check: 'GROUP_CHAT_LINK',
      rule: 'G4',
      tier: 2,
      label: 'Link nhóm / chat MXH',
      message:
        'Cấm dẫn tới nhóm/nhóm chat MXH (Zalo/FB/Telegram), Messenger hay Zalo cá nhân.',
      severity: 'error',
      autonomy: 'auto',
      evidence: [...new Set(evidence)],
    },
  ]
}

// ── 4. SHORTENED_LINK (G3) — Link rút gọn ─────────────────────────
const SHORTENERS =
  /\b(?:bit\.ly|tinyurl\.com|onelink\.\w+|goo\.gl|t\.co|cutt\.ly|rebrand\.ly|shorturl\.at|is\.gd|ow\.ly|rb\.gy|s\.id|shorten\.asia|link\.gl|vshare\.\w+)\b/i
function checkShortenedLink(t: ZbsTemplate): Finding[] {
  const evidence = allLinks(t).filter((l) => SHORTENERS.test(l))
  if (!evidence.length) return []
  return [
    {
      check: 'SHORTENED_LINK',
      rule: 'G3',
      tier: 2,
      label: 'Link rút gọn',
      message: 'Cấm dùng link rút gọn (bit.ly, tinyurl, onelink…) ở CTA.',
      severity: 'error',
      autonomy: 'auto',
      evidence: [...new Set(evidence)],
      suggestion: 'Dùng đường dẫn đầy đủ, chính chủ của OA.',
    },
  ]
}

// ── 5. MISSING_IDENTIFIER (P1) — Tag 1 cần tên KH + mã giao dịch ───
// Tên KH: <TenKH>, <customer_name>, <CustName>… (KHÔNG tính mã KH là tên).
const NAME_KEY = /(ten|hoten|fullname|(?:customer|cust)_?name|khachhang|\bname\b)/i
// Mã giao dịch: <MaKH>, <MaDon>, <order_orderCode>, <CustID>, <customer_code>…
const CODE_KEY =
  /(code|makh|madon|mahd|ma_?kh|ma_?don|order|orderid|\bdon\b|invoice|contract|hopdong|txn|transaction|hoadon|cust(?:id|code|no)|customer_?code)/i
function collectParams(t: ZbsTemplate): string[] {
  return [...new Set([...(t.params ?? []), ...paramTokens(t.content)])]
}
function checkMissingIdentifier(t: ZbsTemplate): Finding[] {
  if (normalizeTag(t.tag) !== 1) return []
  if (t.otpExempt) return [] // OTP dùng mẫu mặc định — ngoại lệ định danh (P2/P3)
  const params = collectParams(t)
  const hasName = params.some((p) => NAME_KEY.test(p))
  const hasCode = params.some((p) => CODE_KEY.test(p))
  if (hasName && hasCode) return []
  const missing: string[] = []
  if (!hasName) missing.push('định danh KH (tên khách hàng)')
  if (!hasCode) missing.push('mã giao dịch (mã đơn/mã KH/mã HĐ)')
  return [
    {
      check: 'MISSING_IDENTIFIER',
      rule: 'P1',
      tier: 3,
      label: 'Thiếu định danh (Tag 1)',
      message: `Mẫu Tag 1 bắt buộc TÊN KH kết hợp ≥1 mã giao dịch. Đang thiếu: ${missing.join(
        ' + ',
      )}.`,
      severity: 'error',
      autonomy: 'auto',
      evidence: params.length ? params : ['(không tìm thấy tham số nào)'],
      suggestion:
        'Thêm biến tên KH và mã giao dịch, vd <customer_name> + <order_orderCode>.',
    },
  ]
}

// ── 6. PARAM_FORMAT (G8) — định dạng tham số ───────────────────────
// Cho phép tiền tố "$" của biến hệ thống (vd <$requestId>, <$zReqId>).
const VALID_PARAM = /^<\$?[A-Za-z0-9]+(?:_[A-Za-z0-9]+)*>$/
function checkParamFormat(t: ZbsTemplate): Finding[] {
  const bad = paramTokens(t.content).filter((tok) => !VALID_PARAM.test(tok))
  if (!bad.length) return []
  return [
    {
      check: 'PARAM_FORMAT',
      rule: 'G8',
      tier: 2,
      label: 'Sai định dạng tham số',
      message:
        'Tham số phải bọc trong < >, không dấu cách/dấu tiếng Việt, nối các phần bằng "_".',
      severity: 'error',
      autonomy: 'auto',
      evidence: [...new Set(bad)],
      suggestion: 'Ví dụ hợp lệ: <order_orderCode>, <customer_name>.',
    },
  ]
}

// ── 7. PARAM_NO_PREFIX (G9) — biến thiếu nhãn phía trước ──────────
// Bảo thủ: chỉ cờ khi cả DÒNG chỉ gồm biến (không có chữ mô tả nào),
// vd một dòng trơ "<discount_discountDesc>". Dòng "Nhãn: <biến>" thì OK.
function checkParamNoPrefix(t: ZbsTemplate): Finding[] {
  if (t.otpExempt) return [] // OTP dùng mẫu mặc định
  const evidence: string[] = []
  for (const line of t.content.split(/\n/)) {
    const tokens = line.match(/<[^<>]+>/g)
    if (!tokens) continue
    const labelLetters = line.replace(/<[^<>]+>/g, '').replace(/[^\p{L}]/gu, '')
    if (labelLetters.length === 0) evidence.push(...tokens)
  }
  if (!evidence.length) return []
  return [
    {
      check: 'PARAM_NO_PREFIX',
      rule: 'G9',
      tier: 2,
      label: 'Biến thiếu nhãn phía trước',
      message:
        'Mỗi biến cần một nhãn mô tả đứng trước (vd "Mã đơn: <order_orderCode>"), không để biến đứng trơ.',
      severity: 'warning',
      autonomy: 'semi',
      evidence: [...new Set(evidence)],
      suggestion: 'Thêm nhãn phía trước biến, vd "Tên khách hàng: <customer_name>".',
    },
  ]
}

// ── 8. EMOJI_SPECIAL (G5) — emoji / ký tự trang trí ───────────────
// LƯU Ý: KHÔNG dùng nguyên khối General Punctuation (U+2000–206F) vì nó chứa
// dấu câu hợp lệ (em-dash "—", "…", nháy cong "" ''), sẽ báo nhầm là emoji.
// Chỉ lấy đúng vài ký tự trang trí cần chặn (‼ ⁉ •) + các dải emoji thật.
const EMOJI_RE =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{25A0}-\u{25FF}•★☆‼⁉❤✔✖❌✨]/u
function checkEmojiSpecial(t: ZbsTemplate): Finding[] {
  // Bỏ dòng chỉ chứa khoảng trắng thường; bắt emoji + ký tự trang trí.
  const chars = [...t.content].filter((c) => {
    if (c === '\n' || c === '\t' || c === ' ') return false
    return EMOJI_RE.test(c)
  })
  if (!chars.length) return []
  return [
    {
      check: 'EMOJI_SPECIAL',
      rule: 'G5',
      tier: 2,
      label: 'Emoji / ký tự đặc biệt',
      message: 'Không dùng emoji hay ký tự trang trí trong nội dung.',
      severity: 'error',
      autonomy: 'auto',
      evidence: [...new Set(chars)],
      suggestion: 'Xoá toàn bộ emoji và ký hiệu trang trí.',
    },
  ]
}

// ── 9. SUSPICIOUS_TYPO (G7) — lỗi đánh máy nghi ngờ ───────────────
const TYPOS: { wrong: RegExp; right: string }[] = [
  { wrong: /kích\s*họa/gi, right: 'KÍCH HOẠT' },
  { wrong: /quý\s*kách/gi, right: 'quý khách' },
  { wrong: /thanh\s*toàn/gi, right: 'thanh toán' },
  { wrong: /khuyến\s*mảng/gi, right: 'khuyến mãi' },
  { wrong: /giao\s*hàn\b/gi, right: 'giao hàng' },
  { wrong: /trân\s*trọn\b/gi, right: 'trân trọng' },
  { wrong: /vui\s*lồng/gi, right: 'vui lòng' },
  { wrong: /đơn\s*hàg/gi, right: 'đơn hàng' },
]
function checkSuspiciousTypo(t: ZbsTemplate): Finding[] {
  const evidence: string[] = []
  for (const { wrong, right } of TYPOS) {
    const found = t.content.match(wrong)
    if (found) found.forEach((f) => evidence.push(`"${f}" → nên là "${right}"`))
  }
  if (!evidence.length) return []
  return [
    {
      check: 'SUSPICIOUS_TYPO',
      rule: 'G7',
      tier: 2,
      label: 'Nghi ngờ lỗi đánh máy',
      message: 'Phát hiện từ nghi sai chính tả — cần người soát lại.',
      severity: 'warning',
      autonomy: 'semi',
      evidence: [...new Set(evidence)],
    },
  ]
}

// ── 10. WORDING (P4) — "đơn hàng" phải là "mã đơn hàng" ───────────
// Chỉ cờ khi "đơn hàng" đứng trước 1 định danh (số/biến) mà thiếu tiền tố
// "mã" — vd "Đơn hàng 589269". "Xác nhận đơn hàng" (dùng chung) thì bỏ qua.
function checkWording(t: ZbsTemplate): Finding[] {
  const re = /(\S+\s+)?đơn\s+hàng\s*:?\s*(?=[<\d])/gi
  const evidence: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(t.content))) {
    const prev = (m[1] ?? '').trim().toLowerCase()
    if (prev !== 'mã') evidence.push(m[0].trim())
  }
  if (!evidence.length) return []
  return [
    {
      check: 'WORDING',
      rule: 'P4',
      tier: 3,
      label: 'Wording chưa chính xác',
      message:
        'Khi nhắc tới mã đơn phải ghi rõ "mã đơn hàng", không dùng "đơn hàng" trơ.',
      severity: 'warning',
      autonomy: 'semi',
      evidence: [...new Set(evidence)],
      suggestion: 'Thay "đơn hàng" bằng "mã đơn hàng" nếu đang chỉ mã đơn.',
    },
  ]
}

// ── Checklist 🔴 cho human review (không tự phán) ─────────────────
const BANK_ACCOUNT_RE = /\b\d{8,16}\b/
const PAYMENT_CTX_RE =
  /(tài\s*khoản|ngân\s*hàng|chuyển\s*khoản|\bstk\b|\bbidv\b|vietcombank|techcombank|accountnumber)/i
const FESTIVE_RE =
  /(tết|lễ|noel|giáng\s*sinh|sinh\s*nhật|trung\s*thu|quốc\s*khánh|8\/3|20\/10|20\/11|valentine)/i
const RESTRICTED_RE =
  /(mỹ\s*phẩm|xâm\s*lấn|filler|botox|rượu|bia|thực\s*phẩm\s*chức\s*năng|tpcn|thuốc|dược|nha\s*khoa|thẩm\s*mỹ)/i

function buildChecklist(t: ZbsTemplate): ChecklistItem[] {
  const c = t.content
  const isPayment = t.type === 'payment'
  const isVoucher = t.type === 'voucher'
  const isRating = t.type === 'rating'
  return [
    {
      rule: 'S2',
      label: 'Thanh toán đúng chủ',
      note: 'STK phải của chính DN sở hữu OA (hoặc có uỷ quyền thu hộ).',
      triggered: isPayment || PAYMENT_CTX_RE.test(c) || BANK_ACCOUNT_RE.test(c),
      hint: 'Có thông tin thanh toán/chuyển khoản — cần đối chiếu chủ tài khoản với OA.',
    },
    {
      rule: 'S3',
      label: 'Ngành xâm lấn / hạn chế',
      note: 'Mỹ phẩm xâm lấn, rượu bia, TPCN, thuốc… cần giấy phép.',
      triggered: RESTRICTED_RE.test(c),
      hint: 'Nội dung nhắc tới ngành hạn chế — yêu cầu giấy phép kinh doanh.',
    },
    {
      rule: 'S1',
      label: 'Lễ Tết / sinh nhật',
      note: 'Dịp lễ bắt buộc kèm voucher/ưu đãi hợp lệ + dùng mẫu voucher.',
      triggered: FESTIVE_RE.test(c) || isVoucher,
      hint: isVoucher
        ? 'Template voucher — kiểm tra ưu đãi hợp lệ & dùng đúng mẫu voucher.'
        : 'Có dấu hiệu nội dung dịp lễ — kiểm tra voucher đính kèm.',
    },
    {
      rule: 'G10',
      label: 'Quyền sở hữu logo',
      note: 'Có logo OA; quyền sở hữu logo cần giấy tờ chứng minh.',
      triggered: !!t.hasLogo,
      hint: 'Mẫu có logo/ảnh thương hiệu — cần giấy tờ chứng minh quyền sử dụng.',
    },
    {
      rule: 'P2',
      label: 'Có phát sinh giao dịch',
      note: 'Chỉ gửi cho KH đã giao dịch (ngoại lệ: OTP tài khoản mới).',
    },
    {
      rule: 'S5',
      label: 'Chương trình công khai',
      note: 'Tag 3 cần thông tin CT/sản phẩm công khai trên web chính thức.',
      triggered: isRating,
      hint: isRating ? 'Template hậu mãi (Tag 3) — kiểm tra thông tin công khai.' : undefined,
    },
  ]
}

// ── Tiện ích Tag ───────────────────────────────────────────────────
export function normalizeTag(tag?: string): 1 | 2 | 3 | null {
  if (!tag) return null
  const m = String(tag).match(/([123])/)
  return m ? (Number(m[1]) as 1 | 2 | 3) : null
}
const TAG_LABEL: Record<number, string> = {
  1: 'Tag 1 · Giao dịch',
  2: 'Tag 2 · Chăm sóc KH',
  3: 'Tag 3 · Hậu mãi',
}
export function tagLabel(tag?: string): string | null {
  const n = normalizeTag(tag)
  return n ? TAG_LABEL[n] : null
}

// ── Bộ chạy chính ─────────────────────────────────────────────────
const CHECKS = [
  checkPhoneInBody,
  checkUrlInBody,
  checkGroupChatLink,
  checkShortenedLink,
  checkMissingIdentifier,
  checkParamFormat,
  checkParamNoPrefix,
  checkEmojiSpecial,
  checkSuspiciousTypo,
  checkWording,
]

export function moderate(t: ZbsTemplate): ModerationResult {
  const findings = CHECKS.flatMap((fn) => fn(t))
  const errors = findings.filter((f) => f.severity === 'error')
  const warnings = findings.filter((f) => f.severity === 'warning')
  const checklist = buildChecklist(t)

  const status: ModerationResult['status'] = errors.length
    ? 'fail'
    : warnings.length
      ? 'review'
      : 'pass'

  return {
    status,
    errors,
    warnings,
    checklist,
    paramCount: collectParams(t).length,
    tag: tagLabel(t.tag),
  }
}

// 10 check đã chọn tự động — XẾP THEO ƯU TIÊN (impact = tần suất reject thật
// + giá trị chặn). Tool hiển thị đúng thứ tự này ở "Bảng rule".
export const CHECK_CATALOG = [
  { check: 'MISSING_IDENTIFIER', rule: 'P1', autonomy: 'auto', label: 'Thiếu định danh (Tag 1)', why: 'Nguyên nhân reject #1 với Tag 1' },
  { check: 'URL_IN_BODY', rule: 'G1', autonomy: 'auto', label: 'Link trong nội dung', why: 'Cực hay dính, regex chính xác' },
  { check: 'PHONE_IN_BODY', rule: 'G2', autonomy: 'auto', label: 'SĐT trong nội dung', why: 'Reject phổ biến cùng nhóm link' },
  { check: 'GROUP_CHAT_LINK', rule: 'G4', autonomy: 'auto', label: 'Link nhóm/chat MXH', why: 'Rõ ràng, blacklist domain' },
  { check: 'SUSPICIOUS_TYPO', rule: 'G7', autonomy: 'semi', label: 'Nghi ngờ lỗi đánh máy', why: 'Reject thật (KÍCH HỌA), từ điển hẹp' },
  { check: 'WORDING', rule: 'P4', autonomy: 'semi', label: 'Wording chưa chính xác', why: '"đơn hàng <mã>" thiếu tiền tố "mã"' },
  { check: 'SHORTENED_LINK', rule: 'G3', autonomy: 'auto', label: 'Link rút gọn', why: 'Blacklist đơn giản, giá trị cao' },
  { check: 'EMOJI_SPECIAL', rule: 'G5', autonomy: 'auto', label: 'Emoji / ký tự đặc biệt', why: 'Unicode range, chặn phủ đầu' },
  { check: 'PARAM_FORMAT', rule: 'G8', autonomy: 'auto', label: 'Sai định dạng tham số', why: 'Regex sạch, phòng ngừa' },
  { check: 'PARAM_NO_PREFIX', rule: 'G9', autonomy: 'semi', label: 'Biến thiếu nhãn phía trước', why: 'Semi, cần người xác nhận' },
] as const

// Rule CỐ TÌNH không tự động dù MÁY LÀM ĐƯỢC — đây mới là điểm prioritization.
export const EXCLUDED_CATALOG = [
  {
    rule: 'G6',
    label: 'Chính tả / 1 ngôn ngữ',
    reason: 'Spellcheck toàn phần rất nhiễu → chỉ giữ từ điển typo hẹp (G7).',
  },
  {
    rule: 'T1/T2',
    label: 'Phân loại Tag',
    reason: 'Cần phán đoán mục đích → để người chọn Loại template, tránh máy đoán sai.',
  },
  {
    rule: 'P3',
    label: 'OTP mẫu mặc định',
    reason: 'OTP dùng mẫu cố định → xử lý bằng ngoại lệ, không cần check riêng.',
  },
] as const
