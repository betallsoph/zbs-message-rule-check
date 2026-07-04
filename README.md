# ZBS Rule Check — Template Validation Tool

Công cụ kiểm duyệt **mẫu tin nhắn ZBS** trước khi gửi duyệt: đọc JSON template, chạy
tự động các rule quan trọng và in ra danh sách vi phạm kèm gợi ý sửa, đồng thời
liệt kê những mục **cần người kiểm duyệt / giấy tờ** mà máy không tự phán.

> Bài làm cho **Challenge 2 — Build a Template Validation Tool** (ZBS Product Intern
> Home Assignment). Ruleset gốc:
> [Quy định chung khi kiểm duyệt mẫu tin nhắn ZBS](https://zalo.solutions/news/quy-dinh-chung-khi-kiem-duyet-mau-tin-nhan-zbs/xdygqtrjjm97k28rsh07wr72).

## Cách chạy

```bash
npm install
npm run dev      # mở http://localhost:5173
npm run build    # build production (tsc + vite)
```

Chọn 1 mẫu thử ở dropdown hoặc dán JSON template của bạn vào ô bên trái; kết quả
kiểm duyệt cập nhật tức thì bên phải.

## Cách tiếp cận

### Step 1 — Map toàn bộ rule

Ruleset được phân thành **4 tầng** (phân loại Tag → yêu cầu tổng quan → yêu cầu theo
mục đích → quy định đặc biệt). Mỗi rule gắn nhãn khả năng tự động hoá:
🟢 **Auto** (máy kiểm bằng logic thuần) · 🟡 **Semi** (máy cảnh báo, người xác nhận) ·
🔴 **Human** (phải người/giấy tờ quyết định).

Bảng rule đầy đủ: [`public/design/zbs_rule_map.md`](public/design/zbs_rule_map.md).

### Step 2 — 10 check được tự động hoá

Tiêu chí chọn: **(a)** máy kiểm được từ JSON + **(b)** tần suất reject cao trong 10
mẫu thật của đề. Nhóm 🔴 được *liệt kê để nhắc human review* chứ không tự phán —
tránh false confidence.

| Check | Rule | Auto | Ý nghĩa |
|-------|------|------|---------|
| `PHONE_IN_BODY` | G2 | 🟢 | SĐT/hotline phải ở CTA, không để trong nội dung |
| `URL_IN_BODY` | G1 | 🟢 | Link phải ở CTA, không để trong nội dung |
| `GROUP_CHAT_LINK` | G4 | 🟢 | Cấm link nhóm/chat (zalo.me/g/, FB group, t.me, m.me…) |
| `SHORTENED_LINK` | G3 | 🟢 | Cấm link rút gọn (bit.ly, tinyurl, onelink…) |
| `MISSING_IDENTIFIER` | P1 | 🟢 | Tag 1 cần TÊN KH **+** ≥1 mã giao dịch |
| `PARAM_FORMAT` | G8 | 🟢 | Biến bọc `< >`, không dấu cách/dấu, nối bằng `_` |
| `EMOJI_SPECIAL` | G5 | 🟢 | Không emoji / ký tự trang trí |
| `PARAM_NO_PREFIX` | G9 | 🟡 | Biến đứng trơ, thiếu nhãn mô tả phía trước |
| `SUSPICIOUS_TYPO` | G7 | 🟡 | Nghi lỗi đánh máy (vd "KÍCH HỌA") |
| `WORDING` | P4 | 🟡 | "đơn hàng &lt;mã&gt;" thiếu tiền tố "mã" |

**Checklist 🔴 (human review):** thanh toán đúng chủ (S2), giấy phép ngành (S3),
voucher lễ Tết (S1), quyền logo (G10), phát sinh giao dịch (P2), chương trình công
khai (S5). Tool tự bật cờ *"có dấu hiệu"* khi bắt gặp ngữ cảnh liên quan.

## Input — 2 format được hỗ trợ

Tool tự nhận diện định dạng đầu vào:

1. **JSON ZBS thật** — cấu trúc `root.sections[]` lồng sâu như sheet đề bài. Adapter
   duyệt cây, trích nội dung từ `banner.title.text`, `map_info.items[]`, `paragraph`,
   `carousel`, `otp`…; tách link CTA từ `buttons.items[].click.data`; nhận biến `<...>`
   kể cả khi bọc `<span class="param">`.
2. **Schema phẳng** — `{ content, buttons, params }` gọn cho demo nhanh.

JSON không mang trường **Tag** → người dùng chọn **Loại template** (Payment / Voucher /
Rating / OTP / Tuỳ chỉnh / Carousel) → map ra Tag 1/2/3. OTP được miễn check định danh
(ngoại lệ P2/P3).

> Lưu ý: format hiển thị trong cell của sheet (`string"…"`, `{7 items`) là cách
> JSON-viewer render, **không phải JSON hợp lệ** — tool báo lỗi và nhắc dán JSON chuẩn.

## Ví dụ input/output

10 mẫu dựng sẵn (dropdown) bám theo các template thật trong sheet:

| Mẫu | Kết quả tool | Đối chiếu reject thật |
|-----|--------------|-----------------------|
| #589221 | ❌ `URL_IN_BODY` + `PHONE_IN_BODY` | Link & SĐT phải ở CTA |
| #588255 | ❌ `GROUP_CHAT_LINK` | Link điều hướng tới nhóm |
| #589269 | ❌ `MISSING_IDENTIFIER` | Thiếu tham số định danh |
| #589220 | ⚠️ `SUSPICIOUS_TYPO` | Lỗi đánh máy "KÍCH HỌA" |
| #588636 | ✅ auto + cờ 🔴 **S2** | STK phải đúng chủ OA → cần người xác minh |

Mẫu #588636 minh hoạ ranh giới máy/người: máy không "bịa" ra phán quyết mà đẩy S2 vào
checklist cần con người kiểm tra.

## Công nghệ & cấu trúc

React 19 + TypeScript + Vite, Tailwind CSS v4. Giao diện theo design system
**Roomio Soft Neobrutalism**.

```
src/
  lib/
    types.ts     # kiểu dữ liệu (ZbsTemplate, Finding, TemplateType…)
    rules.ts     # 10 check tự động + checklist 🔴 + bộ chạy moderate()
    adapter.ts   # nhận diện & chuẩn hoá input (JSON ZBS thật / schema phẳng)
    samples.ts   # 10 mẫu ví dụ
  components/
    RulesModal.tsx
  App.tsx        # UI 2 cửa sổ: input JSON | kết quả kiểm duyệt
public/design/   # rule map + design system prompt
```

## Ghi chú dùng AI

Toàn bộ tool được xây với sự hỗ trợ của AI coding assistant: đọc ruleset & sheet mẫu
để dựng rule map, chuyển rule thành logic kiểm (regex + duyệt cây JSON), và dựng UI
theo design system có sẵn. Phần quyết định *chọn rule nào tự động hoá* và *ranh giới
máy/người* là product thinking được cân nhắc dựa trên dữ liệu reject thật.
