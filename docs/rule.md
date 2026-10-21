# RULE.md — AI AGENT WORKING RULES

## 1. Quy tắc khởi động phiên làm việc

- Trước khi thực hiện bất kỳ task nào, Agent **BẮT BUỘC** đọc đầy đủ `docs/rule.md` và `docs/mindmap.md`.
- Phải xác định phase hiện tại, mục tiêu và các bước tiếp theo theo `mindmap.md`.
- Nếu thiếu file hoặc không thể đọc file, phải dừng thực hiện và thông báo vấn đề. Không được tự ý bỏ qua quy tắc.

## 2. Quy tắc tài liệu module

- Mỗi module phải có một file tài liệu riêng theo định dạng `[tenmodule].md` trong `docs/`, tương ứng với tên module.
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
- Ưu tiên tính nhất quán giữa code, tài liệu module và lộ trình trong `docs/mindmap.md`.

## 6. Quy tắc kỹ thuật của project

- Đây là ứng dụng Expo/React Native đa nền tảng. Đọc phiên bản `expo` trong `package.json` và tài liệu Expo đúng phiên bản trước khi thay đổi API Expo/React Native; không suy diễn API từ phiên bản khác.
- Dùng Expo Router cho điều hướng: route và layout ở `src/app/`; component, hook, storage và tiện ích không phải route ở ngoài thư mục này.
- `package.json` và lockfile là nguồn xác nhận dependency thực tế. Project hiện dùng npm (`package-lock.json`); không coi thư viện/API được đề xuất trong tài liệu là đã cài hoặc đã tích hợp.
- Phân biệt rõ nội dung đã triển khai, scaffold, thiết kế đã duyệt và kế hoạch tương lai trong tài liệu. Trước khi ghi nhận trạng thái, đối chiếu source, config, test và trạng thái triển khai thực tế.
- Cấu hình native đặt trong `app.json` và config plugin. Thư mục `android/` hiện có trên máy nhưng bị Git ignore; xem đây là output native cục bộ, không sửa tay hoặc xóa nếu chưa được duyệt. Không tạo thư mục native bằng tay khi chưa có.
- Supabase migrations trong `supabase/migrations/` chưa đồng nghĩa đã được kiểm thử hoặc apply. Không chạy SQL, kết nối/đổi Cloud project, reset database hoặc áp dụng migration nếu task chưa có phê duyệt thực thi rõ ràng.
- Không cấp quyền ghi trực tiếp cho client để né mutation gateway/version/receipt contract. Mọi thay đổi RLS, grants, role hoặc privilege boundary cần theo tài liệu Supabase và được duyệt; các blocker hiện hành nằm trong `supabase-schema.md` và `risks-decisions.md`.
- Không xóa file, thư mục, dependency hoặc artifact chỉ dựa trên tên, trạng thái Git hay kết quả tìm kiếm import. Trước thao tác dọn dẹp phải phân biệt cache có thể tái tạo với source, native config, secret, dữ liệu và file chưa commit; cần phê duyệt nếu có nguy cơ mất dữ liệu hoặc trạng thái.

## 7. Kiểm tra và cập nhật tài liệu

- Dùng các script hiện có trong `package.json`; test/lint dự án chạy bằng `npm test` và `npm run lint`. Chạy kiểm tra phù hợp nhất với thay đổi và ghi đúng kết quả; không khẳng định đã chạy khi chưa chạy.
- Khi thay đổi module, cập nhật tài liệu module và nhật ký theo các mục 2–4. Khi thay đổi quyết định kiến trúc hoặc trạng thái phase, cập nhật tài liệu chuẩn tương ứng và `mindmap.md` nếu trạng thái roadmap thực sự đổi.
- Với thay đổi chỉ tài liệu, không chạy SQL, build hoặc test không liên quan; rà soát diff để tránh ghi nhận nội dung chưa được xác minh.

## Nhật ký cập nhật quy tắc

| Ngày | Thay đổi | Lý do |
|---|---|---|
| 2026-10-22 | Bổ sung baseline Expo/Router/npm, cách phân biệt trạng thái triển khai với kế hoạch, quy tắc native output, phê duyệt Supabase và an toàn dọn dẹp. | Đồng bộ hướng dẫn với cấu trúc/config hiện tại và các quyết định bảo mật đã ghi nhận. |
| 2026-10-22 | Chuyển tài liệu dự án vào `docs/`; giữ các entrypoint agent và README ở root. | Gom tài liệu có cấu trúc mà không làm mất khả năng tự nhận diện `AGENTS.md`/`CLAUDE.md` của công cụ. |
