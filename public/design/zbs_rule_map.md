# ZBS Template Moderation - Rule Map (Challenge 2)

Nguồn chính:

- Quy định chung khi kiểm duyệt mẫu tin nhắn ZBS: https://zalo.solutions/news/quy-dinh-chung-khi-kiem-duyet-mau-tin-nhan-zbs/xdygqtrjjm97k28rsh07wr72
- Thiết lập mục đích gửi khi tạo mẫu tin nhắn ZBS: https://zalo.solutions/blog/thiet-lap-muc-dich-gui-khi-tao-mau-zns/jnb3n2isrtlb21vts4dpiyzb
- Quy định module hình ảnh: https://zalo.solutions/news/huong-dan-cac-quy-dinh-xet-duyet-template-zns-chua-module-hinh-anh/pkk6ds8irzpv7mok9hebggji
- Chính sách cộng đồng Zalo: https://help.zalo.me/huong-dan/chuyen-muc/chinh-sach-cong-dong-zalo/

Ghi chú quan trọng: mã `G/P/S/H/T` bên dưới là mã tự map cho bài làm, không phải mã chính thức của Zalo. Cột `Nguồn` cho biết rule này bám vào mục nào của tài liệu gốc.

---

## Step 1 - Map các nhóm rule lớn

Đề yêu cầu "map the rules" để chứng minh đã hiểu phạm vi kiểm duyệt, nhưng Step 2 cũng yêu cầu prioritization nên tool không cần tự động hóa toàn bộ. Bảng này map các nhóm rule lớn, sau đó chọn subset đáng tự động hóa nhất.

### T. Phân loại mục đích gửi

| Code | Nguồn | Rule group | Auto? | Ghi chú |
|---|---|---|---|---|
| T1 | Zalo I + bài purpose guide | Chọn đúng Tag 1/2/3 theo mục đích gửi | Semi | JSON không luôn có Tag, nên demo dùng dropdown/default; thực tế cần người chọn đúng mục đích. |

Tag theo nguồn:

- Tag 1 - Giao dịch: liên quan giao dịch cụ thể, xác thực, xác nhận, trạng thái giao dịch, thanh toán.
- Tag 2 - Chăm sóc khách hàng: cập nhật tài khoản/chính sách, khảo sát/đánh giá dịch vụ, loyalty/quyền lợi khách hàng.
- Tag 3 - Hậu mãi: quảng bá, upsell/cross-sell, mời tải app/kênh, tái tục/gia hạn, khuyến mãi hậu mãi.

### G. Yêu cầu tổng quan

| Code | Nguồn | Rule group | Auto? | Check tool |
|---|---|---|---|---|
| G1 | Zalo II.1 | Link không nằm trong body, phải đặt ở CTA | Auto | `URL_IN_BODY` |
| G2 | Zalo II.1 | SĐT/hotline không nằm trong body, phải đặt ở CTA | Auto | `PHONE_IN_BODY` |
| G3 | Zalo II.1 | Không dùng link rút gọn | Auto | `SHORTENED_LINK` |
| G4 | Zalo II.1 | Không dẫn đến group/group chat, chat Messenger, Zalo cá nhân | Auto | `GROUP_CHAT_LINK` |
| G5 | Zalo II.1 | Không icon, emoji, ký tự trang trí | Auto | `EMOJI_SPECIAL` |
| G6 | Zalo II.1 | Tiếng Việt có dấu, một ngôn ngữ, đúng chính tả | Semi/Human | Không full spellcheck vì dễ false positive. |
| G7 | Zalo II.1 | Không typo rõ ràng trong nội dung | Semi | `SUSPICIOUS_TYPO` |
| G8 | Zalo II.1 | Tham số đúng format `<...>`, không dấu cách/dấu tiếng Việt, nối bằng `_` | Auto | `PARAM_FORMAT` |
| G9 | Zalo II.1 | Tham số cần nhãn/tiền tố mô tả phía trước | Semi | `PARAM_NO_PREFIX` |
| G10 | Zalo II.1 | Logo đúng chuẩn, không chứa link/SĐT, có quyền sử dụng | Human | Checklist giấy tờ/ngữ cảnh. |
| G11 | Zalo II.1 + chính sách cộng đồng | Nội dung không vi phạm chính sách nền tảng, không lừa đảo/spam/giả mạo | Human | Checklist/người kiểm, không tự phán bằng regex. |
| G12 | Zalo II.1 | Nhắc đến thương hiệu bên khác cần chứng minh hợp tác/quyền sử dụng | Human | Checklist giấy tờ. |

### P. Yêu cầu theo mục đích

| Code | Nguồn | Rule group | Auto? | Check tool |
|---|---|---|---|---|
| P1 | Zalo II.2 | Tag 1/2 cần tên khách hàng + ít nhất 1 tham số định danh/xác định giao dịch; Tag 3 cần tên khách hàng và định danh theo mục đích | Auto/Semi | `MISSING_IDENTIFIER` |
| P2 | Zalo II.1/II.2 | Chỉ gửi cho user đã phát sinh giao dịch, trừ OTP tài khoản mới | Human | Checklist vì cần dữ liệu ngoài JSON. |
| P3 | Zalo II.2 | OTP dùng mẫu mặc định, không CTA; miễn một số rule định danh | Auto bằng ngoại lệ | `otpExempt` |
| P4 | Zalo II.2 | Wording phải chính xác, ví dụ "đơn hàng" khi nói mã thì nên là "mã đơn hàng" | Semi | `WORDING` |
| P5 | Zalo II.2 | Tag 3/khuyến mãi cần thể hiện thể lệ, điều kiện, HSD/chương trình công khai | Human | Checklist vì cần ngữ cảnh/công khai ngoài JSON. |
| P6 | Zalo II.2 | Payment tới STK ngân hàng phải dùng đúng mẫu yêu cầu thanh toán; kênh thanh toán độc lập cần CTA tương ứng | Human/Semi | Checklist, có thể phát hiện dấu hiệu payment. |

