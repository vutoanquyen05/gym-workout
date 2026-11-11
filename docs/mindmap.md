# Mindmap — Unified Roadmap Triển khai Toàn diện Gym & Workout App

> **Nguồn & Căn cứ:** `docs/baocao.md` (Product Vision Baseline Candidate v1.4, Approved Scope).  
> **Phiên bản:** Unified Roadmap v1.2 (Release Gate Consistency Patch: Hoàn thiện Ranh giới Cổng Phát hành & Điểm danh).  
> **Ngày lập:** 2026-10-23.  
> **Cấu trúc thực thi:** Tích hợp 4 luồng công việc song song (Shared Platform, Gym Management, Personal Training, Workout Mobile) xuyên suốt **9 Phase** (Phase 0–8, bao gồm Post-MVP).  
> **Trạng thái phê duyệt:** Unified Roadmap v1.3 — PHASE 0 ĐÃ HOÀN TẤT VÀ ĐÓNG GATE TOÀN DIỆN (COMPLETED). Toàn bộ 8 tasks P0.T01–P0.T08 đã hoàn thành (`[x]`). Quyết định OD-01..OD-06 đã được phê duyệt chính thức. File migration GM-1 (`20261025150000_gm1_tenant_branch_staff.sql`) đã tạo xong. Tài liệu thu gọn về đúng 8 file cốt lõi SSOT. Dự án chuẩn bị bước vào Phase 1 theo lộ trình Step-by-step Evolution.

---

## 0. CURRENT EXECUTION POINTER (STATELESS HANDOFF)

- **Current Architecture Version:** v2.0 (All-in-One Gym ERP & 3-Tier Workout Coaching Platform)
- **Current Phase:** RELEASED — ALL 6 PHASES COMPLETED ON MAIN
- **Current Active Task:** ALL PHASES P01..P06 COMPLETED & VERIFIED
- **Task Status:** COMPLETED
- **Active Git Branch:** `main`
- **Last Completed Task:** CHORE-REPO-CLEANUP & E2E-PLAYWRIGHT-AUDIT
- **Next Scheduled Task:** Mobile Dual-Mode Integration (Phase 3.T02/T04 & Phase P06-T02b)
- **Last Updated:** 11/11/2026

---

## 1. QUY TẮC THEO DÕI & QUẢN LÝ ROADMAP

1. **Nguyên tắc theo dõi trạng thái:**
   - Trạng thái: `[ ]` chưa làm / đang chờ duyệt, `[x]` hoàn thành.
   - Chỉ đánh dấu `[x]` sau khi kiểm tra kết quả thực tế và có bằng chứng xác minh (Execution Evidence) hoặc quyết định phê duyệt chính thức từ Chủ dự án.
   - Tuyệt đối không tự đánh dấu task implementation hoàn thành trong phạm vi tài liệu.
2. **Kỷ luật phụ thuộc & Gating:**
   - Phase tiếp theo chỉ bắt đầu khi điều kiện hoàn thành (Completion Criteria) của phase trước đã được kiểm tra và nghiệm thu.
   - Các công việc thuộc các track khác nhau không có phụ thuộc trực tiếp có thể triển khai song song nếu đã được phê duyệt.
   - Không tự ý tạo endpoint backend, schema hoặc quyết định kỹ thuật mới khi chưa có phê duyệt; mọi rủi ro kỹ thuật phải được ghi nhận vào `docs/risks-decisions.md`.
3. **Bảo toàn 96 Task ID gốc & 10 Đề xuất Bổ sung:**
   - Bảo toàn 100% 96 Task ID gốc từ cả 2 lộ trình lịch sử (48 task Workout Mobile cũ và 48 task Multi-Tenant mới).
   - Tuyệt đối không đổi tên mã task, không xóa, không gộp và không thay đổi trạng thái gốc: duy trì chính xác 32 tasks `[x]` và 64 tasks `[ ]` (sau khi hoàn thành toàn bộ Phase 0 và Phase 1 Core P1.T01..P1.T06).
   - Các task mở rộng mới được gắn nhãn riêng biệt `[PROPOSED_ADDITION]`, tách biệt hoàn toàn khỏi baseline 96 task gốc.
4. **Cấu trúc 4 Luồng Công việc (Workstreams):**
   - **Track 1: Shared Platform & Backend (`SP`):** Nền tảng Monorepo, Supabase Auth, DDL Schemas GM-1..5, RLS Policies, Mutation Gateway/RPC.
   - **Track 2: Gym Management Web Portal (`GM`):** Next.js App Router Admin Web, Quản lý Chi nhánh, Nhân viên, Hội viên, Gói tập, Check-in quầy, Thu phí & Báo cáo đối soát ca.
   - **Track 3: Personal Training Subsystem (`PT`):** Lịch hẹn PT, Phân công Trainer, Khấu trừ buổi tập 2 chiều (`BR-PT-02`), Chia sẻ dữ liệu tập luyện tuân thủ Consent Model & Health Minimization (`BR-PT-03`).
   - **Track 4: Workout Mobile App (`WM`):** Mobile Foundation (SDK 57, Design System v1, SQLite v1), Mobile Core Workouts (Offline-First CRUD, Session, RestTimer, History/Stats), Gym Member Mode (Thẻ hội viên, QR check-in) và Cloud Sync Outbox.

---

## 1B. LỘ TRÌNH TÁI KIẾN TRÚC TOÀN DIỆN V2.0 (ERP & COACHING REDESIGN ROADMAP — ACTIVE TRACK)

> **Căn cứ Phê duyệt:** Quyết định OD-07 (CRM `gym_members` Độc lập Auth), OD-08 (Trạm Xếp Bài Tập 3 Tầng) và Chỉ thị Kiến trúc v2.0 của Project Owner.  
> **Nguyên tắc Điều hành:** Kế thừa toàn bộ kết quả đã kiểm toán tại Phase P00; bảo toàn tính liên tục của hệ thống và 96 task lịch sử.

### PHASE P00 — STATELESS GOVERNANCE & ARCHITECTURE V2.0 BLUEPRINT [COMPLETED]
*Mục tiêu: Kiểm toán toàn diện hệ thống, chuẩn hóa bộ quy tắc quản trị không trạng thái (Stateless Bootstrap), đồng bộ schema drift và khóa bản thiết kế kiến trúc v2.0.*

- [x] **P00-T01** `[Track: Governance]` — Project Audit & Baseline Discovery (Kiểm kê toàn bộ Monorepo và trạng thái 8 tệp SSOT).
- [x] **P00-T02** `[Track: Governance & SP]` — Governance Alignment & Schema Drift Sync (Mô hình Advisor/Coding Agent, chuẩn hóa Vòng đời Task, cập nhật migration GM-2 Patch).
- [x] **P00-T03** `[Track: Governance & Architecture]` — Deep Architectural & Governance Inspection (Trích xuất toàn văn AGENTS.md, docs/rule.md; kiểm tra SQLite v1 mobile, components admin-web và 5 functions RPC).
- [x] **P00-T04** `[Track: Governance & Architecture]` — Stateless Governance & v2.0 Architecture Blueprint Lock (Khóa Pointer Stateless, lộ trình v2.0, nguyên tắc CRM độc lập Auth OD-07 và giáo án 3 tầng OD-08).

---

### PHASE P01 — DATABASE V2.0 REFACTORING (CRM 360° & 3-TIER WORKOUT SCHEMA)
*Mục tiêu: Triển khai Migration SQL v2.0 trên Supabase: tạo bảng `gym_members`, `payment_transactions`, `workout_programs`, `program_days`, `program_day_exercises`, `body_measurements`; nâng cấp RLS policies và seed data chuẩn.*

- [x] **P01-T01** `[Track: SP]` — **Migration SQL v2.0 Additive Non-Breaking**:
  - Tạo bảng CRM `public.gym_members` (id, gym_id, branch_id, member_code UNIQUE `MEM-XXXXXX`, full_name, phone, email, gender, dob, address, status, linked_user_id nullable REFERENCES auth.users, avatar_url, notes).
  - Tạo bảng Hóa đơn `public.payment_transactions` (id, gym_id, branch_id, member_id, membership_id, amount BIGINT VND, payment_method, status, cashier_id, idempotency_key, note).
  - Tạo Trạm Xếp bài tập 3 tầng: `public.workout_programs` (id, gym_id, name, program_type 'template'/'assigned', member_id, assigned_by), `public.program_days` (id, program_id, day_name, order_index), `public.program_day_exercises` (id, program_day_id, exercise_id, order_index, target_sets, target_reps_min, target_reps_max, rest_seconds, superset_group, pt_notes).
  - Tạo bảng `public.body_measurements` (id, member_id, weight_kg, height_cm, body_fat_pct, muscle_mass_kg, measured_at, measured_by).
  - Cập nhật RLS fail-closed, grants tối thiểu và migration file v2.0.
- [x] **P01-T02** `[Track: SP]` — **Seed Data & Helper RPCs v2.0**:
  - Seed 30+ bài tập chuẩn vào `exercises` phân loại theo nhóm cơ.
  - Seed các gói tập mẫu (Gym tháng, PT 12 buổi, Combo).
  - Tạo helper RPC sinh mã thẻ `MEM-XXXXXX` tự động không trùng lặp và đối soát RLS.
  - Cập nhật tài liệu `docs/supabase-schema.md`.

---

### PHASE P02 — ADMIN WEB SHELL V2.0, BRANCHES, PLANS & STAFF MANAGEMENT
*Mục tiêu: Nâng cấp toàn diện giao diện Admin Web thành trung tâm điều hành phòng gym chuẩn ERP; quản lý chi nhánh, gói tập và nhân sự/PT.*

- [x] **P02-T01** `[Track: GM]` — **Nâng cấp Dashboard Layout & Sidebar 7 phân hệ**:
  - Thiết kế Sidebar 7 module chuẩn ERP: Tổng quan, Hội viên & POS, Gói tập, Chi nhánh, Nhân sự & PT, Điểm danh, Trạm xếp bài tập.
  - Header tích hợp chọn nhanh Chi nhánh (Branch Switcher) và nút Quick Actions ("Đăng ký hội viên", "Check-in nhanh").
- [x] **P02-T02** `[Track: GM]` — **Nâng cấp Quản lý Chi nhánh (`Branches`)**:
  - Danh sách chi nhánh dạng bảng/thẻ với tìm kiếm, lọc trạng thái, form tạo mới và chỉnh sửa thông tin/đổi trạng thái (active/suspended/archived).
- [x] **P02-T03** `[Track: GM]` — **Xây dựng Quản lý Gói tập (`Membership Plans`)**:
  - Quản lý danh mục gói tập phòng gym (Gym tiêu chuẩn, PT 1 kèm 1, Combo).
  - Form tạo mới và chỉnh sửa: giá `BIGINT` VND, thời hạn ngày, số buổi tập, phạm vi áp dụng (toàn chuỗi / chi nhánh cụ thể).
- [x] **P02-T04** `[Track: GM]` — **Xây dựng Quản lý Nhân sự & Huấn Luyện Viên (`Staff & Trainers`)**:
  - Danh sách nhân sự & huấn luyện viên cá nhân (PT), phân loại vai trò (manager, receptionist, trainer).
  - Form thêm nhân sự, gán chi nhánh công tác và quản lý trạng thái.

---

### PHASE P03 — CRM HỘI VIÊN 360° & THU NGÂN TẠI QUẦY (MEMBERS & POS)
*Mục tiêu: Xây dựng trung tâm CRM hội viên hoàn chỉnh; luồng bán gói/thu tiền tại quầy không phụ thuộc Auth và hồ sơ hội viên 360° đa tab.*

- [x] **P03-T01** `[Track: GM]` — **Bảng Danh sách Hội viên CRM (`gym_members`)**:
  - Bảng danh sách hội viên hiển thị: Họ tên, SĐT, Mã thẻ `MEM-XXXXXX`, Trạng thái thẻ, Gói đang tập, Thời hạn còn lại, PT phụ trách.
  - Bộ lọc nâng cao theo trạng thái thẻ (Đang tập, Hết hạn, Bảo lưu, Sắp hết hạn trong 7 ngày) và thanh tìm kiếm đa năng.
- [x] **P03-T02** `[Track: GM]` — **Luồng Đăng ký Hội viên & POS Checkout 1 bước**:
  - Form tiếp nhận khách hàng walk-in: nhập thông tin cá nhân, chọn gói tập, ghi nhận thanh toán tiền mặt/chuyển khoản/POS qua `payment_transactions`, kích hoạt thẻ và sinh mã thẻ `MEM-XXXXXX` tức thì mà không cần tài khoản Auth.
- [x] **P03-T03** `[Track: GM]` — **Trang Hồ sơ Chi tiết Hội viên 360° (`Member Detail 4-Tab View`)**:
  - *Tab 1 — Thẻ & Gói tập:* Xem chi tiết gói hiện tại, nút Gia hạn gói, nút Nâng cấp gói, nút Bảo lưu thẻ.
  - *Tab 2 — Lịch sử Giao dịch:* Danh sách các khoản thanh toán, biên nhận thu tiền, hóa đơn của hội viên.
  - *Tab 3 — Lịch sử Điểm danh:* Nhật ký vào/ra phòng gym theo mốc thời gian thực tế.
  - *Tab 4 — Chỉ số Cơ thể & InBody:* Biểu đồ và danh sách chỉ số (cân nặng, mỡ, cơ, BMI) qua các lần đo `body_measurements`.

---

### PHASE P04 — QUẦY ĐIỂM DANH THÔNG MINH (SMART CHECK-IN DESK)
*Mục tiêu: Tối ưu hóa tốc độ điểm danh quầy tiếp tân dưới 300ms; xác thực điều kiện thẻ tự động và nhật ký thời gian thực.*

- [x] **P04-T01** `[Track: GM]` — **Giao diện Quầy Check-in Tiếp tân Thông minh**:
  - Hộp nhập nhanh mã thẻ `MEM-XXXXXX` hoặc tìm kiếm tức thì theo SĐT/Họ tên hội viên.
  - Động cơ kiểm tra thẻ tự động: Kiểm tra hạn thẻ, số buổi còn lại, chi nhánh cho phép, nợ phí.
  - Hiển thị kết quả điểm danh trực quan (Thành công kèm số buổi còn lại / Từ chối kèm lý do rõ ràng).
  - Danh sách nhật ký điểm danh trong ca trực theo thời gian thực (Realtime Attendance Feed).

---

### PHASE P05 — TRẠM THIẾT KẾ GIÁO ÁN & XẾP BÀI TẬP 3 TẦNG (WORKOUT PROGRAMMING STUDIO)
*Mục tiêu: Xây dựng công cụ xếp giáo án chuyên nghiệp cho PT và Chủ phòng gym; quản lý danh mục bài tập và cá nhân hóa lộ trình tập luyện.*

- [x] **P05-T01** `[Track: GM & PT]` — **Quản lý Thư viện Bài tập trên Web (`Exercises Catalog`)**:
  - Giao diện danh mục bài tập: Tìm kiếm, lọc theo nhóm cơ chính, nhóm cơ phụ, dụng cụ và độ khó.
  - Form thêm bài tập riêng của phòng gym kèm hướng dẫn kỹ thuật chi tiết.
- [x] **P05-T02** `[Track: PT]` — **Trình thiết kế Giáo án Mẫu 3 Tầng (`Program Templates Builder`)**:
  - Trình tạo giáo án mẫu: Đặt tên giáo án, mô tả mục tiêu (Tăng cơ, Giảm mỡ, Sức mạnh).
  - Chia các buổi tập trong tuần (`program_days` - ví dụ: Ngày 1 Ngực/Tay sau, Ngày 2 Lưng/Tay trước...).
  - Xếp danh sách bài tập cho từng ngày (`program_day_exercises`): Cấu hình số hiệp (Sets), số lần (Reps), thời gian nghỉ (Rest seconds), nhóm Superset và ghi chú lưu ý kỹ thuật của PT.
- [x] **P05-T03** `[Track: PT]` — **Giao Giáo án cho Hội viên & Cá nhân hóa (`Assign & Customize Member Program`)**:
  - Chức năng gán giáo án mẫu cho Hội viên cụ thể: Tự động nhân bản sang hồ sơ hội viên và cho phép PT tinh chỉnh hiệp/tạ/bài tập phù hợp với thể trạng riêng của học viên.
  - Tích hợp trực tiếp vào Tab Giáo án trong Hồ sơ Hội viên 360°.

---

### PHASE P06 — BẢNG ĐIỀU KHIỂN PHÂN TÍCH & ĐỒNG BỘ MOBILE V2.0
*Mục tiêu: Cung cấp bức tranh phân tích kinh doanh thời gian thực cho chủ phòng gym và đồng bộ dữ liệu thẻ/giáo án v2.0 sang Mobile App.*

- [x] **P06-T01** `[Track: GM]` — **Dashboard Analytics Kinh Doanh & Vận Hành**:
  - Thống kê doanh thu kỳ (ngày/tuần/tháng), cơ cấu doanh thu theo gói tập và phương thức thanh toán.
  - Thống kê số lượng hội viên đang hoạt động, tỷ lệ gia hạn thẻ và danh sách hội viên sắp hết hạn cần chăm sóc.
  - Biểu đồ lưu lượng check-in theo khung giờ vàng trong ngày tại từng chi nhánh.
- [x] **P06-T02** `[Track: WM & SP]` — **Kiểm Định Toàn Diện Hệ Thống & Đồng bộ Mobile App v2.0 (Dual-Mode Integration)**:
  - Mobile App hiển thị Thẻ Hội viên điện tử từ `gym_members` và `memberships` sau khi liên kết OTP.
  - Hội viên xem được Giáo án tập luyện cá nhân hóa do PT giao từ `workout_programs` / `program_days` / `program_day_exercises`.
  - Giữ nguyên vẹn 100% chế độ Standalone Workout ngoại tuyến trên SQLite cục bộ.

---

## 2. CHI TIẾT 9 PHASE (PHASE 0–8) VÀ MA TRẬN PHỤ THUỘC KỸ THUẬT

### PHASE 0 — REQUIREMENTS & ARCHITECTURE [COMPLETED]
*Mục tiêu: Phân tích, thiết kế, chuẩn hóa tài liệu và thẩm định kiến trúc; không có code hay migration.*

- [x] **P0.T01** `[Track: SP]` — Kiểm kê trạng thái dự án hiện tại (đã triển khai vs. thiết kế).  
  *Tham chiếu: Toàn bộ docs/ hiện tại.*
- [x] **P0.T02** `[Track: SP]` — Thiết kế mô hình multi-tenant và RBAC.  
  *Tham chiếu: `docs/supabase-schema.md` (mục Multi-Tenancy & RBAC).*
- [x] **P0.T03** `[Track: GM]` — Đặc tả module gym management, member, membership, attendance, payments.  
  *Tham chiếu: `docs/baocao.md` (Chương 2: 8 Luồng Nghiệp vụ E2E).*
- [x] **P0.T04** `[Track: SP]` — Thiết kế kiến trúc mobile/web/backend.  
  *Tham chiếu: `docs/baocao.md` (Chương 4: Kiến trúc Kỹ thuật Tổng thể).*
- [x] **P0.T05** `[Track: SP]` — Ghi nhận rủi ro và quyết định còn mở.  
  *Tham chiếu: `docs/risks-decisions.md`.*
- [x] **P0.T06** `[Track: WM]` — Cập nhật requirements, testing-acceptance, auth, schema và offline docs.  
  *Tham chiếu: `docs/baocao.md`, `docs/testing-acceptance.md`, `docs/supabase-schema.md`, `docs/data-offline.md`.*
- [x] **P0.T07** `[Track: SP]` — **Phê duyệt kiến trúc mới (D-MT-01 Monorepo npm workspaces, D-MT-02 Next.js App Router, D-MT-03 Supabase SSR Server-First httpOnly cookie, D-MT-04 Edge Functions + RPC least privilege, D-MT-11 Multi-branch staff assignment, OD-01..OD-06).**  
  *Trạng thái: APPROVED WITH CONDITIONS (Chủ dự án phê duyệt chính thức ngày 2026-10-23; tuân thủ 5 điều kiện AC-P0T07-01..05 và 6 Owner Decisions OD-01 đến OD-06).*  
  *Tham chiếu: `docs/risks-decisions.md`, `docs/baocao.md`.*
- [x] **P0.T08** `[Track: SP]` — **Chốt schema gym management tables và tạo migration GM-1 (bảng gyms, branches, gym_staff với Composite FK (branch_id, gym_id) sử dụng ON DELETE RESTRICT theo OD-02=A, branches.status CHECK ('active', 'suspended', 'archived'), soft-deactivation 'archived', gym_staff.status CHECK ('invited', 'active', 'suspended', 'revoked'), revoked_at/revoked_by, 2 partial unique indexes WHERE status = 'active', 2 RLS helper functions is_gym_owner và is_active_staff hỗ trợ allowed_roles TEXT[], RLS fail-closed, và migration file 20261025150000_gm1_tenant_branch_staff.sql).**  
  *Trạng thái: HOÀN THÀNH (Đã tạo migration file GM-1 thực tế tại `supabase/migrations/20261025150000_gm1_tenant_branch_staff.sql` theo phê duyệt của Owner).*  
  *Tham chiếu: `docs/supabase-schema.md`.*

> **Điều kiện hoàn thành Phase 0 (Phase 0 Review Gate):** [COMPLETED] P0.T01–P0.T08 đã hoàn tất và được nghiệm thu toàn bộ. Migration GM-1 đã tạo sẵn sàng. Tài liệu thu gọn về 8 file cốt lõi SSOT.  
> **Phụ thuộc:** Phase 0 hoàn thành; mở đường cho Phase 1 triển khai tuần tự theo lộ trình Step-by-step Evolution.

---

### PHASE 1 — MULTI-TENANT AUTHENTICATION & RBAC FOUNDATION [COMPLETED]
*Mục tiêu: Mở rộng Auth hiện tại để hỗ trợ gym roles; thiết lập nền tảng RBAC.*

- [x] **P1.T01** `[Track: SP]` — Thiết kế và review schema `gyms`, `branches`, `gym_staff`. *(Đã hoàn thành thông qua migration `20261025150000_gm1_tenant_branch_staff.sql` tại P0.T08)*.  
  *Tham chiếu: `docs/baocao.md` (Chương 2), `docs/supabase-schema.md`.*
- [x] **P1.T02** `[Track: SP]` — Chuẩn bị migration GM-1 (`gyms`, `branches`, `gym_staff`). *(Đã hoàn thành thông qua migration `20261025150000_gm1_tenant_branch_staff.sql` tại P0.T08)*.  
  *Tham chiếu: `docs/supabase-schema.md` — nhóm GM-1.*
- [x] **P1.T03** `[Track: SP]` — Thiết kế và review RLS cho gym/branch tables. *(Đã hoàn thành thông qua migration `20261025150000_gm1_tenant_branch_staff.sql` tại P0.T08)*.  
  *Tham chiếu: `docs/supabase-schema.md` (mục Multi-Tenancy & RBAC).*
- [x] **P1.T04** `[Track: SP]` — Thiết kế staff invite flow & RPC lifecycle (`rpc_revoke_or_update_staff`). *(Đã hoàn thành qua file migration `20261025160000_gm1_mutation_rpcs.sql` và TypeScript service theo OD-01, OD-02=A)*.  
  *Tham chiếu: `docs/baocao.md`, `docs/risks-decisions.md` D-MT-04, OD-01, OD-02.*
- [x] **P1.T05** `[Track: GM]` — Thiết kế Admin Web auth & RPC lookup (`rpc_create_gym`, `rpc_manage_branch`, `GymManagementService`). *(Đã hoàn thành qua file migration `20261025160000_gm1_mutation_rpcs.sql` và TypeScript service)*.  
  *Tham chiếu: `docs/baocao.md` (Chương 4), `docs/risks-decisions.md` D-MT-03.*
- [x] **P1.T06** `[Track: SP]` — Kiểm thử RBAC: MT-01–05, RBAC-01–12 (xem `testing-acceptance.md`). *(Đã hoàn thành qua unit test suite `__tests__/gm1-service-test.ts`, 9 passed suites, 35 tests passed)*.  
  *Tham chiếu: `docs/testing-acceptance.md`.*
- *(Tiến độ Mobile Foundation kế thừa hoàn thành)*:
  - [x] **Phase 1.T01** `[Track: WM]` — Chốt phạm vi MVP, luồng người dùng và màn hình.
  - [x] **Phase 1.T02** `[Track: SP]` — Chốt quyết định backend, auth và phiên bản Expo SDK hoặc ghi nhận blocker.
  - [x] **Phase 1.T03** `[Track: WM]` — Khởi tạo Expo + React Native + TypeScript.
  - [x] **Phase 1.T04** `[Track: WM]` — Thiết lập Expo Router, tabs và auth routes.
  - [x] **Phase 1.T05** `[Track: WM]` — Thiết lập cấu trúc module, lint và nền tảng kiểm thử.
  - [x] **Phase 2.T01** `[Track: WM]` — Tạo color tokens Dark/Light và theme provider.
  - [x] **Phase 2.T02** `[Track: WM]` — Tạo typography, spacing, radius và size tokens.
  - [x] **Phase 2.T03** `[Track: WM]` — Xây dựng AppText, Screen, Button, Card, Input và IconButton.
  - [x] **Phase 2.T04** `[Track: WM]` — Tạo Bottom Navigation và trạng thái giao diện chuẩn.
  - [x] **Phase 2.T05** `[Track: WM]` — Kiểm tra tương phản, vùng chạm, safe area và chữ phóng to.

