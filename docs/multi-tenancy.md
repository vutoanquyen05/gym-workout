# Multi-Tenancy Module

## Mục đích

Định nghĩa mô hình multi-tenant cho hệ thống quản lý phòng gym: mỗi gym là một tenant độc lập, có nhiều chi nhánh, nhiều nhân viên và nhiều hội viên. Tài liệu này là nguồn sự thật cho thiết kế isolation, RBAC và RLS.

## Phạm vi

- Mô hình tenant và isolation giữa các gym.
- Role-Based Access Control (RBAC): Owner, Manager, Receptionist, Trainer, Member.
- Permission matrix đầy đủ theo vai trò và nghiệp vụ.
- Thiết kế RLS multi-tenant.
- Người dùng thuộc nhiều tenant.

## Trạng thái

**Chưa triển khai.** Đây là tài liệu thiết kế phục vụ Phase 0 — Requirements & Architecture. Không có code, SQL hay migration nào được tạo trong phạm vi tài liệu này.

---

## 1. Mô hình tenant

### 1.1. Cấu trúc

```text
Gym (tenant)
├── Branch A
│   ├── Staff (Manager, Receptionist, Trainer)
│   └── Members
├── Branch B
│   ├── Staff
│   └── Members
└── Owner (cấp gym, không gắn branch)
```

- Mỗi **Gym** là một tenant; dữ liệu không được rò rỉ giữa các gym.
- Mỗi **Branch** là đơn vị vận hành; nhân viên và hội viên có thể gắn với một hoặc nhiều branch.
- **Owner** quản lý toàn bộ gym; không nhất thiết gắn branch cụ thể.

### 1.2. Người dùng thuộc nhiều tenant

Một tài khoản `auth.users` có thể là:
- Member tại gym A và gym B (hồ sơ hội viên khác nhau).
- Trainer tại gym A và Manager tại gym B.
- Owner của gym C.

Bảng `gym_staff` và `gym_members` đều có `gym_id` để phân biệt tenant. Không có global role trên toàn hệ thống.

### 1.3. Phân biệt các loại user

| Loại | Mô tả | Bảng chính |
|---|---|---|
| `auth.users` | Tài khoản xác thực Supabase | Supabase Auth schema |
| Application user | Hồ sơ application (`public.users`) | `public.users` (id = auth.uid) |
| Staff | Nhân viên gym với vai trò trong gym | `gym_staff` |
| Member | Hội viên tại một gym cụ thể | `gym_members` |

> **Không dùng `user_metadata`** để xác định vai trò. Client có thể sửa metadata; vai trò và quyền phải đến từ bảng `gym_staff`/`gym_members` server-side.

---

## 2. Role-Based Access Control (RBAC)

### 2.1. Các vai trò

| Vai trò | Mức | Mô tả |
|---|---|---|
| `owner` | Gym | Sở hữu gym; toàn quyền quản trị |
| `manager` | Branch | Quản lý vận hành một hoặc nhiều branch |
| `receptionist` | Branch | Check-in, quản lý hội viên cơ bản |
| `trainer` | Branch | Lịch PT, phân công, xem dữ liệu hội viên được giao |
| `member` | Gym/Branch | Hội viên; sử dụng app mobile |

### 2.2. Permission Matrix

Ký hiệu: ✅ Được phép, ❌ Không được phép, 🔐 Chỉ dữ liệu của mình/được giao, 🔶 Giới hạn theo branch.

#### Gym & Branch

| Nghiệp vụ | Owner | Manager | Receptionist | Trainer | Member |
|---|---|---|---|---|---|
| Xem thông tin gym | ✅ | 🔶 | 🔶 | 🔶 | 🔶 |
| Sửa thông tin gym | ✅ | ❌ | ❌ | ❌ | ❌ |
| Tạo/sửa/xóa branch | ✅ | ❌ | ❌ | ❌ | ❌ |
| Xem branch | ✅ | 🔶 | 🔶 | 🔶 | 🔶 |

#### Staff Management

| Nghiệp vụ | Owner | Manager | Receptionist | Trainer | Member |
|---|---|---|---|---|---|
| Mời nhân viên | ✅ | 🔶 (rec/trainer) | ❌ | ❌ | ❌ |
| Xem nhân viên | ✅ | 🔶 | ❌ | ❌ | ❌ |
| Sửa vai trò nhân viên | ✅ | 🔶 (cấp dưới) | ❌ | ❌ | ❌ |
| Đình chỉ/xóa nhân viên | ✅ | 🔶 (cấp dưới) | ❌ | ❌ | ❌ |

