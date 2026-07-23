create table if not exists products (
  id serial primary key,
  slug varchar(180) unique not null,
  name varchar(220) not null,
  category varchar(100) not null,
  brand varchar(100) not null,
  summary text not null,
  description text not null,
  specifications jsonb not null default '{}',
  price bigint not null check (price >= 0),
  old_price bigint check (old_price is null or old_price >= price),
  image_url text not null,
  badge varchar(50),
  stock integer not null default 0 check (stock >= 0),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists posts (
  id serial primary key,
  slug varchar(200) unique not null,
  title varchar(250) not null,
  category varchar(100) not null default 'Tin công nghệ',
  excerpt text not null,
  content text not null,
  image_url text,
  status varchar(20) not null default 'draft' check (status in ('draft','published')),
  author varchar(100) not null default 'Quản trị viên',
  source varchar(20) not null default 'manual' check (source in ('manual','ai')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_credentials (
  username varchar(100) primary key,
  password_hash text not null,
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id bigserial primary key,
  order_code varchar(30) unique not null,
  customer_name varchar(150) not null,
  email varchar(200),
  phone varchar(30) not null,
  province varchar(100) not null,
  address text not null,
  note text,
  payment_method varchar(30) not null default 'bank_transfer',
  status varchar(30) not null default 'pending'
    check (status in ('pending','confirmed','paid','shipping','completed','cancelled')),
  total_amount bigint not null check (total_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id bigserial primary key,
  order_id bigint not null references orders(id) on delete cascade,
  product_id integer references products(id) on delete set null,
  product_name varchar(220) not null,
  product_slug varchar(180) not null,
  image_url text not null,
  unit_price bigint not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total bigint not null check (line_total >= 0)
);
create index if not exists orders_created_idx on orders(created_at desc);
create index if not exists order_items_order_idx on order_items(order_id);
create index if not exists products_published_idx on products(published, updated_at desc);
create index if not exists posts_status_idx on posts(status, published_at desc);

insert into products (slug,name,category,brand,summary,description,specifications,price,old_price,image_url,badge,stock,published) values
('laptop-gaming-asus-tuf-a15-2025','Laptop Gaming ASUS TUF A15 2025','Laptop','ASUS','Ryzen 7 • RTX 4060 • 16GB • 512GB','Laptop gaming bền bỉ, hiệu năng cao cho game và công việc đồ họa. Máy được bảo hành chính hãng và hỗ trợ cài đặt tại Tin Học Đông Du.','{"CPU":"AMD Ryzen 7","GPU":"NVIDIA GeForce RTX 4060","RAM":"16GB DDR5","Lưu trữ":"512GB NVMe SSD","Màn hình":"15.6 inch 144Hz"}',24990000,28990000,'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1000&q=85','Bán chạy',8,true),
('macbook-air-13-m4','MacBook Air 13 M4','Laptop','APPLE','M4 10-core • 16GB • 256GB • Midnight','MacBook Air mỏng nhẹ với chip Apple M4, phù hợp cho công việc văn phòng, sáng tạo nội dung và di chuyển thường xuyên.','{"Chip":"Apple M4 10-core","RAM":"16GB","Lưu trữ":"256GB SSD","Màn hình":"Liquid Retina 13.6 inch","Màu":"Midnight"}',26990000,28990000,'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=85','Mới',6,true),
('man-hinh-lg-ultragear-27','Màn hình LG UltraGear 27 inch','Màn hình','LG','2K • IPS • 180Hz • 1ms • HDR10','Màn hình gaming độ phân giải 2K, tần số quét cao và tấm nền IPS cho hình ảnh sắc nét, màu sắc ổn định.','{"Kích thước":"27 inch","Độ phân giải":"2560 x 1440","Tấm nền":"IPS","Tần số quét":"180Hz","Thời gian đáp ứng":"1ms"}',6490000,7990000,'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=85','Giảm 19%',12,true),
('pc-gaming-dong-du-x-elite','PC Gaming Đông Du X Elite','PC & Linh kiện','ĐÔNG DU','Core i7 • RTX 4070 Super • 32GB • 1TB','Bộ PC gaming lắp ráp, kiểm tra ổn định và tối ưu luồng gió trước khi giao đến khách hàng.','{"CPU":"Intel Core i7","GPU":"RTX 4070 Super 12GB","RAM":"32GB DDR5","Lưu trữ":"1TB NVMe SSD","Nguồn":"750W 80 Plus Gold"}',38990000,42990000,'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1000&q=85','Độc quyền',4,true),
('ban-phim-co-logitech-g-pro','Bàn phím cơ không dây Logitech G Pro','Phụ kiện','LOGITECH','Hot-swap • RGB • Bluetooth • 2.4GHz','Bàn phím cơ nhỏ gọn cho góc máy hiện đại, hỗ trợ nhiều chế độ kết nối và tùy chỉnh switch.','{"Kết nối":"Bluetooth, 2.4GHz, USB-C","Đèn":"RGB","Switch":"Hot-swap","Layout":"TKL"}',2790000,3290000,'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=85','Giá tốt',15,true),
('tai-nghe-sony-wh-1000xm5','Tai nghe chống ồn Sony WH-1000XM5','Phụ kiện','SONY','ANC • Hi-Res • Pin 30 giờ • Bluetooth','Tai nghe chống ồn chủ động cao cấp, âm thanh chi tiết và thời lượng pin phù hợp cho làm việc, di chuyển.','{"Chống ồn":"Active Noise Cancelling","Pin":"Tối đa 30 giờ","Kết nối":"Bluetooth 5.2","Chuẩn âm thanh":"Hi-Res Audio"}',7490000,8990000,'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85','Giảm 17%',10,true),
('galaxy-s25-ultra-5g','Samsung Galaxy S25 Ultra 5G','Điện thoại','SAMSUNG','12GB • 256GB • Titanium Gray','Điện thoại cao cấp với màn hình lớn, hiệu năng mạnh và hệ thống camera linh hoạt.','{"RAM":"12GB","Lưu trữ":"256GB","Màu":"Titanium Gray","Kết nối":"5G"}',28990000,33990000,'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=85','Quà tặng',7,true),
('card-do-hoa-rtx-4070-super','Card đồ họa RTX 4070 Super','PC & Linh kiện','NVIDIA','12GB GDDR6X • Ray Tracing • DLSS','Card đồ họa hiệu năng cao cho gaming 2K, dựng hình và các ứng dụng tăng tốc GPU.','{"Bộ nhớ":"12GB GDDR6X","Công nghệ":"Ray Tracing, DLSS","Nguồn đề nghị":"650W"}',17990000,19490000,'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=1000&q=85','Freeship',5,true)
on conflict (slug) do nothing;

insert into posts (slug,title,category,excerpt,content,image_url,status,author,source,published_at) values
('5-tieu-chi-chon-laptop-van-phong','5 tiêu chí chọn laptop văn phòng phù hợp','Tư vấn','Các yếu tố quan trọng về hiệu năng, màn hình và thời lượng pin khi chọn laptop làm việc.','Laptop văn phòng cần cân bằng giữa hiệu năng, độ bền, thời lượng pin và khả năng di chuyển.

Hãy xác định phần mềm sử dụng hằng ngày trước khi chọn CPU và dung lượng RAM. Với nhu cầu văn phòng phổ thông, 16GB RAM và ổ SSD 512GB là mức phù hợp để sử dụng lâu dài.

Màn hình nên có độ sáng tốt, độ phân giải Full HD trở lên và kích thước phù hợp với tần suất di chuyển. Cuối cùng, hãy ưu tiên sản phẩm có chính sách bảo hành rõ ràng.','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=85','published','Tin Học Đông Du','manual',now()),
('huong-dan-xay-dung-pc-gaming','Hướng dẫn xây dựng PC gaming tối ưu ngân sách','Kinh nghiệm','Cách phân bổ ngân sách cho CPU, card đồ họa và nguồn để đạt hiệu năng chơi game tốt.','Một bộ PC gaming cân bằng nên dành phần lớn ngân sách cho card đồ họa, sau đó là CPU, bộ nguồn và màn hình.

Không nên tiết kiệm quá mức ở bộ nguồn vì đây là thành phần ảnh hưởng trực tiếp đến độ ổn định và tuổi thọ của toàn hệ thống. Tin Học Đông Du có thể tư vấn cấu hình theo game, phần mềm và ngân sách thực tế.','https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1200&q=85','published','Tin Học Đông Du','manual',now())
on conflict (slug) do nothing;
