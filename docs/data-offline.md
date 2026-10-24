# Dữ liệu, lưu trữ và offline-first — Single Source of Truth

Nguồn: `baocao.md`, mục 7.

## 7. Thiết kế kiến trúc dữ liệu và hoạt động ngoại tuyến

### 7.1. Mô hình dữ liệu khái quát

Các thực thể chính gồm:

| Thực thể | Dữ liệu tiêu biểu | Quan hệ |
|---|---|---|
| User | ID, thông tin hồ sơ, tùy chọn | Có nhiều kế hoạch và buổi tập |
| Exercise | ID, tên, nhóm cơ, thiết bị, độ khó | Có thể được sử dụng trong nhiều kế hoạch |
| WorkoutPlan | ID, tên, mô tả | Chứa nhiều bài tập |
| PlanExercise | Plan ID, Exercise ID, thứ tự, cấu hình | Liên kết kế hoạch với bài tập |
| WorkoutSession | ID, thời gian bắt đầu/kết thúc, trạng thái | Thuộc về người dùng |
| SessionExercise | Session ID, Exercise ID, thứ tự | Liên kết buổi tập với bài tập |
| WorkoutSet | ID, số hiệp, mức tạ, số lần lặp, trạng thái | Thuộc về bài tập trong buổi tập |
| Goal | ID, loại mục tiêu, giá trị mục tiêu, thời hạn | Thuộc về người dùng |
| RecoveryCheckIn | ID, thời điểm, các chỉ số tự khai báo | Thuộc về người dùng |
| AppSettings | Theme, tùy chọn thông báo và cấu hình | Thuộc về người dùng hoặc thiết bị |

Đây là mô hình logic ban đầu. Cấu trúc bảng, khóa ngoại và quy tắc xóa cần được xác định chi tiết khi triển khai SQLite hoặc backend.

### 7.2. Chiến lược lưu trữ

Nên phân chia dữ liệu theo mức độ nhạy cảm và tính chất sử dụng:

- **SecureStore:** Token hoặc thông tin xác thực cần được bảo vệ.
- **SQLite:** Kế hoạch, bài tập, lịch sử, trạng thái buổi tập và dữ liệu nghiệp vụ cục bộ.
- **Bộ nhớ ứng dụng:** Trạng thái giao diện tạm thời, bộ lọc hoặc dữ liệu không cần lưu lâu dài.
- **Backend:** Dữ liệu tài khoản và dữ liệu cần đồng bộ giữa các thiết bị, tùy phạm vi triển khai.

Không nên lưu tất cả dữ liệu nghiệp vụ trong AsyncStorage hoặc SecureStore. Cần chọn nơi lưu dựa trên kích thước, cấu trúc và yêu cầu bảo mật của dữ liệu.

### 7.2.1. Schema SQLite cục bộ — Phase 3.T01

Schema version 1 trong `src/shared/storage/` bao gồm `exercises`, `workout_plans`, `plan_exercises`, `workout_sessions`, `session_exercises` và `workout_sets`. Migration dùng `PRAGMA user_version`, chạy trong transaction và rollback nếu lỗi. Repository bind toàn bộ giá trị đầu vào; CHECK constraints và khóa ngoại bảo vệ tính hợp lệ của dữ liệu.

IDs là text ngẫu nhiên cục bộ; thời điểm là UTC ISO-8601. Session giữ snapshot tên bài tập/kế hoạch để lịch sử còn nguyên khi bản ghi nguồn bị xóa. Xóa exercise còn được plan tham chiếu bị từ chối; plan xóa sẽ bỏ liên kết trong session nhưng không xóa session. Chi tiết schema này mới bao phủ dữ liệu tập luyện cốt lõi, chưa xác định user/profile/auth, goals, recovery hoặc sync outbox. Đơn vị tạ được lưu riêng theo set (`kg`/`lb`); chuẩn hóa dùng cho thống kê vẫn cần được chốt.

### 7.3. Quy trình hoạt động ngoại tuyến

```text
Người dùng thao tác
        |
        v
Kiểm tra và chuẩn hóa dữ liệu
        |
        v
Lưu dữ liệu vào SQLite
        |
        v
Cập nhật giao diện
        |
        v
Đưa thay đổi vào hàng đợi đồng bộ
        |
        v
Kiểm tra kết nối mạng
        |
        +---- Chưa có mạng ----> Giữ dữ liệu trong hàng đợi
        |
        +---- Có mạng --------> Gửi thay đổi lên backend
                                      |
                                      v
                               Xác nhận kết quả
                                      |
                                      v
                              Cập nhật trạng thái đồng bộ
```

### 7.4. Nguyên tắc đồng bộ dữ liệu

1. Ghi dữ liệu cục bộ trước khi phụ thuộc vào yêu cầu mạng.
2. Gán ID ổn định cho các bản ghi cần đồng bộ.
3. Sử dụng mã thao tác duy nhất hoặc cơ chế idempotency để hạn chế tạo bản ghi trùng khi gửi lại.
4. Phân loại lỗi tạm thời và lỗi không thể tự khắc phục.
5. Retry có giới hạn và sử dụng backoff phù hợp.
6. Theo dõi trạng thái đồng bộ như `pending`, `synced` và `failed`.
7. Xây dựng quy tắc xử lý xung đột nếu cùng dữ liệu bị sửa ở nhiều thiết bị.
8. Không xóa dữ liệu cục bộ trước khi có xác nhận phù hợp từ backend.

**Lưu ý:** SQLite chỉ cung cấp khả năng lưu trữ cục bộ, không tự động tạo ra cơ chế đồng bộ với máy chủ. Hàng đợi đồng bộ, API backend, xử lý xung đột và retry phải được triển khai riêng.

### 7.5. Định hướng hợp đồng Supabase PostgreSQL–SQLite (được duyệt để thiết kế)

Supabase PostgreSQL là backend dữ liệu; Expo SQLite tiếp tục là nơi ứng dụng đọc/ghi trước để các thao tác tập luyện không phụ thuộc mạng. Đây là định hướng đã được duyệt, không phải xác nhận rằng database, Auth, migration hay đồng bộ đã được triển khai.

#### 7.5.1. Mô hình dữ liệu mục tiêu

| Bảng PostgreSQL | Tương ứng local | Hướng thiết kế |
|---|---|---|
| `users` | Bảng profile local trong migration tương lai | `id` gắn với `auth.users.id`; chỉ lưu hồ sơ ứng dụng, không sao chép credential. |
| `exercises` | `exercises` | Phân biệt bài tập hệ thống và bài tập do người dùng tạo; dữ liệu hệ thống chỉ được cập nhật qua quy trình tin cậy, dữ liệu cá nhân có owner. |
| `workout_plans` | `workout_plans` | Bản ghi cá nhân có owner và metadata soft delete/version. |
| `plan_exercises` | `plan_exercises` | Bảng liên kết chứa thứ tự và cấu hình hiệp/reps/nghỉ; duy trì khóa duy nhất theo plan và vị trí. |
| `workout_sessions` | `workout_sessions` | Có owner, trạng thái và thời gian; có thể tham chiếu kế hoạch nhưng lịch sử không phụ thuộc vào việc kế hoạch còn tồn tại. |
| `session_exercises` | `session_exercises` | Lưu snapshot tên và dữ liệu bài tập cần cho lịch sử, cùng thứ tự và cấu hình tại thời điểm tập. |
| `workout_sets` | `workout_sets` | Thuộc `session_exercises`; giữ số hiệp, reps, trạng thái và khối lượng đã chuẩn hóa. |

Các bảng trên là mục tiêu thiết kế; schema chi tiết, nullability, delete behavior và grants phải được review trước khi tạo migration. Mọi bảng trong schema được expose cần bật RLS. Quyền của bản ghi cá nhân phải kiểm tra owner; bài tập hệ thống có chính sách đọc riêng và không được cho client tự ghi. Policy cập nhật cần giới hạn cả hàng được cập nhật (`USING`) lẫn giá trị sau cập nhật (`WITH CHECK`); các hàm xác thực trong policy nên được viết theo pattern Supabase hiệu năng phù hợp. RLS cần được kiểm thử bằng nhiều tài khoản để xác nhận không đọc, sửa, xóa hoặc gán lại dữ liệu của tài khoản khác.

