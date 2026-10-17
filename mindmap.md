# Mindmap — Workflow triển khai Gym & Workout App

> Nguồn: `baocao.md` (đặc biệt mục 3, 4, 11–13). Đây là kế hoạch triển khai; các Phase 1–7 phục vụ MVP, Phase 8 là mở rộng.

## Quy tắc theo dõi

- Trước mỗi task: đọc `rule.md` nếu có, `mindmap.md`, và các tài liệu tham chiếu được ghi tại task.
- Trạng thái: `[ ]` chưa làm, `[x]` hoàn thành. Chỉ đánh dấu `[x]` sau khi kiểm tra kết quả.
- Mỗi module cần có tài liệu module riêng theo quy tắc của Agent nếu được cấu hình; cập nhật tài liệu sau thay đổi.
- Không tự tạo endpoint backend, phiên bản SDK, schema hoặc quyết định kỹ thuật chưa được xác nhận; ghi blocker vào `risks-decisions.md`.
- Phase tiếp theo chỉ bắt đầu khi tiêu chí hoàn thành phase trước đã được kiểm tra; có thể tách việc không phụ thuộc để làm song song nếu được phê duyệt.

## Phase 1 — Phân tích và thiết lập

- [ ] **Phase 1.T01** — Chốt phạm vi MVP, luồng người dùng và màn hình.  
      Tham chiếu: `requirements.md`, `screens-ux.md`.
- [ ] **Phase 1.T02** — Chốt quyết định backend, auth và phiên bản Expo SDK hoặc ghi nhận blocker.  
      Tham chiếu: `risks-decisions.md`.
- [ ] **Phase 1.T03** — Khởi tạo Expo + React Native + TypeScript.  
      Tham chiếu: `tech-stack.md`.
- [ ] **Phase 1.T04** — Thiết lập Expo Router, tabs và auth routes.  
      Tham chiếu: `architecture.md`, `screens-ux.md`.
- [ ] **Phase 1.T05** — Thiết lập cấu trúc module, lint và nền tảng kiểm thử.  
      Tham chiếu: `architecture.md`, `testing-acceptance.md`.

**Điều kiện hoàn thành:** Ứng dụng khởi chạy trên iOS/Android; điều hướng cơ bản hoạt động.

## Phase 2 — Design System

- [ ] **Phase 2.T01** — Tạo color tokens Dark/Light và theme provider.  
      Tham chiếu: `color-palette.md`.
- [ ] **Phase 2.T02** — Tạo typography, spacing, radius và size tokens.  
      Tham chiếu: `design-system.md`.
- [ ] **Phase 2.T03** — Xây dựng AppText, Screen, Button, Card, Input và IconButton.  
      Tham chiếu: `design-system.md`.
- [ ] **Phase 2.T04** — Tạo Bottom Navigation và trạng thái giao diện chuẩn.  
      Tham chiếu: `design-system.md`, `screens-ux.md`.
- [ ] **Phase 2.T05** — Kiểm tra tương phản, vùng chạm, safe area và chữ phóng to.  
      Tham chiếu: `color-palette.md`, `design-system.md`.

**Điều kiện hoàn thành:** Các màn hình dùng chung tokens/components; Light/Dark hoạt động.

## Phase 3 — Dữ liệu và chức năng nền tảng

- [ ] **Phase 3.T01** — Thiết kế schema SQLite, migration và repository.  
      Tham chiếu: `data-offline.md`.
- [ ] **Phase 3.T02** — Xây dựng xác thực, đăng ký/đăng nhập/đăng xuất khi backend sẵn sàng.  
      Tham chiếu: `requirements.md`, `tech-stack.md`.
- [ ] **Phase 3.T03** — Tạo hồ sơ và onboarding.  
      Tham chiếu: `requirements.md`.
- [ ] **Phase 3.T04** — Tạo thư viện bài tập: danh sách, tìm kiếm, lọc, chi tiết.  
      Tham chiếu: `tech-stack.md`, `screens-ux.md`.
- [ ] **Phase 3.T05** — Tạo kế hoạch: CRUD, thứ tự bài tập, cấu hình hiệp/reps/nghỉ.  
      Tham chiếu: `tech-stack.md`, `data-offline.md`.

**Điều kiện hoàn thành:** Người dùng có thể thiết lập hồ sơ, chọn bài tập và kế hoạch; lưu dữ liệu cục bộ.

## Phase 4 — Luồng tập luyện cốt lõi

- [ ] **Phase 4.T01** — Bắt đầu/tạm dừng/tiếp tục/kết thúc buổi tập.  
      Tham chiếu: `tech-stack.md`.
- [ ] **Phase 4.T02** — Ghi nhận và xác thực hiệp, mức tạ, số lần lặp.  
      Tham chiếu: `tech-stack.md`.
- [ ] **Phase 4.T03** — Tạo RestTimer theo timestamp kết thúc dự kiến.  
      Tham chiếu: `tech-stack.md`.
- [ ] **Phase 4.T04** — Tự động lưu vào SQLite và khôi phục khi mở lại.  
      Tham chiếu: `data-offline.md`.
- [ ] **Phase 4.T05** — Tạo màn hình tổng kết và kiểm thử chuyển nền/foreground.  
      Tham chiếu: `screens-ux.md`, `testing-acceptance.md`.

**Điều kiện hoàn thành:** Luồng ghi nhận buổi tập hoạt động không cần mạng và khôi phục được.

## Phase 5 — Lịch sử, thống kê và thói quen