> **Điều kiện hoàn thành:** [COMPLETED] RBAC test matrix (MT, RBAC) pass 100%; 3 Mutation RPCs GM-1 hoàn tất; staff lifecycle & Mutual Exclusivity OD-02=A hoạt động an toàn; GymManagementService sẵn sàng.  
> **Phụ thuộc:** Phase 0 & Phase 1 hoàn thành; mở đường cho Phase 2 (Gym & Branch Management & Mobile Core Workouts).

---

### PHASE 2 — GYM & BRANCH MANAGEMENT & MOBILE CORE WORKOUTS
*Mục tiêu: Admin Web có thể tạo gym, branch và quản lý nhân viên; Mobile client triển khai Thư viện bài tập offline.*

- [x] **P2.T01** `[Track: GM]` — Khởi tạo Admin Web project (Next.js theo D-MT-02; Monorepo npm workspaces theo OD-03=A: `apps/admin-web`, `apps/mobile`).  
  *Tham chiếu: `docs/baocao.md` (Chương 4), `docs/risks-decisions.md` D-MT-02, OD-03.*
- [x] **P2.T02** `[Track: GM]` — Xác thực Admin Web & Khung điều hành Dashboard Shell (Supabase Auth SSR PKCE httpOnly cookie, `/login`, `/dashboard`, Header + Sidebar navigation).  
  *Tham chiếu: `docs/baocao.md` (Chương 2: Luồng E2E 1).*
- [x] **P2.T03** `[Track: GM]` — Phân hệ Quản lý Chi nhánh (Giao diện danh sách `/dashboard/branches` nạp dữ liệu Supabase và Form tạo chi nhánh vật lý `/dashboard/branches/create` kèm auto-slug).  
  *Tham chiếu: `docs/baocao.md` (Chương 2: Luồng E2E 2).*
- [ ] **P2.T04** `[Track: GM]` — Giao diện mời và quản lý nhân viên.  
  *Tham chiếu: `docs/baocao.md` (Chương 2: Luồng E2E 3).*
- [ ] **P2.T05** `[Track: GM]` — Integration test: FR-GM-01 đến FR-GM-05.  
  *Tham chiếu: `docs/baocao.md`, `docs/testing-acceptance.md`.*
- *(Tiến độ Mobile Core song song — FIX-R02 & FIX-F01)*:
  - [x] **Phase 3.T01** `[Track: WM]` — Thiết kế schema SQLite, migration và repository (Schema v1 6 bảng và repositories hoạt động).
  - [x] **Phase 3.T04** `[Track: WM]` — Tạo thư viện bài tập: danh sách, tìm kiếm, lọc, chi tiết (hoạt động 100% ngoại tuyến trên SQLite; hoàn thiện thay thế RoutePlaceholder).  
    *Tham chiếu: `docs/baocao.md` (Chương 4), `docs/design-system.md`.*

> **Điều kiện hoàn thành:** FR-GM-01–05 nghiệm thu; không cross-tenant leak; thư viện bài tập mobile offline hoàn thành.  
> **Phụ thuộc:** Phase 1 hoàn thành; Phase 3.T01 đã có sẵn.

---

### PHASE 3 — MEMBER MANAGEMENT, MOBILE AUTH & ACCOUNT LINKING
*Mục tiêu: Admin Web quản lý hội viên; triển khai Mobile Authentication cơ bản; liên kết tài khoản an toàn qua OTP.*

- [x] **P3.T01** `[Track: SP]` — Schema `memberships`, `membership_plans`, `attendance_logs`; migration GM-2 (`20261028235500_gym_management_core.sql` & patch `20261031000000_gm2_admin_member_policies_and_user_fields.sql`).  
  *Tham chiếu: `docs/baocao.md` (Chương 2: Luồng E2E 4), `docs/supabase-schema.md`.*
- [x] **P3.T02** `[Track: GM]` — Phân hệ Quản lý Hội viên Admin Web (Danh sách `/dashboard/members`, Form cấp thẻ `/dashboard/members/create` cập nhật đa bảng `public.users` & `memberships`, tự sinh mã định danh `MEM-XXXXXX`).  
  *Tham chiếu: `docs/baocao.md` (Chương 2: Luồng E2E 4).*
- [ ] **Phase 3.T02** `[Track: WM — FIX-F01 & FIX-12]` — **Xây dựng xác thực, đăng ký/đăng nhập/đăng xuất khi backend sẵn sàng**. *(Hiện trạng mã nguồn: Client factory, SecureStore adapter và AuthProvider đã có sẵn trong `src/modules/auth/`; màn hình `login.tsx`/`register.tsx` còn là RoutePlaceholder, giữ nguyên 100% trạng thái chưa hoàn thành `[ ]`. Dependency: Độc lập hoàn toàn với Gym RLS P1.T03, Admin Web P1.T05 và Workout Cloud Sync P6.T01a; chỉ phụ thuộc biến môi trường Supabase URL/Key. Tuyệt đối không triển khai mã nguồn trong task tài liệu này)*.  
  *Ghi chú triển khai kỹ thuật (Implementation Notes):*  
  - Tận dụng `AuthProvider` React Context và `createSecureStoreAdapter` đã được thiết lập sẵn trong codebase.  
  - Chính sách độ phức tạp mật khẩu: Không tự ý áp đặt quy tắc cứng; chính sách mật khẩu sẽ tuân thủ cấu hình bảo mật được Chủ dự án phê duyệt (mặc định tối thiểu 6–8 ký tự theo Supabase Auth settings).  
  *Tiêu chí nghiệm thu chức năng & an toàn (Acceptance Criteria):*  
  - `AC-AUTH-01 (Đăng ký an toàn)`: Form đăng ký tiếp nhận email hợp lệ và mật khẩu thỏa mãn chính sách bảo mật; gửi email xác thực kích hoạt hoặc auto sign-in; xử lý lỗi email đã tồn tại an toàn.  
  - `AC-AUTH-02 (Đăng nhập & Chống dò quét tài khoản - Account Enumeration Prevention)`: Xác thực Email/Password qua Supabase GoTrue sử dụng PKCE flow; hiển thị loading state; xử lý rate-limiting chống brute-force; khi đăng nhập thất bại, hệ thống trả về thông báo lỗi chung đồng nhất (ví dụ: "Email hoặc mật khẩu không chính xác"), tuyệt đối không tiết lộ tài khoản có tồn tại hay không.  
  - `AC-AUTH-03 (Đăng xuất an toàn)`: Gọi `supabase.auth.signOut()`, dọn dẹp sạch token trong SecureStore, xóa trạng thái người dùng trong AuthContext và điều hướng an toàn về màn hình đăng nhập.  
  - `AC-AUTH-04 (Lưu phiên an toàn - Session Persistence)`: Tự động lưu `access_token` và `refresh_token` mã hóa qua `expo-secure-store`; tự động khôi phục phiên khi mở ứng dụng từ trạng thái tắt hoàn toàn (cold boot) mà không bắt đăng nhập lại nếu refresh token còn hiệu lực.  
  - `AC-AUTH-05 (Gia hạn Token ngầm - Silent Refresh Token)`: Cấu hình `autoRefreshToken: true`; lắng nghe sự kiện AppState ('active') để tự động làm mới access token trong nền; nếu refresh token bị thu hồi hoặc hết hạn, xử lý logout an toàn mà không làm crash ứng dụng.  
  - `AC-AUTH-06 (Xử lý lỗi an toàn - Safe Error Handling)`: Bắt và ánh xạ toàn bộ mã lỗi từ backend (mất mạng, server timeout, lỗi phiên) sang thông báo tiếng Việt thân thiện; triệt để ngăn chặn rò rỉ mã lỗi raw, stack trace hoặc thông tin kỹ thuật nhạy cảm ra giao diện người dùng.  
  *Tham chiếu: `docs/baocao.md`, `docs/design-system.md`.*
- [ ] **Phase 3.T03** `[Track: WM — FIX-F01]` — **Tạo hồ sơ và onboarding trên mobile**.  
  *Tham chiếu: `docs/baocao.md` (Chương 3).*
- [ ] **P3.T03** `[Track: SP & WM]` — Luồng liên kết tài khoản Supabase Auth xác minh OTP (ngăn chặn chiếm quyền, chống ghi đè tài khoản).  
  *Tham chiếu: `docs/baocao.md` (Chương 2 & 4).*
- [ ] **P3.T04** `[Track: WM]` — Mobile app: xem profile và lịch sử hội viên của mình (Gym Member Mode cơ bản).  
  *Tham chiếu: `docs/baocao.md` (Chương 2: Luồng E2E 4).*
- [ ] **P3.T05** `[Track: GM & SP]` — Test matrix FR-MB-01–05, kiểm tra cờ rà soát hồ sơ trùng lặp (Review Flag, không archive dữ liệu tài chính theo ALIGN-01).  
  *Tham chiếu: `docs/baocao.md`, `docs/testing-acceptance.md`.*
- [x] **Phase 3.T05** `[Track: WM]` — Tạo kế hoạch: CRUD, thứ tự bài tập, cấu hình hiệp/reps/nghỉ (Offline-First trên SQLite; thay thế RoutePlaceholder).
- [x] **Phase 3.T06 (Mobile Core)** `[Track: WM]` — Màn hình Tiến trình (Progress Tab): 3 chỉ số thống kê (Tổng buổi tập, Thời gian, Tổng khối lượng) & Lịch sử hoạt động gần đây (Offline-First trên SQLite; thay thế RoutePlaceholder).  
  *Tham chiếu: `docs/baocao.md`, `docs/data-offline.md`.*  
  *Tham chiếu: `docs/baocao.md`, `docs/data-offline.md`.*
- *(Tiến độ Thiết kế & Chuẩn bị Cloud Schema Migration v1 — Completed Historical Baseline)*:
  - [x] **Phase 3.T06** `[Track: SP]` — Chốt hợp đồng dữ liệu Supabase PostgreSQL–SQLite và các quy tắc đồng bộ còn mở.
  - [x] **Phase 3.T07** `[Track: SP]` — Thiết kế PostgreSQL schema và chiến lược migrations cho dữ liệu người dùng, bài tập, kế hoạch và buổi tập (Core 7 bảng).
  - [x] **Phase 3.T08** `[Track: SP]` — Thiết kế RLS, grants và indexes cho mọi bảng được expose.
  - [x] **Phase 3.T09** `[Track: WM]` — Thiết kế SQLite migration tương thích UUID và đơn vị cân nặng số nguyên, kèm sync outbox.
  - [x] **Phase 3.T10** `[Track: SP]` — Xây dựng kế hoạch kiểm thử schema, chuyển đổi cân nặng, RLS và cách ly dữ liệu đa tài khoản.
  - [x] **Phase 3.T11** `[Track: SP]` — Review và xác nhận hợp đồng/schema trước khi cho phép triển khai migrations hoặc sync.
  - [x] **Phase 3.T12** `[Track: SP]` — Chuẩn bị 4 PostgreSQL Core Schema Migration v1 files theo phê duyệt có điều kiện; chỉ tạo migration files và cập nhật kế hoạch kiểm thử/rollback.
- *(Historical Migration Evidence & Cloud Status)*:
  - **4 Core Migration Files v1**: Đã được tạo lập có điều kiện ngày 2026-10-21 tại `supabase/migrations/` (7 bảng core, indexes và read-only RLS; không cấp client DML trực tiếp).
  - **Mốc lịch sử 2026-10-21 & 2026-10-22**: Ngày 2026-10-21 hoàn tất thiết kế review; ngày 2026-10-22 ghi nhận báo cáo chạy thủ công 4 files migration trên project Supabase Cloud `gym-workout`, catalog có 7 bảng và RLS SELECT policy.
  - **Trạng thái Cloud Migrations**: Các trạng thái Cloud nêu trên là do người dùng tự báo cáo (user-reported), chưa được kiểm chứng độc lập trong phiên kỹ thuật này (not independently verified). Toàn quyền bảng của role `service_role` hiện đang bị thu hồi; cần review quyền tối thiểu trước khi thiết kế mutation gateway.
  - **Phase 3.T13 vẫn BLOCKED**: Kiểm thử migration trên môi trường Supabase local disposable vẫn giữ nguyên trạng thái BLOCKED `[ ]` do môi trường Windows thiếu Docker Desktop và Supabase CLI.
  - **Yêu cầu Bắt buộc**: Bắt buộc phải thực hiện Cloud Catalog Audit chỉ đọc (`P6.T01a`) và RLS A/B tests (với 2 tài khoản tạm thời cô lập) trước khi cho phép đồng bộ dữ liệu.
  - **Tham chiếu chi tiết**: `docs/supabase-schema.md` và `docs/risks-decisions.md`.

> **Điều kiện hoàn thành:** FR-MB-01–05 nghiệm thu; xác minh quyền sở hữu tài khoản bắt buộc qua OTP; Mobile Auth cơ bản hoạt động; kế hoạch tập luyện offline hoàn thành.  
> **Phụ thuộc:** Phase 2 hoàn thành; Phase 3.T04 đã có sẵn.

---

### PHASE 4 — MEMBERSHIP, ATTENDANCE & PAYMENT CORE
*Mục tiêu: Đăng ký và quản lý gói tập; check-in hội viên; tích hợp Payment Core GM-3b để kích hoạt gói tập.*

- **Điều kiện tiên quyết nghiệp vụ (FIX-R04 & FIX-F03):** `BR-PAY-01` (chính sách kích hoạt gói 100%) và `BR-PAY-02` (tiền tệ VND `amount BIGINT`) phải được quyết định chính thức trước khi thiết kế và triển khai migration `GM-3b`.
- [ ] **P4.T01** `[Track: SP]` — Schema `membership_plans`, `memberships`; migration GM-3.  
  *Tham chiếu: `docs/baocao.md` (Chương 2: Luồng E2E 5), `docs/supabase-schema.md`.*
- [ ] **P4.T02** `[Track: GM]` — Admin Web: danh mục gói, đăng ký, gia hạn, tạm dừng/hủy gói.  
  *Tham chiếu: `docs/baocao.md` (Chương 2: Luồng E2E 5).*
- [ ] **P4.T03** `[Track: SP]` — Schema `attendance_logs`; migration GM-4.  
  *Tham chiếu: `docs/baocao.md` (Chương 2: Luồng E2E 6), `docs/supabase-schema.md`.*
- [ ] **P4.T04** `[Track: GM — FIX-11]` — **Admin Web: check-in thủ công với validation đầy đủ**. *(Bảo toàn 100% phạm vi gốc: Tiếp tân tra cứu hội viên theo số điện thoại/họ tên/mã trên Admin Web và nhấn nút Check-in; động cơ 6 bước xác thực gói tập, chi nhánh, nợ phí trong < 500ms. Đây là phương thức điểm danh bắt buộc tối thiểu của Gym MVP)*.  
  *Tham chiếu: `docs/baocao.md` (Chương 2: Luồng E2E 6).*
- [ ] **P4.T05** `[Track: GM & SP]` — Test matrix MS-01–05, CI-01–07 (concurrent check-in pass, chặn thao tác lặp 60 phút theo OD-06).  
  *Tham chiếu: `docs/testing-acceptance.md`, `docs/risks-decisions.md` OD-06.*
- [ ] **P4.T06** `[Track: WM]` — **Mobile app: hội viên xem gói tập và lịch check-in của mình**. *(Bảo toàn 100% nguyên văn mô tả gốc. Ghi chú phạm vi mở rộng: Khi phát triển màn hình thẻ hội viên, hiển thị thêm mã QR check-in cá nhân để hỗ trợ quét tại quầy nếu P4.T09 được phê duyệt)*.  
  *Tham chiếu: `docs/baocao.md` (Chương 2).*
- [ ] **P4.T07** `[Track: SP — PROPOSED_ADDITION]` — Triển khai Schema Payment Core Tối thiểu `GM-3b` (bảng `payment_transactions` tối thiểu lưu `amount BIGINT` VND, `idempotency_key`, trạng thái `completed` theo OD-05).  
  *Tham chiếu: `docs/baocao.md` Mục 5.1 & 7.2, `docs/risks-decisions.md` OD-05.*
- [ ] **P4.T08** `[Track: GM — PROPOSED_ADDITION]` — Ghi nhận Thu phí & Kích hoạt Gói tập (Tiếp tân thu tiền mặt/POS, chuyển trạng thái gói sang `active` theo chính sách thanh toán đủ 100% tại quầy theo OD-05).  
  *Tham chiếu: `docs/baocao.md` (Chương 2).*
- [ ] **P4.T09** `[Track: GM — PROPOSED_ADDITION — FIX-11]` — **Admin Web: Quét mã QR hội viên tại quầy bằng Camera/Webcam hoặc máy quét mã vạch 2D (Desk QR Scanner)**:  
  - *Mục tiêu:* Mở rộng khả năng check-in tại quầy bằng cách quét mã QR hiển thị từ ứng dụng di động của hội viên (`P4.T06`) thay vì nhập tay.  
  - *Phân biệt rõ 3 phương thức điểm danh:*  
    1. Check-in thủ công (`P4.T04`): Tiếp tân tra cứu và nhấn nút trên Admin Web (Bắt buộc tối thiểu trong Gym MVP).  
    2. Quét QR tại quầy (`P4.T09`): Tiếp tân dùng camera máy tính hoặc máy quét 2D USB giải mã QR của hội viên (Đề xuất tùy chọn cho Gym MVP).  
    3. Cổng kiểm soát phần cứng mã QR động (`P8.T06`): Cổng xoay turnstile tự động tích hợp đầu đọc quang học và chip IoT giải mã TOTP QR (Phạm vi Hậu MVP Phase 8).  
  - *Tiêu chí nghiệm thu:* Quét và giải mã QR thành công trong < 300ms; tự động gọi động cơ xác thực 6 bước; phản hồi âm thanh/hình ảnh khi thành công hoặc bị từ chối; xử lý cấp quyền camera an toàn.  
  - *Trạng thái đề xuất:* `[PROPOSED]` — Chờ Chủ dự án phê duyệt lựa chọn: Lựa chọn A (Bổ sung vào Gym MVP để hoàn thiện trải nghiệm check-in QR liền mạch) hoặc Lựa chọn B (Chỉ giữ check-in thủ công P4.T04 cho MVP, hoãn quét QR tại quầy).  
  *Phụ thuộc:* `P4.T03`, `P4.T04`, `P4.T06`.  
  *Tham chiếu: `docs/baocao.md` Mục 7.4, `docs/risks-decisions.md` OD-06.*
- *(Tiến độ Mobile Core song song — Phase 4 cũ)*:
  - [ ] **Phase 4.T01** `[Track: WM]` — Bắt đầu/tạm dừng/tiếp tục/kết thúc buổi tập.
  - [ ] **Phase 4.T02** `[Track: WM]` — Ghi nhận và xác thực hiệp, mức tạ, số lần lặp.
  - [ ] **Phase 4.T03** `[Track: WM]` — Tạo RestTimer theo timestamp kết thúc dự kiến.
  - [ ] **Phase 4.T04** `[Track: WM]` — Tự động lưu vào SQLite và khôi phục khi mở lại.
  - [ ] **Phase 4.T05** `[Track: WM]` — Tạo màn hình tổng kết và kiểm thử chuyển nền/foreground.

> **Điều kiện hoàn thành:** FR-MS-01–05, FR-AT-01–03 nghiệm thu; CI-07 concurrent check-in pass; gói tập chỉ kích hoạt sau khi có giao dịch Payment Core `GM-3b`; luồng tập luyện di động hoạt động hoàn chỉnh ngoại tuyến.  
> **Phụ thuộc:** Phase 3; `BR-PAY-01` và `BR-PAY-02` (OD-05) được phê duyệt; Phase 3.T05 đã có sẵn.

---

### PHASE 5 — ADVANCED PAYMENTS, REPORTING & GYM MVP RELEASE GATE
*Mục tiêu: Ghi nhận thanh toán nâng cao, công nợ, hoàn tiền có kiểm toán, đối soát ca; hoàn thiện Mobile Core History/Stats; sẵn sàng hạ tầng production cho Gym MVP.*

- [ ] **P5.T01** `[Track: SP]` — **Chốt đơn vị tiền tệ và idempotency design (`risks-decisions.md` OD-05)**. *(Bảo toàn 100% nguyên văn mô tả gốc. Làm rõ: BR-PAY-01 chính sách thanh toán 100% và BR-PAY-02 đơn vị tiền tệ VND đã là điều kiện tiên quyết được phê duyệt theo OD-05 trước Phase 4 GM-3b; tại Phase 5, P5.T01 kế thừa và tập trung chuẩn hóa idempotency cho hoàn tiền nâng cao, xử lý lệch ca và mở rộng kế toán)*.  
  *Tham chiếu: `docs/baocao.md` (Chương 2: Luồng E2E 7), `docs/risks-decisions.md` OD-05.*
- [ ] **P5.T02** `[Track: SP]` — Schema `payment_transactions` mở rộng (công nợ, refund audit trail); migration GM-5.  
  *Tham chiếu: `docs/baocao.md`, `docs/supabase-schema.md`.*
- [ ] **P5.T03** `[Track: GM]` — Admin Web: ghi nhận và xem lịch sử giao dịch (quản lý công nợ, trạng thái nợ).  
  *Tham chiếu: `docs/baocao.md` (Chương 2).*
- [ ] **P5.T04** `[Track: GM]` — Admin Web: hoàn tiền độc lập với điều chỉnh gói tập kèm audit trail.  
  *Tham chiếu: `docs/baocao.md` (Chương 2).*
- [ ] **P5.T05** `[Track: GM]` — Admin Web: báo cáo doanh thu ca và đối soát tiền mặt chi nhánh cuối ngày.  
  *Tham chiếu: `docs/baocao.md` (Chương 2).*
- [ ] **P5.T06** `[Track: GM & SP]` — Test matrix PY-01–07 (idempotency, chống thu tiền kép).  
  *Tham chiếu: `docs/testing-acceptance.md`.*
- *(Tiến độ Mobile Core Lịch sử & Thống kê — FIX-F02: Thực thi tập trung DUY NHẤT tại Phase 5)*:
  - [x] **Phase 5.T01** `[Track: WM]` — Danh sách và chi tiết lịch sử buổi tập (SQLite).
  - [x] **Phase 5.T02** `[Track: WM]` — Xác định công thức, đơn vị và dữ liệu hợp lệ cho thống kê (Total Workouts, Total Duration, Total Volume Lifted; hoàn thiện tab Progress).
  - [ ] **Phase 5.T03** `[Track: WM]` — Tính tiến bộ, khối lượng tập và PR; hiển thị biểu đồ.
  - [ ] **Phase 5.T04** `[Track: WM]` — Tạo mục tiêu, thói quen và tiến độ hoàn thành.
  - [ ] **Phase 5.T05** `[Track: WM]` — Tạo nhắc lịch tập, quyền thông báo và cài đặt.
  - [ ] **Phase 5.T06** `[Track: WM]` — Thêm check-in phục hồi tự khai báo (Recovery) nếu được ưu tiên.
- [ ] **P5.T07** `[Track: SP & DevOps — PROPOSED_ADDITION]` — Production Configuration & Secret Management cho Gym MVP (quản lý biến môi trường an toàn, không rò rỉ keys).
- [ ] **P5.T08** `[Track: SP & DevOps — PROPOSED_ADDITION — FIX-F06 & FIX-07]` — **CI/CD, Backup/Restore & Forward-Fix / Safe Rollback Procedures**:
  - **Application Rollback (Web & Mobile)**: Admin Web rollback container/commit triển khai trước đó; Mobile app rollback qua EAS Update OTA hoặc binary submission.
  - **Database Forward-Fix (PostgreSQL Cloud Production)**: Nghiêm cấm chạy migration DROP/hồi quy trên production đang có dữ liệu giao dịch thật; mọi chỉnh sửa schema đều phải dùng migration tiến (Forward-Fix DDL) đóng gói trong `BEGIN ... COMMIT` tương thích ngược.
  - **Backup & Disaster Recovery (Năng lực thực tế đã xác minh)**: Nền tảng Supabase Free tier không hỗ trợ sao lưu tự động hàng ngày (automated daily backup) và không có PITR. Điều kiện nghiệm thu sao lưu thực tế bắt buộc dựa trên:
    1. Kịch bản trích xuất logic định kỳ và bản chụp trước triển khai bằng `pg_dump` hoặc `supabase db dump`.
    2. Diễn tập khôi phục (Restore Drill) bản dump logic lên môi trường test/staging độc lập để kiểm chứng tính toàn vẹn dữ liệu.
    3. PITR (Point-in-Time Recovery qua WAL streaming) chỉ áp dụng và là yêu cầu bắt buộc khi dự án được phê duyệt nâng cấp lên gói Supabase Pro/Team trong phạm vi ngân sách đã duyệt.
- [ ] **P5.T09** `[Track: SP & GM — PROPOSED_ADDITION]` — Logging, Audit Trail & Incident Readiness cho Gym MVP (giám sát lỗi quầy tiếp tân, checklist trước phát hành).
- [ ] **P5.T10** `[Track: WM — PROPOSED_ADDITION — FIX-R07]` — Mobile Scope Regression Verification cho Gym MVP (`AC-REL-06`): Chỉ kiểm thử hồi quy các tính năng Mobile thuộc phạm vi Gym MVP (Thẻ hội viên/QR P4.T06, Profile P3.T04, và đảm bảo app cá nhân không bị crash).