#### Member Management

| Nghiệp vụ | Owner | Manager | Receptionist | Trainer | Member |
|---|---|---|---|---|---|
| Tạo hồ sơ hội viên | ✅ | ✅ | ✅ | ❌ | ❌ |
| Xem danh sách hội viên | ✅ | 🔶 | 🔶 | 🔶 (được giao) | ❌ |
| Sửa hồ sơ hội viên | ✅ | ✅ | 🔶 | ❌ | 🔐 (của mình) |
| Xem lịch sử hội viên | ✅ | 🔶 | 🔶 | 🔶 (được giao) | 🔐 |
| Đình chỉ/xóa hội viên | ✅ | ✅ | ❌ | ❌ | ❌ |

#### Membership

| Nghiệp vụ | Owner | Manager | Receptionist | Trainer | Member |
|---|---|---|---|---|---|
| Tạo gói tập | ✅ | ✅ | ❌ | ❌ | ❌ |
| Đăng ký gói cho hội viên | ✅ | ✅ | ✅ | ❌ | ❌ |
| Gia hạn gói | ✅ | ✅ | ✅ | ❌ | ❌ |
| Tạm dừng/hủy gói | ✅ | ✅ | ❌ | ❌ | ❌ |
| Xem gói của mình | ✅ | ✅ | ✅ | ✅ | ✅ |

#### Attendance (Check-in)

| Nghiệp vụ | Owner | Manager | Receptionist | Trainer | Member |
|---|---|---|---|---|---|
| Check-in thủ công hội viên | ✅ | ✅ | ✅ | ❌ | ❌ |
| Xem lịch check-in | ✅ | 🔶 | 🔶 | ❌ | 🔐 |
| Check-in bằng QR (Phase sau) | — | — | ✅ | — | 🔐 |

#### Payments

| Nghiệp vụ | Owner | Manager | Receptionist | Trainer | Member |
|---|---|---|---|---|---|
| Ghi nhận thanh toán | ✅ | ✅ | ✅ | ❌ | ❌ |
| Xem báo cáo doanh thu | ✅ | 🔶 | ❌ | ❌ | ❌ |
| Hoàn tiền | ✅ | ✅ | ❌ | ❌ | ❌ |
| Xem lịch sử giao dịch của mình | ✅ | ✅ | ✅ | ✅ | 🔐 |

#### Workout & PT

| Nghiệp vụ | Owner | Manager | Receptionist | Trainer | Member |
|---|---|---|---|---|---|
| Xem dữ liệu workout cá nhân | ✅ | ❌ | ❌ | 🔶 (được giao) | 🔐 |
| Tạo lịch PT | ✅ | ✅ | ❌ | ✅ (của mình) | ❌ |
| Đặt lịch PT | ✅ | ✅ | ✅ | ❌ | 🔐 |
| Phân công PT | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 3. Thiết kế RLS Multi-Tenant (mức tài liệu)

### 3.1. Nguyên tắc

