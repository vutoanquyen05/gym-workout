# Gym Tracker - Management Platform

Nền tảng quản lý phòng tập thể hình đa chi nhánh toàn diện (Gym Management Platform), kết hợp cổng quản trị điều hành tập trung trên nền Web (Next.js Admin Portal) và ứng dụng di động theo dõi tập luyện cá nhân hóa dành cho Học viên và Huấn luyện viên cá nhân (PT) (Expo React Native Mobile App).

---

## 1. Tầm nhìn & Mục tiêu (Vision)

- **Cổng Quản trị Phòng tập (Admin Web Portal):** Phục vụ Chủ phòng tập (Gym Owner), Quản lý chi nhánh (Branch Manager), và Lễ tân/Thu ngân. Cho phép quản lý đa cơ sở (Multi-Tenant), quản lý gói thẻ thành viên (Membership), phân công Huấn luyện viên (PT), theo dõi điểm danh (Check-in/Check-out) và báo cáo doanh thu theo thời gian thực.
- **Ứng dụng Di động Hội viên & PT (Mobile App):** Phục vụ Học viên (Member) và Huấn luyện viên (Personal Trainer). Hoạt động mượt mà với kiến trúc Offline-First (lưu trữ cục bộ SQLite khi mất sóng), cho phép theo dõi lộ trình bài tập, giáo án tập luyện (Workout Plans), ghi nhận buổi tập (Sessions) và phân tích tiến độ thể chất.
- **Backend & Cloud Database:** Hệ sinh thái Supabase (PostgreSQL) với cơ chế phân quyền RBAC và chính sách bảo mật dòng Row Level Security (RLS) bảo đảm cô lập dữ liệu tuyệt đối giữa các chi nhánh và người dùng.

---

## 2. Kiến trúc Monorepo (NPM Workspaces)

Dự án được cấu trúc theo mô hình Monorepo tiêu chuẩn nhằm tối ưu hóa chia sẻ mã nguồn, đồng bộ phụ thuộc và tích hợp liên tục:

```text
gym-workout/
├── apps/
│   ├── mobile/                 # Ứng dụng di động Expo / React Native (@gym-tracker/mobile)
│   │   ├── src/app/            # File-based routes (Expo Router v6)
│   │   ├── src/modules/        # Auth, Exercises, Workouts, Progress, Gym-Management
│   │   ├── src/shared/         # Design System tokens/components, SQLite storage repositories
│   │   └── __tests__/          # 13 Jest test suites (Coverage 100% Core)
│   └── admin-web/              # Cổng quản trị Next.js App Router (Sắp triển khai)
├── docs/                       # 8 file tài liệu kiến trúc & quy tắc bị khóa bất biến
│   ├── rule.md                 # Quy tắc làm việc, Git workflow & an toàn kỹ thuật
│   ├── mindmap.md              # Unified Roadmap 9 Phase & Nhật ký Work Log
│   ├── baocao.md               # Tầm nhìn sản phẩm & 8 luồng nghiệp vụ E2E
│   ├── risks-decisions.md      # Sổ đăng ký quyết định kiến trúc OD-01..06
│   ├── supabase-schema.md      # PostgreSQL DDL, GM-1..5 & RLS Multi-Tenancy
│   ├── data-offline.md         # Kiến trúc Offline-First & SQLite Repository
│   ├── design-system.md        # Hệ thống giao diện, Typography & Tokens
│   └── testing-acceptance.md   # Chiến lược kiểm thử & Tiêu chí nghiệm thu
├── supabase/
│   └── migrations/             # PostgreSQL migrations (GM-1 Tenant, Branch, Staff, RPCs)
├── package.json                # Cấu hình Root NPM Workspaces ("apps/*", "packages/*")
├── package-lock.json           # Hoisted dependency lockfile
├── AGENTS.md                   # Quy tắc thép dành cho AI Agents
├── CLAUDE.md                   # Hướng dẫn dành cho Claude Code
└── README.md                   # Tổng quan kiến trúc & hướng dẫn vận hành
```

---

