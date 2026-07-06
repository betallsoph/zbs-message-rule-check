# ZBS Template Moderation - Rule Map cho Challenge 2

File này là rule map chính của bài làm Challenge 2. Mục tiêu là chứng minh mình đã đọc và hiểu phạm vi kiểm duyệt ZBS, sau đó chọn một phần rule phù hợp để tự động hoá trong tool.

## Nguồn tham khảo

- Quy định chung khi kiểm duyệt mẫu tin nhắn ZBS: https://zalo.solutions/news/quy-dinh-chung-khi-kiem-duyet-mau-tin-nhan-zbs/xdygqtrjjm97k28rsh07wr72
- Thiết lập mục đích gửi khi tạo mẫu tin nhắn ZBS: https://zalo.solutions/blog/thiet-lap-muc-dich-gui-khi-tao-mau-zns/jnb3n2isrtlb21vts4dpiyzb
- Bài ra mắt tính năng thiết lập hình ảnh trong mẫu tin ZNS/ZBS: https://zalo.solutions/news/ra-mat-tinh-nang-thiet-lap-hinh-anh-trong-mau-tin-zns/ekq3tifzt6g0n8hlfwwjzt1q
- Quy định xét duyệt template có module hình ảnh: https://zalo.solutions/news/huong-dan-cac-quy-dinh-xet-duyet-template-zns-chua-module-hinh-anh/pkk6ds8irzpv7mok9hebggji
- Chính sách cộng đồng Zalo: https://help.zalo.me/huong-dan/chuyen-muc/chinh-sach-cong-dong-zalo/

Ghi chú quan trọng: mã `T/G/P/S/H` trong file này là mã nội bộ của bài làm, không phải rule ID chính thức của Zalo. Cột `Nguồn` cho biết từng nhóm rule bám vào mục nào trong tài liệu gốc.

---

## Bước 1 - Map các nhóm rule lớn

Đề yêu cầu map rule để thể hiện mình hiểu phạm vi kiểm duyệt, nhưng cũng nói rõ không cần tự động hoá toàn bộ. Vì vậy mình map các nhóm rule lớn trước, rồi ở Bước 2 mới chọn subset quan trọng nhất để code.

### T. Mục đích gửi / Tag

| Mã | Nguồn | Nhóm rule | Mức tự động hoá | Ghi chú |
|---|---|---|---|---|
| T1 | Zalo I + bài thiết lập mục đích gửi | Chọn đúng Tag 1/2/3 theo mục đích gửi | Bán tự động | JSON không phải lúc nào cũng có Tag. Tool dùng dropdown/default để demo, nhưng thực tế người tạo mẫu nên chọn đúng mục đích gửi. |

Tóm tắt Tag theo nguồn:

- Tag 1 - Giao dịch: xác thực, xác nhận giao dịch, cập nhật trạng thái đơn hàng/giao dịch, yêu cầu thanh toán.
- Tag 2 - Chăm sóc khách hàng: cập nhật tài khoản/dịch vụ, khảo sát/đánh giá dịch vụ, thông báo quyền lợi khách hàng.
- Tag 3 - Hậu mãi: ưu đãi, upsell/cross-sell, mời tải app/kênh, tái tục/gia hạn, chương trình khuyến mãi sau mua.

### G. Quy định chung

