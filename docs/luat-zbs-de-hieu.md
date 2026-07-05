# Luật kiểm duyệt mẫu tin ZBS — giải thích dễ hiểu

File gốc của Zalo (link trong đề) rất dài và khô. Đây là bản **dịch sang tiếng người**:
mỗi luật là gì, **ví dụ sai vs đúng**, và **vì sao Zalo đặt ra**. Đọc xong là hiểu bản
chất, không cần đọc trang gốc.

---

## 0. Mô hình tư duy: hiểu 1 điều này là hiểu hết

**ZBS là kênh THÔNG BÁO CHÍNH THỨC**, không phải kênh quảng cáo/spam. Nó giống như tin
nhắn ngân hàng gửi bạn: "Tài khoản vừa trừ 500k". Người dùng **tin** những tin này.

Nếu để kênh này bị lạm dụng (spam, lừa đảo, dẫn link bậy), người dùng mất niềm tin →
cả nền tảng hỏng. Nên Zalo kiểm duyệt gắt để giữ **3 điều**:

1. **Đúng người, đúng việc** — tin phải liên quan thật tới người nhận (họ đã giao dịch),
   và ghi rõ đây là ai/đơn nào.
2. **Không lừa đảo** — không dẫn tới link lạ/nhóm chat, không giả mạo, thanh toán phải
   đúng chủ.
3. **Sạch sẽ, chuyên nghiệp** — không emoji lòe loẹt, không sai chính tả, tham số đúng
   chuẩn.

**Mọi luật bên dưới đều rơi ra từ 3 nguyên tắc này.** Khi quên luật nào, cứ hỏi "nó
phục vụ điều 1, 2 hay 3?" là nhớ ra.

Bộ luật chia **4 tầng**: (1) phân loại tin, (2) luật chung cho mọi tin, (3) luật theo
mục đích tin, (4) luật đặc biệt theo ngành/dịp.

---

## Tầng 1 — Phân loại tin (Tag): tin này để LÀM GÌ?

Trước tiên mỗi mẫu phải tự khai **mục đích**, chọn đúng **1 trong 3 Tag**:

| Tag | Nghĩa | Ví dụ |
|-----|-------|-------|
| **Tag 1 — Giao dịch** | Báo việc đã/đang xảy ra với KH | "Đơn #123 đã xác nhận", OTP, nhắc thanh toán |
| **Tag 2 — Chăm sóc KH** | Quan tâm, ưu đãi, thành viên | "Tặng bạn mã giảm giá", "Bạn lên hạng Vàng" |
| **Tag 3 — Hậu mãi** | Sau khi đã dùng dịch vụ | "Đánh giá đơn hàng vừa rồi giúp shop nhé" |

- **T1 — Bắt buộc đúng 1 Tag.** *Vì sao?* Zalo quản lý mỗi loại tin theo chuẩn khác
  nhau (tin giao dịch được ưu ái hơn tin chăm sóc). Gắn sai loại = né luật → bị soi.
- **T2 — Lẫn mục đích thì ưu tiên loại "nặng" hơn.** Dính hậu mãi → về Tag 3; vừa giao
  dịch vừa chăm sóc → về Tag 1. *Vì sao?* Tránh DN "mượn" tin giao dịch (dễ duyệt) để
  nhét nội dung quảng cáo.

> Trong tool: JSON không có sẵn Tag, nên bạn **chọn Loại template** → tool suy ra Tag.

---

## Tầng 2 — Luật chung (áp cho MỌI tin)

Đây là nhóm tool tự động bắt nhiều nhất. Chia làm 3 nhóm nhỏ cho dễ nhớ.

### Nhóm A — Chống dẫn dụ ra ngoài (chống lừa đảo)

- **G1 — Link phải nằm ở NÚT, không ở nội dung.**
  - ❌ Sai: *"Tra cứu đơn tại https://shop.vn/abc"* (link nằm trong đoạn văn)
  - ✅ Đúng: đoạn văn không có link, có **nút "Xem đơn"** dẫn tới link đó.
  - *Vì sao?* Link chèn giữa nội dung dễ bị nguỵ trang thành link lừa đảo. Bắt link phải
    ở nút → người dùng biết rõ "đây là hành động", và Zalo kiểm soát được nút.
