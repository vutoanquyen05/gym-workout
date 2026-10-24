# Kiến trúc module — Single Source of Truth

Nguồn: `baocao.md`, mục 5.

## 5. Kiến trúc module tái sử dụng

### 5.1. Nguyên tắc kiến trúc

Ứng dụng được tổ chức theo hướng **feature-based modular architecture**: mỗi module nghiệp vụ chịu trách nhiệm cho một nhóm chức năng cụ thể.

Kiến trúc tuân theo các nguyên tắc:

1. Mỗi module có trách nhiệm rõ ràng.
2. Giao diện không trực tiếp phụ thuộc vào cách lưu trữ dữ liệu.
3. Các thành phần dùng chung được đặt trong thư mục shared.
4. Tái sử dụng thông qua component, hook, service và type.
5. Các module trao đổi dữ liệu qua interface hoặc API đã xác định.
6. Tránh để module nghiệp vụ phụ thuộc vòng lẫn nhau.
7. Không đưa toàn bộ logic vào component màn hình.

### 5.2. Cấu trúc thư mục đề xuất

```text
src/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (tabs)/
│       ├── _layout.tsx
│       ├── index.tsx
│       ├── workouts.tsx
│       ├── exercises.tsx
│       ├── progress.tsx
│       └── profile.tsx
│
├── modules/
│   └── <feature>/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types/
│
├── shared/
│   ├── design-system/
│   │   ├── tokens/
│   │   ├── theme/
│   │   └── components/
│   ├── navigation/
│   ├── api-client/
│   ├── storage/
│   ├── analytics/
│   ├── validation/
│   ├── config/
│   └── testing/
│
└── types/
```

Đây là cấu trúc mục tiêu, được tạo dần khi feature bắt đầu để tránh thư mục rỗng và lớp trừu tượng chưa cần thiết. Mỗi feature chỉ tạo các thư mục con thực sự cần; module route nằm trong `src/app`, còn nghiệp vụ và component đặc thù nằm trong `src/modules/<feature>`. Component/hook dùng chung được đặt trong `src/shared` khi có nhu cầu chia sẻ thực tế. Kiểm thử dự án được đặt tại `__tests__/`; tiện ích test dùng chung chỉ đưa vào `src/shared/testing` khi được tái sử dụng.

Hiện trạng nền tảng ban đầu giữ các component, hook và token dùng chung sẵn có tại `src/components`, `src/hooks` và `src/constants`; không di chuyển chúng trong task thiết lập cấu trúc. Các feature module sẽ được thêm theo phase tương ứng.

Storage dùng chung hiện được triển khai tại `src/shared/storage/`: caller khởi tạo SQLite connection và truyền vào migration runner/repositories; module không sở hữu kết nối toàn cục, không phụ thuộc UI và không gọi backend.

Thiết kế PostgreSQL/Supabase đối ứng được ghi riêng trong `supabase-schema.md`; bốn file migration đã được chuẩn bị cho bảy bảng core nhưng chưa chạy hoặc kiểm thử bằng PostgreSQL. Auth Client/Session native đã được tích hợp trong `src/modules/auth/`; chưa có kết nối database, mutation gateway, receipts hay sync code. Việc apply vẫn chờ phê duyệt riêng; mutation gateway và receipt ledger cần được duyệt bảo mật riêng.

Kiểm thử dùng Jest với preset `jest-expo` và React Native Testing Library; test hiện hành nằm trong `__tests__/`. Lint dùng Expo flat config trong `eslint.config.js` và chạy bằng `npm run lint`.

Điều hướng hiện dùng Expo Router với root stack trong `src/app/_layout.tsx`, route mặc định chuyển vào nhóm `(tabs)`, và các layout riêng cho `(tabs)` và `(auth)`. Các tab hiện có giao diện placeholder cho đến khi module tính năng tương ứng được triển khai. Route login/register vẫn là scaffold; Auth Client/Session được mount ở root nhưng chưa có UI đăng nhập, callback, email-verification gate hoặc route guard. Các blocker profile/data-write vẫn được ghi trong `risks-decisions.md`.

`package.json`/`package-lock.json` là nguồn xác nhận dependency thực tế; các bảng công nghệ trong `tech-stack.md` có thể mô tả API dự kiến chứ không khẳng định đã cài đặt. Thư mục `android/` hiện có cục bộ nhưng bị Git ignore và không được track; native behavior phải được cấu hình qua `app.json`/config plugins, không sửa tay output này. Bốn Supabase migrations đã chuẩn bị nhưng chưa apply hoặc runtime-verified; mọi thao tác thực thi cần được phê duyệt riêng.

### 5.3. Các module nghiệp vụ

