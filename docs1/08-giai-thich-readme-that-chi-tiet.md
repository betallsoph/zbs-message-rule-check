# 08 - Giải thích README thật chi tiết

File này giải thích từng ý trong `README.md` để mình hiểu và trả lời nếu bị hỏi.

## 1. Tiêu đề README

`ZBS Rule Check - Công cụ kiểm tra ZBS Template`

Ý nghĩa: đây là tool check rule cho template ZBS trước khi gửi duyệt. Nó đúng với tên Challenge 2: Build a Template Validation Tool.

## 2. Mục giới thiệu bài làm cho Challenge 2

README nói tool này là bài làm cho Challenge 2, không phải Challenge 1. Challenge 2 yêu cầu:

- Rule map.
- Công cụ chạy được.
- Sample input/output.
- Ghi chú cách dùng AI.

Vì vậy README đặt ngay bối cảnh để người chấm biết repo này trả lời đúng phần nào của đề.

## 3. Mục tool giúp gì

README nói tool:

- đọc JSON template,
- chạy các check đã được ưu tiên,
- trả lỗi/cảnh báo và gợi ý sửa,
- liệt kê rule cần người kiểm tra thêm.

Điểm quan trọng: README nói rõ đây là nhóm rule **đã được ưu tiên**, vì đề không yêu cầu cover all rules. Tool cũng không nói chắc chắn được Zalo duyệt.

## 4. Mục "Nguồn tham khảo"

README liệt kê 5 nguồn:

1. Quy định kiểm duyệt ZBS.
2. Hướng dẫn thiết lập mục đích gửi/Tag.
3. Bài ra mắt tính năng hình ảnh.
4. Quy định module hình ảnh.
5. Chính sách cộng đồng Zalo.

Lý do cần phần này: để chứng minh rule map không tự bịa. Mã `G/P/S/H/T` là internal code, nhưng rule source đến từ tài liệu chính thức.

## 5. Mục "Cách chạy"

README ghi:

```bash
npm install
npm run dev
npm run build
```

Ý nghĩa:

- `npm install`: cài dependency.
- `npm run dev`: chạy app local bằng Vite.
- `npm run build`: kiểm tra TypeScript và build production.

Khi nộp, nếu người chấm clone repo thì họ có thể chạy theo 3 lệnh này. README cũng ghi thêm demo link để người chấm mở tool nhanh hơn.

## 6. Mục "Các phần nộp"

README trỏ đến:

- `public/design/zbs_rule_map.md`: rule map chính.
- `docs1/`: giải thích chi tiết.
- `src/lib/adapter.ts`: đọc và chuẩn hoá input.
- `src/lib/rules.ts`: bộ chạy rule.
- `src/lib/samples.ts`: ví dụ đầu vào/đầu ra.

Đây là cách map repo với phần nộp trong đề. Đề yêu cầu rule map + công cụ chạy được + ví dụ, nên README chỉ rõ mỗi phần nằm ở đâu.

## 7. Mục "Bước 1 - Map rule"

README nói rule được map thành:

- `T`: Tag / mục đích gửi.
- `G`: Quy định chung.
- `P`: Quy định theo mục đích gửi.
- `S`: Trường hợp đặc biệt.
- `H`: Quy định module hình ảnh.

Đây là cách hệ thống hóa ruleset. Nó không phủ nhận cấu trúc gốc của Zalo; mỗi code vẫn có source như `Zalo II.1` hoặc `Zalo II.2`.

Nếu bị hỏi: "Sao không dùng số mục Zalo luôn?"  
Trả lời: Vì `II.1` chứa nhiều rule nhỏ. Internal code giúp output actionable hơn.

## 8. Mục "Bước 2 - Ưu tiên rule để tự động kiểm tra"

README liệt kê 3 tiêu chí:

1. Check được từ JSON/nội dung template.
2. Có tác động cao trong sample reject.
3. Ít cần suy đoán của người hoặc giấy tờ bên ngoài.

Đây chính là product thinking. Ví dụ:

- Link trong body check được bằng regex.
- STK đúng chủ không check được chỉ từ JSON.
- Full spellcheck tiếng Việt dễ báo nhầm.

