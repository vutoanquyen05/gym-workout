# Theme Module

## Mục đích

Expose semantic color tokens Dark/Light và quản lý chế độ `system`, `light` hoặc `dark` cho component dùng chung trên native và web. Ở chế độ `system`, provider theo color scheme của thiết bị; hook web giữ trạng thái khởi tạo phù hợp với static rendering.

## Kiến trúc/Cấu trúc

- `src/shared/design-system/colors.ts`: nguồn palette Light/Dark duy nhất theo `color-palette.md`; `Colors` cung cấp thêm alias cũ để giữ tương thích.
- `src/shared/design-system/typography.ts`: thang cỡ chữ, line-height và font weight theo `design-system.md`.
- `src/shared/design-system/spacing.ts`: spacing scale theo bội số 4/8 px.
- `src/shared/design-system/radius.ts`: radius semantic cho chip, input, button, card và sheet.
- `src/shared/design-system/sizes.ts`: kích thước icon, control, navigation và vùng chạm tối thiểu.
- `src/shared/design-system/components/`: `AppText`, `Screen`, `Button`, `Card`, `Input` và `IconButton`; các component đọc semantic tokens và theme context.
- `src/shared/design-system/components/feedback-state.tsx`: trạng thái loading, success, empty, error, offline, disabled, unsynced và saving với thông tin chữ rõ ràng.
- `src/shared/design-system/components/bottom-navigation.tsx`: native bottom navigation năm mục, dùng theme và typography tokens; route được khai báo bởi Expo Router.
- `src/shared/design-system/components/index.ts`: public exports của các component design system.
- `src/shared/design-system/theme-provider.tsx`: `AppThemeProvider` cung cấp mode, scheme, colors và `setMode`; `useAppTheme` báo lỗi rõ nếu gọi ngoài provider.
- `src/constants/theme.ts`: tái xuất token mới cùng font và các giá trị `Spacing` legacy; không đổi style của consumer hiện tại.
- `src/hooks/use-theme.ts`: API tương thích cho component cũ, trả về colors của provider.
- `src/hooks/use-color-scheme.ts`: sử dụng `useColorScheme` của React Native.
- `src/hooks/use-color-scheme.web.ts`: dùng `useSyncExternalStore` để giữ render đầu tiên của SSR ở Light nhằm tránh mismatch hydration; sau hydration dùng color scheme của client.
- `src/app/_layout.tsx`: bọc app bằng provider và đồng bộ scheme với Expo Router `ThemeProvider`; native tabs đọc palette từ cùng provider.

Các màn hình tiêu thụ hook/token; module theme không quản lý dữ liệu nghiệp vụ. `app.json` đặt `userInterfaceStyle` là `automatic`, và `expo-system-ui` đã có trong dependencies để Android nhận thay đổi appearance.

## Lịch sử phát triển

- Phase 1.T05: ghi nhận xử lý hydration cho lint và nền tảng kiểm thử.
- Phase 2.T01: thay palette starter bằng color tokens đã chốt, thêm app-level theme provider và giữ alias cho consumer hiện hữu.
- Phase 2.T02: thêm các thang typography, spacing, radius và size làm nền cho component design system.
- Phase 2.T03: xây dựng các component dùng chung cho typography, màn hình, nút, card, input và icon button.
- Phase 2.T04: cung cấp component bottom navigation và feedback-state component cho trạng thái giao diện chuẩn.
- Phase 2.T05: kiểm tra tương phản token, kích thước chạm, safe area và font scaling; tăng tương phản viền input/outline.

## Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-18 | Tạo tài liệu module theme trước khi điều chỉnh hook web. | Quy tắc lint toàn dự án phát hiện cập nhật state đồng bộ trong effect; cần sửa đồng thời giữ hành vi SSR. | Ghi nhận cấu trúc hiện tại và mục tiêu thay đổi; chưa sửa mã. |
| 2026-10-18 | Thay state/effect đánh dấu hydration bằng `useSyncExternalStore` với server snapshot Light. | Loại bỏ cập nhật state đồng bộ trong effect theo quy tắc React Hooks mà vẫn tách server snapshot khỏi snapshot client. | TypeScript và toàn bộ Expo lint đạt; kiểm tra Jest của UI dùng mock theme, không thay đổi hook hydration. |
| 2026-10-18 | Thêm palette tokens và `AppThemeProvider` hỗ trợ system/light/dark; tích hợp root layout, tabs và hook tương thích; thêm test cho đổi system scheme và mode tường minh. | Thực hiện Phase 2.T01 theo palette đã chốt mà không làm gãy consumers dùng khóa màu cũ. | Jest (2 suites, 2 tests), TypeScript, Expo lint, Expo dependency check và static web export đạt. iOS runtime vẫn chưa được kiểm tra; giữ nguyên blocker trong `risks-decisions.md`. |
| 2026-10-18 | Thêm typography, spacing, radius và size tokens; tái xuất từ `src/constants/theme.ts` trong khi giữ nguyên spacing alias hiện hành. | Chuẩn hóa scale theo `design-system.md` trước khi xây dựng các component dùng chung ở T03. | Jest: 3 suites, 4 tests pass; TypeScript, Expo lint và static web export đạt. |
| 2026-10-18 | Thêm `AppText`, `Screen`, `Button`, `Card`, `Input`, `IconButton` và barrel exports; dùng màu semantic, token kích thước, safe area, nhãn trợ năng và trạng thái tương tác. | Hoàn thành Phase 2.T03, tạo nền UI tái sử dụng xuyên nền tảng mà không thay đổi các màn hình hiện hữu. | Jest: 4 suites, 8 tests pass; TypeScript và Expo lint đạt. Static export iOS/Android/web được kiểm tra; runtime iOS vẫn chưa được kiểm tra. |
| 2026-10-18 | Thêm `BottomNavigation` và `FeedbackState`; tích hợp bottom navigation vào tabs route và hỗ trợ tám trạng thái giao diện bằng biểu đạt chữ cùng màu semantic. | Hoàn thành phần navigation và trạng thái giao diện dùng chung theo T04. | Jest: 4 suites, 9 tests pass; TypeScript, Expo lint và Expo static export đa nền tảng đạt. |
| 2026-10-18 | Bật rõ font scaling cho `AppText`, khai báo đủ safe-area edges cho `Screen`, và dùng viền tương phản cao cho input/outline; bổ sung kiểm thử contrast và touch targets. | Đáp ứng WCAG AA/non-text contrast và khả năng thao tác/đọc khi phóng to chữ. | Jest: 5 suites, 13 tests; TypeScript, Expo lint, Expo dependency check và static exports web/iOS/Android đạt. Native runtime ở cỡ chữ lớn chưa kiểm tra vì Android tooling/iOS Simulator không khả dụng trong phiên này. |
