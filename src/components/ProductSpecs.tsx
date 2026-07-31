"use client";

import { useState } from "react";

export function ProductSpecs({ specifications }: { specifications: Record<string, string> }) {
  const [expanded, setExpanded] = useState(false);
  const entries = Object.entries(specifications || {});
  const visibleEntries = expanded ? entries : entries.slice(0, 8);
  const hasMore = entries.length > 8;

  return (
    <>
      <table className="specs">
        <tbody>
          {visibleEntries.map(([key, value]) => (
            <tr key={key}>
              <td>{key}</td>
              <td className="specValue">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasMore && (
        <button type="button" className="showMoreBtn" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Thu gọn thông số kỹ thuật" : "Xem thêm thông số kỹ thuật"}
        </button>
      )}
    </>
  );
}
