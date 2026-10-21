# Supabase PostgreSQL Schema Module

## Mục đích

Ghi nhận thiết kế/review PostgreSQL cho đồng bộ dữ liệu Gym Workout với SQLite. Bốn migration core v1 đã được chuẩn bị theo phê duyệt có điều kiện nhưng **chưa chạy/apply**. Không có bằng chứng đã kết nối project Supabase; tài liệu và file migration không cấp phép thực thi hoặc triển khai.

## Kiến trúc/Cấu trúc

- `data-offline.md`: hợp đồng dữ liệu PostgreSQL–SQLite, ownership, sync, RLS và preflight.
- `risks-decisions.md`: quyết định đã thống nhất và blocker trước triển khai.
- Phase đầu chỉ có bảy bảng nghiệp vụ: `users`, `exercises`, `workout_plans`, `plan_exercises`, `workout_sessions`, `session_exercises`, `workout_sets`.
- PostgreSQL là server authority cho `version`, `created_at`, `updated_at`, conflict và idempotency. SQLite giữ dữ liệu offline cùng `sync_outbox` local-only.
- Bốn file migration imperatively scaffold bằng Supabase CLI; chưa chạy/apply hoặc được xác minh bằng PostgreSQL. Không tạo config, RPC/gateway, receipt table, seed hay Auth integration.

## Bản thiết kế đã review

### Bảy bảng core

| Bảng | Nội dung và ràng buộc ownership |
|---|---|
| `users` | Profile tối thiểu; `id` là PK/FK `auth.users.id`; không lưu email/password hoặc dùng metadata người dùng để phân quyền. Tạo/cập nhật qua mutation channel đã xác thực, không qua Auth trigger. |
| `exercises` | Catalog hệ thống và exercise cá nhân phân biệt bằng `scope` (`system`/`user`); `owner_id` NULL chỉ khi system, còn user exercise phải có owner. System rows chỉ được seed/quản trị bởi quy trình tin cậy. |
| `workout_plans` | Plan thuộc `user_id`; có archive riêng với tombstone. |
| `plan_exercises` | Child của plan có cùng `user_id`; exercise phải là system hoặc thuộc đúng user; vị trí active duy nhất trong plan, tombstone vẫn giữ. |
| `workout_sessions` | Session thuộc `user_id`; `plan_id` nullable; title và dữ liệu session là snapshot nghiệp vụ. |
| `session_exercises` | Child của session có cùng `user_id`; snapshot tên/nhóm cơ/thiết bị/độ khó/instructions; `source_exercise_id` chỉ là tham chiếu tùy chọn. |
| `workout_sets` | Child của `session_exercises` có cùng `user_id`; `weight_grams BIGINT`, reps và trạng thái hiệp theo hợp đồng local. |

Các bảng sync-managed có UUID canonical do client tạo trước khi ghi local; `created_at`/`updated_at` server-side `timestamptz`; `deleted_at` nullable; `version BIGINT NOT NULL DEFAULT 1 CHECK (version >= 1)`. Schema v1 chỉ đặt default metadata ban đầu; future mutation channel bắt buộc tự cập nhật `updated_at` và tăng version nguyên tử. `started_at`/`completed_at` là thời gian nghiệp vụ UTC, không phải conflict ordering. Giữ `is_archived` khác `deleted_at`.

Dùng `text` cùng `CHECK` thay cho enum PostgreSQL ở schema đầu: `scope` và `status` có miền kiểm tra rõ; `difficulty` giữ nullable/text để tương thích SQLite hiện tại và tránh chốt taxonomy chưa có catalog. Không đưa goals, recovery, notification settings, app settings hoặc server outbox vào bảy bảng core.

### Khóa ngoại và ownership