## 3. Tech Stack Chi tiết

| Phân hệ | Công nghệ | Chi tiết sử dụng |
| :--- | :--- | :--- |
| **Monorepo** | NPM Workspaces | Quản lý đa package (`apps/*`, `packages/*`), đồng bộ dependency cấp root. |
| **Mobile App** | Expo SDK 55 / React Native 0.85 | Native runtime, New Architecture, TypeScript strict. |
| | Expo Router v6 | Điều hướng File-based routing, Tabs navigation. |
| | Expo SQLite v16 | Lưu trữ dữ liệu Offline-First cục bộ cho buổi tập và giáo án. |
| | Lucide React Native | Hệ thống Icon vector hiện đại, trực quan. |
| | Jest & Testing Library | 13 test suites kiểm thử đơn vị, component và repository. |
| **Admin Web** | Next.js 15+ (App Router) | Server Components, Server Actions, TypeScript strict. |
| | Tailwind CSS | Utility-first styling, tương thích Design System tokens. |
| **Backend & Cloud** | Supabase (PostgreSQL 15+) | Quản lý dữ liệu quan hệ trên Cloud. |
| | Supabase Auth & RBAC | Xác thực JWT, phân quyền Admin / Branch Manager / PT / Member. |
| | Row Level Security (RLS) | Cô lập dữ liệu đa chi nhánh (Multi-tenancy isolation). |
| | Stored Procedures / RPCs | Transactional mutations và logic bảo mật cao cấp (GM-1..5). |

---

## 4. Hướng dẫn Bắt đầu (Getting Started)

### Yêu cầu tiên quyết
- Node.js (khuyến nghị phiên bản LTS v20+).
- npm (v9+ hỗ trợ NPM Workspaces).

### Cài đặt dependencies toàn hệ thống
```bash
npm install
```

### Vận hành Ứng dụng Di động (`apps/mobile`)
```bash
# Khởi động Metro bundler
npm run start --workspace=@gym-tracker/mobile

# Hoặc chuyển trực tiếp vào thư mục mobile:
cd apps/mobile
npx expo start
```

---

## 5. Kiểm thử & Đảm bảo Chất lượng (Quality Gates)

Trước mỗi lần hoàn thành công việc hoặc commit, hệ thống bắt buộc phải vượt qua toàn bộ 3 chốt kiểm soát chất lượng:

```bash
# 1. Kiểm tra lỗi kiểu dữ liệu TypeScript (Root hoặc apps/mobile)
npx tsc --noEmit -p apps/mobile/tsconfig.json

# 2. Kiểm tra chuẩn mã nguồn Lint
npm run lint

# 3. Chạy toàn bộ 13 Jest test suites
npm test
```

---

## 6. Tài liệu Dự án

Tài liệu dự án được chuẩn hóa và quản lý nghiêm ngặt theo **Quy tắc 8 file cốt lõi** tại thư mục [`docs/`](./docs/):
1. [`docs/rule.md`](./docs/rule.md) - Quy tắc làm việc & Git feature branch workflow.
2. [`docs/mindmap.md`](./docs/mindmap.md) - Lộ trình 9 Phase và ma trận kiểm toán 96 tasks.
3. [`docs/baocao.md`](./docs/baocao.md) - Báo cáo kiến trúc & 8 luồng nghiệp vụ E2E.
4. [`docs/risks-decisions.md`](./docs/risks-decisions.md) - Sổ bộ quyết định kỹ thuật OD-01..OD-06.
5. [`docs/supabase-schema.md`](./docs/supabase-schema.md) - Đặc tả cơ sở dữ liệu PostgreSQL & RLS.
6. [`docs/data-offline.md`](./docs/data-offline.md) - Đặc tả Offline-First & SQLite schema v1.
7. [`docs/design-system.md`](./docs/design-system.md) - Bảng màu Dark/Light, Typography & Spacing.
8. [`docs/testing-acceptance.md`](./docs/testing-acceptance.md) - Kế hoạch kiểm thử & Tiêu chuẩn nghiệm thu.
