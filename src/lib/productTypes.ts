export type ProductTypeOption = {
  slug: string;
  label: string;
  keywords: string[];
};

export const productTypesByCategory: Record<string, ProductTypeOption[]> = {
  "laptop": [
    { slug: "laptop-van-phong", label: "Laptop văn phòng", keywords: ["van phong"] },
    { slug: "laptop-gaming", label: "Laptop gaming", keywords: ["gaming"] },
    { slug: "laptop-do-hoa", label: "Laptop đồ họa - kỹ thuật", keywords: ["do hoa", "workstation"] },
    { slug: "laptop-mong-nhe", label: "Laptop mỏng nhẹ", keywords: ["mong nhe", "ultrabook"] },
    { slug: "laptop-doanh-nghiep", label: "Laptop doanh nghiệp", keywords: ["doanh nghiep", "latitude", "thinkbook", "probook", "elitebook"] },
  ],
  "pc-linh-kien": [
    { slug: "cpu", label: "CPU - Vi xử lý", keywords: ["cpu", "vi xu ly", "core i3", "core i5", "core i7", "ryzen"] },
    { slug: "mainboard", label: "Mainboard - Bo mạch chủ", keywords: ["mainboard", "main ", "bo mach chu"] },
    { slug: "ram", label: "RAM", keywords: ["ram", "ddr4", "ddr5"] },
    { slug: "vga", label: "VGA - Card màn hình", keywords: ["vga", "card man hinh", "card do hoa", "rtx", "gtx"] },
    { slug: "ssd", label: "Ổ cứng SSD", keywords: ["ssd", "nvme"] },
    { slug: "hdd", label: "Ổ cứng HDD", keywords: ["hdd", "purple"] },
    { slug: "psu", label: "Nguồn máy tính (PSU)", keywords: ["nguon", "psu"] },
    { slug: "case", label: "Vỏ case", keywords: ["case", "vo may"] },
    { slug: "tan-nhiet", label: "Tản nhiệt", keywords: ["tan nhiet", "cooler"] },
    { slug: "ups", label: "Bộ lưu điện (UPS)", keywords: ["ups", "luu dien"] },
    { slug: "thiet-bi-van-phong", label: "Thiết bị văn phòng khác", keywords: ["cham cong"] },
  ],
  "phu-kien": [
    { slug: "chuot", label: "Chuột", keywords: ["chuot"] },
    { slug: "ban-phim", label: "Bàn phím", keywords: ["ban phim"] },
    { slug: "tai-nghe", label: "Tai nghe", keywords: ["tai nghe", "headset"] },
    { slug: "cap-chuyen-doi", label: "Cáp - Bộ chuyển đổi", keywords: ["cap ", "chuyen doi", "hdmi", "displayport"] },
    { slug: "phu-kien-khac", label: "Phụ kiện khác", keywords: ["gia treo", "balo", "the nho", "usb"] },
  ],
  "man-hinh": [
    { slug: "man-hinh-van-phong", label: "Màn hình văn phòng", keywords: ["fhd", "van phong"] },
    { slug: "man-hinh-gaming", label: "Màn hình gaming", keywords: ["gaming", "144hz", "165hz"] },
    { slug: "man-hinh-cong", label: "Màn hình cong / UltraWide", keywords: ["cong", "ultrawide"] },
  ],
  "may-in": [
    { slug: "may-in-laser", label: "Máy in Laser", keywords: ["laser"] },
    { slug: "may-in-phun", label: "Máy in phun", keywords: ["phun", "inkjet"] },
    { slug: "may-in-da-nang", label: "Máy in đa năng", keywords: ["da nang", "scan"] },
    { slug: "muc-in", label: "Mực - Hộp mực", keywords: ["muc in", "toner", "cartridge"] },
  ],
  "camera": [
    { slug: "camera-ip-trong-nha", label: "Camera IP trong nhà", keywords: ["trong nha"] },
    { slug: "camera-ip-ngoai-troi", label: "Camera IP ngoài trời", keywords: ["ngoai troi"] },
    { slug: "camera-hdtvi", label: "Camera HDTVI", keywords: ["hdtvi"] },
    { slug: "dau-ghi-hinh", label: "Đầu ghi hình (NVR/DVR/XVR)", keywords: ["dau ghi", "nvr", "dvr", "xvr"] },
  ],
  "thiet-bi-mang": [
    { slug: "router", label: "Router", keywords: ["router"] },
    { slug: "switch", label: "Switch mạng", keywords: ["switch"] },
    { slug: "access-point", label: "Access Point - Bộ phát WiFi", keywords: ["access point", "bo phat wifi", "bo phat song"] },
    { slug: "modem", label: "Modem", keywords: ["modem"] },
    { slug: "thiet-bi-mang-doanh-nghiep", label: "Thiết bị mạng doanh nghiệp", keywords: ["doanh nghiep"] },
  ],
  "dich-vu-bao-tri-doanh-nghiep": [
    { slug: "bao-tri-dinh-ky", label: "Bảo trì định kỳ", keywords: ["dinh ky"] },
    { slug: "sua-chua", label: "Sửa chữa - Khắc phục sự cố", keywords: ["sua chua", "khac phuc"] },
    { slug: "trien-khai-mang", label: "Triển khai hệ thống mạng", keywords: ["trien khai", "lap dat mang"] },
    { slug: "cho-thue-thiet-bi", label: "Cho thuê thiết bị", keywords: ["cho thue"] },
    { slug: "hop-dong-it", label: "Hợp đồng IT trọn gói", keywords: ["hop dong", "tron goi"] },
  ],
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getProductTypeOptions(categorySlug: string): ProductTypeOption[] {
  return productTypesByCategory[categorySlug] || [];
}

export function inferProductType(categorySlug: string, freeText: string): ProductTypeOption | null {
  const options = productTypesByCategory[categorySlug];
  if (!options || !freeText) return null;
  const normalized = normalize(freeText);
  return (
    options.find((opt) => opt.keywords.some((k) => normalized.includes(normalize(k)))) || null
  );
}
