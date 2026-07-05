# 08 - Giải thích README thật chi tiết

File này giải thích từng ý trong `README.md` để mình hiểu và trả lời nếu bị hỏi.

## 1. Tiêu đề README

`ZBS Rule Check - Template Validation Tool`

Ý nghĩa: đây là tool check rule cho template ZBS trước khi gửi duyệt. Nó đúng với tên Challenge 2: Build a Template Validation Tool.

## 2. Mục "Working tool for Challenge 2"

README nói tool này là bài làm cho Challenge 2, không phải Challenge 1. Challenge 2 yêu cầu:

- Rule map.
- Working tool.
- Example inputs/outputs.
- Note on AI usage.

Vì vậy README đặt ngay bối cảnh để người chấm biết repo này trả lời đúng phần nào của đề.

## 3. Mục "The tool helps..."

README nói tool:

- đọc template JSON,
- chạy prioritized checks,
- trả violations + suggestions,
- liệt kê rule cần human review.

Điểm quan trọng: dùng chữ **prioritized**, vì đề không yêu cầu cover all rules. Tool cũng không nói "guarantee approval".

## 4. Mục "Sources"

README liệt kê 5 nguồn:

1. Quy định kiểm duyệt ZBS.
2. Purpose/Tag setup guide.
3. Image feature announcement.
4. Image module rules.
5. Zalo community policy.

Lý do cần phần này: để chứng minh rule map không tự bịa. Mã `G/P/S/H/T` là internal code, nhưng rule source đến từ tài liệu chính thức.

## 5. Mục "How To Run"

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

Khi nộp, nếu người chấm clone repo thì họ có thể chạy theo 3 lệnh này.

## 6. Mục "Deliverables"

README trỏ đến:

- `public/design/zbs_rule_map.md`: rule map chính.
- `docs1/`: giải thích chi tiết.
- `src/lib/adapter.ts`: đọc và chuẩn hóa input.
- `src/lib/rules.ts`: rule engine.
- `src/lib/samples.ts`: example inputs.

Đây là cách map repo với deliverable trong đề. Đề yêu cầu rule map + working tool + examples, nên README chỉ rõ mỗi phần nằm ở đâu.

## 7. Mục "Step 1 - Map The Rules"

README nói rule được map thành:

- `T`: Tag/purpose.
- `G`: General rules.
- `P`: Purpose-specific rules.
- `S`: Special cases.
- `H`: Image module rules.

Đây là cách hệ thống hóa ruleset. Nó không phủ nhận cấu trúc gốc của Zalo; mỗi code vẫn có source như `Zalo II.1` hoặc `Zalo II.2`.

Nếu bị hỏi: "Sao không dùng số mục Zalo luôn?"  
Trả lời: Vì `II.1` chứa nhiều rule nhỏ. Internal code giúp output actionable hơn.

## 8. Mục "Step 2 - Prioritize Checks"

README liệt kê 3 tiêu chí:

1. Check được từ JSON/content.
2. Có impact cao trong sample reject.
3. Tránh false positive.

Đây chính là product thinking. Ví dụ:

- Link trong body check được bằng regex.
- STK đúng chủ không check được chỉ từ JSON.
- Full spellcheck tiếng Việt dễ báo nhầm.

Vì vậy tool chỉ code 10 check, còn các phần khác đưa vào checklist.

## 9. Bảng automated/semi-automated checks

README bảng này là phần quan trọng nhất của Step 2.

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

## 10. Mục "Human-review checklist"

README liệt kê phần không auto:

- Prior transaction.
- Payment account ownership.
- Logo/brand ownership.
- Restricted industries.
- Promotion campaign context.
- Voucher/holiday/birthday.
- Image module requirements.

Lý do có checklist: nhiều rule cần dữ liệu ngoài JSON. Nếu tool tự reject/pass các phần này thì dễ sai. Checklist giúp business nhớ tự chuẩn bị bằng chứng trước khi submit.

## 11. Mục "Input Notes"

README nói tool nhận:

1. JSON ZBS chuẩn.
2. Flat demo schema.

Và nói Excel chứa pseudo/invalid JSON.

Điều này quan trọng vì file Excel sample tải về không phải JSON parseable trực tiếp. Nếu người chấm copy nguyên cell vào tool, tool báo invalid input là có chủ đích, không crash.

## 12. Mục "Example Coverage"

README chọn các sample reject quan trọng:

- `589221`: link + SĐT trong body.
- `588255`: group/chat link.
- `589269`: thiếu định danh.
- `589220`: typo.
- `588636`: payment ownership + wording.
- `587432`: voucher thiếu định danh/prefix.

Đây là bằng chứng tool không chỉ viết rule lý thuyết mà có đối chiếu dữ liệu đề.

## 13. Mục "AI Usage"

README nói AI dùng để:

- đọc ruleset,
- cấu trúc rule map,
- prioritize checks,
- implement TypeScript,
- draft docs.

Nhưng AI không dùng để tự bịa rule. Mọi rule phải có source hoặc nằm trong checklist nếu không chắc.

## 14. Nếu phải tóm README trong 5 câu

1. Đây là tool pre-check template ZBS cho Challenge 2.
2. Rule map được xây từ tài liệu chính thức Zalo, nhưng dùng mã nội bộ `G/P/S/H/T` cho dễ đọc.
3. Tool chỉ tự động hóa 10 rule ưu tiên vì đề yêu cầu prioritization, không yêu cầu cover all rules.
4. Những rule cần giấy tờ/ngữ cảnh/image review được đưa vào human checklist.
5. Tool có example coverage đối chiếu với sample reject trong Excel và có note rõ về AI usage.