- **Fail closed:** Mọi bảng mới phải bật RLS trước khi có policy; mặc định từ chối tất cả.
- **Kiểm tra tenant & trạng thái active:** Policy phải join `gym_staff` hoặc `gym_members` để xác nhận caller thuộc tenant đúng; **bắt buộc kiểm tra `gym_staff.status = 'active'`**. Nhân viên bị đình chỉ (`suspended`) hoặc mới được mời (`invited`) tuyệt đối không được cấp quyền truy cập.
- **Không dùng `user_metadata`:** Metadata client-modifiable không được dùng để phân quyền.
- **Branch scope:** Với nhân viên gắn branch, policy phải lọc thêm theo `branch_id`.
- **Xử lý an toàn với `gym_members.user_id IS NULL`:** Đối với hội viên vãng lai (walk-in members) chưa có tài khoản app, `user_id` có giá trị `NULL`. Policy cho member bắt buộc phải kiểm tra `gym_members.user_id IS NOT NULL AND gym_members.user_id = auth.uid()`. Tuyệt đối không dùng so sánh đơn độc `auth.uid() = gym_members.user_id` hay mệnh đề phủ định không guard `IS NOT NULL`, tránh lỗ hổng cấp quyền do logic ba giá trị (three-valued logic) trong SQL. Walk-in member không có session client; mọi thao tác đều do Staff thực hiện qua gateway.
- **Phân quyền nhân viên tại nhiều chi nhánh & Giải pháp Uniqueness khi branch_id IS NULL (D-MT-11 — APPROVED WITH CONDITIONS):**
  - *Vấn đề kỹ thuật:* Trong PostgreSQL, chuẩn SQL quy định `NULL != NULL`. Nếu chỉ dùng ràng buộc `UNIQUE(gym_id, branch_id, user_id)` thông thường, cơ sở dữ liệu sẽ cho phép tạo vô số bản ghi có `branch_id IS NULL` cho cùng một user.
  - *Giải pháp Partial Unique Index:*
    1. Quyền toàn gym (`branch_id IS NULL`): `CREATE UNIQUE INDEX gym_staff_gym_user_null_branch_idx ON public.gym_staff (gym_id, user_id) WHERE branch_id IS NULL;` -> Đảm bảo mỗi nhân viên chỉ có tối đa 1 bản ghi quyền toàn gym.
    2. Quyền chi nhánh cụ thể (`branch_id IS NOT NULL`): `CREATE UNIQUE INDEX gym_staff_gym_branch_user_idx ON public.gym_staff (gym_id, branch_id, user_id) WHERE branch_id IS NOT NULL;` -> Đảm bảo nhân viên không bị gán trùng 2 vai trò tại cùng 1 chi nhánh.
  - *Cơ chế Multi-Branch:* Nhân viên phụ trách nhiều chi nhánh (ví dụ Manager chi nhánh 1 và Trainer chi nhánh 2) sẽ có 2 bản ghi riêng biệt trong `gym_staff`. Mệnh đề `EXISTS (SELECT 1 FROM gym_staff WHERE ... AND (branch_id IS NULL OR branch_id = table.branch_id))` tự động cấp quyền truy cập hợp lệ tại cả hai chi nhánh và từ chối tại chi nhánh thứ ba.
  - *Chính sách Mutual Exclusivity Đã phê duyệt (OD-02=A — Chủ dự án phê duyệt có điều kiện):*
    - **Chỉ áp dụng trên phân công ĐANG HIỆU LỰC (`status = 'active'`):** Một nhân sự tại một gym không thể đồng thời giữ quyền Toàn Gym active và quyền Chi nhánh active. Tuy nhiên, được phép giữ nhiều phân công Chi nhánh active nếu không có quyền Toàn Gym active.
    - **Bảo toàn lịch sử phân công (Zero Hard Delete):** Tuyệt đối **KHÔNG DÙNG LỆNH `DELETE`** trên bảng `gym_staff`. Mọi thao tác hủy quyền hoặc nâng cấp vai trò đều áp dụng cơ chế Soft-Revocation: cập nhật `status = 'revoked'`, `revoked_at = pg_catalog.now()`, `revoked_by = auth.uid()`.
    - **Khóa giao dịch Cooperative Advisory Lock:** Mọi mutation phân quyền nhân sự bắt buộc chiếm khóa `pg_advisory_xact_lock(hashtext('gym_staff_lock:' || gym_id || ':' || user_id))` để tuần tự hóa các transaction đồng thời.
    - **Đề xuất Chuyển giao thẩm định tại Gate P0.T08 (Chưa phê duyệt DDL):** Để hỗ trợ tái phân công nhân viên cũ mà không vướng unique index của bản ghi lịch sử, đề xuất bổ sung điều kiện `WHERE status = 'active'` vào cả 2 partial unique indexes và bổ sung cột `revoked_at/revoked_by` vào bảng `gym_staff`. Đề xuất này nằm trong phạm vi thẩm định của `P0.T08`, không tự ý phê duyệt hay triển khai trước.
