# Mindmap — Unified Roadmap Triển khai Toàn diện Gym & Workout App

> **Nguồn & Căn cứ:** `docs/baocao.md` (Product Vision Baseline Candidate v1.4, Approved Scope).  
> **Phiên bản:** Unified Roadmap v1.2 (Release Gate Consistency Patch: Hoàn thiện Ranh giới Cổng Phát hành & Điểm danh).  
> **Ngày lập:** 2026-10-23.  
> **Cấu trúc thực thi:** Tích hợp 4 luồng công việc song song (Shared Platform, Gym Management, Personal Training, Workout Mobile) xuyên suốt **9 Phase** (Phase 0–8, bao gồm Post-MVP).  
> **Trạng thái phê duyệt:** Unified Roadmap v1.2 đã được đồng bộ vào `docs/mindmap.md`. Task P0.T07 đã được chủ dự án phê duyệt có điều kiện ngày 2026-10-23 (APPROVED WITH CONDITIONS). Gate P0.T08, các quyết định nghiệp vụ (`BR-PAY-01/02`, `BR-PT-02/03`, `BR-MB-02`), 3 Release Gates (`[PROPOSED]`) và 10 Task Đề xuất Bổ sung (`[PROPOSED_ADDITION]`) chưa được phê duyệt, tiếp tục giữ trạng thái `[ ]` chờ chủ dự án ký duyệt theo từng gate. Tuyệt đối không tự ý mở Phase 1.

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
   - Tuyệt đối không đổi tên mã task, không xóa, không gộp và không thay đổi trạng thái gốc: duy trì chính xác 25 tasks `[x]` và 71 tasks `[ ]` (sau khi P0.T07 được phê duyệt có điều kiện).
   - Các task mở rộng mới được gắn nhãn riêng biệt `[PROPOSED_ADDITION]`, tách biệt hoàn toàn khỏi baseline 96 task gốc.
4. **Cấu trúc 4 Luồng Công việc (Workstreams):**
   - **Track 1: Shared Platform & Backend (`SP`):** Nền tảng Monorepo, Supabase Auth, DDL Schemas GM-1..5, RLS Policies, Mutation Gateway/RPC.
   - **Track 2: Gym Management Web Portal (`GM`):** Next.js App Router Admin Web, Quản lý Chi nhánh, Nhân viên, Hội viên, Gói tập, Check-in quầy, Thu phí & Báo cáo đối soát ca.
   - **Track 3: Personal Training Subsystem (`PT`):** Lịch hẹn PT, Phân công Trainer, Khấu trừ buổi tập 2 chiều (`BR-PT-02`), Chia sẻ dữ liệu tập luyện tuân thủ Consent Model & Health Minimization (`BR-PT-03`).
   - **Track 4: Workout Mobile App (`WM`):** Mobile Foundation (SDK 57, Design System v1, SQLite v1), Mobile Core Workouts (Offline-First CRUD, Session, RestTimer, History/Stats), Gym Member Mode (Thẻ hội viên, QR check-in) và Cloud Sync Outbox.

---

## 2. CHI TIẾT 9 PHASE (PHASE 0–8) VÀ MA TRẬN PHỤ THUỘC KỸ THUẬT

### PHASE 0 — REQUIREMENTS & ARCHITECTURE
*Mục tiêu: Phân tích, thiết kế, chuẩn hóa tài liệu và thẩm định kiến trúc; không có code hay migration.*

- [x] **P0.T01** `[Track: SP]` — Kiểm kê trạng thái dự án hiện tại (đã triển khai vs. thiết kế).  
  *Tham chiếu: Toàn bộ docs/ hiện tại.*
- [x] **P0.T02** `[Track: SP]` — Thiết kế mô hình multi-tenant và RBAC.  
  *Tham chiếu: `docs/multi-tenancy.md`.*
- [x] **P0.T03** `[Track: GM]` — Đặc tả module gym management, member, membership, attendance, payments.  
  *Tham chiếu: `docs/gym-management.md`, `docs/member-management.md`, `docs/membership.md`, `docs/attendance.md`, `docs/payments.md`.*
- [x] **P0.T04** `[Track: SP]` — Thiết kế kiến trúc mobile/web/backend.  
  *Tham chiếu: `docs/architecture.md`, `docs/admin-web.md`.*
- [x] **P0.T05** `[Track: SP]` — Ghi nhận rủi ro và quyết định còn mở.  
  *Tham chiếu: `docs/risks-decisions.md`.*
- [x] **P0.T06** `[Track: WM]` — Cập nhật requirements, testing-acceptance, auth, schema và offline docs.  
  *Tham chiếu: `docs/requirements.md`, `docs/testing-acceptance.md`, `docs/auth.md`, `docs/supabase-schema.md`, `docs/data-offline.md`.*
