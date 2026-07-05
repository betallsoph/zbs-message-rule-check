# 02 - Rule Map Dễ Hiểu

File chính thức của rule map nằm ở `public/design/zbs_rule_map.md`. File này giải thích lại bằng tiếng dễ hiểu.

## Nhóm T - Mục đích gửi / Tag

Nguồn: Zalo I + bài "Thiết lập mục đích gửi".

Zalo chia nội dung thành 3 Tag:

- **Tag 1 - Giao dịch:** xác thực, xác nhận, nhắc hẹn, trạng thái giao dịch, thanh toán.
- **Tag 2 - Chăm sóc khách hàng:** cập nhật tài khoản/chính sách, khảo sát/đánh giá dịch vụ, loyalty/quyền lợi khách hàng.
- **Tag 3 - Hậu mãi:** quảng bá, upsell/cross-sell, mời tải app/kênh, tái tục/gia hạn, khuyến mãi hậu mãi.

Tool không cố đoán Tag bằng AI. JSON sample không luôn có Tag nên demo dùng default theo loại template, và flat schema cho phép truyền `tag` trực tiếp.

## Nhóm G - Yêu cầu tổng quan

Nguồn: Zalo II.1.

Các rule quan trọng:

- `G1`: Link không được nằm trong nội dung, phải để ở CTA.
- `G2`: SĐT/hotline không được nằm trong nội dung, phải để ở CTA.
- `G3`: Không dùng link rút gọn.
- `G4`: Không dẫn tới group/group chat, Messenger, Zalo cá nhân.
- `G5`: Không emoji/ký tự trang trí.
- `G6`: Đúng chính tả, tiếng Việt có dấu, một ngôn ngữ.
- `G7`: Không typo rõ ràng.
- `G8`: Tham số đúng format `<...>`.
- `G9`: Tham số phải có nhãn/tiền tố mô tả.
- `G10`: Logo đúng chuẩn và có quyền sử dụng.
- `G11`: Không vi phạm chính sách nền tảng.
- `G12`: Nhắc tới thương hiệu khác cần bằng chứng hợp tác/quyền dùng.

Tool auto các rule `G1/G2/G3/G4/G5/G8`, semi `G7/G9`, human checklist `G10/G11/G12`.

## Nhóm P - Theo mục đích gửi

Nguồn: Zalo II.2.

- `P1`: Tag 1/2 cần tên khách hàng + ít nhất 1 tham số định danh/xác định giao dịch. Tag 3 cũng cần tên khách hàng và định danh tùy mục đích.
- `P2`: Chỉ gửi cho user đã phát sinh giao dịch, trừ OTP tài khoản mới.
- `P3`: OTP dùng mẫu mặc định, không CTA, được xử lý bằng ngoại lệ.
- `P4`: Wording phải chính xác, ví dụ khi nói mã thì dùng "mã đơn hàng".
- `P5`: Tag 3/khuyến mãi cần thể lệ, điều kiện, HSD/chương trình công khai.
- `P6`: Payment cần đúng mẫu/kênh thanh toán tương ứng.

Tool ưu tiên auto/semi `P1` và `P4`, còn `P2/P5/P6` là checklist.

## Nhóm S - Dịp/ngành/thanh toán

Nguồn: Zalo II.3, IV, chính sách cộng đồng.

- `S1`: Sinh nhật/Lễ Tết/voucher cần quà/voucher hợp lệ, thể lệ rõ.
- `S2`: STK/chủ tài khoản phải là DN sở hữu OA hoặc có ủy quyền thu hộ.
- `S3`: Ngành/sản phẩm hạn chế cần giấy phép hoặc không hỗ trợ.

Tool không tự phán các mục này, chỉ bật checklist nếu có dấu hiệu.

## Nhóm H - Module hình ảnh

Nguồn: quy định module hình ảnh.

- `H1`: Tối đa 3 ảnh, 16:9, <= 500KB, JPG/PNG, có CTA chính, không dùng cùng logo, Rating/OTP không hỗ trợ ảnh.
- `H2`: Text trong ảnh phải rõ, không quá 50%; không QR/barcode/SĐT/giả nút/giả hệ điều hành.
- `H3`: Ảnh không chứa nội dung vi phạm; thương hiệu bên khác cần bằng chứng; ảnh AI cần làm rõ.

Tool chỉ đưa vào checklist vì muốn kiểm chuẩn cần OCR/vision và ngữ cảnh.

