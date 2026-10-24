# BÁO CÁO TỔNG THỂ HỆ THỐNG GYM WORKOUT & ĐẶC TẢ PRODUCT VISION

> **Tên dự án:** Gym Workout — Multi-Tenant Gym Management Platform & Dual-Mode Workout Mobile Application  
> **Phiên bản:** Baseline Candidate v1.4 (Đã tích hợp Phạm vi Phê duyệt của Chủ Dự án)  
> **Ngày cập nhật:** 2026-10-23  
> **Trạng thái phê duyệt:**  
> - **APPROVED (Chủ dự án đã phê duyệt):** Gym Management là Core Product; Workout Mobile hỗ trợ Dual-Mode (Standalone Workout & Gym Member Mode); PT Management là phân hệ chính thức triển khai theo giai đoạn; Một Unified Roadmap tổng thể; Cấu trúc báo cáo 10 chương và 8 nhóm quy trình nghiệp vụ.  
> - **NOT YET APPROVED / PROPOSED / UNDECIDED (Chờ phê duyệt tại Gate P0.T07 / P0.T08 hoặc theo Phase):** Các lựa chọn kiến trúc chờ P0.T07 (D-MT-01 đến D-MT-04, D-MT-11); Thiết kế Schema GM-1 và các migration đề xuất; Tách Payment Core GM-3b sang Phase 4; Chính sách kích hoạt gói 100% thanh toán; Các quy tắc kinh doanh mở (BR-PAY, BR-PT, BR-AT, BR-MB...); Phương án phân tách 3 Release Gates; Chưa bắt đầu Phase 1.

---

## MỤC LỤC TỔNG THỂ

