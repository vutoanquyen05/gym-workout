# BÁO CÁO PHÂN TÍCH VÀ THIẾT KẾ ỨNG DỤNG TẬP LUYỆN THỂ HÌNH TRÊN DI ĐỘNG

**Tên dự án:** Ứng dụng quản lý tập luyện thể hình (Gym & Workout App)  
**Nền tảng:** iOS và Android  
**Công nghệ chính:** React Native, Expo, TypeScript  
**Định hướng thiết kế:** Mobile-first, Modular Architecture, Offline-first và Design System thống nhất

---

## MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Phân tích nhu cầu người dùng](#2-phân-tích-nhu-cầu-người-dùng)
3. [Mục tiêu và phạm vi hệ thống](#3-mục-tiêu-và-phạm-vi-hệ-thống)
4. [Yêu cầu chức năng và phi chức năng](#4-yêu-cầu-chức-năng-và-phi-chức-năng)
5. [Kiến trúc module tái sử dụng](#5-kiến-trúc-module-tái-sử-dụng)
6. [Danh sách chức năng và công nghệ React Native/Expo](#6-danh-sách-chức-năng-và-công-nghệ-react-nativeexpo)
7. [Thiết kế kiến trúc dữ liệu và hoạt động ngoại tuyến](#7-thiết-kế-kiến-trúc-dữ-liệu-và-hoạt-động-ngoại-tuyến)
8. [Thiết kế giao diện và bố cục màn hình](#8-thiết-kế-giao-diện-và-bố-cục-màn-hình)
9. [Design System và bảng phối màu](#9-design-system-và-bảng-phối-màu)
10. [Khả năng tiếp cận và trải nghiệm sử dụng](#10-khả-năng-tiếp-cận-và-trải-nghiệm-sử-dụng)
11. [Kiểm thử và tiêu chí nghiệm thu](#11-kiểm-thử-và-tiêu-chí-nghiệm-thu)
12. [Kế hoạch triển khai](#12-kế-hoạch-triển-khai)
13. [Rủi ro và phương án xử lý](#13-rủi-ro-và-phương-án-xử-lý)
14. [Kết luận](#14-kết-luận)

---

## 1. Tổng quan dự án

### 1.1. Giới thiệu

Ứng dụng quản lý tập luyện thể hình được xây dựng nhằm hỗ trợ người dùng lập kế hoạch tập luyện, tra cứu bài tập, ghi nhận kết quả từng buổi tập và theo dõi sự tiến bộ theo thời gian.

Ứng dụng hướng đến nhiều nhóm người dùng, từ người mới bắt đầu làm quen với tập luyện đến người đã có kinh nghiệm và thường xuyên theo dõi hiệu suất tập luyện. Hệ thống cần có giao diện trực quan, thao tác nhanh trên điện thoại, khả năng cá nhân hóa và cơ chế lưu trữ dữ liệu đáng tin cậy.

Dự án sử dụng React Native kết hợp Expo và TypeScript để phát triển ứng dụng đa nền tảng. Kiến trúc được tổ chức theo module nhằm tăng khả năng tái sử dụng, bảo trì, mở rộng và kiểm thử.

### 1.2. Định hướng phát triển

Các định hướng chính của dự án gồm:

- **User-centered design:** Phát triển chức năng dựa trên nhu cầu và khó khăn thực tế của người tập.
- **Modular architecture:** Chia hệ thống thành các module độc lập tương đối, có ranh giới trách nhiệm rõ ràng.
- **Reusable components:** Tái sử dụng giao diện, logic và kiểu dữ liệu ở những nơi phù hợp.
- **Offline-first:** Cho phép ghi nhận buổi tập ngay cả khi kết nối Internet không ổn định.
- **Mobile-first:** Ưu tiên trải nghiệm trên màn hình nhỏ, thao tác bằng một tay và khả năng sử dụng khi đang tập.
- **Accessibility:** Đảm bảo khả năng đọc, tương phản màu, kích thước vùng chạm và hỗ trợ phóng to chữ.
- **Maintainability:** Sử dụng TypeScript, quy ước cấu trúc thư mục và kiểm thử để giảm lỗi trong quá trình phát triển.

### 1.3. Đối tượng sử dụng

Ứng dụng phục vụ ba nhóm người dùng chính:

| Nhóm người dùng | Đặc điểm | Nhu cầu chính |
|---|---|---|
| Người mới bắt đầu | Chưa có nhiều kiến thức về bài tập và cách tổ chức buổi tập | Hướng dẫn dễ hiểu, kế hoạch đơn giản, theo dõi tiến độ |
| Người tập trung cấp | Đã có lịch tập và mục tiêu tương đối rõ ràng | Tùy chỉnh bài tập, quản lý hiệp, mức tạ, số lần lặp |
| Người tập có kinh nghiệm | Quan tâm đến hiệu suất và tính nhất quán của dữ liệu | Theo dõi thành tích cá nhân, lịch sử tập, phân tích tiến bộ |

Các nhóm trên là cơ sở để thiết kế trải nghiệm linh hoạt, không phải những phân loại cố định. Người dùng cần có khả năng tùy chỉnh ứng dụng theo mục tiêu và thói quen cá nhân.

---

## 2. Phân tích nhu cầu người dùng

### 2.1. Nhu cầu cốt lõi

Qua việc phân tích quá trình tập luyện, có thể xác định những nhu cầu chính sau:

1. Tìm kiếm và lựa chọn bài tập phù hợp.
2. Xây dựng hoặc sử dụng kế hoạch tập luyện có sẵn.
3. Ghi lại mức tạ, số lần lặp và số hiệp nhanh chóng.
4. Quản lý thời gian nghỉ giữa các hiệp.
5. Theo dõi lịch sử và sự tiến bộ.
6. Duy trì thói quen thông qua mục tiêu và nhắc nhở.
7. Sử dụng các chức năng quan trọng khi mất kết nối Internet.
8. Quản lý hồ sơ, cài đặt và dữ liệu cá nhân.

### 2.2. Những vấn đề người dùng thường gặp

| Vấn đề | Biểu hiện | Hướng giải quyết |
|---|---|---|
| Khó lựa chọn bài tập | Không biết nên tập bài nào hoặc dùng thiết bị nào | Thư viện bài tập có tìm kiếm và bộ lọc |
| Khó duy trì kế hoạch | Lịch tập thiếu nhất quán hoặc quá phức tạp | Kế hoạch tập luyện có thể tùy chỉnh |
| Ghi chép mất thời gian | Phải ghi thủ công bằng giấy hoặc ứng dụng khác | Giao diện ghi nhận hiệp tập nhanh |
| Dễ quên mức tạ và số lần lặp | Không nhớ kết quả của buổi trước | Lịch sử tập luyện và dữ liệu của từng bài |
| Khó đánh giá tiến bộ | Thiếu dữ liệu để so sánh theo thời gian | Biểu đồ, thống kê và thành tích cá nhân |
| Dễ gián đoạn buổi tập | Mất kết nối hoặc ứng dụng bị đóng | Lưu cục bộ, tự động lưu và khôi phục buổi tập |
| Khó thao tác khi đang tập | Nút nhỏ, màn hình nhiều thông tin | Thiết kế mobile-first, vùng chạm lớn |
| Thiếu động lực duy trì | Quên lịch tập hoặc không theo dõi mục tiêu | Nhắc nhở, mục tiêu và theo dõi thói quen |

### 2.3. Chuyển đổi nhu cầu thành chức năng

| Nhu cầu | Chức năng tương ứng | Kết quả mong đợi |
|---|---|---|
| Cá nhân hóa trải nghiệm | Hồ sơ và onboarding | Thiết lập ban đầu phù hợp với người dùng |
| Tìm bài tập | Exercise Library | Tra cứu nhanh theo nhóm cơ, thiết bị và độ khó |
| Lập kế hoạch | Workout Plans | Tổ chức bài tập thành kế hoạch có cấu trúc |
| Ghi nhận kết quả | Workout Session | Theo dõi hiệp, mức tạ, số lần lặp và thời gian nghỉ |
| Theo dõi lịch sử | Workout History | Tra cứu các buổi tập đã hoàn thành |
| Đánh giá tiến bộ | Progress Tracking | Xem xu hướng và thành tích theo thời gian |
| Duy trì thói quen | Goals & Habits | Theo dõi mục tiêu và mức độ hoàn thành |
| Quản lý phục hồi | Recovery | Ghi nhận tình trạng phục hồi do người dùng tự khai báo |
| Không phụ thuộc mạng liên tục | Local Storage và Sync Queue | Lưu dữ liệu cục bộ và đồng bộ khi có mạng |

### 2.4. Nguyên tắc ưu tiên

Khi thiết kế tính năng, cần ưu tiên:

- Giảm số lần chạm để hoàn thành thao tác thường xuyên.
- Đặt thông tin quan trọng trong tầm nhìn và tầm với của ngón tay cái.
- Hạn chế yêu cầu nhập lại dữ liệu đã có.
- Bảo vệ dữ liệu buổi tập trước lỗi ứng dụng hoặc mất mạng.
- Tránh hiển thị quá nhiều thông tin cùng lúc.
- Không đưa ra kết luận y tế hoặc khuyến nghị tập luyện mang tính chẩn đoán chỉ dựa trên dữ liệu tự khai báo.

---

## 3. Mục tiêu và phạm vi hệ thống

### 3.1. Mục tiêu tổng quát

Xây dựng ứng dụng di động giúp người dùng quản lý hoạt động tập luyện trong một hệ thống thống nhất, từ bước lựa chọn bài tập, thực hiện buổi tập đến lưu trữ và phân tích kết quả.

### 3.2. Mục tiêu cụ thể

- Cung cấp thư viện bài tập có khả năng tìm kiếm và lọc.
- Cho phép tạo, chỉnh sửa và sử dụng kế hoạch tập luyện.
- Hỗ trợ ghi nhận kết quả trong thời gian thực.
- Tự động lưu tiến trình buổi tập.
- Hiển thị lịch sử và các chỉ số tiến bộ.
- Hỗ trợ mục tiêu, thói quen và nhắc nhở.
- Cung cấp giao diện sáng và tối.
- Tổ chức mã nguồn theo module để thuận tiện bảo trì.
- Chuẩn bị cơ chế tích hợp backend và đồng bộ dữ liệu khi cần.

### 3.3. Phạm vi phiên bản đầu tiên

**Phạm vi cốt lõi (MVP):**

1. Đăng ký, đăng nhập và quản lý hồ sơ.
2. Onboarding và thiết lập ban đầu.
3. Thư viện bài tập.
4. Kế hoạch tập luyện.
5. Ghi nhận buổi tập và đồng hồ nghỉ.
6. Lưu trữ và xem lịch sử.
7. Thống kê tiến bộ cơ bản.
8. Mục tiêu và nhắc nhở cơ bản.
9. Cài đặt giao diện sáng/tối.
10. Lưu cục bộ và khôi phục buổi tập.

**Phạm vi mở rộng:**

- Phân tích chuyên sâu về hiệu suất.
- Đồng bộ đa thiết bị và quản lý xung đột dữ liệu.
- Tích hợp nguồn dữ liệu sức khỏe hoặc thiết bị bên ngoài.
- Cá nhân hóa kế hoạch dựa trên lịch sử tập luyện.
- Các tính năng nâng cao về phục hồi và thống kê.

Các tính năng mở rộng chỉ nên triển khai sau khi những luồng cốt lõi hoạt động ổn định.

---

## 4. Yêu cầu chức năng và phi chức năng

### 4.1. Yêu cầu chức năng

| Mã | Yêu cầu | Mô tả |
|---|---|---|
| FR-01 | Xác thực | Đăng ký, đăng nhập, đăng xuất và quản lý phiên |
| FR-02 | Hồ sơ | Xem và cập nhật thông tin cá nhân |
| FR-03 | Onboarding | Thu thập mục tiêu, kinh nghiệm và lựa chọn ban đầu |
| FR-04 | Thư viện bài tập | Tìm kiếm, lọc và xem chi tiết bài tập |
| FR-05 | Kế hoạch tập | Tạo, xem và chỉnh sửa kế hoạch |
| FR-06 | Buổi tập | Bắt đầu, tạm dừng, tiếp tục và hoàn thành buổi tập |
| FR-07 | Ghi nhận hiệp | Lưu số lần lặp, mức tạ và trạng thái hoàn thành |
| FR-08 | Đồng hồ nghỉ | Bắt đầu, tạm dừng và kết thúc thời gian nghỉ |
| FR-09 | Tự động lưu | Bảo toàn dữ liệu trong buổi tập đang diễn ra |
| FR-10 | Lịch sử | Xem các buổi tập đã hoàn thành |
| FR-11 | Theo dõi tiến bộ | Hiển thị thống kê và biểu đồ phù hợp |
| FR-12 | Mục tiêu | Tạo và theo dõi mục tiêu tập luyện |
| FR-13 | Phục hồi | Ghi nhận cảm nhận phục hồi theo lựa chọn của người dùng |
| FR-14 | Thông báo | Nhắc lịch tập và các mục tiêu đã thiết lập |
| FR-15 | Cài đặt | Quản lý giao diện, quyền riêng tư và tùy chọn ứng dụng |
| FR-16 | Ngoại tuyến | Cho phép sử dụng các chức năng cốt lõi không cần mạng |
| FR-17 | Đồng bộ | Đưa dữ liệu cục bộ lên máy chủ khi có kết nối và cấu hình backend phù hợp |

### 4.2. Yêu cầu phi chức năng

**Hiệu năng**
- Giao diện phản hồi nhanh với các thao tác thường xuyên.
- Tránh tải lại toàn bộ màn hình khi chỉ thay đổi một hiệp tập.
- Phân trang hoặc tải theo nhu cầu đối với dữ liệu lớn.

**Độ tin cậy**
- Dữ liệu buổi tập phải được lưu định kỳ.
- Có thể khôi phục phiên tập chưa hoàn thành sau khi ứng dụng bị đóng.
- Xử lý lỗi mạng mà không làm mất dữ liệu đã ghi nhận.

**Bảo mật và quyền riêng tư**
- Không lưu mật khẩu dạng văn bản thuần.
- Sử dụng cơ chế xác thực phù hợp với backend.
- Lưu thông tin xác thực nhạy cảm trong vùng lưu trữ bảo mật.
- Chỉ yêu cầu quyền truy cập thiết bị khi chức năng thực sự cần.
- Cung cấp phương án quản lý, xuất hoặc xóa dữ liệu theo phạm vi hệ thống hỗ trợ.

**Khả năng bảo trì**
- Có quy ước đặt tên thống nhất.
- Tách giao diện, logic nghiệp vụ và tầng dữ liệu.
- Có kiểm thử cho các chức năng quan trọng.
- Dùng TypeScript để kiểm soát kiểu dữ liệu.

**Khả năng tiếp cận**
- Đảm bảo độ tương phản văn bản phù hợp.
- Hỗ trợ phóng to chữ theo cài đặt hệ điều hành.
- Không chỉ dùng màu sắc để biểu đạt trạng thái.
- Đảm bảo các nút quan trọng có vùng chạm đủ lớn.

---

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

## 6. Danh sách chức năng và công nghệ React Native/Expo

### 6.1. Công nghệ nền tảng

| Công nghệ | Vai trò |
|---|---|
| React Native | Xây dựng giao diện ứng dụng iOS và Android |
| Expo | Quản lý quy trình phát triển và tích hợp API thiết bị |
| TypeScript | Kiểm soát kiểu dữ liệu và hỗ trợ bảo trì |
| Expo Router | Điều hướng dựa trên cấu trúc tệp |
| React Hooks | Quản lý trạng thái và logic giao diện |
| Expo SecureStore | Lưu trữ thông tin nhạy cảm phù hợp với khả năng của nền tảng |
| SQLite | Lưu trữ dữ liệu có cấu trúc trên thiết bị |
| Expo Notifications | Quản lý thông báo và nhắc nhở |
| Expo Haptics | Phản hồi rung khi có tương tác phù hợp |
| Expo ImagePicker | Chọn hình ảnh từ thiết bị nếu cần |
| Expo Camera | Tích hợp camera khi có chức năng sử dụng |
| Expo Video | Phát video hướng dẫn bài tập |
| Expo Network | Kiểm tra trạng thái kết nối mạng |
| Expo FileSystem | Làm việc với tệp cục bộ |
| Expo Sharing | Chia sẻ dữ liệu hoặc tệp được xuất |
| AppState | Theo dõi trạng thái hoạt động của ứng dụng |
| React Native Safe Area Context | Xử lý vùng an toàn của màn hình |

Việc sử dụng từng thư viện cần căn cứ vào phiên bản Expo SDK đang triển khai và tài liệu tương ứng. Không phải chức năng nào cũng cần đưa vào MVP.

### 6.2. Chức năng xác thực và hồ sơ

**Chức năng:**
- Đăng ký và đăng nhập.
- Đăng xuất.
- Khôi phục hoặc làm mới phiên theo cơ chế backend.
- Xem và cập nhật hồ sơ.
- Thiết lập mục tiêu và thông tin ban đầu.
- Kiểm soát trạng thái đã hoàn thành onboarding.

**Công nghệ liên quan:**
- Expo Router.
- React Hooks.
- Expo SecureStore.
- API client.
- Validation.

**Lưu ý:** SecureStore phù hợp với dữ liệu nhạy cảm có dung lượng nhỏ, chẳng hạn token. Dữ liệu nghiệp vụ lớn không nên được lưu trực tiếp trong SecureStore.

### 6.3. Thư viện bài tập

**Chức năng:**
- Hiển thị danh sách bài tập.
- Tìm kiếm theo tên.
- Lọc theo nhóm cơ.
- Lọc theo thiết bị.
- Lọc theo độ khó.
- Xem chi tiết và hướng dẫn thực hiện.
- Phát video minh họa nếu có tài nguyên.

**Công nghệ liên quan:**
- React Native components.
- Hooks để quản lý bộ lọc.
- Expo Video.
- SQLite hoặc API backend để lấy dữ liệu.

### 6.4. Kế hoạch tập luyện

**Chức năng:**
- Xem danh sách kế hoạch.
- Xem các buổi tập trong kế hoạch.
- Thêm hoặc xóa bài tập.
- Điều chỉnh thứ tự bài tập.
- Tùy chỉnh số hiệp, số lần lặp và thời gian nghỉ.
- Khởi tạo buổi tập từ một kế hoạch.

**Công nghệ liên quan:**
- React Hooks.
- Expo Router.
- SQLite.
- API client khi cần đồng bộ.

### 6.5. Buổi tập đang diễn ra

Đây là module quan trọng nhất về trải nghiệm sử dụng vì người dùng thường thao tác nhanh và liên tục trong quá trình tập.

**Chức năng:**
- Bắt đầu buổi tập.
- Hiển thị danh sách bài tập.
- Ghi nhận số hiệp, số lần lặp và mức tạ.
- Đánh dấu hiệp đã hoàn thành.
- Bắt đầu và điều chỉnh thời gian nghỉ.
- Tạm dừng hoặc tiếp tục.
- Tự động lưu tiến trình.
- Khôi phục buổi tập chưa hoàn thành.
- Tổng kết khi kết thúc.

**Công nghệ liên quan:**
- SQLite để lưu dữ liệu cục bộ.
- Expo Haptics cho phản hồi tương tác.
- AppState để xử lý trạng thái ứng dụng.
- Expo Notifications nếu cần nhắc thời gian nghỉ khi ứng dụng ở nền.
- Expo Network để nhận biết thay đổi kết nối.

**Nguyên tắc quan trọng:** Không phụ thuộc hoàn toàn vào bộ đếm thời gian chạy liên tục trong JavaScript. Với đồng hồ nghỉ, nên lưu thời điểm kết thúc dự kiến rồi tính thời gian còn lại khi giao diện cập nhật hoặc ứng dụng quay lại foreground. Điều này giúp giảm sai lệch khi ứng dụng bị đưa xuống nền.

### 6.6. Lịch sử và theo dõi tiến bộ

**Chức năng:**
- Xem lịch sử theo ngày.
- Xem chi tiết từng buổi tập.
- Theo dõi khối lượng tập luyện.
- Theo dõi mức tạ và số lần lặp.
- Ghi nhận thành tích cá nhân (Personal Records — PR).
- Hiển thị biểu đồ theo thời gian.

**Công nghệ liên quan:**
- SQLite hoặc API backend.
- Thư viện biểu đồ tương thích với React Native/Expo.
- TypeScript để định nghĩa dữ liệu thống kê.

Các chỉ số phải được định nghĩa rõ ràng. Ví dụ, tổng khối lượng tập có thể được tính bằng tổng của `weight × reps` trên những hiệp hợp lệ. Cần quy định đơn vị, cách xử lý bài tập dùng trọng lượng cơ thể và cách loại trừ dữ liệu không hợp lệ để tránh kết quả thống kê gây hiểu nhầm.

### 6.7. Mục tiêu, phục hồi và thông báo

**Mục tiêu và thói quen:**
- Tạo mục tiêu theo thời gian.
- Theo dõi mức độ hoàn thành.
- Ghi nhận thói quen tập luyện.

**Phục hồi:**
- Cho phép người dùng tự đánh giá trạng thái phục hồi.
- Lưu lịch sử check-in.
- Hiển thị dữ liệu theo thời gian.
- Không sử dụng dữ liệu này như một chẩn đoán y tế.

**Thông báo:**
- Nhắc lịch tập theo lựa chọn của người dùng.
- Cho phép bật/tắt từng loại nhắc nhở.
- Xử lý quyền thông báo.
- Cập nhật hoặc hủy lịch thông báo khi cài đặt thay đổi.

---

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

---

## 8. Thiết kế giao diện và bố cục màn hình

### 8.1. Định hướng giao diện

Giao diện theo phong cách **Minimalist Fitness + Performance**, tập trung vào sự rõ ràng và hiệu quả khi sử dụng.

Các nguyên tắc:

- Bố cục gọn, ưu tiên nội dung cần thiết.
- Màu nền trung tính kết hợp màu nhấn có độ nhận diện cao.
- Phân cấp thông tin bằng kích thước chữ, khoảng cách và độ tương phản.
- Thẻ thông tin có cấu trúc nhất quán.
- Trạng thái hoàn thành, cảnh báo và lỗi phải dễ nhận biết.
- Hạn chế hiệu ứng trang trí gây phân tán sự chú ý.

### 8.2. Cấu trúc điều hướng chính

Thanh điều hướng dưới cùng đề xuất gồm năm mục:

| Mục | Nội dung |
|---|---|
| Home | Tổng quan, lịch tập gần nhất và thông tin nổi bật |
| Workouts | Kế hoạch tập và danh sách buổi tập |
| Exercises | Thư viện bài tập |
| Progress | Lịch sử và thống kê tiến bộ |
| Profile | Hồ sơ, cài đặt và quyền riêng tư |

Tên mục có thể được điều chỉnh theo kết quả kiểm thử khả năng sử dụng. Nếu năm mục gây chật trên thiết bị nhỏ, cần tối ưu nhãn và bố cục thay vì giảm vùng chạm.

### 8.3. Bố cục màn hình chính

Màn hình Home có thể bao gồm:

1. Header với lời chào và truy cập hồ sơ.
2. Thẻ kế hoạch hoặc buổi tập tiếp theo.
3. Nút bắt đầu hoặc tiếp tục buổi tập.
4. Tóm tắt hoạt động gần đây.
5. Mục tiêu và tiến độ cơ bản.
6. Thanh điều hướng dưới cùng.

Thứ tự ưu tiên cần đặt hành động chính, chẳng hạn bắt đầu hoặc tiếp tục tập, ở vị trí dễ tiếp cận.

### 8.4. Bố cục màn hình thư viện bài tập

Các thành phần:

- Thanh tìm kiếm.
- Bộ lọc theo nhóm cơ, thiết bị và độ khó.
- Danh sách hoặc lưới thẻ bài tập.
- Thông tin tên bài tập và hình minh họa.
- Màn hình chi tiết có hướng dẫn và video nếu có.

Bộ lọc cần thể hiện rõ điều kiện đang áp dụng, đồng thời có cách xóa bộ lọc nhanh.

### 8.5. Bố cục màn hình kế hoạch tập luyện

Các thành phần:

- Tên và mô tả kế hoạch.
- Danh sách bài tập theo thứ tự.
- Thông số cấu hình cho từng bài tập.
- Thao tác thêm, sửa, xóa hoặc sắp xếp.
- Nút bắt đầu buổi tập.

Các thao tác chỉnh sửa cần có phản hồi rõ ràng để người dùng không vô tình mất cấu hình kế hoạch.

### 8.6. Bố cục màn hình buổi tập

Màn hình này cần được tối ưu cho thao tác bằng một tay:

- Header hiển thị tên buổi tập và trạng thái.
- Danh sách bài tập có thể cuộn.
- Thẻ bài tập hiển thị các hiệp.
- Trường nhập mức tạ và số lần lặp.
- Nút hoàn thành hiệp có vùng chạm lớn.
- Đồng hồ nghỉ dễ nhìn.
- Khu vực hành động cố định cho thao tác chính khi phù hợp.
- Thông tin lưu trạng thái hoặc lỗi lưu khi cần thiết.

Tránh mở quá nhiều hộp thoại trong quá trình ghi nhận hiệp. Khi cần nhập số liệu, nên sử dụng bàn phím số và tránh làm mất nội dung đã nhập khi màn hình thay đổi trạng thái.

### 8.7. Bố cục màn hình tiến bộ

Các thành phần đề xuất:

- Bộ lọc khoảng thời gian.
- Thẻ tổng quan các chỉ số.
- Biểu đồ tiến bộ.
- Danh sách thành tích cá nhân.
- Lịch sử các buổi tập liên quan.

Mỗi biểu đồ phải có nhãn, đơn vị và khoảng thời gian rõ ràng. Không nên trình bày chỉ số thống kê khi chưa có đủ dữ liệu hoặc không có định nghĩa nhất quán.

### 8.8. Bố cục màn hình hồ sơ và cài đặt

Các nhóm nội dung:

- Thông tin cá nhân.
- Mục tiêu và tùy chọn.
- Giao diện sáng/tối.
- Cài đặt thông báo.
- Quyền riêng tư và dữ liệu.
- Đăng xuất.

Các thao tác có ảnh hưởng lớn, như xóa dữ liệu, cần có bước xác nhận và thông tin rõ ràng về phạm vi dữ liệu bị xóa.

### 8.9. Quy tắc layout mobile-first

- Padding ngang màn hình: 16–20 px.
- Khoảng cách giữa các thẻ: 12–16 px.
- Padding bên trong thẻ: 16 px.
- Kích thước vùng chạm: ưu tiên tối thiểu 44 × 44 px.
- Chiều cao nút chính: khoảng 48 px.
- Xử lý safe area ở cạnh trên và dưới.
- Không để bàn phím che trường nhập hoặc nút hành động quan trọng.
- Cho phép cuộn khi nội dung vượt chiều cao màn hình.
- Ưu tiên thao tác một tay đối với các chức năng thường dùng.

---

## 9. Design System và bảng phối màu

### 9.1. Mục tiêu của Design System

Design System là hệ thống quy chuẩn giao diện dùng chung cho toàn bộ ứng dụng. Mục tiêu là giảm sự không nhất quán, tăng tốc độ phát triển và tạo điều kiện thay đổi giao diện tập trung.

Design System bao gồm:

- Color tokens.
- Typography tokens.
- Spacing tokens.
- Border radius.
- Icon sizing.
- Button.
- Card.
- Input.
- Bottom Navigation.
- Trạng thái loading, disabled, error và success.
- Quy tắc hỗ trợ accessibility.

### 9.2. Bảng màu Dark Theme

| Token | HEX | Công dụng |
|---|---|---|
| `background` | `#121417` | Nền màn hình |
| `surface` | `#1C2025` | Nền thẻ và khu vực nội dung |
| `surface-elevated` | `#292F36` | Thành phần nổi hoặc vùng nhấn nhẹ |
| `text-primary` | `#F4F6F8` | Văn bản chính |
| `text-secondary` | `#B0B8C2` | Văn bản phụ |
| `brand-primary` | `#FF6B35` | Nút chính và điểm nhấn |
| `info` | `#65BFFF` | Thông tin và trạng thái cần chú ý |
| `success` | `#57D68D` | Trạng thái thành công |
| `danger` | `#FF7777` | Lỗi hoặc cảnh báo quan trọng |

### 9.3. Bảng màu Light Theme

| Token | HEX | Công dụng |
|---|---|---|
| `background` | `#F7F8FA` | Nền màn hình |
| `surface` | `#FFFFFF` | Nền thẻ |
| `surface-elevated` | `#E8ECF1` | Thành phần nổi hoặc vùng phân biệt |
| `text-primary` | `#171A1F` | Văn bản chính |
| `text-secondary` | `#525B66` | Văn bản phụ |
| `brand-primary` | `#C94718` | Nút chính và điểm nhấn |
| `info` | `#075EA8` | Thông tin và trạng thái cần chú ý |
| `success` | `#167447` | Trạng thái thành công |
| `danger` | `#B42318` | Lỗi hoặc cảnh báo quan trọng |

Màu nhấn của hai theme có thể khác nhau nhằm duy trì độ tương phản với nền. Không nên mặc định dùng cùng một mã màu cho mọi theme nếu điều đó làm giảm khả năng đọc.

### 9.4. Kiểm tra độ tương phản WCAG

WCAG 2.2 quy định mức tương phản tối thiểu:

- **Văn bản thông thường:** 4.5:1 theo WCAG AA.
- **Văn bản lớn:** 3:1 theo WCAG AA.
- **Thành phần giao diện và đối tượng đồ họa cần thiết để nhận biết:** thông thường cần 3:1 so với màu liền kề theo tiêu chí áp dụng.

Bảng dưới đây ghi nhận các cặp màu đã được tính toán trong phương án thiết kế:

| Theme | Màu chữ | Màu nền | Tỷ lệ tương phản | Đánh giá |
|---|---|---|---:|---|
| Dark | `#F4F6F8` | `#121417` | 17.03:1 | Đạt AA và AAA cho văn bản thường |
| Dark | `#B0B8C2` | `#121417` | 9.21:1 | Đạt AA và AAA cho văn bản thường |
| Dark | `#121417` | `#FF6B35` | 6.51:1 | Đạt AA và AAA cho văn bản thường |
| Light | `#171A1F` | `#F7F8FA` | 16.41:1 | Đạt AA và AAA cho văn bản thường |
| Light | `#525B66` | `#F7F8FA` | 6.49:1 | Đạt AA và AAA cho văn bản thường |
| Light | `#FFFFFF` | `#C94718` | 4.77:1 | Đạt AA cho văn bản thường |
| Light | `#FFFFFF` | `#075EA8` | 6.61:1 | Đạt AA và AAA cho văn bản thường |
| Light | `#FFFFFF` | `#167447` | 5.80:1 | Đạt AA cho văn bản thường |

Các tỷ lệ trên chỉ áp dụng cho đúng cặp màu được liệt kê. Cần kiểm tra thêm từng cặp màu thực tế, đặc biệt là văn bản trên thẻ, nhãn lỗi, placeholder, icon và các trạng thái disabled.

Không nên dùng màu đơn thuần để truyền tải ý nghĩa. Ví dụ, trạng thái lỗi cần có biểu tượng hoặc thông báo chữ bên cạnh màu cảnh báo.

### 9.5. Typography

Font chữ đề xuất là **Inter** hoặc font hệ thống phù hợp với nền tảng. Font cần hỗ trợ đầy đủ ký tự tiếng Việt.

| Token | Kích thước | Độ đậm | Ứng dụng |
|---|---:|---:|---|
| `display` | 32 px | 700 | Số liệu nổi bật hoặc tiêu đề đặc biệt |
| `h1` | 28 px | 700 | Tiêu đề màn hình |
| `h2` | 24 px | 700 | Tiêu đề khu vực lớn |
| `h3` | 20 px | 600 | Tiêu đề thẻ hoặc nhóm nội dung |
| `title` | 18 px | 600 | Tiêu đề thành phần |
| `body` | 16 px | 400 | Nội dung chính |
| `body-small` | 14 px | 400 | Nội dung phụ |
| `label` | 14 px | 600 | Nhãn trường nhập |
| `caption` | 12 px | 400 | Chú thích hoặc thông tin phụ |

Quy tắc sử dụng:

- Dùng `body` làm kích thước mặc định cho nội dung quan trọng.
- Hạn chế sử dụng chữ 12 px cho thông tin cần đọc trong khi tập.
- Dùng font weight để phân cấp thay vì chỉ dựa vào màu.
- Hỗ trợ Dynamic Type hoặc cơ chế phóng to chữ tương ứng của React Native.
- Kiểm tra hiện tượng tràn chữ khi tên bài tập hoặc nội dung dịch dài.

### 9.6. Hệ thống spacing 4/8 px

Spacing sử dụng đơn vị cơ sở 4 px, ưu tiên các bội số của 4 hoặc 8.

| Token | Kích thước | Ứng dụng |
|---|---:|---|
| `space-1` | 4 px | Khoảng cách rất nhỏ |
| `space-2` | 8 px | Khoảng cách giữa icon và nhãn |
| `space-3` | 12 px | Khoảng cách giữa các thành phần gần nhau |
| `space-4` | 16 px | Padding thẻ và khoảng cách tiêu chuẩn |
| `space-5` | 20 px | Padding ngang màn hình rộng hơn |
| `space-6` | 24 px | Khoảng cách giữa các nhóm nội dung |
| `space-8` | 32 px | Khoảng cách giữa các khu vực lớn |
| `space-10` | 40 px | Khoảng cách phân khu |
| `space-12` | 48 px | Khoảng cách lớn hoặc bố cục đặc biệt |

Không bắt buộc mọi khoảng cách phải dùng token. Tuy nhiên, các giá trị thông dụng cần thống nhất để tránh giao diện thiếu nhất quán.

### 9.7. Border radius và kích thước icon

| Thành phần | Giá trị đề xuất |
|---|---|
| Input nhỏ hoặc chip | 8–10 px |
| Button và input chính | 10–12 px |
| Card | 16 px |
| Sheet hoặc khu vực lớn | 20–24 px |
| Icon nhỏ | 16 px |
| Icon thông thường | 20–24 px |
| Icon lớn | 28–32 px |

Các giá trị trên là token thiết kế, không phải giới hạn cứng. Có thể điều chỉnh khi có bằng chứng từ kiểm thử giao diện.

### 9.8. Button

**Thông số đề xuất:**

- Chiều cao tiêu chuẩn: 48 px.
- Chiều cao compact: tối thiểu khoảng 40 px; vẫn phải bảo đảm vùng chạm phù hợp.
- Border radius: 12 px.
- Padding ngang: 16–24 px.
- Font: 16 px, weight 600.
- Trạng thái: default, pressed, disabled, loading và error nếu cần.

**Màu nút chính:**

| Theme | Nền | Chữ |
|---|---|---|
| Dark | `#FF6B35` | `#121417` |
| Light | `#C94718` | `#FFFFFF` |

**Các loại nút:**

- Primary: hành động chính, chẳng hạn bắt đầu buổi tập.
- Secondary: hành động phụ, có thể dùng nền trung tính hoặc viền.
- Text/Ghost: thao tác phụ ít nổi bật.
- Destructive: thao tác cần cảnh báo, như xóa dữ liệu.

Nút loading cần ngăn gửi thao tác lặp không mong muốn. Nút disabled phải có trạng thái nhận biết rõ, không chỉ dựa vào giảm độ sáng nếu độ tương phản không đạt.

### 9.9. Card

**Thông số đề xuất:**

- Border radius: 16 px.
- Padding: 16 px.
- Khoảng cách giữa nội dung: 8–12 px.
- Viền: 1 px khi cần phân tách.
- Nền: `surface` hoặc `surface-elevated`.

Card được sử dụng cho:

- Bài tập.
- Kế hoạch tập.
- Thống kê tiến bộ.
- Mục tiêu.
- Lịch sử buổi tập.

Mỗi card nên có một trọng tâm thông tin. Tránh đặt quá nhiều hành động ngang hàng trong cùng một card.

### 9.10. Input

**Thông số đề xuất:**

- Chiều cao: 48–52 px.
- Border radius: 10–12 px.
- Padding ngang: 12–16 px.
- Nhãn luôn hiển thị hoặc có cách thay thế tương đương dễ hiểu.
- Trạng thái: default, focused, error, disabled và filled.

Đối với trường nhập số lần lặp và mức tạ:

- Sử dụng bàn phím số phù hợp.
- Giữ lại giá trị khi người dùng chuyển giữa các trường.
- Kiểm tra giá trị không hợp lệ.
- Hiển thị thông báo lỗi cụ thể.
- Tránh tự động đặt lại dữ liệu khi trạng thái màn hình thay đổi.

### 9.11. Bottom Navigation

**Thông số đề xuất:**

- Số mục: 4–5.
- Icon: 24 px.
- Chiều cao vùng nội dung: khoảng 56–64 px, chưa tính phần safe area.
- Vùng chạm: tối thiểu 44 × 44 px.
- Mỗi mục có nhãn đi kèm icon.
- Trạng thái active được thể hiện bằng màu và dấu hiệu thị giác bổ sung.

Trong màn hình đang tập, có thể ẩn hoặc tùy chỉnh thanh điều hướng nếu thanh này làm giảm không gian thao tác. Việc điều hướng ra khỏi buổi tập cần có cơ chế bảo toàn trạng thái.

### 9.12. Motion và phản hồi tương tác

| Loại tương tác | Thời lượng tham khảo |
|---|---:|
| Phản hồi button | 100–180 ms |
| Chuyển trạng thái nhẹ | 100–180 ms |
| Bottom sheet hoặc panel | 180–250 ms |

Dùng animation vừa đủ để phản hồi hành động, không làm chậm thao tác. Có thể sử dụng Expo Haptics cho các hành động phù hợp, nhưng cần cho phép người dùng tắt hoặc điều chỉnh nếu cần.

### 9.13. Cấu trúc triển khai Design System

```text
src/shared/design-system/
├── tokens/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── radius.ts
│   └── sizes.ts
├── theme/
│   ├── light.ts
│   ├── dark.ts
│   ├── ThemeProvider.tsx
│   └── useTheme.ts
└── components/
    ├── Button.tsx
    ├── Card.tsx
    ├── Input.tsx
    ├── AppText.tsx
    ├── Screen.tsx
    ├── IconButton.tsx
    └── BottomNavigation.tsx
```

Các component dùng chung nên nhận token từ theme thay vì khai báo trực tiếp mã HEX tại từng màn hình. Điều này giúp chuyển đổi Light/Dark Theme và thay đổi bảng màu dễ dàng hơn.

---

## 10. Khả năng tiếp cận và trải nghiệm sử dụng

### 10.1. Hỗ trợ sử dụng bằng một tay

- Đặt các hành động thường dùng ở khu vực dễ chạm.
- Giữ kích thước nút đủ lớn.
- Hạn chế các thao tác yêu cầu độ chính xác cao.
- Không đặt hành động nguy hiểm sát nút hoàn thành hiệp.
- Tránh yêu cầu nhập quá nhiều thông tin trước khi bắt đầu tập.

### 10.2. Hỗ trợ người dùng có nhu cầu tiếp cận

- Sử dụng nhãn cho nút và icon khi cần.
- Hỗ trợ screen reader bằng accessibility label và role phù hợp.
- Đảm bảo thứ tự focus hợp lý.
- Không truyền đạt trạng thái chỉ bằng màu.
- Hỗ trợ tăng cỡ chữ.
- Kiểm thử với độ tương phản và kích thước màn hình khác nhau.

### 10.3. Trạng thái giao diện cần chuẩn hóa

Mỗi màn hình có dữ liệu nên xem xét các trạng thái:

- Loading.
- Success.
- Empty.
- Error.
- Offline.
- Disabled.
- Nội dung chưa đồng bộ.
- Dữ liệu đang được lưu hoặc khôi phục.

Ví dụ, khi lịch sử tập luyện chưa có dữ liệu, nên hiển thị trạng thái trống với hướng dẫn hành động tiếp theo thay vì một màn hình trắng.

---

## 11. Kiểm thử và tiêu chí nghiệm thu

### 11.1. Chiến lược kiểm thử

**Unit testing**
- Hàm tính tổng khối lượng tập.
- Logic kiểm tra dữ liệu hiệp.
- Bộ lọc bài tập.
- Quy tắc hoàn thành mục tiêu.
- Logic chuyển trạng thái buổi tập.

**Component testing**
- Button.
- Input.
- ExerciseCard.
- SetLogger.
- RestTimer.
- Bottom Navigation.

**Integration testing**
- Lưu buổi tập vào SQLite.
- Khôi phục phiên tập.
- Đọc lịch sử.
- Gửi và nhận dữ liệu qua API.
- Đồng bộ dữ liệu sau khi có mạng.

**End-to-end testing**
- Đăng nhập và hoàn thành onboarding.
- Chọn kế hoạch và bắt đầu tập.
- Ghi nhận các hiệp và kết thúc buổi tập.
- Kiểm tra buổi tập xuất hiện trong lịch sử.
- Kiểm tra tiến bộ được cập nhật.
- Kiểm tra dữ liệu sau khi ứng dụng được đóng và mở lại.

### 11.2. Tiêu chí nghiệm thu chức năng

| Mã | Tiêu chí | Điều kiện nghiệm thu |
|---|---|---|
| AC-01 | Xác thực | Trạng thái đăng nhập được xử lý đúng theo phản hồi backend |
| AC-02 | Thư viện bài tập | Tìm kiếm và lọc trả về kết quả đúng điều kiện |
| AC-03 | Kế hoạch | Có thể xem và chỉnh sửa cấu hình bài tập |
| AC-04 | Ghi nhận hiệp | Dữ liệu hợp lệ được lưu và hiển thị nhất quán |
| AC-05 | Đồng hồ nghỉ | Thời gian còn lại được tính chính xác theo thời điểm kết thúc dự kiến |
| AC-06 | Tự động lưu | Buổi tập có thể được khôi phục sau khi ứng dụng bị đóng ngoài dự kiến |
| AC-07 | Ngoại tuyến | Các thao tác cốt lõi được hỗ trợ không phụ thuộc kết nối liên tục |
| AC-08 | Đồng bộ | Thay đổi được gửi lại khi có mạng, không tạo bản ghi trùng ngoài dự kiến |
| AC-09 | Lịch sử | Buổi tập hoàn thành xuất hiện trong lịch sử |
| AC-10 | Thống kê | Các chỉ số được tính theo công thức đã xác định |
| AC-11 | Giao diện | Light/Dark Theme hiển thị đúng theo lựa chọn hoặc cấu hình |
| AC-12 | Accessibility | Các cặp màu và vùng chạm đáp ứng yêu cầu thiết kế đã đặt ra |

### 11.3. Kiểm thử trên thiết bị

Cần kiểm tra trên:

- Thiết bị Android có kích thước màn hình khác nhau.
- Thiết bị iOS.
- Thiết bị có cỡ chữ hệ thống tăng.
- Trạng thái mất mạng và kết nối lại.
- Ứng dụng chuyển sang nền rồi quay lại.
- Bàn phím mở khi nhập dữ liệu.
- Các trạng thái loading, lỗi và dữ liệu trống.

---

## 12. Kế hoạch triển khai

### Giai đoạn 1: Phân tích và thiết lập dự án

- Xác định phạm vi MVP.
- Hoàn thiện user flow và cấu trúc màn hình.
- Khởi tạo React Native/Expo với TypeScript.
- Cấu hình Expo Router.
- Thiết lập quy tắc mã nguồn và kiểm thử.

**Kết quả:** Dự án có cấu trúc cơ bản và có thể chạy trên thiết bị.

### Giai đoạn 2: Xây dựng Design System

- Khai báo color tokens.
- Xây dựng typography và spacing.
- Triển khai Light/Dark Theme.
- Xây dựng Button, Card, Input và Bottom Navigation.
- Kiểm tra khả năng tiếp cận.

**Kết quả:** Các màn hình sử dụng chung một hệ thống giao diện.

### Giai đoạn 3: Phát triển chức năng nền tảng

- Xác thực.
- Hồ sơ.
- Onboarding.
- Thư viện bài tập.
- Kế hoạch tập luyện.

**Kết quả:** Người dùng có thể thiết lập tài khoản và lựa chọn kế hoạch.

### Giai đoạn 4: Phát triển luồng tập luyện

- Màn hình buổi tập.
- Ghi nhận hiệp.
- Đồng hồ nghỉ.
- Tự động lưu.
- Khôi phục phiên tập.
- Tổng kết buổi tập.

**Kết quả:** Luồng tập luyện cốt lõi hoạt động ổn định.

### Giai đoạn 5: Lịch sử và thống kê

- Lịch sử buổi tập.
- Chi tiết buổi tập.
- Thành tích cá nhân.
- Biểu đồ tiến bộ.
- Mục tiêu và thói quen.

**Kết quả:** Người dùng có thể theo dõi dữ liệu tập luyện theo thời gian.

### Giai đoạn 6: Ngoại tuyến và đồng bộ

- Hoàn thiện cơ sở dữ liệu SQLite.
- Xây dựng hàng đợi đồng bộ.
- Xử lý retry và lỗi mạng.
- Xác định quy tắc xung đột dữ liệu.
- Kiểm thử mất mạng và khôi phục.

**Kết quả:** Dữ liệu cục bộ đáng tin cậy và có thể đồng bộ khi backend hỗ trợ.

### Giai đoạn 7: Kiểm thử và hoàn thiện

- Kiểm thử đơn vị, tích hợp và end-to-end.
- Kiểm tra hiệu năng.
- Kiểm tra quyền riêng tư.
- Kiểm tra giao diện trên nhiều thiết bị.
- Sửa lỗi và chuẩn bị bản phát hành.

**Kết quả:** Phiên bản MVP sẵn sàng cho quá trình đánh giá và triển khai thử nghiệm.

---

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

## 14. Kết luận

Báo cáo đã tổng hợp định hướng phát triển ứng dụng quản lý tập luyện thể hình trên nền tảng React Native/Expo từ góc độ người dùng, chức năng, kiến trúc phần mềm, lưu trữ dữ liệu và thiết kế giao diện.

Giải pháp đề xuất tập trung vào bốn nền tảng chính:

1. **Trải nghiệm người dùng:** Hỗ trợ người mới bắt đầu và người đã có kinh nghiệm, ưu tiên thao tác nhanh trong quá trình tập luyện.
2. **Kiến trúc module:** Tách biệt các nhóm chức năng nghiệp vụ và các thành phần dùng chung nhằm tăng khả năng tái sử dụng, kiểm thử và mở rộng.
3. **Độ tin cậy dữ liệu:** Kết hợp SQLite, cơ chế tự động lưu và hàng đợi đồng bộ để hỗ trợ sử dụng ngoại tuyến.
4. **Design System thống nhất:** Áp dụng Light/Dark Theme, bảng màu có kiểm tra độ tương phản, typography rõ ràng và hệ thống spacing theo đơn vị 4/8 px.

Trong quá trình triển khai, cần ưu tiên hoàn thiện luồng từ lựa chọn kế hoạch đến ghi nhận, lưu trữ và xem lại buổi tập. Đây là luồng nghiệp vụ cốt lõi, ảnh hưởng trực tiếp đến tính hữu ích của ứng dụng.

Sau khi các chức năng nền tảng đạt tiêu chí nghiệm thu, dự án có thể mở rộng sang phân tích nâng cao, cá nhân hóa và đồng bộ đa thiết bị. Cách tiếp cận theo từng giai đoạn giúp kiểm soát phạm vi, giảm rủi ro và duy trì chất lượng trong suốt quá trình phát triển.

---

**Tài liệu tham chiếu kỹ thuật đề xuất**

- React Native: https://reactnative.dev/
- Expo: https://docs.expo.dev/
- Expo Router: https://docs.expo.dev/router/introduction/
- Expo SecureStore: https://docs.expo.dev/versions/latest/sdk/securestore/
- Expo SQLite: https://docs.expo.dev/versions/latest/sdk/sqlite/
- Expo Notifications: https://docs.expo.dev/versions/latest/sdk/notifications/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/

*Ghi chú: Đây là tài liệu phân tích và thiết kế đề xuất. Các quyết định về backend, xác thực, mô hình dữ liệu chi tiết, thư viện biểu đồ và cơ chế đồng bộ cần được xác nhận trong giai đoạn triển khai kỹ thuật.*