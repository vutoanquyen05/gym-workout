# Gym Management Module

## Mục đích

Quản lý thông tin phòng gym (tenant) và các chi nhánh (branch) trong hệ thống multi-tenant. Mỗi gym là một tenant độc lập; nhân viên và hội viên thuộc gym thông qua vai trò và chi nhánh.

## Phạm vi

Module này bao gồm:

- Tạo và quản lý hồ sơ gym (tenant).
- Tạo và quản lý chi nhánh (branches) trong gym.
- Mời và quản lý nhân viên (staff) theo chi nhánh.
- Phân công vai trò: Owner, Manager, Receptionist, Trainer.
- Cài đặt và cấu hình gym (giờ hoạt động, liên hệ, logo).

## Trạng thái

**Chưa triển khai.** Module này thuộc Phase 2 của roadmap mới (xem `mindmap.md`). Toàn bộ nội dung là thiết kế mục tiêu, chưa có code hoặc migration.

---

## Kiến trúc/Cấu trúc

### Thành phần dự kiến (chưa triển khai)

```text
src/modules/gym-management/
├── components/
│   ├── GymCard/
│   ├── BranchCard/
│   └── StaffInviteForm/
├── hooks/
│   ├── useGym.ts
│   └── useBranch.ts
├── services/
│   ├── gymService.ts
│   └── branchService.ts
└── types/
    └── index.ts

src/app/(admin)/
├── gyms/
│   ├── index.tsx        — Danh sách gyms của owner
│   ├── [gymId]/
│   │   ├── index.tsx    — Dashboard gym
│   │   ├── branches/    — Quản lý chi nhánh
│   │   └── settings/    — Cài đặt gym
└── _layout.tsx
```

### Phụ thuộc

- `multi-tenancy.md` — mô hình tenant và isolation.
- `auth.md` — Auth extension cho roles.
- `supabase-schema.md` — schema extension cho gym/branch tables.

---

## Thiết kế dữ liệu GM-1 (Chi tiết chuẩn bị cho P0.T08 — chưa tạo SQL/migration)

### Các bảng nhóm GM-1

1. **`gyms` (Tenant gốc):**
   - Cột: `id UUID PRIMARY KEY`, `name TEXT NOT NULL`, `slug TEXT NOT NULL UNIQUE`, `owner_id UUID NOT NULL REFERENCES auth.users(id)`, `status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived'))`, `created_at`, `updated_at`.
2. **`branches` (Chi nhánh):**
   - Cột: `id UUID PRIMARY KEY`, `gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE RESTRICT`, `name TEXT NOT NULL`, `slug TEXT NOT NULL`, `address TEXT`, `phone TEXT`, `status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived'))`, `created_at`, `updated_at`.
   - Ràng buộc: `CONSTRAINT branches_gym_slug_unique UNIQUE (gym_id, slug)`, `CONSTRAINT branches_id_gym_unique UNIQUE (id, gym_id)`.
3. **`gym_staff` (Nhân sự & Phân quyền):**
   - Cột: `id UUID PRIMARY KEY`, `gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE`, `branch_id UUID` (NULL = quyền toàn gym), `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`, `role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'receptionist', 'trainer'))`, `status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'suspended'))`, `invited_at`, `activated_at`, `created_at`, `updated_at`.
   - Ràng buộc khóa ngoại hỗn hợp (Composite Foreign Key) bảo vệ audit trail: `CONSTRAINT fk_gym_staff_branch_gym FOREIGN KEY (branch_id, gym_id) REFERENCES public.branches(id, gym_id) ON DELETE RESTRICT`.

### Ngăn chặn Cross-Tenant Branch Assignment, Bảo vệ Audit Trail & Soft-Deactivation