1. [Chương 1: Tổng quan Hệ thống và Product Vision](#chương-1-tổng-quan-hệ-thống-và-product-vision)
   - 1.1. Bối cảnh và Tầm nhìn Sản phẩm
   - 1.2. Định vị Sản phẩm Cốt lõi: Gym Management là trọng tâm
   - 1.3. Hệ sinh thái 2 Client chính: Admin Web Portal & Workout Mobile App (Dual-Mode)
   - 1.4. Đối tượng sử dụng và Giá trị mang lại
2. [Chương 2: Mô hình Vận hành & 8 Quy trình Nghiệp vụ End-to-End](#chương-2-mô-hình-vận-hành--8-quy-trình-nghiệp-vụ-end-to-end)
   - 2.1. Quy trình 1: Gym Onboarding và Quản lý Chi nhánh (Branches)
   - 2.2. Quy trình 2: Staff Onboarding, Phân quyền RBAC & Quản lý Kiêm nhiệm
   - 2.3. Quy trình 3: Member Onboarding, Bán gói tập và Kích hoạt Hội viên
   - 2.4. Quy trình 4: Điểm danh (Check-in) và Xử lý Ngoại lệ
   - 2.5. Quy trình 5: Thu phí, Hoàn tiền, Quản lý Công nợ và Đối soát Doanh thu
   - 2.6. Quy trình 6: Quản lý Huấn luyện viên cá nhân (PT Assignment, Scheduling & Session Consumption)
   - 2.7. Quy trình 7: Liên kết Tài khoản Hội viên (Account Linking & Ownership Verification)
   - 2.8. Quy trình 8: Standalone Workout Mode và Chuyển đổi sang Gym Member Mode
3. [Chương 3: Yêu cầu Hệ thống Tổng thể & Ranh giới Ngoại tuyến](#chương-3-yêu-cầu-hệ-thống-tổng-thể--ranh-giới-ngoại-tuyến)
   - 3.1. Ranh giới Ngoại tuyến (Offline Boundary): Workout Offline-First vs. Management Server-Authoritative
   - 3.2. Yêu cầu Chức năng Phân hệ Gym Management (FR-GM, FR-MB, FR-MS, FR-AT, FR-PY)
   - 3.3. Yêu cầu Chức năng Phân hệ Workout & PT (Bảo toàn 100% FR-01 đến FR-17 và FR-WPT)
   - 3.4. Yêu cầu Phi chức năng Tổng thể (NFR-SEC, NFR-DATA, NFR-PERF, NFR-MOB)
4. [Chương 4: Kiến trúc Hệ thống & Nguyên tắc Thiết kế](#chương-4-kiến-trúc-hệ-thống--nguyên-tắc-thiết-kế)
   - 4.1. Kiến trúc Tổng thể Đa tầng (Clients - Supabase Cloud Platform - Local SQLite)
   - 4.2. Cổng Quản trị Admin Web (Next.js, Server-First Cookie SSR Architecture) `[PROPOSED]`
   - 4.3. Ứng dụng Di động Workout Mobile (Expo/React Native, SQLite Offline-First, Dual-Mode) `[APPROVED]`
   - 4.4. Nền tảng Dữ liệu Đám mây (Supabase Multi-Tenant RLS theo gym_id) `[APPROVED]`
   - 4.5. Cổng Giao dịch Đột biến & Nguyên tắc Đặc quyền Tối thiểu (Mutation Gateway) `[PROPOSED]`
5. [Chương 5: Thiết kế Dữ liệu & Chiến lược Migration Tổng thể](#chương-5-thiết-kế-dữ-liệu--chiến-lược-migration-tổng-thể)
   - 5.1. Phân tầng Dữ liệu: Core Workout và Multi-Tenant Gym Management (GM-1 đến GM-5) `[PROPOSED]`
   - 5.2. Ranh giới Lưu trữ: Cloud Authority (PostgreSQL) và Local Cache (SQLite)
   - 5.3. Đối chiếu Hiện trạng Cơ sở Dữ liệu Thực tế (Verified Baseline vs. Not Verified Independently)
6. [Chương 6: Hệ thống Thiết kế (Design System) & Trải nghiệm Người dùng](#chương-6-hệ-thống-thiết-kế-design-system--trải-nghiệm-người-dùng)
   - 6.1. Design System Web Portal: Dashboard quản trị, bảng đối soát ca
   - 6.2. Design System Mobile App (Bảo toàn 100%): Minimalist Fitness, Dark/Light Theme WCAG 2.2 AA, Typography, Spacing, Tokens
7. [Chương 7: Đặc tả MVP Gym Management và Tiêu chí Nghiệm thu Phát hành](#chương-7-đặc-tả-mvp-gym-management-và-tiêu-chi-nghiệm-thu-phát-hành)
   - 7.1. Định nghĩa MVP: Chu trình Kinh doanh Khép kín (Closed Business Cycle)
   - 7.2. Phân định Payment Core (GM-3b) và Payment Advanced (GM-5) `[PROPOSED]`
   - 7.3. Phân tách Độc lập các Cổng Nghiệm thu Phát hành (Cổng 1, Cổng 2, Cổng 3) `[PROPOSED]`
   - 7.4. Tiêu chí Nghiệm thu Chức năng Ứng dụng Di động (Bảo toàn 100% AC-01 đến AC-12)
   - 7.5. Kịch bản Kiểm thử E2E Chu trình Kinh doanh Gym MVP (E2E Business Cycle Suite) `[PROPOSED]`
   - 7.6. Phạm vi Nghiệp vụ Triển khai theo Giai đoạn (Deferred / Staged Scope)
8. [Chương 8: Lộ trình Triển khai Tổng thể & Ma trận Phụ thuộc (Unified Roadmap)](#chương-8-lộ-trình-triển-khai-tổng-thể--ma-trận-phụ-thuộc-unified-roadmap)
   - 8.1. Cấu trúc Lộ trình Tích hợp (Phase 0 đến Phase 7) `[APPROVED]`
   - 8.2. Ma trận Phụ thuộc Toàn diện: Phase ➔ Schema ➔ Business Capability ➔ Acceptance Criteria
9. [Chương 9: Quản trị Rủi ro & Danh mục Quyết định](#chương-9-quản-trị-rủi-ro--danh-mục-quyết-định)
   - 9.1. Ma trận Rủi ro Trọng yếu (R-MT-01 đến R-MT-14)
   - 9.2. Decision Register Phân loại Chuẩn xác 5 Nhóm Trạng thái
   - 9.3. Danh mục Business Rules Còn Mở (Open Business Rules Register — UNDECIDED)
   - 9.4. Danh mục các Quyết định Chưa được Phê duyệt (Pending Owner Approval)
10. [Chương 10: Kết luận và Đề xuất Tiếp theo](#chương-10-kết-luận-và-đề-xuất-tiếp-theo)

---

## CHƯƠNG 1: TỔNG QUAN HỆ THỐNG VÀ PRODUCT VISION

### 1.1. Bối cảnh và Tầm nhìn Sản phẩm
Hệ thống Gym Workout được định hướng phát triển thành **Nền tảng Quản trị Phòng gym Đa tenant toàn diện kết hợp Ứng dụng Tập luyện Thông minh (Multi-Tenant Gym Management Platform)**. Nền tảng số hóa toàn diện quy trình kinh doanh và vận hành của các chuỗi phòng gym thương mại, từ quản lý chi nhánh, nhân sự, thẻ hội viên, điểm danh, tài chính thu chi đến quản lý huấn luyện viên cá nhân (PT), đồng thời cung cấp công cụ tự tập luyện độc lập hàng đầu cho người dùng di động.

### 1.2. Định vị Sản phẩm Cốt lõi `[APPROVED]`
- **Gym Management là sản phẩm trọng tâm (Core Commercial Product):** Là nền tảng phần mềm SaaS cốt lõi, giải quyết trực tiếp bài toán kinh doanh của chủ phòng gym: quản lý doanh thu, ngăn chặn thất thoát tiền mặt, kiểm soát quyền ra vào chi nhánh, tối ưu hóa năng suất nhân sự và nâng cao tỷ lệ giữ chân hội viên.
- **Workout Mobile là ứng dụng mở rộng giá trị (Value-Added Client):** Là kênh tương tác trực tiếp giữa phòng gym và hội viên; đồng thời giữ vai trò ứng dụng tập luyện độc lập (Standalone Workout App) hoàn chỉnh cho cộng đồng thể hình nói chung.

### 1.3. Hệ sinh thái 2 Client chính `[APPROVED]`
1. **Admin Web Portal (Dành cho Quản trị & Vận hành):** Ứng dụng Web dành cho Chủ phòng gym (Owner), Quản lý chi nhánh (Manager), Tiếp tân (Receptionist) và Huấn luyện viên (Trainer). Hoạt động tối ưu trên máy tính quầy lễ tân và thiết bị máy tính bảng.
2. **Workout Mobile App (Dành cho Hội viên, PT & Người tập tự do):** Ứng dụng di động iOS và Android (React Native + Expo SDK 57), xây dựng trên kiến trúc giao diện kép **Dual-Mode Architecture**:
   - *Chế độ Hội viên (Gym Member Mode):* Hiển thị thẻ hội viên điện tử, mã QR điểm danh, thông tin gói tập, lịch tập PT và thông báo phòng gym.
   - *Chế độ Tập luyện Độc lập (Standalone Workout Mode):* Thư viện bài tập, lập giáo án cá nhân, ghi nhật ký buổi tập (hiệp/tạ/reps), đồng hồ bấm giờ nghỉ, lưu trữ ngoại tuyến bằng SQLite cục bộ.

### 1.4. Đối tượng sử dụng và Giá trị mang lại

| Đối tượng | Vai trò trong Hệ thống | Nhu cầu & Giá trị Cung cấp |
|---|---|---|
| **Chủ phòng gym (Owner)** | Quản trị cấp cao nhất của Tenant | Nắm bắt dòng tiền thời gian thực, quản lý chuỗi chi nhánh, kiểm soát quyền hạn nhân sự, ngăn ngừa thất thoát. |
| **Quản lý chi nhánh (Manager)** | Điều hành vận hành cơ sở | Quản lý nhân viên chi nhánh, duyệt hợp đồng gói tập, xử lý ngoại lệ điểm danh, phân công PT và duyệt đối soát ca. |
| **Tiếp tân (Receptionist)** | Thao tác quầy trực tiếp | Tiếp nhận hội viên walk-in, bán gói tập, thu tiền mặt/POS, kiểm tra điểm danh tốc độ cao dưới 500ms. |
| **Huấn luyện viên (Trainer / PT)** | Hướng dẫn chuyên môn | Xem danh sách học viên phụ trách, xếp lịch dạy, ghi nhận hoàn thành buổi tập, theo dõi tiến độ thể hình học viên. |
| **Hội viên phòng gym (Gym Member)** | Khách hàng sử dụng dịch vụ | Sử dụng mã QR điểm danh không chạm, theo dõi thời hạn thẻ, đặt lịch PT, nhận thông báo gia hạn. |
| **Người tự tập luyện (Standalone User)** | Người tập thể hình tự do | Tra cứu bài tập, tự thiết kế giáo án, ghi chép buổi tập 100% offline, lưu trữ dữ liệu an toàn trên thiết bị cá nhân. |

---

## CHƯƠNG 2: MÔ HÌNH VẬN HÀNH & 8 QUY TRÌNH NGHIỆP VỤ END-TO-END

> **Nguyên tắc biên soạn:** Phân tách rõ ràng giữa **Nguyên tắc nghiệp vụ (Business Rules)** và **Chi tiết triển khai kỹ thuật**. Chương này tập trung vào luồng thao tác, tác nhân, điều kiện kiểm tra nghiệp vụ và kết quả vận hành. Chi tiết về câu lệnh SQL, DDL bảng, định nghĩa hàm RLS helper, Partial Index, RPC và tham số kỹ thuật được trích xuất và tham chiếu sang các tài liệu chuyên biệt: [`docs/gym-management.md`](./gym-management.md), [`docs/member-management.md`](./member-management.md), [`docs/membership.md`](./membership.md), [`docs/attendance.md`](./attendance.md), [`docs/payments.md`](./payments.md), [`docs/multi-tenancy.md`](./multi-tenancy.md), và [`docs/supabase-schema.md`](./supabase-schema.md). Mọi quy tắc nghiệp vụ chưa được chủ dự án phê duyệt chính thức đều được đánh dấu tường minh là `[PROPOSED]` hoặc `[UNDECIDED]`.

---

### 2.1. Quy trình 1: Gym Onboarding và Quản lý Chi nhánh (Branches)

#### Luồng Nghiệp vụ
1. **Đăng ký Chủ sở hữu (Owner Onboarding):** Chủ phòng gym đăng ký tài khoản xác thực hệ thống. Nhập thông tin doanh nghiệp: Tên phòng gym, mã định danh thương hiệu (slug duy nhất hệ thống), logo, hotline và múi giờ vận hành.
2. **Khởi tạo Chi nhánh (Branch Onboarding):** Owner tạo các chi nhánh vận hành: Tên chi nhánh, slug (duy nhất trong phạm vi phòng gym), địa chỉ cơ sở, hotline và giờ hoạt động.
3. **Quản lý Vòng đời Chi nhánh:** Chi nhánh được quản lý theo 3 trạng thái: Đang hoạt động (`active`), Tạm ngưng sửa chữa/bảo trì (`suspended`), và Đóng cửa/giải thể (`archived`).

#### Nguyên tắc Nghiệp vụ Cốt lõi
- **Bảo vệ Vết kiểm toán Kế toán (Audit Trail Protection):** Nghiêm cấm xóa vật lý bất kỳ chi nhánh nào nếu chi nhánh đó đã từng phát sinh nhân sự, hội viên, điểm danh hoặc giao dịch tài chính. Khi cơ sở dừng hoạt động, hệ thống áp dụng cơ chế **Lưu trữ mềm (Soft-Deactivation - archived)** nhằm lưu giữ toàn vẹn lịch sử đối soát và lập tức ngăn chặn các nghiệp vụ mới (bán gói, điểm danh) tại cơ sở đó.
- **Ngăn chặn Gán nhầm Chi nhánh Chéo phòng gym:** Hệ thống bắt buộc kiểm tra tính toàn vẹn để đảm bảo nhân viên và hội viên chỉ được gán vào chi nhánh thuộc quyền sở hữu của chính phòng gym đó, không thể xảy ra tình trạng rò rỉ chéo tenant. *(Chi tiết kỹ thuật Composite Key tham chiếu [`docs/gym-management.md`](./gym-management.md)).*
- **Cơ chế Khóa Phòng Gym khi Nợ cước / Vi phạm Điều khoản (`suspended`):** Khi phòng gym bị hệ thống đình chỉ dịch vụ, toàn bộ nhân viên chi nhánh (Manager, Receptionist, Trainer) lập tức bị ngắt quyền truy cập vào dữ liệu vận hành. Duy nhất tài khoản Owner được phép đăng nhập để xem thông báo nợ cước/lý do đình chỉ và thực hiện thanh toán gia hạn dịch vụ.

---

### 2.2. Quy trình 2: Staff Onboarding, Phân quyền RBAC & Quản lý Kiêm nhiệm

#### Luồng Nghiệp vụ
1. **Gửi lời mời Nhân viên (Staff Invite):** Chủ phòng gym hoặc Quản lý chi nhánh nhập email nhân sự, chọn vai trò (`manager`, `receptionist`, `trainer`) và phạm vi quản lý (chỉ định 1 chi nhánh cụ thể, hoặc toàn chuỗi phòng gym).
2. **Kích hoạt Tài khoản:** Nhân viên nhận email chứa liên kết mời an toàn, tạo mật khẩu và xác thực tài khoản. Trạng thái nhân sự chuyển từ Chờ kích hoạt (`invited`) sang Đang làm việc (`active`).
3. **Đình chỉ / Nghỉ việc:** Khi nhân viên nghỉ việc hoặc bị tạm đình chỉ công tác, Quản lý chuyển trạng thái sang `suspended`.

#### Nguyên tắc Nghiệp vụ Cốt lõi
- **Nguyên tắc Xác thực Quyền lực Máy chủ (Server-Enforced RBAC):** Quyền hạn của nhân viên được tính toán trực tiếp từ cơ sở dữ liệu vật lý tại thời điểm thực thi câu lệnh. Nghiêm cấm sử dụng thông tin do ứng dụng client tự khai báo để phân quyền. Nhân viên có trạng thái `invited` hoặc `suspended` lập tức bị tước quyền truy cập dữ liệu nghiệp vụ ngay tại request tiếp theo.
- **Quy tắc Kiêm nhiệm Đa chi nhánh và Loại trừ Lẫn nhau (Mutual Exclusivity) `[PROPOSED]`:**
  - Một nhân sự có thể kiêm nhiệm làm việc tại nhiều chi nhánh khác nhau với các vai trò tương ứng (ví dụ: làm Quản lý tại Cơ sở 1 và làm Huấn luyện viên tại Cơ sở 2).
  - Phương án đề xuất phân quyền: Nhân sự cấp toàn gym (General Manager) nắm quyền bao trùm trên mọi chi nhánh. Nếu một nhân sự bị đình chỉ cấp toàn gym, toàn bộ quyền tại các chi nhánh lẻ sẽ tự động bị vô hiệu hóa ngay lập tức. *(Chi tiết kỹ thuật 2 Partial Unique Indexes tham chiếu [`docs/multi-tenancy.md`](./multi-tenancy.md)).*

---

### 2.3. Quy trình 3: Member Onboarding, Bán gói tập và Kích hoạt Hội viên

#### Luồng Nghiệp vụ
1. **Tiếp nhận Hội viên tại Quầy (Walk-in Member):** Khách hàng đến phòng gym. Tiếp tân tạo hồ sơ hội viên: Họ tên, số điện thoại, email, ngày sinh, giới tính và chi nhánh đăng ký chính (`home_branch`). Hệ thống tự động cấp phát mã hội viên nội bộ (`member_code` `[UNDECIDED: quy tắc sinh mã BR-MB-01]`). Hồ sơ ban đầu chưa gắn với tài khoản ứng dụng di động.
2. **Chọn Gói tập:** Tiếp tân chọn gói từ danh mục gói đang mở bán (`membership_plans`), xác định các điều kiện: Thời hạn hiệu lực (số ngày), giá tiền, quyền sử dụng chi nhánh (chỉ cơ sở gốc, toàn bộ cơ sở, hay danh sách chỉ định), giới hạn lượt tập và số buổi PT đi kèm.
3. **Tạo Hợp đồng Gói tập:** Hệ thống lưu vết hợp đồng gói tập ở trạng thái Chờ kích hoạt (`pending`) kèm snapshot thông tin gói tại thời điểm ký kết để bảo toàn lịch sử khi biểu giá phòng gym thay đổi.
4. **Kích hoạt Gói tập (Membership Activation) `[PROPOSED: Chính sách MVP Kích hoạt 100% Thanh toán]`: Gói tập chỉ được kích hoạt sang trạng thái `active` sau khi đã ghi nhận giao dịch thanh toán đầy đủ 100% qua Payment Core `GM-3b`, trừ khi có chính sách công nợ khác được Chủ dự án phê duyệt.** Ngày bắt đầu (`start_date`) được xác lập và ngày hết hạn được tính toán tự động.

#### Nguyên tắc Nghiệp vụ Cốt lõi
- **Phụ thuộc vào Payment Core `GM-3b` `[PROPOSED]`:** Quy trình kích hoạt gói tập phụ thuộc trực tiếp vào việc ghi nhận thanh toán thành công (Payment Core). Đề xuất phân tách phần schema tối thiểu của `payment_transactions` (thống nhất đặt mã duy nhất là `GM-3b` `[PROPOSED]`) để phục vụ kích hoạt gói tập ngay trong Phase 4 mà không phải chờ toàn bộ phân hệ Payment Advanced ở Phase 5.
- **Bảo toàn Snapshot Hợp đồng Gói tập:** Giá bán, tên gói, quyền chi nhánh tại thời điểm ký kết là bất biến. Mọi sự thay đổi về giá hoặc chính sách của gói tập chung sau này tuyệt đối không làm thay đổi các hợp đồng đã ký của hội viên.

---

### 2.4. Quy trình 4: Điểm danh (Check-in) và Xử lý Ngoại lệ

#### Luồng Điểm danh Tiêu chuẩn
1. **Nhận diện Hội viên:** Hội viên đọc số điện thoại/mã thẻ tại quầy, hoặc xuất trình mã QR từ ứng dụng di động.
2. **Động cơ Kiểm tra Điều kiện Tự động (Pre-check-in Validation Engine):**
   - [x] Hồ sơ hội viên có đang ở trạng thái Hoạt động (`active`)?
   - [x] Hội viên có hợp đồng gói tập nào đang Hiệu lực (`active`)?
   - [x] Thời điểm hiện tại có nằm trong thời hạn gói (`start_date` đến `end_date`)?
   - [x] Chi nhánh hiện tại có nằm trong phạm vi được phép vào tập của gói (`access_scope`)?
   - [x] Gói có bị giới hạn số lượt không? Nếu có, số buổi còn lại có lớn hơn 0?
   - [x] Hội viên đã check-in trong khung giờ/ngày hôm nay chưa? `[UNDECIDED: Giới hạn số lượt/ngày tùy thuộc loại gói tập và cấu hình từng phòng gym — BR-AT-01]`.
3. **Ghi nhận Điểm danh:** Nếu toàn bộ điều kiện hợp lệ, hệ thống ghi nhận một lượt điểm danh vào nhật ký bất biến (`attendance_logs`), ghi nhận nhân viên thực hiện và trừ 1 lượt tập còn lại (nếu áp dụng).

#### Xử lý các Ngoại lệ Thường gặp
- **Gói hết hạn:** Giao diện quầy báo đỏ, từ chối vào tập, hiển thị ngày hết hạn và đề xuất nút "Gia hạn gói tập ngay".
- **Sai chi nhánh:** Từ chối điểm danh, nêu rõ danh sách chi nhánh hợp lệ của gói; cung cấp tùy chọn bán vé tập lẻ trong ngày hoặc nâng cấp gói tập liên chi nhánh.
- **Gói đang tạm dừng (Bảo lưu hoặc Nợ cước):** Từ chối điểm danh, yêu cầu liên hệ quản lý để mở khóa gói.
- **Thao tác lặp (Bấm đúp chuột / Quét mã 2 lần):** Hệ thống chặn tự động trong khung thời gian ngắn (ví dụ: cửa sổ thời gian 15 phút tại cùng cơ sở `[PROPOSED]`), thông báo rõ lượt điểm danh hợp lệ vừa được ghi nhận trước đó. *(Chi tiết bảng nhật ký điểm danh tham chiếu [`docs/attendance.md`](./attendance.md)).*

---

### 2.5. Quy trình 5: Thu phí, Hoàn tiền, Quản lý Công nợ và Đối soát Doanh thu

#### Luồng Nghiệp vụ Thu phí
1. **Ghi nhận Thanh toán (Payment Core `GM-3b` — Phase 4 `[PROPOSED]`):** Tiếp tân/Quản lý tạo phiếu thu gắn với hợp đồng gói tập hoặc dịch vụ phòng gym. Chọn phương thức: Tiền mặt (`cash`), Chuyển khoản ngân hàng (`bank_transfer`), Quẹt thẻ POS (`pos`). Client sinh mã khóa duy nhất (Idempotency Key) để ngăn chặn thu tiền trùng lặp khi bấm đúp hoặc mạng gián đoạn.
2. **Chuẩn hóa Kiểu dữ liệu Tiền tệ `[PROPOSED]`: Đề xuất lưu trữ số tiền bằng số nguyên đồng VND (`amount BIGINT`), không dùng số thập phân, phục vụ thị trường Việt Nam.** Hạn chốt quyết định kỹ thuật này được kéo về trước khi thiết kế migration Payment Core Phase 4.
3. **Xử lý Thanh toán Một phần & Công nợ (Payment Advanced — Phase 5 `[UNDECIDED]`):**
   - Cho phép ghi nhận số tiền thực đóng nhỏ hơn tổng giá trị hợp đồng.
   - Hệ thống ghi nhận số tiền còn nợ (`amount_due` - `amount_paid`).
   - **Chính sách Kích hoạt Gói khi còn Nợ `[UNDECIDED: BR-PAY-01]`: Phương án mặc định MVP là CHỈ kích hoạt khi thanh toán 100%. Chính sách cho phép kích hoạt gói khi khách còn nợ (ví dụ: đóng trước X%, gia hạn trả nợ Y ngày) là quy tắc mở cần Chủ dự án quyết định trước khi nghiệm thu Phase 4.**
4. **Xử lý Thanh toán Chờ xác nhận (Pending Verification) `[PROPOSED]`:**
   - Giao dịch chuyển khoản chờ đối soát ngân hàng được ghi nhận ở trạng thái `pending_verification`.
   - Gói tập tạm thời ở trạng thái Chờ kích hoạt (`pending_activation`). Quầy tiếp tân có thể cấp quyền tập tạm (Temporary Pass) theo thẩm quyền cho phép.
5. **Xử lý Giao dịch Thất bại & Gián đoạn Kết nối:**
   - Giao dịch lỗi được ghi nhận `failed` kèm nguyên nhân; không kích hoạt gói tập.
   - Khi mạng gián đoạn, client sử dụng Idempotency Key tra cứu trạng thái giao dịch trên server trước khi thử lại, ngăn ngừa thu tiền lặp 2 lần của khách hàng.

#### Tách biệt Quy trình Hoàn tiền và Điều chỉnh Quyền lợi Gói tập
- **Quy trình 1: Giao dịch Tài chính Hoàn tiền (Financial Refund Transaction):**
  - Chỉ Owner hoặc Manager có thẩm quyền duyệt hoàn tiền.
  - **Nguyên tắc Bất biến:** Không xóa hay sửa phiếu thu cũ. Hệ thống tạo phiếu hoàn tiền đảo ngược mới mang tính chất kế toán, liên kết chặt chẽ với phiếu thu gốc qua `parent_transaction_id`.
- **Quy trình 2: Điều chỉnh Quyền lợi Gói tập (Membership Entitlement Adjustment):**
  - **Hệ thống KHÔNG mặc định tự động hủy gói khi hoàn tiền 100% hoặc tự động giảm ngày/lượt khi hoàn tiền một phần.** (Ví dụ: Trường hợp hoàn tiền đền bù sự cố cơ sở vật chất nhưng hội viên vẫn được giữ nguyên thời hạn tập).
  - Việc điều chỉnh quyền lợi gói tập (hủy gói, rút ngắn ngày, giảm lượt) là một quyết định nghiệp vụ quản lý độc lập, đòi hỏi Quản lý/Owner chủ động thực hiện với lý do rõ ràng và được ghi nhận trong nhật ký kiểm toán (Audit Log).

#### Đối soát Doanh thu (Reconciliation)
- Cuối ca/ngày, tiếp tân thực hiện kết ca, đối soát số tiền mặt thu được thực tế với bảng kê hệ thống.
- Báo cáo phân quyền nghiêm ngặt: Tiếp tân chỉ xem ca của mình; Quản lý xem toàn chi nhánh; Chủ phòng gym xem tổng hợp chuỗi theo thời gian thực. *(Chi tiết kỹ thuật bảng tài chính tham chiếu [`docs/payments.md`](./payments.md)).*

---

### 2.6. Quy trình 6: Quản lý Huấn luyện viên cá nhân (PT Management)

#### Luồng Nghiệp vụ
1. **Bán Gói Dịch vụ PT:** Hội viên mua gói tập kèm số buổi PT hoặc mua hợp đồng huấn luyện viên cá nhân độc lập.
2. **Phân công Huấn luyện viên (PT Assignment):** Quản lý chi nhánh chỉ định Huấn luyện viên phụ trách hội viên, ghi nhận mục tiêu thể hình (tăng cơ, giảm mỡ, cải thiện sức bền).
3. **Thay đổi Huấn luyện viên (Reassignment / Handover):** Khi hội viên yêu cầu đổi PT hoặc nhân viên nghỉ việc:
   - Quản lý thực hiện bàn giao hồ sơ sang Huấn luyện viên mới.
   - Số buổi PT chưa sử dụng được chuyển giao nguyên vẹn sang Trainer mới.
   - **Thu hồi quyền tức thì:** Trainer cũ lập tức bị ngắt toàn bộ quyền xem nhật ký và thông tin của hội viên đó tại request tiếp theo.
4. **Đặt lịch, Đổi lịch và Hủy lịch (Scheduling & Rescheduling) `[UNDECIDED: BR-PT-01]`:**
   - Trainer hoặc Hội viên đặt lịch hẹn buổi tập (`pt_sessions`).
   - Đổi lịch: Cho phép dời lịch trước thời gian quy định của phòng gym.
   - **Chính sách xử lý khi hủy lịch muộn hoặc vắng mặt không báo trước (No-show) `[UNDECIDED]`: Việc có trừ buổi tập hay chỉ nhắc nhở/cảnh cáo là chính sách kinh doanh mở, chờ Chủ dự án quyết định hoặc cấu hình linh hoạt theo từng phòng gym; hệ thống không tự ý áp đặt chính sách trừ buổi.**
5. **Tiêu thụ Buổi tập (Session Consumption) `[UNDECIDED: BR-PT-02]`:**
   - Khi hoàn thành buổi tập, Trainer ghi nhận hoàn thành buổi tập trên hệ thống.
   - **Cơ chế xác nhận hoàn thành `[UNDECIDED]`: Phương thức xác thực (hội viên xác nhận qua OTP, quét mã QR, ký tên trên app, hay Trainer tự xác nhận) là quyết định mở cần thống nhất ở Phase 6.**
   - Sau khi hoàn thành hợp lệ, hệ thống trừ 1 buổi trong số buổi PT còn lại của gói tập (`pt_sessions_remaining`) và lưu vết phục vụ tính lương/hoa hồng cho Trainer.
6. **Điều chỉnh Sai sót (Session Adjustment / Rollback):**
   - Trường hợp trừ nhầm buổi do thao tác sai, Quản lý chi nhánh có quyền thực hiện nghiệp vụ hoàn lại buổi PT kèm lý do giải trình bắt buộc trong nhật ký kiểm toán.

#### Nguyên tắc Thu thập Dữ liệu Sức khỏe & Bảo vệ Quyền riêng tư
- **Nguyên tắc Giảm thiểu Dữ liệu Sức khỏe (Health Data Minimization):**
  - **Nghiêm cấm mặc định thu thập thông tin bệnh lý hoặc hồ sơ y tế nhạy cảm của hội viên.**
  - Chỉ đề xuất thu thập các chỉ số thể trạng cơ bản liên quan trực tiếp đến an toàn vận động (chiều cao, cân nặng, tiền sử chấn thương vận động cần tránh bài tập nặng) trên cơ sở:
    1. *Mục đích rõ ràng (Fit-for-purpose):* Đảm bảo an toàn bài tập cho hội viên.
    2. *Sự đồng ý rõ ràng và tự nguyện (Explicit Consent):* Hội viên chủ động đồng ý cung cấp.
    3. *Quyền truy cập tối thiểu (Least Privilege):* Chỉ Trainer được phân công trực tiếp mới được xem.
    4. *Quyền yêu cầu xóa bỏ (Right to Erasure):* Hội viên có quyền yêu cầu xóa bỏ dữ liệu thể trạng này bất kỳ lúc nào.
- **Mô hình Chấp thuận Chia sẻ Dữ liệu Tập luyện (Consent Model) `[PROPOSED: BR-PT-03]`:**
  - Phân công PT **KHÔNG** tự động mở toàn bộ lịch sử tập luyện cá nhân của hội viên.
  - Hội viên chủ động cấp quyền chia sẻ trên ứng dụng di động theo các phạm vi đề xuất (buổi tập PT hướng dẫn, hoặc buổi tự tập tại phòng gym đó).
  - Hội viên có quyền thu hồi quyền chia sẻ dữ liệu bất kỳ lúc nào qua ứng dụng di động; khi thu hồi, Trainer lập tức không thể xem dữ liệu tập luyện của hội viên tại request tiếp theo.

---

### 2.7. Quy trình 7: Liên kết Tài khoản Hội viên (Account Linking & Ownership Verification)

#### Bối cảnh Nghiệp vụ
Khách hàng ban đầu được tạo hồ sơ hội viên tại quầy lễ tân (Walk-in Member), chưa liên kết với tài khoản ứng dụng di động (`user_id = NULL`).

#### Luồng Liên kết An toàn (Security-Verified Linking Flow)
1. **Khởi tạo Liên kết:**
   - *Cách 1 (Hội viên chủ động):* Hội viên tải ứng dụng Workout Mobile, đăng ký tài khoản với Email/Số điện thoại khớp với thông tin đã khai báo tại quầy.
   - *Cách 2 (Tiếp tân hỗ trợ):* Tiếp tân bấm nút "Gửi mã kích hoạt ứng dụng" trên Admin Web.
2. **Xác minh Quyền Kiểm soát Danh tính (Verification of Control):**
   - Hệ thống bắt buộc gửi mã xác thực dùng một lần (OTP qua SMS) hoặc liên kết xác thực an toàn (Magic Link qua Email) tới đúng thông tin đã đăng ký tại quầy.
   - Hội viên nhập mã OTP để chứng minh quyền kiểm soát hòm thư/số điện thoại thực tế.
3. **Hoàn tất Liên kết Hồ sơ:**
   - Sau khi xác minh thành công, hệ thống liên kết hồ sơ hội viên phòng gym với tài khoản di động của người dùng.
   - Ứng dụng di động tự động mở khóa giao diện **Chế độ Hội viên**: Thẻ hội viên điện tử, mã QR điểm danh, thông tin gói tập, thời hạn và lịch tập PT.

#### Xử lý Ngoại lệ An toàn & Phòng chống Chiếm quyền Tài khoản
- **Thông tin liên hệ tại quầy bị nhập sai:** Hội viên xuất trình giấy tờ tùy thân (CCCD/CMND) tại quầy; tiếp tân đối soát và Quản lý phê duyệt cập nhật lại Email/Số điện thoại trên hồ sơ walk-in trước khi gửi lại mã xác minh.
- **Email hoặc Số điện thoại đã đổi chủ sở hữu (Sim rác/Đổi số):**
  - **Tuyệt đối không dùng "họ tên và ngày sinh" đơn thuần làm bằng chứng đủ để xác minh hoặc chuyển quyền sở hữu hồ sơ.**
  - Bắt buộc thực hiện quy trình xác minh danh tính độc lập tại quầy: Quản lý đối chiếu CCCD/CMND trực tiếp và ký duyệt biên bản xác minh chủ sở hữu hồ sơ trước khi kích hoạt quy trình đổi số điện thoại liên kết.
- **Hồ sơ đã bị liên kết với tài khoản khác (Nguy cơ Account Takeover):**
  - **Tuyệt đối không tự động ghi đè liên kết tài khoản đang tồn tại.**
  - Một hồ sơ hội viên tại 1 phòng gym chỉ được liên kết với duy nhất 1 tài khoản xác thực. Nếu phát sinh tranh chấp hoặc nghi ngờ chiếm quyền, hệ thống khóa tạm thời trạng thái liên kết và chuyển sang quy trình hủy liên kết (Unlink Workflow) yêu cầu xác thực đa yếu tố và phê duyệt của Quản lý chi nhánh.

#### Xử lý Hồ sơ Trùng lặp & Hoãn Tính năng Nâng cao (ALIGN-01)
- **Tình huống:** Hội viên từng được tạo 2 hồ sơ độc lập tại 2 chi nhánh khác nhau.
- **Kiểm tra Toàn vẹn Tiền xử lý (Pre-merge Inspection):**
  - Bắt buộc kiểm tra đồng thời trên cả 2 hồ sơ: Gói tập đang hoạt động (`status = 'active'`), số buổi tập còn lại (`sessions_remaining`), công nợ chưa thanh toán, lịch sử giao dịch tài chính (`payment_transactions`) và nhật ký điểm danh (`attendance_logs`).
  - **Nghiêm cấm mặc định lưu trữ (archive) hồ sơ phụ nếu hồ sơ đó còn gói active, còn buổi tập, còn công nợ hoặc có lịch sử giao dịch.**
  - **Đồng bộ hóa Schema & Trạng thái Quản lý (ALIGN-01):** Hệ thống không tự ý thêm giá trị trạng thái mới (như `under_review`) vào cột `status` của schema hiện hữu khi chưa được phê duyệt. Thay vào đó, cả 2 hồ sơ được giữ nguyên trạng thái vận hành hiện tại (`active`), đồng thời gắn **Cờ Rà soát Hành chính Nội bộ (Administrative Review Flag `[PROPOSED]`)** để nhân viên quầy và quản lý nhận diện đối soát thủ công; tuyệt đối không tự ý thay đổi dữ liệu hoặc xóa bỏ lịch sử.
- **Tính năng Sáp nhập Hồ sơ Nâng cao (Advanced Profile Merge — tự động gộp giao dịch tài chính và quyền lợi gói) chính thức đánh dấu là DEFERRED (Trì hoãn sang phase sau)** do cần thiết kế bổ sung quy tắc bảo toàn vết kiểm toán kế toán đa chi nhánh (`BR-MB-02`).

---

### 2.8. Quy trình 8: Standalone Workout Mode và Chuyển đổi sang Gym Member Mode

#### Chế độ Tập luyện Độc lập (Standalone Workout Mode)
- Dành cho người tập tự do, không tham gia bất kỳ phòng gym đối tác nào.
- Toàn bộ tính năng tập luyện cá nhân hoạt động độc lập và không cần kết nối mạng: Tra cứu bài tập, tạo giáo án cá nhân, ghi chép từng hiệp tập, bấm giờ nghỉ, lưu trữ ngoại tuyến bằng SQLite cục bộ.

#### Chuyển đổi sang Chế độ Hội viên (Gym Member Mode)
- Khi người dùng đăng ký thẻ tập tại một phòng gym trên hệ thống và hoàn tất liên kết tài khoản (theo Quy trình 7).
- Ứng dụng di động tự động kích hoạt giao diện tích hợp: Bổ sung thêm tab phòng gym, thông tin chi nhánh, mã QR check-in và lịch hẹn PT.

#### Nguyên tắc Bất khả Xâm phạm Dữ liệu Tập luyện Cá nhân (Data Ownership Invariant)
- **Quyền Sở hữu Tuyệt đối của Người dùng:** Toàn bộ nhật ký tập luyện cá nhân, các bài tập tự tạo và giáo án riêng của người dùng thuộc quyền sở hữu riêng của cá nhân. Phòng gym tuyệt đối không có quyền can thiệp, sửa đổi, khóa hoặc xóa dữ liệu tập luyện của hội viên.
- **Bảo toàn khi Rời Phòng gym:** Khi hội viên hết hạn gói tập, chuyển phòng gym hoặc chấm dứt hợp đồng hội viên: Ứng dụng di động chuyển mượt mà trở lại Chế độ Tập luyện Độc lập (Standalone Mode). Toàn bộ lịch sử tập luyện cá nhân được bảo toàn trên thiết bị và tài khoản người dùng, không bị mất dữ liệu.

---

## CHƯƠNG 3: YÊU CẦU HỆ THỐNG TỔNG THỂ & RANH GIỚI NGOẠI TUYẾN

### 3.1. Phân định Ranh giới Ngoại tuyến (Offline Boundary)

| Phân hệ / Nghiệp vụ | Tính chất Ranh giới | Cơ chế Hoạt động & Đảm bảo Toàn vẹn |
|---|---|---|
| **Workout Cá nhân** (Bài tập, Kế hoạch, Ghi hiệp, Timer, PR) | **Ngoại tuyến Cốt lõi (Offline-First Core)** | Hoạt động không cần kết nối Internet. Lưu trữ trực tiếp trên SQLite cục bộ (`gym-workout.db`). Đưa thay đổi vào hàng đợi đồng bộ nội bộ và gửi lên đám mây khi có kết nối mạng. |
| **Quản lý Gói tập (Membership)** (Đăng ký, Kích hoạt, Gia hạn, Hủy) | **Thẩm quyền Máy chủ (Server-Authoritative)** | Bắt buộc kiểm tra tính hợp lệ và cập nhật trên Server/Database tập trung. Không cho phép client tự động kích hoạt hoặc sửa đổi ngày hết hạn để chống gian lận. |
| **Điểm danh (Attendance)** (Check-in, Kiểm tra điều kiện gói) | **Trực tuyến Ưu tiên (Online-First)** | Điểm danh tại quầy kiểm tra điều kiện gói tập theo thời gian thực. *(Phương án Chế độ Điểm danh Khẩn cấp khi mất mạng quầy tiếp tân - Emergency Offline Queue - được đưa vào danh mục xem xét tại Phase 4 `[UNDECIDED: BR-AT-03]`).* |
| **Giao dịch Tài chính (Payments)** (Thu phí, Hoàn tiền, Công nợ) | **Trực tuyến Tuyệt đối (Strictly Online-First)** | Bắt buộc xác nhận trực tuyến với cơ chế Idempotency Key để đảm bảo tính toàn vẹn tài chính, chống ghi đúp và bảo vệ vết kiểm toán. |

### 3.2. Yêu cầu Chức năng Phân hệ Gym Management
- **FR-GM (Gym & Chi nhánh):** Khởi tạo phòng gym (tenant), quản lý thông tin chi nhánh, cơ chế soft-deactivation chi nhánh (`archived`), mời và phân quyền nhân viên đa chi nhánh.
- **FR-MB (Quản lý Hội viên):** Tạo hồ sơ hội viên walk-in, cấp mã định danh `member_code`, liên kết xác thực an toàn qua OTP, tra cứu hội viên tốc độ cao.
- **FR-MS (Gói tập):** Quản lý danh mục gói, đăng ký gói, lưu trữ snapshot hợp đồng, quản lý vòng đời gói tập (pending, active, suspended, expired, cancelled).
- **FR-AT (Điểm danh):** Kiểm tra điều kiện điểm danh tự động 6 bước, ghi nhật ký điểm danh bất biến, xử lý ngoại lệ sai chi nhánh / quá hạn / thao tác lặp.
- **FR-PY (Tài chính & Thu chi):** Ghi nhận phiếu thu với Idempotency Key, xử lý thanh toán một phần/công nợ, hoàn tiền qua phiếu đảo ngược, đối soát doanh thu ca/ngày.

### 3.3. Yêu cầu Chức năng Phân hệ Workout & PT (Bảo toàn 100%)

#### Nhóm Chức năng Workout Cá nhân (FR-01 đến FR-17)

| Mã | Tên Yêu cầu | Mô tả Nghiệp vụ & Kỹ thuật Chi tiết |
|---|---|---|
| **FR-01** | Xác thực Người dùng | Đăng ký tài khoản, đăng nhập bằng email/mật khẩu, đăng xuất an toàn và quản lý phiên làm việc thông qua Supabase Auth. Lưu trữ thông tin xác thực nhạy cảm trong Expo SecureStore. |
| **FR-02** | Quản lý Hồ sơ Cá nhân | Xem, chỉnh sửa thông tin cá nhân: Họ tên, ngày sinh, giới tính, chiều cao, cân nặng ban đầu và ảnh đại diện. |
| **FR-03** | Khảo sát Ban đầu (Onboarding) | Thu thập mục tiêu tập luyện (tăng cơ, giảm mỡ, rèn sức bền), trình độ kinh nghiệm (mới tập, trung cấp, nâng cao) và số buổi tập dự kiến trong tuần. |
| **FR-04** | Thư viện Bài tập | Tra cứu danh mục bài tập chuẩn; tìm kiếm theo tên bài tập; lọc bài tập đa tiêu chí: nhóm cơ chính/phụ, loại thiết bị dụng cụ và cấp độ khó; hiển thị hướng dẫn kỹ thuật chi tiết. |
| **FR-05** | Kế hoạch Tập luyện (Workout Plans) | Tạo mới giáo án cá nhân, tùy biến danh sách bài tập, thiết lập số hiệp mục tiêu, mức tạ đề xuất, số reps và thời gian nghỉ giữa các hiệp. |
| **FR-06** | Buổi tập Đang Diễn ra (Active Session) | Bắt đầu buổi tập từ giáo án có sẵn hoặc buổi tập tự do; tạm dừng, tiếp tục và kết thúc buổi tập; hỗ trợ chuyển trạng thái linh hoạt. |
| **FR-07** | Ghi nhận Hiệp tập (Set Logging) | Ghi nhận nhanh mức tạ (kg/lbs quy đổi chuẩn về gram), số lần lặp (reps), kiểu hiệp (Warmup, Normal, Drop set, Failure) và đánh dấu hoàn thành hiệp bằng 1 chạm. |
| **FR-08** | Đồng hồ Bấm giờ Nghỉ (Rest Timer) | Bấm giờ đếm ngược thời gian nghỉ giữa các hiệp; tính toán thời gian dựa trên mốc thời gian kết thúc dự kiến (`timestamp`) để không bị sai lệch khi ứng dụng chuyển xuống nền (background). |
| **FR-09** | Tự động Lưu & Khôi phục (Auto-Save) | Tự động lưu tiến trình buổi tập theo thời gian thực vào SQLite; hỗ trợ khôi phục trọn vẹn phiên tập dở dang khi ứng dụng bị tắt đột ngột hoặc điện thoại hết pin. |
| **FR-10** | Lịch sử Buổi tập (Workout History) | Xem danh sách các buổi tập đã hoàn thành theo dòng thời gian (ngày, tháng); xem chi tiết từng bài tập, tổng khối lượng tạ (volume) và thời lượng tập. |
| **FR-11** | Theo dõi Tiến bộ (Progress Tracking) | Phân tích xu hướng tập luyện qua biểu đồ khối lượng (Volume Progression); thống kê kỷ lục cá nhân (Personal Record - PR) cho từng bài tập cụ thể. |
| **FR-12** | Mục tiêu & Thói quen (Goals & Habits) | Thiết lập mục tiêu tần suất tập luyện hàng tuần; theo dõi chuỗi ngày tập liên tục (Streak) và tỷ lệ hoàn thành mục tiêu. |
| **FR-13** | Tự Đánh giá Phục hồi (Recovery Check-in) | Cho phép người dùng tự đánh giá cảm nhận cơ thể (đau cơ, mức năng lượng, chất lượng giấc ngủ) theo thang điểm định tính; tuyệt đối không đưa ra chẩn đoán y tế. |
| **FR-14** | Thông báo Nhắc nhở (Notifications) | Đặt lịch thông báo nhắc giờ tập theo thói quen; gửi thông báo hoàn thành đếm ngược thời gian nghỉ thông qua Expo Notifications. |
| **FR-15** | Cài đặt Ứng dụng (App Settings) | Quản lý tùy chọn giao diện (Light Theme / Dark Theme / Hệ thống), đơn vị đo lường (kg/lbs), quyền riêng tư và xuất/xóa dữ liệu cá nhân. |
| **FR-16** | Chế độ Ngoại tuyến Tuyệt đối (Offline-First) | Toàn bộ các thao tác cốt lõi (FR-04 đến FR-10) hoạt động trơn tru không cần kết nối Internet; đọc ghi trực tiếp trên SQLite cục bộ. |
| **FR-17** | Hàng đợi Đồng bộ Đám mây (Sync Queue) | Đưa các thay đổi dữ liệu cục bộ vào hàng đợi đồng bộ (`sync_queue`), tự động đẩy lên Supabase Cloud khi thiết bị kết nối mạng trở lại với cơ chế Idempotency Key. |

#### Nhóm Chức năng Huấn luyện viên Cá nhân (FR-WPT)
- **FR-WPT-01 (Phân công & Bàn giao PT):** Hiển thị thông tin Trainer phụ trách; xử lý chuyển giao số buổi PT còn lại khi đổi huấn luyện viên; thu hồi quyền truy cập tức thì của Trainer cũ.
- **FR-WPT-02 (Lịch hẹn PT):** Đặt lịch hẹn buổi tập cá nhân với PT; hỗ trợ dời lịch và thông báo xác nhận lịch hẹn.
- **FR-WPT-03 (Khấu trừ Buổi tập PT):** Ghi nhận hoàn thành buổi tập với cơ chế xác thực 2 chiều; tự động trừ 1 buổi trong hợp đồng của hội viên.
- **FR-WPT-04 (Mô hình Chấp thuận Chia sẻ Dữ liệu — Consent Model `[PROPOSED: BR-PT-03]`):** Hội viên chủ động cấp quyền chia sẻ lịch sử tập luyện cho Trainer phụ trách; có quyền thu hồi quyền xem dữ liệu bất kỳ lúc nào trên ứng dụng di động.

### 3.4. Yêu cầu Phi chức năng Tổng thể (NFR)
- **NFR-SEC-01 (Cách ly Tenant):** Dữ liệu giữa các phòng gym được cách ly; không thể truy vấn chéo dữ liệu giữa các tenant khác nhau.
- **NFR-SEC-02 (Kiểm soát Quyền Server-side):** Toàn bộ quyền hạn dựa trên cơ sở dữ liệu vật lý; nhân viên bị đình chỉ bị chặn truy cập ngay tại request tiếp theo.
- **NFR-DATA-01 (Toàn vẹn Dữ liệu Tài chính):** Giao dịch tài chính là append-only, hỗ trợ Idempotency Key chống ghi trùng lặp.
- **NFR-PERF-01 (Hiệu năng Vận hành):** Tra cứu hội viên tại quầy phản hồi dưới 1 giây; thao tác điểm danh phản hồi dưới 500 ms trong điều kiện mạng ổn định.
- **NFR-MOB-01 (Độc lập Ngoại tuyến):** Ứng dụng di động tự tập phản hồi ngay lập tức, không phụ thuộc độ trễ mạng Internet.

---

## CHƯƠNG 4: KIẾN TRÚC HỆ THỐNG & NGUYÊN TẮC THIẾT KẾ

> **Nguyên tắc biên soạn:** Chương này mô tả các nguyên tắc kiến trúc cấp cao. Toàn bộ chi tiết kỹ thuật về DDL bảng, SQL, hàm RLS helper, Partial Index, RPC được chuyển và tham chiếu đến các tài liệu module kỹ thuật: [`docs/architecture.md`](./architecture.md), [`docs/admin-web.md`](./admin-web.md), [`docs/multi-tenancy.md`](./multi-tenancy.md), và [`docs/supabase-schema.md`](./supabase-schema.md).

### 4.1. Kiến trúc Tổng thể Đa tầng (Client-Server-Database)
Hệ thống xây dựng theo mô hình dịch vụ đám mây tập trung phục vụ 2 nhóm máy trạm (clients):
1. **Tầng Giao diện Người dùng (Clients):**
   - *Admin Web Portal `[PROPOSED]`:* Xây dựng bằng Next.js App Router, phục vụ công tác điều hành và vận hành quầy tiếp tân.
   - *Workout Mobile App `[APPROVED]`:* Xây dựng bằng React Native + Expo SDK 57, phục vụ hội viên và cộng đồng người tập thể hình.
2. **Tầng Nền tảng Dữ liệu & Backend (Supabase Platform) `[APPROVED]`:**
   - Dịch vụ Xác thực tập trung (Supabase Auth).
   - Cơ sở dữ liệu quan hệ PostgreSQL với cơ chế phân quyền theo dòng (Row Level Security - RLS) gắn chặt với `gym_id`.
   - Cổng Giao dịch Đột biến (Mutation Gateway) `[PROPOSED]`: Kết hợp Edge Functions (xử lý logic nghiệp vụ, mời nhân viên) và PostgreSQL RPC `SECURITY DEFINER` (xử lý các giao dịch kế toán và ghi chép đa bảng theo chuẩn ACID).
   - Áp dụng nguyên tắc đặc quyền tối thiểu (Least Privilege): Thu hồi quyền ghi trực tiếp từ client lên các bảng quản lý đồng bộ.

### 4.2. Kiến trúc Bảo mật Phiên Web (Server-First Cookie SSR Architecture) `[PROPOSED]`
- Quản lý phiên làm việc trên Admin Web bằng HTTP Cookies (`httpOnly: true, secure: true, sameSite: 'lax'`) thông qua `@supabase/ssr`.
- Bảo vệ mã phiên bằng cách không lưu trữ token trong `localStorage` và cấu hình cấm JavaScript client truy cập trực tiếp cookie.
- Phân quyền điều hướng trên Web được kiểm tra từ Middleware và Server Components máy chủ.

### 4.3. Ứng dụng Di động Workout Mobile (Expo/React Native) `[APPROVED]`
- Kiến trúc module hóa theo tính năng (Feature-based Modular Architecture).
- Điều hướng dựa trên tệp với Expo Router.
- Lưu trữ cục bộ hoàn chỉnh bằng Expo SQLite v1 (`gym-workout.db`).
- Khử phụ thuộc bộ đếm JavaScript: Tính thời gian nghỉ dựa trên mốc thời gian (`timestamp`).

---

## CHƯƠNG 5: THIẾT KẾ DỮ LIỆU & CHIẾN LƯỢC MIGRATION TỔNG THỂ

### 5.1. Phân tầng Cơ sở Dữ liệu & Danh mục Nhóm Migration Chuẩn hóa `[PROPOSED]`
1. **Phân hệ Core Workout (Đã có):** Gồm 7 bảng phục vụ tập luyện cá nhân (`users`, `exercises`, `workout_plans`, `plan_exercises`, `workout_sessions`, `session_exercises`, `workout_sets`).
2. **Phân hệ Multi-Tenant Gym Management (Mở rộng theo Phase):**
   - *Nhóm GM-1 (Phòng gym & Nhân sự) `[PROPOSED]`:* `gyms`, `branches`, `gym_staff`.
   - *Nhóm GM-2 (Hội viên) `[PROPOSED]`:* `gym_members`.
   - *Nhóm GM-3 (Gói tập) `[PROPOSED]`:* `membership_plans`, `membership_plan_branches`, `memberships`.
   - *Nhóm GM-3b (Payment Core Tối thiểu) `[PROPOSED]`:* Bảng `payment_transactions` tối thiểu (`id`, `gym_id`, `branch_id`, `member_id`, `membership_id`, `amount BIGINT`, `payment_method`, `status`, `idempotency_key`, `recorded_by`, `recorded_at`, `created_at`, `version`) phục vụ ghi nhận phiếu thu kích hoạt gói tập ngay trong Phase 4. Đã thống nhất đặt mã duy nhất là `GM-3b` để xóa bỏ hoàn toàn sự mơ hồ kỹ thuật.
   - *Nhóm GM-4 (Điểm danh) `[PROPOSED]`:* `attendance_logs`.
   - *Nhóm GM-5 (Tài chính Nâng cao & PT) `[PROPOSED]`:* Mở rộng `payment_transactions` (refunds, công nợ, đối soát), `pt_sessions`, `pt_member_assignments`.

### 5.2. Đối chiếu Hiện trạng Cơ sở Dữ liệu Thực tế
- **VERIFIED BASELINE (Kiểm tra tĩnh trong Source Code):** 6 bảng SQLite v1 trên ứng dụng di động (`exercises`, `workout_plans`, `plan_exercises`, `workout_sessions`, `session_exercises`, `workout_sets`). *(Bằng chứng: [`src/shared/storage/schema.ts`](../src/shared/storage/schema.ts#L10-L115))*.
- **VERIFIED IN HISTORICAL TEST SUITES (Đã kiểm thử trong các phiên trước):** Toàn bộ bộ test Jest kiểm tra migration và repositories SQLite v1 đã đạt theo biên bản nghiệm thu trước đây. *(Bằng chứng: [`__tests__/storage-test.ts`](../__tests__/storage-test.ts); lưu ý trong phiên hiện tại chưa chạy lại lệnh `npm test` do tuân thủ nguyên tắc READ-ONLY)*.
- **NOT VERIFIED INDEPENDENTLY (Trạng thái Supabase Cloud báo cáo bởi người dùng ngày 2026-10-22):** 4 file migration v1 cho 7 bảng core workout đã chạy thủ công trong SQL Editor; RLS bật trên cả 7 bảng; `service_role` và `anon` bị thu hồi quyền bảng. *(Chưa được kiểm chứng độc lập trong phiên làm việc; kiểm thử local T13 vẫn BLOCKED; không đánh đồng đây là quyết định đã phê duyệt hay verified production)*.
- **Toàn bộ Phân hệ Gym Management (GM-1 đến GM-5):** Đang ở trạng thái **ĐẶC TẢ THIẾT KẾ (PROPOSED)**, chưa tạo file migration và chưa thực thi SQL.

---

## CHƯƠNG 6: HỆ THỐNG THIẾT KẾ (DESIGN SYSTEM) & TRẢI NGHIỆM NGƯỜI DÙNG

### 6.1. Design System Web Portal
- Tối ưu hóa cho nghiệp vụ quầy lễ tân: Giao diện mật độ thông tin cao, hỗ trợ phím tắt tìm kiếm hội viên và quét điểm danh nhanh.
- Thiết kế Dashboard phân cấp: Chủ chuỗi xem báo cáo tổng hợp dòng tiền; Quản lý xem chỉ số chi nhánh; Tiếp tân xem ca làm việc trực quan.

### 6.2. Design System Mobile App (Bảo toàn 100%)

#### Triết lý Thiết kế & Định vị
- **Phong cách:** Minimalist Fitness + Performance — Tối ưu hóa sự tập trung, loại bỏ chi tiết thừa, ưu tiên thao tác một tay trong phòng tập.
- **Quy chuẩn Tiếp cận:** Đạt chuẩn độ tương phản **WCAG 2.2 AA**, vùng chạm tối thiểu **44 × 44 px**, chiều cao nút bấm chính **48 px**, hệ thống khoảng cách spacing theo bội số **4/8 px**.

#### Bảng màu Chuẩn hóa (Color Tokens)

| Token | Dark Theme HEX | Light Theme HEX | Ứng dụng & Ý nghĩa Giao diện | Tỷ lệ Tương phản WCAG |
|---|---|---|---|---|
| `background` | `#121417` | `#F7F8FA` | Nền màn hình chính | Nền chuẩn |
| `surface` | `#1C2025` | `#FFFFFF` | Nền thẻ (card), thanh điều hướng, modal | Phân tách lớp nội dung |
| `surface-elevated` | `#292F36` | `#E8ECF1` | Thành phần nổi, chip, trường input | Tăng chiều sâu thị giác |
| `text-primary` | `#F4F6F8` | `#171A1F` | Văn bản chính, tiêu đề, số đo tạ/reps | > 16:1 (Đạt AAA) |
| `text-secondary` | `#B0B8C2` | `#525B66` | Văn bản phụ, nhãn chú thích, thời gian | > 6.4:1 (Đạt AA & AAA) |
| `brand-primary` | `#FF6B35` | `#C94718` | Nút hành động chính (Primary CTA), điểm nhấn | > 4.7:1 (Đạt AA) |
| `info` | `#65BFFF` | `#075EA8` | Thông tin, hướng dẫn, trạng thái đang chờ | > 6.5:1 (Đạt AA & AAA) |
| `success` | `#57D68D` | `#167447` | Điểm danh thành công, hoàn thành hiệp, PR mới | > 5.8:1 (Đạt AA) |
| `danger` | `#FF7777` | `#B42318` | Lỗi điểm danh, gói hết hạn, xóa dữ liệu | Cảnh báo rõ ràng |

#### Typography & Spacing Tokens
- **Typography:** Font **Inter** (hoặc System font) hỗ trợ đầy đủ tiếng Việt.
  - `display`: 32 px / Bold (Số liệu PR nổi bật)
  - `h1`: 28 px / Bold (Tiêu đề màn hình)
  - `h2`: 24 px / Bold (Tiêu đề nhóm nội dung)
  - `h3`: 20 px / Semi-bold (Tiêu đề thẻ bài tập)
  - `title`: 18 px / Semi-bold (Tiêu đề thành phần)
  - `body`: 16 px / Regular (Nội dung chính, số đo hiệp)
  - `body-small`: 14 px / Regular (Nội dung phụ, hướng dẫn)
  - `caption`: 12 px / Regular (Chú thích, mốc thời gian)
- **Hệ thống Spacing (Đơn vị cơ sở 4 px):** `space-1` (4px), `space-2` (8px), `space-3` (12px), `space-4` (16px - padding thẻ), `space-5` (20px - lề màn hình), `space-6` (24px), `space-8` (32px).

#### Cấu trúc Điều hướng 5 Tab (Mobile Bottom Navigation)
1. **Home:** Lịch tập gần nhất, chỉ số tổng quan trong tuần, nút bắt đầu buổi tập nhanh.
2. **Workouts:** Quản lý giáo án, danh sách kế hoạch tập luyện, lịch sử buổi tập.
3. **Exercises:** Thư viện tra cứu bài tập, bộ lọc nhóm cơ và thiết bị.
4. **Progress:** Biểu đồ thể tích khối lượng tạ (Volume), danh sách kỷ lục cá nhân (PR).
5. **Profile / Gym:** Hồ sơ cá nhân, cài đặt giao diện, chuyển đổi mượt mà giữa Standalone Mode và Gym Member Mode (thẻ QR, chi nhánh, gói tập).

---

## CHƯƠNG 7: ĐẶC TẢ MVP GYM MANAGEMENT VÀ TIÊU CHÍ NGHIỆM THU PHÁT HÀNH

### 7.1. Định nghĩa MVP: Chu trình Kinh doanh Khép kín (Closed Business Cycle)
MVP Gym Management là một **Chu trình Kinh doanh Khép kín** hoàn chỉnh có thể vận hành và nghiệm thu thực tế:

```text
[Khởi tạo Gym & Chi nhánh] ──► [Mời Nhân viên & Phân quyền] ──► [Tạo Gói tập]
            │
            ▼
[Tiếp nhận Hội viên] ──► [Bán gói & Thu phí (Payment Core GM-3b)] ──► [Điểm danh tại quầy] ──► [Đối soát Báo cáo]
```

### 7.2. Phân định Payment Core và Payment Advanced `[PROPOSED]`
- **Payment Core (Nhóm GM-3b — Sẵn sàng Phase 4 `[PROPOSED]`):**
  - Ghi nhận phiếu thu tiền mặt/chuyển khoản với trạng thái `completed`.
  - Hỗ trợ mã Idempotency Key chống ghi trùng lặp.
  - Số tiền lưu bằng số nguyên đồng VND (`amount BIGINT` `[PROPOSED]`).
  - Cập nhật liên kết trực tiếp với hợp đồng gói tập `membership_id` để kích hoạt gói từ `pending` sang `active` theo chính sách thanh toán đầy đủ 100%.
- **Payment Advanced (Nhóm GM-5 — Phase 5 `[PROPOSED]`):**
  - Quản lý công nợ phức tạp và lịch trình trả góp.
  - Tích hợp cổng thanh toán trực tuyến tự động qua Webhook.
  - Báo cáo phân tích doanh thu đa chiều và đối soát ngân hàng tự động.

### 7.3. Phân tách Độc lập các Cổng Nghiệm thu Phát hành `[PROPOSED]`

#### Cổng 1: Gym Management MVP Release Gate (Nghiệm thu sau Phase 5 `[PROPOSED]`)
*Độc lập hoàn toàn với phân hệ PT; cho phép phát hành sớm hệ thống quản trị phòng gym cho các cơ sở không có nhu cầu PT:*

| Mã Tiêu chí | Nhóm Kiểm định | Điều kiện Nghiệm thu Định lượng Bắt buộc |
|---|---|---|
| **AC-REL-01** | **Tenant Isolation** | 100% các câu truy vấn thử nghiệm chéo giữa 2 tài khoản thuộc 2 phòng gym khác nhau bị từ chối; kết quả trả về rỗng hoặc lỗi phân quyền. |
| **AC-REL-02** | **RBAC & Active Enforcement** | Nhân viên bị chuyển sang trạng thái `suspended` bị từ chối thực hiện mọi mutation và query nghiệp vụ ngay tại request tiếp theo. |
| **AC-REL-03** | **Transaction Idempotency** | Gửi lặp 10 requests thanh toán hoặc điểm danh đồng thời với cùng Idempotency Key chỉ sinh ra duy nhất 1 bản ghi giao dịch trong cơ sở dữ liệu. |
| **AC-REL-04** | **Attendance Consistency** | Động cơ kiểm tra điều kiện từ chối điểm danh chính xác 100% trong các ca kiểm thử: gói hết hạn, sai chi nhánh, gói bị tạm dừng, hoặc hết số lượt tập. |
| **AC-REL-06** | **Mobile Regression Suite** | Toàn bộ bộ test suites tự động cho phân hệ tập luyện cá nhân (AC-01 đến AC-12) đạt tỷ lệ Pass 100%, không phát sinh lỗi nghiêm trọng (Blocker/Critical = 0). |

#### Cổng 2: PT & Personal Training Integration Gate (Nghiệm thu sau Phase 6 `[PROPOSED]`)
*Áp dụng nghiệm thu riêng tại Phase 6 khi phân hệ Huấn luyện viên cá nhân hoàn thành:*

| Mã Tiêu chí | Nhóm Kiểm định | Điều kiện Nghiệm thu Định lượng Bắt buộc |
|---|---|---|
| **AC-REL-05** | **PT Privacy & Explicit Consent** | Huấn luyện viên bị từ chối truy cập dữ liệu tập luyện của hội viên khi chưa có bản ghi chấp thuận (Consent); thu hồi quyền có hiệu lực ngay ở request tiếp theo. |
| **AC-REL-07** | **PT Scheduling & Consumption** | Đặt lịch PT không bị trùng giờ; hoàn thành buổi tập hợp lệ tự động khấu trừ chính xác 1 buổi trong `pt_sessions_remaining` của hội viên. |

#### Cổng 3: Full Platform Production Release Gate (Phase 7 `[PROPOSED]`)
*Áp dụng nghiệm thu tổng thể toàn nền tảng sau khi hoàn tất kiểm thử tải (Performance Testing), bảo mật chuyên sâu (Security Hardening), kiểm thử E2E đa vai trò và xác minh runtime trên cả iOS và Android.*

---

### 7.4. Tiêu chí Nghiệm thu Chức năng Ứng dụng Di động (Bảo toàn 100% AC-01 đến AC-12)

| Mã Tiêu chí | Hạng mục Kiểm thử | Điều kiện Nghiệm thu Đo lường Được (Acceptance Criteria) |
|---|---|---|
| **AC-01** | Xác thực & Phiên làm việc | Đăng ký, đăng nhập thành công trả về JWT token hợp lệ lưu trong SecureStore; xử lý đúng mã lỗi khi sai mật khẩu; đăng xuất xóa sạch phiên. |
| **AC-02** | Thư viện Bài tập | Tìm kiếm theo từ khóa phản hồi dưới 300ms; lọc theo nhóm cơ và thiết bị trả về chính xác 100% bài tập thỏa mãn điều kiện lọc. |
| **AC-03** | Kế hoạch Tập luyện | Tạo kế hoạch mới lưu thành công vào SQLite; chỉnh sửa thứ tự bài tập và thông số hiệp được bảo toàn nguyên vẹn sau khi thoát màn hình. |
| **AC-04** | Ghi nhận Hiệp tập | Nhập số kg và reps hợp lệ lưu ngay vào cơ sở dữ liệu cục bộ; hiển thị dấu tích xanh hoàn thành; không bị mất dữ liệu khi chuyển qua ứng dụng khác. |
| **AC-05** | Đồng hồ Nghỉ (Rest Timer) | Đếm ngược chính xác; tính toán thời gian còn lại dựa trên `target_end_timestamp` khi ứng dụng quay lại từ background; gửi thông báo rung haptic khi hết giờ. |
| **AC-06** | Tự động Lưu & Khôi phục | Khi ứng dụng bị tắt đột ngột (crash/kill process), mở lại ứng dụng hiển thị thông báo "Khôi phục buổi tập dở dang" với 100% số hiệp đã ghi nhận trước đó. |
| **AC-07** | Độc lập Ngoại tuyến | Ngắt kết nối Wi-Fi/4G: Toàn bộ thao tác tạo kế hoạch, tra cứu bài tập, ghi hiệp buổi tập hoạt động bình thường, không hiển thị dialog lỗi mạng chặn người dùng. |
| **AC-08** | Đồng bộ Hàng đợi Đám mây | Bật lại kết nối mạng: Các bản ghi trong `sync_queue` tự động gửi lên server theo thứ tự thời gian; xử lý idempotency chống tạo bản ghi trùng lặp. |
| **AC-09** | Lịch sử Buổi tập | Buổi tập sau khi bấm "Hoàn thành" lập tức xuất hiện ở đầu danh sách Lịch sử; hiển thị đầy đủ tổng thời lượng, tổng khối lượng (volume) và danh sách bài tập. |
| **AC-10** | Thống kê & Kỷ lục (PR) | Ghi nhận mức tạ cao nhất mới (PR) cho bài tập tự động kích hoạt badge chúc mừng; biểu đồ Volume cập nhật điểm dữ liệu mới chính xác theo công thức `Σ(weight × reps)`. |
| **AC-11** | Giao diện Đa Theme | Chuyển đổi giữa Light Theme và Dark Theme cập nhật tức thì toàn bộ màn hình; không xảy ra hiện tượng chớp nháy màu (FOUC) hoặc sai mã màu token. |
| **AC-12** | Quy chuẩn Accessibility | 100% các nút bấm chính đạt chiều cao ≥ 48px; vùng chạm tương tác ≥ 44×44px; độ tương phản văn bản đạt chuẩn WCAG 2.2 AA (văn bản thường ≥ 4.5:1). |

---

### 7.5. Kịch bản Kiểm thử E2E Chu trình Kinh doanh Gym MVP `[PROPOSED]`

Nhằm đảm bảo tính sẵn sàng nghiệm thu độc lập cho phân hệ Gym Management trước khi đưa vào vận hành thương mại, kịch bản E2E kiểm thử toàn bộ chu trình kinh doanh khép kín được đề xuất triển khai:

```text
[BƯỚC 1: Gym Onboarding] ──► [BƯỚC 2: Staff RBAC] ──► [BƯỚC 3: Plan Creation]
                                                             │
                                                             ▼
[BƯỚC 6: Shift Reconciliation] ◄── [BƯỚC 5: Check-in] ◄── [BƯỚC 4: Walk-in & Sell Plan]
```

| Bước | Hành động Thao tác (E2E Test Step) | Tác nhân (Actor) | Dữ liệu Đầu vào (Test Inputs) | Kết quả Kỳ vọng Đo lường Được (Expected Outcomes) |
|---|---|---|---|---|
| **E2E-01** | Đăng ký Gym & Khởi tạo Chi nhánh Cơ sở | Chủ phòng gym (Owner) | Tên Gym: "Titan Fitness", Slug: `titan-fitness`, Chi nhánh: "Cơ sở Quận 1" | Bản ghi `gyms` và `branches` được tạo thành công với trạng thái `active`; phân quyền Owner được xác lập trên Supabase Auth. |
| **E2E-02** | Mời Nhân viên & Kích hoạt Tài khoản | Chủ phòng gym (Owner) & Tiếp tân | Email: `reception@titan.vn`, Vai trò: `receptionist`, Chi nhánh: Quận 1 | Tiếp tân nhận email mời, kích hoạt mật khẩu thành công; bản ghi `gym_staff` chuyển từ `invited` sang `active`; quyền bị giới hạn nghiêm ngặt tại Chi nhánh Quận 1. |
| **E2E-03** | Khởi tạo Danh mục Gói tập | Quản lý (Manager) / Owner | Tên gói: "Gói 1 Tháng Full Ca", Thời hạn: 30 ngày, Giá: 500.000 VND (`500000`), Phạm vi: Chi nhánh Quận 1 | Bản ghi `membership_plans` được lưu trữ thành công; hiển thị sẵn sàng trên danh mục bán hàng tại quầy. |
| **E2E-04** | Tiếp nhận Hội viên Walk-in & Bán gói tập | Tiếp tân (Receptionist) | Họ tên: "Nguyễn Văn A", SĐT: `0901234567`, Gói: "Gói 1 Tháng Full Ca" | Tạo hồ sơ `gym_members` mới với mã `member_code`; tạo hợp đồng `memberships` ở trạng thái `pending` kèm snapshot giá gói 500.000 VND. |
| **E2E-05** | Thu phí & Kích hoạt Gói tập qua Payment Core `GM-3b` | Tiếp tân (Receptionist) | Phương thức: Tiền mặt (`cash`), Số tiền: 500.000 VND (`500000`), Idempotency Key: UUID v4 | Bản ghi `payment_transactions` được tạo với trạng thái `completed`; hợp đồng `memberships` lập tức chuyển từ `pending` sang `active`; xác lập ngày hết hạn đúng 30 ngày sau. |
| **E2E-06** | Điểm danh Hội viên tại Quầy Tiếp tân | Tiếp tân & Hội viên | Nhập số điện thoại `0901234567` hoặc quét mã QR hội viên | Động cơ kiểm tra 6 bước vượt qua thành công trong < 500ms; bản ghi `attendance_logs` được tạo bất biến; quầy tiếp tân báo xanh cho phép vào tập. |
| **E2E-07** | Thử nghiệm Ngoại lệ Điểm danh Sai Chi nhánh | Tiếp tân Chi nhánh Cơ sở 2 | Hội viên Nguyễn Văn A sang Chi nhánh Cơ sở 2 điểm danh | Động cơ kiểm tra phát hiện gói tập chỉ có hiệu lực tại Cơ sở Quận 1; từ chối điểm danh; màn hình quầy báo đỏ kèm thông báo vi phạm phạm vi chi nhánh. |
| **E2E-08** | Kết ca & Đối soát Doanh thu Cuối ngày | Tiếp tân & Quản lý | Thực hiện lệnh "Kết ca làm việc" tại quầy | Báo cáo doanh thu ca hiển thị chính xác tổng tiền mặt thu được là 500.000 VND; khớp 100% giữa số liệu hệ thống và tiền mặt thực tế; khóa sổ ca thành công. |

---

### 7.6. Phạm vi Nghiệp vụ Triển khai theo Giai đoạn (Deferred / Staged Scope)
- Điểm danh bằng phần cứng mã QR động (Dynamic QR Hardware Token).
- Tích hợp cổng thanh toán trực tuyến tự động (Online Payment Gateways / Webhooks).
- Đặt lịch PT nâng cao trên ứng dụng di động.
- Sáp nhập hồ sơ hội viên nâng cao có lịch sử tài chính (Advanced Profile Merge — ALIGN-01: DEFERRED).
- Chế độ điểm danh khẩn cấp khi mất mạng quầy (Emergency Offline Queue).

---

## CHƯƠNG 8: LỘ TRÌNH TRIỂN KHAI TỔNG THỂ & MA TRẬN PHỤ THUỘC (UNIFIED ROADMAP)

### 8.1. Cấu trúc Lộ trình Tích hợp (Unified Roadmap) `[APPROVED]`
- **Phase 0 — Chuẩn bị Yêu cầu & Kiến trúc:** Hoàn thiện Product Vision, thiết kế schema GM-1, chuẩn bị hồ sơ Gate P0.T07 & P0.T08. *(Hiện trạng: [ ] Chờ duyệt; Chưa bắt đầu Phase 1)*.
- **Phase 1 (Mới) — Xác thực & Nền tảng RBAC:** Triển khai schema GM-1 (`gyms`, `branches`, `gym_staff`), RLS policies và luồng mời nhân sự.
- **Phase 2 (Mới) — Quản lý Phòng gym & Chi nhánh:** Khởi tạo dự án Admin Web, giao diện quản trị gym, quản lý chi nhánh và nhân viên.
- **Phase 3 (Mới) — Quản lý Hội viên (Member Management):** Schema GM-2, giao diện hội viên walk-in, luồng liên kết tài khoản an toàn qua OTP.
- **Phase 4 (Mới) — Gói tập & Điểm danh (Membership & Attendance):** Schema GM-3 & GM-4, quản lý danh mục gói, đăng ký gói, điểm danh tại quầy. **Triển khai schema Payment Core tối thiểu `GM-3b` `[PROPOSED]` để phục vụ kích hoạt gói tập.**
- **Phase 5 (Mới) — Tài chính & Báo cáo (Payments & Reporting):** Schema GM-5, hoàn thiện Payment Advanced, quản lý công nợ, đối soát ca. **Nghiệm thu Cổng 1: Gym Management MVP Release Gate.**
- **Phase 6 (Mới) — Tập luyện & Huấn luyện viên cá nhân (Workout & PT):** Hoàn thiện đồng bộ dữ liệu workout core, phân công PT, lịch hẹn và mô hình consent. **Nghiệm thu Cổng 2: PT Integration Gate.**
- **Phase 7 (Mới) — Kiểm thử Toàn diện & Phát hành Toàn nền tảng:** Kiểm thử tải, bảo mật, E2E toàn diện. **Nghiệm thu Cổng 3: Full Platform Production Release Gate.**

### 8.2. Ma trận Phụ thuộc Toàn diện (Dependency Matrix)

| Phase Lộ trình | Nhóm Schema Supabase | Năng lực Nghiệp vụ Hệ thống (Business Capabilities) | Tiêu chí Nghiệm thu Tương ứng (Acceptance Criteria) | Điều kiện Tiên quyết (Prerequisites) |
|---|---|---|---|---|
| **Phase 0** | N/A (Thiết kế DDL) | Hồ sơ kiến trúc, Product Vision mới, thiết kế DDL GM-1 | Gate P0.T07 & P0.T08 Review | Phê duyệt từ Chủ dự án |
| **Phase 1** | `GM-1` (`gyms`, `branches`, `gym_staff`) | Xác thực đa tenant, mời nhân viên, RBAC máy chủ | MT-01..05, RBAC-01..16, GM-01..06 | P0.T07 & P0.T08 Approved |
| **Phase 2** | `GM-1` (Web integration) | Admin Web Portal, quản trị chuỗi chi nhánh | FR-GM-01..05, SSR-01..02 | Phase 1 Hoàn tất |
| **Phase 3** | `GM-2` (`gym_members`) | Quản lý hội viên walk-in, liên kết tài khoản OTP | FR-MB-01..05, MB-01..05 | Phase 2 Hoàn tất |
| **Phase 4** | `GM-3`, `GM-4` + `GM-3b` (Payment Core) | Bán gói tập, kích hoạt gói 100%, điểm danh tại quầy | FR-MS-01..05, FR-AT-01..03, CI-01..07 | Phase 3 + Payment Core Schema GM-3b |
| **Phase 5** | `GM-5` (`payment_transactions` advanced) | Quản lý công nợ, hoàn tiền, đối soát doanh thu ca | FR-PY-01..04, PY-01..07, **Cổng 1: AC-REL-01..04, 06, E2E-01..08** | Phase 4 Hoàn tất |
| **Phase 6** | `Core Sync` + `GM-5` (`pt_sessions`, assignments) | Tái sử dụng workout, phân công PT, consent | FR-WPT-01..04, **Cổng 2: AC-REL-05, AC-REL-07** | Phase 5 + Core Sync Readiness |
| **Phase 7** | Toàn bộ Schemas | Kiểm thử tải, bảo mật, E2E toàn diện | **Cổng 3: Toàn bộ AC-REL + NFRs** | Phase 6 Hoàn tất |

---

## CHƯƠNG 9: QUẢN TRỊ RỦI RO & DANH MỤC QUYẾT ĐỊNH

### 9.1. Ma trận Rủi ro Trọng yếu (R-MT-01 đến R-MT-14)
- **Rò rỉ Dữ liệu Cross-Tenant (R-MT-01):** Áp dụng thiết kế Fail-closed mặc định; hàm kiểm tra quyền bắt buộc join bảng vật lý và kiểm tra trạng thái active.
- **Leo thang Đặc quyền qua Client Metadata (R-MT-02):** Tuyệt đối không lưu trữ hoặc đọc quyền hạn từ `user_metadata`.
- **Rò rỉ Mã phiên trên Web (R-MT-12):** Áp dụng kiến trúc Server-First Auth với Cookie `httpOnly: true`.
- **Gán nhầm Chi nhánh Chéo phòng gym (R-MT-13):** Bắt buộc sử dụng Composite Foreign Key với `ON DELETE RESTRICT` để bảo vệ vết kiểm toán.
- **Phòng gym Bị Khóa nhưng Nhân viên vẫn Truy cập (R-MT-14):** Hàm kiểm tra quyền bắt buộc kiểm tra đồng thời trạng thái hoạt động của phòng gym (`gyms.status = 'active'`).

### 9.2. Decision Register Phân loại Chuẩn xác 5 Nhóm Trạng thái kèm Nguồn Bằng chứng

#### 1. Nhóm Quyết định Đã Phê duyệt (APPROVED DECISION)
1. **Định vị Sản phẩm Multi-Tenant:** Gym Workout là Multi-Tenant Gym Management Platform; Gym Management là sản phẩm trọng tâm; Workout Mobile là app đa chế độ; PT Management là phân hệ chính thức theo giai đoạn; Một Unified Roadmap tổng thể. *(Bằng chứng: Nhiệm vụ phê duyệt ngày 2026-10-23)*.
2. **Cấu trúc Tài liệu Báo cáo:** Chấp thuận về mặt nguyên tắc khung 10 chương và 8 nhóm quy trình nghiệp vụ. *(Bằng chứng: Nhiệm vụ phê duyệt ngày 2026-10-23)*.
3. **Kiến trúc Dữ liệu Đám mây & Ngoại tuyến:** Supabase PostgreSQL làm backend dữ liệu và Expo SQLite làm nguồn dữ liệu cục bộ theo kiến trúc offline-first; UUID canonical; UTC timestamptz; đơn vị mức tạ là số nguyên gram (`weight_grams`). *(Bằng chứng: [`docs/risks-decisions.md`](./risks-decisions.md#L25-L40), xác nhận ngày 2026-10-21)*.

#### 2. Nhóm Hiện trạng Kỹ thuật Đã Kiểm chứng (VERIFIED BASELINE)
1. **Expo SDK Baseline (Static Source Check):** Expo SDK 57 (`expo ~57.0.30`, `react-native 0.86.3`). *(Bằng chứng: [`package.json`](../package.json#L9) & `package-lock.json`)*.
2. **SQLite Schema v1 (Static Source Check):** 6 bảng tập luyện cá nhân (`exercises`, `workout_plans`, `plan_exercises`, `workout_sessions`, `session_exercises`, `workout_sets`). *(Bằng chứng: [`src/shared/storage/schema.ts`](../src/shared/storage/schema.ts#L10-L115))*.
3. **Kiểm thử Đơn vị Storage (Verified in Historical Test Suite):** Bộ test Jest kiểm tra migration, rollback, repositories CRUD đạt trong các phiên trước. *(Bằng chứng: [`__tests__/storage-test.ts`](../__tests__/storage-test.ts); lưu ý trong phiên hiện tại chưa chạy lệnh `npm test` do tuân thủ nguyên tắc READ-ONLY)*.
4. **Điều hướng 5 Tab Android (Verified in Historical Runtime Test):** Expo Router tabs hoạt động trên Android emulator `Medium_Phone_API_37.0` (Android 17) qua Expo Go 57.0.9 trong phiên ngày 2026-10-18. *(Bằng chứng: [`docs/mindmap.md`](./mindmap.md#L28))*.
5. **Design System v1 (Static Source Check):** Color tokens, typography, spacing, Button, Card, Input tồn tại và đồng bộ ThemeProvider. *(Bằng chứng: [`src/shared/design-system/`](../src/shared/design-system/))*.

#### 3. Nhóm Chưa Kiểm chứng Độc lập / Báo cáo từ Người dùng (NOT VERIFIED INDEPENDENTLY)
1. **Supabase Cloud Core Tables:** 7 bảng core workout trên dự án Supabase Cloud `gym-workout` được báo cáo chạy thủ công ngày 2026-10-22. *(Hiện trạng: Chưa được kiểm chứng độc lập trong phiên này; bài test T13 trên local disposable vẫn BLOCKED theo [`docs/supabase-schema.md`](./supabase-schema.md#L38); không đánh đồng đây là Verified Production)*.
2. **Kiểm thử Runtime trên iOS:** Chưa kiểm thử runtime trên iOS do môi trường phát triển chạy trên Windows thiếu macOS/Xcode. *(Hiện trạng: BLOCKED theo [`docs/mindmap.md`](./mindmap.md#L28) và [`docs/risks-decisions.md`](./risks-decisions.md#L95))*.

#### 4. Nhóm Đề xuất Kỹ thuật Chờ Phê duyệt (PROPOSED — Gate P0.T07 & P0.T08)
1. **D-MT-01:** Cấu trúc monorepo bằng `npm workspaces`.
2. **D-MT-02:** Lựa chọn Next.js App Router cho Admin Web.
3. **D-MT-03:** Quản lý phiên Web bằng Supabase SSR Server-First `httpOnly` Cookie.
4. **D-MT-04:** Cổng giao dịch phân tách (Edge Functions + PostgreSQL RPC least privilege).
5. **D-MT-11:** Phân quyền kiêm nhiệm đa chi nhánh qua 2 Partial Unique Indexes.
6. **Schema GM-1 Design:** DDL 3 bảng `gyms`, `branches`, `gym_staff`, Composite FK `(branch_id, gym_id)`, `ON DELETE RESTRICT` và soft-deactivation `archived`.
7. **Đề xuất Tách Schema Payment Core GM-3b:** Tách schema tối thiểu của `payment_transactions` (`GM-3b`) đưa vào Phase 4 phục vụ kích hoạt gói tập.
8. **Chính sách Kích hoạt Gói tập Mặc định MVP:** Chỉ kích hoạt gói tập khi ghi nhận thanh toán đầy đủ 100%.
9. **Phân tách Độc lập 3 Cổng Release:** Gym Management MVP Gate (sau Phase 5), PT Integration Gate (sau Phase 6), Full Platform Gate (Phase 7).
10. **Kịch bản Kiểm thử E2E Chu trình Kinh doanh Gym MVP:** Bộ 8 bước E2E-01 đến E2E-08 kiểm chứng chu trình vận hành khép kín tại Cổng 1.

#### 5. Danh mục Business Rules Còn Mở (Open Business Rules Register — UNDECIDED)

| Mã Quy tắc | Nội dung Nghiệp vụ Cần Chốt | Khuyến nghị Kỹ thuật / Nghiệp vụ | Mốc Thời gian Cần Quyết định |
|---|---|---|---|
| **BR-PAY-01** | Chính sách kích hoạt gói khi khách còn nợ (Partial Payment) | Đề xuất mặc định MVP: Chỉ kích hoạt khi thanh toán 100%. Tùy chọn nâng cao: Cho phép nợ tối đa theo hạn mức. | **Trước nghiệm thu Phase 4** (Kéo sớm từ Phase 5) |
| **BR-PAY-02** | Đơn vị tiền tệ chính thức trong cơ sở dữ liệu | Khuyến nghị dùng số nguyên đồng `amount BIGINT` (VND), không dùng số thập phân để tối ưu kế toán Việt Nam. | **Trước thiết kế Migration Phase 4 (GM-3b)** (Kéo sớm từ Phase 5) |
| **BR-PT-01** | Chính sách xử lý khi hội viên hủy lịch muộn hoặc No-show | Cấu hình linh hoạt theo từng phòng gym: Cảnh cáo lần đầu không trừ buổi; từ lần vi phạm tiếp theo trừ buổi theo quy định. | **Phase 6** (PT) |
| **BR-PT-02** | Cơ chế xác nhận hoàn thành buổi tập PT | Khuyến nghị xác thực 2 chiều: Trainer bấm hoàn thành + Hội viên quét QR hoặc nhập OTP trên máy Trainer để trừ buổi. | **Phase 6** (PT) |
| **BR-PT-03** | Mô hình và phạm vi Consent chia sẻ dữ liệu cho PT | Hội viên chủ động lựa chọn cấp quyền chia sẻ (buổi tập PT, buổi tự tập, lịch sử cá nhân) và có quyền thu hồi bất cứ lúc nào. | **Phase 6** (PT) |
| **BR-AT-01** | Giới hạn số lượt điểm danh trong 1 ngày lịch | Cấu hình theo loại gói tập: 1 lần/ngày đối với gói thường; không giới hạn đối với gói VIP; hoặc trừ theo lượt đối với gói mua buổi. | **Phase 4** (Attendance) |
| **BR-AT-02** | Múi giờ xác định ngày lịch check-in của chi nhánh | Căn cứ theo múi giờ địa phương của cơ sở (`branches.timezone`, mặc định `Asia/Ho_Chi_Minh`) thay vì dùng ngày UTC để tránh lệch ca. | **Phase 4** (Attendance) |
| **BR-AT-03** | Chế độ điểm danh khẩn cấp khi mất mạng quầy tiếp tân | Cho phép tiếp tân ghi nhận tạm vào danh sách điểm danh ngoại tuyến có đối soát lại khi mạng phục hồi (Emergency Offline Queue). | **Phase 4** (Attendance) |
| **BR-MB-01** | Quy tắc phát sinh mã thẻ hội viên (`member_code`) | Cấu trúc đề xuất: `[Mã_Gym]-[Năm]-[Số_thứ_tự]` (Ví dụ: `GYM-2026-00001`) để in thẻ từ và tra cứu nhanh. | **Phase 3** (Members) |
| **BR-MB-02** | Sáp nhập hồ sơ hội viên nâng cao có lịch sử tài chính | **DEFERRED (ALIGN-01):** Giai đoạn MVP duy trì độc lập cả 2 hồ sơ dưới cờ rà soát nội bộ; quy trình gộp giao dịch tài chính hoãn sang phase sau. | **Phase 3** (Members) |
| **BR-REP-01** | Chiến lược lưu trữ báo cáo tài chính | Giai đoạn đầu tổng hợp trực tiếp từ bảng giao dịch; quy mô lớn chuyển sang Materialized Views hoặc bảng tổng hợp định kỳ cuối ngày. | **Phase 5** (Reporting) |
| **BR-WEB-01** | Hạ tầng hosting cho cổng Admin Web | Triển khai trên nền tảng Serverless (Vercel) ở giai đoạn MVP; có thể đóng gói Docker chuyển sang máy chủ riêng khi cần. | **Phase 2** (Admin Web) |

---

### 9.4. Danh mục các Quyết định Chưa được Phê duyệt (NOT YET APPROVED)
Dưới đây là bảng tổng hợp các hạng mục hiện đang ở trạng thái chờ duyệt trước khi thực thi mã nguồn hoặc schema:

1. **Gate Task P0.T07:** Chưa phê duyệt chính thức (Đang chờ xem xét hồ sơ kiến trúc).
2. **Gate Task P0.T08:** Đang hoàn thiện bước trình duyệt qua báo cáo này.
3. **Các Lựa chọn Kiến trúc Mở (D-MT-01 đến D-MT-04, D-MT-11):** Chưa phê duyệt.
4. **Thiết kế Schema DDL GM-1 và Toàn bộ Migrations GM-1..5:** Chưa phê duyệt.
5. **Đề xuất Tách Schema Payment Core GM-3b:** Chưa phê duyệt.
6. **Chính sách Kích hoạt Gói Tập 100%:** Chưa phê duyệt.
7. **Toàn bộ Danh mục Quy tắc Kinh doanh Mở (BR-PAY, BR-PT, BR-AT, BR-MB...):** Chưa phê duyệt.
8. **Phương án Phân tách 3 Release Gates Độc lập:** Chưa phê duyệt.
9. **Mở khóa và Bắt đầu Phase 1:** **TUYỆT ĐỐI CHƯA BẮT ĐẦU** (Chờ duyệt xong Gate Phase 0).

---

## CHƯƠNG 10: KẾT LUẬN VÀ ĐỀ XUẤT TIẾP THEO

### 10.1. Đánh giá Mức độ Hoàn thiện
1. **Mức độ Hoàn thiện Tài liệu (Documentation Maturity):**
   - Tài liệu đã đạt mức độ hoàn thiện cao nhất, thống nhất tuyệt đối giữa Product Vision, 8 quy trình vận hành thực tế, ma trận phụ thuộc lộ trình và hệ thống phân loại bằng chứng.
   - Bảo toàn 100% các giá trị cốt lõi của ứng dụng tập luyện di động cá nhân (17 yêu cầu chức năng FR-01..17, 12 tiêu chí nghiệm thu AC-01..12, Design System chuẩn WCAG 2.2 AA).
   - Đã loại bỏ hoàn toàn các điểm mơ hồ kỹ thuật (tên migration `GM-3b`, tiền tệ `BIGINT VND`, mô hình consent dữ liệu PT, phân tách 3 cổng release).
2. **Mức độ Kiểm chứng Triển khai Thực tế (Implementation Verification Level):**
   - Hiện trạng thực tế đã kiểm chứng: Codebase React Native/Expo SDK 57 với 6 bảng SQLite v1 và bộ test Jest đã đạt trong các phiên trước.
   - Toàn bộ phân hệ Gym Management (Admin Web, Schemas GM-1 đến GM-5, RLS Policies, Mutation Gateways, luồng liên kết tài khoản OTP và phân hệ PT) đang ở mức **Đặc tả Thiết kế (Design Specification)**.

### 10.2. Đề xuất Hành động Tiếp theo
- Kính trình Chủ dự án xem xét báo cáo tổng thể `docs/baocao.md` đã được cập nhật.
- Xem xét phê duyệt các đề xuất kiến trúc tại Gate Task `P0.T07` và nghiệm thu nội dung báo cáo tại Gate Task `P0.T08`.
- Sau khi có quyết định phê duyệt chính thức từ Chủ dự án, hệ thống mới tiến hành cập nhật trạng thái trong `docs/mindmap.md` và chính thức khởi động Phase 1 (Auth & Multi-Tenant RBAC Foundation).
