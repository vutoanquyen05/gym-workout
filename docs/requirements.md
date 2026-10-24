# Phạm vi và yêu cầu — Single Source of Truth

> **Cập nhật định hướng (2026-10-23):** Dự án đang chuyển đổi từ ứng dụng theo dõi tập luyện cá nhân sang hệ thống quản lý phòng gym nhiều tenant, nhiều chi nhánh. Các yêu cầu Phase I (cá nhân) được giữ nguyên; yêu cầu Phase II (gym management) được bổ sung ở cuối tài liệu. Xem `mindmap.md` để biết roadmap chi tiết.

Nguồn gốc Phase I: `baocao.md`, mục 2–4. Nguồn Phase II: `multi-tenancy.md`, `gym-management.md`, `member-management.md`, `membership.md`, `attendance.md`, `payments.md`.

## 2. Phân tích nhu cầu người dùng

### 2.1. Nhu cầu cốt lõi

Qua việc phân tích quá trình tập luyện, có thể xác định những nhu cầu chính sau:

1. Tìm kiếm và lựa chọn bài tập phù hợp.
2. Xây dựng hoặc sử dụng kế hoạch tập luyện có sẵn.
3. Ghi lại mức tạ, số lần lặp và số hiệp nhanh chóng.
4. Quản lý thời gian nghỉ giữa các hiệp.
5. Theo dõi lịch sử và sự tiến bộ.
6. Duy trì thói quen thông qua mục tiêu và nhắc nhở.
7. Sử dụng các chức năng quan trọng khi mất kết nối Internet.
8. Quản lý hồ sơ, cài đặt và dữ liệu cá nhân.

### 2.2. Những vấn đề người dùng thường gặp

| Vấn đề | Biểu hiện | Hướng giải quyết |
|---|---|---|
| Khó lựa chọn bài tập | Không biết nên tập bài nào hoặc dùng thiết bị nào | Thư viện bài tập có tìm kiếm và bộ lọc |
| Khó duy trì kế hoạch | Lịch tập thiếu nhất quán hoặc quá phức tạp | Kế hoạch tập luyện có thể tùy chỉnh |
| Ghi chép mất thời gian | Phải ghi thủ công bằng giấy hoặc ứng dụng khác | Giao diện ghi nhận hiệp tập nhanh |
| Dễ quên mức tạ và số lần lặp | Không nhớ kết quả của buổi trước | Lịch sử tập luyện và dữ liệu của từng bài |
| Khó đánh giá tiến bộ | Thiếu dữ liệu để so sánh theo thời gian | Biểu đồ, thống kê và thành tích cá nhân |
| Dễ gián đoạn buổi tập | Mất kết nối hoặc ứng dụng bị đóng | Lưu cục bộ, tự động lưu và khôi phục buổi tập |
| Khó thao tác khi đang tập | Nút nhỏ, màn hình nhiều thông tin | Thiết kế mobile-first, vùng chạm lớn |
| Thiếu động lực duy trì | Quên lịch tập hoặc không theo dõi mục tiêu | Nhắc nhở, mục tiêu và theo dõi thói quen |

### 2.3. Chuyển đổi nhu cầu thành chức năng

| Nhu cầu | Chức năng tương ứng | Kết quả mong đợi |
|---|---|---|
| Cá nhân hóa trải nghiệm | Hồ sơ và onboarding | Thiết lập ban đầu phù hợp với người dùng |
| Tìm bài tập | Exercise Library | Tra cứu nhanh theo nhóm cơ, thiết bị và độ khó |
| Lập kế hoạch | Workout Plans | Tổ chức bài tập thành kế hoạch có cấu trúc |
| Ghi nhận kết quả | Workout Session | Theo dõi hiệp, mức tạ, số lần lặp và thời gian nghỉ |
| Theo dõi lịch sử | Workout History | Tra cứu các buổi tập đã hoàn thành |
| Đánh giá tiến bộ | Progress Tracking | Xem xu hướng và thành tích theo thời gian |
| Duy trì thói quen | Goals & Habits | Theo dõi mục tiêu và mức độ hoàn thành |
| Quản lý phục hồi | Recovery | Ghi nhận tình trạng phục hồi do người dùng tự khai báo |
| Không phụ thuộc mạng liên tục | Local Storage và Sync Queue | Lưu dữ liệu cục bộ và đồng bộ khi có mạng |

