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

Thiết kế PostgreSQL/Supabase đối ứng được ghi riêng trong `supabase-schema.md`; bốn file migration đã được chuẩn bị cho bảy bảng core nhưng chưa chạy hoặc kiểm thử bằng PostgreSQL. Chưa có kết nối database, tích hợp Auth, mutation gateway, receipts hay sync code. Việc apply vẫn chờ phê duyệt riêng; mutation gateway và receipt ledger cần được duyệt bảo mật riêng.

Kiểm thử dùng Jest với preset `jest-expo` và React Native Testing Library; test hiện hành nằm trong `__tests__/`. Lint dùng Expo flat config trong `eslint.config.js` và chạy bằng `npm run lint`.

Điều hướng hiện dùng Expo Router với root stack trong `src/app/_layout.tsx`, route mặc định chuyển vào nhóm `(tabs)`, và các layout riêng cho `(tabs)` và `(auth)`. Các tab hiện có giao diện placeholder cho đến khi module tính năng tương ứng được triển khai. Route auth chỉ là scaffold; chưa có route guard hoặc xác thực thật vì backend/auth còn blocker được ghi trong `risks-decisions.md`.

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
