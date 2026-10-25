# Supabase PostgreSQL Schema Module

## Mục đích

Ghi nhận thiết kế, trạng thái triển khai và kế hoạch kiểm thử PostgreSQL cho đồng bộ dữ liệu Gym Workout với SQLite. Bốn migration core v1 đã được chạy thủ công trên Supabase Cloud project `gym-workout` theo báo cáo của người dùng ngày 2026-10-22. Kết quả Cloud này chưa được kiểm chứng độc lập trong phiên làm việc; việc áp dụng không đồng nghĩa đã hoàn tất kiểm thử bảo mật, kiểm thử hành vi RLS hoặc T13 trên local disposable.

## Kiến trúc/Cấu trúc

- `data-offline.md`: hợp đồng dữ liệu PostgreSQL–SQLite, ownership, sync, RLS và preflight.
- `risks-decisions.md`: quyết định đã thống nhất và blocker trước triển khai.
- Phase đầu chỉ có bảy bảng nghiệp vụ: `users`, `exercises`, `workout_plans`, `plan_exercises`, `workout_sessions`, `session_exercises`, `workout_sets`.
- PostgreSQL là server authority cho `version`, `created_at`, `updated_at`, conflict và idempotency. SQLite giữ dữ liệu offline cùng `sync_outbox` local-only.
- Bốn file migration được scaffold bằng Supabase CLI và đã được người dùng báo cáo là chạy thủ công trên Supabase Cloud theo thứ tự. Chưa có kiểm chứng PostgreSQL độc lập trong phiên này. Không tạo config, RPC/gateway, receipt table, seed hay Auth integration.

## Trạng thái triển khai Cloud — theo xác nhận của người dùng (2026-10-22)

Người dùng xác nhận đã chạy lần lượt bốn file trong Supabase SQL Editor của project `gym-workout`; mỗi file trả về `Success. No rows returned`:

1. `20261021112229_core_parent_tables.sql` — SUCCESS.
2. `20261021112241_core_child_tables.sql` — SUCCESS.
3. `20261021112248_core_indexes.sql` — SUCCESS.
4. `20261021112254_core_read_policies.sql` — SUCCESS.

Theo kết quả Table Editor và truy vấn `pg_class`/`pg_policy` do người dùng thực hiện: schema `public` có đủ 7 bảng; cả 7 bảng bật RLS; mỗi bảng có đúng 1 policy và cả 7 policy là SELECT (`polcmd = 'r'`).

Người dùng cũng đã kiểm tra quyền bảng trên đủ 7 bảng × 3 vai trò (21 dòng kết quả):

| Vai trò | SELECT | INSERT | UPDATE | DELETE |
|---|---:|---:|---:|---:|
| `anon` | false | false | false | false |
| `authenticated` | true | false | false | false |
| `service_role` | false | false | false | false |

Phạm vi này hoàn tất kiểm tra được báo cáo cho bốn quyền trên bảng và ba vai trò nêu trên. Kết quả chưa xác nhận `USAGE` trên schema, thuộc tính role như `BYPASSRLS`, `pg_default_acl`, loại privilege khác, hoặc việc request thực tế được RLS cô lập theo hàng. Các quan sát trong mục này do người dùng cung cấp và chưa được kiểm chứng độc lập trong phiên này.

Theo kết quả được báo cáo, quyền bảng của `service_role` hiện bị thu hồi trên cả bảy bảng. Trước khi triển khai mutation gateway, cần quyết định và review quyền tối thiểu cho executor/service role tin cậy cùng ranh giới RLS/role; không mặc định khôi phục DML rộng cho `service_role` và tuyệt đối không đưa secret service-role vào ứng dụng mobile.

Không có SQL nào được chạy, không kết nối/sửa Supabase Cloud, không thay đổi migration hoặc source code trong lần cập nhật tài liệu này. Kết quả local migration test ngày 2026-10-21 dưới đây vẫn BLOCKED và T13 vẫn chưa hoàn tất; việc triển khai thủ công trên Cloud không thay thế bài kiểm thử local disposable hoặc migration-history reconciliation.

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

Các tên migration dưới đây được Supabase CLI sinh. Bốn file đã được áp dụng thủ công trên Cloud theo xác nhận nêu trên; đối chiếu lịch sử migration thủ công với Supabase CLI vẫn còn phải thực hiện trước khi dùng CLI cho migration tiếp theo. Readiness review cho các lần thực thi tương lai vẫn cần xác minh CLI/version/workflow, project/environment, migration history, migration role, Data API exposure, grants và `pg_default_acl`, cùng phê duyệt riêng.

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

### Các kiểm tra còn lại và thứ tự tiếp theo an toàn

Các mục sau chưa được xác minh bởi kết quả triển khai cấu trúc:

- **GRANT trên bảng — hoàn thành theo báo cáo người dùng:** 21 kết quả cho 7 bảng và `anon`, `authenticated`, `service_role` khớp bảng quyền ở trên. Phạm vi này không bao gồm `PUBLIC`, schema `USAGE`, role attributes, `pg_default_acl` hoặc loại privilege khác; các mục đó cần kiểm tra riêng bằng catalog chỉ đọc nếu cần.
- **RLS hai tài khoản — chưa kiểm thử:** dùng tài khoản thử nghiệm riêng A/B và request SELECT-only để kiểm tra mỗi tài khoản chỉ thấy dữ liệu của mình, bao gồm tombstone. Ghi nhận kết quả allow/deny riêng. Không suy ra isolation chỉ từ việc có 7 SELECT policies.
- **Constraints và foreign keys:** truy vấn catalog chỉ đọc để lập danh sách constraints/FKs thực tế; kiểm thử từ chối dữ liệu sai/cross-owner cần negative writes và chỉ thực hiện sau này trên local disposable với fixtures giả lập, không trên Cloud đang dùng.
- **Phân quyền ghi:** trước hết kiểm tra privilege catalog chỉ đọc; không thử INSERT/UPDATE/DELETE trên Cloud. Kiểm chứng hành vi từ chối ghi trong môi trường disposable được xác nhận an toàn.
- **Mutation gateway và `service_role`:** chưa có thiết kế được duyệt. Chốt trust boundary, RPC hay server-side gateway, quyền tối thiểu của executor/service role, RLS/`SECURITY DEFINER`, receipts/versioning và `EXECUTE` trước khi thiết kế triển khai; không cấp DML trực tiếp cho app.
- **Migration history:** các file được chạy thủ công chưa được đối chiếu với migration history của Supabase CLI. Trước khi dùng CLI, chỉ đọc lịch sử/version trên Cloud và trạng thái local, lập phương án đồng bộ không chạy lại hoặc reset database; dừng nếu có lệch.

**Kế hoạch RLS hai tài khoản — đơn giản, an toàn cho người mới, không ghi lên Cloud:**

