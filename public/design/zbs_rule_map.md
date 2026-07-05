# ZBS Template Moderation — Rule Map (Step 1)

Nguồn: *Quy định chung khi kiểm duyệt mẫu tin nhắn ZBS* (zalo.solutions) + đối chiếu 10 mẫu thật trong sheet "Sample json" của file đề.

Bảng này **bám theo đúng cấu trúc mục của trang quy định gốc** (Zalo đánh số I, II.1,
II.2, II.3, IV), **không tự chế mã**. Cột "Check tool" là tên hằng số trong code của tool.
Nhãn tự động hoá: 🟢 **Auto** (máy kiểm bằng logic thuần) · 🟡 **Semi** (máy cảnh báo,
người xác nhận) · 🔴 **Human** (cần người/giấy tờ).

---

## I. Phân loại mục đích (Tag) — mỗi mẫu gắn đúng 1 trong 3

| Tag | Nghĩa | Auto? |
|-----|-------|-------|
| Tag 1 | Giao dịch (nội dung gắn với 1 giao dịch cụ thể) | 🟡 người chọn Loại template |
| Tag 2 | Chăm sóc KH (cập nhật, chính sách, khảo sát, quyền lợi) | 🟡 |
| Tag 3 | Hậu mãi (quảng bá, upsell, khuyến mãi) | 🟡 |

> Lẫn mục đích thì Zalo ưu tiên loại "nặng" hơn (dính hậu mãi → Tag 3…). Việc phán Tag
> cần ngữ cảnh → tool **để người chọn Loại template** rồi suy ra Tag.

## II.1. Yêu cầu tổng quan (áp cho mọi Tag)

| Nội dung quy định | Auto? | Check tool |
|-------------------|-------|-----------|
| Nút thao tác: link phải ở CTA, **không** để URL trong nội dung | 🟢 | `URL_IN_BODY` |
| Nút thao tác: SĐT/hotline phải ở CTA, không để trong nội dung | 🟢 | `PHONE_IN_BODY` |
| Nút thao tác: không dùng link rút gọn (bit.ly, tinyurl…) | 🟢 | `SHORTENED_LINK` |
| Nút thao tác: không dẫn tới nhóm/nhóm chat MXH (Zalo group, FB, Telegram, Messenger) | 🟢 | `GROUP_CHAT_LINK` |
| Văn phong: không emoji / ký tự trang trí | 🟢 | `EMOJI_SPECIAL` |
| Văn phong: tiếng Việt có dấu, một ngôn ngữ, đúng chính tả | 🟡 | `SUSPICIOUS_TYPO` (bản hẹp) |
| Tham số: bọc `< >`, không dấu cách/dấu tiếng Việt, nối bằng `_` | 🟢 | `PARAM_FORMAT` |
| Tham số: mỗi biến cần nhãn mô tả phía trước | 🟡 | `PARAM_NO_PREFIX` |
| Logo: có logo OA và chứng minh được quyền dùng | 🔴 | (checklist) |
| Đối tượng nhận tin: chỉ gửi KH đã phát sinh giao dịch | 🔴 | (checklist) |
| Thiết lập thanh toán: STK phải của chính DN sở hữu OA. VD reject: 588636 | 🔴 | (checklist) |

## II.2. Yêu cầu theo mục đích (khác nhau theo Tag)

| Nội dung quy định | Auto? | Check tool |
|-------------------|-------|-----------|
| Tag 1: bắt buộc TÊN KH **kết hợp** ≥1 tham số định danh (mã đơn/mã KH/mã HĐ). VD reject: 589269, 588835, 587432 | 🟢 | `MISSING_IDENTIFIER` |
| Dùng từ chính xác (vd "đơn hàng" → "mã đơn hàng") | 🟡 | `WORDING` |
| OTP dùng mẫu mặc định, không CTA | 🟢 | (xử lý bằng ngoại lệ: OTP miễn định danh) |
| Tag 3: thể hiện rõ thể lệ chương trình/khuyến mãi công khai | 🔴 | (checklist) |

## II.3. Bổ sung với dịp đặc biệt

| Nội dung quy định | Auto? | Check tool |
|-------------------|-------|-----------|
| Chúc mừng sinh nhật / Lễ Tết: bắt buộc kèm hình ảnh + voucher/quà hợp lệ | 🔴 | (checklist) |

## IV. Nhóm ngành / sản phẩm đặc biệt

| Nội dung quy định | Auto? | Check tool |
|-------------------|-------|-----------|
| Ngành hạn chế (mỹ phẩm/thẩm mỹ, sản phẩm sinh lý, rượu bia, TPCN, thuốc, phong thủy, tang lễ…) cần giấy phép; có danh sách sản phẩm không hỗ trợ | 🔴 | (checklist) |

> **Lưu ý về đánh số:** số mục (I, II.1, II.2, II.3, IV) lấy đúng theo trang quy định
> gốc của Zalo. Trang có thể còn mục khác (vd phần III) không liên quan trực tiếp tới
> nội dung mẫu tin nên không đưa vào đây.

