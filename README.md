# Gym & Workout

Ứng dụng di động Gym & Workout giúp người dùng tổ chức kế hoạch tập, ghi nhận buổi tập và theo dõi tiến độ. Dự án được xây dựng với Expo, React Native và TypeScript; hiện tập trung vào nền tảng giao diện và lưu trữ SQLite cục bộ. Các màn hình tính năng và tích hợp backend vẫn đang trong quá trình phát triển.

## Tech stack

| Công nghệ | Phiên bản/cách sử dụng |
|---|---|
| Expo | SDK 57 (`~57.0.30`) |
| React Native | `0.86.3` |
| React | `19.2.3` |
| TypeScript | `~6.0.3` |
| Expo Router | `~57.0.28`, điều hướng theo file |
| Expo SQLite | `~57.0.4`, nền tảng lưu trữ cục bộ |
| Supabase JavaScript client | `^2.118.0`, dependency đã khai báo; Auth và đồng bộ chưa tích hợp |
| Jest / jest-expo | Unit và component tests |
| React Native Testing Library | Kiểm thử component React Native |
| ESLint | Expo flat config |

`package.json` và `package-lock.json` là nguồn xác nhận dependency. Các thư viện/API được nêu trong tài liệu quy hoạch không mặc nhiên có nghĩa là đã được cài hoặc tích hợp.

## Project structure

```text
src/
├── app/                    # Expo Router layouts, auth routes và tab routes
├── components/             # Components dùng chung và giao diện scaffold
├── hooks/                  # Hooks dùng chung
├── constants/              # Tương thích theme/token hiện có
└── shared/
    ├── design-system/      # Theme, tokens và UI components
    └── storage/            # SQLite schema, migrations và repositories
__tests__/                  # Jest tests
docs/                       # Kiến trúc, quy tắc, roadmap và tài liệu module
scripts/                    # Tiện ích phát triển
supabase/migrations/        # PostgreSQL migrations đã chuẩn bị
```

Các route Expo Router và layout nằm trong `src/app/`. Mã dùng chung, storage và component không phải route đặt ngoài thư mục route.

## Getting started

### Yêu cầu

- Node.js tương thích với Expo SDK 57.
- npm.
- Thiết bị hoặc emulator phù hợp với nền tảng bạn muốn chạy. Một số native modules có thể cần development build thay vì Expo Go.

### Cài dependency và chạy ứng dụng

```bash
npm ci
npx expo start
```

Sau khi Expo khởi động, làm theo hướng dẫn trong terminal để mở app trên thiết bị hoặc emulator.

## Testing & quality checks

```bash
npm test
npm run lint
npx tsc --noEmit
```

## Trạng thái hiện tại

- Expo Router, design system và SQLite schema/repositories có trong source. Storage vẫn là module cục bộ; chưa có luồng đồng bộ backend.
- Các route tính năng và Auth còn ở trạng thái scaffold.
- Supabase JavaScript client có trong dependencies, nhưng Supabase Auth, mutation gateway và sync chưa được tích hợp.
- Các file trong `supabase/migrations/` mới được chuẩn bị; chưa được áp dụng hoặc xác minh runtime trên PostgreSQL/Supabase. Không chạy migrations nếu chưa có phê duyệt riêng.

## Tài liệu

- [Tài liệu dự án](./docs/)
- [Quy tắc làm việc](./docs/rule.md)
- [Roadmap](./docs/mindmap.md)
- [Kiến trúc](./docs/architecture.md)
- [Tech stack và API thiết bị](./docs/tech-stack.md)
- [SQLite và offline-first](./docs/data-offline.md)
- [Supabase schema và migrations](./docs/supabase-schema.md)
- [Kiểm thử và nghiệm thu](./docs/testing-acceptance.md)

Quy tắc cho agent được đặt tại [AGENTS.md](./AGENTS.md); Claude Code đọc cùng hướng dẫn qua [CLAUDE.md](./CLAUDE.md).