1. Nhờ chủ dự án chuẩn bị hai tài khoản thử nghiệm tạm thời A/B và xác nhận có ít nhất một bản ghi thử vô hại do mỗi tài khoản sở hữu trong các bảng cần kiểm tra. Không dùng dữ liệu tập luyện cá nhân/production. Nếu chưa có fixture, dừng và chỉ chuẩn bị trên môi trường disposable đã xác minh; theo GRANT hiện tại client không thể tự tạo fixture.
2. Mở hai phiên trình duyệt riêng tư (hoặc hai phiên ứng dụng tách biệt), đăng nhập A ở phiên thứ nhất và B ở phiên thứ hai. Không chia sẻ mật khẩu/token giữa hai phiên.
3. Từ client đã xác thực bằng session thông thường của từng tài khoản, đọc cùng các bảng liên quan (gồm bảng con và tombstone nếu có). Không dùng SQL Editor/Table Editor để kết luận row visibility vì role dashboard đặc quyền có thể không đại diện JWT người dùng.
4. Ghi expected/observed riêng: A thấy hàng của A nhưng không thấy B; B thấy hàng của B nhưng không thấy A; tombstone chỉ hiện với owner. Nếu không có fixture hoặc client request an toàn, đánh dấu BLOCKED — kết quả rỗng không chứng minh isolation.
5. Không thử INSERT/UPDATE/DELETE trên Cloud. Để các bài kiểm tra hành vi ghi cho local disposable được duyệt. Đăng xuất và chỉ xóa tài khoản/fixture thử nghiệm qua quy trình cleanup đã được duyệt.

**Bước tiếp theo đề xuất:** (1) chạy kế hoạch SELECT-only A/B ở trên với tài khoản/fixtures thử nghiệm đã chuẩn bị; (2) nếu cần, hoàn tất review chỉ đọc về `PUBLIC`, schema `USAGE`, role attributes, `pg_default_acl`, privilege khác và migration history; (3) dùng local disposable riêng để thử constraints/FKs và từ chối ghi; (4) sau đó mới duyệt thiết kế gateway/`service_role`. Không chạy các bước này trong cập nhật tài liệu hiện tại.

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

1. Migration trên local disposable: fresh database, thứ tự phụ thuộc, constraints, transaction rollback/failure injection, không có table ngoài 7 core trong rollout đầu. T13 vẫn chưa hoàn thành.
2. Grants và RLS độc lập: quyền table-level SELECT/INSERT/UPDATE/DELETE của `anon`, `authenticated`, `service_role` đã được người dùng báo cáo và ghi ở trên; role attributes/schema/default ACL rộng hơn còn cần xem xét. Kiểm tra Postgres role `anon` bị từ chối; anonymous Auth JWT (`is_anonymous=true`) cũng bị RLS từ chối; A không đọc/sửa dữ liệu B; tombstone chỉ owner đọc; system catalog chỉ read permanent authenticated users; mọi direct client DML/hard-delete bị từ chối. Báo cáo hiện tại chưa xác minh hành vi runtime/row isolation.
3. Ownership: forged `user_id`, owner change, child trỏ parent khác owner, session trỏ plan khác owner, plan/session exercise nguồn user khác, system exercise create/update/delete từ client.
4. Version/receipt trong phase riêng: base-version race, duplicate cùng payload, reuse mutation ID với payload khác, timeout sau commit, conflict replay, rollback và retention.
5. FK/purge: plan/session/exercise retention behavior; snapshot còn nguyên; mọi hard purge qua quy trình tin cậy và theo thứ tự.
6. Security review: role attributes (`BYPASSRLS`, ownership), RLS coverage, Data API exposure, schema/table/function privileges, default ACL, function `EXECUTE`, `search_path`, Security Definer owner; advisors.

Các kiểm tra dữ liệu ghi/negative-write, kiểm thử constraints/FKs theo hành vi và direct DML deny chỉ chạy trên local disposable đã xác minh, không trên Cloud. RLS A/B trước mắt ưu tiên request SELECT-only với tài khoản thử nghiệm.

## Lịch sử phát triển

- Phase 3.T07–T11: thiết kế hợp đồng PostgreSQL–SQLite, ownership, RLS, grants, indexes, migrations và test matrix; chưa triển khai.
- 2026-10-21: review lại bản SQL Supabase ban đầu và tách core schema khỏi receipts/gateway chưa được duyệt.
- 2026-10-21: tạo bốn migration file cho bảy bảng core, constraints, indexes và read-only RLS/grants; chưa áp dụng hoặc kiểm thử với PostgreSQL.
- 2026-10-21: preflight local migration test bị BLOCKED vì thiếu Docker, Supabase CLI và `config.toml`; chỉ hoàn tất static inventory check, không chạy SQL.
- 2026-10-22: sửa CHECK NULL logic trong `workout_sets_completion_check` theo phê duyệt riêng; rà tĩnh CHECKs, thứ tự migration, RLS và grants. Không chạy SQL hoặc kết nối Cloud.
- 2026-10-22: ghi nhận người dùng đã chạy thủ công cả bốn migration trên Supabase Cloud `gym-workout`; người dùng xác nhận 7 bảng, RLS bật trên cả 7 và mỗi bảng có một SELECT policy. Tại thời điểm ghi mục này, quyền bảng, A/B isolation, constraints/FKs, phân quyền ghi, gateway/service_role và CLI migration history còn mở; trạng thái kiểm tra quyền bảng được cập nhật ở mục nhật ký tiếp theo. T13 local vẫn chưa hoàn tất.
- 2026-10-22: ghi nhận kiểm tra quyền bảng do người dùng cung cấp cho 7 bảng × 3 vai trò: `anon` và `service_role` không có SELECT/INSERT/UPDATE/DELETE; `authenticated` chỉ có SELECT. Đánh dấu hoàn tất kiểm tra GRANT table-level trong phạm vi này; schema privileges, role attributes/default ACL và RLS runtime vẫn chưa được xác minh. Bổ sung kế hoạch A/B SELECT-only và yêu cầu quyết định riêng quyền `service_role` trước mutation gateway.

## Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-21 | Tạo bản thiết kế review thay thế proposal SQL ban đầu; giới hạn rollout đầu vào 7 bảng. | Khắc phục mâu thuẫn giữa SQL nháp với ownership/version/outbox contract và yêu cầu security-first. | Đã cập nhật thiết kế; không chạy SQL hoặc kết nối database. |
| 2026-10-21 | Chuẩn bị bốn migration file core v1 theo phê duyệt có điều kiện và đồng bộ kế hoạch test/rollback. | Tách schema theo phụ thuộc; RLS và revoke ngay khi tạo bảng, chỉ cấp SELECT sau khi policy hoàn tất. | File chưa apply, chưa kiểm thử PostgreSQL; dừng chờ phê duyệt riêng trước mọi lần thực thi. |
| 2026-10-21 | Kiểm tra readiness cho local disposable migration test và ghi kết quả test groups. | Bảo đảm không apply SQL vào project/data chưa xác minh và tuân thủ cấm tự cài công cụ. | BLOCKED trước SQL: thiếu Docker/CLI/config; static inventory PASS, các database/runtime tests NOT RUN. |
| 2026-10-22 | Sửa `workout_sets_completion_check` để `is_completed = TRUE` bắt buộc `reps IS NOT NULL AND reps > 0`; ghi nhận quyết định quyền `service_role` trước mutation gateway. | PostgreSQL `CHECK` chấp nhận kết quả NULL; gateway cần quyền server được xác định riêng mà không mở DML cho client. | Chỉ sửa constraint được duyệt và tài liệu; rà tĩnh CHECK/RLS/grants/migration order. Không chạy SQL, không kết nối Supabase; PostgreSQL syntax/runtime vẫn chưa xác minh. |
| 2026-10-22 | Cập nhật trạng thái triển khai Cloud theo kết quả người dùng cung cấp và xác định các kiểm thử còn lại. | Phân biệt áp dụng schema/RLS cấu trúc với kiểm thử quyền và hiệu lực bảo mật; giữ T13 đúng phạm vi local disposable. | Ghi nhận 4 migration thành công, 7 bảng, 7 RLS-enabled và 7 SELECT policies theo xác nhận; không chạy SQL/kết nối Cloud/sửa migration hoặc source. Bổ sung kế hoạch ưu tiên kiểm tra chỉ đọc. |
| 2026-10-22 | Ghi nhận kết quả GRANT bảng và cập nhật kế hoạch kiểm thử RLS hai tài khoản. | Hoàn tất đúng phạm vi quyền bảng đã kiểm tra, giữ T13/toàn bộ RLS test chưa hoàn thành, đề xuất cách kiểm thử SELECT-only an toàn. | Ghi nhận 21 kết quả: `anon` và `service_role` không có SELECT/INSERT/UPDATE/DELETE; `authenticated` chỉ có SELECT. Nêu rõ `service_role` đang bị thu hồi quyền bảng core và cần quyết định trước gateway. Không chạy SQL/kết nối Cloud/sửa migration hoặc source. |

