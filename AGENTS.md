# AGENTS.md — MONOREPO & STATELESS GOVERNANCE BLUEPRINT

Dự án này là nền tảng **Monorepo (Next.js 15 Admin/PT Web Portal + Expo SDK 58 Mobile App + Supabase PostgreSQL)** mang tên **Gym Tracker v2.0 (All-in-One Gym ERP & 3-Tier Workout Coaching Platform)**.

---

## 1. STATELESS SESSION BOOTSTRAP PROTOCOL (GIAO THỨC KHỞI ĐỘNG KHÔNG TRẠNG THÁI)

Mọi AI Agent khi khởi động phiên làm việc mới (không có bộ nhớ ngữ cảnh từ phiên trước) **BẮT BUỘC** thực thi nghiêm ngặt theo 4 bước sau:

1. **Bước 1 — Nắm vững Quy tắc Thép:** Đọc [`docs/rule.md`](./docs/rule.md) để hiểu rõ mô hình phân vai Advisor/Coding Agent, kỷ luật Git Branch Workflow, Quality Gates và mẫu báo cáo bắt buộc `Task Execution Report`.
2. **Bước 2 — Định vị Trạng thái Dự án (Read Stateless Pointer):** Đọc mục `## 0. CURRENT EXECUTION POINTER (STATELESS HANDOFF)` ở ngay đầu tệp [`docs/mindmap.md`](./docs/mindmap.md) để xác định chính xác:
   - `Current Architecture Version` (Phiên bản kiến trúc hiện hành).
   - `Current Phase` (Phase đang thực thi).
   - `Current Active Task` (Task ID duy nhất cần làm).
   - `Active Git Branch` (Nhánh Git làm việc hiện tại).
   - `Next Action` (Hành động kỹ thuật tiếp theo được giao).
3. **Bước 3 — Đối chiếu Kho lưu trữ Thực tế:** Chạy `git status` và `git branch` để kiểm tra working tree và bảo đảm đang đứng đúng nhánh feature branch tương ứng với Task được giao.
4. **Bước 4 — Thực thi Duy nhất 1 Task & Nghiệm thu:**
   - Chỉ thực hiện các thay đổi trong phạm vi `SCOPE` của Task.
   - Chạy đầy đủ các Quality Gates bắt buộc: `npm run lint`, `npx tsc --noEmit`, `npm test` (hoặc `npm.cmd test` trên Windows).
   - Khi hoàn thành, cập nhật trạng thái `[x]` và ghi tóm tắt vào `## 5. NHẬT KÝ CẬP NHẬT TÀI LIỆU & WORK LOG` trong [`docs/mindmap.md`](./docs/mindmap.md).
   - Xuất báo cáo nghiệm thu theo đúng mẫu `Task Execution Report`.

---

## 2. MONOREPO ARCHITECTURE & COMMANDS

Hệ thống được tổ chức theo cấu trúc NPM Monorepo (`workspaces: ["apps/*", "packages/*"]`):

### 2.1. Phân hệ Admin & PT Web Portal (`apps/admin-web`)
- **Công nghệ cốt lõi:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, `@supabase/ssr` (Server-First Cookie SSR Architecture).
- **Nguyên tắc kỹ thuật:**
  - Mọi thao tác đọc/ghi nhạy cảm thực hiện qua Server Components và Server Actions (`actions.ts`).
  - Session lưu trữ an toàn trong Cookie `httpOnly`, `secure`, `sameSite: 'lax'`.
  - Middleware (`src/middleware.ts`) điều phối xác thực và bảo vệ tuyến đường `/dashboard/*` bằng `supabase.auth.getUser()`.
- **Lệnh thực thi:**
  ```bash
  npm run dev --workspace=@gym-tracker/admin-web      # Khởi chạy dev server cổng 3000
  npm run build --workspace=@gym-tracker/admin-web    # Build Next.js production
  npm run lint --workspace=@gym-tracker/admin-web     # Lint code Admin Web
  ```

