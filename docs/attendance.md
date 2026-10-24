# Attendance Module

## Mục đích

Ghi nhận lượt check-in của hội viên tại chi nhánh, kiểm tra điều kiện gói tập và ngăn check-in trùng. Hỗ trợ check-in thủ công (Phase 4) và QR check-in (Phase sau).

## Phạm vi

- Check-in thủ công bởi Receptionist/Manager.
- Kiểm tra hội viên có gói tập hợp lệ và quyền vào branch không.
- Chống check-in trùng trong cùng ngày/khoảng thời gian.
- Xem lịch sử check-in (by member, by branch, by date).
- QR check-in (Phase 5 hoặc sau — chưa thiết kế chi tiết).

## Trạng thái

**Chưa triển khai.** Module này thuộc Phase 4 của roadmap mới. Toàn bộ là thiết kế mục tiêu.

---

## Thiết kế dữ liệu (mức tài liệu, chưa có SQL/migration)

### Bảng `attendance_logs`

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | `UUID` | PK |
| `gym_id` | `UUID` | FK gyms |
| `branch_id` | `UUID` | FK branches — chi nhánh check-in |
| `member_id` | `UUID` | FK gym_members |
| `membership_id` | `UUID` (nullable) | FK memberships — gói áp dụng tại thời điểm check-in |
| `checked_in_at` | `timestamptz` | Thời điểm check-in (server time) |
| `checked_in_by` | `UUID` | FK auth.users — staff thực hiện |
| `method` | `text` | `manual` / `qr` |
| `notes` | `text` (nullable) | Ghi chú |
| `created_at` | `timestamptz` | |

### Ràng buộc và lưu ý kỹ thuật (Database Constraints)

- **Lưu ý cú pháp table constraint:** Cú pháp dự kiến ban đầu `UNIQUE (member_id, branch_id, date(checked_in_at))` không phải là cú pháp table constraint hợp lệ trong PostgreSQL (PostgreSQL table constraint chỉ chấp nhận danh sách cột thuần túy, không chấp nhận biểu thức tính toán hàm như `date()`).
- **Không tự động chọn unique index theo UTC:** Không tự ý áp đặt unique index theo UTC tại Phase 0 vì việc tính ngày phụ thuộc vào timezone thực tế của chi nhánh.
- **Append-only log:** Không có `version` hoặc `deleted_at` vì `attendance_logs` là bảng audit trail chỉ ghi (append-only), không chỉnh sửa hoặc xóa.

### Quyết định còn mở & Backlog Phase Attendance

Các vấn đề sau được đưa vào backlog của Phase Attendance (Phase 4/5) để làm rõ trước khi tạo migration:
1. **Số lượt check-in/ngày:** Xác định rõ quy tắc nghiệp vụ: cho phép hội viên check-in bao nhiêu lần trong một ngày calendar (phụ thuộc vào loại gói tập: 1 lần/ngày, không giới hạn, hay tính trừ theo từng buổi tập).
2. **Timezone của chi nhánh:** Cơ chế xác định mốc ngày dựa theo timezone địa phương của từng chi nhánh (`branches.timezone` nếu có) thay vì cố định theo UTC để tránh tình trạng lệch ngày lịch.
3. **Chống duplicate request:** Xử lý chống submit lặp (do nhân viên bấm đúp hoặc mạng chập chờn) bằng idempotency key hoặc time window (ví dụ: cấm check-in trùng trong vòng 15–30 phút) tại tầng Mutation Gateway/RPC thay vì chỉ phụ thuộc vào unique database constraint.

---

## Luồng check-in thủ công

```text
1. Receptionist tìm hội viên (tên, SĐT, mã HV, hoặc QR Phase sau).
2. Hệ thống kiểm tra điều kiện:
   a. Hội viên có gói active không?
   b. Gói có quyền vào branch hiện tại không? (access_scope)
   c. Hôm nay đã check-in chưa? (chống trùng)
3. Nếu pass → tạo bản ghi attendance_logs.
4. Nếu fail → hiển thị lý do cụ thể (hết hạn, không đúng branch, đã check-in).
5. Nếu gói giới hạn buổi → giảm sessions_remaining trong memberships.
```

## Kiểm tra điều kiện gói (pre-check-in validation)

| Điều kiện | Kết quả nếu fail |
|---|---|
| Không có gói active | Từ chối; hiển thị "Chưa có gói tập" |
| Gói expired | Từ chối; hiển thị "Gói đã hết hạn ngày [date]" |
| Gói suspended | Từ chối; hiển thị "Gói đang tạm dừng" |
| Gói không có quyền vào branch này | Từ chối; hiển thị "Gói không áp dụng cho chi nhánh này" |
| Đã check-in hôm nay | Từ chối; hiển thị "Đã check-in lúc [time]" |
| sessions_remaining = 0 | Từ chối; hiển thị "Đã hết buổi tập" |

---

## QR Check-in (Phase sau — chưa thiết kế chi tiết)

Dự kiến:
- Mỗi hội viên có một QR code duy nhất (encode member_id hoặc token).
- Receptionist scan QR bằng camera tablet/điện thoại tại quầy.
- Hệ thống tự tra cứu hội viên và chạy validation như check-in thủ công.
- QR token cần có expiry hoặc HMAC để chống giả mạo.

> **Quyết định còn mở:** Dùng Expo Camera trên mobile hay web camera? Token có expiry không? Cần phê duyệt thiết kế trước triển khai.

---

## Tích hợp với các module khác

| Module | Quan hệ |
|---|---|
| Membership | Tra cứu `memberships` để validate; giảm `sessions_remaining` |
| Member Management | `attendance_logs.member_id` FK `gym_members` |
| Payments | Một số gym charge theo buổi → attendance trigger payment event |

---

## Quy tắc bảo mật

- Receptionist chỉ check-in tại branch của mình.
- Member chỉ xem lịch check-in của mình.
- Staff không thể sửa hoặc xóa bản ghi đã ghi nhận (append-only).

---

## Lịch sử phát triển

- 2026-10-23: Tạo tài liệu attendance module phục vụ planning migration. Toàn bộ là thiết kế mục tiêu.

## Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-23 | Khởi tạo tài liệu attendance. | Planning migration sang multi-tenant gym management. | Tài liệu thiết kế mức đặc tả; chưa có triển khai. |
| 2026-10-23 | Làm rõ cú pháp `UNIQUE` chứa `date(expression)` không phải table constraint hợp lệ; không tự ý chọn unique index UTC; đưa các quyết định về số lượt check-in/ngày, timezone chi nhánh và chống duplicate request vào backlog Phase Attendance. | Sửa theo kết quả Phase 0 Documentation Audit (AUD-05). | Hoàn thiện đặc tả kỹ thuật, không tự ý giả định giải pháp database. |