---

## Step 2 — Chọn rule để tự động hoá (prioritization)

Bản map có ~21 rule. **Không code hết** — chọn lọc theo 2 tiêu chí và nói rõ lý do bỏ:

- **(a) máy kiểm được rạch ròi từ JSON** (không cần giấy tờ/ngữ cảnh)
- **(b) impact cao** = tần suất reject thật trong 10 mẫu + giá trị chặn phủ đầu

### 2a. 10 check được chọn — xếp theo ưu tiên (impact giảm dần)

Thứ tự này chính là thứ tự tool hiển thị trong "Bảng rule" (đọc từ `CHECK_CATALOG`).

| # | Check tool | Mục Zalo | Vì sao ưu tiên | Mẫu thật |
|---|-----------|----------|----------------|----------|
| 1 | `MISSING_IDENTIFIER` | II.2 | Nguyên nhân reject #1 với Tag 1 | 589269, 588835, 587432 |
| 2 | `URL_IN_BODY` | II.1 | Cực hay dính, regex chính xác | 589221 |
| 3 | `PHONE_IN_BODY` | II.1 | Reject phổ biến cùng nhóm link | 589221 |
| 4 | `GROUP_CHAT_LINK` | II.1 | Rõ ràng, blacklist domain | 588255 |
| 5 | `SUSPICIOUS_TYPO` | II.1 | Reject thật (KÍCH HỌA), từ điển hẹp | 589220 |
| 6 | `WORDING` | II.2 | "đơn hàng <mã>" thiếu tiền tố "mã" | 589269 |
| 7 | `SHORTENED_LINK` | II.1 | Blacklist đơn giản, giá trị cao | — |
| 8 | `EMOJI_SPECIAL` | II.1 | Unicode range, chặn phủ đầu | — |
| 9 | `PARAM_FORMAT` | II.1 | Regex sạch, phòng ngừa | — |
| 10 | `PARAM_NO_PREFIX` | II.1 | Semi, cần người xác nhận | — |

1–6 có bằng chứng reject thật → ưu tiên cao nhất. 7–10 là chặn phủ đầu (chưa dính trong 10 mẫu nhưng rẻ, giá trị rõ) → làm sau.

### 2b. Rule CỐ TÌNH không tự động (dù máy làm được) — điểm prioritization

Đây mới là phần thể hiện lựa chọn, không chỉ "auto hết những gì làm được":

| Mục Zalo | Nội dung | Vì sao KHÔNG auto |
|----------|----------|-------------------|
| II.1 (văn phong) | Chính tả / 1 ngôn ngữ | Spellcheck toàn phần rất nhiễu (false positive cao) → chỉ giữ **từ điển typo hẹp** đổi lấy độ chính xác. |
| I (phân loại Tag) | Phân loại Tag | Cần phán đoán mục đích → để **người chọn Loại template**, tránh máy đoán sai rồi kéo theo II.2 sai. |
| II.2 (OTP) | OTP mẫu mặc định | OTP dùng mẫu cố định → xử lý bằng **ngoại lệ** (miễn định danh), không cần check riêng. |

### 2c. Ranh giới máy/người

Các mục cần **giấy tờ/ngữ cảnh** (thanh toán đúng chủ, đối tượng nhận tin, quyền logo ở
II.1; thể lệ Tag 3 ở II.2; dịp lễ ở II.3; ngành hạn chế ở IV) → tool **không tự phán**,
chỉ in ra checklist kèm *"cần đội kiểm duyệt xác minh"* để tránh false confidence.

> Đính chính sau khi đối chiếu sheet: **587432** (Voucher) reject vì **thiếu tham số định danh** (giống 588835) → `MISSING_IDENTIFIER` (II.2). **588636** (Payment) reject vì **STK không đúng chủ OA** → checklist 🔴 (thiết lập thanh toán, II.1) — máy không tự phán.

---

## Step 3 — Input thật & cách tool đọc

Input đề bài là **JSON ZBS thật**: `root.sections[]` lồng sâu (xem sheet "Sample json"), text nằm rải trong `banner.title.text`, `map_info.items[].key/value.title.text`, `paragraph`, `carousel`, `otp`…; CTA/link ở `buttons.items[].click.data`; tham số bọc `<...>` hoặc `<span class="param"><...></span>`.

- Tool có **adapter** nhận diện & chuẩn hoá 2 format: JSON ZBS thật + schema phẳng gọn (demo).
- JSON không mang **Tag** → người dùng chọn **Loại template** (Payment/Voucher/Rating/OTP/Tuỳ chỉnh/Carousel) → map ra Tag 1/2/3. OTP được miễn check định danh (theo ngoại lệ của Zalo).
- Không hỗ trợ format hiển thị của sheet (`string"…"`, `{7 items`) — đó chỉ là cách JSON-viewer render, tool báo lỗi và nhắc dán JSON chuẩn.