- [x] **P0.T07** `[Track: SP]` — **Phê duyệt kiến trúc mới (D-MT-01 Monorepo npm workspaces, D-MT-02 Next.js App Router, D-MT-03 Supabase SSR Server-First httpOnly cookie, D-MT-04 Edge Functions + RPC least privilege, D-MT-11 Multi-branch staff assignment).**  
  *Trạng thái: APPROVED WITH CONDITIONS (Chủ dự án phê duyệt có điều kiện ngày 2026-10-23; tuân thủ 5 điều kiện AC-P0T07-01..05 và 3 Owner Decisions OD-01=A, OD-02=A, OD-03=A; không phải quyền triển khai hệ thống hay mở Phase 1).*  
  *Tham chiếu: `docs/risks-decisions.md`, `docs/architecture.md`, `docs/admin-web.md`, `docs/auth.md`.*
- [ ] **P0.T08** `[Track: SP]` — **Chốt schema gym management tables và thứ tự migration (GM-1: `gyms`, `branches`, `gym_staff` với Composite FK `(branch_id, gym_id)` sử dụng `ON DELETE RESTRICT` bảo vệ audit trail, chuẩn hóa `branches.status TEXT CHECK (status IN ('active', 'suspended', 'archived'))`, soft-deactivation `status = 'archived'`, 2 partial unique indexes, RLS fail-closed ngay khi tạo bảng trong Atomic Transactions `BEGIN...COMMIT`, helper functions kiểm tra `gyms.status = 'active'`, cơ chế Owner khi suspended chỉ đọc trạng thái và gọi RPC gia hạn, và thứ tự migration 5 bước cùng kịch bản rollback nghịch đảo).**  
  *Thiết kế kỹ thuật DDL, security model, atomic fail-closed migration và rollback đã hoàn tất; trạng thái PROPOSED — chờ chủ dự án phê duyệt chính thức (giữ nguyên [ ], không tự đánh dấu hoàn thành).*  
  *Tham chiếu: `docs/supabase-schema.md`, `docs/multi-tenancy.md`, `docs/gym-management.md`.*

> **Điều kiện hoàn thành Phase 0 (Phase 0 Review Gate):** `P0.T07`–`T08` được chủ dự án phê duyệt chính thức; tài liệu kiến trúc nhất quán và không có blocker chưa ghi nhận.  
> **Phụ thuộc:** `P0` phải hoàn thành trước khi bắt đầu Phase 1.

---

### PHASE 1 — MULTI-TENANT AUTHENTICATION & RBAC FOUNDATION
*Mục tiêu: Mở rộng Auth hiện tại để hỗ trợ gym roles; thiết lập nền tảng RBAC.*

- [ ] **P1.T01** `[Track: SP]` — Thiết kế và review schema `gyms`, `branches`, `gym_staff`.  
  *Tham chiếu: `docs/gym-management.md`, `docs/multi-tenancy.md`, `docs/supabase-schema.md`.*
- [ ] **P1.T02** `[Track: SP]` — Chuẩn bị migration GM-1 (`gyms`, `branches`, `gym_staff`).  
  *Tham chiếu: `docs/supabase-schema.md` — nhóm GM-1.*
- [ ] **P1.T03** `[Track: SP]` — Thiết kế và review RLS cho gym/branch tables.  
  *Tham chiếu: `docs/multi-tenancy.md`, `docs/auth.md`.*
- [ ] **P1.T04** `[Track: SP]` — Thiết kế staff invite flow (Supabase invite vs. custom token).  
  *Tham chiếu: `docs/auth.md`, `docs/risks-decisions.md` D-MT-04.*
- [ ] **P1.T05** `[Track: GM]` — Thiết kế Admin Web auth (session, middleware, role lookup).  
  *Tham chiếu: `docs/admin-web.md`, `docs/auth.md`.*
- [ ] **P1.T06** `[Track: SP]` — Kiểm thử RBAC: MT-01–05, RBAC-01–12 (xem `testing-acceptance.md`).  
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

> **Điều kiện hoàn thành:** RBAC test matrix (MT, RBAC) pass; staff invite hoạt động; Admin Web auth hoạt động.  
> **Phụ thuộc:** `P0.T07`–`T08` approved; mutation gateway đã có thiết kế được duyệt.

---

### PHASE 2 — GYM & BRANCH MANAGEMENT & MOBILE CORE WORKOUTS
*Mục tiêu: Admin Web có thể tạo gym, branch và quản lý nhân viên; Mobile client triển khai Thư viện bài tập offline.*

- [ ] **P2.T01** `[Track: GM]` — Khởi tạo Admin Web project (Next.js theo D-MT-02).  
  *Tham chiếu: `docs/admin-web.md`, `docs/risks-decisions.md` D-MT-02.*
- [ ] **P2.T02** `[Track: GM]` — Giao diện tạo gym và onboarding owner.  
  *Tham chiếu: `docs/gym-management.md`.*
- [ ] **P2.T03** `[Track: GM]` — Giao diện quản lý branch.  
  *Tham chiếu: `docs/gym-management.md`.*
