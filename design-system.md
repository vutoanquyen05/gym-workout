# Design System — Single Source of Truth

Nguồn: `baocao.md`, mục 8–10. Màu HEX chỉ được định nghĩa trong `color-palette.md`; không tạo bảng màu khác ở đây.

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

---
