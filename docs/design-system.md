# Design System — Single Source of Truth

## 1. Color Palette (Bảng màu Chuẩn Dark & Light Theme)

### Bảng màu Dark Theme
| Token | HEX | Công dụng |
|---|---|---|
| `background` | `#121417` | Nền màn hình |
| `surface` | `#1C2025` | Nền thẻ và khu vực nội dung |
| `surface-elevated` | `#292F36` | Thành phần nổi hoặc vùng nhấn nhẹ |
| `text-primary` | `#F4F6F8` | Văn bản chính |
| `text-secondary` | `#B0B8C2` | Văn bản phụ |
| `brand-primary` | `#FF6B35` | Nút chính và điểm nhấn |
| `info` | `#65BFFF` | Thông tin và trạng thái cần chú ý |
| `success` | `#57D68D` | Trạng thái thành công |
| `danger` | `#FF7777` | Lỗi hoặc cảnh báo quan trọng |

### Bảng màu Light Theme
| Token | HEX | Công dụng |
|---|---|---|
| `background` | `#F7F8FA` | Nền màn hình |
| `surface` | `#FFFFFF` | Nền thẻ |
| `surface-elevated` | `#E8ECF1` | Thành phần nổi hoặc vùng phân biệt |
| `text-primary` | `#171A1F` | Văn bản chính |
| `text-secondary` | `#525B66` | Văn bản phụ |
| `brand-primary` | `#C94718` | Nút chính và điểm nhấn |
| `info` | `#075EA8` | Thông tin và trạng thái cần chú ý |
| `success` | `#167447` | Trạng thái thành công |
| `danger` | `#B42318` | Lỗi hoặc cảnh báo quan trọng |

### Tiêu chuẩn Tương phản WCAG 2.2 AA
- Văn bản thông thường: Tối thiểu 4.5:1.
- Văn bản lớn: Tối thiểu 3.0:1.
- Active tab text dùng `textPrimary` trên cả hai theme để đảm bảo độ tương phản AA.

---

## 2. Typography & Spacing System

### 9.5. Typography

Font chữ đề xuất là **Inter** hoặc font hệ thống phù hợp với nền tảng. Font cần hỗ trợ đầy đủ ký tự tiếng Việt.

| Token | Kích thước | Độ đậm | Ứng dụng |
|---|---:|---:|---|
| `display` | 32 px | 700 | Số liệu nổi bật hoặc tiêu đề đặc biệt |
| `h1` | 28 px | 700 | Tiêu đề màn hình |
| `h2` | 24 px | 700 | Tiêu đề khu vực lớn |
| `h3` | 20 px | 600 | Tiêu đề thẻ hoặc nhóm nội dung |
| `title` | 18 px | 600 | Tiêu đề thành phần |
| `body` | 16 px | 400 | Nội dung chính |
| `body-small` | 14 px | 400 | Nội dung phụ |
| `label` | 14 px | 600 | Nhãn trường nhập |
| `caption` | 12 px | 400 | Chú thích hoặc thông tin phụ |

Quy tắc sử dụng:

- Dùng `body` làm kích thước mặc định cho nội dung quan trọng.
- Hạn chế sử dụng chữ 12 px cho thông tin cần đọc trong khi tập.
- Dùng font weight để phân cấp thay vì chỉ dựa vào màu.
- Hỗ trợ Dynamic Type hoặc cơ chế phóng to chữ tương ứng của React Native.
- Kiểm tra hiện tượng tràn chữ khi tên bài tập hoặc nội dung dịch dài.

### 9.6. Hệ thống spacing 4/8 px

Spacing sử dụng đơn vị cơ sở 4 px, ưu tiên các bội số của 4 hoặc 8.

| Token | Kích thước | Ứng dụng |
|---|---:|---|
| `space-1` | 4 px | Khoảng cách rất nhỏ |
| `space-2` | 8 px | Khoảng cách giữa icon và nhãn |
| `space-3` | 12 px | Khoảng cách giữa các thành phần gần nhau |
| `space-4` | 16 px | Padding thẻ và khoảng cách tiêu chuẩn |
| `space-5` | 20 px | Padding ngang màn hình rộng hơn |
| `space-6` | 24 px | Khoảng cách giữa các nhóm nội dung |
| `space-8` | 32 px | Khoảng cách giữa các khu vực lớn |
| `space-10` | 40 px | Khoảng cách phân khu |
| `space-12` | 48 px | Khoảng cách lớn hoặc bố cục đặc biệt |

