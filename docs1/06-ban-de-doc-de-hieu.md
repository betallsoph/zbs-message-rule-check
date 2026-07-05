# 06 - Bản để đọc cho dễ hiểu

File này giải thích bài làm theo đúng đề, theo các link Zalo, và theo tiêu chí chấm. Đọc file này trước khi nộp là đủ nắm câu chuyện.

## 1. Đề bài thật sự muốn gì?

Challenge 2 không bảo mình làm một hệ thống kiểm duyệt thay Zalo. Đề bảo:

1. Đọc ruleset ZBS.
2. Map rule thành danh sách/bảng để chứng minh mình hiểu phạm vi kiểm duyệt.
3. Từ rule map đó, **chọn các rule quan trọng nhất để validate tự động**.
4. Giải thích vì sao chọn các rule đó.
5. Tool nhận JSON template và trả danh sách vi phạm.

Điểm then chốt trong đề là câu: **"You don't need to cover all of them - prioritization is part of what we're testing."**

Vì vậy bài này không cố auto hết luật. Bài này thể hiện product thinking: chọn rule nào máy kiểm tốt, rule nào cần người/giấy tờ.

## 2. Nguồn nào là nguồn chính?

Nguồn chính mình bám:

- Quy định kiểm duyệt ZBS: https://zalo.solutions/news/quy-dinh-chung-khi-kiem-duyet-mau-tin-nhan-zbs/xdygqtrjjm97k28rsh07wr72
- Thiết lập mục đích gửi/Tag: https://zalo.solutions/blog/thiet-lap-muc-dich-gui-khi-tao-mau-zns/jnb3n2isrtlb21vts4dpiyzb
- Tính năng hình ảnh: https://zalo.solutions/news/ra-mat-tinh-nang-thiet-lap-hinh-anh-trong-mau-tin-zns/ekq3tifzt6g0n8hlfwwjzt1q
- Quy định module hình ảnh: https://zalo.solutions/news/huong-dan-cac-quy-dinh-xet-duyet-template-zns-chua-module-hinh-anh/pkk6ds8irzpv7mok9hebggji
- Chính sách cộng đồng Zalo: https://help.zalo.me/huong-dan/chuyen-muc/chinh-sach-cong-dong-zalo/

Không tự chế luật ngoài các nguồn này. Mã `G/P/S/H/T` là mã tự đặt để tổ chức rule cho dễ đọc, nhưng mỗi mã đều có nguồn tương ứng.

## 3. Vì sao lại tự đặt mã G/P/S/H/T?

Tài liệu Zalo có các mục lớn như `II.1`, `II.2`, `II.3`, `IV`. Nhưng một mục như `II.1` chứa rất nhiều rule nhỏ: link, SĐT, tham số, logo, văn phong, policy...

Nếu tool chỉ báo "vi phạm II.1" thì user không biết sai gì. Vì vậy mình map thành mã nội bộ:

- `T`: Tag / mục đích gửi.
- `G`: General rules - yêu cầu tổng quan.
- `P`: Purpose rules - yêu cầu theo mục đích.
- `S`: Special cases - thanh toán, dịp đặc biệt, ngành đặc biệt.
- `H`: Image module rules.

Ví dụ:

- `G1` = Link nằm trong nội dung, phải đưa vào CTA. Nguồn: Zalo II.1.
- `G2` = SĐT/hotline nằm trong nội dung, phải đưa vào CTA. Nguồn: Zalo II.1.
- `P1` = thiếu tên khách hàng / mã định danh giao dịch. Nguồn: Zalo II.2.
- `H1` = rule kỹ thuật hình ảnh. Nguồn: quy định module hình ảnh.

Nói ngắn: **code riêng để dễ dùng, source Zalo để chứng minh không bịa.**

## 4. Tool đang ưu tiên kiểm gì?

Tool ưu tiên 10 check:

1. `MISSING_IDENTIFIER` (`P1`) - thiếu tên KH / định danh giao dịch.
2. `URL_IN_BODY` (`G1`) - link nằm trong body.
3. `PHONE_IN_BODY` (`G2`) - SĐT/hotline nằm trong body.
4. `GROUP_CHAT_LINK` (`G4`) - link group/chat/social.
5. `SUSPICIOUS_TYPO` (`G7`) - lỗi typo rõ, ví dụ "KÍCH HỌA".
6. `WORDING` (`P4`) - wording chưa chính xác, ví dụ "đơn hàng" khi ý là "mã đơn hàng".
7. `SHORTENED_LINK` (`G3`) - link rút gọn.
8. `EMOJI_SPECIAL` (`G5`) - emoji/ký tự trang trí.
9. `PARAM_FORMAT` (`G8`) - tham số sai format.
10. `PARAM_NO_PREFIX` (`G9`) - biến đứng một mình, thiếu nhãn phía trước.

Vì sao chọn 10 cái này:

- Có thể kiểm bằng JSON/text/link/params.
- Có sample reject thật trong Excel hoặc dễ reject.
- Ít cần giấy tờ hoặc dữ liệu ngoài.

## 5. Những gì không auto?

Không auto các rule cần người kiểm:

- User đã phát sinh giao dịch chưa.
- STK có đúng doanh nghiệp sở hữu OA không.
- Logo/brand có quyền dùng không.
- Ngành đặc biệt có giấy phép không.
- Chương trình khuyến mãi có công khai không.
- Hình ảnh có text quá nhỏ, QR, barcode, giả nút, logo bên khác, nội dung nhạy cảm không.

Tool đưa các mục này vào checklist "Cần người kiểm duyệt" để tránh false confidence.

## 6. JSON trong Excel là gì?

File `Json Template.xlsx` có sample hiển thị kiểu:

- `string"..."`
- `{7 items`
- `booltrue`
- `NULL`

Đó là pseudo JSON từ viewer, không phải JSON chuẩn. Tool cố tình detect và báo lỗi thân thiện. Đây là cách test invalid input. Tool vẫn hỗ trợ:

- JSON ZBS chuẩn có `root.sections[]`.
- Schema demo phẳng `{ content, buttons, params, tag }`.

## 7. Câu chuyện nộp bài trong một đoạn

Mình đọc ruleset ZBS, map thành các nhóm rule lớn `T/G/P/S/H`, rồi chọn 10 rule có thể kiểm đáng tin từ JSON để build tool. Tool không claim thay thế kiểm duyệt Zalo, mà giúp doanh nghiệp phát hiện lỗi phổ biến trước khi submit. Những rule cần giấy tờ, giao dịch thật, ownership, policy hoặc image review được đưa vào checklist human review.