> ══════════════════════════════════════════════════════════════════════════════════════  
> 🚩 **CỔNG 1: GYM MANAGEMENT MVP RELEASE GATE (`[PROPOSED]`)**  
> *Thời điểm:* Sau khi hoàn tất Phase 5.  
> *Tính chất:* **Độc lập hoàn toàn với phân hệ PT**. Cho phép phát hành thương mại cổng Admin Web cho các đối tác không có nhu cầu PT.  
> *Điều kiện phát hành tối thiểu bắt buộc:*  
> - [ ] **AC-REL-01 (Tenant Isolation):** 100% câu truy vấn thử nghiệm chéo giữa 2 gym bị chặn; không rò rỉ dữ liệu.  
> - [ ] **AC-REL-02 (RBAC Enforcement):** Nhân viên suspended bị ngắt toàn bộ quyền tức thì tại request tiếp theo.  
> - [ ] **AC-REL-03 (Idempotency):** 10 requests thanh toán/check-in đồng thời chỉ sinh ra 1 bản ghi duy nhất.  
> - [ ] **AC-REL-04 (Attendance Consistency):** 100% ca sai chi nhánh, quá hạn hoặc hết lượt bị từ chối chính xác.  
> - [ ] **AC-REL-06 (Mobile Scope Regression):** Các tính năng Mobile thuộc phạm vi Gym MVP đạt Pass 100%, 0 blocker.  
> - [ ] **E2E Suite cho Gym MVP (FIX-10):** Nghiệm thu đạt 100% kịch bản E2E thuộc phạm vi vận hành phòng gym cốt lõi: **E2E-01, E2E-02, E2E-03, E2E-04, E2E-06, E2E-07** (độc lập hoàn toàn với phân hệ PT và Standalone workout).  
> - [ ] **Production Readiness Verified (FIX-07):** Secrets an toàn; CI/CD active; kịch bản rollback/forward-fix hoàn tất; diễn tập phục hồi bản sao lưu (Restore Drill qua pg_dump/logical dump) thành công và xác minh toàn vẹn dữ liệu; PITR chỉ áp dụng và nghiệm thu nếu kích hoạt gói Supabase Pro.  
> ══════════════════════════════════════════════════════════════════════════════════════

---

### PHASE 6 — WORKOUT CLOUD SYNC & PERSONAL TRAINING INTEGRATION
*Mục tiêu: Đối soát và đồng bộ dữ liệu tập luyện lên đám mây; triển khai phân hệ PT; kiểm soát chia sẻ dữ liệu qua Consent Model.*

- [ ] **P6.T01** `[Track: SP & WM — FIX-F02, FIX-F04 & FIX-08]` — **Hoàn tất và Đồng bộ Workout Modules Hiện tại**:
  - `P6.T01a` `[Track: SP — FIX-F04]`: **Quy trình Đối soát & Kích hoạt Core Migration v1 Không phá hủy**:
    - Bước 1: Chạy kiểm tra đối soát chỉ đọc (Read-only verification) catalog PostgreSQL (`information_schema.tables`, `pg_indexes`, `pg_policy`, `pg_class`, `information_schema.table_privileges`) trên Supabase Cloud đối chiếu với 4 file migration v1 hiện có.
    - Bước 2: Chạy kiểm thử A/B với 2 tài khoản tạm thời để xác nhận RLS isolation hoạt động đúng.
    - Bước 3: Tuyệt đối không tự ý chạy lại 4 core migrations. Nếu phát hiện thiếu hụt, chỉ lập file migration bổ sung (forward-fix) trình Chủ dự án duyệt.
  - [ ] **Phase 3.T13** `[Track: SP — FIX-08]` — **Kiểm thử core migration trên Supabase local disposable sau khi xác minh môi trường an toàn**. *(Bảo toàn 100% Task ID, mô tả gốc và trạng thái BLOCKED [ ] do môi trường thiếu Docker/Supabase CLI)*:
    - **Phân biệt ranh giới kỹ thuật:** `Phase 3.T13` là kiểm thử thực thi DDL trên môi trường cô lập cục bộ (local disposable container/database) để thẩm định cú pháp PostgreSQL, trigger, ràng buộc foreign key và kịch bản rollback nghịch đảo mà KHÔNG tác động tới cloud. Ngược lại, `P6.T01a` là kiểm toán đối soát catalog chỉ đọc trên database Supabase Cloud project `gym-workout` thực tế.
    - **Đường giải quyết Blocker (Unblocking Path):**
      1. *Phương án Khuyến nghị:* Cấu hình Docker Desktop và Supabase CLI (`supabase/config.toml`) trên máy dev hoặc CI runner an toàn để chạy `supabase start` và `supabase db reset`.
      2. *Phương án Thay thế:* Tạo 1 project Supabase Cloud tạm thời (disposable test project trắng, hoàn toàn độc lập với `gym-workout`, không tốn chi phí và không chứa dữ liệu thực) để thực thi kiểm thử.
    - **Tiêu chí nghiệm thu gốc (Acceptance Criteria):**
      1. Cả 4 file migration Core v1 chạy từ database trắng đạt 100% thành công, 0 lỗi cú pháp.
      2. Tạo lập đầy đủ 7 bảng Core, các composite index và các policy RLS SELECT đúng theo `supabase-schema.md`.
      3. Ràng buộc toàn vẹn (FK, NOT NULL, CHECK) từ chối chính xác dữ liệu vi phạm.
      4. Kịch bản rollback nghịch đảo đưa database trở về trạng thái sạch sẽ mà không lỗi.  
    *Tham chiếu: `docs/supabase-schema.md`, `docs/data-offline.md`, `docs/risks-decisions.md`.*
  - `P6.T01b` `[Track: WM — FIX-F02]`: **Triển khai Hàng đợi Đồng bộ Đám mây (Cloud Sync Outbox)** (CHỈ bao gồm công việc đồng bộ, không lặp lại History/Stats của Phase 5):
    - [ ] `Phase 6.T01` — Kiểm thử ghi cục bộ trước và khôi phục mọi thao tác cốt lõi.
    - [ ] `Phase 6.T02` — Triển khai sync queue theo contract UUID, outbox, FIFO và idempotency đã duyệt tại Phase 3.T06.
    - [ ] `Phase 6.T03` — Triển khai network detection, retry/backoff và xử lý lỗi.
    - [ ] `Phase 6.T04` — Triển khai optimistic concurrency và luồng xử lý conflict tường minh khi backend sẵn sàng.
    - [ ] `Phase 6.T05` — Kiểm thử mất mạng, kết nối lại và chống trùng bản ghi.
- [ ] **P6.T02** `[Track: SP — FIX-F05]` — Schema `pt_sessions`, `pt_member_assignments` (Migration GM-5 mở rộng). *(Phụ thuộc `gym_staff` và `gym_members`, KHÔNG phụ thuộc Workout Cloud Sync)*.  
  *Tham chiếu: `docs/supabase-schema.md`.*
- [ ] **P6.T03** `[Track: GM — FIX-F05]` — Admin Web: lịch PT và phân công trainer (bàn giao học viên, thu hồi quyền trainer cũ tức thì). *(Phụ thuộc P6.T02, KHÔNG phụ thuộc Workout Cloud Sync)*.
- [ ] **P6.T04** `[Track: WM — FIX-F05]` — Mobile app: hội viên đặt lịch PT, xem lịch, xác nhận tiêu thụ buổi tập (xác thực 2 chiều `BR-PT-02`). *(Phụ thuộc P6.T02 & P6.T03, KHÔNG phụ thuộc Workout Cloud Sync)*.
- [ ] **P6.T05** `[Track: SP & PT — FIX-F05]` — **RLS cho Trainer xem Workout Data của Member (PT Workout Data Sharing)**:  
  *ĐÂY LÀ PHẦN DUY NHẤT CỦA PT PHỤ THUỘC VÀO:*  
  1. Dữ liệu tập luyện của hội viên đã đồng bộ lên Supabase Cloud (`P6.T01a/b`).  
  2. Hội viên cấp quyền chia sẻ qua **Mô hình Chấp thuận (Consent Model `BR-PT-03`)**; tuân thủ Health Data Minimization (nghiêm cấm thu thập bệnh lý).  
  *Tham chiếu: `docs/supabase-schema.md`, `docs/testing-acceptance.md` RBAC-08–09.*
- [ ] **P6.T06** `[Track: GM, PT, WM]` — Test matrix FR-WPT-01–04.

> ══════════════════════════════════════════════════════════════════════════════════════  
> 🚩 **CỔNG 2: PT & PERSONAL TRAINING INTEGRATION GATE (`[PROPOSED]`)**  
> *Thời điểm:* Sau khi hoàn tất Phase 6.  
> *Tiêu chí nghiệm thu định lượng bắt buộc:*  
> - [ ] **AC-REL-05 (PT Privacy & Explicit Consent):** Trainer bị chặn xem dữ liệu tập khi chưa có Consent; thu hồi quyền ngắt truy cập tức thì.  
> - [ ] **AC-REL-07 (PT Scheduling & Consumption):** Đặt lịch không trùng giờ; hoàn thành buổi tập hợp lệ tự động trừ chính xác 1 buổi trong `pt_sessions_remaining`.  
> - [ ] **E2E-05 (Personal Training Service Flow - FIX-10):** Nghiệm thu đạt 100% kịch bản chu trình dịch vụ huấn luyện viên: mua gói PT, phân công trainer, cấp quyền chia sẻ dữ liệu qua Consent Model và tiêu thụ buổi tập.  
> ══════════════════════════════════════════════════════════════════════════════════════

---

### PHASE 7 — FULL PLATFORM COMPREHENSIVE TESTING & RELEASE
*Mục tiêu: Kiểm thử toàn diện, bảo mật toàn hệ thống và chuẩn bị phát hành toàn nền tảng.*

- [ ] **P7.T01** `[Track: SP]` — Security review: RBAC, RLS cross-tenant, gateway permissions, penetration test.  
  *Tham chiếu: `docs/testing-acceptance.md` MT-01–05, RBAC.*
- [ ] **P7.T02** `[Track: GM & SP]` — Performance testing: member search, dashboard load, stress test điểm danh đồng thời.
- [ ] **P7.T03** `[Track: Toàn hệ thống]` — E2E testing: luồng liên thông owner, staff, PT, member và standalone workout.
- [ ] **P7.T04** `[Track: WM]` — iOS/Android runtime verification (giải quyết blocker iOS môi trường Windows qua thiết bị thật/cloud CI).
- [ ] **P7.T05** `[Track: SP & DevOps]` — Deployment setup: CI/CD toàn diện, staging, migration strategy cho production toàn hệ thống.
- [ ] **P7.T06** `[Track: Toàn hệ thống]` — Sửa lỗi, hồi quy toàn bộ AC-01..12 và chuẩn bị release toàn nền tảng.
- *(Bảo toàn Mobile Test Tasks — Phase 7 cũ; Không áp đặt Cloud Sync dependency cho unit tests)*:
  - [ ] `Phase 7.T01` — Chạy unit tests cho validation, timer, thống kê và trạng thái. *(Chỉ phụ thuộc logic Mobile Core Phase 4–5; độc lập hoàn toàn với Cloud Sync)*.
  - [ ] `Phase 7.T02` — Chạy component, integration và E2E theo AC-01 đến AC-12.
  - [ ] `Phase 7.T03` — Kiểm thử iOS/Android, cỡ chữ lớn, bàn phím và safe area.
  - [ ] `Phase 7.T04` — Rà soát bảo mật, quyền riêng tư, hiệu năng và các rủi ro.
  - [ ] `Phase 7.T05` — Sửa lỗi, kiểm tra hồi quy và chuẩn bị bản thử nghiệm.

> ══════════════════════════════════════════════════════════════════════════════════════  
> 🚩 **CỔNG 3: FULL PLATFORM PRODUCTION RELEASE GATE (`[PROPOSED]`)**  
> *Thời điểm:* Cuối Phase 7.  
> *Tiêu chí nghiệm thu định lượng bắt buộc:*  
> - [ ] **Toàn bộ AC-REL-01 đến AC-REL-07:** Đạt 100% tiêu chí nghiệm thu phát hành trên toàn hệ thống.  
> - [ ] **Toàn bộ AC-01 đến AC-12:** Đạt 100% tiêu chí cho Workout Mobile.  
> - [ ] **E2E-08 (Standalone Workout Privacy Flow - FIX-10):** Nghiệm thu đạt 100% kịch bản tập luyện độc lập ngoại tuyến, đảm bảo an toàn và tính độc lập của dữ liệu cá nhân khi liên kết gym.  
> - [ ] **Toàn diện E2E-01 đến E2E-08:** Nghiệm thu thông suốt toàn bộ 8 chu trình vận hành khép kín trên môi trường production.  
> - [ ] Đạt toàn bộ chỉ số NFRs về bảo mật, toàn vẹn dữ liệu, hiệu năng và tính độc lập ngoại tuyến.  
> - [ ] Blocker/Critical defects = 0 trên cả Web và Mobile.  
> ══════════════════════════════════════════════════════════════════════════════════════

---

### PHASE 8 — POST-MVP EXTENDED CAPABILITIES (MỞ RỘNG SAU MVP)
*Mục tiêu: Các tính năng mở rộng chỉ bắt đầu sau khi luồng MVP và toàn bộ nền tảng đã ổn định.*

- [ ] **Phase 8.T01** `[Track: WM & SP]` — Phân tích hiệu suất chuyên sâu (AI form analysis, 1RM progression).  
  *Tham chiếu: `docs/baocao.md` (Chương 3).*
- [ ] **Phase 8.T02** `[Track: SP & WM]` — Đồng bộ đa thiết bị và giải quyết xung đột nâng cao.  
  *Tham chiếu: `docs/data-offline.md`.*
- [ ] **Phase 8.T03** `[Track: WM]` — Tích hợp dữ liệu sức khỏe/thiết bị ngoài (Apple HealthKit / Google Health Connect).  
  *Tham chiếu: `docs/baocao.md` (Chương 4).*
- [ ] **Phase 8.T04** `[Track: WM]` — Cá nhân hóa kế hoạch và phân tích phục hồi nâng cao.  
  *Tham chiếu: `docs/baocao.md` (Chương 3).*
- [ ] **P8.T05** `[Track: GM & SP — PROPOSED_ADDITION — FIX-09]` — **Sáp nhập Hồ sơ Hội viên Nâng cao (`BR-MB-02`: DEFERRED từ Phase 3)**:
  - **Hiệu chỉnh Phụ thuộc (Dependencies):** Loại bỏ hoàn toàn sự phụ thuộc không có căn cứ vào `Phase 8.T02`. Dependency kỹ thuật và nghiệp vụ chính xác bao gồm: `P3.T01/02/05` (quản lý hồ sơ hội viên & rà soát trùng), `P4.T01` (gói tập), `P5.T02` (giao dịch thanh toán) và phê duyệt chính sách nghiệp vụ `BR-MB-02`.
  - **Nguyên tắc An toàn Dữ liệu (Data Safety Invariant):**
    1. *Tuyệt đối không xóa vật lý (Zero Hard Delete):* Không bao giờ thực hiện DELETE vật lý trên bảng `gym_members`.
    2. *Bảo toàn lịch sử tài chính & điểm danh:* Giữ nguyên vẹn toàn bộ audit trail của `payment_transactions`, `attendance_logs` và `memberships`.
    3. *Cơ chế liên kết:* Thiết lập con trỏ chuyển tiếp `merged_into_id` trỏ về hồ sơ chính, chuyển đổi trạng thái hồ sơ phụ sang `merged_archived` và gộp quyền lợi gói tập theo chính sách `BR-MB-02`.  
  *Tham chiếu: `docs/baocao.md` Mục 2.7 & 9.*
- [ ] **P8.T06** `[Track: GM & WM — PROPOSED_ADDITION]` — Điểm danh bằng phần cứng mã QR động (Dynamic QR Hardware Token).
- [ ] **P8.T07** `[Track: GM & SP — PROPOSED_ADDITION]` — Tích hợp cổng thanh toán trực tuyến tự động (Online Payment Gateways / Webhooks).

---

## 3. TASK MAPPING INTEGRITY REPORT & AUDIT MATRIX

### 3.1. Báo cáo Kiểm toán Tính Toàn vẹn (Audit Summary)
- **Tổng số Task ID gốc trong `docs/mindmap.md`:** **96 tasks**.
  - Phần 1 (Roadmap Workout Mobile cũ): 48 tasks (19 `[x]`, 29 `[ ]`).
  - Phần 2 (Roadmap Multi-Tenant mới): 48 tasks (6 `[x]`, 42 `[ ]`).
- **Missing IDs:** **0** (100% task gốc có mặt trong bảng mapping).
- **Duplicate IDs:** **0** (Mỗi task gốc xuất hiện duy nhất 1 dòng).
- **Changed Statuses:** **0** (100% task giữ nguyên trạng thái: 25 tasks `[x]`, 71 tasks `[ ]`).
- **Proposed Additions:** **10 tasks** (Được gắn nhãn `PROPOSED_ADDITION` riêng biệt: P4.T07, P4.T08, P4.T09, P5.T07, P5.T08, P5.T09, P5.T10, P8.T05, P8.T06, P8.T07; hoàn toàn tách biệt khỏi baseline 96 task gốc đã duyệt).

### 3.2. Bảng Đối chiếu Toàn bộ 96 Task Gốc (8 Cột Bắt Buộc)

