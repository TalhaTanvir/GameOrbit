"use client";

import Link from "next/link";
import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { useShallow } from "zustand/react/shallow";

import { useCartStore } from "@/store/CartStore";

import CartItem from "./CartItem";
import CartSummary from "./CartSummary";

const priceFormatter = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

const formatPrice = (value: number) => priceFormatter.format(value);

const VALID_DISCOUNT_CODES = new Map<string, number>([
  ["SAVE10", 0.1],
  ["SAVE20", 0.2],
]);

export default function Cart() {
  const {
    items,
    subtotal,
    hasHydrated,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCartStore(
    useShallow((state) => ({
      items: state.items,
      subtotal: state.subtotal,
      hasHydrated: state.hasHydrated,
      increaseQuantity: state.increaseQuantity,
      decreaseQuantity: state.decreaseQuantity,
      removeFromCart: state.removeFromCart,
      clearCart: state.clearCart,
    })),
  );

  const [discount, setDiscount] = useState(0);
  const [cartMessage, setCartMessage] = useState("");
  const shipping = 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const handleApplyDiscount = (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();

    if (!code) {
      setDiscount(0);
      setCartMessage("Enter a code to apply a discount.");
      return;
    }

    const percent = VALID_DISCOUNT_CODES.get(code);
    if (!percent) {
      setDiscount(0);
      setCartMessage("Invalid discount code.");
      return;
    }

    const discountedAmount = Math.floor(subtotal * percent);
    setDiscount(discountedAmount);
    setCartMessage(`${code} applied successfully.`);
  };

  const handleCheckout = () => {
    if (!items.length) {
      setCartMessage("Your cart is empty.");
      return;
    }

    clearCart();
    setDiscount(0);
    setCartMessage("Checkout complete. Your cart is now empty.");
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your cart</h1>
        <Link
          href="/"
          prefetch
          aria-label="Close cart and return to homepage"
          className="rounded-sm border border-border p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <IoClose className="size-6" />
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="rounded-md border border-border bg-card p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Your Product</h2>
            <div className="hidden w-[44%] justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:flex">
              <span>Quantity</span>
              <span>Total</span>
            </div>
          </div>

          <div className="space-y-5">
            {!hasHydrated ? (
              <p className="text-sm text-muted-foreground">Loading cart...</p>
            ) : items.length ? (
              items.map((item, index) => (
                <CartItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  details={item.details}
                  quantity={item.quantity}
                  image={item.image}
                  formattedTotal={formatPrice(item.price * item.quantity)}
                  priority={index === 0}
                  onIncrease={increaseQuantity}
                  onDecrease={decreaseQuantity}
                  onRemove={removeFromCart}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            )}
          </div>

          <Link
            href="/shop"
            className="mt-6 inline-block text-sm font-medium underline underline-offset-4 transition hover:text-foreground/70"
          >
            Continue Shopping
          </Link>
        </div>

        <CartSummary
          subtotal={formatPrice(subtotal)}
          shipping={formatPrice(shipping)}
          discount={formatPrice(discount)}
          total={formatPrice(total)}
          onApplyDiscount={handleApplyDiscount}
          onCheckout={handleCheckout}
        />
      </div>

      {cartMessage ? (
        <p className="mt-4 text-sm text-muted-foreground" role="status" aria-live="polite">
          {cartMessage}
        </p>
      ) : null}
    </section>
  );
}
