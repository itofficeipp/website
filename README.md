# Tin Học Đông Du

Website thương mại công nghệ chạy Next.js 16, PostgreSQL và Docker.

## Chạy thử

```bash
cp .env.example .env
docker compose up -d --build
```

Mở `http://127.0.0.1:3000`. Trang quản trị ở `/admin`.

Tài khoản thử trong `.env` hiện tại:

- User: `admin`
- Password: `DongDu@2026`

Phải đổi toàn bộ secret trong `.env` trước khi đưa lên server.

## CloudPanel

1. Tạo site `tinhocdongdu.com` dạng Reverse Proxy.
2. Proxy đến `http://127.0.0.1:3000`.
3. Cloudflare Tunnel trỏ về `http://127.0.0.1:80` để request đi qua CloudPanel.
4. Đặt `COOKIE_SECURE=true` trên server.
5. Không mở cổng PostgreSQL ra Internet.

## API dành cho AI

AI chỉ có quyền tạo bản nháp:

```bash
curl -X POST https://tinhocdongdu.com/api/ai/posts \
  -H "Authorization: Bearer YOUR_AI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Tiêu đề bài viết đủ dài","excerpt":"Mô tả bài viết tối thiểu hai mươi ký tự","content":"Nội dung bài viết tối thiểu một trăm ký tự...","category":"Tin công nghệ"}'
```

Quản trị viên phải vào `/admin` và nhấn `Duyệt đăng`. API không cho AI tự xuất bản.

## Sao lưu

```bash
docker exec tinhocdongdu-db pg_dump -U dongdu tinhocdongdu > tinhocdongdu-backup.sql
```
