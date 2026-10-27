# RULE.md — AI AGENT WORKING RULES (BỘ QUY TẮC THÉP)

## 1. Quy tắc khởi động phiên làm việc & Ranh giới bắt buộc

- Trước khi thực hiện bất kỳ công việc nào, AI Agent **BẮT BUỘC** đọc đầy đủ `docs/rule.md` và `docs/mindmap.md`.
- Phải xác định chính xác Phase hiện tại, mục tiêu và task duy nhất cần thực thi.
- Nếu thiếu file hoặc thông tin chưa rõ ràng, phải **DỪNG LẠI NGAY LẬP TỨC** và báo cáo Owner. Tuyệt đối không tự ý suy đoán hay bỏ qua quy tắc.

## 2. Cố định 8 File Tài liệu Cốt lõi & Bãi bỏ Quy tắc tạo File Module

- **BÃI BỎ HOÀN TOÀN QUY TẮC TẠO FILE `[tenmodule].md`:** Tuyệt đối **CẤM** tạo thêm bất kỳ file `.md` mới nào trong thư mục `docs/`.
- Toàn bộ tri thức, đặc tả và kiến trúc của dự án chỉ được lưu trữ trong **đúng 8 file Single Source of Truth (SSOT)** sau:
  1. `docs/rule.md`: Bộ quy tắc làm việc, kỷ luật Git branch workflow, tiêu chuẩn an toàn kỹ thuật.
  2. `docs/mindmap.md`: Lộ trình tổng thể Unified Roadmap 9 Phase (Phase 0–8), ma trận 96 task và Work Log.
  3. `docs/baocao.md`: Tầm nhìn sản phẩm (Product Vision), 8 chu trình nghiệp vụ E2E, kiến trúc hệ thống đa nền tảng.
  4. `docs/risks-decisions.md`: Sổ bộ quyết định kiến trúc (Decision Register OD-01..06, D-MT) và ma trận rủi ro.
  5. `docs/supabase-schema.md`: Toàn bộ Schema PostgreSQL, migrations DDL GM-1..5, RLS policies và mô hình RBAC Multi-Tenancy.
  6. `docs/data-offline.md`: Kiến trúc Offline-First, hợp đồng đồng bộ dữ liệu hai chiều và thực tế triển khai SQLite v1.
  7. `docs/design-system.md`: Toàn bộ Design System, bảng màu Dark/Light HEX, Theme Provider, Navigation và Routes mobile.
  8. `docs/testing-acceptance.md`: Chiến lược kiểm thử tự động, danh mục 8 test suites `__tests__/` và tiêu chí nghiệm thu AC.
- Tuyệt đối **CẤM** tạo file tạm, file sao lưu như `.bak`, `.tmp`, `-copy`, `.old` trong toàn bộ repository.

## 3. Kỷ luật Tập trung Lộ trình (Focus Roadmap & Single Task Rule)

- Trong mỗi phiên làm việc, AI Agent chỉ được phép thực hiện **DUY NHẤT 1 task** đang ở trạng thái chưa hoàn thành `[ ]` đầu tiên được giao hoặc chỉ định theo lộ trình.
- Tuyệt đối không sửa lan man sang các module khác ngoài phạm vi của task hiện tại.
- Mọi đề xuất mở rộng ngoài task đang làm phải được ghi nhận dưới dạng ghi chú đề xuất, không tự ý can thiệp mã nguồn.

## 4. Quy trình Ghi nhận Tự động (Auto-Logging & Work Log)

- Khi hoàn thành task, AI Agent **BẮT BUỘC** cập nhật trạng thái từ `[ ]` thành `[x]` tại mục task tương ứng trong `docs/mindmap.md`.
- Ghi tóm tắt chi tiết kết quả thực hiện vào mục `## 5. NHẬT KÝ CẬP NHẬT TÀI LIỆU & WORK LOG` ở cuối file `docs/mindmap.md`, bao gồm:
  - **Mã Task & Tiêu đề:** (Ví dụ: `P0.T08 — Final GM-1 Schema Review`).
  - **Files đã sửa đổi:** Đường dẫn chi tiết các file source code và docs.
  - **Logic chính đã triển khai:** Các thay đổi kiến trúc, thuật toán hoặc ràng buộc dữ liệu.
  - **Kết quả kiểm thử:** Trạng thái pass của `npm test`, `npx tsc --noEmit` và `npm run lint`.

## 5. Kỷ luật Nhánh Git Nghiêm ngặt (Strict Git Feature Branch Workflow)

