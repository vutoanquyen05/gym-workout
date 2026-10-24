# Rủi ro và quyết định cần chốt

Nguồn: `baocao.md`, mục 13 và ghi chú cuối báo cáo.

## 13. Rủi ro và phương án xử lý

| Rủi ro | Ảnh hưởng | Phương án xử lý |
|---|---|---|
| Phạm vi dự án quá rộng | Kéo dài thời gian phát triển | Ưu tiên MVP và chia giai đoạn |
| Module phụ thuộc lẫn nhau | Khó sửa đổi và kiểm thử | Quy định interface và ranh giới trách nhiệm |
| Mất dữ liệu buổi tập | Ảnh hưởng trực tiếp đến trải nghiệm | Lưu cục bộ thường xuyên và khôi phục trạng thái |
| Đồng bộ tạo dữ liệu trùng | Lịch sử sai lệch | ID ổn định, idempotency và kiểm soát trạng thái đồng bộ |
| Xung đột giữa các thiết bị | Dữ liệu không nhất quán | Thiết kế quy tắc giải quyết xung đột |
| Bộ đếm thời gian sai khi chạy nền | Ảnh hưởng thao tác | Tính thời gian từ timestamp thay vì phụ thuộc vòng lặp liên tục |
| Giao diện thiếu nhất quán | Khó sử dụng và bảo trì | Xây dựng Design System dùng chung |
| Tương phản màu không đạt | Khó đọc nội dung | Kiểm tra từng cặp màu thực tế |
| Thống kê thiếu chính xác | Người dùng hiểu sai tiến bộ | Định nghĩa công thức và kiểm thử dữ liệu |
| Quyền thiết bị bị từ chối | Chức năng liên quan không hoạt động | Xử lý quyền từ chối và cung cấp phương án thay thế |
| Backend chưa hoàn thiện | Hạn chế chức năng tài khoản và đồng bộ | Tách tầng dữ liệu để có thể thay đổi nguồn dữ liệu |

---

## Quyết định đã chốt — Supabase và offline-first

- [x] Dùng Supabase PostgreSQL làm backend dữ liệu và Expo SQLite làm nguồn dữ liệu cục bộ theo kiến trúc offline-first.
- [x] PostgreSQL model có các bảng `users`, `exercises`, `workout_plans`, `plan_exercises`, `workout_sessions`, `session_exercises` và `workout_sets`.
- [x] Supabase Auth dùng Email/Password, xác minh email trước phiên sử dụng dữ liệu tài khoản, PKCE cho callback di động, đăng nhập/đăng xuất và khôi phục mật khẩu bằng email. Không lưu password trong ứng dụng.
- [x] Dùng UUID ổn định thống nhất giữa PostgreSQL và SQLite. ID v1 là 32 ký tự hex chứa 128 bit; migration giữ nguyên giá trị bit và chuẩn hóa chuỗi UUID có dấu gạch nối, không sinh ID thay thế.
- [x] PostgreSQL dùng `timestamptz`; thời điểm nghiệp vụ do thiết bị ghi nhận được chuẩn hóa UTC. `created_at`/`updated_at` quản trị trên server là thời gian server, không phải thứ tự xung đột.
- [x] Phân biệt bài tập hệ thống với bài tập do người dùng tạo; quyền tạo/sửa bài tập hệ thống phải bị giới hạn.
- [x] Lưu snapshot bài tập trong lịch sử buổi tập để thay đổi hoặc lưu trữ bài tập nguồn không làm thay đổi lịch sử.
- [x] Dùng soft delete, sync outbox cục bộ và versioning. Quy tắc xung đột là optimistic concurrency; không tự động “last write wins”.
- [x] Không tự động gán hoặc tải dữ liệu local chưa sở hữu lên tài khoản mới đăng nhập.
- [x] Bật RLS cho tất cả bảng được expose và kiểm thử cách ly quyền truy cập giữa nhiều tài khoản.
- [x] Không đưa `service_role` hoặc secret key vào ứng dụng mobile; chỉ dùng khóa publishable/anon phù hợp với client và dựa vào RLS.
- [x] Dữ liệu mới thuộc `auth.uid()`; `users.id` bằng Auth user ID. Các bảng dữ liệu người dùng mang `user_id`; policy child rows phải kiểm tra owner của parent và tham chiếu.
- [x] Lưu `weight_grams` dưới dạng số nguyên gram (SQLite `INTEGER`, PostgreSQL `BIGINT`); dùng làm tròn nearest gram, ties upward, cho giá trị không âm.
- [x] Dữ liệu SQLite chưa gắn tài khoản được giữ riêng mặc định. Chỉ nhập dữ liệu khi người dùng chủ động chọn, xem trước và xác nhận; không tự merge/upload khi đăng nhập.
- [x] Đồng bộ theo thứ tự phụ thuộc và FIFO từng entity. Retry exponential backoff có jitter, cap 15 phút; không tự bỏ mutation. Xung đột version cần giải quyết tường minh, không overwrite âm thầm.
- [x] Session Auth dùng access token mặc định hiện hành 1 giờ và refresh tự động; lưu session material bằng `expo-secure-store` trên iOS/Android. Không custom timeout/single-session cho MVP; web session không được bật cho đến khi có lựa chọn storage riêng.

## Quyết định và thông tin còn cần xác nhận

