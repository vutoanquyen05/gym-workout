# RULE.md — AI AGENT WORKING RULES (BỘ QUY TẮC THÉP)

## 1. Quy tắc khởi động phiên làm việc & Ranh giới bắt buộc (Stateless Bootstrap Protocol)

- **Giao thức Khởi động Không Trạng thái (Stateless Bootstrap):** Mọi AI Agent khi bắt đầu phiên làm việc mới (dù không có lịch sử trò chuyện) **BẮT BUỘC** thực hiện theo quy trình 4 bước:
  1. Đọc đầy đủ `docs/rule.md` để nắm quy tắc làm việc, mô hình phân vai và mẫu báo cáo bắt buộc.
  2. Đọc mục `## 0. CURRENT EXECUTION POINTER (STATELESS HANDOFF)` ở ngay đầu tệp `docs/mindmap.md` để xác định chính xác: Phase hiện tại, Task ID cần thực thi, nhánh Git làm việc và hành động kỹ thuật kế tiếp.
  3. Chạy `git status` và `git branch` để đối chiếu trạng thái kho lưu trữ thực tế với Pointer.
  4. Sau khi hoàn thành Task, **BẮT BUỘC cập nhật lại mục `## 0. CURRENT EXECUTION POINTER (STATELESS HANDOFF)`** trong `docs/mindmap.md` để phiên làm việc kế tiếp luôn tiếp quản chính xác tiến độ dự án.
- Nếu thiếu file hoặc thông tin chưa rõ ràng, phải **DỪNG LẠI NGAY LẬP TỨC** và báo cáo Owner. Tuyệt đối không tự ý suy đoán hay bỏ qua quy tắc.

## 2. Cố định 8 File Tài liệu Cốt lõi & Bãi bỏ Quy tắc tạo File Module

- **BÃI BỎ HOÀN TOÀN QUY TẮC TẠO FILE `[tenmodule].md`:** Tuyệt đối **CẤM** tạo thêm bất kỳ file `.md` mới nào trong thư mục `docs/`.
- Toàn bộ tri thức, đặc tả và kiến trúc của dự án chỉ được lưu trữ trong **đúng 8 file Single Source of Truth (SSOT)** sau:
  1. `docs/rule.md`: Bộ quy tắc làm việc, mô hình phân vai Advisor/Coding Agent, kỷ luật Git branch workflow, tiêu chuẩn an toàn kỹ thuật.
  2. `docs/mindmap.md`: Stateless Pointer, Lộ trình tái kiến trúc v2.0, ma trận 96 task lịch sử và Work Log.
  3. `docs/baocao.md`: Tầm nhìn sản phẩm v2.0 (All-in-One Gym ERP & Coaching), 8 chu trình nghiệp vụ E2E, kiến trúc hệ thống đa nền tảng.
  4. `docs/risks-decisions.md`: Sổ bộ quyết định kiến trúc (Decision Register OD-01..08, D-MT) và ma trận rủi ro.
  5. `docs/supabase-schema.md`: Toàn bộ Schema PostgreSQL v2.0, migrations DDL, RLS policies và mô hình RBAC Multi-Tenancy.
  6. `docs/data-offline.md`: Kiến trúc Offline-First, hợp đồng đồng bộ dữ liệu hai chiều và thực tế triển khai SQLite v1.
  7. `docs/design-system.md`: Toàn bộ Design System, bảng màu Dark/Light HEX, Theme Provider, Navigation và Routes mobile.
  8. `docs/testing-acceptance.md`: Chiến lược kiểm thử tự động, danh mục test suites `__tests__/` và tiêu chí nghiệm thu AC.
- Tuyệt đối **CẤM** tạo file tạm, file sao lưu như `.bak`, `.tmp`, `-copy`, `.old` trong toàn bộ repository.

## 3. Mô hình Điều phối & Phân vai Quản trị (Advisor Agent ↔ Coding Agent)

Dự án áp dụng mô hình quản trị hai tầng tác tử kết hợp sự phê duyệt của Project Owner:
1. **Advisor Agent (Kiến trúc trưởng / Điều phối viên):**
   - Chịu trách nhiệm thiết kế hệ thống, quy hoạch Roadmap, duy trì Nguồn sự thật (`docs/rule.md`, `docs/mindmap.md`, `docs/*`).
   - Biên soạn chỉ thị kỹ thuật chi tiết (Task Specification Prompt) bao gồm: Task ID, Mục tiêu, Phạm vi (`SCOPE` / `OUT OF SCOPE`), Ràng buộc (`CONSTRAINTS`), Tiêu chí nghiệm thu (`ACCEPTANCE CRITERIA`) và Mẫu báo cáo (`REPORT FORMAT`).
   - Rà soát báo cáo nghiệm thu, kiểm tra đối chiếu schema drift, thẩm định mã nguồn và kiến nghị Owner đóng gói Phase.