### 2.2. Phân hệ Workout Mobile App (`apps/mobile`)
- **Công nghệ cốt lõi:** Expo SDK 58 (`~58.0.0`), React Native `0.88.0`, React `19.3.0`, `expo-router` (`~58.0.26`), `expo-sqlite` (`~58.0.14`), `expo-secure-store` (`~58.0.2`).
- **Nguyên tắc kỹ thuật:**
  - Tuyệt đối không tin tưởng dữ liệu huấn luyện cũ về Expo. Trước khi đụng vào Expo API, đối chiếu phiên bản `package.json` và đọc tài liệu versioned: `https://docs.expo.dev/versions/v58.0.0/` hoặc `https://docs.expo.dev/llms.txt`.
  - Điều hướng bằng Expo Router trong `src/app/`. Các components, hooks, storage, utils dùng chung nằm ngoài `src/app/`.
  - Lưu trữ nội bộ ngoại tuyến 100% bằng SQLite v1 (`gym-workout.db`) thông qua `StorageProvider` React Context.
  - Thư mục `android/` và `ios/` là output sinh tự động của Continuous Native Generation (CNG). Tuyệt đối không chỉnh sửa bằng tay.
- **Lệnh thực thi:**
  ```bash
  npx expo install <package>                         # Cài đặt gói tương thích SDK 58
  npx expo start                                     # Khởi động Metro bundler
  npm test --workspace=@gym-tracker/mobile           # Chạy Jest unit tests
  npx expo lint                                      # Lint code mobile
  npx expo-doctor                                    # Chẩn đoán sức khỏe dependencies
  ```

### 2.3. Lệnh Kiểm thử & Chất lượng Toàn Repo (Quality Gates)
Trước khi bàn giao bất kỳ task nào, bắt buộc phải vượt qua:
```bash
npm run lint          # Linting toàn bộ repo
npx tsc --noEmit      # Typecheck TypeScript không lỗi
npm test              # Toàn bộ test suites pass (npm.cmd test trên Windows PowerShell)
```

### 2.4. An toàn Tuyệt đối Supabase Cloud
- Các tệp trong `supabase/migrations/` là mã nguồn phiên bản, không tự động apply lên Cloud.
- **NGHIÊM CẤM** tự ý chạy lệnh SQL, kết nối/thay đổi Cloud project, reset database hoặc áp dụng migration nếu chưa có phê duyệt bằng văn bản từ Project Owner.
- Mọi thao tác ghi trên các bảng Core/CRM phải đi qua Mutation Gateway hoặc RLS policies chặt chẽ; không dùng `USING (true)` trên các bảng người dùng hoặc dữ liệu nhạy cảm.

---

## 3. STRICT 8-FILE DOCUMENTATION LOCK & GIT WORKFLOW

- **Khóa 8 Tệp Tài Liệu Cốt Lõi (Strict 8-File Lock):** Toàn bộ tri thức, đặc tả và kiến trúc của dự án được lưu trữ duy nhất trong đúng 8 tệp SSOT dưới thư mục `docs/`:
  1. [`docs/rule.md`](./docs/rule.md) (Quy tắc làm việc, mô hình phân vai Advisor/Coding, tiêu chuẩn kỹ thuật)
  2. [`docs/mindmap.md`](./docs/mindmap.md) (Stateless Pointer, Lộ trình v2.0, ma trận task & Work Log)
  3. [`docs/baocao.md`](./docs/baocao.md) (Product Vision v2.0, 8 chu trình E2E, kiến trúc hệ thống)
  4. [`docs/risks-decisions.md`](./docs/risks-decisions.md) (Sổ bộ quyết định OD-01..08, D-MT và ma trận rủi ro)
  5. [`docs/supabase-schema.md`](./docs/supabase-schema.md) (Schema PostgreSQL, DDL migrations, RLS & RBAC)
  6. [`docs/data-offline.md`](./docs/data-offline.md) (Kiến trúc Offline-First, hợp đồng đồng bộ, SQLite runtime)
  7. [`docs/design-system.md`](./docs/design-system.md) (Design system, ThemeProvider, màu sắc, routes mobile)
  8. [`docs/testing-acceptance.md`](./docs/testing-acceptance.md) (Chiến lược kiểm thử tự động, test suites, tiêu chí AC)
  - **CẤM TUYỆT ĐỐI** tạo thêm tệp `.md` mới trong `docs/` hoặc tệp tạm `.bak`, `.tmp`, `-copy` trong repository.
- **Kỷ luật Nhánh Git theo Phase (Strict Git Feature Branch Workflow):**
  - **CẤM** commit hoặc làm việc trực tiếp trên nhánh `main`.
  - Mọi task mới phải rẽ nhánh từ `main`: `feat/<task-id>-<desc>`, `fix/...`, `docs/...`, `chore/...`. Cấm tạo nhánh `backup/...`.
  - **Quy tắc Đóng gói theo Phase:** Chỉ thực hiện `git merge` vào `main` và `git push` khi hoàn thành toàn bộ Phase và có chỉ thị đóng gói chính thức từ Project Owner.
