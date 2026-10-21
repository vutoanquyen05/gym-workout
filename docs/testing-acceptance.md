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
