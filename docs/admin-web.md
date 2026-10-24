# Admin Web Module

## Mục đích

Giao diện quản trị web (Admin Web) dành cho Owner, Manager và Receptionist để vận hành phòng gym: quản lý hội viên, gói tập, check-in, thanh toán và báo cáo. Admin Web là ứng dụng riêng biệt với mobile app.

## Phạm vi

- Dashboard quản lý gym và branch.
- Quản lý hội viên, gói tập, check-in, thanh toán.
- Phân quyền theo RBAC (Owner/Manager/Receptionist/Trainer).
- Báo cáo và thống kê.

## Trạng thái

**Chưa triển khai.** Admin Web là thành phần mới hoàn toàn. Framework chưa được chốt. Quyết định cần phê duyệt trước khi bắt đầu.

---

## Quyết định kiến trúc (Đã phê duyệt có điều kiện — P0.T07)

| Quyết định | Lựa chọn đã duyệt có điều kiện | Lý do & Ranh giới kỹ thuật | Trạng thái |
|---|---|---|---|
| Framework Admin Web | Next.js App Router + TypeScript (D-MT-02) | SSR/RSC, Auth middleware, ecosystem React thống nhất | APPROVED WITH CONDITIONS |
| Monorepo vs. tách repo | Monorepo bằng npm workspaces (D-MT-01, OD-03=A) | Tận dụng npm workspaces; di chuyển tại **Pre-Phase 2 (trước P2.T01)** | APPROVED WITH CONDITIONS |
| Auth trên Admin Web | Server-First BFF qua cookie `httpOnly: true` (D-MT-03) | Quản lý phiên an toàn qua secure cookies, không dùng `createBrowserClient` | APPROVED WITH CONDITIONS |
| Mutation Gateway | Direct Self-Authorizing RPC + Edge Functions (D-MT-04) | RPC cho transaction ACID, Edge Functions cho orchestration (OD-01=A) | APPROVED WITH CONDITIONS |
| Shared types | `packages/shared-types` | Tránh duplicate TypeScript interfaces; tạo tại Pre-Phase 2 | Đã duyệt theo D-MT-01 |
| UI framework | Tailwind CSS + headless components | Giao diện hiện đại, tối ưu hiệu năng web | Đề xuất |
| Hosting | Vercel / Docker self-hosted | Phụ thuộc hạ tầng triển khai thực tế | Mở (Phase 2) |

> **Ghi chú phê duyệt:** Các quyết định kiến trúc cốt lõi (D-MT-01, 02, 03, 04) đã được Chủ dự án **PHÊ DUYỆT CÓ ĐIỀU KIỆN ngày 2026-10-23 (P0.T07)**. Quá trình triển khai thực tế tuân thủ 5 điều kiện `AC-P0T07-01..05`. Mọi task triển khai phần mềm (từ P2.T01) tiếp tục giữ nguyên trạng thái chưa triển khai `[ ]` theo đúng kế hoạch Phase 2.

---

## Kiến trúc dự kiến (npm workspaces monorepo — Migration tại Pre-Phase 2)

```text
gym-management-monorepo/
├── apps/
│   ├── mobile/                  — Expo/React Native (hiện tại: gym-workout, di chuyển ở Pre-Phase 2)
│   └── admin-web/               — Next.js Admin Web (khởi tạo tại P2.T01)
├── packages/
│   ├── shared-types/            — TypeScript types dùng chung
│   ├── shared-contracts/        — API contracts và validation schemas
│   └── shared-utils/            — Utility functions
└── supabase/
    └── migrations/              — Tất cả SQL migrations
```

> **Lưu ý kỷ luật:** Không di chuyển thư mục hay tái cấu trúc repository trong Phase 0 hoặc Phase 1. Mốc di chuyển chính thức là Pre-Phase 2, ngay trước khi thực thi task `P2.T01`.

---

## Các màn hình/tính năng dự kiến

### Dashboard (Owner/Manager)

- Tổng quan gym: số hội viên active, doanh thu tháng, check-in hôm nay.
- Thống kê theo branch (Manager thấy branch của mình).
- Alert: gói sắp hết hạn, công nợ.

### Quản lý hội viên

- Danh sách, tìm kiếm và lọc hội viên.
- Chi tiết hội viên: hồ sơ, gói tập, lịch check-in, giao dịch.
- Thêm, sửa hội viên.