Index cần phục vụ truy vấn và policy thực tế, không tạo tràn lan. Các ứng viên ban đầu để xác minh theo query plan:

- Bản ghi người dùng: khóa chính UUID đồng thời đáp ứng lookup theo `auth.uid()`.
- Danh sách kế hoạch còn hoạt động: `(user_id, updated_at DESC)`; cân nhắc partial index nếu query luôn loại các hàng soft-deleted.
- Lịch sử buổi tập: `(user_id, started_at DESC)`; index riêng `plan_id` nếu dùng truy vấn hoặc thao tác FK theo plan.
- Thứ tự bài tập trong kế hoạch: unique `(plan_id, position)` giữa các row chưa tombstone; thêm index `exercise_id` cho chiều lookup/FK ngược.
- Thứ tự bài tập snapshot trong buổi: unique `(session_id, position)`; thêm `exercise_id` nếu được dùng để truy vấn.
- Thứ tự snapshot trong session và số hiệp cũng unique giữa các row chưa tombstone để có thể thay thế row đã soft-delete mà vẫn giữ tombstone; owner-first child indexes phục vụ RLS/FK.
- Bài tập cá nhân: index owner; index tên/nhóm cơ chỉ khi các truy vấn tìm kiếm/lọc thực tế cần và kiểu truy vấn được index hỗ trợ.

Các unique index có khóa ngoại làm tiền tố có thể đáp ứng một phần truy vấn FK; vẫn cần xem xét riêng từng cột FK và kiểm chứng bằng query plan/advisors sau khi có schema và workload. Không tạo index speculative cho cột ít chọn lọc hoặc chưa có truy vấn tương ứng.

#### 7.5.2. UUID và thời gian

- Dùng UUID ổn định cho các bản ghi cần đồng bộ và cùng giá trị định danh ở SQLite/PostgreSQL.
- SQLite v1 hiện tạo ID dạng 32 ký tự hex không dấu gạch nối. Migration cần chuyển sang dạng UUID canonical, giữ nguyên ID logic và cập nhật nhất quán mọi khóa ngoại; ID mới do ứng dụng tạo phải là UUID hợp lệ.
- PostgreSQL dùng `timestamptz`; ứng dụng gửi/nhận timestamp đã chuẩn hóa UTC. SQLite tiếp tục lưu UTC ISO-8601.
- Không dựa vào timestamp phía client làm thứ tự duy nhất hoặc cơ chế giải quyết xung đột; cần version và quy tắc conflict riêng.

#### 7.5.3. Đơn vị cân nặng và chuyển đổi từ SQLite v1

Đề xuất contract: `weight_grams` dạng số nguyên (SQLite `INTEGER`, PostgreSQL `BIGINT`), nullable khi set chưa có mức tạ. Đây là khối lượng chuẩn hóa, không phải giá trị hiển thị; UI có thể đổi từ gram sang kg/lb theo lựa chọn người dùng. Cách lưu này tránh float trong so sánh và đồng bộ, đồng thời dùng chung đơn vị giữa các thiết bị.

SQLite v1 đang lưu `weight_value REAL` và `weight_unit` (`kg`/`lb`). Quy tắc chuyển đổi đề xuất:

```text
kg  -> round(weight_value × 1000) gram
lb  -> round(weight_value × 453.59237) gram
```

Quy tắc đã chốt: khối lượng không âm, làm tròn nearest gram, trường hợp đúng nửa gram làm tròn lên (tương đương `floor(x + 0.5)` cho input không âm). Sai số lượng tử hóa tối đa 0.5 gram, ngoài sai số vốn có của SQLite `REAL`. Giới hạn cân nặng tối đa và miền giá trị sản phẩm vẫn phải được chốt trước migration.

SQLite v1 hiện cho phép `weight_value` NULL, giá trị không âm và yêu cầu `weight_value`/`weight_unit` cùng có hoặc cùng NULL; repository kiểm tra finite và không âm nhưng database CHECK không áp đặt giới hạn trên. Không được suy ra dữ liệu thật chỉ từ constraint. Trước migration cần kiểm kê số lượng, NULL pairing, kiểu lưu SQLite, giá trị âm/non-finite, cận trên và conversion preview. Không chạy kiểm kê ở task tài liệu này. Bản ghi invalid/overflow phải được báo cáo và xử lý có chủ ý; không đổi thành 0, bỏ qua hoặc xóa. Thực hiện backfill theo hướng giữ trường gốc và có rollback cho đến khi đối chiếu số hàng, NULL và giá trị chuyển đổi đạt.

#### 7.5.4. Soft delete, versioning và sync outbox

- Các bản ghi đồng bộ cần có `deleted_at` nullable và version tăng khi thay đổi; soft delete được đồng bộ như một mutation, không xóa vật lý hàng đợi hoặc dữ liệu local trước khi server xác nhận.
- Outbox là bảng local-only, ghi cùng transaction với mutation nghiệp vụ. Mỗi mutation có ID ổn định/idempotency key, entity ID, loại thao tác, payload cần thiết, version cơ sở, thời điểm tạo và trạng thái/thông tin retry phù hợp.
- Gửi các mutation theo quan hệ phụ thuộc (ví dụ plan trước `plan_exercises`, session/exercise snapshot trước `workout_sets`); retry cùng idempotency key không được tạo bản ghi trùng.
- Mỗi bản ghi đồng bộ có `version` số nguyên tăng tuần tự do backend quyết định; mutation gửi `base_version`. Server chỉ chấp nhận nếu version hiện tại khớp, rồi tăng version và trả về trạng thái chuẩn cùng server timestamp.
- Khi version lệch, server trả conflict snapshot; giữ cả phiên bản server và thay đổi local, đánh dấu mutation conflict và chặn mutation phụ thuộc trên cùng entity. Không tự áp dụng “last write wins”. Cho phép người dùng giữ server hoặc áp dụng lại thay đổi local như mutation mới trên version mới nhất; merge chỉ khi quy tắc theo từng trường được định nghĩa và kiểm thử.
- Soft-delete tombstone thắng mutation cập nhật cũ. Khôi phục phải là thao tác tường minh có version hiện hành; không resurrect do retry hoặc pull dữ liệu cũ.
- Outbox cần gắn với phạm vi tài khoản/local identity để không gửi dữ liệu của một người dùng trong session của người khác.

#### 7.5.5. Ranh giới tài khoản và dữ liệu local cũ

Các bản ghi SQLite v1 hiện có chưa có owner và được xem là dữ liệu local chưa gán tài khoản (`owner_id = NULL`). Khi đăng nhập/đăng ký lần đầu, mặc định giữ chúng riêng, không gán owner, không nhập vào outbox của tài khoản và không upload.

Luồng nhập được chốt: sau xác thực, app trình bày lựa chọn rõ ràng giữ dữ liệu local riêng hoặc xem trước/chọn dữ liệu để nhập vào tài khoản hiện tại. Chỉ sau xác nhận mới gắn các aggregate được chọn với `auth.uid()` trong transaction local và tạo outbox mutations tương ứng. Bài tập hệ thống không được nhập thành bản sao cá nhân; bài tập cá nhân được nhập trước các plan tham chiếu; session snapshot và sets được nhập như aggregate. Nếu import thất bại một phần, giữ dữ liệu local và trạng thái outbox để retry, không xóa nguồn.

Mỗi bản ghi và outbox mutation phải thuộc một account partition hoặc vùng local chưa gán. Khi đổi tài khoản, chỉ mở partition của user tương ứng; outbox của user khác phải tạm dừng. UUID giữ nguyên trong import và được kiểm tra collision; nếu server đã có UUID cùng bản ghi nhưng nội dung khác, báo conflict thay vì ghi đè. Cách xử lý dữ liệu local khi user chọn “giữ riêng” (xem được ở trạng thái local-only hoặc xóa) và UI lựa chọn chi tiết cần được thiết kế trước khi triển khai.

#### 7.5.6. Bảo mật client