- `workout_plans`, `workout_sessions`, `session_exercises` có unique `(user_id, id)` làm đích FK composite cho children. Child FK dùng `(user_id, parent_id)`, ngăn gắn sang parent của tài khoản khác ngay tại DB.
- `plan_exercises`, `session_exercises`, `workout_sets` đều mang `user_id`; mutation channel xác nhận nó khớp parent. Child RLS cũng xác nhận owner và parent.
- `workout_sessions(user_id, plan_id)` chỉ tham chiếu plan cùng user. Để purge vật lý plan, quy trình tin cậy phải đặt `plan_id = NULL` trên sessions trước khi purge; client không có hard-delete.
- FK tới `exercises` bảo vệ sự tồn tại, nhưng không tự kiểm tra RLS/owner. Mutation channel bắt buộc xác minh exercise là system hoặc `owner_id = auth.uid()` trước khi gắn vào plan/session. Không dựa vào việc FK tự áp dụng RLS.
- Session snapshot là nguồn sự thật cho lịch sử. Purge exercise nguồn có thể đặt `source_exercise_id` NULL nhưng không xóa snapshot; exercise còn được plan tham chiếu thì purge bị chặn. Purge cha/con chỉ bởi quy trình retention đã duyệt; soft delete không kích hoạt cascade.
- `users.id` tham chiếu `auth.users.id`; không tạo profile bằng trigger `SECURITY DEFINER` hoặc từ `raw_user_meta_data`. Xóa Auth user cần quy trình retention/purge có kiểm soát, không dựa vào cascade vô tình.

### RLS, grants và catalog

- Bật RLS trên cả bảy bảng trong cùng transaction tạo bảng; nếu chưa có policy/grant thì mặc định fail closed.
- Không cấp quyền cho `anon` ở giai đoạn đầu. `authenticated` chỉ được `SELECT` những bảng cần đọc; owner policy dùng `TO authenticated` và `(select auth.uid())`, không dùng `auth.role()`.
- Supabase anonymous Auth users cũng dùng PostgreSQL role `authenticated`; mọi SELECT policy kiểm tra claim `is_anonymous` và từ chối anonymous Auth users. Hosted project phải bật email confirmation và xác minh config trước khi cấp cloud access; verified-email gating của project/JWT chưa kiểm chứng tại đây.
- `users`: chỉ SELECT row có `id = auth.uid()` và JWT không mang `is_anonymous = true`.
- `exercises`: authenticated chỉ đọc system catalog và exercise cá nhân của mình. Không có policy/grant client để INSERT/UPDATE/DELETE; không có `is_public` cho client tự tạo bài tập công khai.
- Các bảng cá nhân: SELECT chỉ với `user_id = auth.uid()` và xác nhận parent cùng owner ở child rows. Không lọc `deleted_at` khỏi owner read vì sync cần nhận tombstone; UI lọc tombstone.
- Không cấp `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES` hay `TRIGGER` cho `anon`/`authenticated` trên sync tables. Không có hard-delete từ client.
- RLS và SQL grants là hai lớp riêng. Thu hồi quyền cụ thể trên bảy bảng khỏi `PUBLIC`, `anon`, `authenticated`, rồi cấp tối thiểu `SELECT` cho `authenticated`. Không thu hồi hàng loạt quyền schema `public` của project hoặc thay đổi default privileges toàn cục một cách mù quáng.
- Trước migration phải kiểm tra Data API exposure, grants hiện hữu, owner của migration và `pg_default_acl`. Nếu cần chỉnh default privileges, chỉ áp dụng scoped cho đúng migration role/schema sau khi review; kiểm tra cả các bảng tạo về sau.

### Mutation version và receipt

`sync_outbox` chỉ thuộc SQLite. Đây là hàng đợi cục bộ chứa mutation chưa gửi, account partition, dependency, base version và retry state; không tạo bảng server `sync_outbox` và không cho client ghi receipt.

Server-side receipt ledger là thành phần riêng, chưa thuộc lần triển khai bảy bảng core. Đề xuất cho phase mutation sau:

- Bảng không được expose, ví dụ `private.mutation_receipts`, khóa duy nhất `(user_id, mutation_id)`; lưu loại entity/operation, entity UUID, server-computed request hash hoặc canonical request identity, terminal outcome/version và kết quả canonical cần cho replay.
- Mỗi lần retry cùng `mutation_id` và cùng request trả lại outcome đã ghi, không áp dụng mutation lần nữa. Cùng ID nhưng payload/operation khác phải bị từ chối.
- Mutation, kiểm tra `base_version`, tăng version và insert receipt phải nguyên tử trong một transaction; xử lý duplicate đồng thời, terminal conflict và timeout sau commit.
- Server tính request identity; không tin hash do client cung cấp. Client giữ một `mutation_id` ổn định trong toàn bộ retry.
- Receipt không bao giờ là local outbox. Do outbox hiện không có TTL và không tự drop retry, receipt retention cần vô hạn hoặc phải có chính sách hết hạn/reconcile/full-fetch được duyệt trước khi purge.