| Mã | Nguồn | Nhóm rule | Mức tự động hoá | Mục kiểm trong tool |
|---|---|---|---|---|
| G1 | Zalo II.1 | Link không nằm trong nội dung, phải đặt ở CTA | Tự động | `URL_IN_BODY` |
| G2 | Zalo II.1 | SĐT/hotline không nằm trong nội dung, phải đặt ở CTA | Tự động | `PHONE_IN_BODY` |
| G3 | Zalo II.1 | Không dùng link rút gọn | Tự động | `SHORTENED_LINK` |
| G4 | Zalo II.1 | Không dẫn đến group/group chat, chat Messenger, Zalo cá nhân | Tự động | `GROUP_CHAT_LINK` |
| G5 | Zalo II.1 | Không dùng icon, emoji, ký tự trang trí | Tự động | `EMOJI_SPECIAL` |
| G6 | Zalo II.1 | Tiếng Việt có dấu, một ngôn ngữ, đúng chính tả | Bán tự động / người kiểm | Không full spellcheck vì dễ false positive. |
| G7 | Zalo II.1 | Bắt một số typo rõ ràng trong nội dung | Bán tự động | `SUSPICIOUS_TYPO` |
| G8 | Zalo II.1 | Tham số đúng format `<...>`, không dấu cách/dấu tiếng Việt, nối bằng `_` | Tự động | `PARAM_FORMAT` |
| G9 | Zalo II.1 | Tham số cần nhãn/tiền tố mô tả phía trước | Bán tự động | `PARAM_NO_PREFIX` |
| G10 | Zalo II.1 | Logo/ảnh thương hiệu đúng chuẩn và có quyền sử dụng | Người kiểm | Cần giấy tờ hoặc bằng chứng quyền sử dụng. |
| G11 | Zalo II.1 + Chính sách cộng đồng Zalo | Nội dung không vi phạm chính sách nền tảng, không lừa đảo/spam/giả mạo | Người kiểm | Cần đánh giá ngữ cảnh, không nên tự phán bằng regex. |
| G12 | Zalo II.1 | Nhắc đến thương hiệu bên khác cần chứng minh hợp tác/quyền sử dụng | Người kiểm | Cần giấy tờ hoặc nguồn ngoài. |

### P. Quy định theo mục đích gửi

| Mã | Nguồn | Nhóm rule | Mức tự động hoá | Mục kiểm trong tool |
|---|---|---|---|---|
| P1 | Zalo II.2 | Tag 1/2 cần tên khách hàng + ít nhất một tham số định danh/xác định giao dịch; Tag 3 cần tên khách hàng và định danh phù hợp mục đích | Tự động / bán tự động | `MISSING_IDENTIFIER` |
| P2 | Zalo II.1/II.2 | Chỉ gửi cho user đã phát sinh giao dịch, trừ OTP tài khoản mới | Người kiểm | Cần dữ liệu giao dịch ngoài JSON. |
| P3 | Zalo II.2 | OTP dùng mẫu mặc định, không CTA; miễn một số rule định danh | Tự động bằng ngoại lệ | `otpExempt` |
| P4 | Zalo II.2 | Wording phải rõ nghĩa, ví dụ khi nói mã đơn thì nên ghi "mã đơn hàng" | Bán tự động | `WORDING` |
| P5 | Zalo II.2 | Tag 3/khuyến mãi cần thể hiện điều kiện, HSD, thông tin chương trình/sản phẩm công khai | Người kiểm | Cần ngữ cảnh và nguồn công khai ngoài JSON. |
| P6 | Zalo II.2 | Payment tới STK ngân hàng phải dùng đúng mẫu yêu cầu thanh toán; kênh thanh toán độc lập cần CTA tương ứng | Người kiểm / bán tự động | Tool chỉ nhắc checklist khi phát hiện dấu hiệu payment. |

### S. Trường hợp đặc biệt

| Mã | Nguồn | Nhóm rule | Mức tự động hoá | Mục kiểm trong tool |
|---|---|---|---|---|
| S1 | Zalo II.3 | Sinh nhật/Lễ Tết/voucher cần quà/voucher hợp lệ, điều kiện áp dụng rõ ràng | Người kiểm | Checklist |
| S2 | Zalo II.1/II.2 | STK/chủ tài khoản thanh toán phải thuộc doanh nghiệp sở hữu OA hoặc có uỷ quyền thu hộ | Người kiểm | Checklist |
| S3 | Zalo IV + Chính sách cộng đồng Zalo | Ngành/sản phẩm hạn chế cần giấy phép hoặc có thể không được hỗ trợ | Người kiểm | Checklist |

### H. Module hình ảnh

| Mã | Nguồn | Nhóm rule | Mức tự động hoá | Mục kiểm trong tool |
|---|---|---|---|---|
| H1 | Bài ra mắt tính năng hình ảnh + Quy định module hình ảnh | Nếu có ảnh: tối đa 3 ảnh, tỉ lệ 16:9, <= 500KB, JPG/PNG, có CTA chính, không dùng cùng logo; Rating/OTP không hỗ trợ ảnh | Người kiểm / bán tự động | Checklist |
| H2 | Quy định module hình ảnh | Text trong ảnh rõ, không quá 50% diện tích; ảnh không chứa QR/barcode/SĐT/giả nút/giả hệ điều hành | Người kiểm | Checklist |
| H3 | Quy định module hình ảnh + Chính sách Zalo | Ảnh không chứa nội dung vi phạm, thương hiệu bên khác cần bằng chứng, ảnh AI cần làm rõ | Người kiểm | Checklist |