| Original Task ID | Original Description | Original Status | Evidence / Historical Context | Proposed New Phase | Proposed New Track | Dependency | Change Type |
|---|---|:---:|---|:---:|:---:|---|---|
| **Phase 1.T01** | Chốt phạm vi MVP, luồng người dùng và màn hình | `[x]` | `docs/baocao.md`, `docs/design-system.md` | Phase 1 | `WM` | None | `PRESERVED_HISTORICAL` |
| **Phase 1.T02** | Chốt quyết định backend, auth và phiên bản Expo SDK hoặc ghi nhận blocker | `[x]` | `risks-decisions.md` (Expo SDK 57, Supabase) | Phase 1 | `SP` | None | `PRESERVED_HISTORICAL` |
| **Phase 1.T03** | Khởi tạo Expo + React Native + TypeScript | `[x]` | `package.json`, codebase khởi tạo | Phase 1 | `WM` | Phase 1.T01-02 | `PRESERVED_HISTORICAL` |
| **Phase 1.T04** | Thiết lập Expo Router, tabs và auth routes | `[x]` | `src/app/`, điều hướng 5 tabs hoạt động | Phase 1 | `WM` | Phase 1.T03 | `PRESERVED_HISTORICAL` |
| **Phase 1.T05** | Thiết lập cấu trúc module, lint và nền tảng kiểm thử | `[x]` | `eslint.config.js`, `__tests__/` | Phase 1 | `WM` | Phase 1.T03 | `PRESERVED_HISTORICAL` |
| **Phase 2.T01** | Tạo color tokens Dark/Light và theme provider | `[x]` | `src/shared/design-system/tokens/colors.ts` | Phase 1 | `WM` | Phase 1.T05 | `PRESERVED_HISTORICAL` |
| **Phase 2.T02** | Tạo typography, spacing, radius và size tokens | `[x]` | `src/shared/design-system/tokens/` | Phase 1 | `WM` | Phase 2.T01 | `PRESERVED_HISTORICAL` |
| **Phase 2.T03** | Xây dựng AppText, Screen, Button, Card, Input và IconButton | `[x]` | `src/shared/design-system/components/` | Phase 1 | `WM` | Phase 2.T02 | `PRESERVED_HISTORICAL` |
| **Phase 2.T04** | Tạo Bottom Navigation và trạng thái giao diện chuẩn | `[x]` | 5 tabs verified trên Android emulator | Phase 1 | `WM` | Phase 2.T03 | `PRESERVED_HISTORICAL` |
| **Phase 2.T05** | Kiểm tra tương phản, vùng chạm, safe area và chữ phóng to | `[x]` | WCAG 2.2 AA verified, 44×44px touch targets | Phase 1 | `WM` | Phase 2.T04 | `PRESERVED_HISTORICAL` |
| **Phase 3.T01** | Thiết kế schema SQLite, migration và repository | `[x]` | `src/shared/storage/schema.ts`, test pass | Phase 2 | `WM` | Phase 2.T05 | `PRESERVED_HISTORICAL` |
| **Phase 3.T02** | Xây dựng xác thực, đăng ký/đăng nhập/đăng xuất khi backend sẵn sàng | `[ ]` | Client/provider sẵn sàng trong `src/modules/auth/`; screens là placeholder; AC-AUTH-01..06 tách biệt | Phase 3 | `WM` | Env Config (Supabase URL/Key) | `REFINED_DEPENDENCY` |
| **Phase 3.T03** | Tạo hồ sơ và onboarding | `[ ]` | Chưa triển khai | Phase 3 | `WM` | Phase 3.T02 | `REFINED_DEPENDENCY` |
| **Phase 3.T04** | Tạo thư viện bài tập: danh sách, tìm kiếm, lọc, chi tiết | `[x]` | `src/modules/exercises/`, `src/app/(tabs)/exercises.tsx`, test pass | Phase 2 | `WM` | Phase 3.T01 | `DECOUPLED_PARALLEL` |
| **Phase 3.T05** | Tạo kế hoạch: CRUD, thứ tự bài tập, cấu hình hiệp/reps/nghỉ | `[x]` | `src/modules/workouts/`, `src/app/(tabs)/workouts.tsx`, test pass | Phase 3 | `WM` | Phase 3.T04 | `DECOUPLED_PARALLEL` |
| **Phase 3.T06** | Chốt hợp đồng dữ liệu Supabase PostgreSQL–SQLite và các quy tắc đồng bộ còn mở | `[x]` | `docs/data-offline.md`, `risks-decisions.md` | Phase 3 | `SP` | Phase 3.T01 | `PRESERVED_HISTORICAL` |
| **Phase 3.T07** | Thiết kế PostgreSQL schema và chiến lược migrations cho dữ liệu người dùng, bài tập, kế hoạch và buổi tập | `[x]` | `docs/supabase-schema.md` (2026-10-21) | Phase 3 | `SP` | Phase 3.T06 | `PRESERVED_HISTORICAL` |
| **Phase 3.T08** | Thiết kế RLS, grants và indexes cho mọi bảng được expose | `[x]` | `docs/supabase-schema.md` (2026-10-21) | Phase 3 | `SP` | Phase 3.T07 | `PRESERVED_HISTORICAL` |
| **Phase 3.T09** | Thiết kế SQLite migration tương thích UUID và đơn vị cân nặng số nguyên, kèm sync outbox | `[x]` | `docs/data-offline.md` (2026-10-21) | Phase 3 | `WM` | Phase 3.T06 | `PRESERVED_HISTORICAL` |
| **Phase 3.T10** | Xây dựng kế hoạch kiểm thử schema, chuyển đổi cân nặng, RLS và cách ly dữ liệu đa tài khoản | `[x]` | `docs/testing-acceptance.md` (2026-10-21) | Phase 3 | `SP` | Phase 3.T10 | `PRESERVED_HISTORICAL` |
| **Phase 3.T11** | Review và xác nhận hợp đồng/schema trước khi cho phép triển khai migrations hoặc sync | `[x]` | `docs/risks-decisions.md` (2026-10-21) | Phase 3 | `SP` | Phase 3.T10 | `PRESERVED_HISTORICAL` |
| **Phase 3.T12** | Chuẩn bị PostgreSQL Core Schema Migration v1 theo phê duyệt có điều kiện; chỉ tạo migration files và cập nhật kế hoạch kiểm thử/rollback | `[x]` | `supabase/migrations/` (4 files prepared 2026-10-21) | Phase 3 | `SP` | Phase 3.T11 | `PRESERVED_HISTORICAL` |
| **Phase 3.T13** | Kiểm thử core migration trên Supabase local disposable sau khi xác minh môi trường an toàn | `[ ]` | BLOCKED (thiếu Docker/CLI; unblocking bằng Docker local hoặc Supabase test project riêng biệt) | Phase 6 | `SP` | Phase 3.T12 | `PRESERVED_BLOCKED` |
| **Phase 4.T01** | Bắt đầu/tạm dừng/tiếp tục/kết thúc buổi tập | `[ ]` | Chưa triển khai trên mobile | Phase 4 | `WM` | Phase 3.T05 | `DECOUPLED_PARALLEL` |
| **Phase 4.T02** | Ghi nhận và xác thực hiệp, mức tạ, số lần lặp | `[ ]` | Chưa triển khai trên mobile | Phase 4 | `WM` | Phase 4.T01 | `DECOUPLED_PARALLEL` |
| **Phase 4.T03** | Tạo RestTimer theo timestamp kết thúc dự kiến | `[ ]` | Logic timestamp đã đặc tả; chưa viết code | Phase 4 | `WM` | Phase 4.T01 | `DECOUPLED_PARALLEL` |
| **Phase 4.T04** | Tự động lưu vào SQLite và khôi phục khi mở lại | `[ ]` | SQLite schema hỗ trợ; chưa gắn handler | Phase 4 | `WM` | Phase 4.T02 | `DECOUPLED_PARALLEL` |
| **Phase 4.T05** | Tạo màn hình tổng kết và kiểm thử chuyển nền/foreground | `[ ]` | Chưa triển khai | Phase 4 | `WM` | Phase 4.T04 | `DECOUPLED_PARALLEL` |
| **Phase 5.T01** | Danh sách và chi tiết lịch sử buổi tập | `[x]` | `src/modules/progress/`, `src/app/(tabs)/progress.tsx`, test pass | Phase 5 | `WM` | Phase 4.T05 | `DECOUPLED_PARALLEL` |
| **Phase 5.T02** | Xác định công thức, đơn vị và dữ liệu hợp lệ cho thống kê | `[x]` | Đã đặc tả volume = weight × reps, duration = end - start; hoàn thiện qua `WorkoutSessionRepository.getSessionsSummary` | Phase 5 | `WM` | Phase 5.T01 | `DECOUPLED_PARALLEL` |
| **Phase 5.T03** | Tính tiến bộ, khối lượng tập và PR; hiển thị biểu đồ | `[ ]` | Chưa tích hợp thư viện biểu đồ | Phase 5 | `WM` | Phase 5.T02 | `DECOUPLED_PARALLEL` |
| **Phase 5.T04** | Tạo mục tiêu, thói quen và tiến độ hoàn thành | `[ ]` | Chưa triển khai | Phase 5 | `WM` | Phase 5.T01 | `DECOUPLED_PARALLEL` |
| **Phase 5.T05** | Tạo nhắc lịch tập, quyền thông báo và cài đặt | `[ ]` | Chưa tích hợp Expo Notifications | Phase 5 | `WM` | Phase 5.T04 | `DECOUPLED_PARALLEL` |
| **Phase 5.T06** | Thêm check-in phục hồi tự khai báo nếu được ưu tiên | `[ ]` | Yêu cầu tùy chọn; chưa ưu tiên | Phase 5 | `WM` | Phase 5.T01 | `DECOUPLED_PARALLEL` |
| **Phase 6.T01** | Kiểm thử ghi cục bộ trước và khôi phục mọi thao tác cốt lõi | `[ ]` | Chưa chạy kiểm thử đầy đủ | Phase 6 | `WM` | Phase 5.T01 | `MAPPED_TRACK` |
| **Phase 6.T02** | Triển khai sync queue theo contract UUID, outbox, FIFO và idempotency đã duyệt tại Phase 3.T06 | `[ ]` | Thiết kế DDL outbox sẵn sàng; chưa code | Phase 6 | `WM` | Phase 3.T09, P6.T01a | `MAPPED_TRACK` |
| **Phase 6.T03** | Triển khai network detection, retry/backoff và xử lý lỗi | `[ ]` | Chưa triển khai | Phase 6 | `WM` | Phase 6.T02 | `MAPPED_TRACK` |
| **Phase 6.T04** | Triển khai optimistic concurrency và luồng xử lý conflict tường minh khi backend sẵn sàng | `[ ]` | Chưa triển khai | Phase 6 | `WM` | Phase 6.T03 | `MAPPED_TRACK` |
| **Phase 6.T05** | Kiểm thử mất mạng, kết nối lại và chống trùng bản ghi | `[ ]` | Chưa kiểm thử | Phase 6 | `WM` | Phase 6.T04 | `MAPPED_TRACK` |
| **Phase 7.T01** | Chạy unit tests cho validation, timer, thống kê và trạng thái | `[ ]` | Chưa chạy | Phase 7 | `WM` | Phase 4, Phase 5 Mobile Core (Độc lập với Cloud Sync) | `MAPPED_TRACK` |
| **Phase 7.T02** | Chạy component, integration và E2E theo AC-01 đến AC-12 | `[ ]` | Chưa chạy | Phase 7 | `WM` | Phase 7.T01 | `MAPPED_TRACK` |
| **Phase 7.T03** | Kiểm thử iOS/Android, cỡ chữ lớn, bàn phím và safe area | `[ ]` | iOS runtime BLOCKED trên Windows | Phase 7 | `WM` | Phase 7.T02 | `MAPPED_TRACK` |
| **Phase 7.T04** | Rà soát bảo mật, quyền riêng tư, hiệu năng và các rủi ro | `[ ]` | Chưa rà soát toàn diện | Phase 7 | `SP & WM`| Phase 7.T03 | `MAPPED_TRACK` |
| **Phase 7.T05** | Sửa lỗi, kiểm tra hồi quy và chuẩn bị bản thử nghiệm | `[ ]` | Chưa thực hiện | Phase 7 | `Toàn hệ thống`| Phase 7.T04 | `MAPPED_TRACK` |
| **Phase 8.T01** | Phân tích hiệu suất chuyên sâu | `[ ]` | Phạm vi sau MVP | Phase 8 | `WM` | Phase 7 Hoàn tất | `PRESERVED_POST_MVP` |
| **Phase 8.T02** | Đồng bộ đa thiết bị và giải quyết xung đột nâng cao | `[ ]` | Phạm vi sau MVP | Phase 8 | `SP & WM`| Phase 7 Hoàn tất | `PRESERVED_POST_MVP` |
| **Phase 8.T03** | Tích hợp dữ liệu sức khỏe/thiết bị ngoài khi được cho phép | `[ ]` | Phạm vi sau MVP | Phase 8 | `WM` | Phase 7 Hoàn tất | `PRESERVED_POST_MVP` |
| **Phase 8.T04** | Cá nhân hóa kế hoạch và phân tích phục hồi nâng cao | `[ ]` | Phạm vi sau MVP | Phase 8 | `WM` | Phase 7 Hoàn tất | `PRESERVED_POST_MVP` |
| **P0.T01** | Kiểm kê trạng thái dự án hiện tại (đã triển khai vs. thiết kế) | `[x]` | `docs/mindmap.md` P0.T01 đã nghiệm thu | Phase 0 | `SP` | None | `PRESERVED_HISTORICAL` |
| **P0.T02** | Thiết kế mô hình multi-tenant và RBAC | `[x]` | `docs/supabase-schema.md` | Phase 0 | `SP` | P0.T01 | `PRESERVED_HISTORICAL` |
| **P0.T03** | Đặc tả module gym management, member, membership, attendance, payments | `[x]` | `docs/baocao.md` (Chương 2) | Phase 0 | `GM` | P0.T02 | `PRESERVED_HISTORICAL` |
| **P0.T04** | Thiết kế kiến trúc mobile/web/backend | `[x]` | `docs/baocao.md` (Chương 4) | Phase 0 | `SP` | P0.T02 | `PRESERVED_HISTORICAL` |
| **P0.T05** | Ghi nhận rủi ro và quyết định còn mở | `[x]` | `docs/risks-decisions.md` (R-MT-01..14) | Phase 0 | `SP` | P0.T01-04 | `PRESERVED_HISTORICAL` |
| **P0.T06** | Cập nhật requirements, testing-acceptance, auth, schema và offline docs | `[x]` | Các file docs cập nhật đồng bộ | Phase 0 | `WM` | P0.T05 | `PRESERVED_HISTORICAL` |
| **P0.T07** | Phê duyệt kiến trúc mới (D-MT-01..04, D-MT-11, OD-01..06) | `[x]` | APPROVED WITH CONDITIONS (2026-10-23); các điều kiện AC-P0T07-01..05 và OD-01..06 tuân thủ | Phase 0 | `SP` | P0.T01-06 | `PRESERVED_GATE` |
| **P0.T08** | Chốt schema gym management tables và tạo migration GM-1 | `[x]` | Migration file `20261025150000_gm1_tenant_branch_staff.sql` đã tạo, DDL & RLS fail-closed hoàn tất | Phase 0 | `SP` | P0.T07 | `PRESERVED_GATE` |
| **P1.T01** | Thiết kế và review schema gyms, branches, gym_staff | `[x]` | `docs/supabase-schema.md` (Hoàn thành qua migration GM-1 tại P0.T08) | Phase 1 | `SP` | P0.T07-08 | `PRESERVED_ACTIVE` |
| **P1.T02** | Chuẩn bị migration GM-1 (gyms, branches, gym_staff) | `[x]` | `supabase/migrations/20261025150000_gm1_tenant_branch_staff.sql` (Hoàn thành tại P0.T08) | Phase 1 | `SP` | P1.T01 | `PRESERVED_ACTIVE` |
| **P1.T03** | Thiết kế và review RLS cho gym/branch tables | `[x]` | `docs/supabase-schema.md` (RLS fail-closed hoàn tất tại P0.T08) | Phase 1 | `SP` | P1.T02 | `PRESERVED_ACTIVE` |
| **P1.T04** | Thiết kế staff invite flow & phân quyền/thu hồi nhân viên | `[x]` | `supabase/migrations/20261025160000_gm1_mutation_rpcs.sql` (`rpc_revoke_or_update_staff`, OD-01, OD-02=A) | Phase 1 | `SP` | P1.T03 | `PRESERVED_ACTIVE` |
| **P1.T05** | Thiết kế Admin Web auth & RPC Mutation API (create gym/branch) | `[x]` | `src/modules/gym-management/` (`rpc_create_gym`, `rpc_manage_branch`, `GymManagementService`) | Phase 1 | `GM` | P1.T03 | `PRESERVED_ACTIVE` |
| **P1.T06** | Kiểm thử RBAC & Service: MT-01–05, RBAC-01–12 | `[x]` | `__tests__/gm1-service-test.ts` (9 test suites passed, 35 tests passed) | Phase 1 | `SP` | P1.T04-05 | `PRESERVED_ACTIVE` |
| **P2.T01** | Khởi tạo Admin Web project (Next.js App Router, NPM Monorepo) | `[x]` | `apps/admin-web`, commit `ba947e8` | Phase 2 | `GM` | Phase 1 Hoàn tất | `PRESERVED_ACTIVE` |
| **P2.T02** | Xác thực Admin Web & Khung Dashboard Shell | `[x]` | `/login`, `/dashboard/layout.tsx`, commit `c863492` | Phase 2 | `GM` | P2.T01 | `PRESERVED_ACTIVE` |
| **P2.T03** | Giao diện quản lý branch (Danh sách & Tạo mới) | `[x]` | `/dashboard/branches`, commit `2c147e8` | Phase 2 | `GM` | P2.T02 | `PRESERVED_ACTIVE` |
| **P2.T04** | Giao diện mời và quản lý nhân viên | `[ ]` | Chưa bắt đầu | Phase 2 | `GM` | P2.T03 | `PRESERVED_ACTIVE` |
| **P2.T05** | Integration test: FR-GM-01 đến FR-GM-05 | `[ ]` | Chưa bắt đầu | Phase 2 | `GM` | P2.T04 | `PRESERVED_ACTIVE` |
| **P3.T01** | Schema gym_members / memberships; migration GM-2 | `[x]` | `20261028235500_gym_management_core.sql` & GM-2 Patch | Phase 3 | `SP` | Phase 2 Hoàn tất | `PRESERVED_ACTIVE` |
| **P3.T02** | Admin Web: tạo, tìm kiếm, sửa hồ sơ hội viên | `[x]` | `/dashboard/members`, commit `d68777b` | Phase 3 | `GM` | P3.T01 | `PRESERVED_ACTIVE` |
| **P3.T03** | Luồng liên kết tài khoản Supabase Auth | `[ ]` | Chưa bắt đầu | Phase 3 | `SP & WM`| P3.T02 | `PRESERVED_ACTIVE` |
| **P3.T04** | Mobile app: xem profile và lịch sử của mình | `[ ]` | Chưa bắt đầu | Phase 3 | `WM` | P3.T03 | `PRESERVED_ACTIVE` |
| **P3.T05** | Test matrix FR-MB-01–05 | `[ ]` | Chưa bắt đầu | Phase 3 | `GM & SP`| P3.T04 | `PRESERVED_ACTIVE` |
| **P4.T01** | Schema membership_plans, memberships; migration GM-3 | `[ ]` | Chưa bắt đầu | Phase 4 | `SP` | Phase 3 Hoàn tất | `PRESERVED_ACTIVE` |
| **P4.T02** | Admin Web: danh mục gói, đăng ký, gia hạn, tạm dừng/hủy gói | `[ ]` | Chưa bắt đầu | Phase 4 | `GM` | P4.T01 | `PRESERVED_ACTIVE` |
| **P4.T03** | Schema attendance_logs; migration GM-4 | `[ ]` | Chưa bắt đầu | Phase 4 | `SP` | P4.T01 | `PRESERVED_ACTIVE` |
| **P4.T04** | Admin Web: check-in thủ công với validation đầy đủ | `[ ]` | Bảo toàn 100% phạm vi gốc check-in thủ công (bắt buộc tối thiểu cho Gym MVP) | Phase 4 | `GM` | P4.T03 | `PRESERVED_ACTIVE` |
| **P4.T05** | Test matrix MS-01–05, CI-01–07 | `[ ]` | Chưa bắt đầu | Phase 4 | `GM & SP`| P4.T04 | `PRESERVED_ACTIVE` |
| **P4.T06** | Mobile app: hội viên xem gói tập và lịch check-in của mình | `[ ]` | Chưa bắt đầu; hiển thị thêm QR cá nhân nếu P4.T09 được duyệt | Phase 4 | `WM` | P4.T02, P4.T04 | `PRESERVED_ACTIVE` |
| **P4.T07** | Triển khai Schema Payment Core GM-3b (amount BIGINT VND) | `[ ]` | Đề xuất mới theo FIX-07 & ALIGN-04 | Phase 4 | `SP` | P4.T01, BR-PAY-01/02 | `PROPOSED_ADDITION` |
| **P4.T08** | Ghi nhận Thu phí & Kích hoạt gói 100% qua Payment Core | `[ ]` | Đề xuất mới theo FIX-08 & ALIGN-04 | Phase 4 | `GM` | P4.T07 | `PROPOSED_ADDITION` |
| **P4.T09** | Admin Web: Quét mã QR hội viên tại quầy bằng Camera/Webcam hoặc máy quét 2D | `[ ]` | Đề xuất mới theo FIX-11 (Tùy chọn tự động hóa check-in quầy cho Gym MVP) | Phase 4 | `GM` | P4.T03, P4.T04, P4.T06 | `PROPOSED_ADDITION` |
| **P5.T01** | Chốt đơn vị tiền tệ và idempotency design (risks-decisions.md D-MT-05) | `[ ]` | Bảo toàn 100% mô tả gốc; BR-PAY-01/02 là tiền đề trước Phase 4 GM-3b; P5.T01 kế thừa mở rộng tài chính nâng cao | Phase 5 | `SP` | Phase 4 Hoàn tất | `PRESERVED_ACTIVE` |
| **P5.T02** | Schema payment_transactions; migration GM-5 | `[ ]` | Chưa bắt đầu | Phase 5 | `SP` | P5.T01 | `PRESERVED_ACTIVE` |
| **P5.T03** | Admin Web: ghi nhận và xem lịch sử giao dịch | `[ ]` | Chưa bắt đầu | Phase 5 | `GM` | P5.T02 | `PRESERVED_ACTIVE` |
| **P5.T04** | Admin Web: hoàn tiền với audit trail | `[ ]` | Chưa bắt đầu | Phase 5 | `GM` | P5.T03 | `PRESERVED_ACTIVE` |
| **P5.T05** | Admin Web: báo cáo doanh thu cơ bản | `[ ]` | Chưa bắt đầu | Phase 5 | `GM` | P5.T04 | `PRESERVED_ACTIVE` |
| **P5.T06** | Test matrix PY-01–07 | `[ ]` | Chưa bắt đầu | Phase 5 | `GM & SP`| P5.T05 | `PRESERVED_ACTIVE` |
| **P5.T07** | Production Config & Secrets Management cho Gym MVP | `[ ]` | Đề xuất mới theo FIX-R05 (Gate 1 Readiness) | Phase 5 | `SP & DevOps` | P5.T06 | `PROPOSED_ADDITION` |
| **P5.T08** | CI/CD, Backup/Restore & Forward-Fix / Safe Rollback Procedures | `[ ]` | Đề xuất mới theo FIX-R05 & FIX-F06 | Phase 5 | `SP & DevOps` | P5.T07 | `PROPOSED_ADDITION` |
| **P5.T09** | Logging, Audit Trail & Incident Readiness cho Gym MVP | `[ ]` | Đề xuất mới theo FIX-R05 (Gate 1 Readiness) | Phase 5 | `SP & GM` | P5.T08 | `PROPOSED_ADDITION` |
| **P5.T10** | Mobile Scope Regression Test cho Gym MVP (AC-REL-06) | `[ ]` | Đề xuất mới theo FIX-R07 (chỉ test phần mobile liên quan) | Phase 5 | `WM` | P4.T06 | `PROPOSED_ADDITION` |
| **P6.T01** | Hoàn tất workout modules hiện tại (Phase 3–6 cũ: session, history, sync) | `[ ]` | Tách P6.T01a (Cloud DB Audit) và P6.T01b (Mobile Sync)| Phase 6 | `SP & WM`| Phase 5 Hoàn tất | `PRESERVED_ACTIVE` |
| **P6.T02** | Schema pt_sessions, pt_member_assignments | `[ ]` | Chưa bắt đầu | Phase 6 | `SP` | Phase 5 Hoàn tất | `PRESERVED_ACTIVE` |
| **P6.T03** | Admin Web: lịch PT và phân công trainer | `[ ]` | Chưa bắt đầu | Phase 6 | `GM` | P6.T02 | `PRESERVED_ACTIVE` |
| **P6.T04** | Mobile app: hội viên đặt lịch PT; xem lịch | `[ ]` | Chưa bắt đầu | Phase 6 | `WM` | P6.T02, P6.T03 | `PRESERVED_ACTIVE` |
| **P6.T05** | RLS cho trainer xem workout data của member được giao | `[ ]` | Chưa bắt đầu; tuân thủ Consent Model & Minimization | Phase 6 | `SP & PT` | P6.T01, P6.T02, BR-PT-03 | `PRESERVED_ACTIVE` |
| **P6.T06** | Test matrix FR-WPT-01–04 | `[ ]` | Chưa bắt đầu (Cổng 2: AC-REL-05, AC-REL-07) | Phase 6 | `GM, PT, WM`| P6.T05 | `PRESERVED_ACTIVE` |
| **P7.T01** | Security review: RBAC, RLS cross-tenant, gateway permissions | `[ ]` | Chưa bắt đầu | Phase 7 | `SP` | Phase 6 Hoàn tất | `PRESERVED_ACTIVE` |
| **P7.T02** | Performance testing: member search, dashboard load | `[ ]` | Chưa bắt đầu | Phase 7 | `GM & SP`| P7.T01 | `PRESERVED_ACTIVE` |
| **P7.T03** | E2E testing: luồng owner, staff và member | `[ ]` | Chưa bắt đầu | Phase 7 | `Toàn hệ thống`| P7.T02 | `PRESERVED_ACTIVE` |
| **P7.T04** | iOS/Android runtime verification (bao gồm blocker cũ iOS) | `[ ]` | iOS runtime verification BLOCKED | Phase 7 | `WM` | P7.T03 | `PRESERVED_ACTIVE` |
| **P7.T05** | Deployment setup: CI/CD, staging, migration strategy cho production | `[ ]` | Chưa bắt đầu | Phase 7 | `SP & DevOps` | P7.T04 | `PRESERVED_ACTIVE` |
| **P7.T06** | Sửa lỗi, hồi quy và chuẩn bị release | `[ ]` | Chưa thực hiện | Phase 7 | `Toàn hệ thống`| P7.T05 | `PRESERVED_ACTIVE` |
| **P8.T05** | Sáp nhập Hồ sơ Hội viên Nâng cao (BR-MB-02) | `[ ]` | Đề xuất mới (DEFERRED từ Phase 3 sang Post-MVP) | Phase 8 | `GM & SP` | P3.T02, P4.T01, P5.T02, BR-MB-02 | `PROPOSED_ADDITION` |
| **P8.T06** | Điểm danh bằng phần cứng Dynamic QR Hardware Token | `[ ]` | Đề xuất mới (Phạm vi mở rộng sau MVP) | Phase 8 | `GM & WM` | Phase 7 Hoàn tất | `PROPOSED_ADDITION` |
| **P8.T07** | Tích hợp cổng thanh toán trực tuyến tự động (Webhooks) | `[ ]` | Đề xuất mới (Phạm vi mở rộng sau MVP) | Phase 8 | `GM & SP` | Phase 7 Hoàn tất | `PROPOSED_ADDITION` |

---

### 3.3. Ma trận Traceability Bộ Kiểm thử Chu trình Nghiệp vụ Khép kín (E2E-01 đến E2E-08)

> **Nguyên tắc nghiệm thu nghiêm ngặt:** Tuyệt đối không đánh dấu PASS khi chưa có bằng chứng thực thi (Execution Evidence) trên môi trường kiểm thử tương ứng. Toàn bộ 8 kịch bản E2E hiện giữ trạng thái chờ thực thi (`[ ]`).

| Test ID | Chu trình nghiệp vụ (Business Flow) | Kịch bản kiểm thử (Test Specification) | Tiêu chí nghiệm thu (Expected Result) | Cổng phát hành (Release Gate) | Trạng thái thực thi hiện tại |
|---|---|---|---|:---:|:---:|
| **E2E-01** | Tiếp nhận & Gia nhập (Onboarding & Staff) | 1. Owner tạo phòng gym mới.<br>2. Thêm chi nhánh đầu tiên.<br>3. Mời nhân viên (manager/staff) qua email/link.<br>4. Nhân viên chấp nhận và đăng nhập. | - Gym và chi nhánh tạo thành công với trạng thái `active`.<br>- Nhân viên nhận đúng quyền hạn theo vai trò (RBAC).<br>- Không truy cập được dữ liệu tenant khác (MT-01..05 pass). | **Cổng 1 (Gate 1)** | `[ ] Chưa thực thi` *(Chờ triển khai Phase 1–2)* |
| **E2E-02** | Hội viên & Bán gói tại Quầy (Walk-in & Package) | 1. Tiếp tân tiếp nhận khách vãng lai, tạo hồ sơ hội viên walk-in.<br>2. Chọn gói tập `1 Month Unlimited`.<br>3. Thu tiền mặt/POS đủ 100% tại quầy.<br>4. Ghi nhận giao dịch `GM-3b`. | - Giao dịch thanh toán được ghi nhận `status = 'completed'` kèm `idempotency_key`.<br>- Gói tập chuyển từ `pending_payment` sang `active` theo chính sách `BR-PAY-01`.<br>- Sinh mã QR cá nhân cho hội viên. | **Cổng 1 (Gate 1)** | `[ ] Chưa thực thi` *(Chờ triển khai Phase 3–4)* |
| **E2E-03** | Tự phục vụ Hội viên (Member Self-Service) | 1. Hội viên tải app di động.<br>2. Nhập số điện thoại/email đã đăng ký tại quầy.<br>3. Nhận mã OTP và xác minh quyền sở hữu tài khoản.<br>4. Mở tab Profile và thẻ hội viên. | - Liên kết an toàn tài khoản Supabase Auth với `gym_members` thành công.<br>- Hiển thị đúng thông tin gói tập, ngày hết hạn và mã QR check-in cá nhân.<br>- Ngăn chặn chiếm đoạt tài khoản trái phép. | **Cổng 1 (Gate 1)** | `[ ] Chưa thực thi` *(Chờ triển khai Phase 3–4)* |
| **E2E-04** | Kiểm soát Điểm danh & Ra Vào (Attendance & Check-in Flow — FIX-11) | 1. Tiếp tân tra cứu hội viên theo số điện thoại/họ tên/mã trên Admin Web và nhấn Check-in (`P4.T04`, phương thức bắt buộc tối thiểu Gym MVP).<br>2. (Nếu duyệt `P4.T09`): Tiếp tân dùng webcam/máy quét 2D quét mã QR từ app hội viên (`P4.T06`).<br>3. Động cơ 6 bước xác thực: trạng thái gym, chi nhánh, gói tập, ca tập, nợ phí.<br>4. Ghi nhận lượt điểm danh. | - Phản hồi xác thực hợp lệ < 500ms (hoặc < 300ms với QR).<br>- Ghi nhật ký vào `attendance_logs`, trừ đúng 1 lượt (nếu gói theo lượt).<br>- Chặn quét/nhập trùng trong 15 phút (Anti-passback).<br>- Chặn chính xác các ca sai chi nhánh, hết hạn hoặc nợ phí (AC-REL-04). | **Cổng 1 (Gate 1)** | `[ ] Chưa thực thi` *(Chờ triển khai Phase 4)* |
| **E2E-05** | Dịch vụ Huấn luyện Viên (Personal Training) | 1. Hội viên đăng ký gói PT kèm buổi tập.<br>2. Quản lý phân công Trainer phụ trách.<br>3. Hội viên nhận yêu cầu và cấp quyền chia sẻ dữ liệu (Explicit Consent).<br>4. PT đặt lịch hẹn và xác nhận hoàn thành buổi tập. | - Trainer chỉ xem được lịch sử bài tập khi có Consent (`BR-PT-03`).<br>- Không rò rỉ dữ liệu y tế nhạy cảm (Minimization).<br>- Xác nhận hoàn thành 2 chiều trừ chính xác 1 buổi trong `pt_sessions_remaining`. | **Cổng 2 (Gate 2)** | `[ ] Chưa thực thi` *(Chờ triển khai Phase 6)* |
| **E2E-06** | Tài chính & Đối soát Cuối Ngày (Cash Shift & Audit) | 1. Ghi nhận các giao dịch thu tiền mặt và chuyển khoản trong ngày.<br>2. Thực hiện 1 giao dịch hoàn tiền (refund) có lý do.<br>3. Kết ca làm việc của nhân viên quầy.<br>4. In báo cáo đối soát tiền mặt chi nhánh. | - Giao dịch hoàn phí có audit trail đầy đủ, độc lập với việc hủy gói tập.<br>- Báo cáo doanh thu khớp 100% với số lượng gói tập đã bán.<br>- Phát hiện và cảnh báo sai lệch tiền mặt quầy thu ngân. | **Cổng 1 (Gate 1)** | `[ ] Chưa thực thi` *(Chờ triển khai Phase 5)* |
| **E2E-07** | Kiểm soát Rủi ro & Cách ly (Security & Deactivation) | 1. Tiếp tân nhập trùng số điện thoại hội viên cũ.<br>2. Hệ thống đặt cờ cảnh báo rà soát (Review Flag).<br>3. Vô hiệu hóa một tài khoản nhân viên nghi ngờ vi phạm.<br>4. Thử truy cập API từ tài khoản bị khóa. | - Không tự ý xóa hoặc ghi đè hồ sơ cũ; bảo toàn 100% lịch sử tài chính.<br>- Nhân viên bị `archived`/`suspended` bị chặn token ngay lập tức tại request tiếp theo.<br>- Kiểm tra RLS 100% không rò rỉ dữ liệu giữa 2 tenant. | **Cổng 1 (Gate 1)** | `[ ] Chưa thực thi` *(Chờ triển khai Phase 1–5)* |
| **E2E-08** | Tập luyện Độc lập (Standalone Workout Privacy) | 1. Người dùng cá nhân sử dụng app không đăng nhập gym.<br>2. Ghi nhận buổi tập, lịch sử hiệp/tạ/reps offline trên SQLite.<br>3. Người dùng sau đó đăng nhập và liên kết với một phòng gym. | - Luồng tập offline hoạt động 100% không cần mạng, không lỗi crash.<br>- Dữ liệu tập cá nhân cũ được giữ an toàn trên local, không tự ý gán quyền sở hữu cho gym khi chưa có sự đồng ý tường minh của người dùng. | **Cổng 3 (Gate 3)** | `[ ] Chưa thực thi` *(Chờ triển khai Phase 2–7)* |

