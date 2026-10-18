# Theme Module

## Mục đích

Expose màu sắc và chế độ giao diện theo hệ điều hành cho các component dùng chung trên native và web, gồm trạng thái khởi tạo phù hợp với static rendering trên web.

## Kiến trúc/Cấu trúc

- `src/constants/theme.ts`: color, font và spacing tokens hiện có.
- `src/hooks/use-theme.ts`: trả về palette theo color scheme hiện hành.
- `src/hooks/use-color-scheme.ts`: sử dụng `useColorScheme` của React Native.
- `src/hooks/use-color-scheme.web.ts`: dùng `useSyncExternalStore` để giữ render đầu tiên của SSR ở Light nhằm tránh mismatch hydration; sau hydration dùng color scheme của client.

Các màn hình tiêu thụ hook/token; module theme không quản lý điều hướng hoặc dữ liệu nghiệp vụ.

## Lịch sử phát triển

- Phase 1.T05: ghi nhận xử lý hydration cho lint và nền tảng kiểm thử.

## Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-18 | Tạo tài liệu module theme trước khi điều chỉnh hook web. | Quy tắc lint toàn dự án phát hiện cập nhật state đồng bộ trong effect; cần sửa đồng thời giữ hành vi SSR. | Ghi nhận cấu trúc hiện tại và mục tiêu thay đổi; chưa sửa mã. |
| 2026-10-18 | Thay state/effect đánh dấu hydration bằng `useSyncExternalStore` với server snapshot Light. | Loại bỏ cập nhật state đồng bộ trong effect theo quy tắc React Hooks mà vẫn tách server snapshot khỏi snapshot client. | TypeScript và toàn bộ Expo lint đạt; kiểm tra Jest của UI dùng mock theme, không thay đổi hook hydration. |