---

## Tác động và đề xuất schema mở rộng — Multi-Tenant Gym Management (2026-10-23)

> **Trạng thái: ĐÃ TẠO FILE MIGRATION THỰC TẾ GM-1 (`20261025150000_gm1_tenant_branch_staff.sql`) — SẴN SÀNG TRIỂN KHAI LOCAL/CLOUD THEO GATE P0.T08.** Phần này ghi nhận đặc tả kỹ thuật chi tiết nhóm bảng GM-1 phục vụ Gate P0.T08. Không thay đổi 7 bảng core hiện tại và không chạy SQL trên database Cloud/Local.

### Nguyên tắc bất biến

- 7 bảng core (`users`, `exercises`, `workout_plans`, `plan_exercises`, `workout_sessions`, `session_exercises`, `workout_sets`) **không bị thay đổi**.
- Schema mở rộng hoàn toàn là additive-only; không ALTER hoặc DROP bất kỳ bảng/cột cũ nào.
- Mọi bảng mới phải bật RLS ngay khi tạo (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).
- Mặc định thu hồi toàn bộ DML từ client (`REVOKE ALL ON ... FROM anon, authenticated;`). Mọi thao tác ghi phải thông qua Mutation Gateway (Edge Functions + RPC).
- Workout ownership vẫn thuộc `user_id` cá nhân; không đổi sang `gym_id`.

---

### Đề xuất schema DDL chi tiết nhóm GM-1 (Chuẩn bị cho P0.T08)

> **Nguyên tắc thiết kế tối thượng:** Mọi bảng khi tạo mới trong migration file đều được thực thi trong một **Atomic Transaction** (`BEGIN; ... COMMIT;`). Lệnh `ENABLE ROW LEVEL SECURITY` và `REVOKE ALL` được chạy **NGAY LẬP TỨC** sau lệnh `CREATE TABLE` trong cùng một transaction. Bảng ở trạng thái **Fail-Closed mặc định** từ microsecond đầu tiên; không bao giờ để hở khoảng trống thời gian không có RLS hoặc còn quyền mặc định của `PUBLIC`/`anon`/`authenticated`.

#### 1. Bảng `gyms` (Tenant gốc)
```sql
CREATE TABLE public.gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Kích hoạt RLS và thu hồi quyền mặc định NGAY KHI TẠO BẢNG (Fail-Closed Default)
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.gyms FROM anon, authenticated;

-- Index tra cứu owner và slug
CREATE INDEX gyms_owner_id_idx ON public.gyms (owner_id);
CREATE INDEX gyms_status_idx ON public.gyms (status);
```

#### 2. Bảng `branches` (Chi nhánh vận hành)
```sql
CREATE TABLE public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT branches_gym_slug_unique UNIQUE (gym_id, slug),
  -- Ràng buộc phục vụ Composite Foreign Key từ gym_staff và các bảng con
  CONSTRAINT branches_id_gym_unique UNIQUE (id, gym_id)
);

-- Kích hoạt RLS và thu hồi quyền mặc định NGAY KHI TẠO BẢNG (Fail-Closed Default)
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.branches FROM anon, authenticated;

CREATE INDEX branches_gym_id_idx ON public.branches (gym_id);
CREATE INDEX branches_status_idx ON public.branches (gym_id, status);
```

#### 3. Bảng `gym_staff` (Phân quyền nhân viên & Multi-Branch)
```sql
CREATE TABLE public.gym_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE RESTRICT,
  branch_id UUID,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'receptionist', 'trainer')),
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'suspended', 'revoked')),
  invited_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  activated_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  -- Composite Foreign Key: Ngăn chặn triệt để gán chi nhánh chéo tenant (Cross-Tenant Branch Assignment)
  -- Sử dụng ON DELETE RESTRICT thay vì CASCADE để bảo vệ toàn vẹn lịch sử nhân sự và audit trail (Zero Hard Delete OD-02=A)
  CONSTRAINT fk_gym_staff_branch_gym FOREIGN KEY (branch_id, gym_id)
    REFERENCES public.branches(id, gym_id) ON DELETE RESTRICT
);

-- Kích hoạt RLS và thu hồi quyền mặc định NGAY KHI TẠO BẢNG (Fail-Closed Default)
ALTER TABLE public.gym_staff ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.gym_staff FROM anon, authenticated;

CREATE INDEX gym_staff_lookup_idx ON public.gym_staff (gym_id, user_id, status);
CREATE INDEX gym_staff_branch_idx ON public.gym_staff (branch_id);
```

---

### Phân tích Tính toàn vẹn Dữ liệu & Ngăn chặn Cross-Tenant Branch Assignment

**1. Lỗ hổng tiềm ẩn nếu chỉ dùng Single Foreign Key `REFERENCES branches(id)`:**
Nếu `gym_staff.branch_id` chỉ tham chiếu đơn lẻ đến `branches(id)`, một lỗi logic trong Gateway/RPC hoặc thao tác nhầm lẫn có thể gán `gym_id = Gym_A` nhưng `branch_id = Branch_thuộc_Gym_B`. Khi đó:
- Dữ liệu bị phân mảnh và rò rỉ chéo tenant (Cross-tenant branch assignment).
- RLS join có thể cấp quyền sai lệch cho nhân viên Gym A tại cơ sở của Gym B.

