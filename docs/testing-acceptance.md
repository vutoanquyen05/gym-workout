# Kiểm thử và nghiệm thu — Single Source of Truth

Nguồn: `baocao.md`, mục 11.

## 11. Kiểm thử và tiêu chí nghiệm thu

### 11.1. Chiến lược kiểm thử

**Unit testing**
- Hàm tính tổng khối lượng tập.
- Logic kiểm tra dữ liệu hiệp.
- Bộ lọc bài tập.
- Quy tắc hoàn thành mục tiêu.
- Logic chuyển trạng thái buổi tập.

**Component testing**
- Button.
- Input.
- ExerciseCard.
- SetLogger.
- RestTimer.
- Bottom Navigation.

**Integration testing**
- Lưu buổi tập vào SQLite.
- Khôi phục phiên tập.
- Đọc lịch sử.
- Gửi và nhận dữ liệu qua API.
- Đồng bộ dữ liệu sau khi có mạng.

**End-to-end testing**
- Đăng nhập và hoàn thành onboarding.
- Chọn kế hoạch và bắt đầu tập.
- Ghi nhận các hiệp và kết thúc buổi tập.
- Kiểm tra buổi tập xuất hiện trong lịch sử.
- Kiểm tra tiến bộ được cập nhật.
- Kiểm tra dữ liệu sau khi ứng dụng được đóng và mở lại.

### 11.2. Tiêu chí nghiệm thu chức năng

| Mã | Tiêu chí | Điều kiện nghiệm thu |
|---|---|---|
| AC-01 | Xác thực | Trạng thái đăng nhập được xử lý đúng theo phản hồi backend |
| AC-02 | Thư viện bài tập | Tìm kiếm và lọc trả về kết quả đúng điều kiện |
| AC-03 | Kế hoạch | Có thể xem và chỉnh sửa cấu hình bài tập |
| AC-04 | Ghi nhận hiệp | Dữ liệu hợp lệ được lưu và hiển thị nhất quán |
| AC-05 | Đồng hồ nghỉ | Thời gian còn lại được tính chính xác theo thời điểm kết thúc dự kiến |
| AC-06 | Tự động lưu | Buổi tập có thể được khôi phục sau khi ứng dụng bị đóng ngoài dự kiến |
| AC-07 | Ngoại tuyến | Các thao tác cốt lõi được hỗ trợ không phụ thuộc kết nối liên tục |
| AC-08 | Đồng bộ | Thay đổi được gửi lại khi có mạng, không tạo bản ghi trùng ngoài dự kiến |
| AC-09 | Lịch sử | Buổi tập hoàn thành xuất hiện trong lịch sử |
| AC-10 | Thống kê | Các chỉ số được tính theo công thức đã xác định |
| AC-11 | Giao diện | Light/Dark Theme hiển thị đúng theo lựa chọn hoặc cấu hình |
| AC-12 | Accessibility | Các cặp màu và vùng chạm đáp ứng yêu cầu thiết kế đã đặt ra |

### 11.3. Kiểm thử trên thiết bị

Cần kiểm tra trên:

- Thiết bị Android có kích thước màn hình khác nhau.
- Thiết bị iOS.
- Thiết bị có cỡ chữ hệ thống tăng.
- Trạng thái mất mạng và kết nối lại.
- Ứng dụng chuyển sang nền rồi quay lại.
- Bàn phím mở khi nhập dữ liệu.
- Các trạng thái loading, lỗi và dữ liệu trống.

## 12. Test matrix Phase 3.T10 — Supabase, SQLite và đồng bộ

Đây là kế hoạch kiểm thử; chưa có test PostgreSQL/Supabase hoặc migration được chạy. Các bài kiểm thử yêu cầu environment riêng (local/staging), fixtures giả lập và không dùng service-role key trong mobile.