### S. Dịp đặc biệt và ngành đặc biệt

| Code | Nguồn | Rule group | Auto? | Check tool |
|---|---|---|---|---|
| S1 | Zalo II.3 | Sinh nhật/Lễ Tết/voucher cần quà/voucher hợp lệ, điều kiện áp dụng rõ ràng | Human | Checklist |
| S2 | Zalo II.1/II.2 | STK/chủ tài khoản thanh toán phải thuộc DN sở hữu OA hoặc có ủy quyền thu hộ | Human | Checklist |
| S3 | Zalo IV + chính sách cộng đồng | Ngành/sản phẩm hạn chế cần giấy phép hoặc không được hỗ trợ | Human | Checklist |

### H. Module hình ảnh

| Code | Nguồn | Rule group | Auto? | Check tool |
|---|---|---|---|---|
| H1 | Quy định module hình ảnh | Nếu có ảnh: tối đa 3 ảnh, 16:9, <= 500KB, JPG/PNG, có CTA chính, không dùng cùng logo, Rating/OTP không hỗ trợ ảnh | Human/Semi | Checklist |
| H2 | Quy định module hình ảnh | Text trong ảnh rõ, không quá 50% diện tích; ảnh không QR/barcode/SĐT/giả nút/giả hệ điều hành | Human | Checklist |
| H3 | Quy định module hình ảnh + chính sách Zalo | Ảnh không chứa nội dung vi phạm, thương hiệu bên khác cần bằng chứng, AI image cần làm rõ | Human | Checklist |

---

## Step 2 - Prioritization

Tiêu chí chọn rule để code:

1. Máy có thể kiểm được từ JSON/content mà không cần giấy tờ hay dữ liệu ngoài.
2. Có impact cao trong sample reject thật của đề hoặc dễ gây reject phổ biến.
3. Ít false positive hơn so với full moderation.

### 10 check được chọn

| Rank | Check tool | Code | Nguồn | Vì sao ưu tiên | Sample đối chiếu |
|---|---|---|---|---|---|
| 1 | `MISSING_IDENTIFIER` | P1 | Zalo II.2 | Reject nhiều nhất trong sheet, gồm custom và voucher | 589269, 588835, 587432 |
| 2 | `URL_IN_BODY` | G1 | Zalo II.1 | Regex rõ, lỗi reject thật | 589221 |
| 3 | `PHONE_IN_BODY` | G2 | Zalo II.1 | Regex rõ, cùng case reject với link | 589221 |
| 4 | `GROUP_CHAT_LINK` | G4 | Zalo II.1 | Blacklist domain rõ | 588255 |
| 5 | `SUSPICIOUS_TYPO` | G7 | Zalo II.1 | Có typo reject thật, chỉ dùng từ điển hẹp | 589220 |
| 6 | `WORDING` | P4 | Zalo II.2 | Có wording reject thật | 588636 |
| 7 | `SHORTENED_LINK` | G3 | Zalo II.1 | Máy bắt tốt, rủi ro cao | Preventive |
| 8 | `EMOJI_SPECIAL` | G5 | Zalo II.1 | Máy bắt tốt, dễ reject do văn phong | Preventive |
| 9 | `PARAM_FORMAT` | G8 | Zalo II.1 | Regex sạch, phòng lỗi khi submit | Preventive |
| 10 | `PARAM_NO_PREFIX` | G9 | Zalo II.1 | Có sample liên quan nhưng cần người xác nhận | 587432 |

### Không tự động hóa có chủ ý

| Code | Nguồn | Không auto vì sao |
|---|---|---|
| T1 | Zalo I + purpose guide | Phân loại mục đích cần hiểu bối cảnh. Tool chỉ hỗ trợ chọn/default, không đoán toàn bộ. |
| G6 | Zalo II.1 | Full spellcheck tiếng Việt dễ false positive; chỉ bắt typo nổi bật. |
| G10/G12 | Zalo II.1 | Logo/thương hiệu bên khác cần giấy tờ hoặc nguồn ngoài. |
| P2/S2/S3 | Zalo II.1/II.2/IV | Cần dữ liệu giao dịch, chủ STK, giấy phép ngành. |
| H1/H2/H3 | Image rules | Cần đọc ảnh, OCR, kiểm layout/giấy tờ/ngữ cảnh. |

---

## Step 3 - Input và output

Input tool hỗ trợ:

- JSON ZBS chuẩn: object có `root.sections[]`.
- Schema demo phẳng: `{ content, buttons, params, tag }`.
- Pseudo JSON trong Excel (`string"..."`, `{7 items`, `booltrue`) được coi là invalid input để test error handling.

Output:

- `status`: pass / review / fail.
- `errors`: vi phạm tự động bắt được.
- `warnings`: vi phạm bán tự động, người dùng cần soát.
- `checklist`: rule cần human review/giấy tờ/ngữ cảnh.