### SECURITY DEFINER, EXECUTE và privilege boundary

- Bảy bảng core không cần `SECURITY DEFINER`, trigger tạo profile hoặc function đặc quyền trong migration đầu.
- Chưa chọn gateway. `SECURITY INVOKER` chỉ có quyền `EXECUTE` không thể ghi khi caller không có DML grants; cấp DML client sẽ bypass receipt/version contract. Đây là blocker kiến trúc, không được giải bằng cách cấp thêm quyền.
- Migration core thu hồi table privileges của `service_role` trên cả bảy bảng và chỉ cấp lại `SELECT` cho `authenticated`. Trước khi triển khai mutation gateway, phải quyết định và kiểm thử quyền tối thiểu cần thiết cho trusted server/gateway (bao gồm RLS/role boundary); không tự ý cấp DML cho client hoặc mặc định cấp lại quyền rộng cho `service_role`.
- Nếu sau review chọn RPC `SECURITY DEFINER`: function hẹp, schema API được expose có chủ đích, owner là role `NOLOGIN`, không phải table owner, không có `BYPASSRLS`; role chỉ có quyền tối thiểu; RLS policy áp dụng cho role đó và kiểm tra `(select auth.uid())`. Function phải từ chối `auth.uid() IS NULL`, suy ra user từ Auth context, cố định `search_path = ''`, schema-qualify object, không dùng dynamic SQL từ payload, xác thực operation/field allowlist và xác minh owner/parent/exercise.
- Với từng function cụ thể: `REVOKE EXECUTE ... FROM PUBLIC, anon, authenticated`, sau đó chỉ `GRANT EXECUTE` cho role được duyệt. Không giả định việc đặt function trong schema private tự làm nó an toàn hoặc callable qua PostgREST.
- Nếu chọn trusted server-side gateway thay RPC, secret chỉ ở server; mọi thay đổi dữ liệu vẫn phải vào một transaction PostgreSQL atomic. Không gửi service-role/secret key tới app.
- Cấm auth trigger đọc `raw_user_meta_data` để tạo profile. Mọi function/trigger về sau cần kiểm tra owner, `search_path`, security mode, schema exposure, grants, EXECUTE ACL và RLS bypass bằng test.

### Index đã tạo trong migrations, chưa xác minh bằng workload

Không tạo index theo từng cột một cách máy móc. PK/unique constraints tự tạo index; unique theo quan hệ đã phục vụ truy vấn cha/con thì không tạo index trùng:

- Vị trí/set number chỉ unique giữa rows chưa tombstone: partial unique indexes trên `(plan_id,position)`, `(session_id,position)`, `(session_exercise_id,set_number)` WHERE `deleted_at IS NULL`, cho phép thay thế một row đã soft-delete mà vẫn giữ tombstone.
- Giữ owner-first child indexes `(user_id,plan_id,position)`, `(user_id,session_id,position)`, `(user_id,session_exercise_id,set_number)` vì policy đọc parent/owner và FK `(user_id,parent_id)` cần cả row đã tombstone. Chúng không trùng partial unique indexes.
- Migrations tạo `workout_plans(user_id, updated_at DESC)` và `workout_sessions(user_id, started_at DESC)` cho owner list/history; đây là index full vì pull cần tombstone.
- Index migration tạo `exercises(owner_id)`, `plan_exercises(exercise_id)`, `workout_sessions(plan_id)` và `session_exercises(source_exercise_id)` để hỗ trợ ownership/reference hoặc FK purge checks tương ứng.
- Không tạo index username (trường này chưa thuộc profile đã chốt), `is_public`, status đơn lẻ, catalog search, sync queue, goals/recovery/settings hoặc session exercise source lookup không được dùng.
- Các composite unique `(id, user_id)` là chủ ý để PostgreSQL chấp nhận composite FK ownership; không nhầm chúng với index thừa.
- Các index được chọn dựa trên RLS/FK và truy vấn list/history dự kiến; chưa có query plan, workload hoặc advisor evidence. Chạy `EXPLAIN`/advisors khi có local database và query contract; không mở rộng index speculative trước đó.

