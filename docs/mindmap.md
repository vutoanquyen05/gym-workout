# Mindmap — Workflow triển khai Gym & Workout App

> Nguồn: `baocao.md` (đặc biệt mục 3, 4, 11–13). Đây là kế hoạch triển khai; các Phase 1–7 phục vụ MVP, Phase 8 là mở rộng.

## Quy tắc theo dõi

- Trước mỗi task: đọc `docs/rule.md`, `docs/mindmap.md`, và các tài liệu tham chiếu được ghi tại task.
- Trạng thái: `[ ]` chưa làm, `[x]` hoàn thành. Chỉ đánh dấu `[x]` sau khi kiểm tra kết quả.
- Mỗi module cần có tài liệu module riêng theo quy tắc của Agent nếu được cấu hình; cập nhật tài liệu sau thay đổi.
- Không tự tạo endpoint backend, phiên bản SDK, schema hoặc quyết định kỹ thuật chưa được xác nhận; ghi blocker vào `risks-decisions.md`.
- Phase tiếp theo chỉ bắt đầu khi tiêu chí hoàn thành phase trước đã được kiểm tra; có thể tách việc không phụ thuộc để làm song song nếu được phê duyệt.

## Phase 1 — Phân tích và thiết lập

- [x] **Phase 1.T01** — Chốt phạm vi MVP, luồng người dùng và màn hình.
      Tham chiếu: `requirements.md`, `screens-ux.md`.
- [x] **Phase 1.T02** — Chốt quyết định backend, auth và phiên bản Expo SDK hoặc ghi nhận blocker.
      Tham chiếu: `risks-decisions.md`.
- [x] **Phase 1.T03** — Khởi tạo Expo + React Native + TypeScript.
      Tham chiếu: `tech-stack.md`.
- [x] **Phase 1.T04** — Thiết lập Expo Router, tabs và auth routes.
      Tham chiếu: `architecture.md`, `screens-ux.md`.
- [x] **Phase 1.T05** — Thiết lập cấu trúc module, lint và nền tảng kiểm thử.
      Tham chiếu: `architecture.md`, `testing-acceptance.md`.

**Điều kiện hoàn thành:** Ứng dụng khởi chạy trên iOS/Android; điều hướng cơ bản hoạt động.

**Trạng thái xác minh:** T01–T05 hoàn tất; bundle web/iOS/Android đã build; runtime và điều hướng 5 tab đã xác minh trên Android emulator. iOS runtime verification còn thiếu do môi trường Windows. Người dùng đã chấp thuận bắt đầu Phase 2 trong khi giữ đây là blocker; tiếp tục theo ngoại lệ có ghi nhận tại `risks-decisions.md`.

## Phase 2 — Design System

- [x] **Phase 2.T01** — Tạo color tokens Dark/Light và theme provider.
      Tham chiếu: `color-palette.md`.
- [x] **Phase 2.T02** — Tạo typography, spacing, radius và size tokens.
      Tham chiếu: `design-system.md`.
- [x] **Phase 2.T03** — Xây dựng AppText, Screen, Button, Card, Input và IconButton.
      Tham chiếu: `design-system.md`.
- [x] **Phase 2.T04** — Tạo Bottom Navigation và trạng thái giao diện chuẩn.
      Tham chiếu: `design-system.md`, `screens-ux.md`.
- [x] **Phase 2.T05** — Kiểm tra tương phản, vùng chạm, safe area và chữ phóng to.
      Tham chiếu: `color-palette.md`, `design-system.md`.

**Điều kiện hoàn thành:** Các màn hình dùng chung tokens/components; Light/Dark hoạt động.

## Phase 3 — Dữ liệu và chức năng nền tảng

- [x] **Phase 3.T01** — Thiết kế schema SQLite, migration và repository.
      Tham chiếu: `data-offline.md`.
- [ ] **Phase 3.T02** — Xây dựng xác thực, đăng ký/đăng nhập/đăng xuất khi backend sẵn sàng.  
      Tham chiếu: `requirements.md`, `tech-stack.md`.
- [ ] **Phase 3.T03** — Tạo hồ sơ và onboarding.  
      Tham chiếu: `requirements.md`.
- [ ] **Phase 3.T04** — Tạo thư viện bài tập: danh sách, tìm kiếm, lọc, chi tiết.  
      Tham chiếu: `tech-stack.md`, `screens-ux.md`.
- [ ] **Phase 3.T05** — Tạo kế hoạch: CRUD, thứ tự bài tập, cấu hình hiệp/reps/nghỉ.  
      Tham chiếu: `tech-stack.md`, `data-offline.md`.