### 2.4. Nguyên tắc ưu tiên

Khi thiết kế tính năng, cần ưu tiên:

- Giảm số lần chạm để hoàn thành thao tác thường xuyên.
- Đặt thông tin quan trọng trong tầm nhìn và tầm với của ngón tay cái.
- Hạn chế yêu cầu nhập lại dữ liệu đã có.
- Bảo vệ dữ liệu buổi tập trước lỗi ứng dụng hoặc mất mạng.
- Tránh hiển thị quá nhiều thông tin cùng lúc.
- Không đưa ra kết luận y tế hoặc khuyến nghị tập luyện mang tính chẩn đoán chỉ dựa trên dữ liệu tự khai báo.

---

## 3. Mục tiêu và phạm vi hệ thống

### 3.1. Mục tiêu tổng quát

Xây dựng ứng dụng di động giúp người dùng quản lý hoạt động tập luyện trong một hệ thống thống nhất, từ bước lựa chọn bài tập, thực hiện buổi tập đến lưu trữ và phân tích kết quả.

### 3.2. Mục tiêu cụ thể

- Cung cấp thư viện bài tập có khả năng tìm kiếm và lọc.
- Cho phép tạo, chỉnh sửa và sử dụng kế hoạch tập luyện.
- Hỗ trợ ghi nhận kết quả trong thời gian thực.
- Tự động lưu tiến trình buổi tập.
- Hiển thị lịch sử và các chỉ số tiến bộ.
- Hỗ trợ mục tiêu, thói quen và nhắc nhở.
- Cung cấp giao diện sáng và tối.
- Tổ chức mã nguồn theo module để thuận tiện bảo trì.
- Chuẩn bị cơ chế tích hợp backend và đồng bộ dữ liệu khi cần.

### 3.3. Phạm vi phiên bản đầu tiên

**Phạm vi cốt lõi (MVP):**

1. Đăng ký, đăng nhập và quản lý hồ sơ.
2. Onboarding và thiết lập ban đầu.
3. Thư viện bài tập.
4. Kế hoạch tập luyện.
5. Ghi nhận buổi tập và đồng hồ nghỉ.
6. Lưu trữ và xem lịch sử.
7. Thống kê tiến bộ cơ bản.
8. Mục tiêu và nhắc nhở cơ bản.
9. Cài đặt giao diện sáng/tối.
10. Lưu cục bộ và khôi phục buổi tập.

**Phạm vi mở rộng:**

- Phân tích chuyên sâu về hiệu suất.
- Đồng bộ đa thiết bị và quản lý xung đột dữ liệu.
- Tích hợp nguồn dữ liệu sức khỏe hoặc thiết bị bên ngoài.
- Cá nhân hóa kế hoạch dựa trên lịch sử tập luyện.
- Các tính năng nâng cao về phục hồi và thống kê.

Các tính năng mở rộng chỉ nên triển khai sau khi những luồng cốt lõi hoạt động ổn định.

### 3.4. Ranh giới và phụ thuộc của MVP

- MVP ưu tiên luồng sử dụng cá nhân trên một thiết bị: thiết lập hồ sơ, tìm bài tập, tạo kế hoạch, ghi nhận buổi tập, xem lịch sử/tiến bộ cơ bản và quản lý mục tiêu, nhắc nhở.
- Dữ liệu cốt lõi của buổi tập phải hoạt động và được lưu cục bộ khi không có mạng. Đồng bộ máy chủ không phải điều kiện để nghiệm thu các luồng cốt lõi.
- Đăng ký, đăng nhập và quản lý phiên vẫn thuộc phạm vi sản phẩm, nhưng cách tích hợp phụ thuộc quyết định backend và auth tại Phase 1.T02. Không tự suy diễn endpoint hoặc coi xác thực thật đã hoàn tất khi chưa có backend phù hợp.
- Phạm vi đồng bộ MVP chỉ có thể được xác nhận sau khi có backend, hợp đồng dữ liệu và quy tắc xung đột phù hợp; không bao gồm đồng bộ đa thiết bị nâng cao.
- Check-in phục hồi tự khai báo (FR-13) không thuộc luồng MVP cốt lõi; chỉ triển khai nếu được ưu tiên riêng.
- Phân tích chuyên sâu, tích hợp thiết bị/sức khỏe ngoài và cá nhân hóa kế hoạch nâng cao nằm ngoài MVP.