- **Tính toàn vẹn quan hệ, Ngăn chặn Cross-Tenant Branch Assignment & Bảo vệ Audit Trail:**
  - Bảng `branches` có ràng buộc duy nhất `UNIQUE (id, gym_id)`.
  - Bảng `gym_staff` sử dụng Composite Foreign Key với quy tắc bảo vệ audit trail: `CONSTRAINT fk_gym_staff_branch_gym FOREIGN KEY (branch_id, gym_id) REFERENCES public.branches(id, gym_id) ON DELETE RESTRICT`.
  - *Cơ chế ngăn chặn Cross-Tenant:* Bảo đảm ở mức engine database: một nhân viên thuộc Gym A **tuyệt đối không thể bị gán vào chi nhánh thuộc Gym B** khi `branch_id IS NOT NULL`. Khi `branch_id IS NULL`, SQL `MATCH SIMPLE` cho phép dòng tồn tại và kiểm tra tính hợp lệ của `gym_id` qua foreign key độc lập tới `gyms(id)`.
  - *Tại sao chọn ON DELETE RESTRICT thay vì CASCADE:* Nếu dùng `CASCADE`, việc xóa một chi nhánh sẽ tự động xóa sạch dữ liệu nhân sự và lịch sử phân công, hủy hoại hoàn toàn audit trail phục vụ truy vết trách nhiệm và đối soát tài chính. Với `RESTRICT`, database từ chối lệnh xóa vật lý chi nhánh nếu đang tồn tại bất kỳ bản ghi nhân viên nào.
  - *Chiến lược Soft-Deactivation cho Chi nhánh:* Khi chi nhánh ngừng hoạt động hoặc đóng cửa, hệ thống áp dụng cơ chế xóa mềm: chuyển `branches.status = 'archived'` (hoặc `branches.status = 'suspended'` nếu tạm dừng sửa chữa/bảo trì) thay vì xóa vật lý. Mô hình `status TEXT CHECK (status IN ('active', 'suspended', 'archived'))` đạt tính nhất quán 100% với `gyms.status`, vừa bảo toàn nguyên vẹn 100% dữ liệu lịch sử và quan hệ phân công nhân sự, vừa ngăn chặn các tác vụ vận hành mới tại chi nhánh đó.
- **Quyền hạn đặc quyền của Owner & Kiểm soát Trạng thái Phòng Gym (`suspended`):**
  - Owner được nhận diện qua `gyms.owner_id = auth.uid()` hoặc bản ghi `gym_staff` role `owner` (`branch_id IS NULL`, `status = 'active'`).
  - Khi gym ở trạng thái `active`: Owner có toàn quyền SELECT và quản trị trên tất cả dữ liệu thuộc gym mà không bị giới hạn bởi `branch_id`.
  - **Kiểm soát trạng thái Gym khi `suspended` (Tạm khóa / Nợ cước SaaS):**
    - *Đối với nhân sự (Staff/Manager/PT):* Bị khóa truy cập hoàn toàn khỏi hệ thống (`is_active_staff` trả về `FALSE` do bắt buộc kiểm tra `gyms.status = 'active'`).
    - *Quyền hạn hạn chế của Owner (Chỉ phục vụ khôi phục dịch vụ):*
      - Endpoint / Policy đọc trạng thái: Cho phép Owner đọc bản ghi `gyms` (`owner_id = auth.uid()`) để xem lý do tạm khóa, hóa đơn nợ cước SaaS và hướng dẫn gia hạn.
      - Endpoint / RPC gia hạn: Cho phép Owner gọi RPC phục hồi `fn_gm_reactivate_gym(gym_id, payment_info)` để thực hiện thanh toán gia hạn gói SaaS.
    - *Khóa triệt để quyền nghiệp vụ thông thường của Owner khi suspended:* Hàm `is_gym_owner` bắt buộc kiểm tra `gyms.status = 'active'`, do đó sẽ trả về `FALSE` khi gym bị suspended. Toàn bộ các bảng con (`branches`, `gym_staff`, `gym_members`, `attendance_logs`, `payments`) và mọi RPC nghiệp vụ thông thường (tạo hội viên, điểm danh, đổi cấu hình chi nhánh, phân công PT) đều bị từ chối triệt để (fail-closed). Owner không thể thực hiện bất kỳ hoạt động kinh doanh nào cho đến khi hoàn tất thanh toán gia hạn và gym chuyển lại trạng thái `active`.
- **Không cấp DML trực tiếp:** Mọi ghi/sửa đi qua mutation gateway (Edge Functions + PostgreSQL RPC).

### 3.2. Ví dụ pattern RLS (thiết kế mục tiêu, chưa phải SQL cụ thể)