Không bắt buộc mọi khoảng cách phải dùng token. Tuy nhiên, các giá trị thông dụng cần thống nhất để tránh giao diện thiếu nhất quán.

### 9.7. Border radius và kích thước icon

| Thành phần | Giá trị đề xuất |
|---|---|
| Input nhỏ hoặc chip | 8–10 px |
| Button và input chính | 10–12 px |
| Card | 16 px |
| Sheet hoặc khu vực lớn | 20–24 px |
| Icon nhỏ | 16 px |
| Icon thông thường | 20–24 px |
| Icon lớn | 28–32 px |

Các giá trị trên là token thiết kế, không phải giới hạn cứng. Có thể điều chỉnh khi có bằng chứng từ kiểm thử giao diện.

### 9.8. Button

**Thông số đề xuất:**

- Chiều cao tiêu chuẩn: 48 px.
- Chiều cao compact: tối thiểu khoảng 40 px; vẫn phải bảo đảm vùng chạm phù hợp.
- Border radius: 12 px.
- Padding ngang: 16–24 px.
- Font: 16 px, weight 600.
- Trạng thái: default, pressed, disabled, loading và error nếu cần.

**Màu nút chính:**

| Theme | Nền | Chữ |
|---|---|---|
| Dark | `#FF6B35` | `#121417` |
| Light | `#C94718` | `#FFFFFF` |

**Các loại nút:**

- Primary: hành động chính, chẳng hạn bắt đầu buổi tập.
- Secondary: hành động phụ, có thể dùng nền trung tính hoặc viền.
- Text/Ghost: thao tác phụ ít nổi bật.
- Destructive: thao tác cần cảnh báo, như xóa dữ liệu.

Nút loading cần ngăn gửi thao tác lặp không mong muốn. Nút disabled phải có trạng thái nhận biết rõ, không chỉ dựa vào giảm độ sáng nếu độ tương phản không đạt.

### 9.9. Card

**Thông số đề xuất:**

- Border radius: 16 px.
- Padding: 16 px.
- Khoảng cách giữa nội dung: 8–12 px.
- Viền: 1 px khi cần phân tách.
- Nền: `surface` hoặc `surface-elevated`.

Card được sử dụng cho:

- Bài tập.
- Kế hoạch tập.
- Thống kê tiến bộ.
- Mục tiêu.
- Lịch sử buổi tập.

Mỗi card nên có một trọng tâm thông tin. Tránh đặt quá nhiều hành động ngang hàng trong cùng một card.

### 9.10. Input

**Thông số đề xuất:**

- Chiều cao: 48–52 px.
- Border radius: 10–12 px.
- Padding ngang: 12–16 px.
- Nhãn luôn hiển thị hoặc có cách thay thế tương đương dễ hiểu.
- Trạng thái: default, focused, error, disabled và filled.

Đối với trường nhập số lần lặp và mức tạ:

- Sử dụng bàn phím số phù hợp.
- Giữ lại giá trị khi người dùng chuyển giữa các trường.
- Kiểm tra giá trị không hợp lệ.
- Hiển thị thông báo lỗi cụ thể.
- Tránh tự động đặt lại dữ liệu khi trạng thái màn hình thay đổi.

### 9.11. Bottom Navigation

**Thông số đề xuất:**

- Số mục: 4–5.
- Icon: 24 px.
- Chiều cao vùng nội dung: khoảng 56–64 px, chưa tính phần safe area.
- Vùng chạm: tối thiểu 44 × 44 px.
- Mỗi mục có nhãn đi kèm icon.
- Trạng thái active được thể hiện bằng màu và dấu hiệu thị giác bổ sung.

Trong màn hình đang tập, có thể ẩn hoặc tùy chỉnh thanh điều hướng nếu thanh này làm giảm không gian thao tác. Việc điều hướng ra khỏi buổi tập cần có cơ chế bảo toàn trạng thái.

