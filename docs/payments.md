# Payments Module

## Mục đích

Ghi nhận giao dịch thanh toán liên kết với gói tập và các dịch vụ gym. Quản lý công nợ, hoàn tiền và báo cáo doanh thu. Đảm bảo audit trail đầy đủ và idempotency.

## Phạm vi

- Ghi nhận giao dịch thanh toán (tiền mặt, chuyển khoản, POS).
- Liên kết giao dịch với membership hoặc dịch vụ cụ thể.
- Quản lý công nợ (amount_due - amount_paid).
- Hoàn tiền (full/partial refund) với audit trail.
- Báo cáo doanh thu theo branch/gym/thời gian.
- Idempotency: tránh ghi đôi giao dịch.

## Trạng thái

**Chưa triển khai.** Module này thuộc Phase 5 — Payments & Reporting của roadmap mới. Toàn bộ là thiết kế mục tiêu.

---

## Thiết kế dữ liệu (mức tài liệu, chưa có SQL/migration)

### Bảng `payment_transactions`

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `UUID` | PK; idempotency key (client tạo trước) |
| `gym_id` | `UUID` | FK gyms |
| `branch_id` | `UUID` | FK branches — nơi thu tiền |
| `member_id` | `UUID` | FK gym_members |
| `membership_id` | `UUID` (nullable) | FK memberships — gói liên quan (nếu có) |
| `transaction_type` | `text` | `payment` / `refund` / `adjustment` |
| `amount` | `bigint` | Số tiền (đơn vị cần chốt: VND xu hay đồng) |
| `currency` | `text` | `VND` |
| `payment_method` | `text` | `cash` / `bank_transfer` / `pos` / `other` |
| `reference_code` | `text` (nullable) | Số tham chiếu chuyển khoản/POS |
| `description` | `text` (nullable) | Mô tả giao dịch |
| `status` | `text` | `pending` / `completed` / `failed` / `refunded` |
| `parent_transaction_id` | `UUID` (nullable) | FK `payment_transactions.id` — cho refund |
| `recorded_by` | `UUID` | Staff ghi nhận |
| `recorded_at` | `timestamptz` | Thời điểm ghi nhận |
| `notes` | `text` (nullable) | Ghi chú nội bộ |
| `created_at` | `timestamptz` | Server time |
| `updated_at` | `timestamptz` | Server time |
| `version` | `BIGINT` | Optimistic concurrency |

### Bảng `member_balances` (tùy chọn — tổng hợp công nợ)

Có thể tính on-the-fly từ `payment_transactions` thay vì giữ bảng riêng. Quyết định còn mở.

---

## Idempotency

- Client tạo `id` (UUID) trước khi gửi mutation.
- Nếu mutation thất bại và retry → gửi lại cùng `id`.
- Gateway kiểm tra `id` đã tồn tại → trả lại kết quả cũ mà không tạo mới.
- Không cho phép tạo hai giao dịch cùng `id` với `amount` khác nhau.

---

## Luồng ghi nhận thanh toán

```text
1. Staff chọn hội viên → Gói tập → Ghi nhận thanh toán.
2. Điền: số tiền, phương thức, số tham chiếu (nếu có).
3. Client tạo UUID trước, gửi mutation qua gateway.
4. Gateway kiểm tra idempotency, tạo bản ghi với status = 'completed'.
5. Nếu thanh toán liên kết gói tập: kích hoạt/gia hạn membership.
```

## Luồng hoàn tiền

```text
1. Manager/Owner chọn giao dịch gốc → Hoàn tiền.
2. Nhập số tiền hoàn (full hoặc partial).
3. Hệ thống tạo bản ghi mới với:
   - transaction_type = 'refund'
   - parent_transaction_id = giao dịch gốc
   - amount âm (hoặc dương với type riêng — cần chốt)
4. Cập nhật membership nếu cần (huỷ gói khi hoàn tiền đầy đủ).
5. Ghi audit log.
```

---

## Báo cáo doanh thu

Báo cáo được tổng hợp từ `payment_transactions` với các filter:
- Theo khoảng thời gian (ngày/tuần/tháng).
- Theo branch.
- Theo phương thức thanh toán.
- Theo loại giao dịch (payment/refund).

> **Chưa thiết kế chi tiết:** Cần xác định metric cụ thể, format báo cáo và quyền xem báo cáo. Ghi vào `risks-decisions.md` — quyết định còn mở.

---

## Audit Trail

- Mọi giao dịch đều có `recorded_by`, `recorded_at` và `version`.
- Không cho phép UPDATE hoặc DELETE giao dịch; chỉ tạo bản ghi đảo ngược (refund/adjustment).
- Lịch sử thay đổi `status` có thể cần bảng `payment_status_log` riêng (Phase sau).

---

## Quy tắc bảo mật

- Receptionist có thể ghi nhận thanh toán nhưng không xem báo cáo doanh thu.
- Manager xem báo cáo của branch mình.
- Owner xem tổng hợp toàn gym.
- Member chỉ xem giao dịch của mình.
- Không cấp DML trực tiếp; tất cả qua gateway.

---

## Lịch sử phát triển

- 2026-10-23: Tạo tài liệu payments module phục vụ planning migration. Toàn bộ là thiết kế mục tiêu.

## Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-23 | Khởi tạo tài liệu payments. | Planning migration sang multi-tenant gym management. | Tài liệu thiết kế mức đặc tả; chưa có triển khai. |