### Quản lý gói tập

- Danh mục gói (tạo, sửa, deactivate).
- Đăng ký và gia hạn gói cho hội viên.

### Check-in

- Tìm hội viên và check-in thủ công.
- Xem lịch check-in trong ngày.

### Thanh toán

- Ghi nhận giao dịch.
- Lịch sử thanh toán và công nợ.
- Báo cáo doanh thu.

### Quản lý nhân viên (Owner/Manager)

- Danh sách, mời và quản lý nhân viên.

### Cài đặt gym

- Thông tin gym, branch, giờ hoạt động.

---

## Shared Contracts/Types

Dữ liệu trao đổi giữa Admin Web và Mobile App phải qua Supabase (không trực tiếp). Tuy nhiên, TypeScript types nên được dùng chung để tránh lệch schema:

```typescript
// packages/shared-types/src/gym.ts (ví dụ — chưa triển khai)
export interface Gym {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'archived';
}

export interface Branch {
  id: string;
  gymId: string;
  name: string;
  address: string;
  status: 'active' | 'suspended' | 'archived';
}
```

---

## Auth trên Admin Web (Chiến lược Server-First SSR — D-MT-03)

- **Supabase Project dùng chung:** Chia sẻ cùng project Supabase Auth với mobile app, nhưng phân tách cơ chế lưu trữ session.
- **Server-First Session Management:**
  - Dùng `@supabase/ssr` cấu hình trong Next.js Middleware và Server Components.
  - Cookie được đặt bắt buộc với `httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/'`.
  - Tránh rủi ro XSS bằng cách không lưu token trong `localStorage` và không cho phép Client Components đọc trực tiếp cookie qua JavaScript.
- **Route Protection & Role Tra cứu:**
  - Next.js Middleware chặn các request chưa có session hợp lệ và chuyển hướng về `/login`.
  - Phân quyền theo vai trò được tra cứu từ `public.gym_staff` với điều kiện `status = 'active'` (không dựa vào `user_metadata`).
  - Giao diện Admin Web chỉ hiển thị menu theo quyền: Owner (toàn quyền), Manager (chi nhánh được gán), Receptionist (check-in, đăng ký gói), Trainer (lịch PT).
- **Ranh giới Kiểm thử Bảo mật Phiên SSR (SSR Testing Boundaries):**
  - Kiểm thử xử lý xung đột làm mới token đồng thời (race condition) giữa Middleware và các Server Components chạy song song.
  - Kiểm thử cơ chế chia nhỏ cookie (chunking) khi JWT lớn vượt quá 4KB.
  - Kiểm thử đồng bộ trạng thái đăng xuất đa tab và tự động từ chối Server Actions từ tab cũ.
  - Kiểm thử chuyển trang mềm (client soft navigation) qua Next.js router.

---

## Lịch sử phát triển

- 2026-10-23: Tạo tài liệu admin-web phục vụ planning migration. Toàn bộ là thiết kế mục tiêu; chưa có code.

## Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-23 | Khởi tạo tài liệu admin-web. | Planning migration sang multi-tenant gym management. | Tài liệu thiết kế mức đặc tả; chưa có triển khai. |
| 2026-10-23 | Cập nhật định hướng kiến trúc Next.js App Router, npm workspaces, Server-First SSR cookies bảo mật và Edge Functions/RPC gateway. | Chuẩn bị phê duyệt P0.T07 theo chỉ đạo chủ dự án. | Hoàn thiện đặc tả kiến trúc Admin Web chuẩn bị cho Phase 2. |
| 2026-10-23 | Final GM-1 Schema Security Review: Xác định các ranh giới kiểm thử an toàn phiên SSR Server-First (concurrent refresh race condition, cookie chunking, multi-tab logout sync). | Chuẩn bị kế hoạch kiểm thử cho P0.T08 và Phase 1/Phase 2. | Hoàn thiện đặc tả kiến trúc Admin Web; sẵn sàng cho Gate P0.T08. |
| 2026-10-23 | Đồng bộ hóa interface `Gym` và `Branch` trong shared contract với schema chuẩn (`status: 'active' \| 'suspended' \| 'archived'`). | Sửa theo kết quả Phase 0 Documentation Audit (AUD-03). | Loại bỏ `isActive: boolean` khỏi contract mẫu; đồng bộ với `branches.status`. |
