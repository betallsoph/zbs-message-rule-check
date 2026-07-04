# ZBS Template Moderation — Rule Map (Step 1)

Nguồn: *Quy định chung khi kiểm duyệt mẫu tin nhắn ZBS* (zalo.solutions) + đối chiếu 10 mẫu thật trong sheet "Sample json" của file đề.

Bộ quy định chia làm **4 tầng**. Mỗi rule được gắn nhãn khả năng tự động hoá:
🟢 **Auto** = máy kiểm được bằng logic thuần từ JSON · 🟡 **Semi** = máy cảnh báo nhưng cần người xác nhận · 🔴 **Human** = phải người/giấy tờ quyết định.

---

## Tầng 1 — Phân loại Tag (bắt buộc mọi mẫu gắn đúng 1/3)

| # | Rule | Nội dung | Auto? |
|---|------|----------|-------|
| T1 | Bắt buộc 1 Tag | Mỗi mẫu phải thuộc Tag 1 Giao dịch / Tag 2 Chăm sóc KH / Tag 3 Hậu mãi | 🟡 |
| T2 | Ưu tiên khi lẫn mục đích | Dính hậu mãi → Tag 3; lẫn Giao dịch + Chăm sóc → Tag 1 | 🔴 |

## Tầng 2 — Yêu cầu tổng quan (áp cho mọi Tag)

| # | Rule | Nội dung | Auto? |
|---|------|----------|-------|
| G1 | Link phải ở CTA | Không được để URL trong phần nội dung; chỉ đặt ở nút thao tác | 🟢 |
| G2 | SĐT/hotline phải ở CTA | Không được để số điện thoại trong nội dung | 🟢 |
| G3 | Không link rút gọn | Cấm bit.ly, tinyurl, onelink… ở CTA | 🟢 |
| G4 | Không link group/chat | Cấm dẫn tới nhóm/nhóm chat MXH (Zalo/FB/Telegram), Messenger, Zalo cá nhân | 🟢 |
| G5 | Không icon/ký tự đặc biệt | Không emoji, ký tự trang trí | 🟢 |
| G6 | Tiếng Việt có dấu, 1 ngôn ngữ | Đúng chính tả, không pha trộn | 🟡 |
| G7 | Không lỗi đánh máy | VD reject thật: "KÍCH HỌA" (đúng: KÍCH HOẠT) | 🟡 |
| G8 | Format tham số | Bọc trong `< >`, không dấu cách/dấu tiếng Việt, nối bằng `_` | 🟢 |
| G9 | Tham số có tiền tố | Mỗi biến cần nhãn phía trước. VD reject: `<discount_discountDesc>` thiếu tiền tố | 🟡 |
| G10 | Logo hợp lệ | Có logo OA; quyền sở hữu logo cần giấy tờ | 🔴 |

## Tầng 3 — Yêu cầu theo mục đích (theo Tag)

| # | Rule | Nội dung | Auto? |
|---|------|----------|-------|
| P1 | Tag 1 cần định danh | Bắt buộc TÊN KH **kết hợp** ≥1 mã giao dịch (mã đơn/mã KH/mã HĐ). VD reject: 589269, 588835 | 🟢 |
| P2 | Có phát sinh giao dịch | Chỉ gửi cho KH đã giao dịch (ngoại lệ: OTP tài khoản mới) | 🔴 |
| P3 | OTP mẫu mặc định | OTP dùng mẫu mặc định, không CTA | 🟢 |
| P4 | Wording chính xác | VD reject: "đơn hàng" → phải là "mã đơn hàng" | 🟡 |

## Tầng 4 — Quy định đặc biệt (dịp/ngành)