Ứng dụng mobile chỉ được dùng publishable key (hoặc anon key legacy nếu project còn yêu cầu) cùng phiên người dùng đã xác thực và RLS. Không đóng gói service-role/secret key trong app, biến môi trường client, bundle hay log. Quyền truy cập Data API/grants phải được cấu hình riêng và không được xem là thay thế cho RLS.

#### 7.5.7. Retry và idempotency

- Mỗi mutation có `mutation_id` UUID ổn định, được tạo một lần và giữ nguyên qua mọi retry; `entity_id` cũng ổn định. Backend duy trì receipt duy nhất theo `(user_id, mutation_id)` và ghi receipt cùng thay đổi dữ liệu trong một transaction. Replay cùng ID được tra receipt trước version check và trả lại kết quả đã ghi mà không áp dụng mutation lần nữa. Receipt không được purge khi vẫn có thể tồn tại client outbox cần retry; chính sách retention cần bảo đảm điều kiện này.
- Việc so sánh `base_version`, áp mutation, ghi idempotency receipt và trả version mới phải nguyên tử. Thiết kế cần một mutation channel server-side có xác thực `auth.uid()`; không cho mobile ghi trực tiếp receipt ledger hoặc sync tables. Phương án khả thi và quyền còn phải duyệt được ghi tại mục 7.12.
- Xử lý FIFO theo entity và theo quan hệ FK: `users`/exercise trước plan; plan trước `plan_exercises`; session và `session_exercises` trước `workout_sets`. Chỉ gửi mutation kế tiếp của cùng entity sau khi mutation trước được xác nhận hoặc giải quyết conflict.
- Lỗi mạng, timeout, HTTP 408/429 và lỗi 5xx: retry exponential backoff có jitter, thời gian chờ tối đa 15 phút; tôn trọng `Retry-After` khi có. Không bỏ mutation sau số lần thử cố định; giữ pending qua lần khởi động lại.
- HTTP 401: thử refresh session theo Auth một lần, sau đó tạm dừng outbox của account nếu không thể xác thực. HTTP 403 hoặc lỗi validation khác 408/429: đánh dấu cần xử lý, không retry vòng lặp. Version mismatch: chuyển trạng thái conflict, không xem là lỗi retry tạm thời.
- Mutation hoàn tất chỉ được loại khỏi outbox sau khi nhận/khôi phục được receipt thành công; lần gửi lại dùng nguyên `mutation_id`. Xóa local payload chỉ theo retention đã xác nhận riêng.

### 7.6. Hợp đồng cột PostgreSQL và SQLite mục tiêu

Tên cột PostgreSQL dùng `snake_case`; SQLite dùng cùng tên cột để mapping ổn định. PostgreSQL `uuid`, `boolean`, `bigint`, `integer`, `text` và `timestamptz` tương ứng SQLite `TEXT` canonical UUID, `INTEGER` 0/1, `INTEGER`, `INTEGER`, `TEXT` và UTC ISO-8601 `TEXT`. Không đồng bộ SQLite-only outbox hoặc token/session secrets lên PostgreSQL.

| Bảng | Cột nghiệp vụ cốt lõi | Cột owner và quan hệ | Cột đồng bộ |
|---|---|---|---|
| `users` | `display_name`, `preferred_weight_unit` | `id` vừa là PK vừa FK tới `auth.users.id` | `created_at`, `updated_at`, `deleted_at`, `version` |
| `exercises` | `scope` (`system`/`user`), `name`, `primary_muscle_group`, `equipment`, `difficulty`, `instructions`, `is_archived` | `owner_id` NULL cho system, bằng `auth.uid()` cho user exercise | `created_at`, `updated_at`, `deleted_at`, `version` |
| `workout_plans` | `name`, `description`, `is_archived` | `user_id` bắt buộc | `created_at`, `updated_at`, `deleted_at`, `version` |
| `plan_exercises` | `position`, `target_sets`, `target_reps_min`, `target_reps_max`, `rest_seconds` | `user_id`, `plan_id`, `exercise_id`; plan phải thuộc cùng user, exercise phải là system hoặc user-owned | `created_at`, `updated_at`, `deleted_at`, `version` |
| `workout_sessions` | `title` (snapshot tiêu đề tại lúc bắt đầu), `status`, `started_at`, `completed_at` | `user_id`; `plan_id` nullable để giữ session nếu plan bị purge | `created_at`, `updated_at`, `deleted_at`, `version` |
| `session_exercises` | `position`, target sets/reps/rest và snapshot bài tập | `user_id`, `session_id`, `source_exercise_id` nullable | `created_at`, `updated_at`, `deleted_at`, `version` |
| `workout_sets` | `set_number`, `weight_grams`, `reps`, `is_completed`, `completed_at` | `user_id`, `session_exercise_id` | `created_at`, `updated_at`, `deleted_at`, `version` |

Snapshot `session_exercises` chứa tên, nhóm cơ chính, thiết bị, độ khó, instructions và target configuration tại thời điểm bắt đầu; `source_exercise_id` chỉ là tham chiếu tùy chọn, không phải nguồn hiển thị lịch sử. `workout_sessions.title` lưu tên buổi/kế hoạch tại thời điểm bắt đầu. Không cascade xóa vật lý khi user xóa/đổi catalog; giữ snapshot và dùng tombstone. Hard purge chỉ qua retention/account deletion đã duyệt.

Mọi bảng đồng bộ dùng UUID do client tạo trước khi ghi local; UUID v1 dạng 32 hex được biểu diễn lại thành chuỗi UUID canonical bằng cách chèn dấu gạch nối, giữ nguyên toàn bộ 128 bit cho tất cả FK. PostgreSQL `uuid` không yêu cầu phiên bản UUID cụ thể; ID mới phải tạo bằng generator chuẩn đã xác minh ở giai đoạn triển khai. `created_at`/`updated_at` server-side là metadata server-authoritative; `started_at`, `completed_at` là thời điểm nghiệp vụ UTC từ thiết bị và không được dùng để phân xử conflict. `version` là PostgreSQL `BIGINT`/SQLite `INTEGER`, bắt đầu từ 1 và chỉ server tăng khi chấp nhận mutation.

`is_archived` hiện có nghĩa là ẩn khỏi danh sách thông thường và khác với `deleted_at`, là tombstone đồng bộ. Không diễn giải archive thành delete. Cột version bắt đầu từ 1 và tăng khi server chấp nhận mutation; client không được tự sửa server version. Constraint mục tiêu giữ các quy tắc hiện có: position không âm, set number/target sets/reps hợp lệ, max reps >= min reps, weight và unit cùng nullable theo model v1 trước conversion, `weight_grams >= 0`, completed set cần reps dương và timestamp hoàn tất.

#### 7.6.1. Quyền sở hữu và Auth

Mô hình Auth là Email/Password với xác minh email trước khi app mở dữ liệu cloud, password reset qua email và PKCE cho callback mobile. Cấu hình callback/redirect allowlist phải dùng URL chính xác theo app scheme và từng môi trường. Password không được lưu ở SQLite hoặc log. Trên iOS/Android, Auth Client/Session dùng `expo-secure-store` `~57.0.4` để lưu session material (đặc biệt refresh token); adapter và config plugin đã được tích hợp. Chưa kiểm thử persistence/restore, lỗi native hoặc Android backup trên thiết bị thật. Web không có SecureStore nên đăng nhập web bị tắt cho đến khi storage/session model riêng được duyệt. SecureStore có thể từ chối payload lớn tùy nền tảng; phải xử lý lỗi thay vì giả lập thành công. Tài liệu Supabase Auth hiện nêu email confirmation bật mặc định trên hosted projects; cấu hình project thực tế phải được kiểm tra, không giả định local/self-hosted giống hosted.

Giữ access-token lifetime mặc định Supabase hiện hành (60 phút theo tài liệu) và cho Auth client xử lý refresh; chưa bật session single-device hoặc custom inactivity timeout cho MVP. Các cấu hình project thực tế phải được xác minh trước phát hành.

