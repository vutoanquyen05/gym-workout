# Color Palette — Single Source of Truth

Nguồn: `baocao.md`, mục 9.2–9.4. Chỉ dùng token; kiểm tra độ tương phản theo cặp thực tế.

### 9.2. Bảng màu Dark Theme

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

### 9.3. Bảng màu Light Theme

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

Màu nhấn của hai theme có thể khác nhau nhằm duy trì độ tương phản với nền. Không nên mặc định dùng cùng một mã màu cho mọi theme nếu điều đó làm giảm khả năng đọc.

### 9.4. Kiểm tra độ tương phản WCAG

WCAG 2.2 quy định mức tương phản tối thiểu:

- **Văn bản thông thường:** 4.5:1 theo WCAG AA.
- **Văn bản lớn:** 3:1 theo WCAG AA.
- **Thành phần giao diện và đối tượng đồ họa cần thiết để nhận biết:** thông thường cần 3:1 so với màu liền kề theo tiêu chí áp dụng.

Bảng dưới đây ghi nhận các cặp màu đã được tính toán trong phương án thiết kế:

| Theme | Màu chữ | Màu nền | Tỷ lệ tương phản | Đánh giá |
|---|---|---|---:|---|
| Dark | `#F4F6F8` | `#121417` | 17.03:1 | Đạt AA và AAA cho văn bản thường |
| Dark | `#B0B8C2` | `#121417` | 9.21:1 | Đạt AA và AAA cho văn bản thường |
| Dark | `#121417` | `#FF6B35` | 6.51:1 | Đạt AA và AAA cho văn bản thường |
| Light | `#171A1F` | `#F7F8FA` | 16.41:1 | Đạt AA và AAA cho văn bản thường |
| Light | `#525B66` | `#F7F8FA` | 6.49:1 | Đạt AA và AAA cho văn bản thường |
| Light | `#FFFFFF` | `#C94718` | 4.77:1 | Đạt AA cho văn bản thường |
| Light | `#FFFFFF` | `#075EA8` | 6.61:1 | Đạt AA và AAA cho văn bản thường |
| Light | `#FFFFFF` | `#167447` | 5.80:1 | Đạt AA cho văn bản thường |

Các tỷ lệ trên chỉ áp dụng cho đúng cặp màu được liệt kê. Cần kiểm tra thêm từng cặp màu thực tế, đặc biệt là văn bản trên thẻ, nhãn lỗi, placeholder, icon và các trạng thái disabled.

Không nên dùng màu đơn thuần để truyền tải ý nghĩa. Ví dụ, trạng thái lỗi cần có biểu tượng hoặc thông báo chữ bên cạnh màu cảnh báo.
