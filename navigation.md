# Navigation Module

## Mục đích

Quản lý điều hướng cấp ứng dụng bằng Expo Router: root stack, nhóm tab chính và các route độc lập như xác thực. Module này chỉ tổ chức route và trình bày điều hướng; không chứa nghiệp vụ của các feature.

## Kiến trúc/Cấu trúc

- `src/app/_layout.tsx`: root stack, theme và splash overlay dùng toàn ứng dụng.
- `src/app/index.tsx`: chuyển hướng route gốc đến nhóm tab.
- `src/app/(tabs)/_layout.tsx`: cấu hình Expo Router native tabs, dùng nhãn và icon theo nền tảng.
- `src/app/(tabs)/*.tsx`: route của năm mục Home, Workouts, Exercises, Progress và Profile.
- `src/app/(auth)/*.tsx`: layout và các route đăng nhập/đăng ký độc lập.
- `src/components/route-placeholder.tsx`: giao diện tạm thời dùng chung trong khi các feature chưa được triển khai; vùng an toàn dùng `react-native-safe-area-context`.
- Expo Router phát hiện route theo cấu trúc file; các màn hình tính năng thực tế được triển khai trong phase tương ứng.

Trước Phase 1.T04, dự án có `src/app/index.tsx` và `src/app/explore.tsx`, layout nhúng tab component trực tiếp; chưa có root stack, nhóm route hoặc năm tab MVP. Các tab đang dùng màn hình placeholder, không đại diện cho việc hoàn tất feature.

## Lịch sử phát triển

- Phase 1.T04: thay cấu trúc điều hướng starter bằng root stack, năm tab MVP và các route auth; dùng placeholder đến khi feature tương ứng được triển khai.

## Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-18 | Tạo tài liệu module navigation trước khi sửa mã điều hướng. | Tuân thủ quy trình tài liệu module; xác định phạm vi route và cấu trúc. | Ghi nhận trạng thái ban đầu và phạm vi Phase 1.T04; chưa thay đổi mã. |
| 2026-10-18 | Thiết lập root stack, route root, năm tab, giao diện placeholder và loại bỏ các tab Explore starter. | Đưa cấu trúc Expo Router khớp với danh mục màn hình MVP đã chốt. | Expo web, iOS và Android export; TypeScript, Jest smoke test và toàn bộ ESLint đạt. Placeholder dùng Safe Area Context cho layout nhất quán trên native. Chưa xác nhận chạy trên thiết bị/emulator. |