Không tạo Auth DB trigger để tạo profile ở giai đoạn này. Sau khi email được xác nhận và app có session, profile `users.id = auth.uid()` được tạo idempotently qua mutation channel được bảo vệ; không cấp quyền DML trực tiếp từ Data API nếu điều đó cho phép bypass version/idempotency receipt. Profile chỉ chứa dữ liệu ứng dụng, không lặp email/password. Không dùng `user_metadata` trong authorization. Cần xác định cách endpoint xác nhận email verified từ Auth/JWT phía server; không tin cờ do client gửi.

| Bảng | Quyền dự kiến |
|---|---|
| `users` | Client chỉ đọc profile của mình; profile create/update qua mutation channel với `id = auth.uid()`; không hard-delete. |
| `exercises` | `system` read-only cho role được cấp; user exercise chỉ owner ghi mềm qua mutation channel; không cho client tạo/đổi `scope=system`. |
| `workout_plans`, `workout_sessions` | Client đọc theo owner; ghi/tombstone qua mutation channel với `user_id` do server suy ra; không hard-delete. |
| `plan_exercises`, `session_exercises`, `workout_sets` | Client đọc theo parent/owner; mutation channel xác nhận parent/reference cùng owner; không hard-delete. |
| `sync_mutations` receipt | Không public/client table write; chỉ transactional sync command xử lý sau khi xác thực user. Nếu thuộc exposed schema, bật RLS; nếu đặt private thì vẫn giới hạn grants. |

Tất cả bảng được expose phải bật RLS; grants chỉ cấp đúng thao tác cần dùng. Với direct DML bị revoke, policies vẫn cần được xác minh bằng role/function context thực sự thi hành mutation; UPDATE policies phải có `USING` và `WITH CHECK`. Profile/child ownership dùng `(select auth.uid())` pattern và index phù hợp. `TO authenticated` không thay cho ownership. Kiểm thử phải chứng minh cả allow lẫn deny với hai account, `anon`, sửa `user_id`, liên kết child sang parent khác owner, truy cập row soft-deleted và thao tác delete.

#### 7.6.2. SQLite outbox và partition tài khoản

SQLite migration tương lai thêm owner/account partition cho dữ liệu cá nhân, sync metadata (`server_version`, trạng thái local/server, sync timestamps) và bảng outbox local-only. Trong SQLite, `user_id` phải nullable để biểu diễn dữ liệu local-unassigned v1; mọi bản ghi PostgreSQL user-owned cần `user_id` not null. System exercises không có user owner. Mọi query nghiệp vụ phải lọc active account hoặc local-unassigned partition. Outbox fields tối thiểu: `mutation_id`, `account_id`, `entity_type`, `entity_id`, operation, payload/schema version, `base_version`, dependency, created time, retry count/next retry, state và last error code. Không lưu password, access token hay refresh token trong outbox.

Mutation dữ liệu và thêm outbox row diễn ra trong transaction SQLite duy nhất. Lỗi transaction rollback cả hai. Outbox row chỉ có thể gửi khi session `auth.uid()` bằng `account_id`; unassigned account không được gửi. Không xóa pending outbox khi logout hoặc đổi account.

### 7.7. Migrations, chuyển đổi và giới hạn xác minh

Supabase imperative migrations hiện có trong `supabase/migrations/`; bốn file PostgreSQL Core Schema Migration v1 được scaffold bởi Supabase CLI và chỉ chứa SQL chưa áp dụng. Kiểm tra local test ngày 2026-10-21 bị BLOCKED trước SQL: Docker, Supabase CLI và `supabase/config.toml` không có; chỉ static inventory check đạt, chưa có PostgreSQL/runtime evidence. Trước khi tiếp tục phải cung cấp/chuẩn bị local disposable stack đã xác minh, kiểm tra CLI/version, migration history và môi trường; sau phê duyệt mới chạy fresh test, policy tests và advisors. Không push remote khi chưa có phê duyệt riêng.

SQLite migration phải giữ nguyên bản nguồn đến khi UUID mapping/FK integrity và conversion cân nặng được kiểm chứng. Kiểm thử trên bản sao dữ liệu: đếm hàng trước/sau theo bảng; kiểm tra PK/FK/unique; NULL và unit pairing; finite/non-negative/range; conversion round trip so với dung sai gram; ID UUID mapping đồng nhất ở mọi quan hệ; rollback; người dùng local-unassigned không bị tự động gắn owner. Không được cập nhật database gốc trước khi backup và có kế hoạch rollback.

### 7.8. Trạng thái và phạm vi Phase 3.T06–T11

T06–T11 đã hoàn tất ở mức thiết kế/review tài liệu. Nội dung dưới đây không phải SQL đã chạy, migration đã tạo, test đã thực thi, hoặc phê duyệt triển khai. Các blocker trước khi viết code được tổng hợp tại `risks-decisions.md`.

### 7.9. PostgreSQL schema, quan hệ và constraints (T08)

Các tên/kiểu sau là hợp đồng thiết kế, không phải DDL. Bảy bảng nghiệp vụ đều dự kiến trong schema Data API `public`, UUID làm khóa chính, `created_at`/`updated_at` là `timestamptz` do server quản lý; `version` là số nguyên dương do server tăng. `deleted_at` là tombstone, khác với trạng thái archive.

| Bảng | Quan hệ và ràng buộc mục tiêu |
|---|---|
| `users` | `id` PK đồng thời FK `auth.users(id)`; profile tối thiểu, không lưu credential. `preferred_weight_unit` chỉ `kg`/`lb`; version dương. |
| `exercises` | `id` PK; `scope` chỉ `system`/`user`; `system` bắt buộc `owner_id IS NULL`, `user` bắt buộc `owner_id` trỏ `users(id)`. Catalog key ổn định/duy nhất cho dữ liệu system nếu được chọn. Không cho client sửa row system. |
| `workout_plans` | `id` PK; `user_id` FK `users(id)`; thêm unique `(id, user_id)` để làm đích FK composite; tên không rỗng; `is_archived` độc lập với tombstone. |
| `plan_exercises` | `id` PK; `user_id` FK profile; FK composite `(user_id, plan_id)` tới plan; FK `exercise_id` tới exercise với purge bị `RESTRICT`; unique active `(plan_id, position)` khi `deleted_at IS NULL`; position không âm, target sets dương, reps dương nếu có và max >= min, rest không âm. RLS cũng phải xác nhận exercise là system hoặc thuộc user. |
| `workout_sessions` | `id` PK; `user_id` FK profile; `plan_id` nullable FK plan, nhưng policy phải xác nhận cùng owner; unique `(id, user_id)`; status chỉ `active`/`paused`/`completed`; completed cần `completed_at`, trạng thái khác không được có; `started_at` là thời điểm nghiệp vụ UTC. |
| `session_exercises` | `id` PK; `user_id` FK profile; FK composite `(user_id, session_id)` tới session; `source_exercise_id` nullable FK exercise với `ON DELETE SET NULL`; unique active `(session_id, position)`; position/target constraints như plan; snapshot tên và thuộc tính cần hiển thị lịch sử không phụ thuộc row nguồn. |
| `workout_sets` | `id` PK; `user_id` FK profile; FK composite `(user_id, session_exercise_id)` tới session exercise; unique active `(session_exercise_id, set_number)`; set number dương; `weight_grams` nullable, không âm và trong giới hạn ứng dụng; reps không âm; set completed cần reps dương và `completed_at`. |

Không cấp quyền hard-delete cho mobile; delete nghiệp vụ là `UPDATE deleted_at`. Delete behavior vật lý dự kiến: `plan_exercises` cascade khi plan được purge; `plan_exercises.exercise_id` restrict purge exercise còn đang được plan tham chiếu; `workout_sessions.plan_id` set null khi plan được purge để giữ session; `session_exercises` cascade khi session được purge; `workout_sets` cascade khi session exercise được purge; `session_exercises.source_exercise_id` set null khi source exercise bị purge; xóa profile/account chỉ qua retention-checked account-deletion workflow. Các cascade/set-null không chạy khi soft delete. Purge user phải tuân retention/account-deletion đã duyệt. Snapshot của session luôn là nguồn sự thật cho lịch sử, kể cả khi exercise hoặc plan nguồn bị archive/tombstone.