```sql
-- Ví dụ mô tả logic (không phải SQL ready-to-run):

-- 1. Helper Function: Kiểm tra Owner hoặc Staff Active (Bắt buộc kiểm tra gyms.status = 'active')
-- is_gym_owner(gym_id)
-- is_active_staff(gym_id, branch_id)

-- 2. Policy SELECT cho bảng có phạm vi chi nhánh (branches, attendance_logs, payments):
-- Cho phép nếu:
--   (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
--   AND (
--     public.is_gym_owner(table.gym_id)
--     OR public.is_active_staff(table.gym_id, table.branch_id)
--   )

-- 3. Policy SELECT cho bảng hội viên (gym_members):
-- Cho phép nếu:
--   (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
--   AND (
--     -- Member tự đọc hồ sơ (bắt buộc user_id NOT NULL):
--     (gym_members.user_id IS NOT NULL AND gym_members.user_id = auth.uid())
--     -- Hoặc Owner phòng gym:
--     OR public.is_gym_owner(gym_members.gym_id)
--     -- Hoặc Staff active tại home_branch của member:
--     OR public.is_active_staff(gym_members.gym_id, gym_members.home_branch_id)
--   )
```

### 3.3. Các bảng multi-tenant cần thêm (chưa tạo migration)

| Bảng | Tenant key | Branch scope | Ràng buộc toàn vẹn đặc thù |
|---|---|---|---|
| `gyms` | `id` (self) | N/A | `owner_id REFERENCES auth.users`, `status CHECK` |
| `branches` | `gym_id` | N/A | `UNIQUE(gym_id, slug)`, `UNIQUE(id, gym_id)`, `status CHECK` |
| `gym_staff` | `gym_id` | `branch_id` nullable | `FK(branch_id, gym_id) REFERENCES branches(id, gym_id)`, 2 Partial Indexes |
| `gym_members` | `gym_id` | `home_branch_id` nullable | `FK(home_branch_id, gym_id) REFERENCES branches(id, gym_id)` |
| `membership_plans` | `gym_id` | có thể per-branch | `gym_id NOT NULL` |
| `memberships` | `gym_id` | `branch_id` | `FK(branch_id, gym_id) REFERENCES branches(id, gym_id)` |
| `attendance_logs` | `gym_id` | `branch_id` | `FK(branch_id, gym_id) REFERENCES branches(id, gym_id)` |
| `payments` | `gym_id` | `branch_id` | `FK(branch_id, gym_id) REFERENCES branches(id, gym_id)` |
| `pt_sessions` | `gym_id` | `branch_id` | `FK(branch_id, gym_id) REFERENCES branches(id, gym_id)` |

---

### 3.4. Ma trận Quyền Truy cập theo Trạng thái Gym và Nhân viên

| Trạng thái Gym (`gyms.status`) | Trạng thái Nhân viên (`gym_staff.status`) | Vai trò | Quyền truy cập hệ thống |
|---|---|---|---|
| **`active`** | `active` | Owner | Toàn quyền cấu hình gym, quản lý chi nhánh, nhân sự, hội viên, doanh thu |
| **`active`** | `active` | Manager (toàn gym) | Toàn quyền vận hành tất cả chi nhánh |
| **`active`** | `active` | Manager (chi nhánh) | Quản lý hội viên, gói tập, check-in, báo cáo chi nhánh được gán |
| **`active`** | `active` | Receptionist / Trainer | Quyền giới hạn theo chi nhánh phân công (check-in, PT sessions) |
| **`active`** | `suspended` | Bất kỳ vai trò | **BỊ TỪ CHỐI HOÀN TOÀN** (`is_active_staff = false`) |
| **`active`** | `invited` | Bất kỳ vai trò | **BỊ TỪ CHỐI** (chờ xác nhận và kích hoạt) |
| **`suspended`** | Bất kỳ | Owner | **Chỉ đọc trang Hồ sơ Gym và Trang Thanh toán Gia hạn**; không thao tác nghiệp vụ |
| **`suspended`** | Bất kỳ | Staff (toàn bộ) | **BỊ KHÓA TRUY CẬP HOÀN TOÀN** (`is_active_staff = false` do `gyms.status != 'active'`) |
| **`archived`** | Bất kỳ | Toàn bộ người dùng | **BỊ KHÓA HOÀN TOÀN** |

---

## 4. Tác động đến schema hiện tại

### 4.1. Giữ nguyên 7 bảng core