- **G2 — Số điện thoại/hotline cũng phải ở nút.** Tương tự G1.
  - ❌ *"Gọi 1900 6035 để hỗ trợ"* trong nội dung → ✅ nút "Gọi hotline".
- **G3 — Cấm link rút gọn** (bit.ly, tinyurl, onelink…).
  - *Vì sao?* Link rút gọn **giấu điểm đến thật** → công cụ ưa thích của lừa đảo. Bắt
    dùng link đầy đủ để nhìn là biết dẫn đi đâu.
- **G4 — Cấm link tới nhóm/nhóm chat** (Zalo group `zalo.me/g/`, nhóm Facebook,
  Telegram `t.me`, Messenger…).
  - *Vì sao?* Kéo người dùng vào nhóm kín = ra khỏi vùng Zalo kiểm soát → dễ bị dụ dỗ,
    spam tiếp. (Lưu ý: link OA chính thức `oa.zalo.me/...` thì **được phép**.)

### Nhóm B — Sạch sẽ, chuyên nghiệp (giữ chất lượng)

- **G5 — Không emoji / ký tự trang trí.** 🎉★❤ đều cấm.
  - *Vì sao?* Tin thông báo chính thức phải nghiêm túc; emoji là dấu hiệu tin
    quảng cáo/spam.
- **G6 — Tiếng Việt có dấu, dùng 1 ngôn ngữ, đúng chính tả.**
  - *Vì sao?* Tin không dấu / trộn tiếng Anh khó đọc, thiếu chuyên nghiệp, và hay là
    dấu hiệu tin rác gửi hàng loạt.