- [x] **Phase 3.T06** — Chốt hợp đồng dữ liệu Supabase PostgreSQL–SQLite và các quy tắc đồng bộ còn mở.
      Tham chiếu: `data-offline.md`, `risks-decisions.md`.
- [x] **Phase 3.T07** — Thiết kế PostgreSQL schema và chiến lược migrations cho dữ liệu người dùng, bài tập, kế hoạch và buổi tập.
      Bao gồm `plan_exercises`, `session_exercises`, UUID, UTC/timestamptz, snapshot, soft delete và versioning.
      Tham chiếu: `data-offline.md`, `risks-decisions.md`.
- [x] **Phase 3.T08** — Thiết kế RLS, grants và indexes cho mọi bảng được expose.
      Tham chiếu: `data-offline.md`, `risks-decisions.md`.
- [x] **Phase 3.T09** — Thiết kế SQLite migration tương thích UUID và đơn vị cân nặng số nguyên, kèm sync outbox.
      Phải bảo toàn dữ liệu v1; không tự động gán dữ liệu local cũ cho tài khoản mới đăng nhập.
      Tham chiếu: `data-offline.md`, `risks-decisions.md`.
- [x] **Phase 3.T10** — Xây dựng kế hoạch kiểm thử schema, chuyển đổi cân nặng, RLS và cách ly dữ liệu đa tài khoản.
      Tham chiếu: `data-offline.md`, `testing-acceptance.md`, `risks-decisions.md`.
- [x] **Phase 3.T11** — Review và xác nhận hợp đồng/schema trước khi cho phép triển khai migrations hoặc sync.
      Tham chiếu: `data-offline.md`, `risks-decisions.md`.
- [x] **Phase 3.T12** — Chuẩn bị PostgreSQL Core Schema Migration v1 theo phê duyệt có điều kiện; chỉ tạo migration files và cập nhật kế hoạch kiểm thử/rollback.
      Tham chiếu: `supabase-schema.md`, `data-offline.md`, `risks-decisions.md`.
- [ ] **Phase 3.T13** — Kiểm thử core migration trên Supabase local disposable sau khi xác minh môi trường an toàn.
      Tham chiếu: `supabase-schema.md`, `data-offline.md`, `risks-decisions.md`.

**Điều kiện hoàn thành:** Người dùng có thể thiết lập hồ sơ, chọn bài tập và kế hoạch; lưu dữ liệu cục bộ. T06–T11 là thiết kế/review; T12 chỉ chuẩn bị files, không được xem là đã chạy migration, thay đổi database hay triển khai đồng bộ.

**Phụ thuộc T06–T12:** T06 là tiền đề cho T07 và T09; T07 là tiền đề cho T08; T07–T09 là tiền đề cho T10; T10 là tiền đề cho T11; T12 yêu cầu phê duyệt có điều kiện riêng. Apply migration vẫn cần phê duyệt riêng và readiness gates; không hàm ý bắt đầu triển khai đồng bộ theo Phase 6.

**Trạng thái T06–T07:** Hoàn tất phần thiết kế tài liệu ngày 2026-10-21 sau khi người dùng xác nhận Email/Password, ownership, UUID, UTC, soft delete, versioning, snapshot, cân nặng gram, import local, xung đột, retry và idempotency. Migration files sau đó được chuẩn bị có điều kiện; chưa chạy SQL, chưa thay đổi database và chưa triển khai Auth hoặc Sync Service. Còn kiểm kê dữ liệu cân nặng thực tế và chốt cấu hình môi trường trước khi apply.

**Trạng thái T08–T11:** Hoàn tất thiết kế/review tài liệu: ma trận RLS/grants/indexes và migration groups (T08), SQLite v2/preflight/rollback (T09), test matrix chưa thực thi (T10), architecture/security review cùng blockers (T11). Tên, phạm vi và dependencies không đổi sau khi kiểm tra. Review tinh chỉnh quyền ghi so với giả định T07: không cấp DML trực tiếp lên bảng sync-managed; profile và dữ liệu đồng bộ cần mutation channel duy nhất để bảo toàn version/idempotency. RPC/server endpoint và boundary bảo mật vẫn chưa được duyệt. T11 không phải phê duyệt của chủ dự án để bắt đầu code; chưa chạy SQL, migration, DB test, thay đổi database hay triển khai Auth/Sync.