| ID | Lớp | Kịch bản | Kết quả bắt buộc |
|---|---|---|---|
| DB-01 | PostgreSQL schema | Áp dụng migrations từ database rỗng và từ fixture nâng cấp; chạy lại migration runner | Bảy bảng, constraints, FK và indexes đúng thiết kế; migration history sạch, runner không chạy lại migration đã ghi nhận hoặc tạo schema drift. |
| DB-02 | PostgreSQL constraints | UUID sai, scope/owner không hợp lệ, reps/set/position sai, completed thiếu thời điểm, gram âm/quá miền, duplicate position/set | DB từ chối mỗi hàng vi phạm; không để constraint nullable tạo lỗ hổng (`CHECK` với NULL được test riêng). |
| DB-03 | PostgreSQL FK | Child thiếu parent, FK cross-owner, parent tombstone và purge có tham chiếu | FK/policy giữ integrity; tombstone không phá FK; session snapshot vẫn đọc được sau khi source exercise/plan archive/tombstone; purge bị chặn hoặc theo retention flow. |
| DB-04 | Indexes | Chạy query lịch sử, danh sách plan active, children theo parent và FK cleanup trên fixture đại diện | `EXPLAIN` dùng index phù hợp khi quy mô/workload warrant; không giữ index dư thừa không có query. |
| SQ-01 | SQLite migration | Tạo fixture v1 có dữ liệu ở đủ 6 bảng, nhiều cấp FK, NULL và snapshots; nâng cấp v2 | Counts và toàn bộ ID/FK giữ đúng, UUID canonical hóa giữ nguyên 128 bit, snapshot/UTC/status không đổi. |
| SQ-02 | SQLite rollback | Inject lỗi ở các bước tạo/copy/index/validation và khởi động lại trên DB file/WAL | Transaction rollback nguyên vẹn v1; `user_version` không nhảy; backup được xác minh mở và phục hồi được. |
| SQ-03 | SQLite migration | Chạy v2 migration lần hai / app gặp version mới hơn / gián đoạn giữa migration | Không nhân đôi dữ liệu; version guard đúng; interrupted transaction có thể khôi phục an toàn. |
| SQ-04 | SQLite transaction isolation | Interleave concurrent repository writes với transaction nghiệp vụ+outbox và inject lỗi giữa transaction | Không kéo write ngoài scope vào transaction hoặc rollback/commit nhầm; serialize/exclusive transaction behavior đúng trên từng platform mục tiêu. |
| WT-01 | Weight conversion | kg/lb, 0, null pair, nửa gram, giá trị ngay quanh rounding boundary | Kết quả theo `kg*1000`, `lb*453.59237`, nearest gram/ties upward; NULL vẫn NULL; tối đa 0.5g quantization (ngoài sai số REAL). |
| WT-02 | Weight preflight | Unit invalid, null mismatch, âm, NaN/Infinity, overflow, vượt miền sản phẩm/safe integer | Report chỉ rõ row/id và lý do; migration bị chặn cho tới quyết định; không đổi về 0/NULL, bỏ qua hoặc xóa. |
| AUTH-01 | Auth | Email/password đăng ký, xác minh, sign-in sai/đúng, reset, refresh và sign-out | Không mở cloud data trước trạng thái được xác minh; lỗi hiển thị đúng; password/token không vào DB/outbox/log. |
| AUTH-02 | Auth/platform | Callback PKCE đúng/sai, app restart, session restore, đổi tài khoản, SecureStore lỗi | Không nhận callback giả; session account chính xác; lỗi storage không tạo trạng thái đăng nhập giả. |
| RLS-01 | Grants/RLS | `anon` và `authenticated` thử SELECT/INSERT/UPDATE/DELETE trực tiếp trên cả 7 bảng | Anon chỉ đọc catalog nếu cấu hình; authenticated chỉ có SELECT cần thiết; direct DML/hard delete bị từ chối bởi grants. |
| RLS-02 | Isolation | User A SELECT tombstone/child của B; fixture riêng tạm cấp DML hẹp để xác minh row policies | Không đọc row B; policy từ chối update owner và child FK cross-owner; test-only grants không được đưa vào production. |
| RLS-03 | Exercise catalog | Anon/A gọi mutation channel để tạo system exercise, đổi scope/owner, sửa exercise người khác hoặc user-owned của mình | System chỉ read-only với client; mutation exercise user chỉ owner được phép; không thể chuyển system↔user để vượt quyền; direct DML vẫn bị grant từ chối. |
| RLS-04 | Child policies | Gọi mutation channel để tạo plan exercise/session/set dưới parent của người khác hoặc tham chiếu exercise cá nhân của người khác | Mọi mutation cross-owner bị policy/constraint từ chối; cùng owner và exercise system hợp lệ thì được cho phép; direct DML không trở thành đường vòng. |
| RLS-05 | Soft delete | Pull deleted row/tombstone, query UI và gửi update cũ sau tombstone | Owner nhận tombstone để sync; UI không hiển thị như active; update cũ không resurrect; user khác không thấy row. |
| RLS-06 | Mutation endpoint | A/B gọi mutation channel đã được duyệt với đúng/sai owner, base_version, replayed mutation_id và invalid JWT | Chỉ owner được mutation; version/receipt xử lý nguyên tử; replay không áp dụng lần hai; endpoint/grants không cho ghi receipt trực tiếp. |
| RLS-07 | Function hardening | Kiểm tra function owner, `BYPASSRLS`, object ownership, `search_path`, schema usage, EXECUTE trực tiếp/qua PUBLIC và overload | Function chỉ callable qua role đã duyệt; không chạy bằng postgres/bypassrls; mọi object schema-qualified; anon/PUBLIC và unauthenticated bị từ chối. |
| SYNC-01 | Offline/outbox | Ghi/sửa/xóa khi offline, force close/restart, cùng lúc transaction nghiệp vụ và outbox | Cả nghiệp vụ và outbox commit/rollback cùng nhau; pending mutation còn sau restart và gửi đúng dependency order. |
| SYNC-02 | Retry/idempotency | Timeout sau commit, duplicate concurrent cùng ID, replay cùng ID/hash, cùng ID với payload khác, retry 408/429/5xx/Retry-After | Mutation chỉ áp dụng một lần; cùng hash trả nguyên receipt, khác hash bị từ chối; concurrent request serialize; backoff/jitter và Retry-After đúng; không rơi mutation. |
| SYNC-02a | Receipt outcomes | Replay successful receipt và terminal version-conflict receipt sau khi entity đã đổi thêm | Cùng mutation ID trả outcome/result đã ghi; conflict resolution tạo mutation ID/base_version mới. |
| SYNC-03 | Auth/errors | 401/refresh một lần, 403, validation lỗi và receipt không khả dụng | 401 làm pause đúng account sau lần refresh; 403/validation không retry vô hạn; receipt chưa xác nhận thì outbox không bị xóa. |
| SYNC-04 | Multi-device conflict | Hai thiết bị cùng base_version sửa một entity; một bản cập nhật đến sau; child mutation đang chờ | Một mutation được chấp nhận, mutation stale thành conflict; giữ cả hai phiên bản, chặn dependent mutation; không last-write-wins. |
| SYNC-05 | Tombstone conflict | Delete trên thiết bị A đồng thời update cũ/replay từ B | Tombstone không bị update cũ ghi đè; restore chỉ qua mutation tường minh trên version hiện tại. |
| SYNC-06 | Account switch | A logout, B login trong khi A có outbox/pending local partition; rồi A login lại | Không gửi A dưới session B; partition/outbox của A giữ nguyên và chỉ resume khi A xác thực. |
| SYNC-07 | Unowned import | Đăng nhập lần đầu với dữ liệu v1 NULL-owner; bỏ qua import, preview, chọn một phần, xác nhận, collision và lỗi giữa chừng | Mặc định không gán/upload; chỉ rows chọn mới được attach/enqueue sau xác nhận; rollback/retry không mất nguồn hoặc nhân đôi. |
| SYNC-08 | Network lifecycle | Mất mạng lúc gửi, đổi mạng, app background/foreground và server chậm | Không mất/nhân đôi mutation; tiếp tục theo FIFO; không tạo retry storm hoặc giả báo synced. |
| SYNC-09 | Receipt retention | Outbox pending quá hạn retry đã chốt; client offline dài hơn retention; receipt GC và retry sau GC | Không replay thành mutation mới ngoài ý muốn; protocol max-age/reconcile/full-fetch được áp dụng trước khi receipt bị purge. |
| SYNC-10 | Pull cursor | Cùng timestamp, tie-break, cập nhật trong khi phân trang, tombstone, cursor expiry và full resync | Không bỏ sót/nhân đôi rows; cursor tiến triển xác định; expired cursor khởi động full resync và giữ local pending mutations. |

