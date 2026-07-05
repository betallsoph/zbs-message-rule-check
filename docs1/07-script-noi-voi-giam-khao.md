# 07 - Script nói với giám khảo

File này là bản nói miệng nếu bị hỏi về bài. Có thể dùng nguyên văn hoặc nói theo ý.

## 30 giây mở đầu

Em làm một tool nhỏ để business tự kiểm tra ZBS template trước khi gửi duyệt. Em bắt đầu bằng cách đọc ruleset chính thức của Zalo, map các rule thành nhóm `T/G/P/S/H`, rồi chọn 10 rule em đánh giá là quan trọng và có thể kiểm tự động từ JSON.

Em không cố cover toàn bộ moderation vì đề có nói prioritization là một phần được chấm. Các rule cần giấy tờ, dữ liệu giao dịch, ownership, hoặc review hình ảnh thì em đưa vào human checklist thay vì để máy tự phán.

## Nếu hỏi "Vì sao không làm hết rule?"

Vì nhiều rule không thể xác minh chỉ từ JSON:

- STK có đúng chủ OA không cần giấy tờ/đối chiếu doanh nghiệp.
- User đã phát sinh giao dịch chưa cần dữ liệu ngoài.
- Logo/brand ownership cần bằng chứng.
- Image module cần OCR/visual review và policy judgment.
- Full spellcheck tiếng Việt dễ false positive.

Nên em ưu tiên rule có thể check rõ từ text/link/params để tool có ích mà không tạo false confidence.

## Nếu hỏi "Mã G/P/S/H là gì, có phải tự chế không?"

Dạ, đó là internal mapping của em để rule dễ đọc và dễ gắn với code. Em không xem đó là mã chính thức của Zalo. Mỗi code đều có source:

- `G1/G2/...` trỏ về Zalo II.1.
- `P1/P4/...` trỏ về Zalo II.2.
- `S1/S2/S3` trỏ về II.3/IV hoặc chính sách Zalo.
- `H1/H2/H3` trỏ về image module rules.

Em làm vậy vì `II.1` quá rộng. Nếu output chỉ ghi `II.1`, user không biết đang sai link, SĐT, tham số hay logo.

## Nếu hỏi "Tool check những gì?"

Tool check 10 lỗi:

- Thiếu định danh khách hàng/giao dịch.
- Link trong nội dung thay vì CTA.
- SĐT/hotline trong nội dung thay vì CTA.
- Link group/group chat/social.
- Link rút gọn.
- Emoji/ký tự trang trí.
- Sai format tham số.
- Tham số thiếu nhãn phía trước.
- Typo rõ như "KÍCH HỌA".
- Wording chưa chính xác như "đơn hàng" khi ý là "mã đơn hàng".

## Nếu hỏi "Input Excel sao lại invalid?"

File Excel sample hiển thị JSON dạng viewer dump như `string"..."`, `{7 items`, `booltrue`, nên đó không phải JSON parse được trực tiếp. Em coi đó là invalid input case để test error handling. Tool nhận JSON chuẩn hoặc schema phẳng demo.

## Nếu hỏi "Tool output pass có chắc được duyệt không?"

Không ạ. `pass` chỉ nghĩa là tool không phát hiện lỗi trong 10 check đã ưu tiên. Vẫn còn checklist human review như STK đúng chủ, đối tượng nhận tin, logo ownership, ngành hạn chế, image rules. Em ghi rõ để tránh false confidence.

## Nếu hỏi "Sample nào chứng minh tool bám đề?"

Em đối chiếu với sample trong Excel:

- `589221`: link + hotline trong body -> `URL_IN_BODY`, `PHONE_IN_BODY`.
- `589269`: thiếu định danh -> `MISSING_IDENTIFIER`.
- `588835`: thiếu cặp tên KH + mã, thiếu tiền tố -> `MISSING_IDENTIFIER`, `PARAM_NO_PREFIX`.
- `587432`: voucher nhưng vẫn thiếu định danh -> `MISSING_IDENTIFIER`.
- `589220`: typo "KÍCH HỌA" -> `SUSPICIOUS_TYPO`.
- `588636`: STK đúng chủ cần human review + wording "đơn hàng" -> checklist + `WORDING`.
- `588255`: link group/chat -> `GROUP_CHAT_LINK`.

## Nếu hỏi "AI dùng ở đâu?"

Em dùng AI để đọc và hệ thống hóa ruleset, đối chiếu sample reject, viết logic kiểm trong TypeScript, và viết docs giải thích. Phần em chú ý là không để AI tự bịa rule: rule map luôn trỏ về link Zalo, còn những gì không chắc thì đưa vào human checklist.

## Câu kết

Em xem tool này như một pre-check assistant cho business, không phải replacement cho Zalo moderation. Điểm chính của bài là đọc rule, map rule, ưu tiên đúng phần có thể tự động hóa, và minh bạch phần nào vẫn cần người kiểm.