### 9.12. Motion và phản hồi tương tác

| Loại tương tác | Thời lượng tham khảo |
|---|---:|
| Phản hồi button | 100–180 ms |
| Chuyển trạng thái nhẹ | 100–180 ms |
| Bottom sheet hoặc panel | 180–250 ms |

Dùng animation vừa đủ để phản hồi hành động, không làm chậm thao tác. Có thể sử dụng Expo Haptics cho các hành động phù hợp, nhưng cần cho phép người dùng tắt hoặc điều chỉnh nếu cần.

### 9.13. Cấu trúc triển khai Design System

```text
src/shared/design-system/
├── tokens/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── radius.ts
│   └── sizes.ts
├── theme/
│   ├── light.ts
│   ├── dark.ts
│   ├── ThemeProvider.tsx
│   └── useTheme.ts
└── components/
    ├── Button.tsx
    ├── Card.tsx
    ├── Input.tsx
    ├── AppText.tsx
    ├── Screen.tsx
    ├── IconButton.tsx
    └── BottomNavigation.tsx
```

Các component dùng chung nên nhận token từ theme thay vì khai báo trực tiếp mã HEX tại từng màn hình. Điều này giúp chuyển đổi Light/Dark Theme và thay đổi bảng màu dễ dàng hơn.

---
## 10. Khả năng tiếp cận và trải nghiệm sử dụng

### 10.1. Hỗ trợ sử dụng bằng một tay

- Đặt các hành động thường dùng ở khu vực dễ chạm.
- Giữ kích thước nút đủ lớn.
- Hạn chế các thao tác yêu cầu độ chính xác cao.
- Không đặt hành động nguy hiểm sát nút hoàn thành hiệp.
- Tránh yêu cầu nhập quá nhiều thông tin trước khi bắt đầu tập.

### 10.2. Hỗ trợ người dùng có nhu cầu tiếp cận

- Sử dụng nhãn cho nút và icon khi cần.
- Hỗ trợ screen reader bằng accessibility label và role phù hợp.
- Đảm bảo thứ tự focus hợp lý.
- Không truyền đạt trạng thái chỉ bằng màu.
- Hỗ trợ tăng cỡ chữ.
- Kiểm thử với độ tương phản và kích thước màn hình khác nhau.

### 10.3. Trạng thái giao diện cần chuẩn hóa

Mỗi màn hình có dữ liệu nên xem xét các trạng thái:

- Loading.
- Success.
- Empty.
- Error.
- Offline.
- Disabled.
- Nội dung chưa đồng bộ.
- Dữ liệu đang được lưu hoặc khôi phục.

Ví dụ, khi lịch sử tập luyện chưa có dữ liệu, nên hiển thị trạng thái trống với hướng dẫn hành động tiếp theo thay vì một màn hình trắng.

## Theo dõi triển khai module design-system

### Mục đích

Triển khai palette, theme, tokens và component UI dùng chung theo đặc tả trên, ưu tiên mobile-first, Light/Dark, khả năng tiếp cận và tương thích iOS/Android/web.

### Kiến trúc/Cấu trúc

- `src/shared/design-system/colors.ts`, `typography.ts`, `spacing.ts`, `radius.ts`, `sizes.ts`: nguồn tokens.
- `src/shared/design-system/theme-provider.tsx`: cung cấp theme scheme và colors cho component.
- `src/shared/design-system/components/`: `AppText`, `Screen`, `Button`, `Card`, `Input`, `IconButton` và barrel exports.
- `src/shared/design-system/components/bottom-navigation.tsx`: cấu hình native bottom tabs theo các route Expo Router hiện có.
- `src/shared/design-system/components/feedback-state.tsx`: các trạng thái loading, success, empty, error, offline, disabled, unsynced và saving.
- `src/constants/theme.ts`: compatibility exports cho các consumers hiện hữu.
- `__tests__/design-tokens-test.ts` và `__tests__/design-components-test.tsx`: kiểm chứng token, tính tương thích, hành vi component và feedback states.

### Lịch sử phát triển