Mọi bài RLS cần chạy dưới role/JWT từng tình huống (`anon`, A, B), kiểm tra cả allow lẫn deny và privilege catalog; không chỉ chạy bằng owner/superuser. Direct table-DML grants ở production phải tiếp tục bị từ chối; policy write tests nếu cần DML role trực tiếp phải ở disposable fixture/test-only grants, còn đường production mutation phải test qua function owner/JWT. SQLite transaction tests cần chạy cả against Expo SDK runtime trên platform hỗ trợ và file-backed SQLite; adapter `node:sqlite :memory:` hiện tại không chứng minh transaction scoping/interleaving trên thiết bị. Các tiêu chí weight yêu cầu đối chiếu theo từng row, không chỉ so tổng counts. Trước release, kết quả, fixture, môi trường và lỗi còn lại phải được ghi lại; kế hoạch này không thay thế kết quả đó.

---

## Test Matrix — Multi-Tenant & RBAC (2026-10-23)

> Trạng thái: **Kế hoạch — chưa thực thi.** Đây là test matrix thiết kế cho các tính năng gym management. Không có test nào được chạy trong phạm vi tài liệu này.

### MT — Multi-Tenancy Isolation

| ID | Kịch bản | Kết quả bắt buộc |
|---|---|---|
| MT-01 | Cross-tenant data leak | Staff Gym A không thể đọc bất kỳ dữ liệu nào của Gym B |
| MT-02 | Cross-tenant write | Staff Gym A không thể tạo/sửa/xóa dữ liệu Gym B |
| MT-03 | User thuộc nhiều gym | User có gym_staff trong Gym A và Gym B thấy đúng dữ liệu từng gym theo context |
| MT-04 | Gym không tồn tại | Request với gym_id không tồn tại trả 404 hoặc empty; không leak thông tin |
| MT-05 | Branch isolation | Staff branch A1 không thấy dữ liệu branch A2 (nếu policy branch-scoped) |
| MT-06 | Cross-tenant mutation attempt | Staff Gym A gọi RPC/Gateway với target_gym_id = Gym B -> Bị từ chối (403/Forbidden); không có thay đổi nào xảy ra |

