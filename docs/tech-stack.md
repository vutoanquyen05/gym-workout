# Công nghệ và API thiết bị — Single Source of Truth

Nguồn: `baocao.md`, mục 6. Đây là danh sách công nghệ/API nền tảng, **không phải danh sách endpoint backend**.

## 6. Danh sách chức năng và công nghệ React Native/Expo

### 6.1. Công nghệ nền tảng

| Công nghệ | Vai trò |
|---|---|
| React Native | Xây dựng giao diện ứng dụng iOS và Android |
| Expo | Quản lý quy trình phát triển và tích hợp API thiết bị |
| TypeScript | Kiểm soát kiểu dữ liệu và hỗ trợ bảo trì |
| Expo Router | Điều hướng dựa trên cấu trúc tệp |
| React Hooks | Quản lý trạng thái và logic giao diện |
| Expo SecureStore | Lưu trữ thông tin nhạy cảm phù hợp với khả năng của nền tảng |
| SQLite | Lưu trữ dữ liệu có cấu trúc trên thiết bị |
| Expo Notifications | Quản lý thông báo và nhắc nhở |
| Expo Haptics | Phản hồi rung khi có tương tác phù hợp |
| Expo ImagePicker | Chọn hình ảnh từ thiết bị nếu cần |
| Expo Camera | Tích hợp camera khi có chức năng sử dụng |
| Expo Video | Phát video hướng dẫn bài tập |
| Expo Network | Kiểm tra trạng thái kết nối mạng |
| Expo FileSystem | Làm việc với tệp cục bộ |
| Expo Sharing | Chia sẻ dữ liệu hoặc tệp được xuất |
| AppState | Theo dõi trạng thái hoạt động của ứng dụng |
| React Native Safe Area Context | Xử lý vùng an toàn của màn hình |

**Baseline dự án hiện tại:** Expo SDK 57 (`expo ~57.0.30`). Đối chiếu API và khả năng tương thích thư viện với [tài liệu Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/); không suy luận API từ phiên bản SDK khác. Đây là baseline hiện tại, không hàm ý nâng cấp hoặc xác nhận trước các thư viện chưa được thêm vào dự án.

Danh sách trên là catalog công nghệ/API được cân nhắc cho sản phẩm, không phải kiểm kê dependency đã cài. `package.json` và `package-lock.json` xác nhận dependency thực tế; API hoặc thư viện chưa có trong đó cần được xem là chưa được tích hợp. Việc sử dụng từng thư viện cần căn cứ vào phiên bản Expo SDK đang triển khai và tài liệu tương ứng. Không phải chức năng nào cũng cần đưa vào MVP.

### 6.2. Chức năng xác thực và hồ sơ

**Chức năng:**
- Đăng ký và đăng nhập.
- Đăng xuất.
- Khôi phục hoặc làm mới phiên theo cơ chế backend.
- Xem và cập nhật hồ sơ.
- Thiết lập mục tiêu và thông tin ban đầu.
- Kiểm soát trạng thái đã hoàn thành onboarding.

**Công nghệ liên quan:**
- Expo Router.
- React Hooks.
- Expo SecureStore.
- API client.
- Validation.

**Lưu ý:** SecureStore phù hợp với dữ liệu nhạy cảm có dung lượng nhỏ, chẳng hạn token. Dữ liệu nghiệp vụ lớn không nên được lưu trực tiếp trong SecureStore.

### 6.3. Thư viện bài tập

**Chức năng:**
- Hiển thị danh sách bài tập.
- Tìm kiếm theo tên.
- Lọc theo nhóm cơ.
- Lọc theo thiết bị.
- Lọc theo độ khó.
- Xem chi tiết và hướng dẫn thực hiện.
- Phát video minh họa nếu có tài nguyên.

**Công nghệ liên quan:**
- React Native components.
- Hooks để quản lý bộ lọc.
- Expo Video.
- SQLite hoặc API backend để lấy dữ liệu.

### 6.4. Kế hoạch tập luyện