---

## 4. BẢNG 8 TÀI LIỆU CHUẨN CỐT LÕI (CORE DOCUMENTATION SET)

| Tài liệu | Vai trò Single Source of Truth |
|---|---|
| `docs/rule.md` | Quy tắc thép làm việc, kỷ luật Git branch workflow, chống phân mảnh file tài liệu |
| `docs/mindmap.md` | Lộ trình Unified Roadmap 9 Phase (Phase 0–8), ma trận đối chiếu 96 task & nhật ký task |
| `docs/baocao.md` | Tầm nhìn sản phẩm (Product Vision), 8 quy trình E2E, kiến trúc hệ thống đa nền tảng |
| `docs/risks-decisions.md` | Danh mục quyết định kiến trúc (Decision Register OD-01..06, D-MT) & sổ bộ rủi ro |
| `docs/supabase-schema.md` | Toàn bộ schema PostgreSQL, migrations, DDL GM-1..5, RLS & RBAC Multi-tenancy |
| `docs/data-offline.md` | Kiến trúc Offline-First, hợp đồng đồng bộ dữ liệu & thực tế triển khai SQLite v1 |
| `docs/design-system.md` | Hệ thống thiết kế UI, Color Palette Dark/Light, Theme Provider & cấu trúc Điều hướng |
| `docs/testing-acceptance.md` | Chiến lược kiểm thử tự động, danh mục 8 test suites `__tests__/` & tiêu chí nghiệm thu AC |

---

## 5. NHẬT KÝ CẬP NHẬT TÀI LIỆU & WORK LOG

### 2026-10-23 — Hợp nhất Unified Roadmap v1.2 (Release Gate Consistency Patch)

- **Mục tiêu:** Áp dụng Unified Roadmap Draft v1.2 đã hoàn thiện Release Gate Consistency Patch vào `docs/mindmap.md`.
- **Nội dung:**
  1. Hợp nhất toàn bộ lộ trình phát triển thành 4 tracks song song (`SP`, `GM`, `PT`, `WM`) và 9 phase chuẩn hóa (Phase 0–8).
  2. Bảo toàn 100% 96 Task ID gốc và trạng thái xác minh lịch sử (24 `[x]`, 72 `[ ]`); 0 Missing, 0 Duplicate, 0 Changed Status.
  3. Ghi nhận riêng biệt 10 Proposed Additions (`PROPOSED_ADDITION`).
  4. Áp dụng 3 Release Gates độc lập theo FIX-10: Cổng 1 Gym MVP (E2E-01, 02, 03, 04, 06, 07), Cổng 2 PT (E2E-05, AC-REL-05/07), Cổng 3 Full Platform (E2E-08, toàn diện E2E-01..08, AC-01..12, AC-REL-01..07).
  5. Phân định rõ 3 cấp độ điểm danh theo FIX-11: Check-in thủ công tại quầy P4.T04 (Bắt buộc tối thiểu Gym MVP); Quét mã QR tại quầy P4.T09 (Đề xuất tùy chọn Gym MVP); Cổng phần cứng Dynamic QR P8.T06 (Hậu MVP Phase 8).
  6. Tách bạch implementation notes và acceptance criteria cho Mobile Auth Phase 3.T02 theo FIX-12 (AC-AUTH-01..06); không áp đặt chính sách mật khẩu cứng; giữ Phase 3.T02 trạng thái `[ ]`.
  7. Giữ nguyên mô tả gốc của P4.T06 theo mindmap gốc ("lịch check-in"), bổ sung ghi chú phạm vi hiển thị mã QR cá nhân.
  8. Giải phóng dependency Cloud Sync không cần thiết cho unit tests Mobile (Phase 7.T01 chỉ phụ thuộc Mobile Core).
- **Cam kết tuân thủ:** Không sửa source code, SQL migrations, packages hoặc Supabase Cloud; không tự ý đánh dấu hoàn thành P0.T07 và P0.T08; không mở Phase 1.

### 2026-10-23 — Chuẩn bị phê duyệt P0.T07 và hoàn thiện thiết kế GM-1 cho P0.T08

- **Mục tiêu:** Cập nhật trạng thái chuẩn bị phê duyệt P0.T07 (D-MT-01 đến D-MT-04, D-MT-11) và hoàn thiện thiết kế GM-1 cho P0.T08 theo chỉ đạo của chủ dự án.
- **Nội dung:** Cập nhật chi tiết nhiệm vụ P0.T07 và P0.T08 phản ánh việc toàn bộ hồ sơ thiết kế kỹ thuật, DDL schema GM-1, RLS helper functions, partial unique indexes và security privilege model đã hoàn tất. Giữ nguyên trạng thái `[ ]` (PROPOSED — chưa đánh dấu hoàn thành) để chờ chủ dự án ký duyệt chính thức.
- **Cam kết tuân thủ:** Không sửa source code, SQL migrations, packages hoặc Supabase Cloud; không tự ý đánh dấu hoàn thành P0.T07 và P0.T08.

### 2026-10-23 — Final GM-1 Schema Security Review (P0.T08 Preparation)

- **Mục tiêu:** Rà soát và giải quyết triệt để các vấn đề bảo mật, tính toàn vẹn dữ liệu và kịch bản rollback trước khi phê duyệt P0.T08.
- **Nội dung:** Cập nhật chi tiết nhiệm vụ P0.T08 phản ánh việc bổ sung Composite Foreign Key `(branch_id, gym_id)`, kiểm tra trạng thái gym active trong `is_active_staff`, và quy định thứ tự migration 5 bước cùng kịch bản rollback nghịch đảo. Giữ nguyên trạng thái `[ ]` (PROPOSED — chưa đánh dấu hoàn thành) chờ chủ dự án ký duyệt chính thức.
- **Cam kết tuân thủ:** Không sửa source code, SQL migrations, packages hoặc Supabase Cloud; không tự ý đánh dấu hoàn thành P0.T08.

### 2026-10-23 — Final Security Corrections Before Approval

- **Mục tiêu:** Cập nhật các hiệu chỉnh an toàn dữ liệu và bảo mật cuối cùng cho nhiệm vụ P0.T08.
- **Nội dung:** Ghi nhận composite FK `(branch_id, gym_id)` sử dụng `ON DELETE RESTRICT` để bảo vệ audit trail và soft-deactivation `is_active = FALSE`; kế hoạch migration fail-closed trong Atomic Transactions `BEGIN...COMMIT`; cơ chế Owner khi gym suspended chỉ đọc trạng thái và gọi RPC thanh toán gia hạn; hiệu chỉnh STABLE query planner optimization. Tiếp tục giữ nguyên `[ ]` cho P0.T07 và P0.T08 chờ phê duyệt chính thức.
- **Cam kết tuân thủ:** Không sửa source code, SQL migrations, packages hoặc Supabase Cloud; không tự ý đánh dấu hoàn thành P0.T07 hay P0.T08. Không bắt đầu Phase 1.

### 2026-10-23 — Final Pre-Approval Verification

- **Mục tiêu:** Cập nhật chuẩn hóa schema branches đa trạng thái trước khi phê duyệt Phase 0.
- **Nội dung:** Đồng bộ hóa định nghĩa `branches.status TEXT CHECK (status IN ('active', 'suspended', 'archived'))` và soft-deactivation `status = 'archived'`. Tiếp tục giữ nguyên `[ ]` cho P0.T07 và P0.T08 chờ chủ dự án ký duyệt chính thức.
- **Cam kết tuân thủ:** Không sửa source code, SQL migrations, packages hoặc Supabase Cloud; không tự ý đánh dấu hoàn thành P0.T07 và P0.T08. Không bắt đầu Phase 1.

### 2026-10-23 — Phase 0 Final Documentation Fix

- **Mục tiêu:** Khôi phục đoạn ghép sai văn bản tại Phase 3.T12 và Phase 3.T13 theo kết quả Documentation Audit (AUD-01).
- **Nội dung:** Tách bạch mô tả task T12 và khôi phục đầy đủ nội dung kiểm thử core migration của task T13; loại bỏ dòng tham chiếu trùng lặp. Tiếp tục duy trì trạng thái `[ ]` cho P0.T07 và P0.T08 chờ phê duyệt chính thức.
- **Cam kết tuân thủ:** Không sửa source code, SQL migrations, packages hoặc Supabase Cloud; không tự ý đánh dấu hoàn thành P0.T07 và P0.T08. Không bắt đầu Phase 1.

### 2026-10-25 — Tái cấu trúc Quy trình, Khóa 8 File Cốt lõi & Làm sạch Git (docs/reorganize-workflow-and-rules)

- **Mục tiêu:** Chấm dứt triệt để tình trạng phân mảnh tài liệu (25 files -> 8 files), xóa các nhánh backup/integration thừa, thiết lập Bộ Quy tắc Thép cho AI Agent và quy trình Git Feature Branch Workflow chuẩn.
- **Files đã sửa đổi & xóa:**
  - **Giữ lại và cập nhật 8 file cốt lõi:** `docs/rule.md`, `docs/mindmap.md`, `docs/baocao.md`, `docs/risks-decisions.md`, `docs/supabase-schema.md` (gộp RBAC & Permission Matrix), `docs/data-offline.md` (gộp trạng thái SQLite v1 code), `docs/design-system.md` (gộp Color Palette Dark/Light HEX, Theme Provider & Navigation), `docs/testing-acceptance.md` (gộp 8 test suites `__tests__/`).
  - **Xóa 17 file phân mảnh (`git rm`):** `admin-web.md`, `architecture.md`, `attendance.md`, `auth.md`, `color-palette.md`, `gym-management.md`, `member-management.md`, `membership.md`, `multi-tenancy.md`, `navigation.md`, `payments.md`, `requirements.md`, `screens-ux.md`, `storage.md`, `tech-stack.md`, `testing.md`, `theme.md`.
  - **Cập nhật quy tắc gốc:** `AGENTS.md` (cố định 8 file cốt lõi, bãi bỏ quy tắc tạo file module, áp dụng quy tắc 1 task và Git feature branch).
- **Logic chính đã triển khai:**
  1. Xóa 2 nhánh cũ `backup/phase0-checkpoint-335c363` và `integration/phase0-docs`. Tạo và checkout sang nhánh `docs/reorganize-workflow-and-rules`.
  2. Bãi bỏ quy tắc tạo file `[tenmodule].md`. Cấm tạo file `.bak`, `.tmp`, `-copy`.
  3. Thiết lập quy tắc Focus Roadmap: Mỗi phiên chỉ thực hiện 1 task `[ ]` duy nhất và tự động cập nhật Work Log.
  4. Áp dụng Strict Git Feature Branch Workflow: Cấm commit/làm việc trực tiếp trên `main`, đặt tên nhánh `feat/...`, `fix/...`, `docs/...`, cấm tạo nhánh `backup/...`.
- **Kết quả kiểm tra:** Thư mục `docs/` còn đúng 8 file SSOT; `git status` xác nhận trạng thái staged rõ ràng; chưa commit theo yêu cầu của Owner.

### 2026-10-25 — Đồng bộ hóa Workflow Chuyển đổi & Đóng Hoàn toàn Phase 0 (Gate P0.T08)

- **Mục tiêu:** Đồng bộ hóa toàn bộ quy trình chuyển đổi dự án sang **Gym Management Platform**, chốt chính thức các quyết định kiến trúc của Chủ sở hữu (`OD-01` đến `OD-06`), sửa DDL chuẩn hóa và tạo file migration thực tế GM-1 (`P0.T08`), đóng toàn diện **Phase 0**.
- **Files đã sửa đổi & tạo mới:**
  - `docs/risks-decisions.md`: Ghi nhận chính thức 3 quyết định mới của Owner (OD-04 Mutation/Audit Boundary qua RPC SECURITY DEFINER, OD-05 Payment BIGINT VND & Manual Counter Confirmation, OD-06 Attendance Check-in window 60 phút); chuyển D-MT-05 và D-MT-06 sang bảng Approved; rà soát trỏ toàn bộ link hỏng về 8 file cốt lõi.
  - `docs/baocao.md`: Đồng bộ trạng thái P0.T07 và P0.T08 thành COMPLETED/APPROVED WITH CONDITIONS; làm rõ lộ trình Step-by-step Evolution từ mobile workout hiện có lên Gym Management Platform (Mobile Core SQLite v1 + Auth thật + Workouts/Exercises screens thay vì RoutePlaceholder, mở đường cho Dual-Mode và PT assignments; Monorepo `npm workspaces` triển khai tại Pre-Phase 2 trước P2.T01).
  - `docs/supabase-schema.md`: Chuẩn hóa mô hình bảng đơn `gym_staff` (loại bỏ `staff_actors`/`gym_staff_scopes`), đổi khóa ngoại `owner_id` và `user_id` sang `ON DELETE RESTRICT` (Zero Hard Delete OD-02=A), constraint status thêm `'revoked'`, bổ sung cột `revoked_at` và `revoked_by`, cập nhật 2 Partial Unique Indexes `WHERE status = 'active'`, cập nhật helper function `is_active_staff` hỗ trợ `allowed_roles TEXT[]`.
  - `supabase/migrations/20261025150000_gm1_tenant_branch_staff.sql`: Tạo file migration SQL thứ 5 cho nhóm GM-1 (3 bảng `gyms`, `branches`, `gym_staff` kèm composite FK và partial unique indexes, 2 helper functions `is_gym_owner` và `is_active_staff`, RLS fail-closed và SELECT policies).
  - `docs/mindmap.md`: Đánh dấu `[x]` cho `P0.T07` và `P0.T08`, nâng số task hoàn thành lên 26/96 tasks, cập nhật Phase 0 thành `[COMPLETED]`, chuẩn hóa toàn bộ tham chiếu nội bộ trỏ về đúng 8 file cốt lõi.
- **Logic chính đã triển khai:**
  1. Chuẩn hóa quyết định kiến trúc: OD-01 (Staff invite Edge Function), OD-02 (Mutual Exclusivity & Zero Hard Delete), OD-03 (Monorepo tại Pre-Phase 2), OD-04 (RPC mutation boundary & metadata audit), OD-05 (Manual payment confirmation VND BIGINT), OD-06 (60-phút anti-duplicate check-in).
  2. Triển khai file migration GM-1 dạng additive, không đụng chạm 7 bảng core, an toàn tuyệt đối, tuân thủ fail-closed từ microsecond đầu tiên.
  3. Định hình lộ trình nâng cấp step-by-step bảo toàn tối đa giá trị mã nguồn mobile hiện hữu.
- **Kết quả kiểm tra:** Kiểm tra chất lượng code `npm test`, `npx tsc --noEmit` và `npm run lint` toàn bộ PASSED. Phase 0 chính thức đóng; sẵn sàng cho các nhiệm vụ tiếp theo.

### 2026-10-26 — Thực thi Phase 1 Core (GM-1 RPCs, gym-management module, RBAC tests) (feat/p1-gm1-rpc-and-types)

- **Mục tiêu:** Bác bỏ việc viết tài liệu trùng lặp; chuyển đổi thẳng sang viết code thực thi cho Phase 1 Core gồm 3 hàm PostgreSQL RPC (`OD-04`, `OD-02=A`), TypeScript models & service repository tại `src/modules/gym-management/`, và bộ unit test RBAC thứ 9 tại `__tests__/gm1-service-test.ts`. Đóng hoàn toàn Phase 1 (32/96 tasks).
- **Files đã tạo mới & cập nhật:**
  - `supabase/migrations/20261025160000_gm1_mutation_rpcs.sql`: Tạo 3 hàm RPC `SECURITY DEFINER` với `SET search_path = public, pg_temp`, cấp quyền `EXECUTE` cho `authenticated`:
    1. `rpc_create_gym(gym_name, gym_slug, branch_name, branch_slug)`: Tạo gym, tự động khởi tạo branch mặc định và gán caller quyền owner toàn gym trong 1 transaction an toàn.
    2. `rpc_manage_branch(gym_id, branch_name, branch_slug, branch_status, target_branch_id)`: Tạo mới hoặc cập nhật chi nhánh (chỉ cho phép owner, hỗ trợ soft-deactivation `'archived'`).
    3. `rpc_revoke_or_update_staff(p_gym_id, p_user_id, p_action, p_role, p_branch_id)`: Dùng `pg_advisory_xact_lock`, bảo vệ owner không bị hạ quyền, kiểm tra Mutual Exclusivity (`OD-02=A`), hỗ trợ soft-revoke (`status = 'revoked'`, `revoked_at`, `revoked_by`), suspend, activate, assign.
  - `src/modules/gym-management/types/gm1-types.ts`: Định nghĩa TypeScript interfaces/types cho `Gym`, `Branch`, `GymStaff`, `GymStatus`, `BranchStatus`, `StaffRole`, `StaffStatus` và các RPC payloads/results.
  - `src/modules/gym-management/services/gm1-service.ts`: Lớp `GymManagementService` bọc type-safe các RPC calls và các hàm đọc fail-closed (`getGyms`, `getGymById`, `getBranchesByGym`, `getStaffByGym`).
  - `src/modules/gym-management/index.ts`: Barrel export cho module gym-management.
  - `__tests__/gm1-service-test.ts`: Bộ test suite thứ 9 với 8 unit test bao phủ toàn bộ luồng tạo gym, quản lý branch, phân quyền/thu hồi nhân viên theo `OD-02=A`, kiểm tra lỗi phân quyền RBAC và select queries.
  - `docs/supabase-schema.md`: Bổ sung chữ ký 3 hàm RPC GM-1 và cập nhật bảng lộ trình & nhật ký.
  - `docs/mindmap.md`: Đánh dấu `[x]` cho toàn bộ Phase 1 (`P1.T01` đến `P1.T06`), nâng tiến độ lên 32/96 tasks, cập nhật bảng Audit Matrix.
- **Kết quả kiểm tra:**
  - `npx tsc --noEmit`: 0 errors.
  - `npm test`: 9 test suites passed, 35 tests passed.
  - `npm run lint`: 0 errors / 0 warnings.

### 2026-10-27 — Tích hợp Mobile Runtime SQLite v1 vào Root Layout (feat/mobile-sqlite-runtime-integration)

- **Mục tiêu:** Đưa tầng lưu trữ SQLite v1 (`src/shared/storage/`) vào hoạt động thực tế trên ứng dụng di động theo đúng quy chuẩn runtime của Expo SDK 57, giải quyết triệt để vấn đề "thiếu call site khởi tạo runtime" đã ghi nhận trong rủi ro kỹ thuật.
- **Files đã tạo mới & cập nhật:**
  - `src/shared/storage/database.ts`: Thêm `WebPlatformStorageError` và `openAppDatabase()` hỗ trợ mở `gym-workout.db` bất đồng bộ trên native (`openDatabaseAsync`) và ném lỗi an toàn trên web.
  - `src/shared/storage/storage-provider.tsx`: Tạo React Context `StorageProvider`, `useStorage()` và `useDatabase()`, tự động gọi `initializeDatabase()`, khởi tạo 3 repositories (`ExerciseRepository`, `WorkoutPlanRepository`, `WorkoutSessionRepository`), quản lý trạng thái `isReady`, `error`, và cơ chế `retry`.
  - `src/shared/storage/index.ts`: Export `openAppDatabase`, `WebPlatformStorageError`, `StorageProvider`, `useStorage`, `useDatabase`.
  - `src/app/_layout.tsx`: Tích hợp `<StorageProvider>` vào Root Layout, trì hoãn render router stack cho tới khi SQLite database và Theme context sẵn sàng (giữ Splash Screen), tự động ẩn Splash Screen và hiển thị `FeedbackState` fallback kèm nút "Thử lại" khi xảy ra lỗi.
  - `__tests__/root-layout-storage-test.tsx`: Bộ test suite thứ 10 với 7 test cases bao phủ vòng đời khởi tạo của `StorageProvider`, xử lý lỗi & retry, kiểm tra an toàn nền tảng web, và tích hợp RootLayout.
  - `docs/data-offline.md`: Cập nhật ghi chú call site runtime SQLite v1.
  - `docs/mindmap.md`: Cập nhật Work Log chi tiết.
- **Kết quả kiểm tra:**
  - `npx tsc --noEmit`: 0 errors.
  - `npm test`: 10 test suites passed, 42 tests passed.
  - `npm run lint`: 0 errors / 0 warnings.

### 2026-10-27 — Nâng cấp toàn diện Expo SDK 57 lên Expo SDK 58 (feat/upgrade-expo-sdk-58)

- **Mục tiêu:** Nâng cấp toàn bộ dự án từ Expo SDK 57 (`~57.0.30`) lên Expo SDK 58 (`~58.0.0`), React Native 0.88.0, React 19.3.0, đồng bộ toàn bộ hệ sinh thái expo modules, `jest-expo@58`, giải quyết tương thích Jest preset và cập nhật API chính thức `expo-router/native-tabs`.
- **Files đã tạo mới & cập nhật:**
  - `package.json`: Nâng cấp `expo@~58.0.0`, `react@19.3.0`, `react-dom@19.3.0`, `react-native@0.88.0`, toàn bộ các package Expo lên `~58.0.x`, `jest@~30.5.2`, `jest-expo@~58.0.12`, bổ sung devDependency `@react-native/jest-preset@^0.88.1`.
  - `package-lock.json`: Đồng bộ toàn diện cây phụ thuộc tương thích chuẩn Expo SDK 58.
  - `src/shared/design-system/components/bottom-navigation.tsx`: Chuyển import từ `expo-router/unstable-native-tabs` sang API ổn định `expo-router/native-tabs`.
  - `docs/rule.md`: Cập nhật Quy chuẩn Kỹ thuật mục 6 đồng bộ Expo SDK 58 và React Native 0.88.0.
  - `docs/mindmap.md`: Ghi nhận nhật ký nâng cấp SDK vào Work Log.
- **Logic chính đã triển khai:**
  1. Sử dụng công cụ chính thức của Expo để phân giải và cài đặt chính xác các phiên bản tương thích với SDK 58, cấu hình `package.json` chuẩn mực.
  2. Cài đặt bổ sung `@react-native/jest-preset` đáp ứng sự tách gói của `jest-expo@58` trong SDK 58.
  3. Loại bỏ import deprecated `expo-router/unstable-native-tabs` sang `expo-router/native-tabs`.
  4. Đảm bảo cấu trúc fail-closed và toàn bộ 10 test suites chạy mượt mà, đạt hiệu năng kiểm thử vượt trội (từ ~69s xuống ~12s).
- **Kết quả kiểm tra:**
  - `npx expo-doctor`: 20/20 checks passed (0 issues).
  - `npx tsc --noEmit`: 0 errors.
  - `npm test`: 10 test suites passed, 42 tests passed (100% pass).
  - `npm run lint`: 0 errors / 0 warnings.

### 2026-10-28 — Khởi tạo Module Thư viện Bài tập Offline-First (feat/mobile-exercises-module, Phase 3.T04)