## Kế hoạch migration và kiểm thử

Các tên migration dưới đây được Supabase CLI sinh; file đã chuẩn bị nhưng chưa thực thi. Trước khi chạy cần readiness review: xác minh CLI/version/workflow, project/environment, migration history, migration role, Data API exposure, grants và `pg_default_acl`; xác nhận đã có config/local test harness và chủ dự án phê duyệt apply riêng.

| Nhóm | File/thứ tự và phạm vi | Gate kiểm thử / rollback |
|---|---|---|
| 0. Readiness (không DDL) | Chọn project/environment, migration owner/workflow, Data API exposure/default ACL, quyền môi trường; quyết định gateway, receipt/retention, catalog seed, profile deletion. SQLite preflight chỉ trên backup được chỉ rõ và xác minh mở được. | Ghi decision/backup/preflight; dừng nếu còn dữ liệu lỗi chưa giải trình. Việc chuẩn bị file không đồng nghĩa readiness hoặc cho phép apply. |
| 1. Parent tables — `20261021112229_core_parent_tables.sql` | `users`, `exercises`, `workout_plans`, `workout_sessions`; RLS enabled và grants bị revoke trên từng bảng ngay khi tạo. | Fresh apply; CHECK/NULL/unique/FK/status; cross-user session-plan bị từ chối; scope-owner invariant. Rollback chỉ trên DB disposable khi group sau chưa có dữ liệu phụ thuộc; drop không dùng CASCADE. |
| 2. Child tables — `20261021112241_core_child_tables.sql` | `plan_exercises`, `session_exercises`, `workout_sets`; composite owner FKs, snapshot, CHECK, RLS enabled và grants revoke. | Parent ownership FK, unique identity, target/reps/weight/completion và tombstone invariants. Rollback local theo thứ tự child ngược; không drop CASCADE. |
| 3. Indexes — `20261021112248_core_indexes.sql` | Owner/query/FK indexes và partial uniqueness chỉ cho rows chưa soft-delete. | `EXPLAIN` theo workload, FK index audit/advisors. Rollback local có thể drop các index vừa tạo; không ảnh hưởng dữ liệu. |
| 4. Read RLS/grants — `20261021112254_core_read_policies.sql` | SELECT policies cho từng bảng; revoke PUBLIC/anon/authenticated/service_role trước rồi grant authenticated SELECT. Không có DML policies/grants. | A/B isolation, tombstone visibility chỉ owner, anon và DML bị từ chối; grants tách biệt với RLS. Rollback local: revoke SELECT và drop policies; production ưu tiên forward-fix, không rollback destructive. |
| 5. Mutation receipts + gateway (ngoài core rollout) | Chỉ sau khi duyệt trust boundary: private receipt table, executor role, RPC/gateway atomic, grants/EXECUTE allowlist. Không tính receipt là local outbox hay một trong bảy bảng core. | Replays, payload mismatch, duplicate concurrent requests, stale version, timeout-after-commit, rollback, cross-owner/auth verification, role/search_path/EXECUTE audit. |
| 6. SQLite v2 + sync (tương lai) | Sau preflight, backup và duyệt riêng; UUID canonicalization, weight grams, account partition và local outbox. | Counts/FK/UUID/weight conversion, recovery, no auto-assign, multi-account isolation, Expo transaction isolation và full sync acceptance. |

Mỗi migration mở/đóng một transaction rõ ràng; bảng mới không có grant Data API trong giai đoạn parent/child/index. RLS được enable và revoke table grants cùng transaction tạo bảng; nhóm policy/regrant chỉ chạy sau khi đủ bảy bảng và indexes. Hướng dẫn test chưa chạy: sau phê duyệt apply riêng và khi có local Supabase config, dùng local disposable stack (`supabase start`, `supabase db reset`, `supabase test db` với fixtures pgTAP hai user/anon), không link/push remote. Migration không có down scripts tự động; local-only rollback dùng reset DB disposable hoặc reverse group theo thứ tự và `DROP ... RESTRICT`. Staging/production áp dụng forward-fix/restore theo backup đã duyệt, không chạy rollback destructive.

