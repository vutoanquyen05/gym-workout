# Auth Module

## Mục đích

Quản lý Supabase Auth Email/Password và vòng đời session trên iOS/Android. Nền tảng Auth Client/Session đã được triển khai; các route login/register vẫn là UI scaffold và chưa gọi API đăng nhập/đăng ký. Phase 3.T02 vẫn đang thực hiện, chưa được đánh dấu hoàn thành.

## Kiến trúc/Cấu trúc

- `src/app/(auth)/_layout.tsx`: layout điều hướng cho các route truy cập.
- `src/app/(auth)/login.tsx`: điểm vào giao diện đăng nhập.
- `src/app/(auth)/register.tsx`: điểm vào giao diện đăng ký.
- `src/components/route-placeholder.tsx`: giao diện trình bày chung; các route hiện chỉ thông báo tình trạng blocker và liên kết qua lại.
- `src/modules/auth/services/supabase-client.ts`: khởi tạo Supabase JS client lười (lazy), kiểm tra URL/key, dùng publishable key và bật PKCE, persistent session, auto-refresh; không bật phát hiện callback URL.
- `src/modules/auth/services/secure-store-adapter.ts`: ánh xạ Supabase Storage sang `expo-secure-store`; không bắt hoặc thay thế lỗi đọc/ghi/xóa.
- `src/modules/auth/hooks/auth-provider.tsx`: khôi phục session, nhận sự kiện Auth, cung cấp `useAuth`, loading/error state và logout local; theo dõi `AppState` để tạm dừng auto-refresh khi app ra nền.
- `src/modules/auth/index.ts`: public exports của Auth module.
- `src/app/_layout.tsx`: mount `AuthProvider` quanh navigator; không thêm route guard.
- `__tests__/auth-provider-test.tsx` và `__tests__/auth-storage-test.ts`: kiểm thử lifecycle session và adapter storage.
- **Provider đã chọn:** Supabase Auth Email/Password; yêu cầu xác minh email trước khi truy cập dữ liệu cloud, PKCE callback cho app mobile và password reset qua email.
- **Profile:** Bản ghi `users` dùng cùng UUID với `auth.users.id`; tạo idempotently qua mutation channel server-side sau khi email được xác minh. Không cấp direct DML nếu điều đó bỏ qua version/receipt; endpoint tự suy ra ID từ `auth.uid()` và xác minh trạng thái email từ Auth context, không nhận owner/verified flag từ payload. Không sao chép password/credential và không dùng `user_metadata` cho quyết định phân quyền. Thiết kế RPC/gateway và quyền của function còn là blocker, chưa được triển khai hoặc phê duyệt.
- **Cấu hình client:** Đọc `EXPO_PUBLIC_SUPABASE_URL` và `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` trực tiếp từ Expo environment. Chỉ chấp nhận URL HTTPS (hoặc HTTP loopback cho phát triển cục bộ) và key có tiền tố `sb_publishable_`; thông báo lỗi không chứa giá trị URL/key. `.env.local` nằm trong Git ignore. Publishable key được nhúng trong bundle và không phải secret; tuyệt đối không dùng secret/service-role key.
- **Session:** Không lưu password. `expo-secure-store` `~57.0.4` được thêm bằng Expo SDK 57-compatible installer và config plugin đã đăng ký trong `app.json`. Storage adapter dùng SecureStore trên iOS/Android; Supabase Auth cấu hình `persistSession`, `autoRefreshToken`, `flowType: 'pkce'` và `detectSessionInUrl: false`. Provider lấy session lúc khởi tạo, nhận cập nhật/refresh qua `onAuthStateChange`, hiển thị loading/error, và logout với `scope: 'local'` để không chủ động thu hồi session trên thiết bị khác. Auto-refresh được bật khi app hoạt động và dừng khi app ra nền.
- **Nền tảng:** Auth Client/Session không được khởi tạo trên web; web provider giữ trạng thái signed-out và không có storage fallback. Android/iOS runtime với Expo Go chưa được kiểm thử thủ công. SecureStore lưu giá trị lớn có thể bị hệ điều hành từ chối; lỗi native được truyền lên thay vì biến thành session thành công giả. iOS Keychain có thể giữ session qua gỡ/cài lại cùng bundle ID; logout local là thao tác xóa session rõ ràng.
- Dùng thời hạn access token mặc định của Supabase; chưa đề xuất single-session hoặc custom inactivity timeout cho MVP. Không đổi session lifetime project mà chưa review bảo mật/UX.
- Email redirect/callback phải được cấu hình theo app scheme và allowlist từng môi trường. Không tự mở dữ liệu SQLite chưa gán owner cho tài khoản vừa đăng nhập.
- **Chưa triển khai:** màn hình gọi sign-in/sign-up, email-confirmation gate, password recovery, callback/deep-link handling, route guard, tạo `public.users`, SQLite account partition hoặc import/merge dữ liệu local chưa có owner. Provider hiện quản lý session client-side nhưng không cấp quyền ghi dữ liệu và không tự đồng bộ dữ liệu SQLite.