**Pre-Implementation Gate (2026-10-21): BLOCKED — design-only.** Chưa xác nhận gateway/RPC và quyền function, receipt representation/retention, catalog/legacy exercise mapping, snapshot lịch sử thiếu thuộc tính ở v1, weight inventory/giới hạn gram, delta pull cursor, environment Supabase hoặc Auth configuration. Cần chốt và kiểm thử transaction isolation cho SQLite SDK 57 trên runtime mục tiêu; chưa có test evidence PostgreSQL/runtime.

**Supabase SQL proposal review (2026-10-21): DESIGN REVISED.** Bản SQL nháp đã được thay bằng thiết kế review tại `supabase-schema.md`, giới hạn rollout đầu ở 7 bảng core. Phê duyệt có điều kiện tiếp theo chỉ cho phép chuẩn bị migration files, không apply/kết nối/database mutation; gateway, receipts và các blocker triển khai vẫn cần quyết định riêng.

**PostgreSQL Core Schema Migration v1 preparation (2026-10-21): FILES PREPARED — NOT APPLIED.** Bốn migration CLI-generated theo thứ tự parent tables, child tables, indexes, read-only RLS/grants. Chỉ chứa bảy bảng core; direct client DML không được cấp. Chưa kiểm thử PostgreSQL, chưa chạy SQL, chưa kết nối Supabase. Chờ phê duyệt riêng trước mọi thực thi.

**Local migration test (2026-10-21): BLOCKED — no SQL executed.** Docker, Supabase CLI và `supabase/config.toml` không có; chưa xác minh được môi trường local disposable. Static inventory check đạt nhưng không thay thế cú pháp/runtime test. T13 vẫn chưa hoàn thành; chờ môi trường local an toàn, không cài đặt công cụ theo ý agent.

**SQLite v1 Preflight (2026-10-21): BLOCKED — không tìm thấy bản sao/backup được xác nhận.** Schema chỉ khai báo `gym-workout.db`; repository không có file DB/backup và không có call site mở database hoặc khởi tạo database ở app/runtime (khởi tạo chỉ xuất hiện trong tests). Không chạy kiểm kê; số hàng, UUID/FK và cân nặng đều chưa xác định, không phải 0. Không truy cập DB nguồn hoặc thiết bị. Tiếp tục chỉ khi có bản sao an toàn, mở được và được chỉ rõ.

## Phase 4 — Luồng tập luyện cốt lõi

- [ ] **Phase 4.T01** — Bắt đầu/tạm dừng/tiếp tục/kết thúc buổi tập.  
      Tham chiếu: `tech-stack.md`.
- [ ] **Phase 4.T02** — Ghi nhận và xác thực hiệp, mức tạ, số lần lặp.  
      Tham chiếu: `tech-stack.md`.
- [ ] **Phase 4.T03** — Tạo RestTimer theo timestamp kết thúc dự kiến.  
      Tham chiếu: `tech-stack.md`.
- [ ] **Phase 4.T04** — Tự động lưu vào SQLite và khôi phục khi mở lại.  
      Tham chiếu: `data-offline.md`.
- [ ] **Phase 4.T05** — Tạo màn hình tổng kết và kiểm thử chuyển nền/foreground.  
      Tham chiếu: `screens-ux.md`, `testing-acceptance.md`.

**Điều kiện hoàn thành:** Luồng ghi nhận buổi tập hoạt động không cần mạng và khôi phục được.

## Phase 5 — Lịch sử, thống kê và thói quen

- [ ] **Phase 5.T01** — Danh sách và chi tiết lịch sử buổi tập.  
      Tham chiếu: `tech-stack.md`.
- [ ] **Phase 5.T02** — Xác định công thức, đơn vị và dữ liệu hợp lệ cho thống kê.  
      Tham chiếu: `tech-stack.md`, `risks-decisions.md`.
- [ ] **Phase 5.T03** — Tính tiến bộ, khối lượng tập và PR; hiển thị biểu đồ.  
      Tham chiếu: `tech-stack.md`.
- [ ] **Phase 5.T04** — Tạo mục tiêu, thói quen và tiến độ hoàn thành.  
      Tham chiếu: `requirements.md`.
- [ ] **Phase 5.T05** — Tạo nhắc lịch tập, quyền thông báo và cài đặt.  
      Tham chiếu: `tech-stack.md`.
- [ ] **Phase 5.T06** — Thêm check-in phục hồi tự khai báo nếu được ưu tiên.  
      Tham chiếu: `requirements.md`, `tech-stack.md`.

**Điều kiện hoàn thành:** Lịch sử và chỉ số hiển thị nhất quán; mục tiêu và nhắc nhở cơ bản hoạt động.