**2. Cơ chế bảo vệ của Composite Foreign Key `FOREIGN KEY (branch_id, gym_id) REFERENCES branches(id, gym_id)`:**
- Bảng `public.branches` bắt buộc có ràng buộc duy nhất trên cặp `(id, gym_id)`: `CONSTRAINT branches_id_gym_unique UNIQUE (id, gym_id)`.
- Khi `branch_id IS NOT NULL`: PostgreSQL kiểm tra cả cặp `(branch_id, gym_id)` phải tồn tại đồng thời trên cùng một dòng của bảng `branches`. Nếu `branch_id` thuộc về `gym_id` khác, cơ sở dữ liệu sẽ từ chối ngay lập tức bằng lỗi `foreign_key_violation` (mã lỗi `23503`).
- Khi `branch_id IS NULL` (quyền quản trị toàn gym): Theo chuẩn SQL (`MATCH SIMPLE` mặc định của PostgreSQL), ràng buộc foreign key cho phép một trong các cột là NULL và bỏ qua kiểm tra dòng con đó; trong khi đó tính toàn vẹn của `gym_id` vẫn được bảo đảm độc lập nhờ `gym_staff.gym_id REFERENCES public.gyms(id)`.

**3. Tại sao chọn `ON DELETE RESTRICT` và chiến lược Soft-Deactivation cho Branch:**
- *Rủi ro của `ON DELETE CASCADE`:* Nếu dùng CASCADE, khi xóa một chi nhánh, toàn bộ phân công nhân viên, lịch sử công tác, và audit trail tại chi nhánh đó sẽ bị xóa sạch khỏi database mà không có khả năng truy vết đối soát tài chính hoặc điều tra vi phạm.
- *Nguyên tắc bảo vệ Audit Trail:* Đổi khóa ngoại sang `ON DELETE RESTRICT`. Database từ chối xóa vật lý bất kỳ branch nào nếu đang có bản ghi nhân viên (`gym_staff`), hội viên (`gym_members`), hoặc nhật ký giao dịch liên kết.
- *Vận hành thực tế (Soft-Deactivation):* Các chi nhánh ngừng hoạt động sẽ được chuyển trạng thái mềm `status = 'archived'` (hoặc `status = 'suspended'` nếu tạm đóng cửa bảo trì) thay vì xóa vật lý. Mô hình `status TEXT CHECK (status IN ('active', 'suspended', 'archived'))` đạt tính nhất quán 100% với `gyms.status` và các bảng khác trong hệ thống, vừa bảo toàn 100% dữ liệu lịch sử/audit, vừa phân biệt rõ giữa tạm ngừng hoạt động và giải thể vĩnh viễn, ngăn chặn các tác vụ nghiệp vụ mới (check-in, phân công nhân sự, bán gói tập) tại chi nhánh đó.

---

### Giải pháp kỹ thuật Uniqueness & Phân tích Coexistence (Toàn Gym vs. Chi nhánh)

#### 1. Hai Partial Unique Indexes
Theo chuẩn SQL, `NULL != NULL`. Do đó, một ràng buộc `UNIQUE (gym_id, branch_id, user_id)` thông thường trong PostgreSQL sẽ **không ngăn chặn được việc tạo trùng bản ghi** khi `branch_id IS NULL` (mỗi NULL được coi là một giá trị phân biệt).

Kiến trúc GM-1 sử dụng hai **Partial Unique Indexes** bổ trợ nhau:

1. **Quyền toàn Gym (`branch_id IS NULL`):**
   ```sql
   -- Đảm bảo mỗi user chỉ có duy nhất 1 bản ghi quyền toàn gym active (Owner hoặc General Manager)
   CREATE UNIQUE INDEX gym_staff_gym_user_null_branch_idx
   ON public.gym_staff (gym_id, user_id)
   WHERE branch_id IS NULL AND status = 'active';
   ```
2. **Quyền Chi nhánh cụ thể (`branch_id IS NOT NULL`):**
   ```sql
   -- Đảm bảo trong một chi nhánh, mỗi user chỉ có duy nhất 1 vai trò active được phân công
   CREATE UNIQUE INDEX gym_staff_gym_branch_user_idx
   ON public.gym_staff (gym_id, branch_id, user_id)
   WHERE branch_id IS NOT NULL AND status = 'active';
   ```

#### 2. Phân tích trường hợp nhân viên đồng thời có quyền toàn gym và quyền chi nhánh (Coexistence vs. Mutual Exclusivity)

- **Trường hợp xảy ra:** Một user có đồng thời 2 dòng trong `gym_staff`:
  - Dòng 1: `(gym_id, user_id, role='manager', branch_id=NULL, status='active')` (General Manager toàn gym).
  - Dòng 2: `(gym_id, user_id, role='trainer', branch_id=Branch_A, status='active')` (Huấn luyện viên tại Chi nhánh A).
- **Hành vi RLS:**
  Hàm helper `is_active_staff(gym_id, branch_id)` kiểm tra điều kiện `s.branch_id IS NULL OR s.branch_id = check_branch_id`. Khi user đã có dòng toàn gym `active`, điều kiện này **luôn thỏa mãn** cho bất kỳ chi nhánh nào trong gym. Quyền toàn gym (Global Role) bao trùm và có độ ưu tiên cao nhất.
- **Rủi ro xung đột nghiệp vụ & Bảo mật:**
  1. *Xung đột trạng thái đình chỉ:* Nếu nhân viên bị đình chỉ tại Chi nhánh A (`status = 'suspended'`) nhưng dòng toàn gym vẫn `active`, nhân viên đó vẫn truy cập được Chi nhánh A thông qua quyền toàn gym!
  2. *Mâu thuẫn vai trò:* Hệ thống UI/Audit sẽ ghi nhận vai trò nào khi người đó check-in hội viên tại Chi nhánh A?
- **Khuyến nghị kiến trúc chuẩn hóa (Enforce Mutual Exclusivity tại RPC Gateway - OD-02=A):**
  - **Quy tắc phân quyền:** Trong một gym, một user chỉ nên ở một trong hai trạng thái: hoặc là **Nhân sự cấp Gym** (`branch_id IS NULL`, role Owner/General Manager), hoặc là **Nhân sự cấp Chi nhánh** (`branch_id IS NOT NULL`, role Branch Manager/Receptionist/Trainer).
  - **Thực thi tại RPC Gateway (`fn_gm_assign_staff`):**
    - Khi cấp quyền toàn gym (`branch_id IS NULL`), hệ thống tự động xóa hoặc nâng cấp toàn bộ các dòng chi nhánh lẻ của user đó trong gym.
    - Khi gán quyền chi nhánh cụ thể, hệ thống kiểm tra và từ chối nếu user đang giữ dòng toàn gym `active`.
  - **Trường hợp ngoại lệ cho phép đồng thời (Coexistence):**
    Nếu nghiệp vụ chấp nhận một nhân sự kiêm nhiệm, RLS helper function và logic nghiệp vụ bắt buộc tuân theo:
    - *Quyền toàn gym có độ ưu tiên cao hơn (Global overrides Branch).*
    - *Đình chỉ toàn gym (`branch_id IS NULL, status = 'suspended'`) sẽ lập tức vô hiệu hóa quyền của user trên toàn bộ các chi nhánh.*

---

### Đặc tả RLS Fail-Closed & Helper Functions cho GM-1

#### 1. RLS Helper Functions (STABLE, SECURITY DEFINER, Search Path Pinned)

Để tối ưu hiệu năng và tránh lặp lại subqueries phức tạp trong RLS policies, các hàm helper được chuẩn hóa nghiêm ngặt:

```sql
-- 1. Kiểm tra user hiện tại có phải Owner của Gym không
CREATE OR REPLACE FUNCTION public.is_gym_owner(check_gym_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT (auth.uid() IS NOT NULL)
    AND (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
    AND (
      EXISTS (
        SELECT 1 FROM public.gyms
        WHERE id = check_gym_id
          AND owner_id = auth.uid()
          AND status = 'active'
      ) OR EXISTS (
        SELECT 1 FROM public.gym_staff
        WHERE gym_id = check_gym_id
          AND user_id = auth.uid()
          AND role = 'owner'
          AND status = 'active'
          AND branch_id IS NULL
      )
    );
$$;

-- Thu hồi quyền từ PUBLIC và chỉ cấp quyền EXECUTE cho authenticated
REVOKE ALL ON FUNCTION public.is_gym_owner(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_gym_owner(UUID) TO authenticated;

-- 2. Kiểm tra user hiện tại có phải Staff active tại Gym (và Branch nếu cung cấp, kèm role allowlist tùy chọn)
-- BẮT BUỘC KIỂM TRA ĐỒNG THỜI: gyms.status = 'active' VÀ gym_staff.status = 'active'
CREATE OR REPLACE FUNCTION public.is_active_staff(
  check_gym_id UUID,
  check_branch_id UUID DEFAULT NULL,
  allowed_roles TEXT[] DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT (auth.uid() IS NOT NULL)
    AND (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
    AND EXISTS (
      SELECT 1
      FROM public.gym_staff s
      JOIN public.gyms g ON g.id = s.gym_id
      WHERE s.gym_id = check_gym_id
        AND s.user_id = auth.uid()
        AND s.status = 'active'
        AND g.status = 'active'
        AND (
          s.branch_id IS NULL -- Quyền toàn gym
          OR check_branch_id IS NULL -- Không yêu cầu branch cụ thể, chỉ cần là staff của gym
          OR s.branch_id = check_branch_id -- Quyền đúng chi nhánh yêu cầu
        )
        AND (
          allowed_roles IS NULL -- Không lọc vai trò (bất kỳ role active nào)
          OR s.role = ANY(allowed_roles) -- Khớp vai trò nằm trong danh sách được cấp phép
        )
    );
$$;

-- Thu hồi quyền từ PUBLIC và chỉ cấp quyền EXECUTE cho authenticated
REVOKE ALL ON FUNCTION public.is_active_staff(UUID, UUID, TEXT[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_staff(UUID, UUID, TEXT[]) TO authenticated;
```

#### 2. Đánh giá An toàn RLS Helper Functions & Chống Leo thang Đặc quyền (Privilege Escalation)

| Tiêu chí | Cơ chế bảo vệ | Nguy cơ nếu không áp dụng |
|---|---|---|
| **Function Owner** | Function được sở hữu bởi `postgres` hoặc migration role hệ thống. Tuyệt đối không để `authenticated` hoặc `anon` sở hữu hàm. | Caller có thể sửa đổi định nghĩa hàm để bypass kiểm tra quyền. |
| **Search Path Hijacking** | `SET search_path = public, pg_temp`: ghim cứng search path chỉ gồm `public` và temporary schema an toàn. | Kẻ tấn công có thể tạo schema độc hại chứa bảng giả mạo `gym_staff` để chiếm quyền. |
| **Identity Injection** | Không nhận `user_id` làm tham số; hàm luôn đọc trực tiếp từ `auth.uid()`. | Caller có thể truyền UUID của Owner hoặc Admin khác để mạo danh quyền hạn. |
| **Anonymous Token Block** | Bắt buộc `(auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE`. | Anonymous JWT có thể truy vấn dữ liệu nội bộ tenant. |
| **EXECUTE Grants** | `REVOKE ALL FROM PUBLIC; GRANT EXECUTE TO authenticated;`. | Client chưa đăng nhập có thể thăm dò (probe) hàm. |
| **Trạng thái Gym Lockdown** | Hàm `is_active_staff` bắt buộc JOIN `gyms` và kiểm tra `g.status = 'active'`. | Khi phòng gym bị đình chỉ (nợ cước/vi phạm), nhân viên vẫn truy cập được dữ liệu nếu không kiểm tra trạng thái gym. |
| **Tối ưu hóa lập lịch (STABLE Optimization)** | Khai báo `STABLE`: Báo cho PostgreSQL query planner biết hàm không làm thay đổi database và trả về kết quả nhất quán trong cùng một câu lệnh với cùng tham số. Planner có thể tối ưu hóa số lần gọi khi tham số là bất biến trong câu truy vấn (query-constant). **Lưu ý:** `STABLE` không tự động loại bỏ hoàn toàn N+1 trong mọi trường hợp; việc đánh chỉ mục đúng đắn `(gym_id, user_id, status)` và phân tích `EXPLAIN ANALYZE` vẫn là bắt buộc để đảm bảo hiệu năng. | Nếu để mặc định `VOLATILE`, query planner bắt buộc phải thực thi lại hàm trên từng dòng dữ liệu duyệt qua, gây lãng phí tài nguyên CPU. |

---

### Ma trận Quyền Truy cập theo Vòng đời Trạng thái (`gyms.status` × `gym_staff.status`)

| Trạng thái Gym (`gyms.status`) | Vai trò / Trạng thái Nhân sự | Quyền truy cập Admin Web / Database | Ghi chú vận hành |
|---|---|---|---|
| **`active`** | Owner | Toàn quyền quản trị (Gym, Branches, Staff, Members, Finance) | Hoạt động bình thường |
| **`active`** | Manager (toàn gym, `active`) | Toàn quyền vận hành trên tất cả chi nhánh | General Manager |
| **`active`** | Manager (chi nhánh, `active`) | Quản lý vận hành trong phạm vi chi nhánh được gán | Branch-scoped |
| **`active`** | Receptionist / Trainer (`active`) | Thao tác tác vụ được giao tại chi nhánh được gán | Branch-scoped |
| **`active`** | Bất kỳ staff mang `suspended` | **BỊ TỪ CHỐI HOÀN TOÀN (0 quyền)** | `is_active_staff` trả về `FALSE` |
| **`active`** | Bất kỳ staff mang `invited` | **BỊ TỪ CHỐI (0 quyền)** | Chưa kích hoạt tài khoản |
| **`suspended`** (Tạm khóa/Nợ cước) | Owner | **Chỉ đọc thông tin Gym & Thanh toán Gia hạn/Khôi phục Dịch vụ** | Bị khóa toàn bộ nghiệp vụ thông thường (hội viên, check-in, chi nhánh, nhân sự) |
| **`suspended`** (Tạm khóa/Nợ cước) | Toàn bộ Staff (Manager, Rec, PT) | **BỊ KHÓA TRUY CẬP HOÀN TOÀN (LOCKED OUT)** | `is_active_staff` trả về `FALSE` do `gyms.status != 'active'` |
| **`archived`** (Đã đóng cửa) | Toàn bộ người dùng | **BỊ KHÓA HOÀN TOÀN (LOCKED OUT)** | Chỉ hỗ trợ xuất dữ liệu qua luồng backend chuyên biệt |

