import { PRODUCT_IMAGE } from "@/data/products";
import type { AdminProduct, AdminProductStats } from "@/types/admin-product.types";

export const ADMIN_PRODUCTS: AdminProduct[] = [
  {
    id: 1,
    name: "Lords of the Fallen",
    image: PRODUCT_IMAGE,
    price: 49.99,
    description: "Dark fantasy action RPG with challenging combat and rich world-building.",
    status: "active",
    category: "New Arrival",
    platform: "PS5",
  },
  {
    id: 2,
    name: "Spider-Man 2",
    image: PRODUCT_IMAGE,
    price: 59.99,
    description: "Fast-paced open-world superhero adventure built for PS5 performance.",
    status: "active",
    category: "Adventure",
    platform: "PS5",
  },
  {
    id: 3,
    name: "EA FC 25",
    image: PRODUCT_IMAGE,
    price: 39.99,
    description: "Competitive football title with updated squads and smooth online gameplay.",
    status: "inactive",
    category: "Sports",
    platform: "PS5",
  },
  {
    id: 4,
    name: "God of War Ragnarok",
    image: PRODUCT_IMAGE,
    price: 54.99,
    description: "Story-driven action adventure with cinematic combat and exploration.",
    status: "active",
    category: "Adventure",
    platform: "PS5",
  },
  {
    id: 5,
    name: "NBA 2K25",
    image: PRODUCT_IMAGE,
    price: 44.99,
    description: "Basketball simulation featuring improved controls and franchise depth.",
    status: "inactive",
    category: "Sports",
    platform: "PS5",
  },
];

export function getAdminProductStats(products: AdminProduct[]): AdminProductStats {
  const totalProducts = products.length;
  const activeProducts = products.filter((product) => product.status === "active").length;
  const inactiveProducts = totalProducts - activeProducts;
  const totalPrice = products.reduce((sum, product) => sum + product.price, 0);
  const averagePrice = totalProducts > 0 ? totalPrice / totalProducts : 0;

  return {
    totalProducts,
    activeProducts,
    inactiveProducts,
    averagePrice,
  };
}

export function formatProductPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
