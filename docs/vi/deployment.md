# Hướng dẫn tự triển khai (Self-Hosting & Deployment)

Tài liệu này hướng dẫn cách tự triển khai **Lingua Loop** trên máy chủ ảo (VM) cá nhân bằng **Docker Compose**, **PostgreSQL**, và **Nginx Proxy Manager**.

---

## 1. Yêu cầu hệ thống

Đảm bảo máy chủ (VM) đã cài đặt:

- **Docker** và **Docker Compose** V2 trở lên.
- **Nginx Proxy Manager** đang chạy trong Docker và chia sẻ external network `npm_network`.
- Một **domain name** trỏ về IP công khai của VM.

---

## 2. Cấu hình biến môi trường (`.env`)

Tạo file `.env` từ file ví dụ:

```bash
cp .env.example .env
```

Mở file `.env` và thiết lập:

| Biến môi trường        | Ý nghĩa                  | Cấu hình production khuyến nghị                                   |
| :--------------------- | :----------------------- | :---------------------------------------------------------------- |
| `GEMINI_API_KEYS`      | Google Gemini API keys   | Danh sách key phân cách bằng dấu phẩy.                            |
| `GEMINI_DEFAULT_MODEL` | Default Gemini model     | `gemini-3.1-flash-lite` để tối ưu chi phí và tốc độ.              |
| `DATABASE_URL`         | PostgreSQL URI           | `postgresql://postgres:YOUR_DB_PASSWORD@postgres:5432/lingualoop` |
| `BETTER_AUTH_SECRET`   | Better Auth secret       | Chuỗi random an toàn, ví dụ `openssl rand -hex 32`.               |
| `BETTER_AUTH_URL`      | Base URL của ứng dụng    | HTTPS URL production, ví dụ `https://lingualoop.yourdomain.com`.  |
| `PORT`                 | Cổng trong container     | `3000`.                                                           |
| `HOSTNAME`             | Hostname trong container | `0.0.0.0`.                                                        |

---

## 3. Cấu hình Docker Compose

Lingua Loop dùng PostgreSQL làm source of truth cho learning data như CorrectionSession, MemoryCandidate, MemoryItem, Live learning data, và Practice data. `localStorage` không được dùng để lưu learning data production.

File [compose.yml](../../compose.yml) định nghĩa service `web` và `postgres`:

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
    depends_on:
      - postgres
    networks:
      - npm_network
      - app_network

  postgres:
    image: postgres:16-alpine
    container_name: lingua-loop-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-lingualooppassword}
      POSTGRES_DB: ${POSTGRES_DB:-lingualoop}
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - app_network

volumes:
  pgdata:
    driver: local

networks:
  npm_network:
    external: true
  app_network:
    driver: bridge
```

---

## 4. Khởi chạy ứng dụng

Build và chạy services:

```bash
docker compose up --build -d
```

Apply database schema:

```bash
docker compose exec web npx drizzle-kit push
```

Kiểm tra trạng thái:

```bash
docker compose ps
```

Xem logs:

```bash
docker compose logs -f
```

---

## 5. Cấu hình Nginx Proxy Manager (NPM)

Truy cập Nginx Proxy Manager và thêm **Proxy Host** mới:

1. **Tab Details**:
   - **Domain Names**: domain của bạn, ví dụ `lingualoop.yourdomain.com`.
   - **Scheme**: `http`
   - **Forward Hostname / IP**: `lingua-loop-web`.
   - **Forward Port**: `3000`
   - Bật **Block Common Exploits** và **Websockets Support**.
2. **Tab SSL**:
   - **SSL Certificate**: chọn **Request a new SSL Certificate**.
   - Bật **Force SSL** và **HTTP/2 Support**.
   - Nhập email, đồng ý điều khoản Let's Encrypt, và bấm **Save**.

Ứng dụng sẽ chạy qua HTTPS tại `https://lingualoop.yourdomain.com` với PostgreSQL persistence.