- [ ] Xác nhận Supabase project/môi trường (development, staging, production), quyền truy cập và quy trình secrets cho môi trường phát triển/CI. Không yêu cầu cung cấp secret trong tài liệu hoặc client.
- [ ] Xác nhận project/môi trường, callback/deep links, email template, bật email confirmation, redirect allowlist, và redirect cho password reset.
- [x] Cài `expo-secure-store` tương thích Expo SDK 57 và tích hợp adapter/session provider cho native. Unit tests kiểm tra initialize/restore, auth refresh event, local sign-out và lỗi storage đã được thêm.
- [ ] Kiểm thử persistence/restore/logout, lỗi native SecureStore, app foreground/background và Android backup trên thiết bị/build native iOS/Android; unit tests không thay thế runtime verification.
- [ ] Chốt profile fields tối thiểu (hiện đề xuất display name và đơn vị hiển thị), chính sách giữ/xóa hồ sơ, retention và xóa tài khoản. Profile phải được tạo qua mutation channel được bảo vệ sau khi email xác minh; không dựa vào `user_metadata` để cấp quyền hoặc cờ client.
- [ ] Chốt tombstone/conflict retention và cặp receipt retention–outbox retry TTL. Hiện retry không có TTL và không drop mutation, nên receipt phải giữ vô hạn hoặc cần max age + reconcile/full-fetch protocol trước khi purge.
- [ ] Chọn policy password/rate-limit cho project: đề xuất tối thiểu 12 ký tự và leaked-password protection nếu gói hỗ trợ; kiểm thử đăng ký, xác minh, sign-in và reset email thực tế trước phát hành.
- [ ] Chốt nguồn seed/version catalog bài tập hệ thống, quyền đọc khi signed-out và quy trình phát hành/ngừng bài tập hệ thống.
- [ ] Kiểm kê SQLite v1 thực tế trước migration: chỉ thực hiện trên bản sao/backup được xác nhận và kiểm tra mở được; báo cáo số hàng, NULL/value-unit pairing, giá trị âm, non-finite, vượt giới hạn an toàn số nguyên và conversion preview. Với dữ liệu không hợp lệ/vượt giới hạn, cần báo cáo và yêu cầu xử lý rõ ràng; không ép về 0, không bỏ qua và không xóa dữ liệu nguồn.
- [ ] Xác nhận miền cân nặng tối đa được hỗ trợ và đánh giá sai số lưu `REAL`; chuyển đổi đề xuất `kg × 1000`, `lb × 453.59237`, nearest gram/ties upward. Giá trị hợp lệ có sai số làm tròn tối đa 0.5 g, chưa tính sai số biểu diễn của `REAL`.
- [ ] Chốt mutation gateway: hardened Postgres RPC (`SECURITY DEFINER` role NOLOGIN/non-owner/non-BYPASSRLS, RLS role policy, `search_path=''`, execute allowlist) hay trusted server-side gateway. Không cấp direct DML mobile lên sync tables/receipt. Phải kiểm chứng `auth.uid()`, parent ownership, atomic version+receipt và concurrency trước SQL.
- [ ] Chốt receipt representation: server-computed request digest hay lưu canonical request để đối chiếu; receipt trả full result snapshot hay ack/version tối thiểu; xử lý terminal conflict khi entity đã tiến version sau đó. Không nhận digest do client tự khai.
- [ ] Chốt transaction isolation cho SQLite mutation+outbox: SDK 57 cảnh báo query khác có thể tham gia transaction đang mở bởi `withTransactionAsync`; trước triển khai cần xác nhận API cô lập/serialized write strategy và kiểm thử trên từng runtime/platform mục tiêu.
- [ ] Chốt delta-pull cursor/order/pagination, tombstone retention, cursor expiry và full-resync fallback; timestamp `updated_at` chưa đủ làm cursor ổn định.
- [ ] Chốt snapshot lịch sử: thuộc tính nào là required snapshot trong session; SQLite v1 chỉ giữ exercise name, không thể phục hồi chính xác trường thiếu/đã thay đổi/xóa. Chọn cách biểu diễn legacy snapshot thiếu, không giả lập dữ liệu lịch sử.
- [ ] Chốt UX giải quyết conflict cho plan/profile và conflict chỉnh sửa workout history; chiến lược kỹ thuật giữ cả hai phiên bản và không ghi đè đã chốt, nhưng giao diện lựa chọn/merge chưa được thiết kế.
- [ ] Xác nhận exposure/grants theo cấu hình Data API của project; RLS là bắt buộc nhưng không thay thế grants cần thiết.
- [x] Duyệt có điều kiện bản review proposal tại `supabase-schema.md` để chuẩn bị migration files cho bảy bảng core; không đồng nghĩa cho phép apply. Không DML trực tiếp cho client; `anon` không đọc catalog trong rollout đầu.
- [ ] Chốt schema/API boundary của mutation gateway và role/function owner. Chưa có RPC/gateway được triển khai; không chạy receipt migration trước khi có threat-model và kiểm thử atomicity/ownership.
- [ ] Chốt receipt schema (server-only, user+mutation ID unique, request identity server-computed, replay response, retention) và xác nhận nó là migration group riêng sau core, không phải SQLite outbox.
- [ ] Chốt chính sách account deletion/retention và hành vi hard purge, bao gồm thứ tự xử lý `users`, child rows, plan references và session snapshots.
- [ ] Xác nhận quyền migration role/default privileges hiện có và audit `EXECUTE` cho các function liên quan trước khi cấp Data API grants.
- [ ] Chốt thư viện biểu đồ và định nghĩa đầy đủ các chỉ số thống kê.
- [x] Baseline Expo SDK: Expo SDK 57, dependency hiện tại `expo ~57.0.30`; tài liệu tham chiếu [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/). Đây là phiên bản đang được dự án sử dụng, không phải quyết định nâng cấp hoặc cam kết tương thích mọi thư viện tương lai.

Các mục đã chốt là nguyên tắc thiết kế, không đồng nghĩa schema, migrations, auth hoặc sync đã được triển khai. Không đưa thông tin project/credentials thật vào tài liệu hoặc ứng dụng mobile.

## Review proposal Supabase SQL — 2026-10-21

- Đã chuẩn bị bản thiết kế thay thế tại `supabase-schema.md` và cập nhật hợp đồng tại `data-offline.md`; scope triển khai đầu giới hạn đúng bảy bảng core. Goals/recovery/settings/server queue chuyển sang phase khác; `sync_outbox` chỉ là SQLite-local; mutation receipts là server-side support riêng cho phase gateway.
- Sửa lỗi quyền nghiêm trọng của SQL nháp: profile trigger dùng metadata và SECURITY DEFINER; exercise INSERT cho phép `created_by IS NULL`/public; client trực tiếp tạo/sửa/xóa sync rows; thiếu version/tombstone/atomic receipts; thiếu owner equality FK cho parent-child; grants/default privileges chưa được định nghĩa.
- Thiết kế mới: fail-closed RLS trên cả bảy bảng, chỉ cấp authenticated SELECT, không cấp anon hay client DML; system exercise chỉ được ghi qua catalog process tin cậy. Composite FK kiểm soát owner trên parent chain; gateway phải xác minh exercise reference system/same-owner.
- Rà soát indexes: loại duplicates với PK/unique, bỏ các index phục vụ các bảng ngoài scope và trì hoãn index chưa có query evidence. Index bổ sung chỉ được giữ khi có mục đích FK/query/owner và được kiểm tra bằng EXPLAIN/advisors.
- **Trạng thái tại lần review ban đầu:** Chỉ cập nhật thiết kế; khi đó chưa tạo migration hay kết nối Supabase. Phê duyệt có điều kiện sau đó cho phép chuẩn bị bốn migration files, nhưng không chạy SQL, không truy vấn/chỉnh sửa database, không mở secret `.env` và không sửa source code.
- **Còn mở:** Project/environment và migration role; Data API exposure/default ACL; mutation gateway/RPC trust boundary; receipt identity/result/retention; Auth verification; catalog seed; retention/account purge; index workload; các preflight SQLite/weight/snapshot và test evidence.

## Kết quả Phase 1.T02 — Backend, auth và Expo SDK

Ghi nhận lịch sử tại thời điểm Phase 1.T02, trước khi Supabase PostgreSQL được phê duyệt ở phần quyết định phía trên.

- **Expo SDK:** Đã xác nhận baseline hiện tại là Expo SDK 57 (`expo ~57.0.30` trong `package.json`, `57.0.30` trong `package-lock.json`). Tiếp tục dùng baseline này cho các task kế tiếp; mọi API/thư viện Expo phát sinh phải đối chiếu tài liệu phiên bản 57.
- **Backend và auth — blocker:** Tài liệu yêu cầu đăng ký/đăng nhập và có khả năng đồng bộ, nhưng chưa chỉ định backend/provider, cơ chế xác thực, quy tắc phiên hoặc môi trường triển khai. Không chọn dịch vụ thay mặt chủ dự án và không giả lập tích hợp xác thực thật.
- **API — blocker liên quan:** Chưa có base URL, endpoint, payload, mã lỗi hay hợp đồng phiên. Không tạo endpoint hoặc hợp đồng API giả định.
- **Điều kiện gỡ blocker:** Cần xác nhận nhà cung cấp/backend và môi trường, cơ chế auth/phiên, cùng hợp đồng API cần thiết. Cho đến khi có các thông tin đó, các phần phụ thuộc backend phải được ghi nhận là chưa tích hợp; chức năng cục bộ tiếp tục theo phạm vi MVP.
- **Kết quả task:** T02 hoàn tất theo nhánh ghi nhận blocker cho backend/auth và chốt baseline SDK hiện có; các quyết định backend/API vẫn mở.

## Khoảng trống xác minh Phase 1