- **Ngăn chặn Cross-Tenant Assignment:** Nhờ Composite Foreign Key `(branch_id, gym_id)` tham chiếu `branches(id, gym_id)`, database engine ngăn chặn tuyệt đối việc gán chi nhánh của Gym B cho nhân viên thuộc Gym A khi `branch_id IS NOT NULL`.
- **Bảo vệ Audit Trail với `ON DELETE RESTRICT`:** Đổi hành vi xóa sang `ON DELETE RESTRICT` nhằm ngăn ngừa việc xóa vật lý chi nhánh làm mất sạch lịch sử phân công nhân sự và audit trail. Database từ chối xóa chi nhánh nếu còn bản ghi nhân sự liên kết.
- **Chiến lược Soft-Deactivation cho Chi nhánh:** Chi nhánh giải thể hoặc dừng vận hành được đánh dấu `status = 'archived'` (hoặc `status = 'suspended'` nếu tạm dừng sửa chữa/bảo trì) thay vì xóa vật lý khỏi database, vừa lưu giữ toàn vẹn lịch sử đối soát vừa chặn các giao dịch mới.
- **Vấn đề `branch_id IS NULL`:** Chuẩn SQL quy định `NULL != NULL`, nên `UNIQUE(gym_id, branch_id, user_id)` sẽ không ngăn được trùng lặp khi `branch_id` là NULL.
- **Giải pháp hai Partial Unique Indexes:**
  1. *Quyền toàn gym:* `CREATE UNIQUE INDEX gym_staff_gym_user_null_branch_idx ON public.gym_staff (gym_id, user_id) WHERE branch_id IS NULL;` -> Đảm bảo 1 user chỉ có tối đa 1 bản ghi toàn gym.
  2. *Quyền chi nhánh:* `CREATE UNIQUE INDEX gym_staff_gym_branch_user_idx ON public.gym_staff (gym_id, branch_id, user_id) WHERE branch_id IS NOT NULL;` -> Đảm bảo 1 user không bị gán trùng tại cùng 1 branch.
- **Phân công nhiều chi nhánh & Nguyên tắc loại trừ lẫn nhau (Mutual Exclusivity):**
  - Một Manager hoặc Trainer phụ trách Branch 1 và Branch 2 sẽ được tạo 2 rows tương ứng trong `gym_staff`. RLS dùng `EXISTS (...)` tự động cấp quyền tại cả 2 chi nhánh.
  - Gateway RPC khuyến nghị loại trừ lẫn nhau: nhân sự chỉ giữ vai trò cấp Gym (`branch_id IS NULL`) hoặc vai trò cấp Chi nhánh (`branch_id IS NOT NULL`), tránh xung đột và mâu thuẫn thẩm quyền. Nếu có cả hai, quyền toàn gym có độ ưu tiên cao nhất và việc đình chỉ cấp gym sẽ vô hiệu hóa toàn bộ quyền chi nhánh.

### Quy tắc ownership và RLS (thiết kế mục tiêu)

- Mọi bảng mới phải bật RLS ngay khi tạo; mặc định REVOKE ALL DML từ `anon` và `authenticated`.
- Sử dụng RLS Helper Functions: `public.is_gym_owner(gym_id)` và `public.is_active_staff(gym_id, branch_id)`.
- Owner có toàn quyền SELECT mọi chi nhánh và dữ liệu thuộc gym mình khi `gyms.status = 'active'`.
- Staff chỉ thấy gym và branch được gán; **bắt buộc kiểm tra đồng thời `gyms.status = 'active'` VÀ `gym_staff.status = 'active'`**. Nếu gym bị tạm khóa (`suspended`), toàn bộ nhân viên bị khóa truy cập ngay lập tức.
- **Cơ chế khi Gym bị `suspended` (Tạm khóa/Nợ cước):**
  - Owner chỉ được phép đọc thông tin gym (`gyms` record) để xem lý do đình chỉ/hóa đơn và gọi RPC gia hạn dịch vụ (`fn_gm_reactivate_gym`).
  - Quyền nghiệp vụ thông thường của Owner trên toàn bộ các bảng con (hội viên, điểm danh, chi nhánh, phân công) bị khóa triệt để (`is_gym_owner` trả về `FALSE`).
- Không cấp DML trực tiếp cho client; mọi thao tác ghi đi qua Mutation Gateway (Edge Functions + RPC `SECURITY DEFINER`).

---

