# Member Management Module

## Mục đích

Quản lý hồ sơ hội viên, trạng thái, lịch sử và liên kết tài khoản trong từng gym (tenant). Phân biệt hội viên đã có tài khoản Supabase Auth với hội viên chưa có.

## Phạm vi

- Tạo, tìm kiếm và cập nhật hồ sơ hội viên.
- Liên kết hội viên với tài khoản Supabase Auth (nếu có).
- Quản lý trạng thái hội viên (active, suspended, expired).
- Xem lịch sử hoạt động của hội viên.
- Hỗ trợ hội viên chưa có tài khoản app (walk-in member).

## Trạng thái

**Chưa triển khai.** Module này thuộc Phase 3 — Member Management của roadmap mới. Toàn bộ nội dung là thiết kế mục tiêu.

---

## Kiến trúc/Cấu trúc (thiết kế mục tiêu)

### Thành phần dự kiến

```text
src/modules/member-management/   — (mobile app — xem profile của mình)
├── components/
│   ├── MemberProfileCard/
│   └── MemberStatusBadge/
├── hooks/
│   └── useMemberProfile.ts
└── services/
    └── memberService.ts

admin-web/src/modules/members/   — (Admin Web — quản lý hội viên)
├── components/
│   ├── MemberList/
│   ├── MemberSearch/
│   ├── MemberForm/
│   └── MemberHistoryPanel/
├── hooks/
│   ├── useMembers.ts
│   └── useMemberHistory.ts
└── services/
    └── memberAdminService.ts
```

### Phụ thuộc

- `multi-tenancy.md` — RBAC và tenant isolation.
- `membership.md` — gói tập liên kết với hội viên.
- `attendance.md` — lịch check-in của hội viên.
- `auth.md` — liên kết với tài khoản Supabase Auth.

---

## Thiết kế dữ liệu (mức tài liệu, chưa có SQL/migration)

### Bảng `gym_members` (cần thêm — chưa tạo)

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `UUID` | PK, do client tạo |
| `gym_id` | `UUID` | FK `gyms.id` |
| `user_id` | `UUID` (nullable) | FK `auth.users.id` — null nếu chưa có tài khoản |
| `member_code` | `text` | Mã hội viên nội bộ gym |
| `full_name` | `text` | Tên đầy đủ |
| `phone` | `text` (nullable) | Số điện thoại |
| `email` | `text` (nullable) | Email (có thể khác auth email) |
| `date_of_birth` | `date` (nullable) | Ngày sinh |
| `gender` | `text` (nullable) | Giới tính |
| `avatar_url` | `text` (nullable) | Ảnh đại diện |
| `home_branch_id` | `UUID` (nullable) | Chi nhánh đăng ký chính |
| `status` | `text` | `active` / `suspended` / `expired` |
| `notes` | `text` (nullable) | Ghi chú nội bộ |
| `created_by` | `UUID` | Staff tạo hồ sơ |
| `created_at` | `timestamptz` | Server time |
| `updated_at` | `timestamptz` | Server time |
| `deleted_at` | `timestamptz` (nullable) | Soft delete |
| `version` | `BIGINT` | Optimistic concurrency |

### Bảng `member_history_log` (tùy chọn — Phase 3+)

Ghi lại các sự kiện quan trọng: tạo hồ sơ, đổi trạng thái, thay đổi gói, ghi chú của staff.

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `UUID` | PK |
| `gym_id` | `UUID` | FK gyms |
| `member_id` | `UUID` | FK gym_members |
| `event_type` | `text` | `created`, `status_changed`, `membership_added`, `note_added`, ... |
| `actor_id` | `UUID` | Staff thực hiện |
| `details` | `jsonb` | Dữ liệu sự kiện |
| `created_at` | `timestamptz` | Thời điểm sự kiện |

---

## Luồng nghiệp vụ

### Tạo hồ sơ hội viên mới

```text
1. Receptionist/Manager vào Admin Web → Hội viên → Thêm mới.
2. Điền thông tin: tên, SĐT, email (bắt buộc: tên + một trong SĐT/email).
3. Chọn chi nhánh đăng ký chính (home_branch_id).
4. Hệ thống tạo `gym_members` qua gateway với `user_id = null` nếu chưa liên kết.
5. Hệ thống gán `member_code` theo quy tắc gym.
```

### Liên kết tài khoản Supabase Auth

```text
Kịch bản A — Hội viên tự đăng ký app mobile:
1. Member tải app, đăng ký tài khoản với email.
2. Hệ thống kiểm tra email trong `gym_members` (gym nào member đã đăng ký).
3. Nếu khớp → đề nghị liên kết; member xác nhận.
4. Cập nhật `gym_members.user_id = auth.uid()` qua gateway.

Kịch bản B — Staff liên kết thủ công:
1. Staff nhập email tài khoản của hội viên.
2. Hệ thống tra cứu `auth.users` qua gateway (không expose email catalog cho client).
3. Gửi thông báo xác nhận cho hội viên.
4. Sau khi xác nhận, cập nhật `user_id`.
```

### Tìm kiếm hội viên

- Tìm theo tên, số điện thoại, email, mã hội viên.
- Lọc theo chi nhánh, trạng thái, loại gói.
- Phân trang kết quả; không trả toàn bộ danh sách.

---

## Hội viên chưa có tài khoản (Walk-in Member)

- `gym_members.user_id = null` — hồ sơ tồn tại nhưng không liên kết tài khoản Supabase Auth.
- Có thể đăng ký gói tập, check-in thủ công và thanh toán tại quầy tiếp tân.
- Không thể đăng nhập hoặc dùng app mobile (không có credentials).
- **Nguyên tắc an toàn RLS:** Tuyệt đối không cho phép client truy vấn dữ liệu của walk-in member dưới danh nghĩa member. Policy kiểm tra member bắt buộc phải có điều kiện `gym_members.user_id IS NOT NULL AND gym_members.user_id = auth.uid()`.
- Khi hội viên muốn dùng app: thực hiện luồng liên kết tài khoản (Staff gửi invite hoặc hội viên đăng ký với cùng số điện thoại/email và xác thực OTP).

---

## Quy tắc bảo mật

- Staff chỉ thấy hội viên thuộc gym và branch của mình qua RLS; **bắt buộc kiểm tra `gym_staff.status = 'active'`**.
- Member chỉ thấy hồ sơ của chính mình qua app mobile (`gym_members.user_id IS NOT NULL AND gym_members.user_id = auth.uid()`).
- Không expose danh sách email hoặc SĐT của toàn bộ hội viên cho client.
- Thông tin nhạy cảm (ghi chú nội bộ, lịch sử nợ) chỉ staff đọc được.

---

## Lịch sử phát triển

- 2026-10-23: Tạo tài liệu module member-management phục vụ planning migration. Toàn bộ là thiết kế mục tiêu; chưa có code, SQL hay migration.

## Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-23 | Khởi tạo tài liệu member-management. | Planning migration dự án sang multi-tenant gym management. | Tài liệu thiết kế mức đặc tả; chưa có triển khai. |
| 2026-10-23 | Đồng bộ hóa mô tả `gym_members.status` thành `active / suspended / expired` và giữ `deleted_at` làm cơ chế soft-delete riêng. | Sửa theo kết quả Phase 0 Documentation Audit (AUD-04). | Loại bỏ mâu thuẫn giữa enum trạng thái nghiệp vụ và soft-delete. |
