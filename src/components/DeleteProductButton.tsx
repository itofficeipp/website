"use client";

export function DeleteProductButton({
  action,
  productId,
  productName,
}: {
  action: (form: FormData) => void | Promise<void>;
  productId: number;
  productName: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`Xóa sản phẩm "${productName}"? Hành động này không thể hoàn tác.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={productId} />
      <button className="dangerButton" type="submit">Xóa</button>
    </form>
  );
}
