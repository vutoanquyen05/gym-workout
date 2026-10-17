# Công nghệ và API thiết bị — Single Source of Truth

Nguồn: `baocao.md`, mục 6. Đây là danh sách công nghệ/API nền tảng, **không phải danh sách endpoint backend**.

## 6. Danh sách chức năng và công nghệ React Native/Expo

### 6.1. Công nghệ nền tảng

| Công nghệ | Vai trò |
|---|---|
| React Native | Xây dựng giao diện ứng dụng iOS và Android |
| Expo | Quản lý quy trình phát triển và tích hợp API thiết bị |
| TypeScript | Kiểm soát kiểu dữ liệu và hỗ trợ bảo trì |
| Expo Router | Điều hướng dựa trên cấu trúc tệp |
| React Hooks | Quản lý trạng thái và logic giao diện |
| Expo SecureStore | Lưu trữ thông tin nhạy cảm phù hợp với khả năng của nền tảng |
| SQLite | Lưu trữ dữ liệu có cấu trúc trên thiết bị |
| Expo Notifications | Quản lý thông báo và nhắc nhở |
| Expo Haptics | Phản hồi rung khi có tương tác phù hợp |
| Expo ImagePicker | Chọn hình ảnh từ thiết bị nếu cần |
| Expo Camera | Tích hợp camera khi có chức năng sử dụng |
| Expo Video | Phát video hướng dẫn bài tập |
| Expo Network | Kiểm tra trạng thái kết nối mạng |
| Expo FileSystem | Làm việc với tệp cục bộ |
| Expo Sharing | Chia sẻ dữ liệu hoặc tệp được xuất |
| AppState | Theo dõi trạng thái hoạt động của ứng dụng |
| React Native Safe Area Context | Xử lý vùng an toàn của màn hình |

Việc sử dụng từng thư viện cần căn cứ vào phiên bản Expo SDK đang triển khai và tài liệu tương ứng. Không phải chức năng nào cũng cần đưa vào MVP.

### 6.2. Chức năng xác thực và hồ sơ

**Chức năng:**
- Đăng ký và đăng nhập.
- Đăng xuất.
- Khôi phục hoặc làm mới phiên theo cơ chế backend.
- Xem và cập nhật hồ sơ.
- Thiết lập mục tiêu và thông tin ban đầu.
- Kiểm soát trạng thái đã hoàn thành onboarding.

**Công nghệ liên quan:**
- Expo Router.
- React Hooks.
- Expo SecureStore.
- API client.
- Validation.

**Lưu ý:** SecureStore phù hợp với dữ liệu nhạy cảm có dung lượng nhỏ, chẳng hạn token. Dữ liệu nghiệp vụ lớn không nên được lưu trực tiếp trong SecureStore.

### 6.3. Thư viện bài tập

**Chức năng:**
- Hiển thị danh sách bài tập.
- Tìm kiếm theo tên.
- Lọc theo nhóm cơ.
- Lọc theo thiết bị.
- Lọc theo độ khó.
- Xem chi tiết và hướng dẫn thực hiện.
- Phát video minh họa nếu có tài nguyên.

**Công nghệ liên quan:**
- React Native components.
- Hooks để quản lý bộ lọc.
- Expo Video.
- SQLite hoặc API backend để lấy dữ liệu.

### 6.4. Kế hoạch tập luyện

**Chức năng:**
- Xem danh sách kế hoạch.
- Xem các buổi tập trong kế hoạch.
- Thêm hoặc xóa bài tập.
- Điều chỉnh thứ tự bài tập.
- Tùy chỉnh số hiệp, số lần lặp và thời gian nghỉ.
- Khởi tạo buổi tập từ một kế hoạch.

**Công nghệ liên quan:**
- React Hooks.
- Expo Router.
- SQLite.
- API client khi cần đồng bộ.

### 6.5. Buổi tập đang diễn ra

Đây là module quan trọng nhất về trải nghiệm sử dụng vì người dùng thường thao tác nhanh và liên tục trong quá trình tập.

**Chức năng:**
- Bắt đầu buổi tập.
- Hiển thị danh sách bài tập.
- Ghi nhận số hiệp, số lần lặp và mức tạ.
- Đánh dấu hiệp đã hoàn thành.
- Bắt đầu và điều chỉnh thời gian nghỉ.
- Tạm dừng hoặc tiếp tục.
- Tự động lưu tiến trình.
- Khôi phục buổi tập chưa hoàn thành.
- Tổng kết khi kết thúc.

**Công nghệ liên quan:**
- SQLite để lưu dữ liệu cục bộ.
- Expo Haptics cho phản hồi tương tác.
- AppState để xử lý trạng thái ứng dụng.
- Expo Notifications nếu cần nhắc thời gian nghỉ khi ứng dụng ở nền.
- Expo Network để nhận biết thay đổi kết nối.

**Nguyên tắc quan trọng:** Không phụ thuộc hoàn toàn vào bộ đếm thời gian chạy liên tục trong JavaScript. Với đồng hồ nghỉ, nên lưu thời điểm kết thúc dự kiến rồi tính thời gian còn lại khi giao diện cập nhật hoặc ứng dụng quay lại foreground. Điều này giúp giảm sai lệch khi ứng dụng bị đưa xuống nền.

### 6.6. Lịch sử và theo dõi tiến bộ

**Chức năng:**
- Xem lịch sử theo ngày.
- Xem chi tiết từng buổi tập.
- Theo dõi khối lượng tập luyện.
- Theo dõi mức tạ và số lần lặp.
- Ghi nhận thành tích cá nhân (Personal Records — PR).
- Hiển thị biểu đồ theo thời gian.

**Công nghệ liên quan:**
- SQLite hoặc API backend.
- Thư viện biểu đồ tương thích với React Native/Expo.
- TypeScript để định nghĩa dữ liệu thống kê.

Các chỉ số phải được định nghĩa rõ ràng. Ví dụ, tổng khối lượng tập có thể được tính bằng tổng của `weight × reps` trên những hiệp hợp lệ. Cần quy định đơn vị, cách xử lý bài tập dùng trọng lượng cơ thể và cách loại trừ dữ liệu không hợp lệ để tránh kết quả thống kê gây hiểu nhầm.

### 6.7. Mục tiêu, phục hồi và thông báo

**Mục tiêu và thói quen:**
- Tạo mục tiêu theo thời gian.
- Theo dõi mức độ hoàn thành.
- Ghi nhận thói quen tập luyện.

**Phục hồi:**
- Cho phép người dùng tự đánh giá trạng thái phục hồi.
- Lưu lịch sử check-in.
- Hiển thị dữ liệu theo thời gian.
- Không sử dụng dữ liệu này như một chẩn đoán y tế.

**Thông báo:**
- Nhắc lịch tập theo lựa chọn của người dùng.
- Cho phép bật/tắt từng loại nhắc nhở.
- Xử lý quyền thông báo.
- Cập nhật hoặc hủy lịch thông báo khi cài đặt thay đổi.

---
