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
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (tabs)/
│       ├── index.tsx
│       ├── workouts.tsx
│       ├── exercises.tsx
│       ├── progress.tsx
│       └── profile.tsx
│
├── modules/
│   ├── auth/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── user-profile/
│   ├── onboarding/
│   ├── exercise-library/
│   ├── workout-plans/
│   ├── workout-session/
│   ├── workout-history/
│   ├── progress-tracking/
│   ├── goals-habits/
│   ├── recovery/
│   ├── notifications/
│   └── app-settings/
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

Đây là cấu trúc tham khảo. Các thư mục có thể được bổ sung dần theo nhu cầu thực tế, tránh tạo quá nhiều lớp trừu tượng khi dự án còn nhỏ.

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