Vì vậy tool chỉ code 10 check, còn các phần khác đưa vào checklist.

## 9. Bảng các mục kiểm tự động/bán tự động

README bảng này là phần quan trọng nhất của Bước 2.

Giải thích từng dòng:

- `MISSING_IDENTIFIER` / `P1`: Dựa vào Zalo II.2. Check tên khách hàng và mã/xác định giao dịch. Đây là lỗi reject nhiều trong sample.
- `URL_IN_BODY` / `G1`: Dựa vào Zalo II.1. Link phải ở CTA.
- `PHONE_IN_BODY` / `G2`: Dựa vào Zalo II.1. SĐT/hotline phải ở CTA.
- `GROUP_CHAT_LINK` / `G4`: Dựa vào Zalo II.1 và policy về group/spam. Chặn link group/chat.
- `SUSPICIOUS_TYPO` / `G7`: Dựa vào Zalo II.1. Không full spellcheck, chỉ bắt typo nổi bật.
- `WORDING` / `P4`: Dựa vào Zalo II.2. Ví dụ sample reject yêu cầu đổi "đơn hàng" thành "mã đơn hàng".
- `SHORTENED_LINK` / `G3`: Link rút gọn rủi ro cao, dễ check.
- `EMOJI_SPECIAL` / `G5`: Emoji/ký tự trang trí không phù hợp văn phong.
- `PARAM_FORMAT` / `G8`: Tham số phải đúng format.
- `PARAM_NO_PREFIX` / `G9`: Biến cần có nhãn phía trước.

## 10. Mục checklist cần người kiểm thêm

README liệt kê phần không auto:

- Khách nhận tin đã phát sinh giao dịch.
- Tài khoản thanh toán đúng chủ.
- Quyền sở hữu logo/thương hiệu.
- Ngành hàng hạn chế.
- Ngữ cảnh chương trình hậu mãi/khuyến mãi công khai.
- Voucher/sinh nhật/dịp lễ.
- Quy định module hình ảnh.

Lý do có checklist: nhiều rule cần dữ liệu ngoài JSON. Nếu tool tự reject/pass các phần này thì dễ sai. Checklist giúp business nhớ tự chuẩn bị bằng chứng trước khi submit.

## 11. Mục "Dữ liệu đầu vào"

README nói tool nhận:

1. JSON ZBS chuẩn.
2. Flat demo schema.

Và nói Excel chứa pseudo/invalid JSON.

Điều này quan trọng vì file Excel sample tải về không phải JSON parseable trực tiếp. Nếu người chấm copy nguyên cell vào tool, tool báo invalid input là có chủ đích, không crash.

## 12. Mục "Ví dụ đầu vào/đầu ra"

README chọn các sample reject quan trọng:

- `589221`: link + SĐT trong body.
- `588255`: group/chat link.
- `589269`: thiếu định danh.
- `589220`: typo.
- `588636`: payment ownership + wording.
- `587432`: voucher thiếu định danh/prefix.

Đây là bằng chứng tool không chỉ viết rule lý thuyết mà có đối chiếu dữ liệu đề.

## 13. Mục "Cách dùng AI"

README nói AI dùng để:

- đọc ruleset,
- cấu trúc rule map,
- ưu tiên check,
- viết TypeScript,
- draft docs.

Nhưng AI không dùng để tự bịa rule. Mọi rule phải có source hoặc nằm trong checklist nếu không chắc.

## 14. Nếu phải tóm README trong 5 câu

1. Đây là tool pre-check template ZBS cho Challenge 2.
2. Rule map được xây từ tài liệu chính thức Zalo, nhưng dùng mã nội bộ `G/P/S/H/T` cho dễ đọc.
3. Tool chỉ tự động hóa 10 rule ưu tiên vì đề yêu cầu prioritization, không yêu cầu cover all rules.
4. Những rule cần giấy tờ/ngữ cảnh/image review được đưa vào human checklist.
5. Tool có example coverage đối chiếu với sample reject trong Excel và có note rõ về AI usage.