- [ ] **P2.T04** `[Track: GM]` — Giao diện mời và quản lý nhân viên.  
  *Tham chiếu: `docs/gym-management.md`.*
- [ ] **P2.T05** `[Track: GM]` — Integration test: FR-GM-01 đến FR-GM-05.  
  *Tham chiếu: `docs/requirements.md`.*
- *(Tiến độ Mobile Core song song — FIX-R02 & FIX-F01)*:
  - [x] **Phase 3.T01** `[Track: WM]` — Thiết kế schema SQLite, migration và repository (Schema v1 6 bảng và repositories hoạt động).
  - [ ] **Phase 3.T04** `[Track: WM]` — Tạo thư viện bài tập: danh sách, tìm kiếm, lọc, chi tiết (hoạt động 100% ngoại tuyến trên SQLite).  
    *Tham chiếu: `docs/tech-stack.md`, `docs/screens-ux.md`.*

> **Điều kiện hoàn thành:** FR-GM-01–05 nghiệm thu; không cross-tenant leak; thư viện bài tập mobile offline hoàn thành.  
> **Phụ thuộc:** Phase 1 hoàn thành; Phase 3.T01 đã có sẵn.

---

### PHASE 3 — MEMBER MANAGEMENT, MOBILE AUTH & ACCOUNT LINKING
*Mục tiêu: Admin Web quản lý hội viên; triển khai Mobile Authentication cơ bản; liên kết tài khoản an toàn qua OTP.*

- [ ] **P3.T01** `[Track: SP]` — Schema `gym_members`; migration GM-2.  
  *Tham chiếu: `docs/member-management.md`, `docs/supabase-schema.md`.*
- [ ] **P3.T02** `[Track: GM]` — Admin Web: tạo, tìm kiếm, sửa hồ sơ hội viên walk-in.  
  *Tham chiếu: `docs/member-management.md`.*
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
  *Tham chiếu: `docs/requirements.md`, `docs/tech-stack.md`, `docs/auth.md`.*
- [ ] **Phase 3.T03** `[Track: WM — FIX-F01]` — **Tạo hồ sơ và onboarding trên mobile**.  
  *Tham chiếu: `docs/requirements.md`.*
- [ ] **P3.T03** `[Track: SP & WM]` — Luồng liên kết tài khoản Supabase Auth xác minh OTP (ngăn chặn chiếm quyền, chống ghi đè tài khoản).  
  *Tham chiếu: `docs/member-management.md`, `docs/auth.md`.*
- [ ] **P3.T04** `[Track: WM]` — Mobile app: xem profile và lịch sử hội viên của mình (Gym Member Mode cơ bản).  
  *Tham chiếu: `docs/member-management.md`.*
- [ ] **P3.T05** `[Track: GM & SP]` — Test matrix FR-MB-01–05, kiểm tra cờ rà soát hồ sơ trùng lặp (Review Flag, không archive dữ liệu tài chính theo ALIGN-01).  
  *Tham chiếu: `docs/requirements.md`, `docs/testing-acceptance.md`.*
- [ ] **Phase 3.T05** `[Track: WM]` — Tạo kế hoạch: CRUD, thứ tự bài tập, cấu hình hiệp/reps/nghỉ (Offline-First trên SQLite).  
  *Tham chiếu: `docs/tech-stack.md`, `docs/data-offline.md`.*
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
  *Tham chiếu: `docs/membership.md`, `docs/supabase-schema.md`.*
- [ ] **P4.T02** `[Track: GM]` — Admin Web: danh mục gói, đăng ký, gia hạn, tạm dừng/hủy gói.  
  *Tham chiếu: `docs/membership.md`.*
- [ ] **P4.T03** `[Track: SP]` — Schema `attendance_logs`; migration GM-4.  
  *Tham chiếu: `docs/attendance.md`, `docs/supabase-schema.md`.*
- [ ] **P4.T04** `[Track: GM — FIX-11]` — **Admin Web: check-in thủ công với validation đầy đủ**. *(Bảo toàn 100% phạm vi gốc: Tiếp tân tra cứu hội viên theo số điện thoại/họ tên/mã trên Admin Web và nhấn nút Check-in; động cơ 6 bước xác thực gói tập, chi nhánh, nợ phí trong < 500ms. Đây là phương thức điểm danh bắt buộc tối thiểu của Gym MVP)*.  
  *Tham chiếu: `docs/attendance.md`.*
- [ ] **P4.T05** `[Track: GM & SP]` — Test matrix MS-01–05, CI-01–07 (concurrent check-in pass, chặn thao tác lặp 15 phút).  
  *Tham chiếu: `docs/testing-acceptance.md`.*
- [ ] **P4.T06** `[Track: WM]` — **Mobile app: hội viên xem gói tập và lịch check-in của mình**. *(Bảo toàn 100% nguyên văn mô tả gốc. Ghi chú phạm vi mở rộng: Khi phát triển màn hình thẻ hội viên, hiển thị thêm mã QR check-in cá nhân để hỗ trợ quét tại quầy nếu P4.T09 được phê duyệt)*.  
  *Tham chiếu: `docs/membership.md`, `docs/member-management.md`.*
