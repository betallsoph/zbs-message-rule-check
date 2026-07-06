# ZBS Rule Check - Công cụ kiểm tra ZBS Template

Công cụ giúp doanh nghiệp tự kiểm tra nhanh mẫu tin ZBS trước khi gửi duyệt. Công cụ nhận JSON template, chạy một nhóm rule đã được ưu tiên, trả về lỗi/cảnh báo kèm gợi ý sửa, và liệt kê các rule vẫn cần người kiểm tra thêm.

Demo: https://rulecheck.tranthienan.id.vn

## Nguồn tham khảo

Rule map được xây từ các nguồn chính thức sau:

- Quy định kiểm duyệt ZBS: https://zalo.solutions/news/quy-dinh-chung-khi-kiem-duyet-mau-tin-nhan-zbs/xdygqtrjjm97k28rsh07wr72
- Hướng dẫn thiết lập mục đích gửi/Tag: https://zalo.solutions/blog/thiet-lap-muc-dich-gui-khi-tao-mau-zns/jnb3n2isrtlb21vts4dpiyzb
- Bài ra mắt tính năng hình ảnh: https://zalo.solutions/news/ra-mat-tinh-nang-thiet-lap-hinh-anh-trong-mau-tin-zns/ekq3tifzt6g0n8hlfwwjzt1q
- Quy định xét duyệt template có module hình ảnh: https://zalo.solutions/news/huong-dan-cac-quy-dinh-xet-duyet-template-zns-chua-module-hinh-anh/pkk6ds8irzpv7mok9hebggji
- Chính sách cộng đồng Zalo: https://help.zalo.me/huong-dan/chuyen-muc/chinh-sach-cong-dong-zalo/

## Cách chạy

```bash
npm install
npm run dev
npm run build
```

Sau khi chạy `npm run dev`, mở URL local của Vite. Có thể chọn mẫu demo ở dropdown bên trái hoặc dán JSON thật vào ô nhập, chọn đúng loại template, rồi bấm **Kiểm tra thử ngay!**.

## Các phần nộp

- Rule map: [`public/design/zbs_rule_map.md`](public/design/zbs_rule_map.md)
- Ví dụ đầu vào/đầu ra: [`public/examples/`](public/examples/)
- Code chính của công cụ:
  - `src/lib/adapter.ts` - đọc và chuẩn hoá JSON đầu vào
  - `src/lib/rules.ts` - bộ chạy rule, các mục kiểm ưu tiên và checklist người kiểm
  - `src/lib/samples.ts` - các ví dụ đầu vào/đầu ra để demo

## Cách tiếp cận

### Bước 1 - Map rule

Mình map các quy định ZBS chính thức thành các nhóm rule nội bộ:

- `T` - Tag / mục đích gửi
- `G` - Quy định chung
- `P` - Quy định theo mục đích gửi
- `S` - Trường hợp đặc biệt như thanh toán, dịp lễ, ngành hạn chế
- `H` - Quy định module hình ảnh

Các mã này là **mã nội bộ trong bài làm**, không phải rule ID chính thức của Zalo. Mỗi mã đều được gắn lại với nguồn gốc tương ứng như `Zalo II.1`, `Zalo II.2`, `Zalo IV`, hoặc quy định module hình ảnh.

### Bước 2 - Ưu tiên rule để tự động kiểm tra

Đề bài cho phép chọn rule quan trọng để kiểm tra tự động, không yêu cầu bao phủ toàn bộ ruleset. Vì vậy mình ưu tiên các mục kiểm:

1. Có thể kiểm tương đối chắc từ JSON/nội dung template.
2. Có tác động cao, xuất hiện trong các sample bị từ chối.
3. Ít cần suy đoán của người hoặc giấy tờ bên ngoài.

Các mục kiểm tự động/bán tự động:

| Mục kiểm | Mã | Nguồn | Mức | Công cụ bắt lỗi gì |
|---|---|---|---|---|
| `MISSING_IDENTIFIER` | `P1` | Zalo II.2 | Tự động | Thiếu tên khách hàng / mã giao dịch |
| `URL_IN_BODY` | `G1` | Zalo II.1 | Tự động | Link nằm trong nội dung thay vì CTA |
| `PHONE_IN_BODY` | `G2` | Zalo II.1 | Tự động | SĐT/hotline nằm trong nội dung thay vì CTA |
| `GROUP_CHAT_LINK` | `G4` | Zalo II.1 | Tự động | Link nhóm/chat/mạng xã hội |
| `SUSPICIOUS_TYPO` | `G7` | Zalo II.1 | Bán tự động | Typo rõ ràng, ví dụ "KICH HOA" |
| `WORDING` | `P4` | Zalo II.2 | Bán tự động | Wording mơ hồ, ví dụ "đơn hàng" khi cần ghi "mã đơn hàng" |
| `SHORTENED_LINK` | `G3` | Zalo II.1 | Tự động | Link rút gọn |
| `EMOJI_SPECIAL` | `G5` | Zalo II.1 | Tự động | Emoji / ký tự trang trí |
| `PARAM_FORMAT` | `G8` | Zalo II.1 | Tự động | Sai định dạng `<param>` |
| `PARAM_NO_PREFIX` | `G9` | Zalo II.1 | Bán tự động | Biến đứng một mình, thiếu nhãn phía trước |

Checklist cần người kiểm thêm:

- Khách nhận tin đã phát sinh giao dịch trước đó (`P2`)
- Tài khoản thanh toán thuộc đúng doanh nghiệp sở hữu OA hoặc có uỷ quyền (`S2`)
- Quyền sở hữu logo/thương hiệu (`G10/G12`)
- Ngành hàng hạn chế, sản phẩm/dịch vụ rủi ro, chính sách cộng đồng (`S3/G11`)
- Ngữ cảnh chương trình hậu mãi/khuyến mãi công khai (`P5`)
- Voucher, sinh nhật, dịp lễ và các trường hợp đặc biệt (`S1`)
- Quy định module hình ảnh (`H1/H2/H3`)

## Dữ liệu đầu vào

Công cụ hỗ trợ:

1. **JSON ZBS hợp lệ** có cấu trúc `root.sections[]`.
2. **Schema demo dạng phẳng** như `{ content, buttons, params, tag }`.

File Excel sample đi kèm đề bài có một số cell hiển thị pseudo/invalid JSON như `string"..."`, `{7 items`, `booltrue`. Công cụ cố tình nhận diện format này và báo lỗi thân thiện. Đây được xem là case test lỗi input, không phải JSON chuẩn để parse trực tiếp.

Lưu ý: kết quả `ĐẠT/pass` chỉ có nghĩa là công cụ chưa tìm thấy lỗi trong các mục kiểm tự động đã ưu tiên. Kết quả này **không đảm bảo mẫu chắc chắn được Zalo duyệt**, vì nhiều rule chính thức vẫn cần người kiểm tra giấy tờ, hình ảnh, quyền sở hữu, dữ liệu giao dịch hoặc ngữ cảnh doanh nghiệp.

## Ví dụ đầu vào/đầu ra

Các sample có sẵn trong công cụ mô phỏng những kiểu lỗi quan trọng trong file đề bài. Ngoài dropdown demo trong UI, repo cũng có cặp file input/output để người chấm mở trực tiếp:

- [`public/examples/589221-input.json`](public/examples/589221-input.json) -> [`public/examples/589221-output.json`](public/examples/589221-output.json)
- [`public/examples/589220-input.json`](public/examples/589220-input.json) -> [`public/examples/589220-output.json`](public/examples/589220-output.json)

| Template ID | Kết quả công cụ kỳ vọng |
|---|---|
| `589221` | `URL_IN_BODY` + `PHONE_IN_BODY` |
| `588255` | `GROUP_CHAT_LINK` |
| `589269` | `MISSING_IDENTIFIER` |
| `589220` | `SUSPICIOUS_TYPO` |
| `588636` | Checklist thanh toán đúng chủ + cảnh báo wording |

## Cách dùng AI

Mình dùng AI để hỗ trợ đọc và hệ thống hoá ruleset, đối chiếu sample reject, ưu tiên các mục kiểm nên tự động hoá, viết logic TypeScript và draft tài liệu giải thích. Mình không để AI tự bịa rule: mỗi rule trong công cụ đều được gắn lại với nguồn Zalo, còn phần nào cần giấy tờ/ngữ cảnh/đánh giá thủ công thì được đưa vào checklist người kiểm.
