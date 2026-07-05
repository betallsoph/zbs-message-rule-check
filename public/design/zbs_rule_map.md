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

## Step 2 — Chọn rule để tự động hoá (prioritization)

Bản map có ~21 rule. **Không code hết** — chọn lọc theo 2 tiêu chí và nói rõ lý do bỏ:

- **(a) máy kiểm được rạch ròi từ JSON** (không cần giấy tờ/ngữ cảnh)
- **(b) impact cao** = tần suất reject thật trong 10 mẫu + giá trị chặn phủ đầu

### 2a. 10 check được chọn — xếp theo ưu tiên (impact giảm dần)

Thứ tự này chính là thứ tự tool hiển thị trong "Bảng rule" (đọc từ `CHECK_CATALOG`).

| # | Mã check | Rule | Vì sao ưu tiên | Mẫu thật |
|---|----------|------|----------------|----------|
| 1 | `MISSING_IDENTIFIER` | P1 | Nguyên nhân reject #1 với Tag 1 | 589269, 588835, 587432 |
| 2 | `URL_IN_BODY` | G1 | Cực hay dính, regex chính xác | 589221 |
| 3 | `PHONE_IN_BODY` | G2 | Reject phổ biến cùng nhóm link | 589221 |
| 4 | `GROUP_CHAT_LINK` | G4 | Rõ ràng, blacklist domain | 588255 |
| 5 | `SUSPICIOUS_TYPO` | G7 | Reject thật (KÍCH HỌA), từ điển hẹp | 589220 |
| 6 | `WORDING` | P4 | "đơn hàng <mã>" thiếu tiền tố "mã" | 589269 |
| 7 | `SHORTENED_LINK` | G3 | Blacklist đơn giản, giá trị cao | — |
| 8 | `EMOJI_SPECIAL` | G5 | Unicode range, chặn phủ đầu | — |
| 9 | `PARAM_FORMAT` | G8 | Regex sạch, phòng ngừa | — |
| 10 | `PARAM_NO_PREFIX` | G9 | Semi, cần người xác nhận | — |

1–6 có bằng chứng reject thật → ưu tiên cao nhất. 7–10 là chặn phủ đầu (chưa dính trong 10 mẫu nhưng rẻ, giá trị rõ) → làm sau.

### 2b. Rule CỐ TÌNH không tự động (dù máy làm được) — điểm prioritization

Đây mới là phần thể hiện lựa chọn, không chỉ "auto hết những gì làm được":

| Rule | Nội dung | Vì sao KHÔNG auto |
|------|----------|-------------------|
| G6 | Chính tả / 1 ngôn ngữ | Spellcheck toàn phần rất nhiễu (false positive cao) → chỉ giữ **từ điển typo hẹp** (G7) đổi lấy độ chính xác. |
| T1/T2 | Phân loại Tag | Cần phán đoán mục đích → để **người chọn Loại template**, tránh máy đoán sai rồi kéo theo P1 sai. |
| P3 | OTP mẫu mặc định | OTP dùng mẫu cố định → xử lý bằng **ngoại lệ** (miễn P1), không cần check riêng. |

### 2c. Ranh giới máy/người

Nhóm 🔴 (S1 voucher lễ tết, S2 thanh toán đúng chủ, S3 giấy phép ngành, S5 chương trình công khai, P2 phát sinh giao dịch, G10 quyền logo) cần **giấy tờ/ngữ cảnh** → tool **không tự phán**, chỉ in ra checklist kèm *"cần đội kiểm duyệt xác minh"* để tránh false confidence.

> Đính chính sau khi đối chiếu sheet: **587432** (Voucher) reject vì **thiếu tham số định danh** (giống 588835) → `MISSING_IDENTIFIER`. **588636** (Payment) reject vì **STK không đúng chủ OA** → checklist 🔴 **S2** (máy không tự phán).

---

## Step 3 — Input thật & cách tool đọc

Input đề bài là **JSON ZBS thật**: `root.sections[]` lồng sâu (xem sheet "Sample json"), text nằm rải trong `banner.title.text`, `map_info.items[].key/value.title.text`, `paragraph`, `carousel`, `otp`…; CTA/link ở `buttons.items[].click.data`; tham số bọc `<...>` hoặc `<span class="param"><...></span>`.

- Tool có **adapter** nhận diện & chuẩn hoá 2 format: JSON ZBS thật + schema phẳng gọn (demo).
- JSON không mang **Tag** → người dùng chọn **Loại template** (Payment/Voucher/Rating/OTP/Tuỳ chỉnh/Carousel) → map ra Tag 1/2/3. OTP được miễn check định danh (ngoại lệ P2/P3).
- Không hỗ trợ format hiển thị của sheet (`string"…"`, `{7 items`) — đó chỉ là cách JSON-viewer render, tool báo lỗi và nhắc dán JSON chuẩn.
