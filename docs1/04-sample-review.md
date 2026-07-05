# 04 - Đối chiếu sample trong Excel

Nguồn sample: `/Users/antt/Downloads/Json Template.xlsx`, sheet `Sample json`.

## Sample reject/enable chính

| Template ID | Loại | Status gốc | Lý do gốc | Tool nên bắt |
|---|---|---|---|---|
| 589242 | Tuỳ chỉnh | ENABLE | Không có lý do reject | Nên pass nếu JSON chuẩn tương đương hợp lệ |
| 589269 | Tuỳ chỉnh | REJECT | Thiếu tham số định danh/xác định giao dịch | `MISSING_IDENTIFIER` / P1 |
| 589221 | Tuỳ chỉnh | REJECT | Link + SĐT/hotline nằm trong nội dung | `URL_IN_BODY` / G1 + `PHONE_IN_BODY` / G2 |
| 589336 | Rating | ENABLE | Không có lý do reject | Rating thuộc nhóm khảo sát/đánh giá dịch vụ, không nên coi mặc định là Tag 3 |
| 586890 | Payment | ENABLE | Không có lý do reject | Payment có checklist STK đúng chủ, không auto reject |
| 589220 | Tuỳ chỉnh | REJECT | Typo "KÍCH HỌA" | `SUSPICIOUS_TYPO` / G7 |
| 588835 | Tuỳ chỉnh | REJECT | Thiếu cặp tên KH + mã; thiếu tiền tố tham số | `MISSING_IDENTIFIER` / P1 + có thể `PARAM_NO_PREFIX` / G9 |
| 588636 | Payment | REJECT | STK không đúng chủ OA + wording "đơn hàng" | Checklist `S2` + `WORDING` / P4 |
| 587432 | Voucher | REJECT | Thiếu định danh + thiếu tiền tố `<discount_discountDesc>` | `MISSING_IDENTIFIER` / P1 + `PARAM_NO_PREFIX` / G9 |
| 588255 | Tuỳ chỉnh | REJECT | Link group/group chat | `GROUP_CHAT_LINK` / G4 |

## Tại sao không auto đúng 100% mọi sample?

Vì nhiều lý do reject gốc cần dữ liệu ngoài JSON:

- STK có đúng chủ OA không.
- User có thật sự phát sinh giao dịch không.
- Chương trình khuyến mãi có công khai không.
- Logo/brand có giấy phép không.
- Ảnh có QR/barcode/SĐT/text quá nhỏ không.

Tool chỉ tự động các rule có thể kiểm tốt từ content/JSON.