## Local migration test attempt — 2026-10-21

**Kết quả tổng thể: BLOCKED trước khi chạy SQL.** Kiểm tra chỉ đọc xác nhận môi trường local disposable chưa sẵn sàng; không khởi động/reset container, không kết nối database, không chạy migration, không cài công cụ/dependency và không truy cập Supabase Cloud.

| Nhóm kiểm tra | Kết quả | Bằng chứng/giới hạn |
|---|---|---|
| Docker CLI/daemon | **FAIL — prerequisite missing** | `docker` không có trên PATH nên daemon không thể được xác minh. |
| Supabase CLI/version/help | **FAIL — prerequisite missing** | `supabase` không có trên PATH; không gọi `npx`/`bunx` và không cài CLI. |
| Local Supabase project configuration | **FAIL — prerequisite missing** | `supabase/config.toml` không tồn tại; thư mục chỉ có `.temp` và `migrations`. |
| Alternative disposable PostgreSQL runtime | **FAIL — chưa xác định được môi trường phù hợp** | `podman`, `psql` và `pg_isready` không có trên PATH. WSL có executable nhưng chưa xác minh distro/runtime; không được xem là database disposable. |
| Static inventory review | **PASS — static only** | Node check tìm đúng 4 file theo thứ tự tên, 7 `CREATE TABLE`, 7 `ENABLE ROW LEVEL SECURITY`, 7 read policies, transaction boundaries và không thấy client DML grants/policies/function đặc quyền/trigger. Đây không phải SQL parser, PostgreSQL validation hoặc runtime test. |
| SQL syntax/apply và migration order | **NOT RUN — BLOCKED** | Không có local stack/config/CLI để parse hoặc apply an toàn. |
| Schema, constraints, UUID/version/tombstone, indexes, composite FKs | **NOT RUN — BLOCKED** | Chưa có database PostgreSQL để introspect/test positive và negative cases. |
| RLS, grants, schema `USAGE`, default privileges và Data API | **NOT RUN — BLOCKED** | Cần PostgreSQL/Supabase local stack; chưa có truy vấn catalog hay HTTP request nào được gửi. |
| `anon`, authenticated, hai tài khoản và direct DML deny | **NOT RUN — BLOCKED** | Chưa dựng Auth fixtures/JWT hoặc thực hiện request. |
| Chạy lại migrations và rollback | **NOT RUN — BLOCKED** | Chưa apply lần đầu; không chạy reset/drop trên môi trường chưa xác minh. |
| Cloud/data safety | **PASS — không có thao tác** | Không link project, không gọi Cloud, không dùng DB/dữ liệu thật, không chạy SQL/reset, không cài công cụ và không sửa source/migrations. |