- **Mục tiêu:** Xây dựng module quản lý và tra cứu thư viện bài tập (`src/modules/exercises/`) 100% ngoại tuyến trên nền tảng SQLite v1, thay thế hoàn toàn `RoutePlaceholder` tại màn hình `src/app/(tabs)/exercises.tsx`.
- **Files đã tạo mới & cập nhật:**
  - `src/modules/exercises/constants/muscle-groups.ts`: Định nghĩa danh mục nhóm cơ (`MUSCLE_GROUPS`), thiết bị (`EQUIPMENT_OPTIONS`) và dữ liệu chuẩn khởi tạo (`INITIAL_SEED_EXERCISES`).
  - `src/modules/exercises/components/exercise-card.tsx`: Card hiển thị bài tập sử dụng token thiết kế, phân loại nhóm cơ, thiết bị, độ khó và badge "Tùy chỉnh".
  - `src/modules/exercises/components/exercise-form.tsx`: Modal form tạo bài tập mới với validation tên bài tập, lựa chọn nhóm cơ, thiết bị và hướng dẫn.
  - `src/modules/exercises/hooks/useExercises.ts`: Hook quản lý state bài tập từ SQLite qua `useStorage()`, tự động seed dữ liệu chuẩn khi SQLite rỗng trong 1 transaction, tìm kiếm tên/thiết bị/hướng dẫn, lọc theo nhóm cơ.
  - `src/modules/exercises/index.ts`: Export toàn bộ public API của module exercises.
  - `src/app/(tabs)/exercises.tsx`: Thay thế `RoutePlaceholder` bằng giao diện đầy đủ: Header + Action thêm, thanh Search, thanh Filter chips nhóm cơ, danh sách FlatList ExerciseCard và FeedbackState (loading/empty/error).
  - `__tests__/exercises-screen-test.tsx`: Test suite thứ 11 với 5 test cases bao phủ hiển thị, tìm kiếm từ khóa, lọc nhóm cơ, reset bộ lọc khi rỗng, và modal tạo bài tập tùy chỉnh.
  - `docs/mindmap.md`: Đánh dấu `[x]` hoàn thành Phase 3.T04, cập nhật bảng Audit Matrix và Work Log.
- **Kết quả kiểm tra Quality Gates:**
  - `npx tsc --noEmit`: 0 errors.
  - `npm run lint`: 0 errors / 0 warnings.
  - `npm test`: 11/11 test suites passed (100%), 47/47 tests passed (100%).

### 2026-10-28 — Xây dựng Module Kế hoạch Tập luyện Offline-First (feat/mobile-workouts-module, Phase 3.T05)

- **Mục tiêu:** Hợp nhất thành công module Exercises vào `main`, khởi tạo module Workouts (`src/modules/workouts/`) 100% ngoại tuyến trên nền tảng SQLite v1, thay thế hoàn toàn `RoutePlaceholder` tại màn hình `src/app/(tabs)/workouts.tsx`.
- **Files đã tạo mới & cập nhật:**
  - `src/modules/workouts/constants/sample-plans.ts`: Định nghĩa 2 giáo án mẫu offline ("Full Body Cơ Bản", "Upper Body Sức Mạnh") kèm bài tập liên kết.
  - `src/modules/workouts/components/workout-plan-card.tsx`: Card hiển thị giáo án, badge "Từ PT", số bài tập và nút "Bắt đầu tập".
  - `src/modules/workouts/components/workout-session-card.tsx`: Card hiển thị lịch sử buổi tập đã hoàn thành (thời lượng, volume tạ, số hiệp, thời gian kết thúc).
  - `src/modules/workouts/components/workout-plan-form.tsx`: Modal tạo giáo án cá nhân mới với kiểm tra hợp lệ tên bắt buộc.
  - `src/modules/workouts/hooks/useWorkouts.ts`: Hook quản lý state kế hoạch và buổi tập từ SQLite qua `useStorage()`, tự động seed 2 giáo án mẫu kèm bài tập nếu rỗng, lấy 5 buổi tập hoàn thành gần nhất.
  - `src/modules/workouts/index.ts`: Export toàn bộ public API của module workouts.
  - `src/app/(tabs)/workouts.tsx`: Thay thế `RoutePlaceholder` bằng giao diện 2 khu vực ("Giáo án của tôi" có nút thêm mới và "Lịch sử tập luyện gần đây").
  - `__tests__/workouts-screen-test.tsx`: Test suite thứ 12 với 4 test cases bao phủ hiển thị, auto-seed 2 giáo án mẫu, kích hoạt buổi tập, danh sách lịch sử & trạng thái rỗng, validation form và tạo giáo án mới.
  - `docs/mindmap.md`: Đánh dấu `[x]` hoàn thành Phase 3.T05, cập nhật bảng Audit Matrix và Work Log.
- **Kết quả kiểm tra Quality Gates:**
  - `npx tsc --noEmit`: 0 errors.
  - `npm run lint`: 0 errors / 0 warnings.
  - `npm test`: 12/12 test suites passed (100%), 51/51 tests passed (100%).

### 2026-10-28 — Xây dựng Module Tiến trình Tập luyện (Progress) Offline-First (feat/mobile-progress-module, Phase 3.T06 Mobile Core / Phase 5.T01-02)

- **Mục tiêu:** Hợp nhất thành công module Workouts vào `main`, khởi tạo module Progress (`src/modules/progress/`) 100% ngoại tuyến trên nền tảng SQLite v1, thay thế hoàn toàn `RoutePlaceholder` tại màn hình `src/app/(tabs)/progress.tsx`.
- **Files đã tạo mới & cập nhật:**
  - `src/shared/storage/repositories/workout-sessions.ts`: Bổ sung phương thức `getSessionsSummary()` tính toán 3 chỉ số thống kê tổng hợp (tổng số buổi tập, tổng thời lượng phút, tổng khối lượng tạ kg) và `listCompletedRecent()` lấy các buổi tập hoàn thành.
  - `src/shared/storage/index.ts`: Re-export `WorkoutSessionsSummary`.
  - `src/modules/progress/components/stat-card.tsx`: Card hiển thị con số thống kê chuyên biệt gồm Icon, Tiêu đề phụ, Con số cỡ lớn (variant display) và Đơn vị tính (`Card` và `AppText`).
  - `src/modules/progress/hooks/useProgress.ts`: Hook quản lý truy vấn từ SQLite qua `useStorage()`, tính toán 3 chỉ số thống kê (`totalWorkouts`, `totalDurationMinutes`, `totalVolumeKg`) và metadata chi tiết cho 3-5 buổi tập gần nhất.
  - `src/modules/progress/index.ts`: Export toàn bộ public API của module progress.
  - `src/app/(tabs)/progress.tsx`: Thay thế hoàn toàn `RoutePlaceholder` bằng giao diện chính: Header, Grid 3 thẻ `StatCard` (Tổng buổi tập, Thời gian tập, Tổng khối lượng) và FlatList "Hoạt động gần đây" tái sử dụng `WorkoutSessionCard` từ module workouts; hiển thị `FeedbackState` khi tải/lỗi/rỗng.
  - `package.json`: Cấu hình `maxWorkers: 2` cho Jest giúp tối ưu hóa kiểm thử đa luồng ổn định trên Windows.
  - `__tests__/progress-screen-test.tsx`: Test suite thứ 13 với 3 test cases bao phủ hiển thị trạng thái rỗng `FeedbackState`, tính toán chính xác 3 chỉ số thống kê từ mock data SQLite, và kiểm thử hiển thị `StatCard`.
  - `docs/mindmap.md`: Đánh dấu `[x]` hoàn thành Phase 3.T06 Mobile Core / Phase 5.T01-02, cập nhật Audit Matrix và Work Log.
- **Kết quả kiểm tra Quality Gates:**
  - `npx tsc --noEmit`: 0 errors.
  - `npm run lint`: 0 errors / 0 warnings.
  - `npm test`: 13/13 test suites passed (100%), 54/54 tests passed (100%).

### 2026-10-31 — Kiểm toán Baseline (P00-T01) và Chuẩn hóa Quản trị & Schema Drift Sync (P00-T02)

- **Mục tiêu:** Thực hiện kiểm toán toàn diện hệ thống (P00-T01), thiết lập mô hình quản trị phối hợp Advisor Agent ↔ Coding Agent, chuẩn hóa Vòng đời Task, cập nhật trạng thái các module Admin Web đã nghiệm thu (Auth, Dashboard Shell, Branches, Members), và tạo migration vá lỗi schema drift/bảo mật RLS (P00-T02).
- **Files đã tạo mới & cập nhật:**
  - `docs/rule.md`: Tích hợp quy trình phối hợp Advisor Agent ↔ Coding Agent, chuẩn hóa Vòng đời Task (`TODO → IN_PROGRESS → IN_REVIEW → DONE`), siết chặt quy tắc Git theo Phase và áp dụng mẫu chuẩn `Task Execution Report`.
  - `docs/mindmap.md`: Cập nhật trạng thái hoàn thành `[x]` cho P2.T01, P2.T02, P2.T03, P3.T01, P3.T02; đồng bộ bảng Audit Matrix và bổ sung Work Log 31/10/2026.
  - `docs/supabase-schema.md`: Cập nhật định nghĩa cột `phone`, `address` bảng `users`, đồng bộ lộ trình migration GM-2 Patch.
  - `supabase/migrations/20261031000000_gm2_admin_member_policies_and_user_fields.sql`: Tạo file migration thứ 8:
    1. Bổ sung cột `phone TEXT` và `address TEXT` cho bảng `public.users`.
    2. Cấp quyền & thiết lập RLS INSERT/UPDATE cho bảng `public.memberships` (`is_gym_owner` hoặc `is_active_staff`).
    3. Cấp quyền & thiết lập RLS INSERT/UPDATE cho bảng `public.membership_plans` (`is_gym_owner` hoặc `is_active_staff`).
    4. Thay thế `users_update_policy` trên `public.users` đảm bảo an toàn tuyệt đối: chỉ cho phép user sửa hồ sơ của chính mình hoặc Owner/Active Staff của Gym có thẩm quyền (loại bỏ hoàn toàn nguy cơ `USING (true)`).
- **Logic chính đã triển khai:**
  1. Xác lập cơ chế phân quyền RBAC và kiểm soát cập nhật đa bảng trên Supabase Cloud thông qua RLS policies và migration idempotent.
  2. Khóa chặt 8 file tài liệu SSOT, ngăn chặn phân mảnh tài liệu và thiết lập giao thức bàn giao kỹ thuật chuẩn mực giữa các tầng tác tử AI.
  3. Ghi nhận đầy đủ hiện trạng thực tế mã nguồn Monorepo (`apps/admin-web`, `apps/mobile`) tới commit `d68777b`.
- **Kết quả kiểm tra Quality Gates:**
  - `npx tsc --noEmit`: 0 errors.
  - `npm run lint`: 0 errors / 0 warnings.
  - `npm test`: 13/13 test suites passed (100%), 54/54 tests passed (100%).

### 2026-10-31 — Kiểm tra Chuyên sâu Kiến trúc & Quản trị (P00-T03: Deep Architectural & Governance Inspection)

- **Mục tiêu:** Thực hiện kiểm tra chuyên sâu (Read-only Inspection) đối với toàn bộ tệp quản trị gốc (`AGENTS.md`, `docs/rule.md`, `docs/mindmap.md`, `docs/baocao.md`, `docs/risks-decisions.md`), cấu trúc `apps/mobile`, các components của `apps/admin-web` và các hàm Database RPC/Triggers/Constraints hiện có trong `supabase/migrations/` để cung cấp dữ liệu cho Advisor Agent tái thiết kế hệ thống lên kiến trúc v2.0.
- **Files đã kiểm tra:**
  - `AGENTS.md` & `docs/rule.md`: Trích xuất nguyên văn toàn bộ điều khoản quản trị và Strict 8-File Documentation Lock.
  - `docs/mindmap.md`, `docs/baocao.md`, `docs/risks-decisions.md`: Lập bản đồ cấu trúc tổng thể.
  - `apps/mobile`: Xác nhận sử dụng `expo-sqlite` (~58.0.14) cho 6 bảng offline (`exercises`, `workout_plans`, `plan_exercises`, `workout_sessions`, `session_exercises`, `workout_sets`), 3 màn hình hoàn thiện offline (`exercises`, `workouts`, `progress`) và 4 màn hình placeholder (`login`, `register`, `home`, `profile`).
  - `apps/admin-web`: Xác nhận 23 tệp trong `apps/admin-web/src/`, dùng Tailwind CSS thuần + SVG custom icons, chưa cài Lucide icons hay Radix UI; middleware xử lý `@supabase/ssr` cookies và bảo vệ `/dashboard`.
  - `supabase/migrations/`: Rà soát 8 tệp SQL, trích xuất chi tiết 5 functions/RPCs (`is_gym_owner`, `is_active_staff`, `rpc_create_gym`, `rpc_manage_branch`, `rpc_revoke_or_update_staff`), xác nhận 0 Triggers và 47 CHECK constraints trên 13 bảng.
- **Kết quả Quality Gates & Git:**
  - `git status`: Working tree clean (100% Read-only).
  - `npm test`: 13 test suites passed, 54 tests passed.

### 2026-10-31 — Khóa Bản thiết kế Kiến trúc v2.0 & Quản trị Không Trạng thái (P00-T04: Stateless Governance & v2.0 Architecture Blueprint Lock)

- **Mục tiêu:** Nâng cấp toàn diện bộ tệp SSOT (`AGENTS.md`, `docs/rule.md`, `docs/mindmap.md`, `docs/baocao.md`, `docs/risks-decisions.md`) lên chuẩn Stateless Governance & Architecture v2.0, bảo toàn tuyệt đối Strict 8-File Documentation Lock.
- **Files đã sửa đổi & cập nhật:**
  - `AGENTS.md`: Nâng cấp thành cổng khởi động cho Monorepo (Next.js 15 Admin Web + Expo SDK 58 Mobile + Supabase), ban hành Stateless Session Bootstrap Protocol 4 bước, cập nhật lệnh monorepo và khóa 8 tệp SSOT.
  - `docs/rule.md`: Bổ sung quy tắc Stateless Bootstrap (Agent luôn đọc và cập nhật `## 0. CURRENT EXECUTION POINTER` trong `mindmap.md`), bổ sung nguyên tắc CRM độc lập Auth (`OD-07`) và nguyên tắc Giáo án 3 tầng (`OD-08`), đồng bộ quy chuẩn Next.js 15 và Mobile Offline-First SQLite.
  - `docs/mindmap.md`: Bổ sung mục `## 0. CURRENT EXECUTION POINTER (STATELESS HANDOFF)` ở đầu file; bổ sung mục `## 1B. LỘ TRÌNH TÁI KIẾN TRÚC TOÀN DIỆN V2.0` gồm 7 Phases mới (P00 đến P06); cập nhật nhật ký công việc.
  - `docs/baocao.md`: Bổ sung đặc tả kiến trúc v2.0 (Mô hình CRM `gym_members` độc lập Auth và Trạm xếp bài tập 3 tầng `exercises` -> `workout_programs` -> `program_days` -> `program_day_exercises`).
  - `docs/risks-decisions.md`: Bổ sung quyết định kiến trúc `OD-07` (Tách biệt CRM `gym_members` khỏi `auth.users`) và `OD-08` (Kiến trúc xếp bài tập 3 tầng) vào Decision Register.
- **Logic chính đã triển khai:**
  1. Thiết lập hạ tầng điều hành không trạng thái: Bất kỳ Agent nào khởi động phiên mới đều có thể tiếp quản chính xác công việc qua Pointer và Bộ Quy tắc Thép mà không phụ thuộc vào context cũ.
  2. Khóa cứng bản thiết kế dữ liệu v2.0, sẵn sàng cho Phase P01 triển khai migrations SQL additive không phá hủy.
- **Kết quả kiểm tra Quality Gates:**
  - `npx tsc --noEmit`: 0 errors.
  - `npm run lint`: 0 errors.
  - `npm test`: 13 test suites passed, 54 tests passed.

### 2026-11-02 — Đóng gói Phase P00 và Triển khai Database v2.0 Schema Migration (P01-T01: feat/p01-t01-schema-v2)

- **Mục tiêu:** Hợp nhất nhánh `chore/governance-and-schema-sync` vào `main`, tạo nhánh mới `feat/p01-t01-schema-v2` để thực thi Task P01-T01; xây dựng tệp migration SQL thứ 9 triển khai toàn bộ cấu trúc Database v2.0 (CRM Hội viên 360°, Thu ngân thanh toán VND, Trạm xếp bài tập 3 tầng, Theo dõi InBody) và đồng bộ tài liệu kiến trúc.
- **Files đã tạo mới & cập nhật:**
  - `supabase/migrations/20261102000000_v2_crm_360_and_3tier_workout_schema.sql`: Tệp migration thứ 9 (781 dòng SQL):
    1. Mở rộng `public.gym_staff`: Thêm `full_name`, `phone`, `email`, `specialty`, `bio`; cấp quyền ghi và thiết lập RLS INSERT/UPDATE cho Owner/Manager/Self.
    2. CRM Hội viên 360° `public.gym_members` (OD-07): Độc lập với `auth.users`, khóa ngoại `gym_id`, `home_branch_id`, nullable `linked_user_id`, `assigned_pt_id`, mã thẻ `member_code` UNIQUE `(gym_id, member_code)`, 6 indexes tối ưu tra cứu, đầy đủ RLS fail-closed.
    3. Quản lý Thẻ & Thu ngân (OD-05): Mở rộng `membership_plans` (`plan_type`, `description`), mở rộng `memberships` (`member_id`, nullable `user_id`, `notes`), mở rộng `attendance_logs` (`member_id`, nullable `user_id`, RLS quầy tiếp tân); tạo bảng `payment_transactions` (số tiền `BIGINT` VND, `invoice_code`, `idempotency_key`, audit trail, không cho phép hard delete).
    4. Trạm Xếp Bài Tập 3 Tầng & InBody (OD-08): Mở rộng quyền ghi `exercises` cho Owner/Staff (`scope = 'gym'`); tạo bảng `workout_programs` (Tier 1 - Giáo án tổng thể/template), `program_days` (Tier 2 - Ngày tập trong tuần), `program_day_exercises` (Tier 3 - Chi tiết hiệp, reps text, rest, superset, PT notes); tạo bảng `body_measurements` (InBody history, các chỉ số cơ thể, URL ảnh).
    5. Khối Backfill an toàn: Tự động khởi tạo hồ sơ `gym_members` và gán `member_id` cho toàn bộ bản ghi `memberships` cũ có `member_id IS NULL`.
  - `docs/supabase-schema.md`: Bổ sung toàn văn đặc tả kiến trúc Schema v2.0 (Mục tiêu, quyết định OD-05/07/08, DDL chi tiết 6 bảng mới/mở rộng, indexes, ma trận RLS, cập nhật lộ trình và nhật ký).
  - `docs/mindmap.md`: Cập nhật `## 0. CURRENT EXECUTION POINTER` sang Phase P01 / Task P01-T01 IN_REVIEW; đánh dấu `[x] P01-T01`; ghi nhận Work Log 02/11/2026.
- **Logic chính đã triển khai:**
  1. Tháo gỡ nút thắt phụ thuộc Auth: Hội viên vãng lai, khách đăng ký tại quầy tiếp tân được quản lý độc lập 100% qua `gym_members`.
  2. Chuẩn hóa dòng tiền và chống ghi trùng đơn hàng: Sử dụng `BIGINT` VND và `idempotency_key`.
  3. Hoàn thiện mô hình giáo án thể hình 3 tầng linh hoạt, hỗ trợ cả giáo án mẫu (template) và giáo án cá nhân hóa do PT thiết kế.
- **Kết quả kiểm tra Quality Gates:**
  - `npx.cmd tsc --project apps/mobile/tsconfig.json --noEmit`: 0 errors.
  - `npm.cmd run build --workspace=@gym-tracker/admin-web`: Success (Next.js production build passed).
  - `npm.cmd run lint`: 0 errors.
  - `npm.cmd test`: 13 test suites passed, 54 tests passed.

### 2026-11-02 — Hoàn tất RPCs Giao dịch v2.0, Seed Catalog & Vá Lỗi FK Backfill (P01-T02: feat/p01-t01-schema-v2)

- **Mục tiêu:** Vá lỗi khóa ngoại `linked_user_id` trong tệp migration thứ 9; tạo tệp migration thứ 10 (`20261102010000_v2_rpcs_and_seed_catalog.sql`) gồm mở rộng constraint `exercises_scope_owner_check`, trigger tự động đồng bộ `auth.users -> public.users`, 3 hàm RPCs v2.0 (`rpc_register_member_with_plan`, `rpc_check_in_member`, `rpc_assign_program_template`) và khối Seed Data chuẩn.
- **Files đã tạo mới & cập nhật:**
  - `supabase/migrations/20261102000000_v2_crm_360_and_3tier_workout_schema.sql`: Vá lỗi FK `linked_user_id`: bổ sung lệnh chèn đồng bộ `auth.users -> public.users` trước khối `DO $$` và chỉ gán `linked_user_id` khi user thực sự tồn tại trong `public.users`.
  - `supabase/migrations/20261102010000_v2_rpcs_and_seed_catalog.sql`: Tệp migration thứ 10 (454 dòng SQL):
    1. Mở rộng constraint `exercises_scope_owner_check` cho phép `scope = 'gym'` và `DEFAULT gen_random_uuid()` cho `exercises.id`.
    2. Hàm `handle_new_auth_user()` và trigger `on_auth_user_created` trên `auth.users` tự động đồng bộ sang `public.users`.
    3. 3 hàm RPCs v2.0 (`SECURITY DEFINER`, fail-closed): `rpc_register_member_with_plan` (đăng ký quầy & POS nguyên tử), `rpc_check_in_member` (quầy điểm danh đa phương thức, tự trừ buổi tập), `rpc_assign_program_template` (nhân bản sâu giáo án 3 tầng cho học viên).
    4. Khối Seed Data idempotent: 12 bài tập chuẩn (`scope = 'system'`), 3 gói tập mẫu và 1 giáo án 3 tầng Push-Pull-Legs.
  - `docs/supabase-schema.md`: Bổ sung đặc tả 3 hàm RPCs v2.0, trigger đồng bộ Auth, cập nhật bảng lộ trình và nhật ký.
  - `docs/mindmap.md`: Cập nhật con trỏ thực thi `## 0` sang P01-T02 IN_REVIEW, hoàn tất Phase P01, đánh dấu `[x] P01-T02`, ghi nhận Work Log.
- **Logic chính đã triển khai:**
  1. Khắc phục triệt để lỗi bất đồng bộ giữa `auth.users` và `public.users`.
  2. Đóng gói toàn bộ luồng nghiệp vụ quầy tiếp tân, POS và check-in vào các hàm RPCs nguyên tử, loại bỏ nguy cơ race condition và drift trạng thái thẻ.
  3. Cung cấp catalog bài tập và giáo án mẫu chuẩn khoa học phục vụ ngay cho Phase P02 và P03.
- **Kết quả kiểm tra Quality Gates:**
  - `npx.cmd tsc --project apps/mobile/tsconfig.json --noEmit`: 0 errors.
  - `npm.cmd run build --workspace=@gym-tracker/admin-web`: Success (Next.js production build passed).
  - `npm.cmd run lint`: 0 errors.
  - `npm.cmd test`: 13 test suites passed, 54 tests passed.

### 2026-11-02 — Đóng gói Phase P01 và Xây dựng Khung Điều hành Admin ERP Shell v2.0 & Live Dashboard (P02-T01: feat/p02-admin-erp-foundation)

- **Mục tiêu:** Hợp nhất thành công toàn bộ Phase P01 (Database v2.0 Refactoring) vào nhánh `main`, khởi tạo nhánh mới `feat/p02-admin-erp-foundation`; tái thiết kế khung điều hành Admin Web (Sidebar 7 phân hệ, Header thao tác nhanh) và trang Tổng quan Live Dashboard kết nối trực tiếp dữ liệu Schema v2.0; tạo 4 trang khung (placeholders) loại bỏ nguy cơ 404 khi điều hướng.
- **Files đã tạo mới & cập nhật:**
  - `apps/admin-web/src/app/dashboard/sidebar-nav.tsx`: Nâng cấp điều hướng Sidebar 7 phân hệ phân chia theo 3 nhóm nghiệp vụ chuẩn ERP (Vận hành & Quầy lễ tân, Dịch vụ & Huấn luyện, Quản trị hệ thống) với icon SVG sắc nét, badge nổi bật (`Check-in`, `3-Tier`) và highlight trạng thái active chuẩn xác.
  - `apps/admin-web/src/app/dashboard/layout.tsx`: Tự động đọc tên phòng gym từ bảng `public.gyms` hiển thị thương hiệu; tích hợp thanh Quick-Action Header với 2 nút thao tác nhanh (`⚡ Điểm danh nhanh` và `+ Đăng ký Hội viên`) kèm cụm tài khoản và nút Đăng xuất.
  - `apps/admin-web/src/app/dashboard/page.tsx`: Tái thiết kế thành Command Center đa năng đọc song song dữ liệu thật từ Supabase: 4 thẻ KPI động (Tổng hội viên CRM & số đang tập, Thẻ tập hiệu lực & số sắp hết hạn trong 7 ngày, Doanh thu thu ngân VND, Hệ sinh thái Chi nhánh/Gói tập/Giáo án PT 3 tầng); bảng 5 hội viên CRM mới nhất (`member_code`, `full_name`, `phone`, `status`, `joined_at`) và khối lối tắt nghiệp vụ lễ tân/PT.
  - `apps/admin-web/src/app/dashboard/check-in/page.tsx`: Tạo trang khung Quầy Điểm danh (Phase P04).
  - `apps/admin-web/src/app/dashboard/plans/page.tsx`: Tạo trang khung Quản lý Gói tập & Bảng giá (Task P02-T03).
  - `apps/admin-web/src/app/dashboard/workouts/page.tsx`: Tạo trang khung Trạm Giáo án PT (Phase P05).
  - `apps/admin-web/src/app/dashboard/staff/page.tsx`: Tạo trang khung Quản lý Nhân sự & HLV (Task P02-T04).
  - `docs/mindmap.md`: Cập nhật con trỏ `## 0` sang Phase P02 / Task P02-T01 IN_REVIEW, đánh dấu `[x] P02-T01`, ghi nhận Work Log 02/11/2026.
