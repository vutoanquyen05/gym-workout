# Storage Module

## Mục đích

Quản lý database SQLite cục bộ theo hướng offline-first: khởi tạo schema có phiên bản, áp dụng migration tuần tự và cung cấp repository có kiểu cho dữ liệu bài tập, kế hoạch và buổi tập. Module không xác thực người dùng, không gọi backend, không tự đồng bộ và không giữ kết nối database toàn cục.

## Kiến trúc/Cấu trúc

- `src/shared/storage/schema.ts`: migration SQL có thứ tự và phiên bản schema hiện hành.
- `src/shared/storage/database.ts`: bật SQLite pragmas, đọc `PRAGMA user_version`, chạy migration tuần tự trong transaction; từ chối database có version mới hơn code hiện tại.
- `src/shared/storage/types.ts`: kiểu domain và kiểu bản ghi được map từ SQLite.
- `src/shared/storage/repositories/`: truy vấn có bind parameters và chuyển đổi rõ ràng giữa SQLite rows với domain types.
- `expo-sqlite`: adapter SQLite do Expo SDK 57 hỗ trợ; caller sở hữu vòng đời database và truyền connection vào module.
- `__tests__/storage-test.ts`: kiểm thử schema SQLite thật trong bộ nhớ, migration, ràng buộc và repository; adapter dùng `node:sqlite` chỉ trong test.

Schema khởi đầu chỉ hiện thực dữ liệu bài tập, kế hoạch, bài tập trong kế hoạch, buổi tập, bài tập snapshot của buổi tập và các hiệp. User/auth/profile, goals, recovery check-ins và sync outbox chưa được tạo vì phạm vi/backend tương ứng chưa được xác nhận.

## Lịch sử phát triển

- Phase 3.T01: thiết kế và triển khai schema SQLite versioned, migration và repository cục bộ.

## Quyết định schema của Phase 3.T01

- Dùng ID text ngẫu nhiên 128-bit sinh trong SQLite; ID ổn định cho bản ghi cục bộ nhưng không đại diện hợp đồng ID/backend.
- Thời điểm lưu dưới dạng UTC ISO-8601 text; input timestamp của session được xác thực và chuẩn hóa về UTC.
- Khối lượng lưu cùng đơn vị `kg` hoặc `lb` cho từng hiệp; chưa chốt đơn vị mặc định hay công thức chuẩn hóa thống kê.
- Giá trị cấu hình và dữ liệu hiệp phải thỏa CHECK constraints; input luôn truyền qua bind parameters.
- Xóa kế hoạch không xóa lịch sử: session giữ snapshot tên và bỏ tham chiếu kế hoạch; exercise còn được kế hoạch tham chiếu thì không thể xóa. Xóa exercise tham chiếu bởi lịch sử sẽ bỏ tham chiếu nhưng giữ snapshot tên bài tập.
- Migration tăng `PRAGMA user_version` trong transaction cùng DDL; lỗi rollback và được trả về caller. Database có schema version mới hơn bị từ chối.
- Repository hiện hỗ trợ tạo/tìm kiếm/lưu trữ exercise; tạo và đọc plan cùng cấu hình exercise; tạo, đọc, liệt kê session, ghi set và hoàn thành session. Không có API hard-delete lịch sử.
- Caller khởi tạo database trước khi dùng repository và sở hữu kết nối; module không mở kết nối toàn cục hoặc tự tích hợp vào app root trong task schema.

## Hợp đồng đích Supabase + SQLite — Phase 3.T06–T07

Đây là thiết kế đã duyệt, không phải trạng thái code/schema hiện tại. SQLite v1 vẫn giữ nguyên các bảng, ID hex, `weight_value REAL`/`weight_unit`, không có account owner, soft-delete metadata, version hoặc outbox. PostgreSQL/Auth và Sync Service chưa được triển khai.

