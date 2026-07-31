"use client";

import { useState } from "react";

export function ProductDescription({ description }: { description: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <p className={expanded ? "summary" : "summary descClamp"}>{description}</p>
      <button type="button" className="showMoreBtn" onClick={() => setExpanded((v) => !v)}>
        {expanded ? "Thu gọn" : "Xem thêm"}
      </button>
    </>
  );
}