- [ ] **Phase 5.T01** — Danh sách và chi tiết lịch sử buổi tập.  
      Tham chiếu: `tech-stack.md`.
- [ ] **Phase 5.T02** — Xác định công thức, đơn vị và dữ liệu hợp lệ cho thống kê.  
      Tham chiếu: `tech-stack.md`, `risks-decisions.md`.
- [ ] **Phase 5.T03** — Tính tiến bộ, khối lượng tập và PR; hiển thị biểu đồ.  
      Tham chiếu: `tech-stack.md`.
- [ ] **Phase 5.T04** — Tạo mục tiêu, thói quen và tiến độ hoàn thành.  
      Tham chiếu: `requirements.md`.
- [ ] **Phase 5.T05** — Tạo nhắc lịch tập, quyền thông báo và cài đặt.  
      Tham chiếu: `tech-stack.md`.
- [ ] **Phase 5.T06** — Thêm check-in phục hồi tự khai báo nếu được ưu tiên.  
      Tham chiếu: `requirements.md`, `tech-stack.md`.

**Điều kiện hoàn thành:** Lịch sử và chỉ số hiển thị nhất quán; mục tiêu và nhắc nhở cơ bản hoạt động.

## Phase 6 — Offline và đồng bộ

- [ ] **Phase 6.T01** — Kiểm thử ghi cục bộ trước và khôi phục mọi thao tác cốt lõi.  
      Tham chiếu: `data-offline.md`.
- [ ] **Phase 6.T02** — Thiết kế sync queue, stable ID, idempotency và trạng thái.  
      Tham chiếu: `data-offline.md`.
- [ ] **Phase 6.T03** — Triển khai network detection, retry/backoff và xử lý lỗi.  
      Tham chiếu: `data-offline.md`.
- [ ] **Phase 6.T04** — Chốt và thực thi quy tắc xung đột khi backend hỗ trợ.  
      Tham chiếu: `risks-decisions.md`, `data-offline.md`.
- [ ] **Phase 6.T05** — Kiểm thử mất mạng, kết nối lại và chống trùng bản ghi.  
      Tham chiếu: `testing-acceptance.md`.

**Điều kiện hoàn thành:** Không mất dữ liệu khi offline; đồng bộ chỉ nghiệm thu khi có backend phù hợp.

## Phase 7 — Kiểm thử và phát hành thử

- [ ] **Phase 7.T01** — Chạy unit tests cho validation, timer, thống kê và trạng thái.  
      Tham chiếu: `testing-acceptance.md`.
- [ ] **Phase 7.T02** — Chạy component, integration và E2E theo AC-01 đến AC-12.  
      Tham chiếu: `testing-acceptance.md`.
- [ ] **Phase 7.T03** — Kiểm thử iOS/Android, cỡ chữ lớn, bàn phím và safe area.  
      Tham chiếu: `testing-acceptance.md`.
- [ ] **Phase 7.T04** — Rà soát bảo mật, quyền riêng tư, hiệu năng và các rủi ro.  
      Tham chiếu: `risks-decisions.md`.
- [ ] **Phase 7.T05** — Sửa lỗi, kiểm tra hồi quy và chuẩn bị bản thử nghiệm.  
      Tham chiếu: `testing-acceptance.md`.

**Điều kiện hoàn thành:** AC áp dụng đạt hoặc được ghi rõ blocker/phạm vi chưa hỗ trợ; MVP sẵn sàng thử nghiệm.

## Phase 8 — Mở rộng sau MVP

- [ ] **Phase 8.T01** — Phân tích hiệu suất chuyên sâu.  
      Tham chiếu: `requirements.md`.
- [ ] **Phase 8.T02** — Đồng bộ đa thiết bị và giải quyết xung đột nâng cao.  
      Tham chiếu: `data-offline.md`.
- [ ] **Phase 8.T03** — Tích hợp dữ liệu sức khỏe/thiết bị ngoài khi được cho phép.  
      Tham chiếu: `tech-stack.md`.
- [ ] **Phase 8.T04** — Cá nhân hóa kế hoạch và phân tích phục hồi nâng cao.  
      Tham chiếu: `requirements.md`.

**Điều kiện hoàn thành:** Chỉ bắt đầu sau khi luồng MVP ổn định; cần xác nhận phạm vi mới.

## Bảng tài liệu chuẩn

| Tài liệu                | Vai trò                                        |
| ----------------------- | ---------------------------------------------- |
| `requirements.md`       | Phạm vi, FR và NFR                             |
| `architecture.md`       | Module, thư mục, ranh giới                     |
| `tech-stack.md`         | React Native/Expo và API thiết bị              |
| `data-offline.md`       | Thực thể, storage, offline/sync                |
| `screens-ux.md`         | Điều hướng, màn hình và bố cục                 |
| `color-palette.md`      | HEX và tương phản                              |
| `design-system.md`      | Typography, spacing, components, accessibility |
| `testing-acceptance.md` | AC-01 đến AC-12 và kế hoạch test               |
| `risks-decisions.md`    | Rủi ro và quyết định còn mở                    |

## Ghi chú phạm vi

- `baocao.md` mô tả các API Expo và vai trò của API client, **không đưa ra danh sách endpoint HTTP cụ thể**.
- `recovery` có trong yêu cầu FR-13 và danh sách module nhưng không thuộc danh sách MVP cốt lõi tại mục 3.3; task check-in được đặt là tùy chọn, cần xác nhận ưu tiên.
- Xác thực và đồng bộ cần backend phù hợp; không đánh dấu hoàn tất tích hợp thật nếu chưa có backend.
