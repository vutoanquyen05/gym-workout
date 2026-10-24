# Membership Module

## Mục đích

Quản lý gói tập (membership plans), đăng ký và vòng đời gói: kích hoạt, gia hạn, tạm dừng, hết hạn và hủy. Hỗ trợ quyền sử dụng theo chi nhánh.

## Phạm vi

- Danh mục gói tập (tạo, sửa, deactivate).
- Đăng ký gói cho hội viên.
- Gia hạn và tạm dừng gói.
- Quản lý vòng đời: active → suspended / expired / cancelled.
- Gói tập nhiều chi nhánh (multi-branch access).
- Kiểm tra điều kiện gói trước check-in (dùng bởi Attendance module).

## Trạng thái

**Chưa triển khai.** Module này thuộc Phase 4 — Membership & Attendance của roadmap mới. Toàn bộ là thiết kế mục tiêu.

---

## Thiết kế dữ liệu (mức tài liệu, chưa có SQL/migration)

### Bảng `membership_plans` (danh mục gói)

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `UUID` | PK |
| `gym_id` | `UUID` | FK gyms — gói thuộc gym |
| `name` | `text` | Tên gói (VD: "1 tháng", "3 tháng VIP") |
| `description` | `text` (nullable) | Mô tả |
| `duration_days` | `integer` | Số ngày hiệu lực |
| `price` | `bigint` | Giá (đơn vị: VND cents hoặc đồng nguyên; cần chốt) |
| `currency` | `text` | `VND` |
| `access_scope` | `text` | `home_branch` / `all_branches` / `selected_branches` |
| `sessions_limit` | `integer` (nullable) | Giới hạn buổi tập; null = không giới hạn |
| `pt_sessions_included` | `integer` (nullable) | Số buổi PT kèm theo |
| `is_active` | `boolean` | Có đang bán không |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

### Bảng `membership_plan_branches` (gói áp dụng branch nào — khi `access_scope = 'selected_branches'`)

| Cột | Kiểu | Mô tả |
|---|---|---|
| `plan_id` | `UUID` | FK membership_plans |
| `branch_id` | `UUID` | FK branches |

### Bảng `memberships` (gói đã đăng ký)

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `UUID` | PK |
| `gym_id` | `UUID` | FK gyms |
| `member_id` | `UUID` | FK gym_members |
| `plan_id` | `UUID` | FK membership_plans (snapshot plan) |
| `plan_snapshot` | `jsonb` | Snapshot tên/giá/thời hạn tại thời điểm đăng ký |
| `start_date` | `date` | Ngày bắt đầu |
| `end_date` | `date` | Ngày hết hạn (tính từ start + duration) |
| `status` | `text` | `pending` / `active` / `suspended` / `expired` / `cancelled` |
| `sessions_remaining` | `integer` (nullable) | Buổi còn lại (nếu có giới hạn) |
| `pt_sessions_remaining` | `integer` (nullable) | Buổi PT còn lại |
| `home_branch_id` | `UUID` (nullable) | Branch chính của gói |
| `registered_by` | `UUID` | Staff đăng ký |
| `suspended_at` | `timestamptz` (nullable) | Thời điểm tạm dừng |
| `suspended_reason` | `text` (nullable) | Lý do tạm dừng |
| `cancelled_at` | `timestamptz` (nullable) | |
| `cancelled_by` | `UUID` (nullable) | |
| `notes` | `text` (nullable) | |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |
| `version` | `BIGINT` | Optimistic concurrency |

---

## Vòng đời gói tập

```text
pending ──────────────────────────────────────────┐
   |                                              |
   └──► active ──► suspended ──► active (resume) |
              |                                   |
              ├──► expired (end_date reached)     |
              └──► cancelled (manual)─────────────┘
```

### Điều kiện chuyển trạng thái

| Từ | Sang | Điều kiện | Actor |
|---|---|---|---|
| `pending` | `active` | Thanh toán xác nhận hoặc staff kích hoạt | Staff/System |
| `active` | `suspended` | Staff ra lệnh tạm dừng (VD: công nợ) | Manager/Owner |
| `suspended` | `active` | Staff tiếp tục gói; gia hạn `end_date` nếu cần | Manager/Owner |
| `active` | `expired` | `end_date < today` (job tự động hoặc check khi check-in) | System |
| `active` | `cancelled` | Staff hủy thủ công | Manager/Owner |
| `suspended` | `cancelled` | Staff hủy khi đang tạm dừng | Manager/Owner |

---

## Gia hạn gói

- Gia hạn = tạo bản ghi `memberships` mới với `start_date = today` (hoặc sau ngày hết hạn hiện tại).
- Không sửa `end_date` của bản ghi cũ để giữ audit trail.
- Gói cũ chuyển `expired` khi `end_date` qua.

---

## Quyền sử dụng nhiều chi nhánh

- `access_scope = 'home_branch'`: Chỉ được check-in tại `home_branch_id` của gói.
- `access_scope = 'all_branches'`: Check-in tại mọi branch của gym.
- `access_scope = 'selected_branches'`: Check-in tại các branch trong `membership_plan_branches`.

Khi check-in, Attendance module tra `memberships` và `access_scope` để xác nhận quyền.

---

## Luồng đăng ký gói cho hội viên

```text
1. Staff chọn hội viên → Gói tập → Đăng ký gói.
2. Chọn gói từ danh mục (membership_plans) còn active.
3. Xác nhận giá, ngày bắt đầu và chi nhánh.
4. Hệ thống tạo bản ghi `memberships` với status = 'pending'.
5. Ghi nhận thanh toán (xem payments.md).
6. Sau thanh toán xác nhận, chuyển status = 'active'.
```

---

## Tích hợp với các module khác

| Module | Quan hệ |
|---|---|
| Attendance | Tra cứu `memberships` để kiểm tra điều kiện check-in |
| Payments | Thanh toán liên kết với `membership_id` |
| Member Management | `memberships.member_id` FK `gym_members.id` |
| PT Session | `pt_sessions_remaining` giảm mỗi khi hoàn thành buổi PT |

---

## Lịch sử phát triển

- 2026-10-23: Tạo tài liệu membership module phục vụ planning migration. Toàn bộ là thiết kế mục tiêu.

## Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-23 | Khởi tạo tài liệu membership. | Planning migration sang multi-tenant gym management. | Tài liệu thiết kế mức đặc tả; chưa có triển khai. |
| 2026-10-23 | Xóa dòng khai báo `gym_id` bị trùng lặp trong bảng `membership_plans`. | Sửa theo kết quả Phase 0 Documentation Audit (AUD-02). | Cấu trúc bảng chuẩn xác, không còn trùng lặp. |