| Module | Trách nhiệm | Thành phần chính |
|---|---|---|
| `auth` | Xác thực và quản lý phiên | LoginScreen, RegisterScreen, useAuth, authService |
| `user-profile` | Quản lý hồ sơ cá nhân | ProfileScreen, ProfileForm, profileService |
| `onboarding` | Thiết lập ban đầu | OnboardingScreen, GoalSelector, onboardingService |
| `exercise-library` | Quản lý dữ liệu bài tập | ExerciseList, ExerciseCard, ExerciseFilter, exerciseService |
| `workout-plans` | Quản lý kế hoạch tập | WorkoutPlanList, PlanDetail, planService |
| `workout-session` | Xử lý buổi tập đang diễn ra | ActiveWorkoutScreen, SetLogger, RestTimer, sessionService |
| `workout-history` | Truy vấn lịch sử | WorkoutHistoryScreen, WorkoutDetail, historyService |
| `progress-tracking` | Phân tích tiến bộ | ProgressScreen, ProgressChart, progressService |
| `goals-habits` | Quản lý mục tiêu và thói quen | GoalCard, HabitTracker, goalService |
| `recovery` | Ghi nhận trạng thái phục hồi | RecoveryCheckIn, recoveryService |
| `notifications` | Lập lịch thông báo | NotificationSettings, notificationService |
| `app-settings` | Quản lý tùy chọn | SettingsScreen, ThemeSelector, settingsService |

### 5.4. Các module dùng chung

| Module | Trách nhiệm |
|---|---|
| `design-system` | Màu sắc, typography, spacing và component dùng chung |
| `navigation` | Cấu hình điều hướng và các quy tắc chuyển màn hình |
| `api-client` | Gửi yêu cầu HTTP, quản lý lỗi và chuẩn hóa phản hồi |
| `storage` | Lưu dữ liệu cục bộ, quản lý cơ sở dữ liệu và hàng đợi đồng bộ |
| `analytics` | Ghi nhận sự kiện sử dụng khi được phép |
| `validation` | Kiểm tra dữ liệu đầu vào |
| `config` | Quản lý cấu hình môi trường và các hằng số |
| `testing` | Tiện ích kiểm thử, mock và dữ liệu mẫu |

### 5.5. Phân chia trách nhiệm bên trong module

Mỗi module có thể bao gồm các thành phần sau:

- **Screens:** Màn hình giao tiếp với người dùng.
- **Components:** Thành phần giao diện đặc thù của module.
- **Hooks:** Đóng gói trạng thái và logic có thể tái sử dụng.
- **Services:** Thực hiện nghiệp vụ hoặc giao tiếp với tầng dữ liệu.
- **Types:** Khai báo kiểu dữ liệu và hợp đồng giao tiếp.
- **Validation:** Kiểm tra dữ liệu nếu module có quy tắc riêng.

Ví dụ, module `workout-session` có thể sử dụng `ActiveWorkoutScreen` để hiển thị buổi tập, `SetLogger` để nhập thông số hiệp, `useWorkoutSession` để quản lý trạng thái và `sessionService` để lưu dữ liệu.

Không phải module nào cũng cần đầy đủ tất cả thư mục. Cấu trúc nên phản ánh nhu cầu thực tế của module.

---

---

## Kiến trúc mục tiêu — Multi-Tenant Gym Management

> **Cập nhật (2026-10-23):** Phần này mô tả kiến trúc mục tiêu sau khi chuyển đổi định hướng. Toàn bộ là thiết kế; chưa có code hoặc migration. Kiến trúc hiện tại (Phase 1–3) vẫn là mobile-only React Native + Expo + SQLite như trên.

### Tổng quan kiến trúc mới

```text
┌─────────────────────────────────────────────────────────────┐
│                    Clients                                  │
│                                                             │
│  Mobile App (Expo/React Native)   Admin Web (Next.js)       │
│  - Member: workout, profile       - Owner/Manager/          │
│  - Xem gói, check-in             Receptionist: quản lý     │
└────────────────┬──────────────────────────┬────────────────┘
                 │                          │
                 └──────────┬───────────────┘
                            │
           ┌────────────────▼────────────────┐
           │         Supabase Platform        │
           │                                  │
           │  Auth (JWT, PKCE, email verify)  │
           │  PostgreSQL + RLS (multi-tenant)  │
           │  Mutation Gateway (RPC/Function)  │
           │  Storage (assets)                │
           └──────────────────────────────────┘
                            │
           ┌────────────────▼────────────────┐
           │    SQLite (Mobile - Offline)      │
           │  - Workout data (personal)        │
           │  - sync_outbox (local queue)      │
           └──────────────────────────────────┘
```

### Phân chia trách nhiệm

| Layer | Thành phần | Trách nhiệm |
|---|---|---|
| Mobile App | Expo/React Native | Giao diện member: workout, profile, gói tập của mình |
| Admin Web | Next.js App Router + TypeScript *(D-MT-02 — APPROVED WITH CONDITIONS)* | Giao diện staff: quản lý gym, hội viên, check-in, báo cáo |
| Shared | packages/shared-types | TypeScript types và contracts dùng chung (nếu monorepo) |
| Backend | Supabase Auth (SSR trên web) *(D-MT-03 — APPROVED WITH CONDITIONS)* | Xác thực, JWT, session management qua secure cookies httpOnly |
| Backend | PostgreSQL + RLS | Dữ liệu server; tenant isolation qua RLS |
| Backend | Mutation Gateway *(D-MT-04 — APPROVED WITH CONDITIONS)* | Direct Self-Authorizing RPC cho transaction ACID, Edge Functions cho orchestration |
| Local | SQLite | Dữ liệu workout offline; sync_outbox local |

