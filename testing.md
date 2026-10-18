# Testing Module

## Mục đích

Quản lý cấu hình và tiện ích kiểm thử tự động cho ứng dụng Expo/React Native. Test cases được đặt trong `__tests__/` hoặc cạnh mã nguồn khi phù hợp; test dùng native UI phải dựa trên jest-expo và React Native Testing Library.

## Kiến trúc/Cấu trúc

- `package.json`: script test và cấu hình Jest dùng preset `jest-expo`.
- `tsconfig.json`: nạp kiểu Jest cho TypeScript.
- `__tests__/`: kiểm thử tự động ở cấp dự án; hiện có smoke test cho `RoutePlaceholder`.
- `src/shared/testing/`: dành cho tiện ích/mock dùng chung nếu xuất hiện nhu cầu thực tế; không tạo abstraction trước khi có test cần tái sử dụng.
- Expo Router integration và E2E tests tiếp tục theo kế hoạch nghiệm thu ở phase sau.
- `eslint.config.js`: Expo flat config; lint chạy qua script `npm run lint`.
- Scripts `npm test` và `npm run test:watch` lần lượt chạy một lượt hoặc ở watch mode.

Trước Phase 1.T05, dự án chưa khai báo script test, Jest preset, test source hoặc thư mục kiểm thử.

## Lịch sử phát triển

- Phase 1.T05: thiết lập Jest/`jest-expo`, React Native Testing Library và smoke test cho giao diện placeholder điều hướng.

## Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-18 | Tạo tài liệu module testing trước khi thêm cấu hình và test. | Tuân thủ quy tắc tài liệu module. | Ghi nhận phạm vi testing và trạng thái ban đầu; chưa thay đổi cấu hình. |
| 2026-10-18 | Cấu hình jest-expo, React Native Testing Library, test scripts và type definitions; thêm smoke test cho RoutePlaceholder. | Tạo nền tảng kiểm thử component theo Expo và React Native. | Jest: 1 test pass; TypeScript, Expo lint, kiểm tra tương thích Expo và web/iOS/Android export đạt. Native export không thay thế chạy kiểm thử trên thiết bị/emulator. |