RLS/ownership được thiết kế riêng theo bảng (mọi biểu thức owner dùng `(select auth.uid())`; không dựa vào `TO authenticated` đơn lẻ). Supabase anonymous Auth users cũng dùng DB role `authenticated`, vì vậy policy phải phủ nhận JWT `is_anonymous=true`. Project phải bật email confirmation; claims/config xác minh email cần được kiểm tra trước khi cho cloud access. Cột điều kiện ghi bên dưới mô tả invariant policy phải bảo vệ nếu có đường DML invoker; không đồng nghĩa cấp quyền ghi trực tiếp cho Data API:

| Bảng | `anon` | `authenticated` — điều kiện hàng |
|---|---|---|
| `users` | Không có grant/policy | Permanent authenticated SELECT chỉ row `id = auth.uid()`; anonymous Auth JWT bị policy từ chối; không DELETE. |
| `exercises` | Không có grant/policy | Permanent authenticated SELECT system catalog và row cá nhân của mình; client không ghi hoặc đổi scope. |
| `workout_plans` | Không có grant/policy | Permanent authenticated SELECT theo `user_id=auth.uid()`; không DELETE. |
| `plan_exercises` | Không có grant/policy | SELECT chỉ khi parent plan thuộc `auth.uid()` và exercise system/own; không DELETE. |
| `workout_sessions` | Không có grant/policy | SELECT theo owner; composite FK ràng buộc `plan_id` cùng owner; không DELETE. |
| `session_exercises` | Không có grant/policy | SELECT chỉ khi parent session thuộc owner; snapshot không phụ thuộc source exercise row. |
| `workout_sets` | Không có grant/policy | SELECT chỉ khi parent session exercise thuộc owner; không DELETE. |

Owner SELECT phải bao gồm tombstone của chính họ để pull/sync có thể quan sát delete; UI lọc tombstone khỏi nội dung hoạt động thường. Core migration không cấp bất kỳ DML nào cho client và không tạo UPDATE policy; vì vậy hiện client không thể thay `user_id` hoặc scope. Nếu gateway/write policy được duyệt về sau, phải có `USING` và `WITH CHECK`, xác minh chuỗi parent và exercise system-or-same-owner; composite FK khóa chặt owner-parent. Row system chỉ được ghi qua quy trình quản trị tin cậy. Trong rollout này `anon` không được cấp catalog access.

**Grants/Data API:** bốn migration core v1 thu hồi privileges cụ thể trên cả bảy bảng khỏi `PUBLIC`, `anon`, `authenticated`, `service_role`, rồi chỉ cấp `SELECT` cho `authenticated` (không cấp `anon`). Project exposure, schema `USAGE`, migration owner và `pg_default_acl` hiện trạng cần xác minh trước apply; không thay đổi default privileges toàn cục hoặc grants trên các bảng khác. Không cấp DML trực tiếp trên các bảng sync-managed, cũng không cấp `DELETE`, `TRUNCATE`, `REFERENCES`, `TRIGGER`, quyền ghi system catalog hay quyền client tới receipt ledger. Nếu triển khai mutation endpoint/RPC, chỉ cấp `EXECUTE` sau threat-model/security review; lựa chọn RPC hay server-side endpoint, cách thực thi DML mà không mở đường ghi trực tiếp, và kiểm tra ownership/version/receipt nguyên tử vẫn là blocker. Nếu RPC cần `SECURITY DEFINER`, phải có `auth.uid()` check trong function body, fixed/empty `search_path`, fully qualified objects, thu hồi `EXECUTE` khỏi `PUBLIC`/`anon`, cấp đúng role và đặt ở boundary được review; không coi RLS là guard cho function definer. Receipt ledger trong schema không expose vẫn cần grants giới hạn và RLS defense-in-depth. Mọi view/function expose cần review riêng (view dùng `security_invoker` nếu phù hợp). Không đưa service-role/secret key vào app.

**Index đã tạo trong migration nhưng chưa đo workload:** các index owner/list `workout_plans(user_id, updated_at DESC)` và `workout_sessions(user_id, started_at DESC)` giữ tombstone cho pull; FK indexes `exercises(owner_id)`, `workout_sessions(plan_id)`, `plan_exercises(exercise_id)`, `session_exercises(source_exercise_id)`; owner-first child indexes theo `user_id` và parent; partial unique index chỉ cho position/set number của row chưa tombstone. PK/composite unique cung cấp các index còn lại. Không có index trùng unique prefixes hoặc index speculative catalog search. Chưa có `EXPLAIN`/advisor; kiểm chứng trên workload thực trước production.

**Core migrations đã chuẩn bị nhưng chưa thực thi:** (1) parent tables; (2) child tables; (3) indexes; (4) SELECT RLS/grants. Bảng được tạo với RLS bật và table privileges bị revoke trong cùng transaction; group cuối tạo policies rồi cấp authenticated SELECT, không cấp anon hoặc client DML. Receipt ledger/gateway là nhóm riêng chưa được duyệt, không thuộc core. Xác minh CLI/workflow, environment, grants/default ACL, migration history và backup trước khi apply; chỉ test trên local disposable database sau khi được duyệt. Không chạy SQL hoặc remote push trước phê duyệt riêng.

**Security test design:** test grants độc lập với RLS; `anon` không đọc được bảng nào, kể cả catalog system, và mọi write bị từ chối; A/B không SELECT row/tombstone của nhau; thử đổi owner, scope, parent ID và exercise reference sang account khác; test row policies trong fixture tách biệt có DML grants hẹp, không mở các grants đó ở production; test endpoint mutation qua hai user và các version/receipt; child ownership/FK không vượt qua policy; system exercise không thể bị client tạo/sửa/xóa; soft delete vẫn pull được owner nhưng không lộ cho account khác; hard DELETE bị grant từ chối; JWT thiếu/không hợp lệ bị từ chối. Kiểm thử dùng ít nhất hai user/session giả lập và cả `anon`, không chỉ kiểm tra SQL policy text.

### 7.10. SQLite schema v2 và migration design (T09)

SQLite v2 giữ lại 6 bảng v1 và bổ sung profile cục bộ `users`; thêm `user_id` nullable cho các dữ liệu cá nhân (NULL biểu thị local-unassigned), `owner_id` nullable trên exercise cá nhân, `scope` system/user, `version` server nullable, metadata đồng bộ/local revision, `deleted_at`, và UTC ISO-8601 text. UUID lưu canonical dạng TEXT; mọi FK giữ nguyên 128 bit ID từ v1 bằng cách canonicalize 32 hex hiện có, không sinh lại ID. System exercise không được đưa vào outbox như entity cá nhân. Local SQLite có thể giữ legacy exercise user-scope chưa owner; PostgreSQL chỉ nhận row cá nhân sau explicit import và gắn owner.

Các bảng dữ liệu cá nhân được cô lập theo `user_id` đang hoạt động hoặc nhóm NULL chưa gán. Account switch phải đóng/khóa partition cũ, dừng outbox không thuộc session hiện tại và chỉ tải partition của `auth.uid()` tương ứng. Không có thao tác đăng nhập nào tự chuyển NULL thành user ID. Chuyển dữ liệu local-unassigned thành account-owned là luồng import riêng: preview/chọn, xác nhận, kiểm tra collision UUID, gắn owner và enqueue theo aggregate trong transaction; giữ nguồn cho đến khi server xác nhận.

`sync_outbox` là SQLite-only, tối thiểu gồm `mutation_id` UUID unique, `account_id`, `entity_type`, `entity_id`, operation, payload/schema version, `base_version`, optional dependency mutation, `created_at`, `retry_count`, `next_attempt_at`, trạng thái (`pending`/`conflict`/`blocked`) và error code. Không chứa token/credential. Tạo mutation nghiệp vụ và outbox row trong cùng transaction. Tombstone không purge trước ack/retention; conflict giữ server snapshot lẫn local payload, không tự overwrite. Các row synced vẫn giữ `server_version`; chỉ server quyết định version mới. Tên/kiểu cuối cùng của metadata SQLite cần đối chiếu với implementation domain khi được phép code.