#### Đặc tả Cơ chế Quyền Hạn của Owner khi `gyms.status = 'suspended'`:
1. **Quyền được phép:**
   - Policy `gyms_select_policy` cho phép Owner đọc bản ghi `gyms` của mình (`owner_id = auth.uid()`) ngay cả khi `status = 'suspended'`. Nhờ đó, Owner đăng nhập Admin Web sẽ thấy màn hình thông báo tạm khóa, lý do nợ cước SaaS và số tiền cần thanh toán.
   - Endpoint / RPC gia hạn: Owner được phép gọi RPC khôi phục `fn_gm_reactivate_gym(gym_id, payment_receipt)` hoặc cổng thanh toán tích hợp để xử lý giao dịch nộp cước SaaS. Khi thanh toán thành công, trạng thái chuyển về `'active'` và quyền hạn tự động phục hồi.
2. **Khóa triệt để các quyền nghiệp vụ thông thường:**
   - Hàm `public.is_gym_owner` kiểm tra điều kiện `status = 'active'`. Do đó khi `gyms.status = 'suspended'`, hàm trả về `FALSE`.
   - Kết quả: Owner bị từ chối truy cập trên toàn bộ các bảng con (`branches`, `gym_staff`, `gym_members`, `attendance_logs`, `payments`).
   - Mọi RPC nghiệp vụ (tạo hội viên, check-in, đổi cấu hình chi nhánh, mời nhân viên) đều có guard kiểm tra `gyms.status = 'active'`, ngăn chặn mọi thao tác vận hành phòng gym khi dịch vụ chưa được gia hạn.

#### 2. Fail-Closed RLS Policies cho nhóm GM-1
```sql
-- 1. gyms: Bật RLS và chỉ cấp quyền SELECT cho Owner và Active Staff thuộc gym
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.gyms FROM anon, authenticated;
GRANT SELECT ON public.gyms TO authenticated;

CREATE POLICY gyms_select_policy ON public.gyms
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    owner_id = auth.uid()
    OR public.is_active_staff(id)
  )
);

-- 2. branches: Bật RLS và chỉ cấp quyền SELECT cho Staff active thuộc gym/branch
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.branches FROM anon, authenticated;
GRANT SELECT ON public.branches TO authenticated;

CREATE POLICY branches_select_policy ON public.branches
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    public.is_gym_owner(gym_id)
    OR public.is_active_staff(gym_id, id)
  )
);

-- 3. gym_staff: Bật RLS và phân quyền xem danh sách nhân sự
ALTER TABLE public.gym_staff ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.gym_staff FROM anon, authenticated;
GRANT SELECT ON public.gym_staff TO authenticated;

CREATE POLICY gym_staff_select_policy ON public.gym_staff
FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  AND (
    -- User tự đọc bản ghi nhân sự của chính mình
    user_id = auth.uid()
    -- Hoặc Owner đọc toàn bộ nhân sự trong gym
    OR public.is_gym_owner(gym_id)
    -- Hoặc Manager đọc nhân sự trong chi nhánh mình quản lý
    OR (
      branch_id IS NOT NULL
      AND public.is_active_staff(gym_id, branch_id)
      AND EXISTS (
        SELECT 1 FROM public.gym_staff s
        WHERE s.gym_id = gym_staff.gym_id
          AND s.user_id = auth.uid()
          AND s.role = 'manager'
          AND s.status = 'active'
          AND (s.branch_id IS NULL OR s.branch_id = gym_staff.branch_id)
      )
    )
  )
);
```

---

### Đặc tả quyền thực thi: Edge Functions, RPC, SECURITY DEFINER & Least Privilege

Hệ thống tuân thủ triệt để nguyên tắc **Least Privilege** (đặc quyền tối thiểu) và **Zero Direct Table DML** cho client:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Client (Mobile / Web)                           │
└──────────────┬──────────────────────────────────────────┬──────────────┘
               │ Query (SELECT only)                      │ Mutation (POST/CALL)
               ▼                                          ▼
┌──────────────────────────────┐          ┌──────────────────────────────┐
│     PostgreSQL Tables        │          │    Mutation Gateway          │
│   - RLS strictly enforced    │          │  - Edge Functions (Business) │
│   - Direct DML REVOKED       │          │  - RPC (ACID Transactions)   │
└──────────────────────────────┘          └──────────────┬───────────────┘
                                                         │ Secure Writes
                                                         ▼
                                          ┌──────────────────────────────┐
                                          │   PostgreSQL Core Database   │
                                          │   (SECURITY DEFINER RPCs)    │
                                          └──────────────────────────────┘
