"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Danh mục sản phẩm", href: "/san-pham", category: "" },
  { label: "Laptop", href: "/san-pham/danh-muc/laptop", category: "laptop" },
  { label: "PC & Linh kiện", href: "/san-pham/danh-muc/pc-linh-kien", category: "pc-linh-kien" },
  { label: "Phụ kiện", href: "/san-pham/danh-muc/phu-kien", category: "phu-kien" },
  { label: "Màn hình", href: "/san-pham/danh-muc/man-hinh", category: "man-hinh" },
  { label: "Máy in", href: "/san-pham/danh-muc/may-in", category: "may-in" },
  { label: "Camera", href: "/san-pham/danh-muc/camera", category: "camera" },
  { label: "Thiết bị mạng", href: "/san-pham/danh-muc/thiet-bi-mang", category: "thiet-bi-mang" },
  { label: "Dịch vụ bảo trì doanh nghiệp", href: "/san-pham/danh-muc/dich-vu-bao-tri-doanh-nghiep", category: "dich-vu-bao-tri-doanh-nghiep" },
  { label: "Tin công nghệ", href: "/tin-tuc" },
  { label: "Liên hệ", href: "/lien-he" },
];

export function SiteMobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (item: (typeof navItems)[number]) => {
    if ("category" in item) {
      if (item.category === "") return pathname === "/san-pham";
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    }

    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <>
      <button
        type="button"
        className="mobileMenu"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X /> : <Menu />}
      </button>

      {open ? (
        <div className="mobileNavBackdrop" onClick={() => setOpen(false)}>
          <div className="mobileNavPanel" onClick={(event) => event.stopPropagation()}>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(item) ? "active" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