- **Logic chính đã triển khai:**
  1. Chuyển đổi toàn diện trải nghiệm người dùng từ Web Portal cơ bản sang Hệ điều hành phòng gym All-in-One ERP v2.0.
  2. Kết nối trực tiếp dữ liệu thật giữa frontend Next.js 15 và PostgreSQL Schema v2.0, xử lý an toàn chống lỗi khi cơ sở dữ liệu trống.
  3. Hoàn thiện hệ thống điều hướng toàn diện không có điểm chết (0 lỗi 404).
- **Kết quả kiểm tra Quality Gates:**
  - `npx.cmd tsc --project apps/mobile/tsconfig.json --noEmit`: 0 errors.
  - `npm.cmd run build --workspace=@gym-tracker/admin-web`: Success (12 routes tĩnh/động tối ưu, compiled thành công).
  - `npm.cmd run lint`: 0 errors.
  - `npm.cmd test`: 13 test suites passed, 54 tests passed.

### 2026-11-02 — Nâng cấp Toàn diện Quản lý Chi nhánh: Tìm kiếm, Bộ lọc & Chỉnh sửa (P02-T02: feat/p02-admin-erp-foundation)

- **Mục tiêu:** Nâng cấp toàn diện phân hệ Quản lý Chi nhánh cơ sở (`/dashboard/branches`) từ chế độ xem tĩnh sang giao diện quản trị động: tìm kiếm thời gian thực, lọc theo 4 trạng thái, hiển thị số lượng nhân sự/hội viên trực thuộc, đổi trạng thái nhanh (Active/Suspended) và trang form chỉnh sửa chi nhánh an toàn.
- **Files đã tạo mới & cập nhật:**
  - `apps/admin-web/src/app/dashboard/branches/actions.ts`:
    1. Bổ sung `BranchWithStats` và cập nhật `getBranches()` để truy vấn song song số lượng nhân sự active (`gym_staff`) và số lượng hội viên đăng ký (`gym_members`) theo từng chi nhánh.
    2. Bổ sung `getBranchById(branchId)` truy vấn chi tiết 1 cơ sở.
    3. Bổ sung `updateBranch(branchId, formData)` cập nhật tên, slug, phone, address, status qua RPC `rpc_manage_branch` (với fallback direct update) kèm kiểm tra regex slug và revalidate path.
    4. Bổ sung `updateBranchStatus(branchId, status)` đổi nhanh trạng thái hoạt động của cơ sở.
  - `apps/admin-web/src/app/dashboard/branches/branch-table.tsx`: Tạo component Client tương tác cao: thanh tìm kiếm tức thì theo Tên/Slug/SĐT/Địa chỉ; 4 tab lọc trạng thái (Tất cả, Hoạt động, Tạm ngưng, Lưu trữ); hiển thị badge quy mô nhân sự & hội viên; cột thao tác gồm nút Chỉnh sửa và nút Đổi trạng thái nhanh kèm hộp thoại xác nhận.
  - `apps/admin-web/src/app/dashboard/branches/page.tsx`: Tích hợp `BranchTable` và breadcrumb ERP v2.0.
  - `apps/admin-web/src/app/dashboard/branches/[id]/edit/branch-edit-form.tsx`: Form chỉnh sửa chi nhánh với prefill dữ liệu, slug generator, chọn trạng thái và thông báo phản hồi inline.
  - `apps/admin-web/src/app/dashboard/branches/[id]/edit/page.tsx`: Server component định tuyến động với xử lý `params` Promise Next.js 15 và kiểm tra 404 khi không tìm thấy cơ sở.
  - `docs/mindmap.md`: Cập nhật con trỏ `## 0` sang Task P02-T02 IN_REVIEW, đánh dấu `[x] P02-T02`, ghi nhận Work Log 02/11/2026.
- **Logic chính đã triển khai:**
  1. Hỗ trợ đa dạng phương thức tìm kiếm và lọc danh sách chi nhánh mượt mà trên client mà không gây tải lại toàn trang.
  2. Tích hợp đầy đủ luồng chỉnh sửa dữ liệu và chuyển trạng thái cơ sở phòng tập tuân thủ cơ chế bảo mật RLS và RPC gateway của hệ thống.
  3. Hoàn thiện báo cáo thống kê quy mô cơ sở (số lượng nhân sự & hội viên) ngay trên từng dòng danh sách.
- **Kết quả kiểm tra Quality Gates:**
  - `npx.cmd tsc --project apps/mobile/tsconfig.json --noEmit`: 0 errors.
  - `npm.cmd run build --workspace=@gym-tracker/admin-web`: Success (13 routes tĩnh/động tối ưu, compiled thành công).
  - `npm.cmd run lint`: 0 errors.
  - `npm.cmd test`: 13 test suites passed, 54 tests passed.

### 2026-11-02 — Đại tu Giao diện Enterprise & Xây dựng Quản lý Gói tập Plans (P02-T03: feat/p02-admin-erp-foundation)

- **Mục tiêu:** Cài đặt thư viện `lucide-react` cho phân hệ `@gym-tracker/admin-web`, thực hiện quy tắc Zero-Emoji và nâng cấp toàn bộ hệ thống giao diện theo chuẩn Enterprise SaaS (Devias Kit Pro & Shadcn UI style), khắc phục lỗi chuỗi LaTeX thô `($\rightarrow$)`, sửa lỗi nút Next.js DevTools che khuất thông tin chân Sidebar; đồng thời xây dựng hoàn chỉnh phân hệ Quản lý Gói tập & Bảng giá (`/dashboard/plans`).
- **Files đã tạo mới & cập nhật:**
  - `apps/admin-web/package.json` & `package-lock.json`: Cài đặt gói `lucide-react` (^1.66.0).
  - `apps/admin-web/src/app/dashboard/layout.tsx`: Đại tu khung điều hành: Topbar Header `h-14` với nút Điểm danh nhanh (`ScanLine`) và Đăng ký Hội viên (`UserPlus`); Sidebar tối màu Devias `bg-slate-950`, chân Sidebar thêm khoảng đệm `pb-16` không bị nút Next.js DevTools che khuất; tích hợp icon Đăng xuất `LogOut`.
  - `apps/admin-web/src/app/dashboard/sidebar-nav.tsx`: Thay toàn bộ icon SVG/Emoji bằng `lucide-react` (`LayoutDashboard`, `ScanLine`, `Users`, `CreditCard`, `Dumbbell`, `Building2`, `ShieldCheck`, `Settings`); hiệu ứng active item `bg-indigo-600/15 text-indigo-400 font-semibold ring-1 ring-inset ring-indigo-500/30`.
  - `apps/admin-web/src/app/dashboard/page.tsx`: Xóa bỏ thẻ banner "Xin chào, admin! 👋" cồng kềnh; chuẩn hóa Page Header không đóng hộp trên nền trang; tái thiết kế 4 KPI Cards theo chuẩn tài chính Stripe/Devias (`tabular-nums`, icon trong hộp `w-9 h-9`); xóa bỏ 100% Emoji.
  - `apps/admin-web/src/app/dashboard/workouts/page.tsx`: Xóa triệt để lỗi chuỗi LaTeX thô `($\rightarrow$)`, thay bằng `ArrowRight` và mũi tên trực quan; loại bỏ hoàn toàn Emoji `🏋️`.
  - `apps/admin-web/src/app/dashboard/check-in/page.tsx`, `staff/page.tsx`, `settings/page.tsx`: Chuẩn hóa Page Header không đóng hộp, thay thế toàn bộ emoji `⚡`, `👥`, `⚙️` bằng icon Lucide tương ứng.
  - `apps/admin-web/src/app/dashboard/branches/*` (`page.tsx`, `branch-table.tsx`, `create/page.tsx`, `[id]/edit/*`): Chuẩn hóa Page Header, xóa sạch toàn bộ emoji (`🏢`, `👥`, `💪`, `📞`, `📍`, `⚠️`, `🟢`, `🟡`, `⚪`), thay thế bằng các component Lucide chuẩn.
  - `apps/admin-web/src/app/dashboard/members/*` (`page.tsx`, `create-form.tsx`): Xóa sạch emoji `⚠️`, `👤`, `👥`, `🎫`.
  - `apps/admin-web/src/app/dashboard/plans/actions.ts`: Xây dựng đầy đủ CRUD Server Actions: `getMembershipPlans()` kèm thống kê số thẻ active, `getMembershipPlanById()`, `createMembershipPlan()` (hỗ trợ `fixed_period`, `session_pack`, `recurring` kèm cơ chế tự động mapping fallback cho constraint DB), `updateMembershipPlan()` và `togglePlanStatus()`.
  - `apps/admin-web/src/app/dashboard/plans/plan-table.tsx`: Giao diện bảng gói tập thông minh: 3 thẻ tóm tắt nhanh, thanh tìm kiếm thời gian thực, các tab lọc phân loại (`Tất cả`, `Thẻ Thời Hạn`, `Gói Buổi PT`, `Định Kỳ`), lọc trạng thái mở bán, hiển thị đơn giá VNĐ định dạng chuẩn, số buổi, phạm vi chi nhánh, số hội viên đang dùng và nút thao tác nhanh.
  - `apps/admin-web/src/app/dashboard/plans/page.tsx`: Trang danh mục gói tập chuẩn Enterprise.
  - `apps/admin-web/src/app/dashboard/plans/plan-form.tsx`: Form nhập liệu 2 cột thông minh: chọn nhanh thời hạn (`30 ngày`, `90 ngày`, `180 ngày`, `365 ngày`), nổi bật hạn mức buổi tập khi chọn Gói PT, và Live Pricing Card Preview thời gian thực chuẩn POS quầy tiếp tân.
  - `apps/admin-web/src/app/dashboard/plans/create/page.tsx` & `[id]/edit/page.tsx`: Tuyến đường tạo mới và chỉnh sửa gói tập tương thích Next.js 15 `await params`.
  - `docs/design-system.md`: Bổ sung mục 3 quy chuẩn Admin Web Enterprise Design System v2.0 (Zero-Emoji, Lucide React, Devias Shell, Page Header không đóng hộp).
  - `docs/mindmap.md`: Cập nhật con trỏ trạng thái sang P02-T03 IN_REVIEW, đánh dấu `[x] P02-T03` và ghi nhận Work Log chi tiết.
- **Kết quả kiểm tra Quality Gates:**
  - `node scratch/scan_emojis.js`: 0 emojis, 0 unrendered LaTeX strings.
  - `npx.cmd tsc --project apps/mobile/tsconfig.json --noEmit`: 0 errors.
  - `npm.cmd run build --workspace=@gym-tracker/admin-web`: Success (14 routes tĩnh/động tối ưu, compiled thành công).
  - `npm.cmd run lint`: 0 errors.
  - `npm.cmd test`: 13 test suites passed, 54 tests passed.

### 2026-11-03 — Hoàn Thành Phân Hệ Quản Lý Nhân Sự & PT (P02-T04: feat/p02-admin-erp-foundation)

- **Mục tiêu:** Xây dựng hoàn chỉnh phân hệ Quản lý Nhân sự & Huấn luyện viên PT (`/dashboard/staff`), tạo migration thứ 11 gỡ bỏ ràng buộc `NOT NULL` trên `gym_staff.user_id`, cấp quyền RLS DELETE cho Owner, seed 2 Huấn luyện viên PT mẫu và 1 Lễ tân mẫu; hoàn tất toàn bộ 4/4 Tasks của Phase P02.
- **Files đã tạo mới & cập nhật:**
  - `supabase/migrations/20261102020000_v2_staff_profile_nullable_user_id.sql`: Migration thứ 11 bọc trong `BEGIN ... COMMIT`:
    1. `ALTER TABLE public.gym_staff ALTER COLUMN user_id DROP NOT NULL;`
    2. Cập nhật partial unique indexes `gym_staff_gym_user_null_branch_idx` và `gym_staff_gym_branch_user_idx` bổ sung `WHERE ... AND user_id IS NOT NULL`.
    3. Thêm composite index `gym_staff_gym_role_status_idx` và `gym_staff_phone_idx`.
    4. Cấp quyền & thiết lập policy RLS DELETE cho Gym Owner.
    5. Khối DO block idempotent seed 2 PT mẫu (`Nguyễn Minh Quân`, `Lê Thảo Vy`) và 1 Lễ tân mẫu (`Trần Hoàng Yến`).
  - `apps/admin-web/src/app/dashboard/staff/actions.ts`: Server Actions:
    1. `getStaffMembers()`: Lấy danh sách nhân sự, map tên chi nhánh và thống kê số học viên đang phụ trách (`assigned_members_count`).
    2. `getStaffById()`: Chi tiết nhân sự theo ID.
    3. `getActiveBranchesForStaff()`: Danh sách chi nhánh hoạt động phục vụ form.
    4. `createStaffMember()` & `updateStaffMember()`: Tạo và cập nhật hồ sơ nhân sự/PT không phụ thuộc Auth UID.
    5. `updateStaffStatus()`: Đổi trạng thái nhanh (`active`, `suspended`, `revoked`).
  - `apps/admin-web/src/app/dashboard/staff/staff-table.tsx`: Component bảng nhân sự chuyên nghiệp: 4 thẻ KPI nhanh, thanh tìm kiếm tức thời đa trường, tab lọc theo vai trò (`Huấn Luyện Viên PT`, `Lễ Tân`, `Quản Lý`), dropdown lọc theo chi nhánh, badge phân biệt màu sắc và các nút thao tác nhanh.
  - `apps/admin-web/src/app/dashboard/staff/page.tsx`: Trang danh mục nhân sự chuẩn Enterprise với Page Header không đóng hộp.
  - `apps/admin-web/src/app/dashboard/staff/staff-form.tsx`: Form 2 cột hiện đại: Cột trái nhập thông tin cá nhân, vai trò, chi nhánh, chip chọn nhanh chuyên môn và tiểu sử; Cột phải hiển thị Thẻ Hồ sơ Nhân sự/PT Xem trước (Live Staff Badge Preview).
  - `apps/admin-web/src/app/dashboard/staff/create/page.tsx` & `[id]/edit/page.tsx`: Tuyến đường tạo mới và chỉnh sửa nhân sự tương thích Next.js 15 Server Components.
  - `docs/supabase-schema.md`: Ghi nhận migration thứ 11 trong lộ trình GM và nhật ký chỉnh sửa.
  - `docs/mindmap.md`: Cập nhật con trỏ trạng thái sang P02-T04 IN_REVIEW, đánh dấu `[x] P02-T04` và hoàn tất Phase P02.
- **Kết quả kiểm tra Quality Gates:**
  - `node scratch/scan_emojis.js`: 0 emojis, 0 unrendered LaTeX strings.
  - `npx.cmd tsc --project apps/mobile/tsconfig.json --noEmit`: 0 errors.
  - `npm.cmd run build --workspace=@gym-tracker/admin-web`: Success (16 routes tĩnh/động tối ưu, compiled thành công).
  - `npm.cmd run lint`: 0 errors.
  - `npm.cmd test`: 13 test suites passed, 54 tests passed.

### 2026-11-03 — Chuẩn Hóa Typography Tiếng Việt, Giao Diện ERP & Hoàn Thành Phân Hệ Hội Viên CRM (P03-T01 + P03-T02: feat/p03-crm-members-pos)

- **Mục tiêu:**
  1. Hợp nhất nhánh `feat/p02-admin-erp-foundation` vào `main` (--no-ff) để đóng Phase P02 và khởi tạo nhánh `feat/p03-crm-members-pos`.
  2. Mở rộng Sidebar lên `w-72` (288px), tăng kích thước font menu và icon Lucide `w-5 h-5`; đổi tên thương hiệu thành "GymOS" (Hệ thống quản trị phòng tập) và bổ sung tính năng tùy biến tên phòng tập trong Cài đặt (`/dashboard/settings`).
  3. Xóa bỏ hoàn toàn hộp đen "Kiến Trúc Vận Hành" ở góc phải màn hình tổng quan (`/dashboard/page.tsx`).
  4. Thiết lập quy chuẩn Typography tiếng Việt: 100% văn bản UI theo chuẩn Sentence Case, xóa bỏ hoàn toàn việc viết hoa mọi chữ cái đầu (Title Case) và loại bỏ 100% ký hiệu `&` trong câu tiếng Việt trên toàn bộ các phân hệ Admin Web.
  5. Xây dựng hoàn chỉnh phân hệ Hội viên CRM 360° (`/dashboard/members`): Bảng danh sách hội viên đa tiêu chí (`gym_members`), 4 thẻ KPI tài chính/vận hành, bộ lọc tìm kiếm và trạng thái.
  6. Đại tu form Đăng ký Hội viên mới (`/dashboard/members/create`): Xóa bỏ hoàn toàn trường nhập UUID/Auth UID; bố cục 2 phân vùng (Thông tin cá nhân & Gói tập/Thanh toán POS tại quầy); Live Member Card & Receipt Preview thời gian thực.
- **Files đã tạo mới & cập nhật:**
  - `apps/admin-web/src/app/dashboard/sidebar-nav.tsx` & `layout.tsx`: Mở rộng Sidebar `w-72`, cập nhật nhãn Sentence Case không dùng `&`, thương hiệu GymOS.
  - `apps/admin-web/src/app/dashboard/settings/*` (`actions.ts`, `settings-form.tsx`, `page.tsx`): Tính năng tùy biến tên phòng tập lưu vào `public.gyms`.
  - `apps/admin-web/src/app/dashboard/page.tsx`: Xóa bỏ hộp đen "Kiến Trúc Vận Hành", chuẩn hóa toàn bộ Sentence Case và zero `&`.
  - `apps/admin-web/src/app/dashboard/branches/*`: Chuẩn hóa Sentence Case và zero `&`.
  - `apps/admin-web/src/app/dashboard/plans/*`: Chuẩn hóa Sentence Case và zero `&`.
  - `apps/admin-web/src/app/dashboard/staff/*`: Chuẩn hóa Sentence Case và zero `&`.
  - `apps/admin-web/src/app/dashboard/check-in/page.tsx` & `workouts/page.tsx`: Chuẩn hóa Sentence Case và zero `&`.
  - `apps/admin-web/src/app/dashboard/members/actions.ts`: Server Actions v2.0 `getMembers()` truy vấn CRM 360°, `getMemberRegistrationOptions()` và `registerNewMember()` tích hợp RPC `rpc_register_member_with_plan` kèm fallback direct insert (không cần Auth UUID).
  - `apps/admin-web/src/app/dashboard/members/member-table.tsx`: Bảng hội viên CRM 360° tương tác thời gian thực, 4 thẻ KPI, thanh tìm kiếm và bộ lọc.
  - `apps/admin-web/src/app/dashboard/members/page.tsx`: Trang CRM hội viên chuẩn Enterprise.
  - `apps/admin-web/src/app/dashboard/members/create/create-form.tsx` & `page.tsx`: Form đăng ký hội viên và bán thẻ POS tại quầy xóa bỏ trường UUID, tích hợp Live Preview thẻ hội viên.
  - `docs/rule.md` & `docs/design-system.md`: Ghi nhận chuẩn Typography tiếng Việt (Sentence Case, zero-emoji, cấm ký hiệu `&` trong UI text) và chiều rộng Sidebar `w-72`.
  - `docs/mindmap.md`: Cập nhật Execution Pointer sang Phase P03, đánh dấu `[x] P03-T01` và `[x] P03-T02`.

### 2026-11-03 — Khắc Phục Lỗi RLS Recursion gym_staff, Nâng Cấp Công Thái Học Nút Bấm, Chuẩn Hóa Topbar & Tái Thiết Kế Landing Portal GymOS (P03-T02-FIX: feat/p03-crm-members-pos)

- **Mục tiêu:**
  1. Khắc phục triệt để lỗi đệ quy vô hạn `infinite recursion detected in policy for relation "gym_staff"` khi mở trang Hội viên CRM (`/dashboard/members`).
  2. Tách rời độc lập truy vấn danh sách hội viên (`gym_members`), thẻ tập (`memberships`) và nhân sự PT (`gym_staff`) trong Server Actions bằng `Promise.allSettled`; loại bỏ toàn bộ lệnh `console.error` gây kích hoạt popup lỗi đỏ Next.js 15 DevTools.
  3. Dọn dẹp thanh Topbar Header (`dashboard/layout.tsx`): Loại bỏ tiêu đề cơ sở dư thừa, thay bằng pill trạng thái trực tuyến ("Hệ thống trực tuyến") kèm hiển thị ngày tháng tiếng Việt, làm dày các nút bấm quầy tiếp tân và đăng ký hội viên.
  4. Nâng cấp chuẩn công thái học nút bấm (Button Sizing & Ergonomics) trên toàn hệ thống: `components/ui/button.tsx` (size `sm`, `md`, `lg`), các nút Primary Actions trên Page Header (`h-11 px-5 rounded-xl text-sm font-semibold`), và thanh tìm kiếm/lọc (`h-10 rounded-xl`) trên 5 phân hệ (`dashboard`, `members`, `branches`, `plans`, `staff`).
  5. Tái thiết kế toàn diện Cổng thông tin Enterprise Portal Landing page (`apps/admin-web/src/app/page.tsx`), trang đăng nhập (`login/page.tsx`) và root metadata (`app/layout.tsx`) sang thương hiệu GymOS chuẩn mực với Header `h-20`, Hero ấn tượng và Bento Grid 4 khối tính năng cốt lõi.
  6. Tạo tệp migration thứ 12 (`supabase/migrations/20261103000000_fix_gym_staff_rls_recursion_and_brand.sql`) và cập nhật SSOT docs (`docs/supabase-schema.md`, `docs/design-system.md`, `docs/mindmap.md`).
- **Files đã tạo mới & cập nhật:**
  - `supabase/migrations/20261103000000_fix_gym_staff_rls_recursion_and_brand.sql`: Migration 12 tái cấu trúc policy RLS `gym_staff` và cập nhật tên gym mặc định thành GymOS.
  - `apps/admin-web/src/components/ui/button.tsx`: Thêm variant size `sm` (`h-9`), `md` (`h-10`), `lg` (`h-11`) bo góc `rounded-xl font-semibold`.
  - `apps/admin-web/src/app/dashboard/layout.tsx`: Dọn dẹp Topbar Header `h-16 px-8`, thêm pill trực tuyến và làm dày các nút bấm nhanh.
  - `apps/admin-web/src/app/dashboard/members/actions.ts`: Decouple queries qua `Promise.allSettled`, xóa `console.error`.
  - `apps/admin-web/src/app/dashboard/page.tsx`: Làm dày 2 nút Quầy điểm danh và Thêm hội viên (`h-11 px-5 rounded-xl`).
  - `apps/admin-web/src/app/dashboard/members/page.tsx` & `member-table.tsx`: Làm dày nút Đăng ký hội viên mới, thanh tìm kiếm và bộ lọc trạng thái/chi nhánh.
  - `apps/admin-web/src/app/dashboard/branches/page.tsx` & `branch-table.tsx`: Làm dày nút Thêm chi nhánh mới, thanh tìm kiếm và bộ lọc.
  - `apps/admin-web/src/app/dashboard/plans/page.tsx` & `plan-table.tsx`: Làm dày nút Tạo gói tập mới, thanh tìm kiếm và bộ lọc.
  - `apps/admin-web/src/app/dashboard/staff/page.tsx` & `staff-table.tsx`: Làm dày nút Thêm nhân sự mới, thanh tìm kiếm và bộ lọc.
  - `apps/admin-web/src/app/layout.tsx`: Cập nhật metadata title `GymOS — Hệ thống quản trị phòng tập`.
  - `apps/admin-web/src/app/page.tsx`: Tái thiết kế toàn diện Cổng thông tin GymOS với Header `h-20`, Hero, Trust Metrics và Bento Grid 4 phân hệ.
  - `apps/admin-web/src/app/login/page.tsx`: Đồng bộ thương hiệu GymOS và nút đăng nhập dày `h-11`.
  - `docs/supabase-schema.md`, `docs/design-system.md`, `docs/mindmap.md`: Cập nhật tài liệu kỹ thuật SSOT.

### 2026-11-04 — Hoàn Thiện Hồ Sơ Chi Tiết Hội Viên 360°, Tinh Chỉnh Topbar, Khóa Cấu Hình GymOS & Điều Hướng Trực Tiếp (P03-T03: feat/p03-crm-members-pos)

