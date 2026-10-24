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

---

## Đề xuất mở rộng Auth cho Multi-Tenant (2026-10-23)

### Phân biệt 4 loại identity

| Loại | Bảng | Mô tả |
|---|---|---|
| Supabase Auth user | `auth.users` | Tài khoản xác thực; nguồn sự thật auth |
| Application user | `public.users` | Profile nghiệp vụ; `id = auth.uid()` |
| Gym Staff | `gym_staff` | Nhân viên gym; có vai trò và branch scope |
| Gym Member | `gym_members` | Hội viên; có thể liên kết hoặc chưa liên kết auth |

### Yêu cầu mở rộng Auth flow

**Staff invite flow (OD-01=A — Đã được Chủ dự án phê duyệt):**
- **Quyết định chốt:** Sử dụng Supabase Auth Admin API (`supabase.auth.admin.inviteUserByEmail`) thông qua Edge Function bảo mật (không dùng custom invite token hay gửi email trực tiếp từ client).
- **Nguyên tắc bảo mật:**
  - `service_role_key` chỉ được lưu trữ an toàn trong biến môi trường của Deno Edge Function, tuyệt đối không xuất hiện ở client bundle.
  - Edge Function bắt buộc xác thực caller JWT, kiểm tra `auth.uid()` có vai trò Owner hoặc Manager có thẩm quyền tại gym trước khi gửi lời mời.
- **Xử lý các kịch bản nghiệp vụ:**
  - *New user:* GoTrue tạo bản ghi `auth.users`, gửi email kích hoạt; Edge Function ghi nhận `gym_staff (status = 'invited')`.
  - *Existing user:* Cần xử lý phân nhánh an toàn (tránh lỗi 422 từ GoTrue); tạo bản ghi `gym_staff (status = 'invited')` và gửi thông báo mời tham gia phòng gym. Lưu ý: Không giả định trước các phương thức SDK chưa xác minh trên hosted runtime; hành vi API phải được kiểm chứng thực tế trong task P1.T04.
  - *Duplicate:* Chặn lời mời trùng lặp bằng mã lỗi `409 Conflict` nếu user đã có trạng thái `invited` hoặc `active` tại gym.
  - *Expired & Revoked:* Link GoTrue tự hết hạn sau 24h (hỗ trợ resend); Quản trị viên có thể hủy lời mời (`status = 'revoked'`) trước khi người được mời chấp nhận.

**Role lookup & Lifecycle Guard (chưa triển khai):**
- Sau khi đăng nhập, app/web query `gym_staff` với điều kiện `status = 'active'` để biết vai trò và chi nhánh phân công trong gym.
- Không đọc vai trò từ JWT claims hoặc `user_metadata` để tránh leo thang quyền từ client.
- Admin Web cần Next.js middleware tra cứu role active và trạng thái `gyms.status` trước khi render protected routes.
- **Xử lý trạng thái khi `gyms.status = 'suspended'`:** Khi phòng gym bị tạm khóa, Next.js Middleware chặn toàn bộ nhân viên (`staff/manager/trainer`) truy cập các route vận hành. Đối với Owner, Middleware điều hướng duy nhất đến trang thông báo tạm khóa và thanh toán gia hạn (`/admin/billing/suspended`), khóa toàn bộ các route nghiệp vụ (hội viên, điểm danh, cài đặt chi nhánh).

**Admin Web Auth & Session Strategy (D-MT-03 — APPROVED WITH CONDITIONS):**
- Thiết kế Server-First BFF sử dụng `@supabase/ssr` trên Next.js App Router đã được Chủ dự án **phê duyệt có điều kiện ngày 2026-10-23**.
- **Review an toàn Cookie và cấu hình chuẩn hóa:**
  - Bắt buộc cấu hình cookie trong Next.js Server Components, Server Actions và Middleware với: `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'lax'`, `path: '/'`.
  - *Client SDK Rule:* Tuyệt đối **không sử dụng `createBrowserClient`** trên trình duyệt để đọc session hoặc query data. Toàn bộ thao tác đọc/ghi dữ liệu nhạy cảm đi qua Server Components và Server Actions.
  - *Đăng xuất an toàn:* Server Action gọi `supabase.auth.signOut({ scope: 'local' })` qua session client của người dùng và xóa sạch cookie phiên (không sử dụng `admin.signOut()`).
- **Ranh giới Kỹ thuật & Điều kiện Kiểm thử Bắt buộc (AC-P0T07-01):**
  1. *Concurrent Token Refresh:* In-memory map tại Middleware chỉ hỗ trợ đồng bộ trong cùng một worker instance; cơ chế cốt lõi là GoTrue `REFRESH_TOKEN_REUSE_INTERVAL = 10s`. Hệ thống không bảo đảm thành công 100% trong mọi trường hợp mạng phân tán cực đoan; bắt buộc thiết kế cơ chế phục hồi duyên dáng (Graceful Degradation): bắt lỗi 401, xóa cookie hỏng và redirect về `/login?reason=session_expired` mà không crash hoặc lặp chuyển hướng.
  2. *Cookie Chunking:* Kiểm thử ghép chuỗi chunked cookies (`.0`, `.1`) khi JWT payload vượt quá 3KB.
  3. *Đồng bộ Đa tab:* Xác nhận Tab B nhận 401 và chuyển hướng về `/login` khi Tab A đã đăng xuất.
  4. *CSRF & Next.js Server Actions:* Server Actions tự động đối chiếu Origin/Host header chống Cross-Site Form Submissions; tuy nhiên không tự động chống được Session Riding do XSS hoặc Same-Site Subdomain attacks. Bắt buộc kết hợp CSP nghiêm ngặt.
  > *Lưu ý kỷ luật:* Toàn bộ các ranh giới trên là thiết kế kiến trúc mục tiêu, **chưa được xem là đã PASS** cho đến khi thực thi đầy đủ test cases tại Phase 1 và Phase 2.

**Anonymous Auth users:**
- Policy hiện tại từ chối JWT mang `is_anonymous = true`.
- Gym management tables và Edge Functions/RPC phải kế thừa nguyên tắc này.
- Walk-in member (`gym_members.user_id = null`) không liên quan đến anonymous Auth user; policy member luôn kiểm tra `gym_members.user_id IS NOT NULL AND gym_members.user_id = auth.uid()`.

### Trạng thái các Blocker Auth

- [x] **Staff invite flow (OD-01=A):** Đã phê duyệt phương án Supabase Auth Admin API qua Edge Function bảo mật.
- [x] **Chiến lược Web Auth (D-MT-03):** Đã phê duyệt có điều kiện Server-First Auth với Server Actions proxy và cookie `httpOnly: true`.
- [ ] Role cache strategy: tra cứu per-request trong Server Components vs. JWT custom claims via Supabase Auth hooks (chờ Phase 1/Phase 2).
- [ ] Member linking flow: tự liên kết email/SĐT vs. staff liên kết thủ công tại quầy (chờ Phase 3).
