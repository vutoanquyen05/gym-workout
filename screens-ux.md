# Màn hình và UI/UX — Single Source of Truth

Nguồn: `baocao.md`, mục 8. Chi tiết token tham khảo `design-system.md` và `color-palette.md`.

## 8. Thiết kế giao diện và bố cục màn hình

### 8.1. Định hướng giao diện

Giao diện theo phong cách **Minimalist Fitness + Performance**, tập trung vào sự rõ ràng và hiệu quả khi sử dụng.

Các nguyên tắc:

- Bố cục gọn, ưu tiên nội dung cần thiết.
- Màu nền trung tính kết hợp màu nhấn có độ nhận diện cao.
- Phân cấp thông tin bằng kích thước chữ, khoảng cách và độ tương phản.
- Thẻ thông tin có cấu trúc nhất quán.
- Trạng thái hoàn thành, cảnh báo và lỗi phải dễ nhận biết.
- Hạn chế hiệu ứng trang trí gây phân tán sự chú ý.

### 8.2. Cấu trúc điều hướng chính

Thanh điều hướng dưới cùng đề xuất gồm năm mục:

| Mục | Nội dung |
|---|---|
| Home | Tổng quan, lịch tập gần nhất và thông tin nổi bật |
| Workouts | Kế hoạch tập và danh sách buổi tập |
| Exercises | Thư viện bài tập |
| Progress | Lịch sử và thống kê tiến bộ |
| Profile | Hồ sơ, cài đặt và quyền riêng tư |

Tên mục có thể được điều chỉnh theo kết quả kiểm thử khả năng sử dụng. Nếu năm mục gây chật trên thiết bị nhỏ, cần tối ưu nhãn và bố cục thay vì giảm vùng chạm.

### 8.3. Bố cục màn hình chính

Màn hình Home có thể bao gồm:

1. Header với lời chào và truy cập hồ sơ.
2. Thẻ kế hoạch hoặc buổi tập tiếp theo.
3. Nút bắt đầu hoặc tiếp tục buổi tập.
4. Tóm tắt hoạt động gần đây.
5. Mục tiêu và tiến độ cơ bản.
6. Thanh điều hướng dưới cùng.

Thứ tự ưu tiên cần đặt hành động chính, chẳng hạn bắt đầu hoặc tiếp tục tập, ở vị trí dễ tiếp cận.

### 8.4. Bố cục màn hình thư viện bài tập

Các thành phần:

- Thanh tìm kiếm.
- Bộ lọc theo nhóm cơ, thiết bị và độ khó.
- Danh sách hoặc lưới thẻ bài tập.
- Thông tin tên bài tập và hình minh họa.
- Màn hình chi tiết có hướng dẫn và video nếu có.

Bộ lọc cần thể hiện rõ điều kiện đang áp dụng, đồng thời có cách xóa bộ lọc nhanh.

### 8.5. Bố cục màn hình kế hoạch tập luyện

Các thành phần:

- Tên và mô tả kế hoạch.
- Danh sách bài tập theo thứ tự.
- Thông số cấu hình cho từng bài tập.
- Thao tác thêm, sửa, xóa hoặc sắp xếp.
- Nút bắt đầu buổi tập.

Các thao tác chỉnh sửa cần có phản hồi rõ ràng để người dùng không vô tình mất cấu hình kế hoạch.

### 8.6. Bố cục màn hình buổi tập

Màn hình này cần được tối ưu cho thao tác bằng một tay:

- Header hiển thị tên buổi tập và trạng thái.
- Danh sách bài tập có thể cuộn.
- Thẻ bài tập hiển thị các hiệp.
- Trường nhập mức tạ và số lần lặp.
- Nút hoàn thành hiệp có vùng chạm lớn.
- Đồng hồ nghỉ dễ nhìn.
- Khu vực hành động cố định cho thao tác chính khi phù hợp.
- Thông tin lưu trạng thái hoặc lỗi lưu khi cần thiết.

Tránh mở quá nhiều hộp thoại trong quá trình ghi nhận hiệp. Khi cần nhập số liệu, nên sử dụng bàn phím số và tránh làm mất nội dung đã nhập khi màn hình thay đổi trạng thái.

### 8.7. Bố cục màn hình tiến bộ

Các thành phần đề xuất:

- Bộ lọc khoảng thời gian.
- Thẻ tổng quan các chỉ số.
- Biểu đồ tiến bộ.
- Danh sách thành tích cá nhân.
- Lịch sử các buổi tập liên quan.

Mỗi biểu đồ phải có nhãn, đơn vị và khoảng thời gian rõ ràng. Không nên trình bày chỉ số thống kê khi chưa có đủ dữ liệu hoặc không có định nghĩa nhất quán.

### 8.8. Bố cục màn hình hồ sơ và cài đặt

Các nhóm nội dung:

- Thông tin cá nhân.
- Mục tiêu và tùy chọn.
- Giao diện sáng/tối.
- Cài đặt thông báo.
- Quyền riêng tư và dữ liệu.
- Đăng xuất.

Các thao tác có ảnh hưởng lớn, như xóa dữ liệu, cần có bước xác nhận và thông tin rõ ràng về phạm vi dữ liệu bị xóa.

### 8.9. Quy tắc layout mobile-first

- Padding ngang màn hình: 16–20 px.
- Khoảng cách giữa các thẻ: 12–16 px.
- Padding bên trong thẻ: 16 px.
- Kích thước vùng chạm: ưu tiên tối thiểu 44 × 44 px.
- Chiều cao nút chính: khoảng 48 px.
- Xử lý safe area ở cạnh trên và dưới.
- Không để bàn phím che trường nhập hoặc nút hành động quan trọng.
- Cho phép cuộn khi nội dung vượt chiều cao màn hình.
- Ưu tiên thao tác một tay đối với các chức năng thường dùng.

## 8.10. Phạm vi màn hình và luồng MVP

### Danh mục màn hình

| Khu vực | Màn hình MVP | Ghi chú |
|---|---|---|
| Truy cập và thiết lập | Đăng nhập, đăng ký, onboarding/hồ sơ ban đầu | Luồng xác thực thật phụ thuộc quyết định backend/auth tại Phase 1.T02. |
| Home | Tổng quan, kế hoạch/buổi tập tiếp theo, bắt đầu hoặc tiếp tục tập | Điểm vào nhanh cho buổi tập và mục tiêu. |
| Workouts | Danh sách kế hoạch, chi tiết kế hoạch, tạo/chỉnh sửa kế hoạch | Cho phép quản lý thứ tự bài tập và thông số hiệp, reps, nghỉ. |
| Exercises | Thư viện, tìm kiếm/lọc, chi tiết bài tập | Có thể chọn bài tập để đưa vào kế hoạch. |
| Workout session | Buổi tập đang diễn ra, tổng kết sau buổi tập | Ghi hiệp, nghỉ, tạm dừng/tiếp tục và kết thúc. |
| Progress | Lịch sử, chi tiết buổi tập, thống kê cơ bản | Chỉ hiển thị chỉ số khi có dữ liệu và định nghĩa hợp lệ. |
| Goals and profile | Mục tiêu/tiến độ, hồ sơ và cài đặt | Có thể là màn hình con truy cập từ Home/Profile; không yêu cầu thêm mục tab thứ sáu. |
| Notifications | Thiết lập nhắc lịch và trạng thái quyền | Chỉ yêu cầu quyền khi người dùng chủ động bật chức năng cần quyền. |

Điều hướng cấp cao giữ năm mục Home, Workouts, Exercises, Progress và Profile. Các màn hình chi tiết, chỉnh sửa, buổi tập và tổng kết được mở từ khu vực liên quan; không tạo thêm tab cấp cao cho từng luồng.

### Luồng người dùng chính

1. **Lần đầu sử dụng:** Mở ứng dụng → đăng ký/đăng nhập → onboarding và thiết lập hồ sơ → Home. Cách xử lý khi backend/auth chưa sẵn sàng phải theo quyết định Phase 1.T02, không tự thêm chế độ khách hoặc xác thực giả.
2. **Tìm bài tập và lập kế hoạch:** Exercises → tìm kiếm/lọc → xem chi tiết → thêm bài tập vào kế hoạch; hoặc Workouts → tạo/chỉnh sửa kế hoạch → sắp xếp bài tập và cấu hình hiệp/reps/thời gian nghỉ → lưu → xem chi tiết kế hoạch.
3. **Thực hiện buổi tập:** Home hoặc chi tiết kế hoạch → bắt đầu/tiếp tục → ghi nhận và hoàn thành hiệp → nghỉ theo timer → lặp lại cho các bài tập → kết thúc → xem tổng kết. Người dùng có thể tạm dừng và tiếp tục buổi tập.
4. **Tra cứu kết quả:** Progress → xem danh sách lịch sử hoặc thống kê cơ bản → chọn buổi tập để xem chi tiết. Trường hợp chưa có dữ liệu cần có trạng thái rỗng thay vì số liệu gây hiểu nhầm.
5. **Theo dõi mục tiêu và cài đặt:** Mở mục tiêu từ Home/Profile để xem hoặc cập nhật tiến độ; mở Profile để quản lý hồ sơ, giao diện và tùy chọn nhắc lịch/quyền riêng tư.

Các luồng ghi nhận và tra cứu buổi tập phải hoạt động ngoại tuyến theo phạm vi lưu cục bộ. Đăng nhập/đăng ký và đồng bộ máy chủ là các phụ thuộc được quản lý riêng, không được ngầm coi là khả dụng trong luồng ngoại tuyến.

---
