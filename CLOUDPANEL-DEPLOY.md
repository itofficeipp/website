# Triển khai với CloudPanel + Docker + Cloudflare Tunnel

## 1. Chuẩn bị ứng dụng

Đưa thư mục dự án lên server, ví dụ:

```bash
cd /opt/tinhocdongdu
cp .env.example .env
nano .env
docker compose up -d --build
docker compose ps
```

Tạo mật khẩu và secret ngẫu nhiên:

```bash
openssl rand -base64 36
node -e "const b=require('bcryptjs'); console.log(b.hashSync(process.argv[1],12))" 'MAT_KHAU_MOI'
```

Trong production phải đặt `COOKIE_SECURE=true`.

## 2. CloudPanel

Tạo site `tinhocdongdu.com` kiểu **Reverse Proxy**, đích:

```text
http://127.0.0.1:3000
```

CloudPanel cần truyền các header:

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

Không mở cổng `3000` và `5432` trên firewall. Compose chỉ bind web vào loopback; PostgreSQL không publish port.

## 3. Cloudflare Tunnel

Public hostname:

```text
tinhocdongdu.com -> http://127.0.0.1:80
www.tinhocdongdu.com -> http://127.0.0.1:80
```

Luồng truy cập:

```text
Cloudflare -> cloudflared -> CloudPanel Nginx -> 127.0.0.1:3000 -> Next.js -> PostgreSQL
```

## 4. Kiểm tra

```bash
curl -I https://tinhocdongdu.com
curl https://tinhocdongdu.com/api/health
curl https://tinhocdongdu.com/sitemap.xml
docker compose logs --tail=100 app
```

Sau khi DNS hoạt động, thêm domain vào Google Search Console và gửi `https://tinhocdongdu.com/sitemap.xml`.