---

## Bước 2 - Ưu tiên rule để tự động hoá

Tiêu chí chọn rule để code:

1. Máy có thể kiểm từ JSON/nội dung template mà không cần giấy tờ hoặc dữ liệu ngoài.
2. Rule có tác động cao, xuất hiện trong sample reject thật hoặc là lỗi phổ biến dễ bị từ chối.
3. Ít false positive hơn so với cố làm full moderation.

### 10 mục kiểm được chọn

| Ưu tiên | Mục kiểm trong tool | Mã | Nguồn | Vì sao ưu tiên | Sample đối chiếu |
|---|---|---|---|---|---|
| 1 | `MISSING_IDENTIFIER` | P1 | Zalo II.2 | Reject nhiều trong sheet, gồm custom và voucher | 589269, 588835, 587432 |
| 2 | `URL_IN_BODY` | G1 | Zalo II.1 | Regex rõ, lỗi reject thật | 589221 |
| 3 | `PHONE_IN_BODY` | G2 | Zalo II.1 | Regex rõ, cùng case reject với link | 589221 |
| 4 | `GROUP_CHAT_LINK` | G4 | Zalo II.1 | Blacklist domain rõ, dễ bắt từ CTA/link | 588255 |
| 5 | `SUSPICIOUS_TYPO` | G7 | Zalo II.1 | Có typo reject thật, dùng từ điển hẹp để tránh báo nhầm | 589220 |
| 6 | `WORDING` | P4 | Zalo II.2 | Có wording reject thật | 588636 |
| 7 | `SHORTENED_LINK` | G3 | Zalo II.1 | Máy bắt tốt, rủi ro cao | Phòng lỗi |
| 8 | `EMOJI_SPECIAL` | G5 | Zalo II.1 | Máy bắt tốt, dễ reject do văn phong | Phòng lỗi |
| 9 | `PARAM_FORMAT` | G8 | Zalo II.1 | Regex sạch, phòng lỗi khi submit | Phòng lỗi |
| 10 | `PARAM_NO_PREFIX` | G9 | Zalo II.1 | Có sample liên quan nhưng cần người xác nhận | 587432 |

### Không tự động hoá có chủ ý

| Mã | Nguồn | Vì sao không tự động hoá |
|---|---|---|
| T1 | Zalo I + bài thiết lập mục đích gửi | Phân loại mục đích cần hiểu bối cảnh. Tool hỗ trợ dropdown/default, không đoán toàn bộ. |
| G6 | Zalo II.1 | Full spellcheck tiếng Việt dễ false positive; tool chỉ bắt một số typo nổi bật. |
| G10/G12 | Zalo II.1 | Logo/thương hiệu bên khác cần giấy tờ hoặc bằng chứng ngoài JSON. |
| P2/S2/S3 | Zalo II.1/II.2/IV | Cần dữ liệu giao dịch, chủ STK, giấy phép ngành hoặc bối cảnh kinh doanh. |
| H1/H2/H3 | Quy định module hình ảnh | Cần đọc ảnh, OCR, kiểm layout, kiểm giấy tờ và ngữ cảnh. |

---

## Bước 3 - Input và output của tool

Input tool hỗ trợ:

- JSON ZBS chuẩn: object có `root.sections[]`.
- Schema demo dạng phẳng: `{ content, buttons, params, tag }`.
- Pseudo JSON trong Excel (`string"..."`, `{7 items`, `booltrue`) được coi là invalid input để test error handling.
- Ví dụ input/output cụ thể nằm trong `public/examples/`, gồm:
  - `589221-input.json` -> `589221-output.json`
  - `589220-input.json` -> `589220-output.json`

Output:

- `status`: `pass` / `review` / `fail`.
- `errors`: vi phạm tự động bắt được.
- `warnings`: vi phạm bán tự động, người dùng cần soát lại.
- `checklist`: rule cần người kiểm thêm, giấy tờ hoặc ngữ cảnh ngoài JSON.

Lưu ý: `pass` chỉ nghĩa là tool không phát hiện lỗi trong 10 mục kiểm đã ưu tiên. Nó không đảm bảo mẫu chắc chắn được Zalo duyệt.