2. **Coding Agent (Kỹ sư phần mềm thực thi):**
   - Tiếp nhận chỉ thị từ Advisor Agent, rẽ nhánh tính năng độc lập, thực thi mã nguồn hoặc migrations đúng trong phạm vi được giao.
   - Tuyệt đối không tự ý quyết định kiến trúc ngoài phạm vi; tuân thủ chế độ an toàn dữ liệu và Quality Gates.
   - Viết báo cáo hoàn tất Task theo mẫu chuẩn `Task Execution Report` và bàn giao cho Advisor Agent kiểm tra.
3. **Project Owner (Chủ dự án):**
   - Người nắm giữ quyền quyết định cao nhất đối với mọi thay đổi kiến trúc và nghiệp vụ.
   - Trực tiếp nghiệm thu sản phẩm thực tế, phê duyệt lệnh hợp nhất (`merge`) vào nhánh `main` và lệnh đẩy mã nguồn (`git push`) lên remote repository.

## 4. Vòng đời Task & Kỷ luật Trạng thái (Task Lifecycle)

Mỗi Task kỹ thuật trong dự án phải trải qua các trạng thái nghiêm ngặt sau:
- **`TODO`**: Task đã được định nghĩa trong Roadmap `docs/mindmap.md`, sẵn sàng tiếp nhận khi các task phụ thuộc đã hoàn thành.
- **`IN_PROGRESS`**: Coding Agent đã tạo nhánh Git riêng và đang tích cực thực hiện các yêu cầu kỹ thuật.
- **`IN_REVIEW`**: Coding Agent đã hoàn thành công việc, đạt các bài kiểm tra tự động và nộp `Task Execution Report` để chờ nghiệm thu.
- **`DONE`**: Task được Advisor Agent xác nhận đạt 100% tiêu chí AC và Project Owner phê duyệt chính thức.
- **`REWORK`**: Task chưa thỏa mãn một hoặc nhiều tiêu chí AC; Coding Agent bắt buộc phải khắc phục bổ sung trên cùng nhánh trước khi nộp lại.
- **`BLOCKED`**: Task phát sinh xung đột, lỗi môi trường hoặc thiếu quyết định nghiệp vụ, tạm dừng để xin ý kiến Project Owner.

## 5. Kỷ luật Tập trung Lộ trình (Focus Roadmap & Single Task Rule)

- Trong mỗi phiên làm việc, Coding Agent chỉ được phép thực hiện **DUY NHẤT 1 task** được giao hoặc chỉ định theo lộ trình.
- Tuyệt đối không sửa lan man sang các module khác ngoài phạm vi của task hiện tại.
- Mọi đề xuất mở rộng ngoài task đang làm phải được ghi nhận dưới dạng ghi chú đề xuất (Proposal), không tự ý can thiệp mã nguồn.

## 6. Quy trình Ghi nhận Tự động (Auto-Logging & Work Log)

- Khi hoàn thành task, Agent **BẮT BUỘC** cập nhật trạng thái từ `[ ]` thành `[x]` tại mục task tương ứng trong `docs/mindmap.md`.
- Ghi tóm tắt chi tiết kết quả thực hiện vào mục `## 5. NHẬT KÝ CẬP NHẬT TÀI LIỆU & WORK LOG` ở cuối file `docs/mindmap.md`, bao gồm:
  - **Mã Task & Tiêu đề:** (Ví dụ: `P00-T02 — Governance Alignment & Schema Drift Sync`).
  - **Files đã sửa đổi:** Đường dẫn chi tiết các file source code, migrations và docs.
  - **Logic chính đã triển khai:** Các thay đổi kiến trúc, chính sách RLS hoặc cấu trúc bảng.
  - **Kết quả kiểm thử:** Trạng thái pass của `npm test`, `npx tsc --noEmit` và `npm run lint`.

## 7. Kỷ luật Nhánh Git theo Phase (Strict Git Feature Branch Workflow)

- **CẤM TUYỆT ĐỐI** làm việc hoặc commit trực tiếp trên nhánh `main`.
- Mọi công việc/task mới bắt buộc phải rẽ nhánh mới từ nhánh `main` cập nhật nhất theo quy ước chuẩn:
  - Tính năng mới: `feat/<ma-task>-<mo-ta-ngan>` (Ví dụ: `feat/admin-branch-create`).
  - Sửa lỗi: `fix/<ma-task>-<mo-ta-ngan>` (Ví dụ: `fix/auth-session-leak`).
  - Cấu hình / Bảo trì / Đồng bộ: `chore/<mo-ta-ngan>` (Ví dụ: `chore/governance-and-schema-sync`).
  - Tài liệu / Quy trình: `docs/<mo-ta-ngan>` (Ví dụ: `docs/reorganize-workflow-and-rules`).