**Chức năng:**
- Xem danh sách kế hoạch.
- Xem các buổi tập trong kế hoạch.
- Thêm hoặc xóa bài tập.
- Điều chỉnh thứ tự bài tập.
- Tùy chỉnh số hiệp, số lần lặp và thời gian nghỉ.
- Khởi tạo buổi tập từ một kế hoạch.

**Công nghệ liên quan:**
- React Hooks.
- Expo Router.
- SQLite.
- API client khi cần đồng bộ.

### 6.5. Buổi tập đang diễn ra

Đây là module quan trọng nhất về trải nghiệm sử dụng vì người dùng thường thao tác nhanh và liên tục trong quá trình tập.

**Chức năng:**
- Bắt đầu buổi tập.
- Hiển thị danh sách bài tập.
- Ghi nhận số hiệp, số lần lặp và mức tạ.
- Đánh dấu hiệp đã hoàn thành.
- Bắt đầu và điều chỉnh thời gian nghỉ.
- Tạm dừng hoặc tiếp tục.
- Tự động lưu tiến trình.
- Khôi phục buổi tập chưa hoàn thành.
- Tổng kết khi kết thúc.

**Công nghệ liên quan:**
- SQLite để lưu dữ liệu cục bộ.
- Expo Haptics cho phản hồi tương tác.
- AppState để xử lý trạng thái ứng dụng.
- Expo Notifications nếu cần nhắc thời gian nghỉ khi ứng dụng ở nền.
- Expo Network để nhận biết thay đổi kết nối.

**Nguyên tắc quan trọng:** Không phụ thuộc hoàn toàn vào bộ đếm thời gian chạy liên tục trong JavaScript. Với đồng hồ nghỉ, nên lưu thời điểm kết thúc dự kiến rồi tính thời gian còn lại khi giao diện cập nhật hoặc ứng dụng quay lại foreground. Điều này giúp giảm sai lệch khi ứng dụng bị đưa xuống nền.

### 6.6. Lịch sử và theo dõi tiến bộ

**Chức năng:**
- Xem lịch sử theo ngày.
- Xem chi tiết từng buổi tập.
- Theo dõi khối lượng tập luyện.
- Theo dõi mức tạ và số lần lặp.
- Ghi nhận thành tích cá nhân (Personal Records — PR).
- Hiển thị biểu đồ theo thời gian.

**Công nghệ liên quan:**
- SQLite hoặc API backend.
- Thư viện biểu đồ tương thích với React Native/Expo.
- TypeScript để định nghĩa dữ liệu thống kê.

Các chỉ số phải được định nghĩa rõ ràng. Ví dụ, tổng khối lượng tập có thể được tính bằng tổng của `weight × reps` trên những hiệp hợp lệ. Cần quy định đơn vị, cách xử lý bài tập dùng trọng lượng cơ thể và cách loại trừ dữ liệu không hợp lệ để tránh kết quả thống kê gây hiểu nhầm.

### 6.7. Mục tiêu, phục hồi và thông báo

**Mục tiêu và thói quen:**
- Tạo mục tiêu theo thời gian.
- Theo dõi mức độ hoàn thành.
- Ghi nhận thói quen tập luyện.

**Phục hồi:**
- Cho phép người dùng tự đánh giá trạng thái phục hồi.
- Lưu lịch sử check-in.
- Hiển thị dữ liệu theo thời gian.
- Không sử dụng dữ liệu này như một chẩn đoán y tế.

**Thông báo:**
- Nhắc lịch tập theo lựa chọn của người dùng.
- Cho phép bật/tắt từng loại nhắc nhở.
- Xử lý quyền thông báo.
- Cập nhật hoặc hủy lịch thông báo khi cài đặt thay đổi.

---

## 7. Công nghệ mục tiêu — Multi-Tenant Gym Management (2026-10-23)

> **Cập nhật (2026-10-23):** Phần này mô tả công nghệ mục tiêu phục vụ hệ thống quản lý phòng gym nhiều tenant, đa chi nhánh. Các công nghệ dưới đây là đề xuất kiến trúc (Phase 0); chưa được cài đặt trong `package.json` trừ khi có ghi chú rõ ràng.