- [ ] **P4.T07** `[Track: SP — PROPOSED_ADDITION]` — Triển khai Schema Payment Core Tối thiểu `GM-3b` (bảng `payment_transactions` tối thiểu lưu `amount BIGINT` VND, `idempotency_key`, trạng thái `completed`).  
  *Tham chiếu: `docs/payments.md`, `docs/baocao.md` Mục 5.1 & 7.2.*
- [ ] **P4.T08** `[Track: GM — PROPOSED_ADDITION]` — Ghi nhận Thu phí & Kích hoạt Gói tập (Tiếp tân thu tiền mặt/POS, chuyển trạng thái gói sang `active` theo chính sách thanh toán đủ 100%).  
  *Tham chiếu: `docs/payments.md`, `docs/membership.md`.*
- [ ] **P4.T09** `[Track: GM — PROPOSED_ADDITION — FIX-11]` — **Admin Web: Quét mã QR hội viên tại quầy bằng Camera/Webcam hoặc máy quét mã vạch 2D (Desk QR Scanner)**:  
  - *Mục tiêu:* Mở rộng khả năng check-in tại quầy bằng cách quét mã QR hiển thị từ ứng dụng di động của hội viên (`P4.T06`) thay vì nhập tay.  
  - *Phân biệt rõ 3 phương thức điểm danh:*  
    1. Check-in thủ công (`P4.T04`): Tiếp tân tra cứu và nhấn nút trên Admin Web (Bắt buộc tối thiểu trong Gym MVP).  
    2. Quét QR tại quầy (`P4.T09`): Tiếp tân dùng camera máy tính hoặc máy quét 2D USB giải mã QR của hội viên (Đề xuất tùy chọn cho Gym MVP).  
    3. Cổng kiểm soát phần cứng mã QR động (`P8.T06`): Cổng xoay turnstile tự động tích hợp đầu đọc quang học và chip IoT giải mã TOTP QR (Phạm vi Hậu MVP Phase 8).  
  - *Tiêu chí nghiệm thu:* Quét và giải mã QR thành công trong < 300ms; tự động gọi động cơ xác thực 6 bước; phản hồi âm thanh/hình ảnh khi thành công hoặc bị từ chối; xử lý cấp quyền camera an toàn.  
  - *Trạng thái đề xuất:* `[PROPOSED]` — Chờ Chủ dự án phê duyệt lựa chọn: Lựa chọn A (Bổ sung vào Gym MVP để hoàn thiện trải nghiệm check-in QR liền mạch) hoặc Lựa chọn B (Chỉ giữ check-in thủ công P4.T04 cho MVP, hoãn quét QR tại quầy).  
  *Phụ thuộc:* `P4.T03`, `P4.T04`, `P4.T06`.  
  *Tham chiếu: `docs/attendance.md`, `docs/baocao.md` Mục 7.4.*
- *(Tiến độ Mobile Core song song — Phase 4 cũ)*:
  - [ ] **Phase 4.T01** `[Track: WM]` — Bắt đầu/tạm dừng/tiếp tục/kết thúc buổi tập.
  - [ ] **Phase 4.T02** `[Track: WM]` — Ghi nhận và xác thực hiệp, mức tạ, số lần lặp.
  - [ ] **Phase 4.T03** `[Track: WM]` — Tạo RestTimer theo timestamp kết thúc dự kiến.
  - [ ] **Phase 4.T04** `[Track: WM]` — Tự động lưu vào SQLite và khôi phục khi mở lại.
  - [ ] **Phase 4.T05** `[Track: WM]` — Tạo màn hình tổng kết và kiểm thử chuyển nền/foreground.

> **Điều kiện hoàn thành:** FR-MS-01–05, FR-AT-01–03 nghiệm thu; CI-07 concurrent check-in pass; gói tập chỉ kích hoạt sau khi có giao dịch Payment Core `GM-3b`; luồng tập luyện di động hoạt động hoàn chỉnh ngoại tuyến.  
> **Phụ thuộc:** Phase 3; `BR-PAY-01` và `BR-PAY-02` được phê duyệt; Phase 3.T05 đã có sẵn.

---

### PHASE 5 — ADVANCED PAYMENTS, REPORTING & GYM MVP RELEASE GATE
*Mục tiêu: Ghi nhận thanh toán nâng cao, công nợ, hoàn tiền có kiểm toán, đối soát ca; hoàn thiện Mobile Core History/Stats; sẵn sàng hạ tầng production cho Gym MVP.*