```

#### 1. Nguyên tắc phân quyền RPC Functions
- Các thao tác thay đổi dữ liệu (tạo gym, thêm branch, gán staff, đổi trạng thái) được đóng gói thành các hàm PostgreSQL RPC có tiền tố nghiệp vụ:
  - `fn_gm_create_gym(name TEXT, slug TEXT) RETURNS UUID`
  - `fn_gm_create_branch(gym_id UUID, name TEXT, slug TEXT, address TEXT, phone TEXT) RETURNS UUID`
  - `fn_gm_assign_staff(gym_id UUID, branch_id UUID, staff_user_id UUID, staff_role TEXT) RETURNS UUID`
  - `fn_gm_update_staff_status(staff_record_id UUID, new_status TEXT) RETURNS VOID`
- **Cấu hình bảo mật RPC:**
  - `SECURITY DEFINER`: Chạy với quyền của function owner để ghi dữ liệu sau khi direct DML của table đã bị revoke.
  - `SET search_path = public, pg_temp`: Ngăn chặn hoàn toàn lỗi Search Path Hijacking.
  - **Caller Verification Guard (Bắt buộc tại dòng đầu tiên của mọi RPC):**
    ```sql
    IF auth.uid() IS NULL OR (auth.jwt() ->> 'is_anonymous')::boolean IS TRUE THEN
      RAISE EXCEPTION 'Unauthorized: Caller must be an authenticated non-anonymous user'
        USING ERRCODE = '42501';
    END IF;
    ```
  - **Role & Status Verification:** RPC tự kiểm tra `public.is_gym_owner(target_gym_id)` hoặc quyền quản lý tương ứng trước khi thực hiện INSERT/UPDATE.

#### 2. Nguyên tắc phân quyền Edge Functions (Deno Runtime)
- **Mục đích:** Xử lý các logic nghiệp vụ phức tạp không nên đặt trong database:
  - Gửi email mời nhân viên qua Supabase Auth Admin API (`supabase.auth.admin.inviteUserByEmail`).
  - Xác thực payload tích hợp bên thứ ba (Webhooks, thanh toán).
  - Điều phối luồng nhiều bước (Orchestration).
- **Quyền hạn của Edge Functions:**
  - `verify_jwt: true`: Luôn xác thực JWT gửi lên từ client.
  - Tôn trọng ngữ cảnh caller: Edge Function tạo Supabase client bằng Header `Authorization` của user, đảm bảo RLS được kích hoạt.
  - Sử dụng `SUPABASE_SERVICE_ROLE_KEY` **CHỈ KHI CẦN THIẾT** cho các tác vụ admin đặc quyền (như mời user bằng email). Tuyệt đối không để lộ key này ra client và không dùng nó để bypass kiểm tra quyền phòng gym.

#### 3. Chính sách quyền hạn của `service_role`
- Tiếp tục duy trì quyết định: `service_role` không được mở DML trực tiếp từ internet.
- `service_role` chỉ được sử dụng trong backend có kiểm soát (Edge Functions server-side).

---

### Thứ tự migration dự kiến cho nhóm GM-1 và Khả năng Rollback (Chuẩn bị cho P0.T08)

#### 1. Trình tự thực thi thuận (Forward Migration Sequence — GM-1)
Quá trình áp dụng migration GM-1 được tổ chức thành các file migration tuần tự, mỗi file được thực thi trong một **Atomic Transaction** (`BEGIN; ... COMMIT;`), tuân thủ nguyên tắc **Fail-Closed mặc định từ microsecond đầu tiên**:

1. **Bước 1 — Khởi tạo bảng `gyms` (Atomic Transaction):**
   - Tạo bảng `public.gyms`, check constraints (`status IN ('active', 'suspended', 'archived')`), unique slug.
   - **Bật RLS & thu hồi quyền ngay lập tức:** `ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY; REVOKE ALL ON public.gyms FROM anon, authenticated;` (Bảng ở trạng thái đóng hoàn toàn, không thể đọc/ghi).
   - Tạo index `gyms_owner_id_idx` và `gyms_status_idx`.
2. **Bước 2 — Khởi tạo bảng `branches` (Atomic Transaction):**
   - Tạo bảng `public.branches`, check constraints, unique `(gym_id, slug)`, và ràng buộc composite unique: `CONSTRAINT branches_id_gym_unique UNIQUE (id, gym_id)`.
   - **Bật RLS & thu hồi quyền ngay lập tức:** `ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY; REVOKE ALL ON public.branches FROM anon, authenticated;`.
   - Tạo index `branches_gym_id_idx` và `branches_status_idx`.
3. **Bước 3 — Khởi tạo bảng `gym_staff` (Atomic Transaction):**
   - Tạo bảng `public.gym_staff`, role/status check constraints.
   - Tạo Composite Foreign Key với quy tắc bảo vệ audit trail: `CONSTRAINT fk_gym_staff_branch_gym FOREIGN KEY (branch_id, gym_id) REFERENCES public.branches(id, gym_id) ON DELETE RESTRICT`.
   - Tạo 2 Partial Unique Indexes: `gym_staff_gym_user_null_branch_idx` (cho `branch_id IS NULL`) và `gym_staff_gym_branch_user_idx` (cho `branch_id IS NOT NULL`).
   - **Bật RLS & thu hồi quyền ngay lập tức:** `ALTER TABLE public.gym_staff ENABLE ROW LEVEL SECURITY; REVOKE ALL ON public.gym_staff FROM anon, authenticated;`.
   - Tạo lookup index `gym_staff_lookup_idx`.
4. **Bước 4 — Khởi tạo RLS Helper Functions & EXECUTE Grants (Atomic Transaction):**
   - Tạo các hàm `is_gym_owner` và `is_active_staff` với thuộc tính `STABLE`, `SECURITY DEFINER`, `SET search_path = public, pg_temp;`.
   - Thu hồi quyền: `REVOKE ALL ON FUNCTION ... FROM PUBLIC;`.
   - Cấp quyền hạn hẹp: `GRANT EXECUTE ON FUNCTION ... TO authenticated;`.
5. **Bước 5 — Cài đặt RLS Policies & Cấp Quyền Đọc (Atomic Transaction):**
   - Cài đặt các chính sách SELECT: `gyms_select_policy`, `branches_select_policy`, `gym_staff_select_policy`.
   - Cấp duy nhất quyền đọc: `GRANT SELECT ON public.gyms, public.branches, public.gym_staff TO authenticated;`.
   - *Ghi chú:* Toàn bộ DML (INSERT/UPDATE/DELETE) vẫn bị thu hồi 100%, chỉ có thể ghi qua Mutation Gateway RPC.

#### 2. Kịch bản khôi phục và Khả năng Rollback (Rollback Strategy)
Rollback phải thực hiện theo **thứ tự nghịch đảo hoàn toàn** (Reverse Order) để tôn trọng ràng buộc khóa ngoại và phụ thuộc hàm:

```sql
-- Kịch bản Rollback GM-1 (Chạy trong Atomic Transaction khi test Local/Staging gặp sự cố):
BEGIN;

-- 1. Thu hồi quyền đọc bảng
REVOKE SELECT ON public.gyms, public.branches, public.gym_staff FROM authenticated;

-- 2. Xóa các chính sách RLS
DROP POLICY IF EXISTS gym_staff_select_policy ON public.gym_staff;
DROP POLICY IF EXISTS branches_select_policy ON public.branches;
DROP POLICY IF EXISTS gyms_select_policy ON public.gyms;

-- 3. Xóa các RLS Helper Functions
DROP FUNCTION IF EXISTS public.is_active_staff(UUID, UUID, TEXT[]);
DROP FUNCTION IF EXISTS public.is_gym_owner(UUID);

-- 4. Xóa các bảng theo thứ tự quan hệ phụ thuộc (Child -> Parent)
DROP TABLE IF EXISTS public.gym_staff CASCADE;
DROP TABLE IF EXISTS public.branches CASCADE;
DROP TABLE IF EXISTS public.gyms CASCADE;