## Phase 6 — Offline và đồng bộ

- [ ] **Phase 6.T01** — Kiểm thử ghi cục bộ trước và khôi phục mọi thao tác cốt lõi.  
      Tham chiếu: `data-offline.md`.
- [ ] **Phase 6.T02** — Triển khai sync queue theo contract UUID, outbox, FIFO và idempotency đã duyệt tại Phase 3.T06.
      Tham chiếu: `data-offline.md`.
- [ ] **Phase 6.T03** — Triển khai network detection, retry/backoff và xử lý lỗi.  
      Tham chiếu: `data-offline.md`.
- [ ] **Phase 6.T04** — Triển khai optimistic concurrency và luồng xử lý conflict tường minh khi backend sẵn sàng.
      Tham chiếu: `risks-decisions.md`, `data-offline.md`.
- [ ] **Phase 6.T05** — Kiểm thử mất mạng, kết nối lại và chống trùng bản ghi.  
      Tham chiếu: `testing-acceptance.md`.

**Điều kiện hoàn thành:** Không mất dữ liệu khi offline; đồng bộ chỉ nghiệm thu khi có backend phù hợp.

## Phase 7 — Kiểm thử và phát hành thử

- [ ] **Phase 7.T01** — Chạy unit tests cho validation, timer, thống kê và trạng thái.  
      Tham chiếu: `testing-acceptance.md`.
- [ ] **Phase 7.T02** — Chạy component, integration và E2E theo AC-01 đến AC-12.  
      Tham chiếu: `testing-acceptance.md`.
- [ ] **Phase 7.T03** — Kiểm thử iOS/Android, cỡ chữ lớn, bàn phím và safe area.  
      Tham chiếu: `testing-acceptance.md`.
- [ ] **Phase 7.T04** — Rà soát bảo mật, quyền riêng tư, hiệu năng và các rủi ro.  
      Tham chiếu: `risks-decisions.md`.
- [ ] **Phase 7.T05** — Sửa lỗi, kiểm tra hồi quy và chuẩn bị bản thử nghiệm.  
      Tham chiếu: `testing-acceptance.md`.

**Điều kiện hoàn thành:** AC áp dụng đạt hoặc được ghi rõ blocker/phạm vi chưa hỗ trợ; MVP sẵn sàng thử nghiệm.

## Phase 8 — Mở rộng sau MVP

- [ ] **Phase 8.T01** — Phân tích hiệu suất chuyên sâu.  
      Tham chiếu: `requirements.md`.
- [ ] **Phase 8.T02** — Đồng bộ đa thiết bị và giải quyết xung đột nâng cao.  
      Tham chiếu: `data-offline.md`.
- [ ] **Phase 8.T03** — Tích hợp dữ liệu sức khỏe/thiết bị ngoài khi được cho phép.  
      Tham chiếu: `tech-stack.md`.
- [ ] **Phase 8.T04** — Cá nhân hóa kế hoạch và phân tích phục hồi nâng cao.  
      Tham chiếu: `requirements.md`.

**Điều kiện hoàn thành:** Chỉ bắt đầu sau khi luồng MVP ổn định; cần xác nhận phạm vi mới.

## Bảng tài liệu chuẩn

| Tài liệu                | Vai trò                                        |
| ----------------------- | ---------------------------------------------- |
| `requirements.md`       | Phạm vi, FR và NFR                             |
| `architecture.md`       | Module, thư mục, ranh giới                     |
| `tech-stack.md`         | React Native/Expo và API thiết bị              |
| `data-offline.md`       | Thực thể, storage, offline/sync                |
| `screens-ux.md`         | Điều hướng, màn hình và bố cục                 |
| `color-palette.md`      | HEX và tương phản                              |
| `design-system.md`      | Typography, spacing, components, accessibility |
| `testing-acceptance.md` | AC-01 đến AC-12 và kế hoạch test               |
| `risks-decisions.md`    | Rủi ro và quyết định còn mở                    |

## Ghi chú phạm vi

- `baocao.md` mô tả các API Expo và vai trò của API client, **không đưa ra danh sách endpoint HTTP cụ thể**.
- `recovery` có trong yêu cầu FR-13 và danh sách module nhưng không thuộc danh sách MVP cốt lõi tại mục 3.3; task check-in được đặt là tùy chọn, cần xác nhận ưu tiên.
- Xác thực và đồng bộ cần backend phù hợp; không đánh dấu hoàn tất tích hợp thật nếu chưa có backend.
