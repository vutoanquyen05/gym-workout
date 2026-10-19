# Gym & Workout App

Ứng dụng quản lý tập luyện thể hình trên thiết bị di động, giúp người dùng xây dựng kế hoạch tập luyện, quản lý bài tập, ghi nhận kết quả và theo dõi tiến độ theo thời gian.

Dự án được phát triển bằng **React Native, Expo và TypeScript**, hỗ trợ Android và iOS.

## Công nghệ sử dụng

- **React Native:** Phát triển ứng dụng di động.
- **Expo:** Công cụ phát triển và chạy ứng dụng.
- **TypeScript:** Ngôn ngữ lập trình.
- **Expo Router:** Quản lý điều hướng.
- **SQLite:** Lưu trữ dữ liệu cục bộ.

## Chức năng chính

- Quản lý thông tin cá nhân.
- Tra cứu và tìm kiếm bài tập.
- Tạo và quản lý kế hoạch tập luyện.
- Ghi nhận số hiệp, số lần lặp và mức tạ.
- Theo dõi lịch sử và tiến độ tập luyện.
- Hỗ trợ giao diện Dark Mode và Light Mode.
- Định hướng hỗ trợ lưu trữ ngoại tuyến.

> **Lưu ý:** Các chức năng trên thuộc phạm vi thiết kế dự án và có thể chưa được triển khai đầy đủ.

## Hướng dẫn cài đặt

### 1. Yêu cầu

Cài đặt các công cụ sau:

- [Node.js](https://nodejs.org/) (phiên bản LTS)
- [Git](https://git-scm.com/)
- [Android Studio](https://developer.android.com/studio) (nếu cần build Android)
- Điện thoại Android hoặc iOS
- Ứng dụng Expo Go (nếu dự án tương thích)

### 2. Clone Repository

Mở Terminal hoặc PowerShell:

```bash
git clone https://github.com/vutoanquyen05/gym-workout
```

Di chuyển vào thư mục dự án:

```bash
cd gym-workout
```

### 3. Cài đặt Dependencies

```bash
npm install
```

### 4. Chạy ứng dụng

Khởi động Expo:

```bash
npx expo start
```

Nếu máy tính và điện thoại không thể kết nối trực tiếp qua mạng LAN:

```bash
npx expo start --tunnel
```

## Chạy trên điện thoại

### Cách 1: Sử dụng Expo Go

1. Cài đặt **Expo Go** trên điện thoại.
2. Kết nối điện thoại và máy tính cùng mạng Wi-Fi.
3. Chạy lệnh:

   ```bash
   npx expo start
   ```

4. Mở Expo Go và quét mã QR xuất hiện trong Terminal.
5. Chờ ứng dụng tải và khởi chạy.

**Lưu ý:** Expo Go chỉ hỗ trợ các thư viện native tương thích. Nếu dự án sử dụng native module riêng, cần dùng Development Build.

### Cách 2: Chạy trực tiếp trên Android qua USB

**Bước 1:** Bật Developer Options và USB Debugging trên điện thoại.

**Bước 2:** Kết nối điện thoại với máy tính bằng cáp USB và chấp nhận yêu cầu cấp quyền gỡ lỗi.

**Bước 3:** Kiểm tra kết nối:

```bash
adb devices
```

**Bước 4:** Build và chạy ứng dụng:

```bash
npx expo run:android --device
```

Lệnh sẽ build, cài đặt và khởi chạy ứng dụng trên thiết bị Android đã kết nối.

**Lưu ý:** Cần cấu hình Android SDK và môi trường build trước khi sử dụng.

### Cách 3: Cài đặt APK đã build

Nếu đã có file APK debug:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Sau khi cài đặt thành công, mở ứng dụng trên điện thoại.

> Bản APK debug có thể cần kết nối đến Metro Bundler để tải JavaScript.

## Xử lý lỗi thường gặp

**Không nhận thiết bị Android:**

```bash
adb devices
```

Kiểm tra USB Debugging, cáp USB và quyền kết nối trên điện thoại.

**Expo bị lỗi cache:**

```bash
npx expo start --clear
```

**Không kết nối được Expo Go:**

```bash
npx expo start --tunnel
```

**Lỗi `INSTALL_FAILED_USER_RESTRICTED`:**

Kiểm tra quyền cho phép cài đặt ứng dụng qua USB trong Developer Options và xác nhận yêu cầu cài đặt trên điện thoại.

## Tài liệu tham khảo

- [React Native](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)

---

**Project:** Gym & Workout App  
**Platform:** Android & iOS  
**Tech Stack:** React Native · Expo · TypeScript