| # | Rule | Nội dung | Auto? |
|---|------|----------|-------|
| S1 | Lễ Tết/sinh nhật | Bắt buộc kèm voucher/ưu đãi hợp lệ + dùng mẫu voucher | 🔴 |
| S2 | Thanh toán đúng chủ | STK phải của chính DN sở hữu OA (hoặc có uỷ quyền thu hộ). VD reject: 588636 | 🔴 |
| S3 | Ngành xâm lấn/hạn chế | Mỹ phẩm xâm lấn, rượu bia, TPCN, thuốc… cần giấy phép | 🔴 |
| S4 | Sản phẩm mê tín | Cấm nội dung mê tín dị đoan | 🟡 |
| S5 | Chương trình công khai | Tag 3 cần thông tin CT/sản phẩm công khai trên web chính thức | 🔴 |

---

## Step 2 — 10 rule được chọn để code tự động (và lý do chọn)

Tiêu chí: **(a) máy kiểm được từ JSON** + **(b) tần suất reject cao trong dữ liệu thật**. Bỏ qua nhóm 🔴 vì cần giấy tờ/ngữ cảnh — tool sẽ *liệt kê để nhắc human review* chứ không tự phán.

| Mã check | Rule gốc | Vì sao ưu tiên | Đối chiếu mẫu thật |
|----------|----------|----------------|--------------------|
| `PHONE_IN_BODY` | G2 | Reject phổ biến, regex bắt chính xác | 589221 ✅ |
| `URL_IN_BODY` | G1 | Cùng nhóm, cực hay dính | 589221 ✅ |
| `GROUP_CHAT_LINK` | G4 | Rõ ràng, blacklist domain | 588255 ✅ |
| `SHORTENED_LINK` | G3 | Blacklist đơn giản, giá trị cao | — |
| `MISSING_IDENTIFIER` | P1 | Nguyên nhân reject #1 với Tag 1 | 589269, 588835, 587432 ✅ |
| `PARAM_NO_PREFIX` | G9 | Bắt được biến trần không nhãn (dòng chỉ có biến) | — |
| `PARAM_FORMAT` | G8 | Regex sạch | — |
| `EMOJI_SPECIAL` | G5 | Unicode range | — |
| `SUSPICIOUS_TYPO` | G7 | Từ điển nhỏ, flag để người soát | 589220 ✅ |
| `WORDING` | P4 | Bắt "đơn hàng <mã>" thiếu tiền tố "mã" | 589269 ✅ |

> Đính chính sau khi đối chiếu sheet: **587432** (Voucher) bị reject vì **thiếu tham số định danh** (giống 588835) → thuộc `MISSING_IDENTIFIER`, không phải G9. **588636** (Payment) bị reject vì **STK không đúng chủ OA** → thuộc checklist 🔴 **S2** (máy không tự phán, chỉ nhắc human review).

**Ranh giới máy/người** (điểm product thinking): tool tự quyết 10 check trên, đồng thời in ra checklist 🔴 (thanh toán đúng chủ S2, giấy phép ngành S3, voucher lễ tết S1, quyền logo G10, phát sinh giao dịch P2, chương trình công khai S5) kèm ghi chú *"cần đội kiểm duyệt / giấy tờ xác minh"* — tránh false confidence.

---

## Step 3 — Input thật & cách tool đọc

Input đề bài là **JSON ZBS thật**: `root.sections[]` lồng sâu (xem sheet "Sample json"), text nằm rải trong `banner.title.text`, `map_info.items[].key/value.title.text`, `paragraph`, `carousel`, `otp`…; CTA/link ở `buttons.items[].click.data`; tham số bọc `<...>` hoặc `<span class="param"><...></span>`.

- Tool có **adapter** nhận diện & chuẩn hoá 2 format: JSON ZBS thật + schema phẳng gọn (demo).
- JSON không mang **Tag** → người dùng chọn **Loại template** (Payment/Voucher/Rating/OTP/Tuỳ chỉnh/Carousel) → map ra Tag 1/2/3. OTP được miễn check định danh (ngoại lệ P2/P3).
- Không hỗ trợ format hiển thị của sheet (`string"…"`, `{7 items`) — đó chỉ là cách JSON-viewer render, tool báo lỗi và nhắc dán JSON chuẩn.