- **CẤM TUYỆT ĐỐI** làm việc hoặc commit trực tiếp trên nhánh `main`.
- Mọi công việc/task mới bắt buộc phải rẽ nhánh mới từ nhánh `main` cập nhật nhất theo quy ước chuẩn:
  - Tính năng mới: `feat/<ma-task>-<mo-ta-ngan>` (Ví dụ: `feat/p1-t01-gm1-tables`).
  - Sửa lỗi: `fix/<ma-task>-<mo-ta-ngan>` (Ví dụ: `fix/auth-session-leak`).
  - Tài liệu/Quy trình: `docs/<mo-ta-ngan>` (Ví dụ: `docs/reorganize-workflow-and-rules`).
- **CẤM** tạo nhánh có tiền tố `backup/...` (Ví dụ: `backup/phase0-...`).
- **Điều kiện Commit:** Chỉ được chạy `git commit` khi đã hoàn thành 100% yêu cầu trong phiên và bắt buộc vượt qua 2 lệnh kiểm tra chất lượng:
  1. `npm test` (Tất cả test suites đều PASS).
  2. `npx tsc --noEmit` (Không có bất kỳ lỗi type TypeScript nào).
- **Quyền Merge:** Tuyệt đối không tự ý merge nhánh tính năng vào `main`. Quyền merge chỉ được thực hiện sau khi có lệnh nghiệm thu rõ ràng từ Project Owner.

## 6. Quy chuẩn Kỹ thuật của Dự án

- **Expo SDK 58:** Ứng dụng di động xây dựng trên Expo SDK 58 (`~58.0.0`) và React Native `0.88.0`. Luôn đối chiếu phiên bản `package.json` và tài liệu chính thức Expo SDK 58; không suy diễn API từ các phiên bản cũ.
- **Expo Router:** Toàn bộ điều hướng mobile nằm trong `src/app/` (routes, layouts). Các components, hooks, storage, utils dùng chung nằm ngoài thư mục `src/app/`.
- **Thực tế Dependencies:** `package.json` và `package-lock.json` là nguồn xác thực dependency duy nhất. Không coi thư viện được đề xuất trong tài liệu kế hoạch là đã cài đặt.
- **Bảo vệ Native Output:** Thư mục `android/` là output sinh tự động của Continuous Native Generation (CNG) và bị Git ignore. Không sửa tay, không xóa và không tạo thủ công thư mục native. Mọi cấu hình native thực hiện qua `app.json` và Expo config plugins.
- **An toàn Tuyệt đối Supabase Cloud:**
  - Migrations trong `supabase/migrations/` là mã nguồn phiên bản, không tự động apply lên Cloud.
  - Tuyệt đối **CẤM** tự ý chạy lệnh SQL, kết nối/thay đổi Cloud project, reset database hoặc áp dụng migration nếu chưa có phê duyệt bằng văn bản từ Owner.
  - Không cấp quyền ghi (DML) trực tiếp cho client trên các bảng core để bảo vệ mutation gateway, versioning và receipt contract.

## 7. Kiểm tra và Nghiệm thu trước khi Kết thúc Task

- Trước khi tuyên bố hoàn tất bất kỳ task nào, Agent bắt buộc phải chạy:
  ```bash
  npm test              # Toàn bộ test suites pass
  npx tsc --noEmit      # Typecheck TypeScript không lỗi
  npm run lint          # Linting tuân thủ Expo flat config
  ```
- Ghi nhận trung thực kết quả kiểm tra vào Work Log; không khẳng định đã chạy khi chưa thực thi.

---

## Nhật ký cập nhật quy tắc

| Ngày | Nội dung thay đổi | Lý do |
|---|---|---|
| 2026-10-22 | Bổ sung baseline Expo/Router/npm, quy tắc native output, phê duyệt Supabase và an toàn dọn dẹp. | Đồng bộ hướng dẫn với cấu trúc dự án thực tế. |
| 2026-10-25 | Ban hành Bộ Quy tắc Thép: Bãi bỏ quy tắc tạo file `[tenmodule].md`, thu gọn tài liệu về đúng 8 file SSOT cốt lõi, áp dụng Strict Git Feature Branch Workflow (`feat/...`, cấm commit trên `main`, cấm nhánh `backup/...`), và Focus Roadmap 1 task kèm Auto-Logging vào `mindmap.md`. | Chấm dứt tình trạng phân mảnh tài liệu (25 files -> 8 files), thiết lập kỷ luật code và quy trình quản trị chuyên nghiệp. |
