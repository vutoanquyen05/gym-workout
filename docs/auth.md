# Auth Module

## Mục đích

Quản lý các route đăng nhập/đăng ký và sẽ tích hợp Supabase Auth Email/Password sau khi cấu hình project, callback mobile và session storage được xác nhận. Hiện tại đây vẫn là module UI scaffold; thiết kế auth đã được chốt nhưng chưa có auth client/session thật.

## Kiến trúc/Cấu trúc

- `src/app/(auth)/_layout.tsx`: layout điều hướng cho các route truy cập.
- `src/app/(auth)/login.tsx`: điểm vào giao diện đăng nhập.
- `src/app/(auth)/register.tsx`: điểm vào giao diện đăng ký.
- `src/components/route-placeholder.tsx`: giao diện trình bày chung; các route hiện chỉ thông báo tình trạng blocker và liên kết qua lại.
- **Provider đã chọn:** Supabase Auth Email/Password; yêu cầu xác minh email trước khi truy cập dữ liệu cloud, PKCE callback cho app mobile và password reset qua email.
- **Profile:** Bản ghi `users` dùng cùng UUID với `auth.users.id`; tạo idempotently qua mutation channel server-side sau khi email được xác minh. Không cấp direct DML nếu điều đó bỏ qua version/receipt; endpoint tự suy ra ID từ `auth.uid()` và xác minh trạng thái email từ Auth context, không nhận owner/verified flag từ payload. Không sao chép password/credential và không dùng `user_metadata` cho quyết định phân quyền. Thiết kế RPC/gateway và quyền của function còn là blocker, chưa được triển khai hoặc phê duyệt.
- **Session:** Không lưu password. Dùng `expo-secure-store` cho refresh/session material trên iOS/Android; tài liệu SDK 57 hỗ trợ module này. Chưa cài đặt dependency; khi được duyệt sẽ cài bằng `expo install` và kiểm thử lỗi native storage/backup. Web không dùng SecureStore và cần chính sách session riêng trước khi bật đăng nhập web.
- Dùng thời hạn access token mặc định của Supabase (hiện tài liệu nêu 1 giờ) và refresh tự động; chưa đề xuất single-session hoặc custom inactivity timeout cho MVP. Không đổi session lifetime project mà chưa review bảo mật/UX.
- Email redirect/callback phải được cấu hình theo app scheme và allowlist từng môi trường. Không tự mở dữ liệu SQLite chưa gán owner cho tài khoản vừa đăng nhập.
- Nghiệp vụ auth/session, validation, deep-link handler và route guard chưa được triển khai. Chưa giả lập đăng nhập.

Trạng thái trước Phase 1.T04: chưa có auth route hoặc module auth trong mã nguồn. Tại Phase 1.T02, backend/auth còn blocker; quyết định Supabase Email/Password được chốt sau đó trong Phase 3.T06–T07. Các blocker project/callback, password policy, redirect, web-session policy và adapter dependency/validation được theo dõi tại `risks-decisions.md`.

## Lịch sử phát triển

- Phase 1.T04: thêm route login/register dưới Expo Router; không thực hiện xác thực thật do backend/auth còn blocker.
- Phase 3.T06–T07: chốt thiết kế Supabase Auth Email/Password + PKCE và quyền sở hữu profile; chưa triển khai client, session hoặc route guard.

## Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-18 | Tạo tài liệu module auth trước khi thêm route đăng nhập/đăng ký. | Tuân thủ quy trình tài liệu module và ghi rõ blocker xác thực. | Ghi nhận phạm vi route, các phần không được giả lập; chưa thay đổi mã. |
| 2026-10-18 | Thêm route đăng nhập/đăng ký với thông báo chưa tích hợp và liên kết chuyển route. | Hoàn tất cấu trúc auth routes mà không ngụ ý backend hoặc session hoạt động. | Expo web export, TypeScript và ESLint mục tiêu đạt. Lint toàn dự án còn một lỗi có sẵn tại `src/hooks/use-color-scheme.web.ts:11`; chưa có backend/auth thật. |
| 2026-10-21 | Ghi nhận thiết kế Supabase Auth Email/Password + PKCE, xác minh email, profile theo `auth.uid()` và session storage được bảo vệ bằng Expo SecureStore trên mobile. | Đồng bộ tài liệu module với quyết định Phase 3.T06–T07 và tài liệu Expo SDK 57. | Chỉ cập nhật tài liệu; chưa cài dependency, tích hợp Auth, thêm route callback/session storage hay kiểm thử runtime. |
| 2026-10-21 | Cập nhật gate: profile phải tạo qua mutation channel được duyệt, không giả định client insert trực tiếp vào bảng sync-managed. | Giữ version/idempotency contract nhất quán với grants Data API tối thiểu. | Chỉ phân tích/tài liệu; Auth Client, SecureStore và RPC/gateway chưa được triển khai. |
