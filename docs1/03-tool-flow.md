# 03 - Tool Flow

## Input

Tool nhận 2 dạng:

1. **JSON ZBS chuẩn**  
   Có cấu trúc kiểu `root.sections[]`. Tool duyệt cây để trích text, link CTA, params, logo/image.

2. **Schema phẳng để demo**  
   Ví dụ:

```json
{
  "tag": "Tag 1",
  "content": "Chào <customer_name>, mã đơn hàng <order_orderCode> đã được xác nhận.",
  "buttons": [{ "url": "https://shop.example.vn/orders" }],
  "params": ["<customer_name>", "<order_orderCode>"]
}
```

## Pseudo JSON trong Excel

File `Json Template.xlsx` có các cell hiển thị như:

- `string"..."`
- `{7 items`
- `booltrue`
- `NULL`

Đây không phải JSON chuẩn. Tool cố tình nhận ra format này và báo lỗi thân thiện. Đây là negative test cho invalid input, không phải bug.

## Adapter làm gì?

`src/lib/adapter.ts` chuẩn hóa input về một object `ZbsTemplate`:

- `content`: toàn bộ text người dùng thấy.
- `buttons`: URL trong CTA.
- `params`: biến `<...>`.
- `tag`: Tag 1/2/3.
- `hasLogo`: có logo/OA info.
- `hasImage`: có module ảnh/header image.
- `otpExempt`: có phải OTP không.

## Rule engine làm gì?

`src/lib/rules.ts` chạy 10 check ưu tiên:

1. `MISSING_IDENTIFIER` - P1
2. `URL_IN_BODY` - G1
3. `PHONE_IN_BODY` - G2
4. `GROUP_CHAT_LINK` - G4
5. `SUSPICIOUS_TYPO` - G7
6. `WORDING` - P4
7. `SHORTENED_LINK` - G3
8. `EMOJI_SPECIAL` - G5
9. `PARAM_FORMAT` - G8
10. `PARAM_NO_PREFIX` - G9

Sau đó tool tạo checklist human review cho:

- STK đúng chủ.
- Ngành hạn chế.
- Voucher/dịp đặc biệt.
- Logo/quyền sở hữu.
- Đối tượng đã phát sinh giao dịch.
- Chương trình công khai.
- Module hình ảnh.

## Output

Tool trả:

- `fail`: có error auto.
- `review`: không có error, nhưng có warning.
- `pass`: chưa thấy lỗi trong 10 check auto/semi.

Quan trọng: `pass` không có nghĩa là chắc chắn được Zalo duyệt. Nó chỉ nghĩa là tool không phát hiện lỗi trong phạm vi đã ưu tiên.