### RBAC — Role-Based Access Control

| ID | Vai trò | Kịch bản | Kết quả bắt buộc |
|---|---|---|---|
| RBAC-01 | Owner | Tạo, sửa, xóa gym/branch/staff | Được phép đầy đủ trong gym của mình |
| RBAC-02 | Owner | Đọc dữ liệu gym khác | Bị từ chối |
| RBAC-03 | Manager | Tạo branch | Bị từ chối (chỉ Owner) |
| RBAC-04 | Manager | Quản lý hội viên branch của mình | Được phép |
| RBAC-05 | Manager | Quản lý hội viên branch khác | Bị từ chối (branch-scoped) |
| RBAC-06 | Receptionist | Check-in hội viên | Được phép tại branch của mình |
| RBAC-07 | Receptionist | Xem báo cáo doanh thu | Bị từ chối |
| RBAC-08 | Trainer | Xem workout data của member được giao | Được phép |
| RBAC-09 | Trainer | Xem workout data của member không được giao | Bị từ chối |
| RBAC-10 | Member | Xem hồ sơ và gói tập của mình | Được phép |
| RBAC-11 | Member | Xem hồ sơ member khác | Bị từ chối |
| RBAC-12 | Không đăng nhập (anon) | Bất kỳ gym management endpoint | Bị từ chối |
| RBAC-13 | Suspended Staff | Nhân viên có status = 'suspended' truy vấn dữ liệu | Bị từ chối hoàn toàn; RLS status active chặn truy cập |
| RBAC-14 | Invited Staff | Nhân viên có status = 'invited' (chưa kích hoạt) truy vấn nội bộ | Bị từ chối |
| RBAC-15 | Multi-Branch Manager (Branch 1 & 2) | Manager truy cập Branch 1 và Branch 2 | Được phép hợp lệ tại cả 2 branch được gán |
| RBAC-16 | Multi-Branch Manager (Branch 3) | Manager chỉ được gán Branch 1 & 2 cố truy cập Branch 3 | Bị từ chối (branch-scoped isolation) |

### GM — Gym & Staff Management Uniqueness & Constraints