- [ ] **P5.T01** `[Track: SP]` — **Chốt đơn vị tiền tệ và idempotency design (`risks-decisions.md` D-MT-05)**. *(Bảo toàn 100% nguyên văn mô tả gốc. Làm rõ: BR-PAY-01 chính sách thanh toán 100% và BR-PAY-02 đơn vị tiền tệ VND đã là điều kiện tiên quyết được phê duyệt trước Phase 4 GM-3b; tại Phase 5, P5.T01 kế thừa và tập trung chuẩn hóa idempotency cho hoàn tiền nâng cao, xử lý lệch ca và mở rộng kế toán)*.  
  *Tham chiếu: `docs/payments.md`, `docs/risks-decisions.md`.*
- [ ] **P5.T02** `[Track: SP]` — Schema `payment_transactions` mở rộng (công nợ, refund audit trail); migration GM-5.  
  *Tham chiếu: `docs/payments.md`, `docs/supabase-schema.md`.*
- [ ] **P5.T03** `[Track: GM]` — Admin Web: ghi nhận và xem lịch sử giao dịch (quản lý công nợ, trạng thái nợ).  
  *Tham chiếu: `docs/payments.md`.*
- [ ] **P5.T04** `[Track: GM]` — Admin Web: hoàn tiền độc lập với điều chỉnh gói tập kèm audit trail.  
  *Tham chiếu: `docs/payments.md`.*
- [ ] **P5.T05** `[Track: GM]` — Admin Web: báo cáo doanh thu ca và đối soát tiền mặt chi nhánh cuối ngày.  
  *Tham chiếu: `docs/payments.md`.*
- [ ] **P5.T06** `[Track: GM & SP]` — Test matrix PY-01–07 (idempotency, chống thu tiền kép).  
  *Tham chiếu: `docs/testing-acceptance.md`.*
- *(Tiến độ Mobile Core Lịch sử & Thống kê — FIX-F02: Thực thi tập trung DUY NHẤT tại Phase 5)*:
  - [ ] **Phase 5.T01** `[Track: WM]` — Danh sách và chi tiết lịch sử buổi tập (SQLite).
  - [ ] **Phase 5.T02** `[Track: WM]` — Xác định công thức, đơn vị và dữ liệu hợp lệ cho thống kê.
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
  *Tham chiếu: `docs/multi-tenancy.md`, `docs/supabase-schema.md`.*
- [ ] **P6.T03** `[Track: GM — FIX-F05]` — Admin Web: lịch PT và phân công trainer (bàn giao học viên, thu hồi quyền trainer cũ tức thì). *(Phụ thuộc P6.T02, KHÔNG phụ thuộc Workout Cloud Sync)*.
- [ ] **P6.T04** `[Track: WM — FIX-F05]` — Mobile app: hội viên đặt lịch PT, xem lịch, xác nhận tiêu thụ buổi tập (xác thực 2 chiều `BR-PT-02`). *(Phụ thuộc P6.T02 & P6.T03, KHÔNG phụ thuộc Workout Cloud Sync)*.
- [ ] **P6.T05** `[Track: SP & PT — FIX-F05]` — **RLS cho Trainer xem Workout Data của Member (PT Workout Data Sharing)**:  
  *ĐÂY LÀ PHẦN DUY NHẤT CỦA PT PHỤ THUỘC VÀO:*  
  1. Dữ liệu tập luyện của hội viên đã đồng bộ lên Supabase Cloud (`P6.T01a/b`).  
  2. Hội viên cấp quyền chia sẻ qua **Mô hình Chấp thuận (Consent Model `BR-PT-03`)**; tuân thủ Health Data Minimization (nghiêm cấm thu thập bệnh lý).  
  *Tham chiếu: `docs/multi-tenancy.md`, `docs/testing-acceptance.md` RBAC-08–09.*
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
  *Tham chiếu: `docs/requirements.md`.*
- [ ] **Phase 8.T02** `[Track: SP & WM]` — Đồng bộ đa thiết bị và giải quyết xung đột nâng cao.  
  *Tham chiếu: `docs/data-offline.md`.*
- [ ] **Phase 8.T03** `[Track: WM]` — Tích hợp dữ liệu sức khỏe/thiết bị ngoài (Apple HealthKit / Google Health Connect).  
  *Tham chiếu: `docs/tech-stack.md`.*
- [ ] **Phase 8.T04** `[Track: WM]` — Cá nhân hóa kế hoạch và phân tích phục hồi nâng cao.  
  *Tham chiếu: `docs/requirements.md`.*