- **Mục tiêu:**
  1. Chuyển đổi tuyến đường gốc `/` (`apps/admin-web/src/app/page.tsx`) thành Server-side Redirect Controller: Điều hướng tự động về `/dashboard` (nếu đã đăng nhập) hoặc `/login` (nếu chưa đăng nhập).
  2. Tinh gọn trang đăng nhập (`app/login/page.tsx`): Xóa bỏ liên kết quay lại cổng thông tin, bổ sung chú thích nhận diện "GymOS v2.0 — Hệ thống quản trị phòng tập nội bộ".
  3. Khắc phục lỗi thiếu padding ngang trên nút "Đăng ký hội viên" do class không chuẩn `px-4.5`; đồng bộ nhãn cả 2 nút trên thanh Header (`layout.tsx`) và trang Tổng quan (`dashboard/page.tsx`) thành chính xác "Điểm danh nhanh" và "Đăng ký hội viên" với class chuẩn Tailwind v3 (`h-10 px-5 rounded-lg text-sm font-semibold`).
  4. Khóa cấu hình phần mềm thương hiệu GymOS và mã định danh `/gymos` tại trang Cài đặt (`/dashboard/settings`): Xóa form chỉnh sửa tên và nút lưu, thay bằng Bảng thông tin định danh hệ thống (chế độ chỉ đọc / Locked), đồng thời cập nhật migration 12 để đồng bộ `slug = 'gymos'` trên cơ sở dữ liệu.
  5. Xây dựng hoàn chỉnh trang Hồ sơ Chi tiết Hội viên 360° (`/dashboard/members/[id]`): Tóm tắt định danh hội viên, nút Điểm danh nhanh 1 chạm, và 4 Tabs toàn diện (Thẻ tập & hồ sơ cá nhân + gia hạn thẻ tại quầy, Lịch sử thanh toán hóa đơn, Nhật ký điểm danh, Chỉ số cơ thể InBody & giáo án PT 3 tầng).
  6. Kết nối liên kết điều hướng từ Bảng danh sách hội viên (`member-table.tsx`) sang trang chi tiết 360° qua mã thẻ, họ tên và nút thao tác "Chi tiết 360°".
- **Files đã tạo mới & cập nhật:**
  - `apps/admin-web/src/app/page.tsx`: Chuyển thành Server Redirect Controller `/dashboard` hoặc `/login`.
  - `apps/admin-web/src/app/login/page.tsx`: Xóa nút quay lại, tinh chỉnh card đăng nhập GymOS chuẩn mực.
  - `apps/admin-web/src/app/dashboard/layout.tsx` & `page.tsx`: Đồng bộ 2 nút "Điểm danh nhanh" và "Đăng ký hội viên" với class chuẩn `h-10 px-5 rounded-lg`.
  - `supabase/migrations/20261103000000_fix_gym_staff_rls_recursion_and_brand.sql`: Đồng bộ tên 'GymOS' và slug 'gymos' trong bảng `public.gyms`.
  - `apps/admin-web/src/app/dashboard/settings/*` (`actions.ts`, `page.tsx`): Khóa cấu hình chỉ đọc và auto-sync slug `/gymos`.
  - `apps/admin-web/src/app/dashboard/members/actions.ts`: Bổ sung 6 Server Actions v2.0 (`getMember360Profile`, `updateMemberProfile`, `renewOrAddMembership`, `updateSubscriptionStatus`, `recordBodyMeasurement`, `quickCheckInMember`).
  - `apps/admin-web/src/app/dashboard/members/[id]/page.tsx` & `member-360-view.tsx`: Giao diện Hồ sơ chi tiết hội viên 360° 4 Tabs hoàn chỉnh.
  - `apps/admin-web/src/app/dashboard/members/member-table.tsx`: Nối link chi tiết 360° và thêm nút "Chi tiết 360°".
  - `docs/mindmap.md`: Đánh dấu hoàn tất `[x] P03-T03`, cập nhật con trỏ trạng thái sẵn sàng đóng Phase P03.

### 2026-11-04 — Đóng Gói Phase P03 & Xây Dựng Quầy Điểm Danh Thông Minh Tiếp Tân (P04-T01: feat/p04-smart-checkin-desk)

- **Mục tiêu:**
  1. Hợp nhất nhánh `feat/p03-crm-members-pos` vào `main` (`--no-ff`), đóng gói toàn diện Phase P03 và tạo nhánh mới `feat/p04-smart-checkin-desk`.
  2. Xây dựng Server Actions tại `apps/admin-web/src/app/dashboard/check-in/actions.ts`:
     - `getCheckInDeskData()`: Tối ưu truy vấn song song qua `Promise.allSettled` cho các chi nhánh hoạt động, danh sách hội viên, trạng thái thẻ tập và 100 lượt điểm danh gần nhất kèm 4 thẻ KPI thời gian thực.
     - `performDeskCheckIn()`: Tích hợp trực tiếp hàm RPC transactional `public.rpc_check_in_member`, kiểm tra điều kiện thẻ, tự động trừ buổi tập đối với gói PT, ghi nhận `attendance_logs` và trả về kết quả chi tiết kèm cảnh báo sắp hết hạn nếu còn ≤ 7 ngày hoặc ≤ 2 buổi.
     - `checkOutAttendance()`: Cập nhật `check_out_at` khi hội viên ra về, tự động tính toán tổng thời lượng buổi tập.
  3. Xây dựng giao diện Quầy điểm danh thông minh tại `apps/admin-web/src/app/dashboard/check-in/` (`page.tsx` và `check-in-desk.tsx`):
     - Unboxed Page Header đồng bộ nút "Danh sách hội viên" và "Đăng ký hội viên".
     - 4 thẻ KPI `tabular-nums`: Lượt điểm danh hôm nay, Đang tập trong phòng, Hội viên đủ điều kiện, Thẻ sắp hết hạn.
     - Bố cục Split-Desk trực quan: Cột trái (Trạm quét mã / tra cứu tức thì, danh sách gợi ý 1 chạm, Thẻ kết quả xác thực trực quan xanh/đỏ); Cột phải (Nhật ký ra vào thời gian thực, bộ lọc 3 tầng và nút ghi nhận ra về).
  4. Tuân thủ tuyệt đối quy chuẩn văn phong tiếng Việt (Sentence case, không dùng dấu `&`), Zero-Emoji, 100% icon `lucide-react`, nút bấm dày chuẩn Tailwind v3.
- **Files đã tạo mới & cập nhật:**
  - `apps/admin-web/src/app/dashboard/check-in/actions.ts`: Server Actions cho Quầy điểm danh tiếp tân.
  - `apps/admin-web/src/app/dashboard/check-in/check-in-desk.tsx`: Client Component Quầy điểm danh 2 cột Split-Desk.
  - `apps/admin-web/src/app/dashboard/check-in/page.tsx`: Server Component Page nạp dữ liệu và kết nối trạm điểm danh.
  - `docs/mindmap.md`: Đánh dấu hoàn tất `[x] P04-T01`, cập nhật con trỏ thực thi sang Phase P05.

### 2026-11-05 — Đóng Gói Phase P04, Cài Đặt Bộ Thư Viện UI Nâng Cao, Vá Lỗi Expo Go & Hoàn Thành Thư Viện Bài Tập Chuẩn (P05-T01: feat/p05-workout-programming-studio)

- **Mục tiêu:**
  1. Hợp nhất nhánh `feat/p04-smart-checkin-desk` vào `main` (`--no-ff`), đóng gói toàn diện Phase P04 và tạo nhánh mới `feat/p05-workout-programming-studio`.
  2. Nâng cấp hệ sinh thái thư viện UI cho `@gym-tracker/admin-web`: Cài đặt thành công `clsx`, `tailwind-merge`, `class-variance-authority`, `@radix-ui/react-dialog`, `@radix-ui/react-tabs`, `sonner`, `qrcode.react`, `recharts`.
  3. Tạo tiện ích `cn()` tại `apps/admin-web/src/lib/utils.ts`, tích hợp hệ thống thông báo nổi `<Toaster position="top-right" richColors />` từ `sonner` vào `dashboard/layout.tsx`.
  4. Nâng cấp trang Hồ sơ chi tiết hội viên 360° (`member-360-view.tsx`):
     - Hiển thị Mã QR thẻ hội viên thật với `QRCodeSVG` từ `qrcode.react` (`gymos://member/MEM-XXXXXX`) hỗ trợ camera quầy lễ tân quét điểm danh.
     - Tích hợp Biểu đồ biến thiên tiến độ thể chất InBody (Cân nặng, Cơ xương, Tỷ lệ mỡ) bằng `ResponsiveContainer` và `AreaChart` từ `recharts`.
     - Chuyển đổi các thông báo thao tác sang hệ thống `toast` nổi từ `sonner`.
  5. Vá lỗi Expo Go Monorepo trên Android: Tạo tệp cầu nối `App.tsx` tại cả `apps/mobile/App.tsx` và root `App.tsx` chuyển hướng trực tiếp sang `expo-router/entry` nhằm khắc phục dứt điểm lỗi `UnableToResolveError ../../App` từ `node_modules/expo/AppEntry.js`.
  6. Xây dựng hoàn chỉnh Tầng 1 của Trạm Giáo Án PT — Quản lý Thư viện Bài tập Chuẩn tại `/dashboard/workouts`:
     - Server Actions (`actions.ts`): `getExercisesCatalogData`, `createCustomExercise`, `updateCustomExercise`, `deleteCustomExercise` truy vấn và cập nhật bảng `public.exercises` kết hợp bài tập hệ thống (`scope = 'system'`) và bài tập riêng của phòng gym (`scope = 'gym'`).
     - Client Component (`exercise-catalog.tsx`): 4 thẻ KPI danh mục, bộ lọc đa chiều (tìm kiếm từ khóa, 8 nhóm cơ, 7 loại dụng cụ, 3 cấp độ khó, nguồn gốc bài tập), lưới thẻ bài tập trực quan, và các hộp thoại Radix Modal (`@radix-ui/react-dialog`) để thêm mới, xem hướng dẫn kỹ thuật chi tiết và chỉnh sửa bài tập riêng.
  7. Cập nhật tài liệu kỹ thuật SSOT: `docs/design-system.md` và `docs/mindmap.md`.
- **Files đã tạo mới & cập nhật:**
  - `App.tsx`: Cầu nối dự phòng Monorepo cho Expo Go.
  - `apps/mobile/App.tsx`: Cầu nối dự phòng Monorepo cho Expo Go trong thư mục mobile.
  - `apps/admin-web/package.json` & `package-lock.json`: Thêm các dependencies UI nâng cao.
  - `apps/admin-web/src/lib/utils.ts`: Tiện ích `cn()` kết hợp `clsx` và `tailwind-merge`.
  - `apps/admin-web/src/app/dashboard/layout.tsx`: Tích hợp `<Toaster />` từ `sonner`.
  - `apps/admin-web/src/app/dashboard/members/[id]/member-360-view.tsx`: Bổ sung mã QR `QRCodeSVG`, biểu đồ Recharts và thông báo Sonner.
  - `apps/admin-web/src/app/dashboard/workouts/actions.ts`: Server Actions cho Thư viện bài tập.
  - `apps/admin-web/src/app/dashboard/workouts/exercise-catalog.tsx`: Giao diện tương tác Thư viện bài tập chuẩn dùng Radix Dialog và Sonner Toast.
  - `apps/admin-web/src/app/dashboard/workouts/page.tsx`: Server Component kết nối dữ liệu Thư viện bài tập.
  - `docs/design-system.md` & `docs/mindmap.md`: Cập nhật tài liệu thiết kế và roadmap.

### 2026-11-05 — Hoàn Thành Trình Biên Soạn Giáo Án Mẫu 3 Tầng, Phân Công Lộ Trình Học Viên & Đồng Bộ Supabase Cloud (P05-T02 & P05-T03: feat/p05-workout-programming-studio)

- **Mục tiêu:**
  1. Đồng bộ và áp dụng thành công migration 10 (`20261102010000_v2_rpcs_and_seed_catalog.sql`) lên Supabase Cloud qua Supabase MCP (`apply_migration`), triển khai 3 transactional RPCs (`rpc_assign_program_template`, `rpc_check_in_member`, `rpc_register_member_with_plan`), seed 12 bài tập hệ thống chuẩn (`scope = 'system'`) và giáo án mẫu 3 tầng Push - Pull - Legs.
  2. Mở rộng toàn diện Server Actions tại `apps/admin-web/src/app/dashboard/workouts/actions.ts`:
     - `getWorkoutStudioFullData()`: Truy vấn cấu trúc cây phân cấp 3 tầng (`workout_programs`, `program_days`, `program_day_exercises` kèm bài tập kỹ thuật join `exercises`), nạp danh sách hội viên hoạt động (`gym_members`) và nhân viên huấn luyện (`gym_staff`).
     - Tầng 2 CRUD: `createProgramTemplate`, `deleteProgramTemplate`, `addProgramDay`, `deleteProgramDay`, `addExerciseToProgramDay`, `removeExerciseFromProgramDay`.
     - Tầng 3 Assignment: `assignProgramToMember` (gọi RPC `rpc_assign_program_template` tự động deep-clone sang học viên), `updateAssignedProgramStatus` và `deleteAssignedProgram`.
  3. Xây dựng Trạm Thiết Kế Giáo Án 3 Tầng hoàn chỉnh (`apps/admin-web/src/app/dashboard/workouts/workout-studio.tsx` & `page.tsx`):
     - Giao diện 3 Tabs Radix UI (`@radix-ui/react-tabs`): Tầng 1 Thư viện bài tập chuẩn, Tầng 2 Trình biên soạn giáo án mẫu, Tầng 3 Quản lý lộ trình học viên đã giao.
     - Tầng 2 Templates Builder: Thống kê KPI, bộ lọc cấp độ khó (Beginner, Intermediate, Advanced), thẻ giáo án mẫu trực quan, giao diện Active Template Editor xếp các buổi tập trong tuần (`program_days`) và xếp bài tập với Sets, Reps, RPE mục tiêu, Thời gian nghỉ và Ghi chú kỹ thuật của HLV.
     - Tầng 3 Assigned Programs: Thống kê trạng thái lộ trình, tìm kiếm học viên, bảng phân công lộ trình với liên kết mã thẻ hội viên dẫn sang hồ sơ 360°, dropdown cập nhật trạng thái nhanh và modal xem chi tiết toàn bộ lịch tập của học viên.
     - Hộp thoại Radix Dialogs (`@radix-ui/react-dialog`) và thông báo `toast` Sonner cho toàn bộ các thao tác.
  4. Tuân thủ tuyệt đối quy chuẩn văn phong tiếng Việt (Sentence case, không dùng dấu `&`), Zero-Emoji, 100% icon `lucide-react`. Vượt qua toàn bộ Quality Gates (Lint sạch, Typecheck không lỗi, Build Next.js thành công và 13/13 test suites pass).
- **Files đã tạo mới & cập nhật:**
  - `apps/admin-web/src/app/dashboard/workouts/actions.ts`: Mở rộng Server Actions cho toàn bộ 3 tầng giáo án.
  - `apps/admin-web/src/app/dashboard/workouts/workout-studio.tsx`: Client Component Workout Studio 3 tầng hoàn chỉnh.
  - `apps/admin-web/src/app/dashboard/workouts/page.tsx`: Server Component kết nối dữ liệu 3 tầng cho Coaching Studio.
  - `docs/mindmap.md`: Đánh dấu hoàn tất `[x] P05-T02` và `[x] P05-T03`, cập nhật con trỏ thực thi hoàn tất Phase P05.

### 2026-11-05 — Đóng Gói Phase P05 & Hoàn Thành Phase P06: Biểu Đồ Điều Hành Recharts, Quản Trị Thu Ngân, Cảnh Báo CSKH & Kiểm Định E2E Toàn Diện (P06-T01 & P06-T02: feat/p06-analytics-and-e2e-polish)

- **Mục tiêu:**
  1. Hợp nhất nhánh `feat/p05-workout-programming-studio` vào `main` (`--no-ff`), đóng gói toàn diện Phase P05 và tạo nhánh mới `feat/p06-analytics-and-e2e-polish`.
  2. Nâng cấp Trung tâm chỉ huy (`apps/admin-web/src/app/dashboard/`):
     - Xây dựng Client Component `dashboard-charts.tsx` sử dụng `recharts` (`ResponsiveContainer`, `AreaChart`, `BarChart`, `XAxis`, `YAxis`, `Tooltip`, `CartesianGrid`):
       - Biểu đồ tương tác chuyển đổi 2 chế độ: Lưu lượng điểm danh 7 ngày (`attendance_logs`) và Doanh thu thu ngân 7 ngày (`payment_transactions`) với tooltip định dạng chuẩn tiếng Việt và tiền tệ VNĐ.
       - Thẻ Cơ cấu hội viên và dịch vụ: Đo lường trực quan tỷ lệ hội viên hoạt động, thẻ sắp hết hạn trong 7 ngày, số gói tập mở bán, số HLV phụ trách và số giáo án 3 tầng.
     - Cập nhật trang Server Component `page.tsx`:
       - Tối ưu hóa truy vấn song song qua `Promise.allSettled` cho toàn bộ 12 nguồn dữ liệu v2.0.
       - Tính toán chuỗi dữ liệu 7 ngày lùi từ hôm nay (`trendData`) và lọc danh sách thẻ sắp hết hạn trong 7 ngày hoặc còn ≤ 2 buổi tập.
       - Khối Giao dịch thu ngân mới nhất: Hiển thị mã hóa đơn `INV-...`, tên hội viên (link sang hồ sơ 360°), gói tập, phương thức thanh toán, số tiền VNĐ và thời gian.
       - Khối Cảnh báo thẻ sắp hết hạn cần CSKH: Hiển thị tên hội viên, SĐT, gói tập, số ngày/buổi còn lại kèm nút dẫn thẳng vào Hồ sơ 360° để gia hạn.
  3. Kiểm định toàn diện cơ sở dữ liệu và bảo mật qua Supabase MCP (`P06-T02`):
     - Xác nhận 100% 19/19 bảng cơ sở dữ liệu trên Supabase Cloud (`exaqbivhxcozongfdhch`) đã bật RLS (`rowsecurity = true`).
     - Thu hồi quyền thực thi từ vai trò `anon` đối với các RPCs nhạy cảm (`rpc_register_member_with_plan`, `rpc_check_in_member`, `rpc_assign_program_template`, `handle_new_auth_user`), bảo vệ tuyệt đối an toàn dữ liệu.
     - Kiểm tra toàn bộ 7 phân hệ Admin Web và ứng dụng Mobile vượt qua 100% Quality Gates: lint sạch, typecheck không lỗi, build Next.js thành công (12/12 routes static & dynamic tối ưu hóa) và toàn bộ 13/13 Jest test suites pass (54/54 tests).
  4. Hoàn tất toàn bộ 6 Phases cốt lõi của Lộ trình Tái kiến trúc GymOS v2.0 (Phase P01 đến Phase P06).
- **Files đã tạo mới & cập nhật:**
  - `apps/admin-web/src/app/dashboard/dashboard-charts.tsx`: Client Component Biểu đồ điều hành Recharts 7 ngày và thẻ phân bổ dịch vụ.
  - `apps/admin-web/src/app/dashboard/page.tsx`: Nâng cấp toàn diện Server Component trang Tổng quan điều hành.
  - `docs/mindmap.md`: Đánh dấu hoàn tất `[x] P06-T01` và `[x] P06-T02`, cập nhật con trỏ thực thi hoàn tất 6/6 Phases.


### 2026-11-05 — Kiểm Định Giao Diện & Tương Tác Tự Động Bằng Playwright MCP (E2E-PLAYWRIGHT-AUDIT: main)

- **Mục tiêu:**
  1. Khởi chạy dev server `@gym-tracker/admin-web` và cấu hình Playwright MCP với viewport chuẩn Desktop Enterprise (`1440x900`).
  2. Thực thi kiểm định tự động End-to-End toàn diện trên trình duyệt qua 7 Luồng người dùng cốt lõi (User Journeys):
     - Luồng 1 — Điều hướng gốc & Đăng nhập (`/` -> `/login` -> `/dashboard`): Tự động redirect từ `/` sang `/login`, form đăng nhập SSR an toàn, reset và xác thực thông tin tài khoản `admin@gym.com`, điều hướng trơn tru vào `/dashboard`.
     - Luồng 2 — Trung tâm chỉ huy (`/dashboard`): 4 thẻ KPI tổng quan, biểu đồ điều hành Recharts 7 ngày hỗ trợ chuyển đổi mượt mà giữa "Lưu lượng điểm danh" (BarChart) và "Doanh thu thu ngân" (AreaChart), danh sách hội viên mới, giao dịch thu ngân POS, cảnh báo thẻ tập sắp hết hạn và lối tắt ERP.
     - Luồng 3 — Quầy điểm danh thông minh (`/dashboard/check-in`): Tìm kiếm nhanh theo mã thẻ/tên, đề xuất hội viên gần nhất, thực thi điểm danh thực tế với thẻ xanh xác thực "Cho phép vào tập" và ghi nhận lịch sử vào `attendance_logs`.
     - Luồng 4 — Quản lý hội viên CRM 360° (`/dashboard/members`, `/dashboard/members/create`, `/dashboard/members/[id]`): Danh sách hội viên, form đăng ký mới không UUID, giao diện hồ sơ 360° với mã QR thật (`QRCodeSVG`), duyệt 4 tabs phân hệ (Thẻ tập, Thanh toán, Điểm danh, InBody & Giáo án).
     - Luồng 5 — Gói tập và bảng giá (`/dashboard/plans`, `/dashboard/plans/create`): Bảng danh mục gói tập, giao diện tạo gói mới kèm Live POS Preview card hiển thị thẻ xem trước trực quan cập nhật theo thời gian thực.
     - Luồng 6 — Trạm thiết kế giáo án 3 tầng (`/dashboard/workouts`): 3 Tabs Radix UI (Tầng 1 Thư viện bài tập chuẩn 12 bài, Tầng 2 Trình biên soạn giáo án mẫu Push-Pull-Legs và trình xếp bài tập chi tiết, Tầng 3 Quản lý lộ trình học viên đã giao) cùng các hộp thoại phân công và thêm bài tập riêng.
     - Luồng 7 — Quản trị doanh nghiệp (`/dashboard/branches`, `/dashboard/staff`, `/dashboard/settings`): Danh sách chi nhánh cơ sở, danh bạ nhân sự và HLV PT (3 nhân sự, phân bổ học viên), trang cài đặt khóa cứng định danh phần mềm `GymOS` và slug `/gymos`.
  3. Kiểm tra Console Log trên toàn bộ hành trình: 0 lỗi runtime/hydration, 0 cảnh báo.
  4. Vượt qua 100% Quality Gates: lint sạch toàn repo, TypeScript typecheck không lỗi trên cả admin-web và mobile, 13/13 Jest test suites pass (54/54 tests).
- **Files đã cập nhật:**
  - `.gitignore`: Bổ sung `.playwright-mcp/` vào danh mục bỏ qua kiểm soát phiên bản.
  - `docs/mindmap.md`: Ghi nhận hoàn thành kiểm định E2E Playwright trên nhánh `main`.


### 2026-11-11 — Dọn Dẹp Kho Lưu Trữ, Chuẩn Hóa Cấu Hình Monorepo & Tối Ưu Hóa Gitignore (CHORE-REPO-CLEANUP: chore/repo-cleanup-and-hygiene)

- **Mục tiêu:**
  1. Loại bỏ các tệp rác và tệp untracked/git-ignored ngoài luồng: `PROJECT_RECOVERY.md`, thư mục rỗng `scratch/`, và thư mục artifacts Playwright `.playwright-mcp/`.
  2. Gỡ bỏ các tệp dư thừa đang được Git theo dõi qua `git rm`: script template `apps/mobile/scripts/reset-project.js` và tệp chỉ dẫn trùng lặp `CLAUDE.md` (giữ lại `AGENTS.md` làm bản quy chuẩn quản trị duy nhất).
  3. Chuẩn hóa cấu hình Monorepo trong `package.json` toàn repo:
     - Root `package.json`: Tinh gọn `"workspaces": ["apps/*"]` (loại bỏ `"packages/*"` không tồn tại), bổ sung lệnh `"typecheck": "npm run typecheck --workspaces --if-present"`.
     - `apps/admin-web/package.json`: Bổ sung script `"typecheck": "tsc --noEmit"`.
     - `apps/mobile/package.json`: Bổ sung script `"typecheck": "tsc --noEmit"`.
  4. Tinh chỉnh tệp `.gitignore`: Sửa ghi chú `(apps/admin-web)`, bổ sung `playwright-report/`, `test-results/` và `scratch/`. Giữ nguyên 12 tệp migration SQL trong `supabase/migrations/` (`20261021112229`..`20261103000000`) và 8 tệp SSOT trong `docs/`.
  5. Vượt qua 100% Quality Gates: `npm run lint` (0 error, 0 warning), `npm run typecheck` (0 type error trên cả 2 workspaces), và `npm test` (Jest 13 test suites, 54 tests passed trên `apps/mobile`).
- **Files đã sửa đổi & gỡ bỏ:**
  - Xóa: `PROJECT_RECOVERY.md`, `scratch/`, `.playwright-mcp/`, `apps/mobile/scripts/reset-project.js`, `CLAUDE.md`.
  - Cập nhật: `.gitignore`, `package.json`, `apps/admin-web/package.json`, `apps/mobile/package.json`, `docs/mindmap.md`.
