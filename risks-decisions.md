# Rủi ro và quyết định cần chốt

Nguồn: `baocao.md`, mục 13 và ghi chú cuối báo cáo.

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

## Các quyết định chưa được báo cáo xác định

- [ ] Backend, dịch vụ xác thực và quy tắc phiên.
- [ ] Endpoint, payload, mã lỗi và cơ chế xác thực API backend.
- [ ] Schema SQLite chi tiết, khóa ngoại, migration và quy tắc xóa.
- [ ] Thư viện biểu đồ và định nghĩa đầy đủ các chỉ số thống kê.
- [ ] Chiến lược đồng bộ, retry, idempotency và xử lý xung đột.
- [x] Baseline Expo SDK: Expo SDK 57, dependency hiện tại `expo ~57.0.30`; tài liệu tham chiếu [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/). Đây là phiên bản đang được dự án sử dụng, không phải quyết định nâng cấp hoặc cam kết tương thích mọi thư viện tương lai.

Không tự coi các mục chưa chốt là yêu cầu đã được xác nhận.

## Kết quả Phase 1.T02 — Backend, auth và Expo SDK

- **Expo SDK:** Đã xác nhận baseline hiện tại là Expo SDK 57 (`expo ~57.0.30` trong `package.json`, `57.0.30` trong `package-lock.json`). Tiếp tục dùng baseline này cho các task kế tiếp; mọi API/thư viện Expo phát sinh phải đối chiếu tài liệu phiên bản 57.
- **Backend và auth — blocker:** Tài liệu yêu cầu đăng ký/đăng nhập và có khả năng đồng bộ, nhưng chưa chỉ định backend/provider, cơ chế xác thực, quy tắc phiên hoặc môi trường triển khai. Không chọn dịch vụ thay mặt chủ dự án và không giả lập tích hợp xác thực thật.
- **API — blocker liên quan:** Chưa có base URL, endpoint, payload, mã lỗi hay hợp đồng phiên. Không tạo endpoint hoặc hợp đồng API giả định.
- **Điều kiện gỡ blocker:** Cần xác nhận nhà cung cấp/backend và môi trường, cơ chế auth/phiên, cùng hợp đồng API cần thiết. Cho đến khi có các thông tin đó, các phần phụ thuộc backend phải được ghi nhận là chưa tích hợp; chức năng cục bộ tiếp tục theo phạm vi MVP.
- **Kết quả task:** T02 hoàn tất theo nhánh ghi nhận blocker cho backend/auth và chốt baseline SDK hiện có; các quyết định backend/API vẫn mở.

## Khoảng trống xác minh Phase 1

- **Trạng thái:** Android runtime và điều hướng cơ bản đã xác minh; iOS runtime còn chưa xác minh.
- **Bằng chứng Android:** Expo Go `57.0.9` chạy app trên AVD `Medium_Phone_API_37.0` (Android 17). Home mở thành công; thao tác lần lượt Workouts, Exercises, Progress, Profile và trở lại Home đều chọn đúng tab và hiển thị đúng tiêu đề route qua Android UI hierarchy.
- **Bằng chứng build:** Expo static export tạo bundle web, iOS và Android; TypeScript, Expo lint, Jest và kiểm tra tương thích SDK đạt. Native bundle export không thay thế runtime test iOS.
- **Giới hạn iOS:** Workspace chạy trên Windows, không có `xcrun`, Xcode hoặc iOS Simulator; iOS runtime test cần môi trường macOS/Xcode hoặc thiết bị iOS khả dụng.
- **Ngoại lệ được chấp thuận:** Ngày 2026-10-18, người dùng yêu cầu tiếp tục và xác nhận lựa chọn bắt đầu Phase 2 trong khi iOS runtime verification vẫn là blocker. Phase 2 được phép tiến hành; không xem đây là bằng chứng iOS đã kiểm thử.
- **Việc còn lại:** Chạy app và kiểm tra điều hướng cơ bản trên iOS simulator/thiết bị khi có môi trường macOS/Xcode hoặc thiết bị iOS khả dụng.