| ID | Kịch bản | Kết quả bắt buộc |
|---|---|---|
| GM-01 | Gán trùng 1 user vào cùng 1 branch | Cố tạo bản ghi trùng (gym_id, branch_id, user_id) khi branch_id NOT NULL -> Bị chặn bởi partial unique index gym_staff_gym_branch_user_idx |
| GM-02 | Gán trùng quyền toàn gym | Cố tạo 2 bản ghi (gym_id, user_id) khi branch_id IS NULL -> Bị chặn bởi partial unique index gym_staff_gym_user_null_branch_idx |
| GM-03 | Xóa branch có staff phân công | Cố DELETE FROM branches khi còn gym_staff liên kết -> Bị PostgreSQL từ chối bởi ON DELETE RESTRICT (mã lỗi 23503 foreign_key_violation); bắt buộc dùng soft-deactivation status = 'archived' để bảo vệ audit trail |
| GM-04 | Direct DML từ Client | Client cố tình INSERT/UPDATE/DELETE trực tiếp bảng gym_staff/branches mà không qua RPC/Gateway -> Bị PostgreSQL từ chối (REVOKE ALL DML) |
| GM-05 | Cross-tenant branch assignment | Cố tình INSERT gym_staff với gym_id = Gym_A nhưng branch_id = Branch_B (thuộc Gym_B) -> Bị PostgreSQL từ chối ngay lập tức bởi Composite FK fk_gym_staff_branch_gym |
| GM-06 | Coexistence quyền toàn gym và chi nhánh | User đã có quyền toàn gym (branch_id IS NULL), cố gán thêm quyền chi nhánh -> Gateway từ chối theo nguyên tắc Mutual Exclusivity; RLS helper luôn ưu tiên quyền toàn gym và đình chỉ toàn gym sẽ khóa mọi chi nhánh |
| GM-07 | RLS Fail-Closed ngay sau migration | Bảng vừa được tạo trong migration (kèm ENABLE RLS và REVOKE ALL trong cùng transaction) trước khi có policy SELECT -> Mọi truy vấn từ anon và authenticated đều trả về rỗng/bị từ chối (fail-closed tuyệt đối, không có cửa sổ hở dữ liệu) |
| GM-08 | Xóa branch đã gỡ staff vs. Soft-deactivation | Thử hard-delete branch sau khi đã gỡ hết staff -> Cho phép ở mức DB RESTRICT nhưng luồng vận hành Gateway từ chối hard-delete, chỉ áp dụng soft-deactivation (status = 'archived') để bảo toàn lịch sử hội viên và check-in |

### SEC — Security & Privilege Escalation Guards

| ID | Kịch bản | Kết quả bắt buộc |
|---|---|---|
| SEC-01 | Search Path Hijacking & Identity Tampering | Kẻ tấn công gọi helper function với schema giả mạo hoặc cố truyền user_id khác -> Hàm ghim cứng search_path = public, pg_temp và luôn dùng auth.uid(); không leo thang quyền |
| SEC-02 | Gym status lockdown (suspended/archived) | gyms.status chuyển sang 'suspended' -> is_active_staff trả về FALSE cho mọi nhân viên (Manager, Rec, Trainer) kể cả khi staff record active; toàn bộ staff bị khóa truy cập |
| SEC-03 | Quyền Owner khi gym suspended | gyms.status = 'suspended': Owner đọc bản ghi gyms -> Được phép (xem lý do nợ cước, hóa đơn); Owner gọi fn_gm_reactivate_gym -> Được phép để thanh toán khôi phục dịch vụ; nhưng Owner truy vấn branches, gym_staff, gym_members hoặc gọi RPC nghiệp vụ -> Bị từ chối 100% (is_gym_owner trả về FALSE) |

### SSR — Supabase SSR Auth & Cookie Testing

| ID | Kịch bản | Kết quả bắt buộc |
|---|---|---|
| SSR-01 | Concurrent token refresh race condition | JWT hết hạn; dashboard kích hoạt 3 Server Components song song -> Middleware làm mới token tập trung; không bị lỗi Refresh Token Reuse Detection; phiên duy trì thông suốt |
| SSR-02 | Multi-tab logout & cookie sync | Đăng xuất trên Tab A (xóa httpOnly cookie); Tab B gọi Server Action -> Server Action từ chối với 401 Unauthorized và redirect về /login |

### CI — Check-in Validation

