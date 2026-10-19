# Testing Module

## Mục đích

Quản lý cấu hình và tiện ích kiểm thử tự động cho ứng dụng Expo/React Native. Test cases được đặt trong `__tests__/` hoặc cạnh mã nguồn khi phù hợp; test dùng native UI phải dựa trên jest-expo và React Native Testing Library.

## Kiến trúc/Cấu trúc

- `package.json`: script test và cấu hình Jest dùng preset `jest-expo`.
- `tsconfig.json`: nạp kiểu Jest cho TypeScript.
- `__tests__/`: kiểm thử tự động ở cấp dự án; có smoke test cho `RoutePlaceholder`, test `AppThemeProvider`, design tokens/spacing compatibility, component design system và feedback states.
- `src/shared/testing/`: dành cho tiện ích/mock dùng chung nếu xuất hiện nhu cầu thực tế; không tạo abstraction trước khi có test cần tái sử dụng.
- Expo Router integration và E2E tests tiếp tục theo kế hoạch nghiệm thu ở phase sau.
- `eslint.config.js`: Expo flat config; lint chạy qua script `npm run lint`.
- Scripts `npm test` và `npm run test:watch` lần lượt chạy một lượt hoặc ở watch mode.

Trước Phase 1.T05, dự án chưa khai báo script test, Jest preset, test source hoặc thư mục kiểm thử.

## Lịch sử phát triển

- Phase 1.T05: thiết lập Jest/`jest-expo`, React Native Testing Library và smoke test cho giao diện placeholder điều hướng.
- Phase 2.T01: thêm test xác minh provider theo thay đổi system scheme và áp dụng mode dark tường minh.
- Phase 2.T02: thêm test xác minh typography, spacing, radius, size tokens và giá trị spacing legacy.
- Phase 2.T03: thêm component tests cho text/header role, button disabled/loading, input label/error/change và icon button accessibility.
- Phase 2.T04: kiểm tra component feedback-state thể hiện loading/error bằng nhãn và role phù hợp.
- Phase 2.T05: thêm kiểm tra WCAG contrast token Dark/Light, 44pt targets, input borders, safe-area edges và cho phép phóng to/chảy dòng văn bản.

## Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-18 | Tạo tài liệu module testing trước khi thêm cấu hình và test. | Tuân thủ quy tắc tài liệu module. | Ghi nhận phạm vi testing và trạng thái ban đầu; chưa thay đổi cấu hình. |
| 2026-10-18 | Cấu hình jest-expo, React Native Testing Library, test scripts và type definitions; thêm smoke test cho RoutePlaceholder. | Tạo nền tảng kiểm thử component theo Expo và React Native. | Jest: 1 test pass; TypeScript, Expo lint, kiểm tra tương thích Expo và web/iOS/Android export đạt. Native export không thay thế chạy kiểm thử trên thiết bị/emulator. |
| 2026-10-18 | Thêm `theme-provider-test.tsx` để kiểm tra system scheme Light → Dark và mode Dark tường minh. | Bảo vệ việc resolve palette theo system và override tường minh. | Jest: 2 suites, 2 tests pass; TypeScript, Expo lint, kiểm tra Expo dependency và static web export đạt. |
| 2026-10-18 | Thêm `design-tokens-test.ts` để kiểm tra scales của design system và giữ compatibility của `Spacing` hiện hành. | Ngăn sai lệch token và thay đổi ngoài ý muốn với các component chưa chuyển sang token mới. | Jest: 3 suites, 4 tests pass; TypeScript, Expo lint và static web export đạt. |
| 2026-10-18 | Thêm `design-components-test.tsx` bao phủ các component UI dùng chung và trạng thái/semantics quan trọng. | Xác nhận các component render đúng, giữ nhãn trợ năng và ngăn tương tác khi disabled/loading. | Jest: 4 suites, 8 tests pass; TypeScript, Expo lint và static exports iOS/Android/web đạt. |
| 2026-10-18 | Mở rộng test component với trạng thái loading và error, bao gồm text status và accessibility alert role. | Bảo đảm trạng thái phản hồi không chỉ dựa vào màu sắc. | Jest: 4 suites, 9 tests pass; TypeScript và Expo lint đạt. |
| 2026-10-18 | Thêm `color-accessibility-test.ts`; mở rộng component checks cho font scaling, nội dung không bị giới hạn dòng, safe-area edges, touch targets và màu viền. | Chuyển tiêu chí T05 thành regression checks đo được theo WCAG và 44pt minimum. | Jest: 5 suites, 13 tests; TypeScript, Expo lint, Expo dependency check và static exports web/iOS/Android đạt; runtime large-text/native tab hit regions chưa kiểm tra trên thiết bị trong phiên này. |