Trạng thái trước Phase 1.T04: chưa có auth route hoặc module auth trong mã nguồn. Tại Phase 1.T02, backend/auth còn blocker; quyết định Supabase Email/Password được chốt sau đó trong Phase 3.T06–T07. Các blocker project/callback, password policy, redirect, web-session policy và kiểm thử runtime SecureStore được theo dõi tại `risks-decisions.md`.

## Lịch sử phát triển

- Phase 1.T04: thêm route login/register dưới Expo Router; không thực hiện xác thực thật do backend/auth còn blocker.
- Phase 3.T06–T07: chốt thiết kế Supabase Auth Email/Password + PKCE và quyền sở hữu profile; chưa triển khai client, session hoặc route guard.
- Phase 3.T02 (2026-10-22): thêm Supabase client native, SecureStore adapter, `AuthProvider`/`useAuth`, local sign-out, lifecycle auto-refresh và unit tests; đăng ký provider ở root mà không thay đổi route UI. Toàn bộ 25 Jest tests, TypeScript, lint và web static export đạt. Chưa kiểm thử runtime SecureStore trên thiết bị, callback, email verification gate, route guard, profile hoặc SQLite.

## Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-18 | Tạo tài liệu module auth trước khi thêm route đăng nhập/đăng ký. | Tuân thủ quy trình tài liệu module và ghi rõ blocker xác thực. | Ghi nhận phạm vi route, các phần không được giả lập; chưa thay đổi mã. |
| 2026-10-18 | Thêm route đăng nhập/đăng ký với thông báo chưa tích hợp và liên kết chuyển route. | Hoàn tất cấu trúc auth routes mà không ngụ ý backend hoặc session hoạt động. | Expo web export, TypeScript và ESLint mục tiêu đạt. Lint toàn dự án còn một lỗi có sẵn tại `src/hooks/use-color-scheme.web.ts:11`; chưa có backend/auth thật. |
| 2026-10-21 | Ghi nhận thiết kế Supabase Auth Email/Password + PKCE, xác minh email, profile theo `auth.uid()` và session storage được bảo vệ bằng Expo SecureStore trên mobile. | Đồng bộ tài liệu module với quyết định Phase 3.T06–T07 và tài liệu Expo SDK 57. | Chỉ cập nhật tài liệu; chưa cài dependency, tích hợp Auth, thêm route callback/session storage hay kiểm thử runtime. |
| 2026-10-21 | Cập nhật gate: profile phải tạo qua mutation channel được duyệt, không giả định client insert trực tiếp vào bảng sync-managed. | Giữ version/idempotency contract nhất quán với grants Data API tối thiểu. | Chỉ phân tích/tài liệu; Auth Client, SecureStore và RPC/gateway chưa được triển khai. |
| 2026-10-22 | Tích hợp Auth Client/Session nền tảng cho iOS/Android, SecureStore và provider dùng chung. | Tiếp tục Phase 3.T02 sau khi cấu hình URL/publishable key cục bộ được xác nhận. | Toàn bộ 25 Jest tests, TypeScript, lint và web static export đạt. Login/register UI, callback, email-verification enforcement, guard, profile và SQLite vẫn ngoài phạm vi. |
