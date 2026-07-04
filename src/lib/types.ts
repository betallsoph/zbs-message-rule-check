// ── ZBS message-template shape ────────────────────────────────────
// Cấu trúc JSON của một mẫu tin ZBS (rút gọn từ sheet "Sample json").
export interface ZbsButton {
  type?: string // "url" | "phone" | "oa.open.url" | "oa.query.show" ...
  title?: string
  url?: string
  phone?: string
}

// Loại template (theo cột "Loại template" trong sheet đề bài).
export type TemplateType =
  | 'payment'
  | 'otp'
  | 'custom'
  | 'voucher'
  | 'rating'
  | 'carousel'

export interface ZbsTemplate {
  id?: string
  tag?: string // "Tag 1" | "Tag 2" | "Tag 3"
  type?: TemplateType // loại template người dùng chọn
  content: string // phần nội dung (body) đã trích & gộp
  buttons?: ZbsButton[] // các nút CTA (kèm URL)
  params?: string[] // danh sách biến, vd ["<customer_name>", "<order_orderCode>"]
  hasLogo?: boolean // có section logo / oa_info / banner ảnh
  otpExempt?: boolean // OTP → miễn check định danh (ngoại lệ P2/P1)
}

// Định dạng input mà tool nhận diện được.
export type InputFormat = 'zbs' | 'flat'

export type Severity = 'error' | 'warning'

// Nhãn khả năng tự động hoá (từ rule map)
export type Autonomy = 'auto' | 'semi' | 'human'

export interface Finding {
  check: string // mã check, vd "PHONE_IN_BODY"
  rule: string // rule gốc, vd "G2"
  tier: number // tầng 1-4
  label: string // tên hiển thị
  message: string // mô tả vi phạm
  severity: Severity
  autonomy: Autonomy
  evidence?: string[] // đoạn text bắt được
  suggestion?: string // gợi ý sửa
}

export interface ChecklistItem {
  rule: string
  label: string
  note: string
  triggered?: boolean // có dấu hiệu trong mẫu này → nhắc mạnh hơn
  hint?: string
}

export interface ModerationResult {
  status: 'pass' | 'fail' | 'review'
  errors: Finding[]
  warnings: Finding[]
  checklist: ChecklistItem[]
  paramCount: number
  tag: string | null
}