- **CẤM** tạo nhánh có tiền tố `backup/...`.
- **Điều kiện Commit:** Chỉ được chạy `git commit` khi đã hoàn thành 100% yêu cầu trong phiên và bắt buộc vượt qua các Quality Gates (`npm test`, `npx tsc --noEmit`, `npm run lint`).
- **Quy tắc Đóng gói theo Phase:**
  - Trong suốt quá trình thực thi Phase, mỗi Task được commit độc lập trên nhánh làm việc.
  - **Tuyệt đối KHÔNG** tự ý `git merge` vào `main` hoặc `git push` giữa các Task lẻ.
  - Chỉ thực hiện `git merge --no-ff <branch> -m "..."` và xóa nhánh khi kết thúc toàn bộ Phase hoặc có chỉ thị đóng gói chính thức từ Project Owner.

## 8. Mẫu Báo cáo Chuẩn (Task Execution Report)

Mọi báo cáo kết thúc Task của Coding Agent bắt buộc phải xuất theo cấu trúc Markdown sau:

```markdown
# Task Execution Report
- **Date (dd/mm/yyyy):** [Ngày hoàn thành]
- **Task ID:** [Mã Task]
- **Status:** IN_REVIEW
- **Branch / Commit:** [Tên nhánh & mã commit HEAD]
- **Files Changed:** [Danh sách tệp đã chỉnh sửa / tạo mới]
- **Changes Outside Scope:** None (hoặc giải trình nếu có)

## Implementation Summary
- [Tóm tắt 3-5 gạch đầu dòng về logic kỹ thuật đã thực hiện]

## Acceptance Criteria & Evidence
| AC ID | Result | Evidence |
|---|---|---|
| AC-01 | PASS / FAIL | [Bằng chứng cụ thể từ terminal/file] |
| AC-02 | PASS / FAIL | [Bằng chứng cụ thể từ terminal/file] |

## Validation
| Check | Command | Result |
|---|---|---|
| Lint | npm run lint | PASS / FAIL |
| Typecheck | npx tsc --noEmit | PASS / FAIL |
| Tests | npm test | PASS / FAIL |
| Git Status | git status | Working tree clean |

## Risks & Follow-up
- **Known Issues / Technical Debt:** [Rủi ro hoặc hạn chế còn tồn đọng]
- **Next Recommended Step:** [Bước tiếp theo kiến nghị cho Advisor Agent / Owner]
```

## 9. Quy chuẩn Kỹ thuật của Dự án (Kiến trúc v2.0)

- **Nguyên tắc CRM Độc lập Auth (OD-07):** Mọi nghiệp vụ quản lý hội viên trên Admin Web xoay quanh bảng `public.gym_members` (định danh bằng mã thẻ `member_code` định dạng `MEM-XXXXXX` và số điện thoại `phone`). Khách hàng mua gói tập tại quầy (walk-in) không bắt buộc phải có tài khoản xác thực `auth.users` trước (`linked_user_id` là trường tùy chọn nullable). Khách hàng có thể liên kết tài khoản sau khi cài ứng dụng di động qua cơ chế xác thực số điện thoại/OTP an toàn.
- **Nguyên tắc Giáo án 3 Tầng (3-Tier Workout Programming - OD-08):** Toàn bộ phân hệ quản lý và thiết kế giáo án thể hình vận hành theo mô hình phân cấp 3 tầng rõ rệt:
  1. *Tầng 1 — Thư viện bài tập (`exercises`):* Danh mục các động tác kỹ thuật, nhóm cơ chính, dụng cụ và hướng dẫn.
  2. *Tầng 2 — Giáo án Mẫu & Cá nhân (`workout_programs`):* Kế hoạch tập luyện tổng thể (chia theo `program_type` là `'template'` cho gym hoặc `'assigned'` cho hội viên).
  3. *Tầng 3 — Buổi tập trong giáo án (`program_days`):* Chia tách cấu trúc split các ngày tập trong tuần (ví dụ: Day 1: Push, Day 2: Pull, Day 3: Legs).
  4. *Tầng Chi tiết Bài tập (`program_day_exercises`):* Danh sách bài tập chỉ định trong từng buổi, cấu hình số hiệp (`target_sets`), số lần lặp (`target_reps_min`..`max`), thời gian nghỉ (`rest_seconds`), nhóm superset (`superset_group`) và ghi chú chuyên môn của PT (`pt_notes`).
- **Quy chuẩn Next.js 15 App Router & Server-First Auth:**
  - Admin Web xây dựng trên Next.js 15 App Router, React 19 và Tailwind CSS.
  - Sử dụng `@supabase/ssr` theo mô hình Server-First Cookie SSR: Session lưu trữ an toàn trong Cookie `httpOnly`, `secure`, `sameSite: 'lax'`, không lưu token trong `localStorage`.
  - Toàn bộ mutation đi qua Server Actions (`actions.ts`) hoặc PostgreSQL RPCs bảo mật.