## Luồng nghiệp vụ

### Tạo gym mới

```text
1. Owner đăng ký / đã có tài khoản Supabase Auth.
2. Điền thông tin gym (tên, địa chỉ, slug).
3. Hệ thống tạo bản ghi `gyms` qua mutation gateway.
4. Tự động tạo bản ghi `gym_staff` với role = 'owner'.
5. Owner được redirect vào dashboard gym.
```

### Tạo chi nhánh

```text
1. Owner hoặc Manager điền thông tin chi nhánh.
2. Hệ thống tạo bản ghi `branches` qua gateway.
3. Branch gắn với `gym_id` của gym hiện tại.
```

### Mời nhân viên

```text
1. Owner/Manager nhập email nhân viên và chọn vai trò + chi nhánh.
2. Hệ thống tạo bản ghi `gym_staff` với `status = 'invited'`.
3. Gửi email mời qua Supabase Auth invite hoặc custom email.
4. Nhân viên nhận link, đăng ký/đăng nhập và xác nhận.
5. Status chuyển thành `active`.
```

---

## Vai trò và quyền hạn (sơ bộ)

Chi tiết đầy đủ xem `multi-tenancy.md`.

| Vai trò | Quản lý gym | Quản lý branch | Mời staff | Xem staff |
|---|---|---|---|---|
| Owner | ✅ | ✅ | ✅ | ✅ |
| Manager | ❌ | ✅ (branch của mình) | ✅ (giới hạn) | ✅ (branch của mình) |
| Receptionist | ❌ | ❌ | ❌ | ❌ |
| Trainer | ❌ | ❌ | ❌ | ❌ |

---

## Lịch sử phát triển

- 2026-10-23: Tạo tài liệu module gym-management phục vụ planning migration sang multi-tenant. Toàn bộ nội dung là thiết kế; chưa có code, SQL hay migration.

## Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-23 | Khởi tạo tài liệu module gym-management. | Planning migration dự án sang multi-tenant gym management. | Tài liệu thiết kế mức đặc tả; chưa có triển khai. |
| 2026-10-23 | Bổ sung chi tiết schema DDL GM-1, hai partial unique indexes cho multi-branch và RLS helper functions. | Chuẩn bị phê duyệt P0.T07 và chốt thiết kế GM-1 cho P0.T08 theo chỉ đạo chủ dự án. | Hoàn thiện đặc tả GM-1; không tạo migration file hay chạy SQL. |
| 2026-10-23 | Final GM-1 Schema Security Review: Bổ sung Composite Foreign Key `(branch_id, gym_id)` chống cross-tenant branch assignment; phân tích coexistence/mutual exclusivity; kiểm tra đồng thời trạng thái gym active và staff active. | Đảm bảo tính toàn vẹn dữ liệu và an toàn phân quyền cho P0.T08. | Tài liệu thiết kế hoàn thiện; sẵn sàng cho Gate P0.T08. |
| 2026-10-23 | Final Security Corrections Before Approval: Đổi composite FK `gym_staff → branches` sang `ON DELETE RESTRICT` để bảo vệ audit trail và đề xuất soft-deactivation (`is_active = FALSE`); làm rõ quyền hạn Owner khi `gyms.status = 'suspended'` (chỉ đọc trạng thái và gọi RPC gia hạn, khóa toàn bộ nghiệp vụ con). | Đồng bộ chặt chẽ với supabase-schema.md trước phê duyệt P0.T08. | Hoàn thiện tài liệu GM-1 và sẵn sàng phê duyệt. |
| 2026-10-23 | Final Pre-Approval Verification: Chuẩn hóa schema `branches.status TEXT CHECK (status IN ('active', 'suspended', 'archived'))` thay cho `is_active BOOLEAN`; sửa `branches.gym_id` sang `ON DELETE RESTRICT` khắc phục mâu thuẫn CASCADE; làm rõ soft-deactivation là chuyển `status = 'archived'`. | Đồng bộ 100% với supabase-schema.md trước phê duyệt P0.T08. | Tài liệu GM-1 hoàn thiện và nhất quán. |