**V1→V2 migration sequence:** (1) khóa ghi và ghi nhận `user_version`/counts; tạo backup nhất quán bằng phương thức SQLite hỗ trợ, xác minh backup mở/đọc được; không copy file đang chạy tùy tiện khi WAL chưa được xử lý. (2) chạy preflight trên bản sao: counts từng bảng, PK/FK/unique, toàn bộ FK ID, exercise legacy chưa phân loại, NULL pairing, `typeof(weight_value)`, unit, non-finite/âm/vượt giới hạn và conversion preview theo từng hàng. (3) chỉ sau khi report được xem xét, chạy migration transactional: tạo bảng v2 mới, copy ID theo canonical UUID đồng nhất tại tất cả FK, giữ snapshots, chuyển giá trị hợp lệ sang gram và giữ trường legacy/backup trong giai đoạn xác minh; tạo outbox rỗng cho dữ liệu cũ, không tự assign ownership. (4) kiểm tra counts, FK/unique, UUID, status/timestamps, nullability và từng kết quả gram; chỉ đổi `user_version` khi mọi invariant đạt. (5) mở ghi v2 sau khi pass nghiệm thu.

Weights: `kg * 1000`, `lb * 453.59237`, nearest gram/ties upward cho số không âm. Báo cáo cần có phân phối, NULL/paired NULL, unit lạ, âm, non-finite, cận trên, giá trị chuyển đổi/rounding và hàng không chuyển được. Miền tối đa ứng dụng chưa được chốt; nên giới hạn trong miền integer an toàn của JS/Expo SQLite và miền sản phẩm đã duyệt. Không chuyển im lặng invalid/overflow thành NULL/0. Nếu có hàng ngoài miền, dừng migration và yêu cầu quyết định xử lý; giữ nguồn nguyên vẹn.

**Rollback/recovery:** lỗi trước commit phải rollback transaction và giữ schema version cũ. Nếu commit xong nhưng kiểm tra chưa đạt, không mở app v2; khôi phục backup đã xác minh theo quy trình an toàn, hoặc giữ DB ở trạng thái khóa để điều tra. Sau khi app đã ghi dữ liệu v2, không restore backup cũ một cách mù quáng vì sẽ mất mutation mới; ưu tiên forward-fix hoặc downgrade có kiểm kê/export và đối soát. Giữ payload cân nặng legacy đến khi chấp nhận conversion; không dùng down-migration lossy làm rollback mặc định. Thử cả failure injection trước khi bật migration cho người dùng.

### 7.11. Ranh giới review T11 và điều kiện triển khai

Hợp đồng PostgreSQL–SQLite thống nhất UUID/quan hệ/snapshot, gram, tombstone, owner partition và server version. Phân biệt archive/delete và thời gian nghiệp vụ/server đã rõ. Review không phát hiện một thay đổi task name/scope cần thiết: T08–T11 giữ nguyên tên/phạm vi/dependencies trong mindmap. Tuy nhiên đây là review tài liệu, chưa xác minh bằng database, RLS runtime, migration thử trên bản sao thật hoặc query plan.

Các blocker trước triển khai: chọn project/môi trường và Data API grants/default privileges; chốt catalog seed/định danh legacy exercises; chạy kiểm kê weight thực tế và chốt giới hạn; chốt profile/retention/account deletion và tombstone/receipt retention; hoàn tất threat-model/review cho transaction RPC + receipt, grants/function search path và atomicity; chốt UX conflict/import và chính sách lưu local-only; cấu hình Auth redirects/email/password/rate limits và SecureStore; xác định workload để xác nhận indexes. Các mục cụ thể cùng điều kiện gỡ được liệt kê trong `risks-decisions.md`.

Chỉ sau khi chủ dự án duyệt các blockers/schema và cho phép triển khai mới tạo migrations, cài dependency, chạy SQL, triển khai Auth/Sync hoặc chuyển đổi DB. T10 là test plan, không phải kết quả chạy test; chi tiết ở `testing-acceptance.md`.

### 7.12. Pre-Implementation Gate — kết quả review 2026-10-21

Gate này chỉ đọc repository/schema trong mã nguồn và tài liệu Supabase/Expo; không mở `.env`, không truy vấn/đọc database đang dùng, không chạy SQL hoặc migration, không cài package và không sửa code. Repository chưa có `supabase/`, `config.toml`, migration/schema declarative, Auth client hoặc sync/outbox implementation. `@supabase/supabase-js` đã có trong dependency, nhưng `expo-secure-store` chưa có. Project Supabase, grants/default privileges, dữ liệu SQLite thực tế, deployment settings và runtime policies chưa thể xác minh từ mã nguồn.

#### 7.12.1. So sánh code SQLite v1 với hợp đồng đích

| Hợp đồng đích | Hiện trạng code v1 | Hệ quả/gate |
|---|---|---|
| 7 bảng, UUID canonical, `users.id = auth.users.id` | Sáu bảng SQLite; ID mặc định `lower(hex(randomblob(16)))` (32 hex chars); không có profile/owner | Canonicalize UUID giữ nguyên 128 bit, kiểm tra tất cả PK/FK; hiện không có dữ liệu owner để gán. |
| Exercise `system`/`user` | `exercises` không có `scope`/`owner_id`; repository `create` chỉ tạo một loại | Không thể phân loại hoặc seed catalog system theo suy đoán. Chốt nguồn/version catalog và cách ánh xạ exercise legacy trước import. |
| Session snapshot | `session_exercises` giữ `exercise_name`, source exercise ID nullable, position/targets/rest; không snapshot muscle/equipment/difficulty/instructions | Có thể backfill best-effort từ exercise hiện còn; dữ liệu nguồn đã xóa/thay đổi không thể khôi phục giá trị “as-of”. Xác nhận trường lịch sử bắt buộc và biểu diễn snapshot legacy thiếu. |
| Soft delete, `version`, transactional outbox, account partition | Không có owner, `deleted_at`, version, local revision, outbox hay account filters | Mọi query/repository cần partition-aware; không bật Auth/cloud data trước khi ngăn truy cập chéo account và local-unassigned. |
| `weight_grams INTEGER` | `workout_sets.weight_value REAL`, `weight_unit` kg/lb; repository kiểm tra finite/nonnegative và paired NULL, DB CHECK không giới hạn cận trên | Chưa có dữ liệu thật/biên sản phẩm; preflight trên backup và giới hạn gram an toàn cho SQLite/JavaScript bắt buộc. |
| Nghiệp vụ + outbox cùng transaction | Tạo session và snapshot children nằm trong transaction; `addSet` ghi set, cập nhật parent timestamp và đọc lại qua nhiều lệnh riêng; `addExercise` cũng insert link rồi cập nhật plan riêng | Khi thêm outbox, phải gộp mutation nghiệp vụ và enqueue trong transaction; hiện lỗi ở bước sau có thể để dữ liệu chính thành công nhưng parent metadata chưa cập nhật. |
| Transaction scoping/concurrency | `initializeDatabase` và `create session` dùng `withTransactionAsync`; SDK 57 docs cảnh báo truy vấn khác chạy cùng lúc trên connection có thể bị cuốn vào transaction này | Repository v2 cần transaction scope cô lập (đánh giá `withExclusiveTransactionAsync` cho platform đích hoặc một serialized write queue), không chạy network/await ngoài transaction; test interleaving rollback và bảo đảm không rollback/commit nhầm write khác. |
| Rollback/restore trên thiết bị | Migration test dùng `node:sqlite` `:memory:`, có rollback/version guard nhưng không có fixture DB file/WAL backup-restore | Cần test file-based, backup/restore và interrupted upgrade trên bản sao; không kết luận rollback sau khi v2 đã ghi dữ liệu mới. |

Các repository hiện chưa được khởi tạo từ app; auth routes là placeholder. Đây là storage scaffold, không phải luồng offline-first được tích hợp end-to-end. Không đọc database vật lý hoặc xác định số lượng/trạng thái dữ liệu người dùng trong gate này.

#### 7.12.2. Review mutation RPC, grants, RLS và receipt

