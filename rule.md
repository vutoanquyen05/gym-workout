# RULE.md — AI AGENT WORKING RULES

## 1. Quy tắc khởi động phiên làm việc

- Trước khi thực hiện bất kỳ task nào, Agent **BẮT BUỘC** đọc đầy đủ `rule.md` và `mindmap.md`.
- Phải xác định phase hiện tại, mục tiêu và các bước tiếp theo theo `mindmap.md`.
- Nếu thiếu file hoặc không thể đọc file, phải dừng thực hiện và thông báo vấn đề. Không được tự ý bỏ qua quy tắc.

## 2. Quy tắc tài liệu module

- Mỗi module phải có một file tài liệu riêng theo định dạng `[tenmodule].md`, tương ứng với tên module.
- Nếu file chưa tồn tại, **BẮT BUỘC** tạo file trước khi phát triển hoặc chỉnh sửa module.
- File tài liệu phải bao gồm:
  - **Mục đích:** Chức năng và phạm vi của module.
  - **Kiến trúc/Cấu trúc:** Thành phần, tổ chức mã nguồn và quan hệ phụ thuộc.
  - **Lịch sử phát triển:** Các giai đoạn và thay đổi quan trọng.
  - **Nhật ký chỉnh sửa:** Thời gian, nội dung thay đổi, lý do và kết quả của từng lần sửa đổi.

## 3. Quy tắc trước khi chỉnh sửa

- Trước khi viết mới, sửa đổi, tái cấu trúc hoặc xóa bất kỳ code nào thuộc module, Agent **BẮT BUỘC** đọc đầy đủ file `[tenmodule].md` tương ứng.
- Phải nắm rõ mục đích, kiến trúc, các phụ thuộc và lịch sử thay đổi trước khi thực hiện.
- Nếu chưa xác định được module hoặc thiếu thông tin cần thiết, phải kiểm tra và làm rõ trước khi tiếp tục.

## 4. Quy tắc sau khi chỉnh sửa

- Sau mỗi lần hoàn thành thay đổi đối với module, Agent **BẮT BUỘC** cập nhật file `[tenmodule].md` tương ứng.
- Ghi nhận đầy đủ nội dung thay đổi, lý do, file bị ảnh hưởng, kết quả kiểm tra và lỗi còn tồn tại (nếu có).
- Tài liệu phải phản ánh đúng trạng thái thực tế của code, không ghi nhận những thay đổi chưa được thực hiện hoặc xác minh.

## 5. Nguyên tắc tuân thủ

- Các quy tắc trên là **BẮT BUỘC**, áp dụng cho mọi task và mọi phiên làm việc.
- Không được bỏ qua, tự ý vô hiệu hóa hoặc thay thế quy trình này.
- Không hoàn tất task khi tài liệu module chưa được cập nhật tương ứng.
- Ưu tiên tính nhất quán giữa code, tài liệu module và lộ trình trong `mindmap.md`.
