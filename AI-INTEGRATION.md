# Kết nối AI với Tin Học Đông Du

AI sử dụng HTTP API và Bearer token. AI không được tự xuất bản:

- Bài viết vào **Quản trị → Bài nháp**.
- Sản phẩm vào **Quản trị → Sản phẩm** với trạng thái **Đang ẩn**.

## 1. Tạo API key mới

Trên server:

```bash
openssl rand -hex 48
nano /opt/tinhocdongdu-next/.env
```

Đặt kết quả vào:

```env
AI_API_KEY=CHUOI_NGAU_NHIEN_MOI
```

Áp dụng:

```bash
cd /opt/tinhocdongdu-next
docker compose up -d --force-recreate app
```

Không đưa API key vào prompt, bài viết, log công khai hoặc ảnh chụp màn hình.

## 2. API tạo bài nháp

```http
POST https://tinhocdongdu.com/api/ai/posts
Authorization: Bearer YOUR_AI_API_KEY
Content-Type: application/json
```

JSON:

```json
{
  "title": "Hướng dẫn chọn laptop văn phòng năm 2026",
  "slug": "huong-dan-chon-laptop-van-phong-2026",
  "category": "Tư vấn",
  "excerpt": "Các tiêu chí chọn laptop phù hợp cho công việc văn phòng.",
  "content": "Nội dung bài viết tối thiểu một trăm ký tự...",
  "image_url": "https://example.com/images/laptop.jpg"
}
```

Kết quả `201`:

```json
{
  "id": 10,
  "slug": "huong-dan-chon-laptop-van-phong-2026",
  "status": "draft"
}
```

## 3. API tạo sản phẩm ẩn

```http
POST https://tinhocdongdu.com/api/ai/products
Authorization: Bearer YOUR_AI_API_KEY
Content-Type: application/json
```

JSON:

```json
{
  "name": "Laptop ASUS Vivobook 15",
  "slug": "laptop-asus-vivobook-15",
  "category": "Laptop",
  "brand": "ASUS",
  "summary": "Core i5, RAM 16GB, SSD 512GB, màn hình 15.6 inch",
  "description": "Mô tả chi tiết sản phẩm tối thiểu ba mươi ký tự.",
  "specifications": {
    "CPU": "Intel Core i5",
    "RAM": "16GB",
    "Lưu trữ": "512GB SSD",
    "Màn hình": "15.6 inch Full HD"
  },
  "price": 15990000,
  "old_price": 16990000,
  "image_url": "https://example.com/images/asus-vivobook.jpg",
  "badge": "Mới",
  "stock": 5
}
```

Kết quả `201`:

```json
{
  "id": 20,
  "slug": "laptop-asus-vivobook-15",
  "published": false,
  "status": "hidden"
}
```

## 4. Cấu hình n8n

Thêm node **HTTP Request** sau node AI:

```text
Method: POST
URL bài viết: https://tinhocdongdu.com/api/ai/posts
URL sản phẩm: https://tinhocdongdu.com/api/ai/products
Authentication: None
Send Headers: On
Header: Authorization
Value: Bearer YOUR_AI_API_KEY
Send Body: On
Body Content Type: JSON
```

Nên lưu key trong Credentials hoặc biến môi trường của n8n, không nhập trực tiếp vào prompt AI.

Luồng đề nghị:

```text
Schedule/Webhook
→ lấy dữ liệu nguồn
→ AI tạo JSON theo schema
→ kiểm tra JSON
→ HTTP Request tới website
→ thông báo quản trị viên duyệt
```

## 5. Kiểm tra bằng curl

Bài viết:

```bash
curl -X POST https://tinhocdongdu.com/api/ai/posts \
  -H "Authorization: Bearer YOUR_AI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Bài kiểm thử kết nối AI đủ dài","category":"Tin công nghệ","excerpt":"Mô tả kiểm thử kết nối AI với website.","content":"Nội dung kiểm thử dài hơn một trăm ký tự để hệ thống chấp nhận và lưu vào khu vực bài nháp chờ quản trị viên duyệt trước khi xuất bản."}'
```

Sản phẩm:

```bash
curl -X POST https://tinhocdongdu.com/api/ai/products \
  -H "Authorization: Bearer YOUR_AI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop kiểm thử AI","category":"Laptop","brand":"TEST","summary":"Sản phẩm dùng kiểm thử kết nối AI","description":"Mô tả sản phẩm kiểm thử đủ dài để hệ thống kiểm tra và chấp nhận dữ liệu.","price":1000000,"image_url":"https://images.unsplash.com/photo-1603302576837-37561b2e2302","stock":1,"specifications":{"RAM":"16GB"}}'
```