RPC có thể gom mutation vào một transaction PostgreSQL/PostgREST, nhưng chỉ “dùng RPC” không tự bảo đảm idempotency. `SECURITY INVOKER` với chỉ quyền `EXECUTE` không thể DML bảng nếu caller không có grants tương ứng; cấp DML cho caller lại mở đường Data API ghi trực tiếp và bypass version/receipt contract, trừ khi có enforcement DB bắt buộc khác. Đây là trust-boundary blocker.

**Phương án ưu tiên để đánh giá (chưa được duyệt):** function hẹp trong schema `api` riêng được Data API expose, chỉ `authenticated` được `EXECUTE`; sync tables không cấp DML trực tiếp cho `anon`/`authenticated`. Nếu cần `SECURITY DEFINER`, gán function cho role NOLOGIN, không phải table owner, không `BYPASSRLS`, chỉ có quyền tối thiểu trên bảng/receipt, và tạo policies áp dụng cho role đó cùng owner predicates. Function phải lấy user từ `(select auth.uid())`, từ chối identity NULL, không tin `user_id`/email/user id từ payload, kiểm tra parent/child cùng owner và xác minh email-confirmation requirement phía server. Không dùng `postgres`/BYPASSRLS làm shortcut; RLS không tự bảo vệ definer chạy bằng role bypass. Pin `search_path=''`, schema-qualify mọi object, revoke `EXECUTE` khỏi `PUBLIC`/`anon`, grant chính xác cho `authenticated`, audit schema usage/function overload, giới hạn operation/payload/schema và không dynamic SQL identifiers từ client. Bảng receipt ở schema không expose.

Đây là hướng cần proof-of-concept và security review, không phải DDL cuối. Supabase khuyến nghị `SECURITY INVOKER` mặc định và cảnh báo function definer do `postgres` sở hữu bypass RLS. Nếu không chấp nhận definer đã harden, phương án khác là Edge Function/backend tin cậy dùng secret chỉ server-side; nó vẫn phải gọi một DB transaction/RPC atomic, không tách thành nhiều REST writes. Chọn gateway, schema API exposure và function ownership cần được xác nhận trước khi viết code/SQL.

**Mutation protocol bắt buộc trước implementation:**

1. Envelope gồm `mutation_id`, `entity_type`/operation allowlist, `entity_id`, `base_version`, payload schema version và payload; user ID luôn suy ra từ Auth context. Server canonicalize và tính request hash (không nhận hash do client tự khai), scope theo user. Chọn digest built-in/extension hay lưu canonical request JSON để đối chiếu là quyết định implementation còn mở.
2. Receipt có unique `(user_id, mutation_id)`, request identity/hash, outcome terminal và kết quả ack canonical đủ để replay ổn định. Retry cùng ID/request trả đúng kết quả đã ghi; cùng ID nhưng nội dung khác bị từ chối, không apply lại. Chốt lưu full canonical row snapshot trong receipt hay ack/version tối thiểu + fetch latest, vì entity có thể đã tiến thêm version trước replay.
3. Một POST/RPC transaction xác nhận identity/operation; claim hoặc tra receipt; replay nếu đã tồn tại; nếu chưa thì xác minh owner/parent/reference, khóa row hiện hữu, kiểm tra version/tombstone, chỉ apply field allowlist, tăng version server-side và ghi result/receipt cùng dữ liệu. Unique receipt xử lý duplicate concurrent; PK/unique collisions không được overwrite.
4. Version conflict được lưu như outcome terminal cùng snapshot/version; retry ID cũ trả conflict cũ. Resolve/reapply là mutation mới với ID/base version mới. Transaction transient rollback không ghi receipt thành công; retry giữ ID cũ. Auth/validation failures không được biến thành success-shaped response.
5. Mỗi RPC xử lý một mutation/entity; import aggregate dùng dependency chain FIFO và enqueue local atomically. Không gọi HTTP bên trong transaction/row lock. Không nhận dynamic table/column names hay arbitrary JSON patch.
6. Receipt retention phải dài hơn khả năng retry của outbox. Contract hiện không có retry TTL và không tự drop mutation, nên chỉ retention vô hạn mới bảo đảm replay vô hạn. Nếu không muốn retention vô hạn, cần chốt max retry age và protocol reconcile/full fetch khi receipt hết hạn trước khi purge.

Mỗi PostgREST request chạy trong transaction, mặc định READ COMMITTED; một mutation cần một RPC `VOLATILE` POST duy nhất. Transaction không tự giải quyết hai version check đồng thời: cần row lock hoặc conditional atomic update, unique race handling và test concurrency. Không giữ transaction mở qua network call.

#### 7.12.3. Thứ tự triển khai đề xuất sau khi được duyệt

| Bước | Phạm vi sau phê duyệt | Kiểm thử trước khi tiếp tục | Rollback/containment |
|---|---|---|---|
| 0. Chốt hợp đồng | Chọn RPC/gateway, mutation/receipt/retention, catalog legacy, snapshot, pull cursor, profile retention, import UX và môi trường. Kiểm kê/backup SQLite chỉ trên bản sao theo phê duyệt riêng. | Decision record; report weight/UUID/FK/snapshot và fixtures; không còn row không giải trình. | Chưa đổi runtime/database; dừng nếu thiếu quyết định hoặc backup chưa kiểm chứng. |
| 1. PostgreSQL core | Local/dev migrations cho bảng/constraints/FK, không expose DML client. | Fresh install/upgrade fixtures, CHECK + NULL, FK composite/delete behavior, version/timestamp/weight boundaries. | Reset local disposable DB; staging/prod migration additive/forward-only, backup; không destructive down migration. |
| 2. RLS/read security | RLS trên mọi exposed table; chốt API schema/default privileges; grants đọc tối thiểu, anon catalog chỉ nếu duyệt. | Grants audit, `anon`/A/B isolation, tombstone visibility, không bảng exposed thiếu RLS; advisors. | Revoke table/schema grants hoặc disable exposure; giữ migration additive để sửa policy. |
| 3. Mutation channel | Role/policies/receipt/RPC theo thiết kế đã duyệt; chỉ EXECUTE, direct DML bị từ chối. | Race version, duplicate/replay/hash mismatch, timeout sau commit, rollback, cross-owner, owner/BYPASSRLS/search_path/EXECUTE audit. | Revoke EXECUTE/disable feature; giữ schema/receipts, sửa bằng forward migration. |
| 4. SQLite v2 | Sau preflight/backup, migration file-based sang UUID/grams/partition/outbox trên bản sao trước rollout. | Duyệt conversion report; counts/PK/FK/UUID/snapshot; failure injection, restart, backup restore, account isolation và write-interleaving test cho Expo transaction. | Trước khi v2 writes: transaction rollback/restore backup. Sau v2 writes: không restore backup cũ làm mất writes; khóa sync, forward-fix hoặc export/reconcile. |
| 5. Auth/profile | SecureStore theo SDK 57, PKCE/deep links, verified-email gate, profile qua mutation channel; web auth vẫn tắt. | Register/confirm/reset/restore/logout/account switch/SecureStore failure; không có secret trong client. | Tắt auth route/feature; giữ partition local và không xóa dữ liệu. |
| 6. Sync | Chốt/triển khai delta pull cursor+tombstone trước; sau đó outbox FIFO/retry/import UX. | T10 đầy đủ: offline/restart/network/idempotency/conflict/account switch/import trên staging. | Tắt sync worker/endpoint; giữ outbox và tombstone. |
| 7. Rollout | Dev → staging đa thiết bị → production theo kế hoạch backup/monitoring. | Restore drill, security/RLS review, migration/advisor/test evidence và rollback support plan. | Dừng rollout/disable sync; production schema sửa forward; downgrade app chỉ khi tương thích schema đã chứng minh. |

### 7.13. Review proposal Supabase SQL — 2026-10-21 (design only)

Nội dung tại mục này là review thay thế bản SQL nháp được đề xuất trước đó. Chỉ có **bảy bảng core** trong rollout đầu: `users`, `exercises`, `workout_plans`, `plan_exercises`, `workout_sessions`, `session_exercises`, `workout_sets`. Các bảng goals, recovery, settings, notification và mọi hàng đợi phía server chuyển sang giai đoạn sau; `sync_outbox` vẫn chỉ là SQLite local. Server-side mutation receipt là bảng hỗ trợ riêng trong schema không expose, chưa thuộc bảy bảng và không được triển khai cùng core rollout.

