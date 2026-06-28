# Hướng dẫn tự triển khai (Self-Hosting & Deployment)

Tài liệu này hướng dẫn chi tiết cách tự triển khai (self-host) ứng dụng **Lingua Loop** trên máy chủ ảo (VM) cá nhân sử dụng **Docker Compose** và cấu hình định tuyến bảo mật đằng sau **Nginx Proxy Manager**.

---

## 1. Yêu cầu hệ thống

Đảm bảo máy chủ (VM) của bạn đã cài đặt sẵn các thành phần sau:

- **Docker** và **Docker Compose** (Phiên bản V2 trở lên).
- **Nginx Proxy Manager** (Đang chạy dưới dạng container trên cùng một máy chủ và chia sẻ chung mạng Docker tên là `npm_network`).
- Một **Tên miền (Domain Name)** được trỏ về địa chỉ IP công khai của máy chủ VM.

---

## 2. Cấu hình biến môi trường (`.env`)

Trước khi triển khai, hãy tạo file `.env` từ file ví dụ:

```bash
cp .env.example .env
```

Mở file `.env` và thiết lập các tham số:

| Biến môi trường        | Ý nghĩa                            | Cấu hình khuyến nghị cho Production                                                  |
| :--------------------- | :--------------------------------- | :----------------------------------------------------------------------------------- |
| `GEMINI_API_KEYS`      | Các API Key của Google Gemini      | Danh sách các key phân cách bằng dấu phẩy để hệ thống tự động xoay vòng khi gọi API. |
| `GEMINI_DEFAULT_MODEL` | Model mặc định                     | Khuyên dùng `gemini-3.1-flash-lite` để tối ưu chi phí và tốc độ phản hồi.            |
| `PORT`                 | Cổng hoạt động bên trong container | Mặc định là `3000`. Không cần thay đổi.                                              |
| `HOSTNAME`             | Hostname nội bộ container          | Thiết lập là `0.0.0.0` để cho phép Nginx Proxy Manager chuyển tiếp traffic tới.      |

---

## 3. Cấu hình Docker Compose

Lingua Loop hoạt động hoàn toàn ở phía Frontend Next.js và lưu trữ dữ liệu học tập thông qua `localStorage` của trình duyệt. Do đó, dự án **không** cần cấu hình các dịch vụ cơ sở dữ liệu phụ trợ như PostgreSQL hay Redis.

File `docker-compose.yml` sẽ định nghĩa duy nhất container `web` kết nối trực tiếp vào mạng chung `npm_network` của Nginx Proxy Manager:

```yaml
services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: lingua-loop-web
    restart: unless-stopped
    env_file:
      - .env
    networks:
      - npm_network

networks:
  npm_network:
    external: true
```

---

## 4. Khởi chạy ứng dụng

Để build Docker image và khởi động container ở chế độ chạy ngầm (detached mode):

```bash
docker compose up --build -d
```

Kiểm tra trạng thái hoạt động của container:

```bash
docker compose ps
```

Để xem log hệ thống nhằm phục vụ gỡ lỗi:

```bash
docker compose logs -f
```

---

## 5. Cấu hình trên Nginx Proxy Manager (NPM)

Truy cập trang quản trị Nginx Proxy Manager của bạn và thêm một **Proxy Host** mới:

1. **Tab Details**:
   - **Domain Names**: Điền tên miền của bạn (ví dụ: `lingualoop.yourdomain.com`).
   - **Scheme**: `http`
   - **Forward Hostname / IP**: Nhập tên service container là `lingua-loop-web` (khớp với `container_name` trong cấu hình Docker Compose).
   - **Forward Port**: `3000`
   - Bật **Block Common Exploits** và **Websockets Support** sang trạng thái **ON**.
2. **Tab SSL**:
   - **SSL Certificate**: Chọn **Request a new SSL Certificate** (Let's Encrypt).
   - Bật **Force SSL** và **HTTP/2 Support** sang trạng thái **ON**.
   - Điền email nhận thông báo, tích chọn đồng ý điều khoản dịch vụ Let's Encrypt và ấn **Save**.

Hệ thống của bạn hiện đã có thể truy cập an toàn qua giao thức HTTPS tại địa chỉ `https://lingualoop.yourdomain.com`.