- **G7 — Không lỗi đánh máy.** Ví dụ reject thật: *"KÍCH HỌA"* (đúng phải là *"KÍCH
  HOẠT"*).
  - *Vì sao?* Sai chính tả trong tin chính thức làm mất uy tín thương hiệu, và đôi khi
    là dấu hiệu giả mạo.

### Nhóm C — Tham số phải chuẩn (để hệ thống điền đúng)

Tham số là chỗ **chừa trống để điền dữ liệu từng người**, viết trong ngoặc nhọn, vd
`<order_orderCode>` sẽ được thay bằng mã đơn thật của từng KH khi gửi.

- **G8 — Định dạng tham số:** bọc trong `< >`, **không dấu cách, không dấu tiếng Việt**,
  các phần nối bằng `_`. ✅ `<order_orderCode>` · ❌ `<ten khach hang>` (có dấu cách).
  - *Vì sao?* Hệ thống điền dữ liệu dựa vào cú pháp này; sai cú pháp = điền lỗi.
- **G9 — Mỗi tham số phải có NHÃN mô tả đứng trước.**
  - ❌ Một dòng chỉ có `<discount_discountDesc>` trơ trọi.
  - ✅ *"Mã ưu đãi: `<discount_discountDesc>`"* (có nhãn "Mã ưu đãi:").
  - *Vì sao?* Để người đọc hiểu con số/biến đó **là gì**. Số trơ không nhãn = khó hiểu,
    dễ tưởng spam.
- **G10 — Logo hợp lệ.** Có logo OA, và **phải chứng minh được quyền dùng logo** (giấy
  tờ). → Việc này **máy không tự phán**, để người kiểm.

---

## Tầng 3 — Luật theo mục đích (khác nhau theo Tag)

- **P1 — Tin Tag 1 (Giao dịch) phải có ĐỊNH DANH:** bắt buộc **TÊN khách hàng** kết hợp
  **≥1 mã giao dịch** (mã đơn / mã KH / mã hợp đồng).
  - ❌ *"Đơn hàng 589269 đã tiếp nhận"* — chỉ có số đơn trơ, thiếu tên KH.
  - ✅ *"Chào `<TenKH>`, mã đơn `<MaDon>` đã xác nhận"*.
  - *Vì sao?* Đây là chống lừa đảo mạnh nhất: tin giao dịch **phải cá nhân hoá** để
    chứng minh "tôi thật sự biết bạn là ai, đơn nào". Lừa đảo gửi hàng loạt thì không
    có dữ liệu này. → **Đây là nguyên nhân reject #1** trong dữ liệu thật.
- **P2 — Chỉ gửi cho KH đã thật sự giao dịch** (ngoại lệ: OTP mở tài khoản mới).
  - *Vì sao?* Tin giao dịch mà gửi cho người chưa từng mua = spam trá hình. → Máy
    không biết được "KH này đã giao dịch chưa", nên **để người kiểm**.
- **P3 — OTP dùng mẫu mặc định, không có nút CTA.**
  - *Vì sao?* OTP là mã bảo mật; thêm nút/link vào dễ bị lợi dụng dẫn tới trang giả để
    lừa lấy mã. Nên OTP theo mẫu cứng, tối giản. → Vì vậy tool **miễn** vài luật cho OTP.
- **P4 — Dùng từ chính xác.** Ví dụ reject: viết *"đơn hàng"* trơ khi ý là **mã** đơn →
  phải ghi *"mã đơn hàng"*.
  - *Vì sao?* Tránh mập mờ khiến KH hiểu nhầm.

---

## Tầng 4 — Luật đặc biệt (theo dịp / theo ngành)

Nhóm này gần như **luôn cần con người + giấy tờ** → tool chỉ liệt kê để nhắc.

- **S1 — Dịp lễ Tết/sinh nhật** thì bắt buộc kèm **voucher/ưu đãi hợp lệ** và dùng đúng
  mẫu voucher. *Vì sao?* Tránh mượn dịp lễ để spam mà không có ưu đãi thật.
- **S2 — Thanh toán đúng chủ:** số tài khoản nhận tiền **phải của chính DN sở hữu OA**
  (hoặc có uỷ quyền thu hộ).
  - *Vì sao?* Chống chiếm đoạt — kẻ xấu chèn STK của mình vào tin của thương hiệu khác.
    → Máy không thể biết STK có đúng chủ không, **bắt buộc người kiểm giấy tờ**.
- **S3 — Ngành hạn chế** (mỹ phẩm xâm lấn, rượu bia, thực phẩm chức năng, thuốc…) cần
  **giấy phép**. *Vì sao?* Pháp luật quản lý các ngành này; Zalo phải kiểm giấy phép.
- **S4 — Cấm nội dung mê tín dị đoan.**
- **S5 — Chương trình phải công khai:** tin Tag 3 (hậu mãi) cần thông tin chương
  trình/sản phẩm **công khai trên web chính thức** để đối chiếu.

---

## Tóm lại: bản đồ "luật ↔ vì sao ↔ máy hay người"

| Nhóm | Luật | Phục vụ điều gì | Ai kiểm |
|------|------|-----------------|---------|
| Dẫn dụ ra ngoài | G1 G2 G3 G4 | Chống lừa đảo | 🟢 Máy |
| Sạch sẽ | G5 G6 G7 | Chất lượng | 🟢/🟡 Máy |
| Tham số chuẩn | G8 G9 | Hệ thống điền đúng | 🟢/🟡 Máy |
| Định danh | P1 P4 | Chống spam giao dịch | 🟢/🟡 Máy |
| Ngữ cảnh/giấy tờ | T2 P2 P3 G10 S1 S2 S3 S5 | Chống chiếm đoạt, đúng luật | 🔴 Người |

**Câu thần chú:** *Tin thông báo phải **đúng người, không lừa đảo, và sạch sẽ**. Máy lo
phần "đúng/sai rạch ròi từ chữ nghĩa"; phần cần **giấy tờ hoặc biết ngữ cảnh** thì
nhường con người.*

→ Xem tool biến từng luật này thành code ở [flow.md](flow.md), và bảng map đầy đủ ở
[../public/design/zbs_rule_map.md](../public/design/zbs_rule_map.md).