- [ ] **P8.T05** `[Track: GM & SP — PROPOSED_ADDITION — FIX-09]` — **Sáp nhập Hồ sơ Hội viên Nâng cao (`BR-MB-02`: DEFERRED từ Phase 3)**:
  - **Hiệu chỉnh Phụ thuộc (Dependencies):** Loại bỏ hoàn toàn sự phụ thuộc không có căn cứ vào `Phase 8.T02`. Dependency kỹ thuật và nghiệp vụ chính xác bao gồm: `P3.T01/02/05` (quản lý hồ sơ hội viên & rà soát trùng), `P4.T01` (gói tập), `P5.T02` (giao dịch thanh toán) và phê duyệt chính sách nghiệp vụ `BR-MB-02`.
  - **Nguyên tắc An toàn Dữ liệu (Data Safety Invariant):**
    1. *Tuyệt đối không xóa vật lý (Zero Hard Delete):* Không bao giờ thực hiện DELETE vật lý trên bảng `gym_members`.
    2. *Bảo toàn lịch sử tài chính & điểm danh:* Giữ nguyên vẹn toàn bộ audit trail của `payment_transactions`, `attendance_logs` và `memberships`.
    3. *Cơ chế liên kết:* Thiết lập con trỏ chuyển tiếp `merged_into_id` trỏ về hồ sơ chính, chuyển đổi trạng thái hồ sơ phụ sang `merged_archived` và gộp quyền lợi gói tập theo chính sách `BR-MB-02`.  
  *Tham chiếu: `docs/member-management.md`, `docs/baocao.md` Mục 2.7 & 9.*
- [ ] **P8.T06** `[Track: GM & WM — PROPOSED_ADDITION]` — Điểm danh bằng phần cứng mã QR động (Dynamic QR Hardware Token).
- [ ] **P8.T07** `[Track: GM & SP — PROPOSED_ADDITION]` — Tích hợp cổng thanh toán trực tuyến tự động (Online Payment Gateways / Webhooks).

---

## 3. TASK MAPPING INTEGRITY REPORT & AUDIT MATRIX

### 3.1. Báo cáo Kiểm toán Tính Toàn vẹn (Audit Summary)
- **Tổng số Task ID gốc trong `docs/mindmap.md`:** **96 tasks**.
  - Phần 1 (Roadmap Workout Mobile cũ): 48 tasks (18 `[x]`, 30 `[ ]`).
  - Phần 2 (Roadmap Multi-Tenant mới): 48 tasks (6 `[x]`, 42 `[ ]`).
- **Missing IDs:** **0** (100% task gốc có mặt trong bảng mapping).
- **Duplicate IDs:** **0** (Mỗi task gốc xuất hiện duy nhất 1 dòng).
- **Changed Statuses:** **0** (100% task giữ nguyên trạng thái gốc: 24 tasks `[x]`, 72 tasks `[ ]`).
- **Proposed Additions:** **10 tasks** (Được gắn nhãn `PROPOSED_ADDITION` riêng biệt: P4.T07, P4.T08, P4.T09, P5.T07, P5.T08, P5.T09, P5.T10, P8.T05, P8.T06, P8.T07; hoàn toàn tách biệt khỏi baseline 96 task gốc đã duyệt).

### 3.2. Bảng Đối chiếu Toàn bộ 96 Task Gốc (8 Cột Bắt Buộc)