Bảy bảng `users`, `exercises`, `workout_plans`, `plan_exercises`, `workout_sessions`, `session_exercises`, `workout_sets` **không bị thay đổi** trong Phase 0. Ownership theo `user_id` (cá nhân) được giữ nguyên; không tự đổi sang `gym_id`.

### 4.2. Liên kết workout data với gym

Trong tương lai (Phase 6), workout data của member có thể được trainer xem nếu được phân công. Cơ chế đề xuất: bảng `pt_member_assignments` liên kết `trainer_staff_id`, `member_id`, `gym_id`. RLS trên workout tables sẽ mở rộng để allow trainer đọc data của member được giao — nhưng đây là thiết kế tương lai, cần phê duyệt riêng.

### 4.3. Workout ownership không thay đổi

Workout data vẫn thuộc `user_id` cá nhân. Không thêm `gym_id` vào bảng workout. Truy cập của trainer đi qua policy join, không qua ownership transfer.

---

## 5. Quy trình tạo gym và onboarding nhân viên

### 5.1. Tạo gym (Owner flow)

1. Owner đăng ký tài khoản hoặc đã có tài khoản.
2. Truy cập Admin Web, chọn "Tạo phòng gym mới".
3. Điền thông tin gym (tên, địa chỉ, liên hệ).
4. Hệ thống tạo `gyms` record + `gym_staff` record (role=owner) qua gateway.
5. Owner được dẫn vào dashboard gym.
6. Owner tạo ít nhất một branch để bắt đầu hoạt động.

### 5.2. Mời nhân viên (Staff invite flow)

1. Owner/Manager vào mục Nhân viên → Mời thành viên.
2. Nhập email + chọn vai trò + chọn branch (nếu áp dụng).
3. Hệ thống tạo `gym_staff` record với `status = 'invited'`.
4. Gửi email mời (Supabase Auth invite hoặc custom transactional email).
5. Nhân viên nhận email, nhấn link, đăng ký hoặc đăng nhập.
6. Hệ thống cập nhật `gym_staff.status = 'active'`.

---

## Lịch sử phát triển

- 2026-10-23: Tạo tài liệu module multi-tenancy phục vụ planning migration. Toàn bộ là thiết kế mục tiêu; chưa có code, SQL hay migration.

## Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-23 | Khởi tạo tài liệu multi-tenancy với mô hình tenant, RBAC và permission matrix. | Planning migration dự án sang multi-tenant gym management. | Tài liệu thiết kế mức đặc tả; chưa có triển khai. |
| 2026-10-23 | Bổ sung giải pháp Partial Unique Indexes cho Multi-Branch và branch_id IS NULL; đặc tả RLS helper functions. | Chuẩn bị phê duyệt P0.T07 và P0.T08 theo chỉ đạo chủ dự án. | Hoàn thiện giải pháp phân quyền multi-branch và fail-closed RLS. |
| 2026-10-23 | Final GM-1 Schema Security Review: Bổ sung Composite Foreign Key `(branch_id, gym_id)` chống cross-tenant branch assignment; phân tích coexistence và mutual exclusivity; ma trận trạng thái vòng đời gym và nhân viên; ràng buộc kiểm tra trạng thái gym trong helper function. | Đảm bảo an toàn phân quyền và tính toàn vẹn dữ liệu cho P0.T08. | Hoàn thiện đặc tả an toàn multi-tenant; sẵn sàng cho Gate P0.T08. |
| 2026-10-23 | Final Security Corrections Before Approval: Đổi composite FK `gym_staff → branches` sang `ON DELETE RESTRICT` để bảo vệ audit trail và đề xuất soft-deactivation (`is_active = FALSE`); làm rõ quyền hạn Owner khi `gyms.status = 'suspended'` (chỉ đọc trạng thái và gọi RPC gia hạn, khóa toàn bộ nghiệp vụ con). | Đồng bộ triệt để với supabase-schema.md trước phê duyệt P0.T08. | Tài liệu multi-tenant hoàn thiện và nhất quán. |
| 2026-10-23 | Final Pre-Approval Verification: Thống nhất mô hình trạng thái chi nhánh sang `branches.status TEXT CHECK (status IN ('active', 'suspended', 'archived'))`; đồng bộ định nghĩa soft-deactivation là chuyển `status = 'archived'`. | Đồng bộ 100% với supabase-schema.md và gym-management.md trước phê duyệt P0.T08. | Tài liệu multi-tenancy nhất quán hoàn toàn. |