- **Trạng thái:** Android runtime và điều hướng cơ bản đã xác minh; iOS runtime còn chưa xác minh.
- **Bằng chứng Android:** Expo Go `57.0.9` chạy app trên AVD `Medium_Phone_API_37.0` (Android 17). Home mở thành công; thao tác lần lượt Workouts, Exercises, Progress, Profile và trở lại Home đều chọn đúng tab và hiển thị đúng tiêu đề route qua Android UI hierarchy.
- **Bằng chứng build:** Expo static export tạo bundle web, iOS và Android; TypeScript, Expo lint, Jest và kiểm tra tương thích SDK đạt. Native bundle export không thay thế runtime test iOS.
- **Giới hạn iOS:** Workspace chạy trên Windows, không có `xcrun`, Xcode hoặc iOS Simulator; iOS runtime test cần môi trường macOS/Xcode hoặc thiết bị iOS khả dụng.
- **Ngoại lệ được chấp thuận:** Ngày 2026-10-18, người dùng yêu cầu tiếp tục và xác nhận lựa chọn bắt đầu Phase 2 trong khi iOS runtime verification vẫn là blocker. Phase 2 được phép tiến hành; không xem đây là bằng chứng iOS đã kiểm thử.
- **Việc còn lại:** Chạy app và kiểm tra điều hướng cơ bản trên iOS simulator/thiết bị khi có môi trường macOS/Xcode hoặc thiết bị iOS khả dụng.

## Kết quả Phase 3.T01 — SQLite cục bộ

Ghi nhận trạng thái triển khai tại thời điểm Phase 3.T01; các quyết định đích Supabase–SQLite được chốt sau đó không thay đổi SQLite v1.

- **Đã triển khai:** Schema SQLite version 1 cho exercise, plan, plan exercise, workout session, session exercise và workout set; migration có transaction/rollback và từ chối schema mới hơn; typed repositories dùng bind parameters.
- **Quyết định trong phạm vi local:** IDs text ngẫu nhiên, timestamp UTC ISO-8601, khối lượng gắn đơn vị từng set, FK/delete semantics giữ snapshot lịch sử. Chi tiết được ghi trong `storage.md` và `data-offline.md`.
- **Giới hạn:** Đây không phải schema/hợp đồng backend; chưa thêm user/profile/auth, goals, recovery, outbox hoặc logic đồng bộ. Đơn vị chuẩn hóa thống kê và các thực thể còn lại tiếp tục mở.
- **Kiểm chứng:** Jest chạy migration trên SQLite thật, bao gồm idempotence, schema version guard, rollback, parameter binding, FK và snapshot; typecheck và Expo lint đạt.

## Kết quả phân tích Supabase + SQLite offline-first

Đây là ghi nhận phân tích trước khi hoàn thiện Phase 3.T06–T07. Các quyết định và blockers mới nhất được ghi trong mục “Kết quả Phase 3.T06–T07” bên dưới và trong danh sách quyết định hiện hành ở đầu tài liệu.

## Kết quả Phase 3.T06–T07 — Hợp đồng và thiết kế PostgreSQL