| Original Task ID | Original Description | Original Status | Evidence / Historical Context | Proposed New Phase | Proposed New Track | Dependency | Change Type |
|---|---|:---:|---|:---:|:---:|---|---|
| **Phase 1.T01** | Chốt phạm vi MVP, luồng người dùng và màn hình | `[x]` | `requirements.md`, `screens-ux.md` | Phase 1 | `WM` | None | `PRESERVED_HISTORICAL` |
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
| **Phase 3.T04** | Tạo thư viện bài tập: danh sách, tìm kiếm, lọc, chi tiết | `[ ]` | SQLite repo có sẵn; chưa có UI | Phase 2 | `WM` | Phase 3.T01 | `DECOUPLED_PARALLEL` |
| **Phase 3.T05** | Tạo kế hoạch: CRUD, thứ tự bài tập, cấu hình hiệp/reps/nghỉ | `[ ]` | SQLite repo có sẵn; chưa có UI | Phase 3 | `WM` | Phase 3.T04 | `DECOUPLED_PARALLEL` |
| **Phase 3.T06** | Chốt hợp đồng dữ liệu Supabase PostgreSQL–SQLite và các quy tắc đồng bộ còn mở | `[x]` | `docs/data-offline.md`, `risks-decisions.md` | Phase 3 | `SP` | Phase 3.T01 | `PRESERVED_HISTORICAL` |
| **Phase 3.T07** | Thiết kế PostgreSQL schema và chiến lược migrations cho dữ liệu người dùng, bài tập, kế hoạch và buổi tập | `[x]` | `docs/supabase-schema.md` (2026-10-21) | Phase 3 | `SP` | Phase 3.T06 | `PRESERVED_HISTORICAL` |
| **Phase 3.T08** | Thiết kế RLS, grants và indexes cho mọi bảng được expose | `[x]` | `docs/supabase-schema.md` (2026-10-21) | Phase 3 | `SP` | Phase 3.T07 | `PRESERVED_HISTORICAL` |
| **Phase 3.T09** | Thiết kế SQLite migration tương thích UUID và đơn vị cân nặng số nguyên, kèm sync outbox | `[x]` | `docs/data-offline.md` (2026-10-21) | Phase 3 | `WM` | Phase 3.T06 | `PRESERVED_HISTORICAL` |
| **Phase 3.T10** | Xây dựng kế hoạch kiểm thử schema, chuyển đổi cân nặng, RLS và cách ly dữ liệu đa tài khoản | `[x]` | `docs/testing-acceptance.md` (2026-10-21) | Phase 3 | `SP` | Phase 3.T07-09 | `PRESERVED_HISTORICAL` |
| **Phase 3.T11** | Review và xác nhận hợp đồng/schema trước khi cho phép triển khai migrations hoặc sync | `[x]` | `docs/risks-decisions.md` (2026-10-21) | Phase 3 | `SP` | Phase 3.T10 | `PRESERVED_HISTORICAL` |
| **Phase 3.T12** | Chuẩn bị PostgreSQL Core Schema Migration v1 theo phê duyệt có điều kiện; chỉ tạo migration files và cập nhật kế hoạch kiểm thử/rollback | `[x]` | `supabase/migrations/` (4 files prepared 2026-10-21) | Phase 3 | `SP` | Phase 3.T11 | `PRESERVED_HISTORICAL` |
| **Phase 3.T13** | Kiểm thử core migration trên Supabase local disposable sau khi xác minh môi trường an toàn | `[ ]` | BLOCKED (thiếu Docker/CLI; unblocking bằng Docker local hoặc Supabase test project riêng biệt) | Phase 6 | `SP` | Phase 3.T12 | `PRESERVED_BLOCKED` |
| **Phase 4.T01** | Bắt đầu/tạm dừng/tiếp tục/kết thúc buổi tập | `[ ]` | Chưa triển khai trên mobile | Phase 4 | `WM` | Phase 3.T05 | `DECOUPLED_PARALLEL` |
| **Phase 4.T02** | Ghi nhận và xác thực hiệp, mức tạ, số lần lặp | `[ ]` | Chưa triển khai trên mobile | Phase 4 | `WM` | Phase 4.T01 | `DECOUPLED_PARALLEL` |
| **Phase 4.T03** | Tạo RestTimer theo timestamp kết thúc dự kiến | `[ ]` | Logic timestamp đã đặc tả; chưa viết code | Phase 4 | `WM` | Phase 4.T01 | `DECOUPLED_PARALLEL` |
| **Phase 4.T04** | Tự động lưu vào SQLite và khôi phục khi mở lại | `[ ]` | SQLite schema hỗ trợ; chưa gắn handler | Phase 4 | `WM` | Phase 4.T02 | `DECOUPLED_PARALLEL` |
| **Phase 4.T05** | Tạo màn hình tổng kết và kiểm thử chuyển nền/foreground | `[ ]` | Chưa triển khai | Phase 4 | `WM` | Phase 4.T04 | `DECOUPLED_PARALLEL` |
| **Phase 5.T01** | Danh sách và chi tiết lịch sử buổi tập | `[ ]` | SQLite schema hỗ trợ; chưa có UI | Phase 5 | `WM` | Phase 4.T05 | `DECOUPLED_PARALLEL` |
| **Phase 5.T02** | Xác định công thức, đơn vị và dữ liệu hợp lệ cho thống kê | `[ ]` | Đã đặc tả volume = weight × reps | Phase 5 | `WM` | Phase 5.T01 | `DECOUPLED_PARALLEL` |
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
| **P0.T02** | Thiết kế mô hình multi-tenant và RBAC | `[x]` | `docs/multi-tenancy.md` | Phase 0 | `SP` | P0.T01 | `PRESERVED_HISTORICAL` |
| **P0.T03** | Đặc tả module gym management, member, membership, attendance, payments | `[x]` | 5 module docs dưới `docs/` | Phase 0 | `GM` | P0.T02 | `PRESERVED_HISTORICAL` |
| **P0.T04** | Thiết kế kiến trúc mobile/web/backend | `[x]` | `docs/architecture.md`, `docs/admin-web.md` | Phase 0 | `SP` | P0.T02 | `PRESERVED_HISTORICAL` |
| **P0.T05** | Ghi nhận rủi ro và quyết định còn mở | `[x]` | `docs/risks-decisions.md` (R-MT-01..14) | Phase 0 | `SP` | P0.T01-04 | `PRESERVED_HISTORICAL` |
| **P0.T06** | Cập nhật requirements, testing-acceptance, auth, schema và offline docs | `[x]` | Các file docs cập nhật đồng bộ | Phase 0 | `WM` | P0.T05 | `PRESERVED_HISTORICAL` |
| **P0.T07** | Phê duyệt kiến trúc mới (D-MT-01..04, D-MT-11) | `[x]` | APPROVED WITH CONDITIONS (2026-10-23); các điều kiện AC-P0T07-01..05 vẫn phải được kiểm chứng tại các task tương ứng. | Phase 0 | `SP` | P0.T01-06 | `PRESERVED_GATE` |
| **P0.T08** | Chốt schema gym management tables và thứ tự migration (GM-1...) | `[ ]` | DDL & rollback hoàn tất; trạng thái PROPOSED | Phase 0 | `SP` | P0.T07 | `PRESERVED_GATE` |
| **P1.T01** | Thiết kế và review schema gyms, branches, gym_staff | `[ ]` | Chưa bắt đầu | Phase 1 | `SP` | P0.T07-08 | `PRESERVED_ACTIVE` |
| **P1.T02** | Chuẩn bị migration GM-1 (gyms, branches, gym_staff) | `[ ]` | Chưa bắt đầu | Phase 1 | `SP` | P1.T01 | `PRESERVED_ACTIVE` |
| **P1.T03** | Thiết kế và review RLS cho gym/branch tables | `[ ]` | Chưa bắt đầu | Phase 1 | `SP` | P1.T02 | `PRESERVED_ACTIVE` |
| **P1.T04** | Thiết kế staff invite flow (Supabase invite vs. custom) | `[ ]` | Chưa bắt đầu | Phase 1 | `SP` | P1.T03 | `PRESERVED_ACTIVE` |
| **P1.T05** | Thiết kế Admin Web auth (session, middleware, role lookup) | `[ ]` | Chưa bắt đầu | Phase 1 | `GM` | P1.T03 | `PRESERVED_ACTIVE` |
| **P1.T06** | Kiểm thử RBAC: MT-01–05, RBAC-01–12 | `[ ]` | Chưa bắt đầu | Phase 1 | `SP` | P1.T04-05 | `PRESERVED_ACTIVE` |
| **P2.T01** | Khởi tạo Admin Web project (Next.js hoặc framework đã chốt) | `[ ]` | Chưa bắt đầu | Phase 2 | `GM` | Phase 1 Hoàn tất | `PRESERVED_ACTIVE` |
| **P2.T02** | Giao diện tạo gym và onboarding owner | `[ ]` | Chưa bắt đầu | Phase 2 | `GM` | P2.T01 | `PRESERVED_ACTIVE` |
| **P2.T03** | Giao diện quản lý branch | `[ ]` | Chưa bắt đầu | Phase 2 | `GM` | P2.T02 | `PRESERVED_ACTIVE` |
| **P2.T04** | Giao diện mời và quản lý nhân viên | `[ ]` | Chưa bắt đầu | Phase 2 | `GM` | P2.T03 | `PRESERVED_ACTIVE` |
| **P2.T05** | Integration test: FR-GM-01 đến FR-GM-05 | `[ ]` | Chưa bắt đầu | Phase 2 | `GM` | P2.T04 | `PRESERVED_ACTIVE` |
| **P3.T01** | Schema gym_members; migration GM-2 | `[ ]` | Chưa bắt đầu | Phase 3 | `SP` | Phase 2 Hoàn tất | `PRESERVED_ACTIVE` |
| **P3.T02** | Admin Web: tạo, tìm kiếm, sửa hồ sơ hội viên | `[ ]` | Chưa bắt đầu | Phase 3 | `GM` | P3.T01 | `PRESERVED_ACTIVE` |
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