Đã đối chiếu hướng dẫn chính thức về [Supabase CLI local development](https://supabase.com/docs/guides/local-development/cli/getting-started) và [database migrations](https://supabase.com/docs/guides/local-development/database-migrations): local stack được vận hành bằng CLI; tài liệu mô tả `supabase db reset` sẽ áp dụng lại migrations và reset DB local, nên chỉ được dùng sau khi local disposable project/database được xác minh. Đã rà changelog ngày 2026-10-21; không thấy breaking change liên quan tới local migration/RLS trong phần changelog hiện hành được kiểm tra. Không kiểm chứng được bất kỳ cấu hình project hoặc hành vi runtime nào.

**Điều kiện tiếp tục:** chủ dự án cung cấp/cài đặt trước Docker Desktop/daemon và Supabase CLI theo chính sách môi trường, hoặc chỉ định một local PostgreSQL/Supabase disposable đã được chứng minh không chứa dữ liệu cần bảo vệ; bổ sung `supabase/config.toml` và xác nhận database/local project có thể phá hủy. Không tiếp tục nếu còn nghi ngờ đó là môi trường dùng chung/thật. Khi môi trường sẵn sàng, trước reset cần kiểm tra CLI `--help`, container/project identity và port; sau đó mới thực hiện test matrix. Mọi migration SQL error phải báo cáo, không tự sửa file khi chưa được duyệt.

## Test plan chưa thực thi

1. Migration: fresh database, thứ tự phụ thuộc, constraints, transaction rollback/failure injection, không có table ngoài 7 core trong rollout đầu.
2. Grants và RLS độc lập: Postgres role `anon` bị từ chối; anonymous Auth JWT (`is_anonymous=true`) cũng bị RLS từ chối; A không đọc/sửa dữ liệu B; tombstone chỉ owner đọc; system catalog chỉ read permanent authenticated users; mọi direct client DML/hard-delete bị từ chối.
3. Ownership: forged `user_id`, owner change, child trỏ parent khác owner, session trỏ plan khác owner, plan/session exercise nguồn user khác, system exercise create/update/delete từ client.
4. Version/receipt trong phase riêng: base-version race, duplicate cùng payload, reuse mutation ID với payload khác, timeout sau commit, conflict replay, rollback và retention.
5. FK/purge: plan/session/exercise retention behavior; snapshot còn nguyên; mọi hard purge qua quy trình tin cậy và theo thứ tự.
6. Security review: role attributes (`BYPASSRLS`, ownership), RLS coverage, Data API exposure, schema/table/function privileges, default ACL, function `EXECUTE`, `search_path`, Security Definer owner; advisors.

## Lịch sử phát triển

- Phase 3.T07–T11: thiết kế hợp đồng PostgreSQL–SQLite, ownership, RLS, grants, indexes, migrations và test matrix; chưa triển khai.
- 2026-10-21: review lại bản SQL Supabase ban đầu và tách core schema khỏi receipts/gateway chưa được duyệt.
- 2026-10-21: tạo bốn migration file cho bảy bảng core, constraints, indexes và read-only RLS/grants; chưa áp dụng hoặc kiểm thử với PostgreSQL.
- 2026-10-21: preflight local migration test bị BLOCKED vì thiếu Docker, Supabase CLI và `config.toml`; chỉ hoàn tất static inventory check, không chạy SQL.
- 2026-10-22: sửa CHECK NULL logic trong `workout_sets_completion_check` theo phê duyệt riêng; rà tĩnh CHECKs, thứ tự migration, RLS và grants. Không chạy SQL hoặc kết nối Cloud.

## Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-21 | Tạo bản thiết kế review thay thế proposal SQL ban đầu; giới hạn rollout đầu vào 7 bảng. | Khắc phục mâu thuẫn giữa SQL nháp với ownership/version/outbox contract và yêu cầu security-first. | Đã cập nhật thiết kế; không chạy SQL hoặc kết nối database. |
| 2026-10-21 | Chuẩn bị bốn migration file core v1 theo phê duyệt có điều kiện và đồng bộ kế hoạch test/rollback. | Tách schema theo phụ thuộc; RLS và revoke ngay khi tạo bảng, chỉ cấp SELECT sau khi policy hoàn tất. | File chưa apply, chưa kiểm thử PostgreSQL; dừng chờ phê duyệt riêng trước mọi lần thực thi. |
| 2026-10-21 | Kiểm tra readiness cho local disposable migration test và ghi kết quả test groups. | Bảo đảm không apply SQL vào project/data chưa xác minh và tuân thủ cấm tự cài công cụ. | BLOCKED trước SQL: thiếu Docker/CLI/config; static inventory PASS, các database/runtime tests NOT RUN. |
| 2026-10-22 | Sửa `workout_sets_completion_check` để `is_completed = TRUE` bắt buộc `reps IS NOT NULL AND reps > 0`; ghi nhận quyết định quyền `service_role` trước mutation gateway. | PostgreSQL `CHECK` chấp nhận kết quả NULL; gateway cần quyền server được xác định riêng mà không mở DML cho client. | Chỉ sửa constraint được duyệt và tài liệu; rà tĩnh CHECK/RLS/grants/migration order. Không chạy SQL, không kết nối Supabase; PostgreSQL syntax/runtime vẫn chưa xác minh. |
