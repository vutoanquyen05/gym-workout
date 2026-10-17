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
- [ ] Phiên bản Expo SDK và khả năng tương thích thư viện.

Không tự coi các mục chưa chốt là yêu cầu đã được xác nhận.