- Phase 2.T01: xây dựng palette Dark/Light và provider theo system hoặc mode tường minh.
- Phase 2.T02: bổ sung typography, spacing, radius và size tokens.
- Phase 2.T03: tạo các component design system dùng chung theo tokens.
- Phase 2.T04: tích hợp bottom navigation dùng chung và component trạng thái phản hồi chuẩn.
- Phase 2.T05: rà soát WCAG contrast, vùng chạm, safe area, phóng to/chảy dòng chữ và điều chỉnh các cặp màu viền/selected label chưa đạt.

### Nhật ký chỉnh sửa

| Thời gian | Nội dung | Lý do | Kết quả |
|---|---|---|---|
| 2026-10-18 | Bổ sung theo dõi cấu trúc triển khai design-system vào đặc tả. | Đồng bộ đặc tả với module tokens/components thực tế và quy tắc tài liệu module. | Ghi nhận T01–T03; T03 được nghiệm thu sau khi test, typecheck, lint và static export đạt. |
| 2026-10-18 | Cập nhật theo dõi T04 cho bottom navigation và feedback states. | Đồng bộ kiến trúc triển khai thực tế với đặc tả UI. | T04 được nghiệm thu với Jest 9 tests, typecheck/lint và static exports iOS/Android/web. |
| 2026-10-18 | Ghi nhận kiểm tra khả năng tiếp cận T05: 44pt control targets, safe-area/scroll behavior, font scaling, contrast thresholds và giới hạn runtime device checks. | Phản ánh kết quả đo được và minh bạch các kiểm thử cần thiết bị thật. | Jest: 5 suites, 13 tests; typecheck/lint/dependency check và static exports đạt; chưa đo runtime font enlargement hoặc native tab hit regions trong phiên này. |

---

## Kiến trúc Điều hướng & Routes Mobile (Hợp nhất từ navigation.md & theme.md)

### 1. Cấu trúc Điều hướng Expo Router
- `src/app/_layout.tsx`: Root Stack bọc toàn bộ ứng dụng bằng `AppThemeProvider`, đồng bộ scheme với React Navigation ThemeProvider và quản lý splash overlay.
- `src/app/index.tsx`: Route gốc, tự động redirect vào nhóm tab chính `/(tabs)`.
- `src/app/(tabs)/_layout.tsx`: Gắn component `BottomNavigation` vào layout các tabs.
- `src/app/(tabs)/*.tsx`: 5 màn hình chính MVP:
  - `index.tsx`: Màn hình Home (Tổng quan tập luyện / Thẻ hội viên).
  - `workouts.tsx`: Màn hình Kế hoạch tập luyện (Workouts).
  - `exercises.tsx`: Thư viện bài tập (Exercise Library).
  - `progress.tsx`: Thống kê tiến độ (Progress / Charts).
  - `profile.tsx`: Hồ sơ cá nhân và cài đặt ứng dụng.
- `src/app/(auth)/*.tsx`: Nhóm route xác thực độc lập:
  - `_layout.tsx`: Stack layout cho Auth.
  - `login.tsx`: Điểm vào giao diện đăng nhập.
  - `register.tsx`: Điểm vào giao diện đăng ký.
- `src/components/route-placeholder.tsx`: Component placeholder chung hiển thị trong lúc các feature đang trong lộ trình phát triển.

### 2. Cấu trúc Theme Provider & Hỗ trợ Web SSR
- `src/shared/design-system/theme-provider.tsx`: Cung cấp `AppThemeProvider` quản lý theme context (`mode`, `scheme`, `colors`, `setMode`). Ném lỗi rõ ràng nếu `useAppTheme` được gọi ngoài provider.
- `src/hooks/use-color-scheme.ts`: Đọc `useColorScheme` của React Native cho iOS/Android.
- `src/hooks/use-color-scheme.web.ts`: Dùng `useSyncExternalStore` để giữ render đầu tiên ở SSR là Light theme nhằm chống mismatch hydration; sau hydration tự động đồng bộ theo theme của trình duyệt.
- `src/shared/design-system/components/bottom-navigation.tsx`: Triển khai thanh điều hướng 5 tab NativeTabs với tokenized icons, màu sắc chuẩn và nhãn luôn hiển thị trên Android.