COMMIT;
```

**Nguyên tắc triển khai an toàn:**
- Môi trường Production tuân thủ tuyệt đối nguyên tắc **Forward-Fix** (không chạy rollback xóa bảng phá hủy dữ liệu một khi đã có giao dịch thật).
- Kịch bản Rollback trên được kiểm thử tự động trên môi trường Local Disposable và Staging trước khi bất kỳ lệnh migration nào được cấp phép chạy trên Production.

---

## Thiết kế Multi-Tenancy, RBAC & Permission Matrix (Hợp nhất từ multi-tenancy.md)

### 1. Mô hình Tenant & Cô lập Dữ liệu
- **Gym (Tenant cấp cao nhất):** Mỗi phòng gym là một tenant độc lập; dữ liệu bị cô lập hoàn toàn giữa các gym qua `gym_id`.
- **Branch (Đơn vị vận hành):** Mỗi gym có một hoặc nhiều chi nhánh (`branches`); nhân viên và hội viên có thể được phân công theo chi nhánh.
- **Owner (Chủ sở hữu gym):** Quản trị toàn bộ gym; không nhất thiết gắn với chi nhánh cụ thể.
- **Người dùng đa tenant:** Một tài khoản `auth.users` có thể đóng nhiều vai trò tại các gym khác nhau (Member tại Gym A, Trainer tại Gym B, Owner tại Gym C). Bảng `gym_staff` và `gym_members` dùng `gym_id` để phân biệt. Không dùng `user_metadata` cho quyết định phân quyền.

### 2. Các Vai trò trong Hệ thống (RBAC Roles)
- `owner`: Sở hữu phòng gym; toàn quyền quản trị gym, tài chính và phân quyền.
- `manager`: Quản lý vận hành toàn gym hoặc một/nhiều chi nhánh cụ thể.
- `receptionist`: Tiếp tân phụ trách check-in, quản lý hội viên cơ bản và thu phí tại chi nhánh.
- `trainer`: Huấn luyện viên phụ trách lịch PT và buổi tập của hội viên được phân công.
- `member`: Hội viên sử dụng ứng dụng di động; chỉ truy cập dữ liệu của chính mình.

### 3. Ma trận Phân quyền Toàn diện (RBAC Permission Matrix)
*Ký hiệu: ✅ Được phép, ❌ Không được phép, 🔐 Chỉ dữ liệu của mình/được giao, 🔶 Giới hạn theo chi nhánh phân công.*

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

#### Membership & Attendance
| Nghiệp vụ | Owner | Manager | Receptionist | Trainer | Member |
|---|---|---|---|---|---|
| Tạo danh mục gói tập | ✅ | ✅ | ❌ | ❌ | ❌ |
| Đăng ký gói cho hội viên | ✅ | ✅ | ✅ | ❌ | ❌ |
| Gia hạn gói | ✅ | ✅ | ✅ | ❌ | ❌ |
| Tạm dừng/hủy gói | ✅ | ✅ | ❌ | ❌ | ❌ |
| Xem gói của mình | ✅ | ✅ | ✅ | ✅ | ✅ |
| Check-in thủ công tại quầy | ✅ | ✅ | ✅ | ❌ | ❌ |
| Xem lịch check-in | ✅ | 🔶 | 🔶 | ❌ | 🔐 |
| Check-in bằng QR (Phase sau) | — | — | ✅ | — | 🔐 |

#### Payments & Finances
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

### 4. Ma trận Trạng thái Gym & Nhân viên (Lifecycle State Access)
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

### Lộ trình migration tổng thể cho gym management

| Nhóm | Nội dung | Trạng thái | Điều kiện tiên quyết |
|---|---|---|---|
| **GM-1** | `gyms`, `branches`, `gym_staff`, composite FK (RESTRICT), partial indexes, helper functions & RLS | **Đã tạo migration file** (`20261025150000_gm1_tenant_branch_staff.sql`) | Hoàn thành Gate P0.T08 |
| **GM-2** | `gym_members` & member linking flow | Thiết kế tổng quan | Sau khi GM-1 sẵn sàng |
| **GM-3** | `membership_plans`, `memberships` | Thiết kế tổng quan | Sau GM-2 |
| **GM-4** | `attendance_logs` | Thiết kế tổng quan | Sau GM-3 |
| **GM-5** | `payment_transactions` & idempotency | Thiết kế tổng quan | Sau GM-3 & chốt OD-05 |
| **GM-6** | RPC Mutation Gateway & Edge Functions hoàn chỉnh | Thiết kế tổng quan | Cùng nhịp với các nhóm bảng tương ứng |

> **Cam kết an toàn:** Migration GM-1 được tạo sẵn dưới dạng file migration SQL độc lập (`supabase/migrations/20261025150000_gm1_tenant_branch_staff.sql`), tuân thủ Zero Hard Delete `OD-02=A` và Fail-Closed. Tuyệt đối không tự ý áp dụng hay kết nối Supabase Cloud khi chưa có phê duyệt runtime.

---

### Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-21 | Tạo bản thiết kế review thay thế proposal SQL ban đầu; giới hạn rollout đầu vào 7 bảng. | Khắc phục mâu thuẫn giữa SQL nháp với ownership/version/outbox contract. | Cập nhật thiết kế; không chạy SQL. |
| 2026-10-22 | Sửa constraint và ghi nhận trạng thái kiểm tra bảng Cloud. | Đồng bộ tiến độ kiểm thử bảng core. | 7 bảng core đạt kiểm tra table-level grant. |
| 2026-10-23 | Final Pre-Approval Verification: Chuẩn hóa schema `branches.status TEXT CHECK (status IN ('active', 'suspended', 'archived'))` thay cho `is_active BOOLEAN`; đồng bộ index `branches_status_idx`; làm rõ cơ chế soft-deactivation chuyển trạng thái `archived`. | Đạt tính nhất quán 100% giữa các bảng tenant, branch và staff trước khi phê duyệt P0.T08. | Schema GM-1 nhất quán hoàn toàn. |
| 2026-10-25 | Hoàn tất migration file GM-1 (`20261025150000_gm1_tenant_branch_staff.sql`), chuẩn hóa `ON DELETE RESTRICT` (`OD-02=A`), status `'revoked'`, cột `revoked_at`/`revoked_by`, 2 partial unique indexes `WHERE status = 'active'`, helper function `is_active_staff` hỗ trợ `allowed_roles TEXT[]`. | Đóng Gate P0.T08 theo chỉ đạo Owner. | Đã tạo migration file GM-1, RLS fail-closed, sẵn sàng triển khai. |
| 2026-10-23 | Đề xuất schema mở rộng cho Phase II Multi-Tenant Gym Management. | Khởi tạo phân kỳ roadmap mới. | Tài liệu thiết kế mức đặc tả. |
| 2026-10-23 | Chi tiết hóa schema GM-1, partial unique indexes giải quyết uniqueness multi-branch, RLS helper functions, và phân quyền Edge Functions/RPC least privilege. | Chuẩn bị phê duyệt P0.T07 và chốt thiết kế GM-1 cho P0.T08 theo chỉ đạo chủ dự án. | Hoàn thiện đặc tả kỹ thuật chi tiết GM-1; không tạo migration file hay chạy SQL. |
| 2026-10-23 | Final GM-1 Schema Security Review: Bổ sung Composite Foreign Key `(branch_id, gym_id)` chống cross-tenant branch assignment; phân tích coexistence và mutual exclusivity; kiểm tra `gyms.status = 'active'` trong `is_active_staff`; ma trận trạng thái vòng đời gym; quy định rõ thứ tự migration 5 bước và kịch bản rollback nghịch đảo. | Đảm bảo tính toàn vẹn dữ liệu và an toàn bảo mật tuyệt đối trước phê duyệt P0.T08. | Tài liệu thiết kế GM-1 hoàn thiện; sẵn sàng cho Gate P0.T08. |
| 2026-10-23 | Final Security Corrections Before Approval: Bật RLS và thu hồi quyền ngay khi tạo bảng trong Atomic Transactions; đổi composite FK `gym_staff → branches` sang `ON DELETE RESTRICT` và đề xuất soft-deactivation; làm rõ quyền Owner khi gym suspended (chỉ đọc trạng thái/gia hạn); hiệu chỉnh mô tả `STABLE` chính xác theo PostgreSQL optimizer. | Hoàn thiện tuyệt đối các nguyên tắc an toàn dữ liệu và fail-closed trước khi trình duyệt P0.T08. | Tài liệu chuẩn xác 100%; sẵn sàng phê duyệt. |
| 2026-10-23 | Final Pre-Approval Verification: Chuẩn hóa schema `branches.status TEXT CHECK (status IN ('active', 'suspended', 'archived'))` thay cho `is_active BOOLEAN`; đồng bộ index `branches_status_idx`; làm rõ cơ chế soft-deactivation chuyển trạng thái `archived`. | Đạt tính nhất quán 100% giữa các bảng tenant, branch và staff trước khi phê duyệt P0.T08. | Schema GM-1 nhất quán hoàn toàn. |
