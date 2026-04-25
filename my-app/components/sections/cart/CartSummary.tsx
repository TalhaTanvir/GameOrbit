import { useState } from "react";

type CartSummaryProps = {
  subtotal: string;
  shipping: string;
  discount: string;
  total: string;
  onApplyDiscount: (code: string) => void;
  onCheckout: () => void;
};

export default function CartSummary({
  subtotal,
  shipping,
  discount,
  total,
  onApplyDiscount,
  onCheckout,
}: CartSummaryProps) {
  const [code, setCode] = useState("");

  return (
    <aside className="rounded-md border border-border bg-card p-5 sm:p-6">
      <h2 className="mb-4 text-2xl font-semibold">Order Review</h2>

      <div className="mb-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Code</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Discount code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="h-11 flex-1 rounded-sm border border-border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={() => onApplyDiscount(code)}
            className="h-11 rounded-sm border border-border bg-background px-4 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="space-y-3 border-b border-border pb-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">{subtotal}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-semibold">{shipping}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Discount</span>
          <span className="font-semibold">{discount}</span>
        </div>
      </div>

      <div className="mb-5 mt-4 flex items-center justify-between">
        <span className="text-base font-semibold">Total</span>
        <span className="text-xl font-bold">{total}</span>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        className="h-12 w-full rounded-sm bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        Checkout
      </button>
    </aside>
  );
}