- **Quy chuẩn Mobile Offline-First SQLite v1:**
  - Ứng dụng di động xây dựng trên Expo SDK 58 (`~58.0.0`) và React Native `0.88.0`.
  - Điều hướng bằng Expo Router trong `src/app/`. Các components, hooks, storage, utils dùng chung nằm ngoài thư mục `src/app/`.
  - Lưu trữ ngoại tuyến trên thiết bị di động bằng `expo-sqlite` v1 (`gym-workout.db`), mở bất đồng bộ qua `StorageProvider`.
  - Dữ liệu tập cá nhân hoạt động độc lập không phụ thuộc kết nối mạng, chuẩn bị cho cơ chế hàng đợi Cloud Sync Outbox an toàn.
- **Thực tế Dependencies:** `package.json` và `package-lock.json` là nguồn xác thực dependency duy nhất. Không coi thư viện được đề xuất trong tài liệu kế hoạch là đã cài đặt.
- **Bảo vệ Native Output:** Thư mục `android/` và `ios/` là output sinh tự động của Continuous Native Generation (CNG) và bị Git ignore. Không sửa tay, không xóa và không tạo thủ công thư mục native. Mọi cấu hình native thực hiện qua `app.json` và Expo config plugins.
- **An toàn Tuyệt đối Supabase Cloud:**
  - Migrations trong `supabase/migrations/` là mã nguồn phiên bản, không tự động apply lên Cloud.
  - Tuyệt đối **CẤM** tự ý chạy lệnh SQL, kết nối/thay đổi Cloud project, reset database hoặc áp dụng migration nếu chưa có phê duyệt bằng văn bản từ Owner.
  - Không cấp quyền ghi (DML) trực tiếp cho client trên các bảng core để bảo vệ mutation gateway, versioning và receipt contract.
  - Mọi policy RLS cho quyền UPDATE/INSERT phải có điều kiện bảo vệ rõ ràng, tuyệt đối không dùng `USING (true)` trên dữ liệu nhạy cảm hoặc bảng người dùng (`users`).

## 10. Kiểm tra và Nghiệm thu trước khi Kết thúc Task (Quality Gates)

- Trước khi tuyên bố hoàn tất bất kỳ task nào, Agent bắt buộc phải chạy:
  ```bash
  npm test              # Toàn bộ test suites pass (npm.cmd test trên Windows)
  npx tsc --noEmit      # Typecheck TypeScript không lỗi
  npm run lint          # Linting tuân thủ Expo flat config & Next.js config
  ```
- Ghi nhận trung thực kết quả kiểm tra vào Work Log; không khẳng định đã chạy khi chưa thực thi.

---

## Nhật ký cập nhật quy tắc

| Ngày | Nội dung thay đổi | Lý do |
|---|---|---|
| 2026-10-22 | Bổ sung baseline Expo/Router/npm, quy tắc native output, phê duyệt Supabase và an toàn dọn dẹp. | Đồng bộ hướng dẫn với cấu trúc dự án thực tế. |
| 2026-10-25 | Ban hành Bộ Quy tắc Thép: Bãi bỏ quy tắc tạo file `[tenmodule].md`, thu gọn tài liệu về đúng 8 file SSOT cốt lõi, áp dụng Strict Git Feature Branch Workflow (`feat/...`, cấm commit trên `main`, cấm nhánh `backup/...`), và Focus Roadmap 1 task kèm Auto-Logging vào `mindmap.md`. | Chấm dứt tình trạng phân mảnh tài liệu (25 files -> 8 files), thiết lập kỷ luật code và quy trình quản trị chuyên nghiệp. |
| 2026-10-31 | Tích hợp mô hình phối hợp Advisor Agent ↔ Coding Agent, chuẩn hóa Vòng đời Task (`TODO → IN_PROGRESS → IN_REVIEW → DONE`), siết chặt quy tắc Git theo Phase và áp dụng mẫu báo cáo chuẩn `Task Execution Report`. | Nâng cấp hệ thống quản trị chuyên nghiệp hóa, chuẩn hóa giao thức bàn giao và kiểm soát chất lượng kỹ thuật. |
| 2026-10-31 | Ban hành chuẩn Stateless Bootstrap Protocol và kiến trúc v2.0: CRM `gym_members` độc lập Auth (OD-07), Trạm xếp bài tập 3 tầng (OD-08), và quy chuẩn Next.js 15 Server-First Cookie SSR. | Khóa bản thiết kế kiến trúc v2.0 All-in-One Gym ERP & Coaching Platform, bảo đảm tính tự hành không trạng thái (Stateless Execution) cho mọi Agent. |
