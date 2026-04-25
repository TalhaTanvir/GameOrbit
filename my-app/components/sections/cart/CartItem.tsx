import Image from "next/image";
import { FaMinus, FaPlus } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import type { CartItemId } from "@/store/CartStore";

type CartItemProps = {
  id: CartItemId;
  name: string;
  details?: string;
  quantity: number;
  image?: string;
  formattedTotal: string;
  priority?: boolean;
  onIncrease: (id: CartItemId) => void;
  onDecrease: (id: CartItemId) => void;
  onRemove: (id: CartItemId) => void;
};

export default function CartItem({
  id,
  name,
  details,
  quantity,
  image,
  formattedTotal,
  priority = false,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) {
  return (
    <article className="grid gap-4 border-b border-border pb-5 last:border-b-0 last:pb-0 sm:grid-cols-[1fr_auto_auto]">
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24 overflow-hidden rounded-sm border border-border bg-muted/40">
          <Image
            src={image || "/images/PS5-cd.jpg"}
            alt={name}
            fill
            sizes="96px"
            className="object-cover"
            priority={priority}
          />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-medium leading-tight">{name}</h3>
          {details ? <p className="text-sm text-muted-foreground">{details}</p> : null}
        </div>
      </div>

      <div className="flex items-center gap-2 self-center rounded-sm border-2 border-foreground/35 bg-muted/30 p-1">
        <button
          type="button"
          aria-label={`Decrease quantity for ${name}`}
          className="rounded-sm p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          onClick={() => onDecrease(id)}
        >
          <FaMinus className="size-4" />
        </button>
        <span className="min-w-7 text-center text-sm font-semibold">{quantity}</span>
        <button
          type="button"
          aria-label={`Increase quantity for ${name}`}
          className="rounded-sm p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          onClick={() => onIncrease(id)}
        >
          <FaPlus className="size-4" />
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 self-center sm:justify-end">
        <button
          type="button"
          aria-label={`Remove ${name} from cart`}
          className="rounded-sm p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
          onClick={() => onRemove(id)}
        >
          <IoClose className="size-5" />
        </button>
        <p className="min-w-24 text-right text-2xl font-semibold">{formattedTotal}</p>
      </div>
    </article>
  );
}
