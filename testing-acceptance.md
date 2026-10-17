# Kiểm thử và nghiệm thu — Single Source of Truth

Nguồn: `baocao.md`, mục 11.

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
