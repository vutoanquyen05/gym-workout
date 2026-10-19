# Navigation Module

## Mục đích

Quản lý điều hướng cấp ứng dụng bằng Expo Router: root stack, nhóm tab chính và các route độc lập như xác thực. Module này chỉ tổ chức route và trình bày điều hướng; không chứa nghiệp vụ của các feature.

## Kiến trúc/Cấu trúc

- `src/app/_layout.tsx`: `AppThemeProvider`, root stack, Expo Router theme và splash overlay dùng toàn ứng dụng.
- `src/app/index.tsx`: chuyển hướng route gốc đến nhóm tab.
- `src/app/(tabs)/_layout.tsx`: gắn component điều hướng dùng chung vào layout route tabs.
- `src/shared/design-system/components/bottom-navigation.tsx`: cấu hình năm tab Expo Router NativeTabs, icon/nhãn theo nền tảng, màu theme và nhãn luôn hiển thị trên Android.
- `src/app/(tabs)/*.tsx`: route của năm mục Home, Workouts, Exercises, Progress và Profile.
- `src/app/(auth)/*.tsx`: layout và các route đăng nhập/đăng ký độc lập.
- `src/components/route-placeholder.tsx`: giao diện tạm thời dùng chung trong khi các feature chưa được triển khai; vùng an toàn dùng `react-native-safe-area-context`.
- Expo Router phát hiện route theo cấu trúc file; các màn hình tính năng thực tế được triển khai trong phase tương ứng.

Trước Phase 1.T04, dự án có `src/app/index.tsx` và `src/app/explore.tsx`, layout nhúng tab component trực tiếp; chưa có root stack, nhóm route hoặc năm tab MVP. Các tab đang dùng màn hình placeholder, không đại diện cho việc hoàn tất feature.

## Lịch sử phát triển

- Phase 1.T04: thay cấu trúc điều hướng starter bằng root stack, năm tab MVP và các route auth; dùng placeholder đến khi feature tương ứng được triển khai.
- Phase 2.T01: tích hợp palette/token provider vào root và đồng bộ màu native tabs theo scheme ứng dụng.
- Phase 2.T04: tách thanh điều hướng năm tab thành `BottomNavigation` dùng chung với màu selected và label tokenized.
- Phase 2.T05: dùng `textPrimary` cho selected label để đạt AA trên cả hai theme; icon active tiếp tục dùng màu brand.

## Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-18 | Tạo tài liệu module navigation trước khi sửa mã điều hướng. | Tuân thủ quy trình tài liệu module; xác định phạm vi route và cấu trúc. | Ghi nhận trạng thái ban đầu và phạm vi Phase 1.T04; chưa thay đổi mã. |
| 2026-10-18 | Thiết lập root stack, route root, năm tab, giao diện placeholder và loại bỏ các tab Explore starter. | Đưa cấu trúc Expo Router khớp với danh mục màn hình MVP đã chốt. | Expo web, iOS và Android export; TypeScript, Jest smoke test và toàn bộ ESLint đạt. Placeholder dùng Safe Area Context cho layout nhất quán trên native. |
| 2026-10-18 | Chạy Expo Go trên Android emulator `Medium_Phone_API_37.0` (Android 17) và kiểm tra Home, Workouts, Exercises, Progress, Profile. | Xác minh điều hướng cơ bản trên runtime Android, ngoài bước bundle export. | App mở được và cả năm tab đều chọn/hiển thị đúng route theo Android UI hierarchy. iOS runtime chưa được kiểm tra vì môi trường Windows không có Xcode/iOS Simulator. |
| 2026-10-18 | Đưa root stack và native tabs vào `AppThemeProvider`; tabs lấy màu từ scheme ứng dụng. | Giữ màu điều hướng nhất quán với semantic color tokens và hỗ trợ provider quản lý system/light/dark. | TypeScript, Expo lint, Jest và static web export đạt. |
| 2026-10-18 | Tách cấu hình native tabs khỏi route layout thành `BottomNavigation`, giữ năm route/icon hiện tại và áp dụng selected tint, label color/size từ theme/token. | Chuẩn hóa bottom navigation và cung cấp điểm cấu hình dùng chung thay vì nhúng chi tiết trong Expo Router layout. | Jest, TypeScript, Expo lint và static export đa nền tảng đạt; thao tác runtime tab đã xác minh trước đó trên Android, chưa chạy lại native runtime trong task này. |
| 2026-10-18 | Chuyển màu nhãn selected từ brand sang `textPrimary`; giữ icon selected màu brand. | Brand Light trên nền background chỉ đạt 4.49:1, thấp hơn ngưỡng 4.5:1 cho chữ thường; cách phối mới giữ dấu hiệu active và đạt tương phản chữ. | Các cặp màu được tính trong `color-accessibility-test.ts`; web/iOS/Android static export đạt. Native runtime tab chưa được kiểm tra lại trong phiên này. |