## 4. BẢNG TÀI LIỆU CHUẨN

| Tài liệu | Vai trò |
|---|---|
| `requirements.md` | Phạm vi, FR và NFR cho cả Workout Mobile và Multi-Tenant Gym Management |
| `architecture.md` | Kiến trúc mobile/web/backend/shared và ranh giới module |
| `multi-tenancy.md` | Mô hình tenant, cấu trúc multi-branch, RBAC và permission matrix |
| `gym-management.md` | Đặc tả module gym, branch và quản lý nhân sự |
| `member-management.md` | Đặc tả module hồ sơ hội viên, liên kết tài khoản và rà soát trùng |
| `membership.md` | Đặc tả danh mục gói tập, đăng ký, kích hoạt và thẻ hội viên |
| `attendance.md` | Đặc tả quy trình điểm danh, động cơ 6 bước và chống passback |
| `payments.md` | Đặc tả Payment Core GM-3b, thanh toán nâng cao, hoàn tiền và đối soát ca |
| `admin-web.md` | Thiết kế kiến trúc và giao diện Next.js App Router Admin Web |
| `auth.md` | Mở rộng Supabase Auth cho multi-tenant, staff invite và session |
| `supabase-schema.md` | DDL schemas GM-1..5, composite foreign keys, RLS policies và indexes |
| `data-offline.md` | Kiến trúc Offline-First, SQLite schema, UUID contract và sync outbox |
| `testing-acceptance.md` | Tiêu chí AC-01..12, AC-REL-01..07 và ma trận kiểm thử E2E-01..08 |
| `risks-decisions.md` | Danh mục quyết định kiến trúc (D-MT-01..14) và rủi ro mở |

---

## 5. NHẬT KÝ CẬP NHẬT TÀI LIỆU

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