| ID | Kịch bản | Kết quả bắt buộc |
|---|---|---|
| CI-01 | Check-in với gói active đúng branch | Cho phép; tạo attendance_log |
| CI-02 | Check-in với gói hết hạn | Từ chối; lý do cụ thể |
| CI-03 | Check-in với gói suspended | Từ chối; lý do cụ thể |
| CI-04 | Check-in sai branch (home_branch only) | Từ chối; lý do cụ thể |
| CI-05 | Check-in trùng trong ngày | Từ chối; hiển thị lần check-in trước |
| CI-06 | Check-in khi sessions_remaining = 0 | Từ chối; lý do cụ thể |
| CI-07 | Concurrent check-in cùng member | Chỉ một thành công; UNIQUE constraint phát huy |

### PY — Payments

| ID | Kịch bản | Kết quả bắt buộc |
|---|---|---|
| PY-01 | Ghi nhận thanh toán lần đầu | Bản ghi được tạo; status = completed |
| PY-02 | Ghi nhận trùng mutation_id | Bản ghi cũ được trả lại; không tạo mới |
| PY-03 | Cùng mutation_id nhưng amount khác | Bị từ chối; lỗi idempotency |
| PY-04 | Hoàn tiền giao dịch hợp lệ | Bản ghi refund được tạo; parent_transaction_id đúng |
| PY-05 | Hoàn tiền > số tiền gốc | Bị từ chối |
| PY-06 | Receptionist xem báo cáo | Bị từ chối |
| PY-07 | Manager xem báo cáo branch của mình | Được phép |

### MS — Membership

| ID | Kịch bản | Kết quả bắt buộc |
|---|---|---|
| MS-01 | Đăng ký gói; status = pending → active sau thanh toán | Đúng trạng thái; end_date tính đúng |
| MS-02 | Tạm dừng gói active | Status = suspended; suspended_at ghi nhận |
| MS-03 | Resume gói suspended | Status = active; end_date gia hạn nếu cần |
| MS-04 | Gói hết hạn tự động | Status = expired khi end_date qua |
| MS-05 | Gia hạn = tạo gói mới | Gói cũ giữ nguyên; gói mới có start_date đúng |

---

## Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-23 | Khởi tạo ma trận kiểm thử multi-tenant (MT, RBAC, GM, CI, PY, MS). | Phục vụ kiểm thử nghiệm thu kiến trúc phòng gym nhiều tenant. | Kế hoạch kiểm thử mức thiết kế; chưa thực thi. |
| 2026-10-23 | Bổ sung test cases MT-06, RBAC-13 đến RBAC-16, GM-01 đến GM-04. | Chuẩn bị phê duyệt P0.T07 và P0.T08 theo chỉ đạo chủ dự án. | Hoàn thiện ma trận kiểm thử phân quyền và ràng buộc dữ liệu. |
| 2026-10-23 | Final GM-1 Schema Security Review: Bổ sung test cases GM-05 (Cross-tenant branch FK), GM-06 (Coexistence & Mutual Exclusivity), SEC-01 (Helper functions security), SEC-02 (Gym status lockdown), SSR-01 (Concurrent refresh race condition), SSR-02 (Multi-tab logout sync). | Chuẩn bị nghiệm thu an toàn bảo mật cho Gate P0.T08. | Ma trận kiểm thử hoàn thiện; sẵn sàng cho Gate P0.T08. |
| 2026-10-23 | Final Security Corrections Before Approval: Bổ sung test cases GM-07 (RLS fail-closed ngay sau migration), GM-08 (Xóa branch có staff assignment bị RESTRICT từ chối, yêu cầu soft-deactivation), SEC-03 (Quyền Owner khi gym suspended: chỉ đọc trạng thái và gọi RPC gia hạn, khóa nghiệp vụ con). | Hoàn thiện tiêu chuẩn nghiệm thu an toàn dữ liệu và fail-closed trước phê duyệt P0.T08. | Ma trận kiểm thử đầy đủ và sẵn sàng cho P0.T08. |
| 2026-10-23 | Final Pre-Approval Verification: Cập nhật kịch bản kiểm thử GM-03 và GM-08 với soft-deactivation chuẩn hóa `branches.status = 'archived'`. | Đồng bộ hóa với schema branches đa trạng thái trước phê duyệt P0.T08. | Ma trận kiểm thử nhất quán 100%. |