---

## 4. Yêu cầu chức năng và phi chức năng

### 4.1. Yêu cầu chức năng

| Mã | Yêu cầu | Mô tả |
|---|---|---|
| FR-01 | Xác thực | Đăng ký, đăng nhập, đăng xuất và quản lý phiên |
| FR-02 | Hồ sơ | Xem và cập nhật thông tin cá nhân |
| FR-03 | Onboarding | Thu thập mục tiêu, kinh nghiệm và lựa chọn ban đầu |
| FR-04 | Thư viện bài tập | Tìm kiếm, lọc và xem chi tiết bài tập |
| FR-05 | Kế hoạch tập | Tạo, xem và chỉnh sửa kế hoạch |
| FR-06 | Buổi tập | Bắt đầu, tạm dừng, tiếp tục và hoàn thành buổi tập |
| FR-07 | Ghi nhận hiệp | Lưu số lần lặp, mức tạ và trạng thái hoàn thành |
| FR-08 | Đồng hồ nghỉ | Bắt đầu, tạm dừng và kết thúc thời gian nghỉ |
| FR-09 | Tự động lưu | Bảo toàn dữ liệu trong buổi tập đang diễn ra |
| FR-10 | Lịch sử | Xem các buổi tập đã hoàn thành |
| FR-11 | Theo dõi tiến bộ | Hiển thị thống kê và biểu đồ phù hợp |
| FR-12 | Mục tiêu | Tạo và theo dõi mục tiêu tập luyện |
| FR-13 | Phục hồi | Ghi nhận cảm nhận phục hồi theo lựa chọn của người dùng |
| FR-14 | Thông báo | Nhắc lịch tập và các mục tiêu đã thiết lập |
| FR-15 | Cài đặt | Quản lý giao diện, quyền riêng tư và tùy chọn ứng dụng |
| FR-16 | Ngoại tuyến | Cho phép sử dụng các chức năng cốt lõi không cần mạng |
| FR-17 | Đồng bộ | Đưa dữ liệu cục bộ lên máy chủ khi có kết nối và cấu hình backend phù hợp |

### 4.2. Yêu cầu phi chức năng

**Hiệu năng**
- Giao diện phản hồi nhanh với các thao tác thường xuyên.
- Tránh tải lại toàn bộ màn hình khi chỉ thay đổi một hiệp tập.
- Phân trang hoặc tải theo nhu cầu đối với dữ liệu lớn.

**Độ tin cậy**
- Dữ liệu buổi tập phải được lưu định kỳ.
- Có thể khôi phục phiên tập chưa hoàn thành sau khi ứng dụng bị đóng.
- Xử lý lỗi mạng mà không làm mất dữ liệu đã ghi nhận.

**Bảo mật và quyền riêng tư**
- Không lưu mật khẩu dạng văn bản thuần.
- Sử dụng cơ chế xác thực phù hợp với backend.
- Lưu thông tin xác thực nhạy cảm trong vùng lưu trữ bảo mật.
- Chỉ yêu cầu quyền truy cập thiết bị khi chức năng thực sự cần.
- Cung cấp phương án quản lý, xuất hoặc xóa dữ liệu theo phạm vi hệ thống hỗ trợ.

**Khả năng bảo trì**
- Có quy ước đặt tên thống nhất.
- Tách giao diện, logic nghiệp vụ và tầng dữ liệu.
- Có kiểm thử cho các chức năng quan trọng.
- Dùng TypeScript để kiểm soát kiểu dữ liệu.

**Khả năng tiếp cận**
- Đảm bảo độ tương phản văn bản phù hợp.
- Hỗ trợ phóng to chữ theo cài đặt hệ điều hành.
- Không chỉ dùng màu sắc để biểu đạt trạng thái.
- Đảm bảo các nút quan trọng có vùng chạm đủ lớn.