- Bản ghi cần đồng bộ dùng UUID canonical chung; v1 ID giữ nguyên 128 bit và chỉ chuẩn hóa representation sau khi kiểm thử mapping mọi PK/FK.
- Mục tiêu khối lượng là integer grams, với `kg × 1000` và `lb × 453.59237`, nearest gram/ties upward. Trước khi làm SQLite v2 cần kiểm kê dữ liệu thực, conversion preview, kiểm tra overflow/invalid values và có backup/rollback.
- Bản ghi cá nhân được phân vùng theo Auth user ID; dữ liệu v1 vẫn local-unassigned cho đến khi người dùng chọn và xác nhận import.
- Sync target có soft-delete tombstones, server-owned version và outbox transactional; lịch sử tập giữ snapshot bài tập. Conflict dùng optimistic concurrency, không tự “last write wins”.
- Thiết kế chi tiết mapping bảng, retry/idempotency, RLS và PostgreSQL nằm trong `data-offline.md`; T06–T07 hoàn tất ở mức tài liệu. SQLite v2/outbox là Phase 3.T09 và chưa được thay đổi trong task này.
- Pre-Implementation Gate xác nhận khác biệt v1 cần giải quyết: không có `scope`/owner/partition, `deleted_at`, version hoặc outbox; `session_exercises` chỉ snapshot tên chứ không lưu toàn bộ thuộc tính bài tập; các bước `addSet` và `addExercise` cập nhật parent riêng ngoài transaction bao mutation chính. Repository chưa được khởi tạo ở app root; test storage hiện chạy database in-memory, không phải migration/restore trên file dữ liệu thực tế.
- Expo SDK 57 docs cảnh báo query khác trên cùng connection có thể chạy trong transaction đang mở bởi `withTransactionAsync`; mutation v2 cần đánh giá transaction API có scope cô lập hoặc serialized write queue và test interleaving trên runtime. Không được coi adapter `node:sqlite :memory:` hiện tại là bằng chứng cho hành vi concurrency thiết bị.
- Không mở database vật lý hoặc kiểm kê cân nặng trong gate; kết quả counts, orphan, range và conversion chỉ có sau khi người dùng cho phép preflight trên backup.
- SQLite v1 Preflight được phê duyệt chỉ trên bản sao, nhưng bị chặn: không có file database/backup trong repository, cũng không có call site mở DB hoặc khởi tạo ở app/runtime (hàm init chỉ xuất hiện trong tests) để xác định vị trí runtime. Không chạy truy vấn; mọi số liệu dữ liệu thật vẫn chưa xác định. Cần nhận bản sao/backup an toàn và xác minh mở được trước khi kiểm kê.

## Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-19 | Tạo tài liệu module storage trước khi triển khai schema/repository. | Tuân thủ quy tắc tài liệu module và xác định phạm vi dữ liệu cục bộ không phụ thuộc backend. | Ghi nhận cấu trúc ban đầu, quyết định ID/timestamp/unit, delete semantics và các thực thể chưa thuộc phạm vi. |
| 2026-10-19 | Hoàn thiện schema version 1, migration runner, domain types, repositories và kiểm thử SQLite thật. | Triển khai Phase 3.T01 theo phạm vi dữ liệu local đã xác định, không giả định backend/sync. | Migration idempotence/rollback, version guard, ràng buộc FK, bind parameters, snapshot lịch sử và thao tác repository được kiểm thử. |
| 2026-10-21 | Bổ sung hợp đồng đích Supabase PostgreSQL–SQLite và ghi rõ ranh giới với SQLite v1 hiện hữu. | Hoàn tất thiết kế Phase 3.T06–T07 mà không triển khai migration/sync. | Chỉ cập nhật tài liệu; schema SQLite thực tế vẫn version 1 và chưa có đánh giá dữ liệu cân nặng thật. |
| 2026-10-21 | Ghi nhận kết quả Pre-Implementation Gate và chênh lệch v1→target. | Làm rõ dữ liệu snapshot không thể phục hồi đầy đủ, boundaries transaction hiện tại và blocker preflight. | Chỉ cập nhật tài liệu; không đọc DB vật lý, không sửa source/migration hoặc dữ liệu. |
| 2026-10-21 | Ghi nhận SQLite v1 Preflight bị chặn do không có bản sao/backup được xác nhận. | Chỉ kiểm kê trên bản sao an toàn; không truy cập nguồn hoặc thiết bị. | Không chạy truy vấn và không thay đổi DB; counts/UUID/FK/weights chưa xác định. |