- **Hoàn tất thiết kế:** Email/Password + PKCE, ownership theo `auth.uid()`, catalog bài tập hệ thống/cá nhân, UUID canonical, UTC và `timestamptz`, snapshot session, soft delete/version, grams, quy tắc import dữ liệu local, FIFO/retry/version conflict/idempotency và mô hình bảng PostgreSQL–SQLite.
- **Chưa đánh giá dữ liệu thật:** Không đọc database hoặc chạy SQL; chưa biết phân phối giá trị `weight_value`, dữ liệu NULL/ngoài miền, tổng bản ghi hay sai số thực tế. Preflight và conversion report là điều kiện bắt buộc trước SQLite migration.
- **Không triển khai:** Không có SQL, migration, thay đổi database, Auth client, Sync Service hay test database nào được tạo/chạy. T06–T11 hoàn tất ở mức thiết kế/review tài liệu; T10 là test matrix, chưa phải test result.
- **Nguồn Supabase đã đối chiếu:** [Password-based Auth](https://supabase.com/docs/guides/auth/passwords), [PKCE flow](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [Sessions](https://supabase.com/docs/guides/auth/sessions), [Managing user data](https://supabase.com/docs/guides/auth/managing-user-data), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), [Data API security/grants](https://supabase.com/docs/guides/api/securing-your-api), [database migrations](https://supabase.com/docs/guides/deployment/database-migrations). Changelog đã rà soát; breaking change TLS HTTP APIs dự kiến 2026-11-10 không làm thay đổi schema/auth contract này nhưng cần đảm bảo client TLS hiện đại trước ngày áp dụng.

## Kết quả Phase 3.T08–T11 — Thiết kế và review

- **T08 — PostgreSQL:** Hoàn thiện hợp đồng 7 bảng, quan hệ/FK composite cho ownership, các check/unique, chiến lược index theo query, per-table RLS cho `anon`/`authenticated`, allowlist grants và các nhóm migration dự kiến. RLS và grants là hai lớp độc lập; default privileges thừa của Data API phải được thu hồi/kiểm tra. **Tinh chỉnh thiết kế so với giả định T07 trước đó:** để version check + idempotency receipt không bị bypass, không cấp DML trực tiếp cho các bảng sync-managed; profile cũng đi qua mutation channel. Chỉ cấp quyền đọc tối thiểu; quyền gọi mutation endpoint/RPC chưa được chốt và là blocker. Security test cases được định nghĩa nhưng chưa chạy.
- **T09 — SQLite:** Thiết kế v2 bảo toàn ID/FK và dữ liệu v1, partition local-unassigned, account isolation, outbox/tombstone/version, trình tự preflight→transactional migration→verification, cùng rollback/recovery trước và sau khi bắt đầu ghi v2. Chưa chạy kiểm kê/copy dữ liệu.
- **T10 — Kiểm thử:** Bổ sung test matrix PostgreSQL, SQLite migration/weights, Auth, grants/RLS, import, offline/retry/idempotency, xung đột đa thiết bị, mất mạng/khởi động lại, đổi tài khoản và dữ liệu chưa có owner trong `testing-acceptance.md`. Đây chỉ là kế hoạch, chưa có kết quả.
- **T11 — Review:** Hợp đồng UUID/UTC, ownership/parent chain, catalog system/user, snapshot lịch sử, grams, tombstone và server-owned version nhất quán trên tài liệu. Không tìm thấy lý do đổi task name/scope/dependencies; T10 phụ thuộc T07–T09 và T11 vẫn sau T10. Review không chứng minh runtime behavior hoặc phê duyệt triển khai.

### Điều kiện còn chặn triển khai

1. Chọn Supabase project/môi trường, xác nhận schema Data API exposure, grants/default privileges, callback/email/password/rate-limit và quy trình secrets.
2. Chốt nguồn/version catalog system và cách nhận diện exercise v1 legacy; không tự phân loại/nhập hoặc gán ownership nếu thiếu nguồn tin cậy.
3. Chạy preflight thực tế trên bản sao SQLite, lập báo cáo weight và UUID/FK, chốt giới hạn gram an toàn cho Expo/JS, xử lý có chủ ý mọi hàng invalid/overflow.
4. Chốt profile tối thiểu, account deletion/retention, tombstone và cặp receipt retention/outbox retry. Vì retry hiện không có TTL và mutation không tự drop, chọn giữ receipt vô hạn hoặc thiết kế max retry age + reconcile/full-resync trước khi purge.
5. Hoàn tất threat-model/review cho transactional RPC/receipt atomicity, `auth.uid()` validation, grants/EXECUTE, schema exposure, `search_path` và cách tránh `SECURITY DEFINER` không an toàn. Không cho mobile ghi trực tiếp receipt.
6. Chốt conflict UX, import UX và cách người dùng truy cập/giữ/xóa vùng local-unassigned; xác nhận snapshot historical fields bắt buộc và cách biểu diễn session v1 thiếu snapshot.
7. Chốt SecureStore dependency/configuration khi triển khai Auth, rồi chạy kiểm thử trên thiết bị/platform được hỗ trợ.
8. Chốt delta-pull cursor, pagination, cursor expiry, tombstone GC và full-resync fallback; `updated_at` đơn độc chưa đủ.
9. Xác nhận workload/query trước khi chốt index; chạy migration/RLS tests trên local/staging và review advisors trước production.

**Kết luận:** Có thể chuyển sang bước xin phê duyệt triển khai sau khi chủ dự án xem các blockers trên. Chưa có phê duyệt viết code/SQL trong yêu cầu hiện tại; mọi thay đổi schema, migrations, Auth Client, Sync Service và database vẫn bị dừng.

## Pre-Implementation Gate — 2026-10-21

**Kết quả: BLOCKED — design-only.** Đã đọc roadmap/tài liệu Auth, storage, offline/data, rủi ro, test, cấu hình package/app và source SQLite v1. Đã đối chiếu Supabase database functions, API grants/RLS, product security, PostgREST transaction và Expo SDK 57 SQLite docs. Không mở `.env`, không truy vấn hoặc đọc DB vật lý, không chạy SQL/test/migration, không sửa source code, cài package hay database.

### Findings đối chiếu code

- Repository có sáu bảng SQLite v1, không có Supabase migration/config, Auth client hoặc sync implementation. `@supabase/supabase-js` đã là dependency; `expo-secure-store` chưa có.
- ID v1 là 32 hex chars, có thể giữ 128 bit khi canonicalize UUID nhưng cần fixture thực tế kiểm tra PK/FK và collisions.
- `exercises` không phân biệt system/user; dữ liệu không thể được tự gán loại hoặc owner.
- Snapshot session chỉ có tên bài tập và configuration; snapshot đầy đủ của exercise không có sẵn, dữ liệu nguồn bị xóa/thay đổi không thể phục hồi thành trạng thái lịch sử chính xác.
- Cân nặng REAL chưa inventory; giới hạn an toàn JavaScript/SQLite và miền sản phẩm chưa được chốt.
- `addSet` và `addExercise` hiện có nhiều lệnh write không nằm trong transaction chung. Cần atomic repository mutation + outbox trước khi sync.
- `withTransactionAsync` trong Expo SQLite SDK 57 có thể bao gồm query khác chạy cùng connection trong lúc transaction mở; cần chọn exclusive transaction nếu được platform hỗ trợ hoặc serialized write queue, rồi xác nhận bằng test interleaving. Không được giả định transaction callback tự cô lập query ngoài callback.
- Tests SQLite hiện dùng in-memory DB; chưa có file-based backup/WAL/restore hoặc fixture DB người dùng, cũng chưa chứng minh behavior interleaving trên Expo runtime.

### Blockers bắt buộc

1. Chọn gateway: ưu tiên đánh giá RPC hẹp trong API schema với definer role least-privilege, không BYPASSRLS/table ownership, policies dành cho role đó, `auth.uid()` checks; hoặc backend/Edge Function tin cậy. Với direct DML bị revoke, invoker RPC không tự có quyền ghi; cần giải quyết trust boundary rõ ràng.
2. Chốt contract atomicity/idempotency: canonical request identity, receipt result, cùng ID/khác payload, receipt cho conflict, duplicate concurrent, transactional rollback và replay; chốt retention vô hạn hay max retry TTL/reconcile.
3. Chốt project/environment, Data API exposed schemas/default privileges, grants/function EXECUTE, email verification/redirect/password settings và secret ownership (không chia sẻ secrets).
4. Chốt system catalog/version và mapping legacy exercise; xác nhận session snapshot fields và phương án giữ rõ legacy snapshot thiếu.
5. Cho phép inventory read-only trên backup SQLite, xác nhận backup restore, duyệt report weight/UUID/FK và miền gram trước migration.
6. Chốt delta-pull cursor/pagination/tombstone GC/full-resync; không dùng `updated_at` đơn độc.
7. Chốt retention account/profile, UX conflict/import/local-only, max receipt/tombstone/conflict retention và Auth SecureStore/web scope.
8. Chốt transaction isolation strategy cho Expo SQLite SDK 57 và chứng minh qua file-backed interleaving/rollback tests trên platform mục tiêu.
9. Chốt performance workload để indexes được kiểm chứng; thiết lập local/staging security+restore test harness.

## SQLite v1 Preflight — 2026-10-21

**Kết quả: BLOCKED — không có bản sao/backup được xác nhận và truy cập được.** Người dùng chỉ phê duyệt preflight trên bản sao; không được truy cập hoặc kiểm kê database nguồn.

- Schema trong code khai báo tên database `gym-workout.db`, nhưng repository không có file database/backup khớp các mẫu đã tìm.
- Không tìm thấy call site của `openDatabaseAsync`/`SQLiteProvider` hoặc app/runtime call site của `initializeDatabase` (hàm chỉ được gọi trong tests); vì vậy không thể xác định vị trí database runtime thực tế chỉ từ repository.
- Không có bản sao được cung cấp để kiểm tra khả năng mở, `user_version`, journal/WAL hay tính toàn vẹn. Không truy cập thiết bị/emulator hoặc thư mục ngoài workspace để tìm dữ liệu.
- **Kiểm kê dữ liệu:** chưa chạy. Số hàng, UUID, FK/orphan, NULL, kiểu/đơn vị cân nặng, invalid/overflow và conversion preview đều **chưa xác định** (không phải 0).
- **Rủi ro:** cao nếu tiến hành migration hoặc suy diễn từ schema; chưa có bằng chứng về dữ liệu thật/backup có thể phục hồi.
- **Điều kiện tiếp tục:** cung cấp đường dẫn đến bản sao/backup trong workspace được phép truy cập và xác nhận đây là bản sao không phải nguồn đang dùng; hoặc cung cấp bản export SQLite đã tạo an toàn cùng thông tin về WAL/checkpoint và cách xác minh mở. Chỉ sau đó mới chạy các phép đọc/kiểm kê trên bản sao.

Không chỉnh sửa database, dữ liệu, schema, source code hay dependency trong preflight này.

### Đề xuất thứ tự sau khi được duyệt

1. Chốt hợp đồng và inventory/fixtures trên backup; dừng nếu có invalid/unmapped rows.
2. Tạo core PostgreSQL schema local/dev, không cấp client DML; test constraints/FK, rồi additive migrations staging.
3. Thêm RLS/read-only grants; test `anon` và hai user trước khi expose.
4. Triển khai receipt + mutation function/gateway; test permissions, function owner, concurrency, replay và failure; có thể revoke EXECUTE để containment.
5. Thiết kế/migrate SQLite v2 trên bản sao; chọn transaction isolation strategy và test file-based rollback/restore, write interleaving, account partition trước khi release.
6. Tích hợp Auth/SecureStore/verified-email gate/profile sau khi mutation channel sẵn sàng; account data giữ partition riêng.
7. Thêm delta pull, sau đó outbox/push/retry/conflict/import; chỉ rollout khi test matrix pass.
8. Canary staging/đa thiết bị rồi production; migrations đã deploy dùng forward-fix. Trước v2 writes mới cân nhắc backup restore; sau khi có writes mới thì không restore backup cũ gây mất dữ liệu.

Các bước này là thứ tự đề xuất, không phải cho phép triển khai. Các quyết định cần chủ dự án xác nhận được tóm tắt trong phần cuối báo cáo.

## PostgreSQL Core Schema Migration v1 — chuẩn bị có điều kiện (2026-10-21)

**Trạng thái: FILES PREPARED — NOT APPLIED.** Theo phê duyệt có điều kiện, đã tạo bốn migration file cho đúng bảy bảng core; không chạy SQL, không kết nối hoặc chỉnh sửa Supabase/database, không thay đổi source code/dependency. Git worktree đã có thay đổi staged/unstaged và file untracked từ trước; chỉ các migration cùng tài liệu trong phạm vi được cập nhật, không revert thay đổi khác.

Thứ tự: parent tables (`20261021112229_core_parent_tables.sql`), child tables (`20261021112241_core_child_tables.sql`), indexes (`20261021112248_core_indexes.sql`), read-only policies/grants (`20261021112254_core_read_policies.sql`). Parent/child migrations bật RLS và revoke quyền bảng ngay khi tạo; migration cuối cài SELECT policies, revoke lại table ACL cụ thể rồi chỉ cấp SELECT cho `authenticated`. Không có DML grants/policies, `anon` access, function/trigger, `SECURITY DEFINER` hoặc `EXECUTE`.

**Chưa xác minh và rủi ro trước apply:**

- Không có `supabase/config.toml`, local stack, linked project hoặc migration history; PostgreSQL version, project Data API exposure, schema grants/usage, `pg_default_acl`, migration owner/role attributes và quyền hiện hữu chưa được kiểm tra. REVOKE trong migration tác động bảy bảng cụ thể, không chuẩn hóa ACL toàn project; owner/superuser/BYPASSRLS vẫn là trusted boundary.
- Policy loại anonymous Auth JWT bằng claim `is_anonymous=true`, nhưng email-confirmation enforcement phụ thuộc Auth project config; chưa kiểm tra JWT claim/config thực tế. Không bật cloud access trước khi xác minh email confirmation.
- Composite FKs bảo vệ owner-parent cho child rows và session-plan, nhưng FK tới exercise chỉ bảo vệ existence. Mutation gateway sau này phải xác thực `system` hoặc exercise cùng owner; hiện không có write path.
- Do chỉ cấp SELECT, profile/system catalog seed và mọi mutation cần một workflow tin cậy riêng; các migration không tự tạo profile, seed bài tập hoặc cung cấp gateway.
- SQL chưa được parse/execute trên PostgreSQL. Chưa test constraints, grants, RLS dưới role/JWT, migration transaction, advisors, query plans hoặc rollback. Hướng dẫn test/rollback chỉ là kế hoạch.
- Bốn migration dùng ngày/timestamp scaffold trong tên; thứ tự phụ thuộc nội bộ đã xác định nhưng không được apply nếu project migration history đã có xung đột timestamp/version.

**Gate:** không apply bất kỳ migration nào cho local, staging hay production cho đến phê duyệt riêng và hoàn thành readiness review. Trước đó xác minh project/migration state/owner/default ACL/exposure, tạo local disposable Supabase config, có fixtures A/B/anonymous, test tất cả grants/RLS/FK/soft-delete, chạy advisors, duyệt backup/rollback. Production ưu tiên forward-fix; rollback phá hủy dữ liệu không được dùng nếu chưa có kế hoạch restore được duyệt.

## Local migration verification — kết quả 2026-10-21

**Kết quả: BLOCKED trước khi thực thi SQL.** Người dùng cho phép có điều kiện test trên môi trường disposable, nhưng preflight không xác nhận được môi trường như vậy:

- Docker CLI không có trên PATH; do đó Docker daemon không thể kiểm chứng.
- Supabase CLI không có trên PATH; chưa truy vấn version/help, không gọi `npx`/`bunx` và không cài tool.
- `supabase/config.toml` chưa tồn tại; không có project-local stack configuration.
- `podman`, `psql` và `pg_isready` cũng không có trên PATH; WSL executable có mặt nhưng chưa chứng minh được distro hoặc database disposable, nên không dùng.
- Không chạy SQL/migration/reset, không truy vấn database, không link/kết nối Cloud, không dùng dữ liệu thật, không cài dependency/tool, không sửa migration/source.
- Static inventory check chỉ xác nhận bốn file dự kiến, bảy khai báo bảng, RLS enable/policies và absence của DML/definer/function/trigger; đây không phải kiểm tra cú pháp PostgreSQL.

| Nhóm test theo phạm vi phê duyệt | Trạng thái |
|---|---|
| Xác minh Docker/CLI/config và an toàn môi trường | **FAIL — prerequisites missing; stop gate** |
| Parse cú pháp và apply đúng thứ tự bốn migration | **NOT RUN — BLOCKED trước SQL** |
| Đúng 7 bảng; UUID/version/tombstone, constraints, indexes, composite FKs | **NOT RUN — BLOCKED** |
| RLS trên mọi bảng | **NOT RUN ở database**; chỉ static source check thấy 7 câu lệnh enable |
| Grants, schema `USAGE`, default privileges, Data API | **NOT RUN — cần local PostgreSQL/Supabase** |
| `anon`, authenticated, hai tài khoản giả lập; isolation và direct DML deny | **NOT RUN — chưa có Auth fixtures/request** |
| Migration rerun và rollback | **NOT RUN — chưa apply lần đầu; không reset/drop môi trường chưa xác minh** |
| Không chạm Cloud/production, không cài tool, không sửa SQL/source | **PASS — không có thao tác** |

Hướng dẫn Supabase chính thức được kiểm tra chỉ dẫn chạy local stack bằng CLI; hướng dẫn migration mô tả `supabase db reset` sẽ reset database local rồi apply migrations, vì vậy lệnh này tuyệt đối chưa được chạy khi chưa nhận diện và xác nhận disposable instance. Changelog hiện hành đã rà; không thấy breaking change migration/RLS liên quan trong phần được kiểm tra.

**Điều kiện để tiếp tục:** cần môi trường Docker + Supabase CLI/config local disposable được chủ dự án xác nhận, hoặc chỉ định database disposable tương đương với bằng chứng nhận diện và có thể hủy. Không cài đặt tool tự động; chủ dự án cần chuẩn bị chúng theo chính sách môi trường. Sau đó mới thực hiện T13/test matrix. Nếu SQL lỗi, giữ nguyên migrations, ghi lỗi và xin phê duyệt bản sửa.

---

## Quyết định và Rủi ro — Chuyển đổi sang Multi-Tenant Gym Management (2026-10-23)

> Phần này ghi nhận các quyết định chưa chốt và rủi ro phát sinh từ việc chuyển đổi định hướng dự án. Không tự đánh dấu hoàn thành; mọi quyết định cần phê duyệt riêng.

### Quyết định kiến trúc P0.T07 — ĐÃ ĐƯỢC CHỦ DỰ ÁN PHÊ DUYỆT CÓ ĐIỀU KIỆN (2026-10-23)

> Ngày **2026-10-23**, Chủ dự án đã chính thức ký duyệt thông qua hồ sơ kiến trúc **P0.T07 (Decision: APPROVED WITH CONDITIONS)**. Quyết định này ở cấp độ kiến trúc (Architecture Approval), KHÔNG phải quyền triển khai hệ thống hay mở Phase 1. Quá trình triển khai bắt buộc tuân thủ 5 điều kiện kiểm soát `AC-P0T07-01..05` và 3 Owner Decisions đã chốt (`OD-01=A, OD-02=A, OD-03=A`).

#### 1. Bảng 5 Quyết định Kiến trúc Đã Phê duyệt (D-MT-01/02/03/04/11)

| # | Quyết định | Lựa chọn Đã Phê duyệt có Điều kiện | Cơ sở Kỹ thuật & Rủi ro đã Giải quyết | Trạng thái |
|---|---|---|---|---|
| D-MT-01 | Monorepo vs. Tách repo | **npm workspaces**: Cấu trúc monorepo với `apps/mobile`, `apps/admin-web`, `packages/shared-types`. | Tận dụng npm workspaces có sẵn; **di chuyển tại Pre-Phase 2, ngay trước P2.T01 (OD-03=A)**; bảo toàn 100% baseline SDK 57 và SQLite. | APPROVED WITH CONDITIONS (2026-10-23) |
| D-MT-02 | Framework Admin Web | **Next.js App Router + TypeScript**: Server Components làm mặc định, Tailwind CSS hoặc CSS Modules. | Hỗ trợ SSR bảo mật, tối ưu SEO/dashboard render, tương thích kiến trúc Server-First Auth với Supabase SSR, tải trang nhanh và quản lý layout phân cấp (gym/branch). | APPROVED WITH CONDITIONS (2026-10-23) |
| D-MT-03 | Web Auth & Session Management | **Supabase SSR (`@supabase/ssr`) — Kiến trúc Server-First**: Cookie `httpOnly`, `secure`, `sameSite: 'lax'`. | Khắc phục rủi ro XSS của `localStorage`. Tuyệt đối không dùng `createBrowserClient` trên Client Components; Middleware điều phối refresh; bắt buộc có integration test cho session lifecycle. | APPROVED WITH CONDITIONS (2026-10-23) |
| D-MT-04 | Mutation Gateway & Execution Privileges | **Direct Self-Authorizing PostgreSQL RPC (`SECURITY DEFINER`) + Edge Functions cho Orchestration**. | RPC tự kiểm tra authorization và tenant scope từ caller JWT; ghim cứng `SET search_path = ''`; thu hồi 100% direct DML từ client; Edge Functions xử lý orchestration và Admin API (OD-01=A). | APPROVED WITH CONDITIONS (2026-10-23) |
| D-MT-11 | Multi-branch Staff Assignment & Uniqueness | **Multi-row trong `gym_staff` kết hợp 2 Partial Unique Indexes + Composite FK `(branch_id, gym_id)` với `ON DELETE RESTRICT`**. | Khắc phục lỗi SQL `NULL != NULL`; áp dụng **Mutual Exclusivity trên active assignments (OD-02=A)**; bảo tồn 100% lịch sử (Soft-Revocation); ngăn chặn cross-tenant ở DB engine. | APPROVED WITH CONDITIONS (2026-10-23) |

#### 2. Sổ Đăng ký Quyết định của Chủ Dự án Đã Xác nhận (Confirmed Owner Decisions)

- **OD-01 = A:** Mời nhân viên sử dụng Supabase Auth Admin API (`inviteUserByEmail`) qua Edge Function bảo mật (không dùng custom token hay gửi trực tiếp từ client).
- **OD-02 = A:** Áp dụng Mutual Exclusivity giữa quyền Toàn Gym active và quyền Chi nhánh active trong cùng gym. Tuyệt đối không xóa vật lý bản ghi lịch sử phân công (`DELETE`).
- **OD-03 = A:** Thực hiện chuyển đổi monorepo bằng npm workspaces tại mốc **Pre-Phase 2 (ngay trước khi thực thi `P2.T01`)**. Không di chuyển thư mục trong Phase 0 hoặc Phase 1.

#### 3. Bắt buộc Tuân thủ 5 Điều kiện Phê duyệt (Approval Conditions)

- **`AC-P0T07-01 (Session Security)`**: Cookie bắt buộc `httpOnly`, `secure` và `sameSite: 'lax'`. Không mặc định in-memory Single-Flight Map đồng bộ được nhiều serverless instances; không coi GoTrue refresh reuse interval là bảo đảm tuyệt đối 100%. Bắt buộc kiểm thử integration test cho concurrent refresh, OAuth callback, logout, cookie rotation và graceful degradation khi phiên hết hạn. Không tuyên bố đã PASS khi chưa có kết quả kiểm thử thực tế.
- **`AC-P0T07-02 (RPC Security & Idempotency)`**: RPC thực thi authorization dựa trên caller JWT (`auth.uid()`), kiểm tra gym, branch và object scope; không tin tưởng client-supplied identity. Thu hồi 100% direct client DML. Kiểm soát chặt chẽ `GRANT EXECUTE`, quyền sở hữu hàm thuộc `postgres`, ghim `search_path = ''`. Cơ chế idempotency bắt buộc có `action_name`, `request_hash`, unique constraint và xử lý an toàn trước concurrent twin requests. Audit logging cho các mutation nhạy cảm.
- **`AC-P0T07-03 (Staff Assignment Integrity)`**: Mutual Exclusivity chỉ áp dụng cho active assignments (`status = 'active'`). Cho phép nhiều branch-scoped assignments nếu không có gym-wide active assignment. Không hard-delete lịch sử; mọi thay đổi vai trò đều chuyển sang soft-revocation (`status = 'revoked'`). Advisory lock là cơ chế cooperative lock, chỉ hiệu quả khi mọi mutation path tuân thủ cùng locking protocol. Các thay đổi GM-1 DDL (thêm status filter vào indexes, thêm `revoked_at/revoked_by`) phải được thẩm định riêng tại Gate P0.T08.
- **`AC-P0T07-04 (Staff Invitation)`**: Edge Function bắt buộc xác thực quyền caller (Owner/Manager). Không để lộ `service_role` credentials ra client. Xử lý phân nhánh rành mạch giữa New User (`inviteUserByEmail`) và Existing User (thông báo riêng), xử lý duplicate (`409 Conflict`), expired links (24h) và retry backoff. Không giả định tồn tại phương thức SDK chưa xác minh trên hosted runtime; kiểm chứng hành vi API thực tế trước khi nghiệm thu P1.T04.
- **`AC-P0T07-05 (Monorepo Migration)`**: Tuyệt đối không di chuyển thư mục tại Phase 0 hoặc Phase 1. Chỉ migration tại Pre-Phase 2 trước P2.T01. Bảo toàn nguyên vẹn Expo SDK 57, Metro config, TypeScript aliases, SQLite storage, npm lockfile và CI runners. Bắt buộc chạy smoke tests (`lint`, `test`, `expo export`) trước khi nghiệm thu migration.

---

### Quyết định nghiệp vụ mở cho các Phase sau (Chưa chốt — chờ đến phase tương ứng)

| # | Quyết định | Lựa chọn dự kiến | Tác động nếu chọn sai | Phase cần chốt | Trạng thái |
|---|---|---|---|---|---|
| D-MT-05 | Đơn vị tiền tệ payments | VND đồng nguyên (`bigint`) vs. xu (`bigint / 100`) | Ảnh hưởng toàn bộ bảng `payment_transactions`, format hiển thị và rounding | Phase 5 (Payments) | Mở |
| D-MT-06 | Check-in window | 1 lần/ngày calendar vs. window 30–60 phút | Ảnh hưởng unique constraint `attendance_logs` và logic phạt/check-in lại | Phase 4 (Attendance) | Mở |
| D-MT-07 | QR check-in hardware & design | Expo Camera (mobile) vs. Web camera (quầy lễ tân) | Ảnh hưởng luồng check-in, dynamic QR token TTL và phần cứng tại quầy | Phase 4 (Attendance) | Mở |
| D-MT-08 | Quy tắc sinh `member_code` | UUID prefix + sequence (`GYM-YYYY-XXXXX`) vs. số ngẫu nhiên | Ảnh hưởng trải nghiệm đọc mã thẻ của hội viên và tốc độ tìm kiếm tại quầy | Phase 3 (Members) | Mở |
| D-MT-09 | Chiến lược lưu trữ báo cáo | On-the-fly aggregation query vs. Materialized Views/Bảng tổng hợp | Ảnh hưởng tải database khi quy mô phòng gym và số giao dịch tăng cao | Phase 5 (Reporting) | Mở |
| D-MT-10 | Hạ tầng hosting Admin Web | Vercel vs. Cloudflare Pages vs. Self-hosted Docker | Ảnh hưởng quy trình CI/CD, độ trễ Edge kết nối Supabase, và chi phí vận hành | Phase 2 (Admin Web) | Mở |

---

### Rủi ro kỹ thuật và Phương án giảm thiểu

| # | Rủi ro | Xác suất | Tác động | Phương án giảm thiểu chi tiết |
|---|---|---|---|---|
| R-MT-01 | RLS multi-tenant sai → rò rỉ dữ liệu cross-tenant | Trung bình | Nghiêm trọng | Thiết kế fail-closed mặc định: không có policy là từ chối toàn bộ. Helper function `is_active_staff` bắt buộc kiểm tra `gym_id`, `status = 'active'` và `branch_id`. Test matrix MT-01 đến MT-06 kiểm thử cô lập A/B. |
| R-MT-02 | Client giả mạo hoặc sửa `user_metadata` để leo thang quyền | Cao | Nghiêm trọng | Tuyệt đối không lưu trữ hoặc kiểm tra role/gym_id trong `raw_user_meta_data`. Toàn bộ phân quyền dựa trên truy vấn bảng vật lý `gym_staff` với điều kiện `status = 'active'`. |
| R-MT-03 | Mutation gateway chưa thiết kế → bế tắc ghi dữ liệu | Thấp (Đã giải quyết thiết kế) | Cao | Đã phân tách ranh giới rõ ràng trong P0.T08: Edge Functions cho business logic/invites; RPC `SECURITY DEFINER` cho atomic transactions. Revoke direct DML từ client. |
| R-MT-04 | Monorepo tooling gây xung đột dependency hoặc chậm CI | Trung bình | Trung bình | Chọn npm workspaces nguyên bản (có sẵn trong Node.js/npm hiện tại), không dùng thêm build tool phức tạp ngoài nhu cầu. |
| R-MT-05 | Migration mới phá vỡ hoặc xung đột 7 bảng core đã có | Thấp | Cao | Tuân thủ nguyên tắc additive-only migrations. Đặt tiền tố nhóm riêng `GM-1` đến `GM-5`. Bảy bảng workout core giữ nguyên cấu trúc và ownership. |
| R-MT-06 | Suy giảm hiệu năng truy vấn do join `gym_staff` trong RLS | Trung bình | Trung bình | Đánh chỉ mục bắt buộc: `(gym_id, user_id, status)` và `(gym_id, branch_id)`. Các hàm helper RLS được khai báo `STABLE` để query planner có thể tối ưu số lần gọi khi tham số là hằng số trong câu truy vấn (lưu ý: `STABLE` không tự động loại bỏ triệt để N+1 trong mọi trường hợp; bắt buộc kết hợp chỉ mục và kiểm tra `EXPLAIN ANALYZE`). |
| R-MT-07 | Ghi nhận thanh toán bị trùng lặp (duplicate charge) | Thấp | Cao | Sử dụng client-generated idempotent UUID key kết hợp bảng `mutation_receipts` hoặc ràng buộc duy nhất trên mã giao dịch thanh toán trước khi insert. |
| R-MT-08 | Huấn luyện viên xem bài tập của hội viên ngoài danh sách | Trung bình | Trung bình | RLS policy kiểm tra điều kiện gán cặp `pt_member_assignments`. Kiểm thử ma trận RBAC-08 và RBAC-09 trước khi release. |
| R-MT-09 | Walk-in member (`user_id IS NULL`) gây lỗi FK hoặc cấp nhầm quyền | Thấp | Trung bình | `gym_members.user_id` nullable. Mọi policy RLS dành cho hội viên bắt buộc có điều kiện bảo vệ: `user_id IS NOT NULL AND user_id = auth.uid()`. |
| R-MT-10 | Quản lý session Admin Web khác biệt với mobile | Thấp (Đã giải quyết thiết kế) | Thấp | Mobile dùng `expo-secure-store` lưu JWT; Admin Web dùng HTTP cookies quản lý qua Next.js Server Components. Tách biệt hoàn toàn hai cơ chế. |
| R-MT-11 | Nhân viên đã bị đình chỉ (`suspended`) hoặc lời mời chưa chấp nhận (`invited`) vẫn truy vấn dữ liệu | Trung bình | Nghiêm trọng | Bắt buộc mọi RLS helper function và policy đều có điều kiện `gym_staff.status = 'active'`. Nhân viên có `status != 'active'` lập tức bị từ chối truy cập. |
| R-MT-12 | Rò rỉ session token qua cookie trên Admin Web nếu cấu hình `@supabase/ssr` mặc định cho phép client-side JS đọc cookie | Trung bình | Nghiêm trọng | Thiết kế kiến trúc **Server-First Auth**: cookie bắt buộc phải có `httpOnly: true, secure: true, sameSite: 'lax'`. Chỉ Server Components, Route Handlers và Server Actions đọc/ghi cookie; Client Components không đọc raw token từ `document.cookie`. |
| R-MT-13 | Gán nhầm chi nhánh thuộc tenant khác (Cross-tenant branch assignment) hoặc mất audit trail khi xóa chi nhánh | Thấp (Đã giải quyết thiết kế) | Nghiêm trọng | Bắt buộc sử dụng Composite Foreign Key với quy tắc bảo vệ audit trail: `CONSTRAINT fk_gym_staff_branch_gym FOREIGN KEY (branch_id, gym_id) REFERENCES public.branches(id, gym_id) ON DELETE RESTRICT`. Database từ chối xóa vật lý chi nhánh nếu còn bản ghi nhân sự liên kết. Áp dụng cơ chế soft-deactivation (`status = 'archived'`) cho chi nhánh đóng cửa. |
| R-MT-14 | Nhân viên vẫn truy cập được dữ liệu khi phòng gym bị tạm khóa/đình chỉ (`gyms.status = 'suspended'`) | Trung bình | Nghiêm trọng | Hàm helper RLS `is_active_staff` bắt buộc JOIN `gyms` và kiểm tra đồng thời `gyms.status = 'active'`. Toàn bộ nhân viên bị khóa truy cập ngay khi gym chuyển sang `suspended`. Đối với Owner: chỉ cho phép đọc thông tin gym (`gyms` row) để xem lý do đình chỉ/hóa đơn và gọi RPC gia hạn `fn_gm_reactivate_gym`; toàn bộ quyền nghiệp vụ vận hành trên các bảng con đều bị khóa triệt để (`is_gym_owner` trả về `FALSE`). |

---

### Trạng thái Blockers trước khi phê duyệt Phase 0 và bắt đầu Phase 1

- [x] **P0.T07 — Phê duyệt kiến trúc mới:** **APPROVED WITH CONDITIONS (2026-10-23)**
  - Đã ghi nhận chính thức 5 quyết định kiến trúc D-MT-01/02/03/04/11 và 3 quyết định của Chủ dự án OD-01/02/03=A.
  - Quá trình triển khai bắt buộc tuân thủ 5 điều kiện kiểm soát kỹ thuật `AC-P0T07-01..05`.
  - Giữ nguyên trạng thái tài liệu; không phải quyền mở Phase 1 hay triển khai hệ thống.
- [ ] **P0.T08 — Chờ chủ dự án phê duyệt chi tiết schema GM-1 và thứ tự migration:**
  - Bảng `gyms`, `branches`, `gym_staff` cùng các ràng buộc tính toàn vẹn (Composite FK `(branch_id, gym_id)` với `ON DELETE RESTRICT` bảo vệ audit trail, chuẩn hóa `branches.status TEXT CHECK (status IN ('active', 'suspended', 'archived'))`, soft-deactivation `status = 'archived'`, 2 partial unique indexes có status filter theo đề xuất P0.T07).
  - Hệ thống RLS policies fail-closed và các helper functions `is_gym_owner`, `is_active_staff` (kiểm tra trạng thái gym active, pinned search path, execute grants, STABLE optimization).
  - Cơ chế phân quyền Owner khi gym `suspended`: chỉ cho phép đọc thông tin trạng thái và thanh toán gia hạn qua RPC chuyên biệt; khóa toàn bộ quyền nghiệp vụ thông thường.
  - Kế hoạch migration thực thi trong các Atomic Transactions (`BEGIN; ... COMMIT;`), kích hoạt RLS và thu hồi quyền ngay lập tức sau `CREATE TABLE` (fail-closed mặc định).
  - Mô hình phân quyền thực thi Edge Functions và PostgreSQL RPC (`SECURITY DEFINER`).
  - Thứ tự migration GM-1 năm bước và kịch bản rollback nghịch đảo chi tiết.

---

### Tác động và Trạng thái tài liệu hiện tại

| Tài liệu | Trạng thái cập nhật cho P0.T07 & P0.T08 |
|---|---|
| `supabase-schema.md` | Đã hoàn tất đặc tả chi tiết DDL GM-1, Composite FK, 2 partial unique indexes, RLS helper functions (kiểm tra `gyms.status = 'active'`), fail-closed policies, least-privilege model, và kịch bản rollback. |
| `multi-tenancy.md` | Đã hoàn tất giải pháp Composite FK chống cross-tenant branch assignment, phân tích coexistence/mutual exclusivity của quyền toàn gym và chi nhánh, ma trận vòng đời trạng thái gym và active status enforcement. |
| `gym-management.md` | Đã đồng bộ chi tiết schema GM-1, Composite FK, các ràng buộc dữ liệu, và mô hình kiêm nhiệm nhiều chi nhánh. |
| `auth.md` | Đã bổ sung phân tích sâu về Supabase SSR session & cookie security, 4 ranh giới kiểm thử an toàn phiên SSR Server-First (concurrent refresh race condition, cookie chunking, multi-tab logout). |
| `admin-web.md` | Đã cập nhật cấu trúc Next.js App Router, cơ chế Server-First SSR auth cookies an toàn, các giới hạn kiểm thử phiên và tích hợp Gateway RPC/Edge Functions. |
| `architecture.md` | Đã cập nhật tổng thể kiến trúc hệ thống, ranh giới client-server, và least-privilege mutation gateway. |
| `testing-acceptance.md` | Đã bổ sung đầy đủ test cases cho cross-tenant mutation (MT-06), suspended/invited staff (RBAC-13, RBAC-14), multi-branch access (RBAC-15, RBAC-16), constraints GM-1 (GM-01 đến GM-06), kiểm thử bảo mật (SEC-01, SEC-02), và kiểm thử phiên SSR (SSR-01, SSR-02). |
| `risks-decisions.md` | Đã phân tách rành mạch các quyết định chuẩn bị duyệt P0.T07 vs. quyết định mở tương lai; bổ sung rủi ro SSR cookie R-MT-12, rủi ro cross-tenant FK R-MT-13, và rủi ro gym lockdown R-MT-14. |
| `mindmap.md` | Đã cập nhật mô tả trạng thái sẵn sàng phê duyệt cho P0.T07 và P0.T08, giữ nguyên trạng thái `[ ]` chờ duyệt. |

---

## Nhật ký cập nhật tài liệu

### 2026-10-23 — Chuẩn bị phê duyệt P0.T07 và hoàn thiện thiết kế GM-1 cho P0.T08

- **Mục tiêu:** Chuẩn bị hồ sơ phê duyệt quyết định kiến trúc P0.T07 và thiết kế kỹ thuật chi tiết GM-1 cho P0.T08 theo định hướng của chủ dự án.
- **Nội dung cập nhật:**
  1. Phân định rõ nhóm quyết định kiến trúc D-MT-01, D-MT-02, D-MT-03, D-MT-04, D-MT-11 ở trạng thái PROPOSED (sẵn sàng chờ phê duyệt) và nhóm quyết định nghiệp vụ mở cho các Phase sau (D-MT-05 đến D-MT-10).
  2. Bổ sung rủi ro kỹ thuật `R-MT-12` về nguy cơ rò rỉ session token qua cookie trên Admin Web nếu không cấu hình tường minh `httpOnly: true` với `@supabase/ssr`, cùng giải pháp Server-First Auth.
  3. Cập nhật danh sách blockers trước Phase 1: ghi rõ chờ phê duyệt chính thức P0.T07 và P0.T08 từ chủ dự án.
  4. Đồng bộ bảng trạng thái tài liệu kiến trúc toàn diện.
- **Cam kết tuân thủ:** Không sửa source code, SQL migrations, packages hoặc Supabase Cloud; không tự ý đánh dấu hoàn thành P0.T07 và P0.T08.

### 2026-10-23 — Final GM-1 Schema Security Review (P0.T08 Preparation)

- **Mục tiêu:** Rà soát và giải quyết triệt để các vấn đề bảo mật, tính toàn vẹn dữ liệu và kịch bản rollback trước khi phê duyệt P0.T08.
- **Nội dung cập nhật:**
  1. Thêm rủi ro `R-MT-13` về cross-tenant branch assignment và giải pháp Composite Foreign Key `(branch_id, gym_id)`.
  2. Thêm rủi ro `R-MT-14` về việc khóa toàn bộ nhân sự khi phòng gym bị tạm khóa/đình chỉ (`gyms.status = 'suspended'`).
  3. Đồng bộ hóa toàn diện tài liệu kỹ thuật GM-1 với các kịch bản kiểm thử bảo mật mới (SEC, SSR, GM).
- **Trạng thái:** Toàn bộ hồ sơ GM-1 hoàn thiện; tiếp tục giữ nguyên `[ ]` cho P0.T08 chờ phê duyệt chính thức.

### 2026-10-23 — Final Security Corrections Before Approval

- **Mục tiêu:** Hoàn thiện các chỉnh sửa bảo mật cuối cùng trước khi trình duyệt P0.T07 và P0.T08.
- **Nội dung cập nhật:**
  1. Điều chỉnh `R-MT-13`: chuyển composite FK sang `ON DELETE RESTRICT` để bảo vệ audit trail và đề xuất soft-deactivation (`is_active = FALSE`) cho chi nhánh.
  2. Điều chỉnh `R-MT-14`: làm rõ quyền Owner khi gym suspended (chỉ cho phép đọc trạng thái và gọi RPC gia hạn, khóa toàn bộ nghiệp vụ vận hành con).
  3. Cập nhật `R-MT-06`: sửa mô tả PostgreSQL `STABLE` chính xác theo cơ chế query planner optimization, không tuyên bố tự động loại bỏ N+1 trong mọi trường hợp.
  4. Cập nhật kế hoạch migration: thực thi trong các Atomic Transactions, kích hoạt RLS và thu hồi quyền mặc định ngay sau `CREATE TABLE` (fail-closed).
  5. Đồng bộ blockers và ma trận kiểm thử GM-07, GM-08, SEC-03.
- **Trạng thái:** Tiếp tục giữ `P0.T07` và `P0.T08` ở trạng thái chờ phê duyệt (`[ ]`). Không commit, không bắt đầu Phase 1.

### 2026-10-23 — Final Pre-Approval Verification

- **Mục tiêu:** Xác minh tính nhất quán toàn diện trước khi chủ dự án phê duyệt P0.T07 và P0.T08.
- **Nội dung cập nhật:**
  1. Chuẩn hóa schema `branches` sang mô hình `status TEXT CHECK (status IN ('active', 'suspended', 'archived'))` đồng bộ với `gyms.status`.
  2. Cập nhật soft-deactivation là chuyển `branches.status = 'archived'` trong `R-MT-13` và blocker P0.T08.
  3. Xác nhận thư mục untracked `gym-workout/` là bản sao clone lồng của repository gốc, không tự ý xóa hay thay đổi.
- **Trạng thái:** Tiếp tục giữ `P0.T07` và `P0.T08` ở trạng thái chờ phê duyệt (`[ ]`). Không commit, không bắt đầu Phase 1. Sẵn sàng cho chủ dự án phê duyệt Phase 0.
