# 01 - Đề bài và chiến lược làm

## Đề bài Challenge 2 yêu cầu gì?

Đề yêu cầu build một tool nhỏ giúp doanh nghiệp kiểm tra template ZBS trước khi gửi duyệt.

Các phần chính:

1. **Step 1 - Map the rules**  
   Đọc ruleset Zalo và hệ thống hóa các rule template cần pass. Có thể là categorized list/table.

2. **Step 2 - Build the checks**  
   Từ rule map đó, chọn các rule quan trọng nhất để validate tự động và giải thích vì sao chọn. Đề ghi rõ không cần cover all rules; prioritization là một phần được chấm.

3. **Input**  
   JSON mô tả template registration content.

4. **Output**  
   Danh sách vi phạm tìm thấy, optional có gợi ý sửa.

5. **Deliverable**  
   Rule map + working tool + vài input/output mẫu.

## Chiến lược của bài này

Bài này không cố làm “moderator thay Zalo”. Tool chỉ tự động hóa các rule:

- Có thể kiểm được từ JSON/text/link/params.
- Ít cần giấy tờ, dữ liệu giao dịch thật, hoặc phán đoán người kiểm duyệt.
- Có impact cao trong sample reject thật.

Vì vậy rule map có 2 tầng:

- **Map scope lớn:** cho thấy mình hiểu toàn bộ phạm vi kiểm duyệt.
- **Prioritized checks:** chọn 10 check đáng code nhất.

## Vì sao dùng mã G/P/S/H?

Mã `G/P/S/H/T` là mã tự map cho bài:

- `T`: Tag / mục đích gửi.
- `G`: General rules, tương ứng yêu cầu tổng quan.
- `P`: Purpose-specific rules, tương ứng yêu cầu theo mục đích.
- `S`: Special cases như dịp đặc biệt, ngành đặc biệt, thanh toán.
- `H`: Image module rules.

Mã này không phải mã chính thức của Zalo. Mỗi mã luôn có cột `source` như `Zalo II.1`, `Zalo II.2`, `Zalo IV`, hoặc link module hình ảnh để chứng minh bám nguồn.

## Những gì cố tình không auto

Không auto các phần sau vì dễ sai hoặc cần dữ liệu ngoài:

- Xác minh người nhận đã từng giao dịch.
- Xác minh STK đúng chủ doanh nghiệp.
- Xác minh quyền dùng logo/thương hiệu bên thứ ba.
- Kiểm giấy phép ngành hạn chế.
- Kiểm đầy đủ chính sách cộng đồng bằng regex.
- Kiểm ảnh bằng OCR/computer vision.
- Full spellcheck tiếng Việt.

Các mục đó được đưa vào checklist human review.

