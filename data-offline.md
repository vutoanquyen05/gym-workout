# Dữ liệu, lưu trữ và offline-first — Single Source of Truth

Nguồn: `baocao.md`, mục 7.

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
