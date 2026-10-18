# Auth Module

## Mục đích

Quản lý các route giao diện đăng nhập và đăng ký. Tích hợp xác thực, quản lý phiên và lưu thông tin xác thực chỉ được triển khai sau khi backend, provider và hợp đồng API được xác nhận.

## Kiến trúc/Cấu trúc

- `src/app/(auth)/_layout.tsx`: layout điều hướng cho các route truy cập.
- `src/app/(auth)/login.tsx`: điểm vào giao diện đăng nhập.
- `src/app/(auth)/register.tsx`: điểm vào giao diện đăng ký.
- `src/components/route-placeholder.tsx`: giao diện trình bày chung; các route hiện chỉ thông báo tình trạng blocker và liên kết qua lại.
- Nghiệp vụ auth/session, validation và lưu token chưa được triển khai trong Phase 1.T04.
- Không đặt route guard hoặc giả lập đăng nhập khi chưa có provider và chính sách phiên đã xác nhận.

Trạng thái trước Phase 1.T04: chưa có auth route hoặc module auth trong mã nguồn. `risks-decisions.md` ghi backend, nhà cung cấp auth, quy tắc phiên và hợp đồng API là blocker.

## Lịch sử phát triển

- Phase 1.T04: thêm route login/register dưới Expo Router; không thực hiện xác thực thật do backend/auth còn blocker.

## Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-18 | Tạo tài liệu module auth trước khi thêm route đăng nhập/đăng ký. | Tuân thủ quy trình tài liệu module và ghi rõ blocker xác thực. | Ghi nhận phạm vi route, các phần không được giả lập; chưa thay đổi mã. |
| 2026-10-18 | Thêm route đăng nhập/đăng ký với thông báo chưa tích hợp và liên kết chuyển route. | Hoàn tất cấu trúc auth routes mà không ngụ ý backend hoặc session hoạt động. | Expo web export, TypeScript và ESLint mục tiêu đạt. Lint toàn dự án còn một lỗi có sẵn tại `src/hooks/use-color-scheme.web.ts:11`; chưa có backend/auth thật. |