---

## Phase II — Yêu cầu hệ thống quản lý phòng gym (Multi-Tenant)

> Trạng thái: **Thiết kế — chưa triển khai.** Đây là yêu cầu mục tiêu sau chuyển đổi định hướng (2026-10-23). Xem `mindmap.md` để biết roadmap.

### Mục tiêu Phase II

Xây dựng nền tảng quản lý phòng gym nhiều tenant, nhiều chi nhánh, phục vụ: Owner, Manager, Receptionist, Trainer và Member.

### FR-GM — Gym & Branch
| Mã | Yêu cầu | Mô tả |
|---|---|---|
| FR-GM-01 | Tạo gym | Owner tạo phòng gym mới (tenant) |
| FR-GM-02 | Quản lý gym | Sửa thông tin, cài đặt, trạng thái |
| FR-GM-03 | Tạo/quản lý branch | Tạo chi nhánh trong gym |
| FR-GM-04 | Mời nhân viên | Mời staff theo email + vai trò + branch |
| FR-GM-05 | Quản lý nhân viên | Xem, đổi vai trò, đình chỉ |

### FR-MB — Member Management
| Mã | Yêu cầu | Mô tả |
|---|---|---|
| FR-MB-01 | Tạo hồ sơ | Tạo thủ công; hội viên có thể chưa có tài khoản app |
| FR-MB-02 | Liên kết tài khoản | Liên kết hồ sơ với Supabase Auth |
| FR-MB-03 | Tìm kiếm | Tìm theo tên, SĐT, email, mã HV |
| FR-MB-04 | Lịch sử | Gói, check-in, giao dịch |
| FR-MB-05 | Trạng thái | Active / suspended / deleted (soft) |

### FR-MS — Membership
| Mã | Yêu cầu | Mô tả |
|---|---|---|
| FR-MS-01 | Danh mục gói | Tạo, sửa, deactivate |
| FR-MS-02 | Đăng ký gói | Cho hội viên |
| FR-MS-03 | Gia hạn | Tạo gói mới kế tiếp |
| FR-MS-04 | Tạm dừng/hủy | Với lý do; audit trail |
| FR-MS-05 | Đa chi nhánh | Quyền check-in nhiều branch |

### FR-AT — Attendance
| Mã | Yêu cầu | Mô tả |
|---|---|---|
| FR-AT-01 | Check-in thủ công | Receptionist tìm HV và check-in |
| FR-AT-02 | Kiểm tra điều kiện | Gói active, quyền branch, chống trùng |
| FR-AT-03 | Xem lịch | By member / branch / date |
| FR-AT-04 | QR check-in | Phase sau — chưa thiết kế |

### FR-PY — Payments
| Mã | Yêu cầu | Mô tả |
|---|---|---|
| FR-PY-01 | Ghi nhận thanh toán | Cash, chuyển khoản, POS; idempotent |
| FR-PY-02 | Hoàn tiền | Full/partial; audit trail |
| FR-PY-03 | Công nợ | amount_due vs amount_paid |
| FR-PY-04 | Báo cáo | Theo thời gian, branch, phương thức |

### FR-WPT — Workout & PT
| Mã | Yêu cầu | Mô tả |
|---|---|---|
| FR-WPT-01 | Tái sử dụng workout | Member dùng app mobile |
| FR-WPT-02 | Lịch PT | Tạo và quản lý lịch hẹn |
| FR-WPT-03 | Phân công PT | Gán trainer cho member |
| FR-WPT-04 | Quyền xem workout | Trainer xem data được giao |

### NFR-GM — Phi chức năng (bổ sung)
- Dữ liệu gym hoàn toàn cách biệt; không rò rỉ cross-tenant.
- RBAC đúng vai trò và branch; không dùng user_metadata để phân quyền.
- Mọi mutation đi qua gateway; không DML trực tiếp từ client.
- Giao dịch tài chính: audit trail đầy đủ, append-only, idempotent.
- Tìm kiếm hội viên < 2s với 10.000+ records; dashboard < 3s trên 4G.