Các điểm sửa bắt buộc so với SQL nháp:

- Bỏ profile trigger `SECURITY DEFINER` đọc `raw_user_meta_data`; không dùng user metadata làm authorization. Profile chỉ được tạo sau xác minh email qua mutation channel đã duyệt.
- Bỏ quyền INSERT cho `created_by IS NULL`, `is_public DEFAULT TRUE` và policy tạo exercise công khai. System catalog là read-only cho client; user exercise luôn gắn owner. `anon` không được cấp catalog access trong rollout đầu; nếu sau này cần public read, phải duyệt riêng.
- Bỏ DML/delete trực tiếp trên sync tables. Tất cả ghi/tombstone phải đi qua mutation channel nguyên tử để không bypass version và receipt; gateway/RPC chưa được phê duyệt.
- Thêm `user_id`, `deleted_at`, `version` cho các bản ghi đồng bộ theo contract; `version` và server timestamps do server quản lý. Không dùng archive thay tombstone.
- Các bảng con giữ owner và có composite FK tới parent `(id,user_id)`; exercise reference kiểm tra ở mutation channel vì FK đơn không thể chứng minh system-or-same-owner. Giữ snapshot lịch sử; hard purge chỉ qua retention workflow tin cậy.
- Bỏ các bảng mở rộng và enum/taxonomy chưa được chốt. Dùng `text` + CHECK cho scope/status; difficulty nullable để không phá tương thích SQLite.
- Bỏ index trùng unique/PK, như index riêng `plan_id`, `session_id`, `session_exercise_id` khi đã có unique index cùng leading columns; không tạo index cho `username`, `is_public`, goals, recovery hoặc server outbox. Index bổ sung cần query/FK evidence.
- Không thay đổi default privileges toàn cục hoặc revoke toàn schema `public` một cách mù quáng. Audit migration owner, Data API exposure và default ACL; cấp table privileges cụ thể.
- `SECURITY DEFINER`/function `EXECUTE` không thuộc core schema migration. Nếu gateway sau này cần definer, owner không được là table owner, `postgres` hoặc `BYPASSRLS`; role phải `NOLOGIN`, quyền tối thiểu; function có auth check, `search_path=''`, object fully qualified, execute bị revoke khỏi `PUBLIC`/`anon` và chỉ grant role đã duyệt. Chưa chọn được boundary nên đây vẫn là blocker.

Bốn core migration file đã được chuẩn bị theo thứ tự parent tables, child tables, indexes, read-only RLS/grants; Supabase CLI sinh tên file. Chúng chưa được chạy/apply hoặc kiểm thử bằng PostgreSQL. Mỗi group cần qua fresh-install/rollback, owner-isolation, FK, grants/RLS và query-plan checks sau khi có phê duyệt apply riêng. Receipt/gateway và SQLite/sync thuộc phase khác. Chi tiết file, test, rollback nằm trong `supabase-schema.md`.

**Pull protocol còn thiếu:** hợp đồng hiện thiên về push/retry, chưa chốt delta cursor, ordering, pagination, tombstone retention và full-resync. `updated_at` không đủ làm cursor chắc chắn khi nhiều hàng cùng timestamp hoặc hàng đổi trong lúc phân trang. Trước sync cần cursor/sequence ổn định, tie-break, cursor expiry, tombstone GC và full-resync fallback.

Gate status: **BLOCKED — schema files prepared, not applied**. Chưa có quyết định gateway/RPC, môi trường/project, SQLite preflight/backup hoặc test evidence; migration preparation không phải chấp thuận triển khai. Tham chiếu: [Supabase Database Functions](https://supabase.com/docs/guides/database/functions), [Securing your API](https://supabase.com/docs/guides/api/securing-your-api), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Product Security](https://supabase.com/docs/guides/security/product-security), [PostgREST Transactions](https://docs.postgrest.org/en/stable/references/transactions.html), [Expo SDK 57 SQLite](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/). Expo SDK 57 documents that unrelated queries can join an active `withTransactionAsync()` transaction and points to `withExclusiveTransactionAsync()` for transaction scoping; validate exact API/platform support before implementation.

#### 7.13. SQLite v1 Preflight — kết quả 2026-10-21

Preflight đã được phê duyệt chỉ trên bản sao, nhưng **bị chặn vì không có bản sao/backup được xác nhận và truy cập được**. Repository khai báo tên `gym-workout.db`, không chứa database/backup phù hợp; không có call site `openDatabaseAsync`/`SQLiteProvider` hoặc app/runtime call site `initializeDatabase` (hàm chỉ được gọi trong tests) để xác định vị trí database runtime. Không tìm kiếm/mở dữ liệu ngoài workspace hoặc trên thiết bị/emulator.

Không chạy kiểm kê trên dữ liệu nào. Counts, `PRAGMA user_version`, UUID/PK/FK, orphan, NULL, `typeof(weight_value)`, đơn vị kg/lb, giá trị invalid/non-finite/âm, giới hạn INTEGER gram và conversion preview đều **chưa xác định** (không phải số 0). Không sửa/xóa/làm tròn/chuẩn hóa dữ liệu. Rủi ro triển khai khi chưa có bằng chứng dữ liệu và khả năng phục hồi là cao.

Điều kiện tiếp tục: cung cấp đường dẫn tới bản sao/backup an toàn trong workspace và xác nhận không phải nguồn đang dùng; cần kiểm tra bản sao mở được trước khi chạy truy vấn chỉ đọc. Nếu DB ở thiết bị, cần chủ dự án xuất bản sao theo quy trình an toàn, bao gồm xử lý WAL nhất quán; không tự truy cập thiết bị hoặc copy file đang chạy.

---

---

## Ranh giới offline/online — Multi-Tenant Gym Management (2026-10-23)

> Phần này làm rõ ranh giới dữ liệu offline/online sau khi chuyển đổi định hướng. Không thay đổi thiết kế offline hiện tại.

### Phân chia rõ ràng: SQLite vs. Server-only

| Dữ liệu | Lưu trữ | Lý do |
|---|---|---|
| Workout session (cá nhân) | SQLite (offline-first) | Cốt lõi; cần hoạt động không có mạng |
| Workout plan, exercise library | SQLite (offline-first) | Cần tra cứu khi tập |
| Auth session token | SecureStore | Nhỏ, nhạy cảm |
| Gym/Branch info | Server-only (Supabase) | Multi-tenant; không offline |
| Staff/Member management | Server-only (Supabase) | Cần real-time; RBAC phụ thuộc server |
| Membership data | Server-only (Supabase) | Cần validation real-time khi check-in |
| Attendance logs | Server-only (Supabase) | Audit trail; append-only; chống trùng server-side |
| Payments | Server-only (Supabase) | Financial; idempotency server-side |
| Báo cáo/thống kê gym | Server-only (Supabase) | Tổng hợp từ nhiều records |

### Nguyên tắc offline boundary mới

1. **SQLite chỉ là workout cá nhân.** Không lưu gym management data vào SQLite.
2. **Gym management data không offline.** App mobile hiển thị thông báo lỗi khi mất mạng cho gym management features.
3. **Check-in không offline.** Validation gói tập và chống trùng đòi hỏi server; check-in không hoạt động nếu mất mạng.
4. **Member profile của mình có thể cache nhẹ.** Tên, ảnh, gói tập đang active có thể cache client-side với TTL ngắn. Không cache payment data.
5. **sync_outbox vẫn chỉ cho workout data.** Không tạo outbox cho gym management mutations (real-time required).

### Tác động đến thiết kế sync hiện tại

- Sync contract (Phase 3.T06) vẫn còn hiệu lực cho workout data.
- Không cần sync contract cho gym management data (server-authoritative, no offline).
- Mutation gateway thiết kế cho workout cũng phục vụ gym management write operations.
- SQLite v2 migration (Phase 3.T09) không bị ảnh hưởng bởi gym management schema.