### 7.1. Kiến trúc phân tầng và công nghệ

| Thành phần | Công nghệ đề xuất | Trạng thái | Vai trò chính |
|---|---|---|---|
| **Mobile App (Hội viên)** | React Native, Expo SDK 57, TypeScript, Expo Router | Đang phát triển (Phase 1–3) | Ứng dụng di động cho hội viên: tập luyện cá nhân, xem gói tập, QR check-in, lịch PT |
| **Admin Web (Quản trị gym)** | React / Next.js App Router, TypeScript | PROPOSED (chưa duyệt, D-MT-02) | Cổng web dành cho Owner, Manager, Receptionist: quản lý chi nhánh, hội viên, gói tập, check-in, thanh toán |
| **Backend & Database** | Supabase (PostgreSQL 15+, Supabase Auth, Storage) | Sẵn sàng schema v1 (7 bảng core) | Dữ liệu trung tâm; xác thực người dùng; phân quyền multi-tenant qua PostgreSQL RLS |
| **Web Authentication** | Supabase SSR (`@supabase/ssr`) với httpOnly cookies | PROPOSED (chưa duyệt, D-MT-03) | Quản lý phiên web SSR an toàn, route protection qua middleware |
| **Mutation Gateway** | Edge Functions (nghiệp vụ) + RPC SECURITY DEFINER (transaction) | PROPOSED (chưa duyệt, D-MT-04) | Điểm kiểm soát toàn bộ thao tác ghi dữ liệu (idempotency, versioning, audit trail, role verification) |
| **Local Storage (Mobile)** | Expo SQLite (SDK 57) | Đã có v1 (offline-first) | Lưu trữ ngoại tuyến dữ liệu tập luyện cá nhân của hội viên (`exercises`, `plans`, `sessions`) và hàng đợi sync_outbox |
| **Shared Types / Monorepo** | npm workspaces / `packages/shared-types` | PROPOSED (chưa duyệt, D-MT-01) | Chia sẻ DTO, interfaces, validation schemas giữa Mobile App và Admin Web |

### 7.2. Chi tiết công nghệ Admin Web (Đề xuất)

- **Framework:** Next.js (App Router) với Server-Side Rendering (SSR) và React Server Components (RSC).
- **Ngôn ngữ:** TypeScript (strict mode đồng bộ với Mobile App).
- **Authentication:** Supabase SSR Auth (`@supabase/ssr`), quản lý phiên qua `httpOnly` secure cookies.
- **State Management & Data Fetching:** React Query / TanStack Query hoặc SWR kết hợp Server Actions.
- **Biểu đồ & Báo cáo:** Recharts hoặc Chart.js cho dashboard doanh thu, lượt check-in và thống kê hội viên.
- **Form & Validation:** React Hook Form kết hợp Zod schema (chia sẻ được với mobile).

### 7.3. Chi tiết Backend Supabase & PostgreSQL

- **PostgreSQL 15+:** Hỗ trợ UUID v4, JSONB, Row Level Security (RLS) cho multi-tenant isolation.
- **RLS Policies:** Thực thi cách ly tenant dựa trên `gym_id` liên kết qua bảng `gym_staff` và `gym_members`.
- **Supabase Auth:** Email/password, OTP, Magic Link, Invite flow cho nhân viên. Token JWT mang claims tiêu chuẩn.
- **Storage:** Supabase Storage (S3-compatible) lưu trữ avatar hội viên, logo phòng tập, ảnh/video bài tập có signed URLs.

### 7.4. Nguyên tắc phụ thuộc và kiểm định

1. **Tuân thủ quy tắc lockfile:** Chỉ những thư viện được liệt kê trong `package.json` của từng ứng dụng mới được coi là đã tích hợp.
2. **Không tự ý cài đặt package:** Mọi quyết định thêm dependency (đặc biệt cho Admin Web hoặc Monorepo) cần được phê duyệt theo `risks-decisions.md`.
3. **Kiểm tra tương thích:** Mọi cập nhật liên quan đến Expo API trên Mobile App phải tra cứu đúng Expo SDK 57 docs.