### Thiết kế multi-tenant

- Mỗi gym là một tenant; phân biệt bằng `gym_id` trong mọi bảng liên quan.
- RLS kiểm tra `gym_staff`/`gym_members` để xác nhận caller thuộc tenant; **bắt buộc kiểm tra `gym_staff.status = 'active'`**.
- **Quyền hạn Owner:** Nhận diện qua `gyms.owner_id = auth.uid()` hoặc `gym_staff` role `owner` (`branch_id IS NULL`, `status = 'active'`). Owner có quyền SELECT toàn chuỗi mà không bị lọc branch.
- **Phân quyền Multi-Branch & Uniqueness (D-MT-11 — APPROVED WITH CONDITIONS):**
  - Giải quyết chuẩn SQL `NULL != NULL` bằng hai partial unique indexes trên `gym_staff`:
    1. Quyền toàn gym: `UNIQUE(gym_id, user_id) WHERE branch_id IS NULL AND status = 'active'`.
    2. Quyền chi nhánh: `UNIQUE(gym_id, branch_id, user_id) WHERE branch_id IS NOT NULL AND status = 'active'`.
  - Nhân viên phụ trách nhiều chi nhánh có nhiều records tương ứng; RLS dùng `EXISTS (...)` tự động cấp quyền.
  - Tuân thủ **Mutual Exclusivity (OD-02=A)**: Một nhân sự không thể đồng thời giữ quyền toàn gym active và quyền chi nhánh active trong cùng phòng gym. Không xóa lịch sử; phân công cũ được chuyển sang `revoked`.
- **Nguyên tắc Least Privilege & Gateway (D-MT-04 — APPROVED WITH CONDITIONS):**
  - Client tuyệt đối không có quyền DML trực tiếp trên các bảng (`REVOKE ALL`).
  - Edge Functions đảm nhận nghiệp vụ orchestration, tác vụ Admin cần thiết (như gửi lời mời nhân viên qua Supabase Auth Admin API theo OD-01=A).
  - PostgreSQL RPC đảm nhận ACID transactions với `SECURITY DEFINER` và `SET search_path = ''` (schema-qualified references). RPC tự kiểm tra authorization và tenant scope từ caller JWT (`auth.uid()`).

### Quyết định monorepo vs. tách repo (D-MT-01 — APPROVED WITH CONDITIONS)

**Monorepo bằng npm workspaces (D-MT-01 — Đã duyệt có điều kiện):**
- Sử dụng chính cơ chế `workspaces` của npm (khớp với baseline `package-lock.json` hiện tại của dự án, không cần thêm Turborepo/Nx).
- Ưu điểm: chia sẻ types, contracts; atomic changes giữa mobile và web; không thêm công cụ build ngoài npm.
- Migration: cấu trúc `apps/mobile` (từ `gym-workout`), `apps/admin-web`, `packages/shared-types`.
- **Thời điểm chuyển đổi (OD-03=A):** Thực hiện tại **Pre-Phase 2 (ngay trước `P2.T01`)**. Không di chuyển thư mục tại Phase 0 hoặc Phase 1.

> **Trạng thái phê duyệt kiến trúc (P0.T07):** Các quyết định D-MT-01, D-MT-02, D-MT-03, D-MT-04, D-MT-11 và Owner Decisions OD-01=A, OD-02=A, OD-03=A đã được Chủ dự án **PHÊ DUYỆT CÓ ĐIỀU KIỆN (APPROVED WITH CONDITIONS) ngày 2026-10-23**.  
> Việc phê duyệt này ở **cấp độ kiến trúc (Architecture Approval)**, KHÔNG đồng nghĩa với nghiệm thu triển khai (Implementation Acceptance) hay cho phép mở Phase 1. Quá trình triển khai thực tế bắt buộc tuân thủ 5 điều kiện kiểm soát `AC-P0T07-01..05` (xem chi tiết tại `risks-decisions.md`). Gate DDL GM-1 (`P0.T08`) vẫn ở trạng thái chờ thẩm định riêng (`[ ]`).

### Tác động đến kiến trúc hiện tại

- 7 bảng core SQLite và PostgreSQL **giữ nguyên**; không sửa trong Phase 0.
- `src/modules/auth/` sẽ được mở rộng để hỗ trợ role-aware sau khi schema gym-staff sẵn sàng.
- Các module workout hiện tại (SQLite) tái sử dụng được; không thay đổi ownership.
- Admin Web là ứng dụng riêng; không merge vào mobile app bundle.
- Mutation gateway (chưa triển khai) sẽ phục vụ cả mobile và admin web.
