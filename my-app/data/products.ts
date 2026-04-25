import type { Product, ProductFilterCategory } from "@/types/product.types";

export const PRODUCT_IMAGE = "/images/PS5-cd.jpg";

export const GAME_CATEGORIES: ProductFilterCategory[] = ["All Games", "New Arrival", "Adventure", "Sports"];

export const PRODUCTS: Product[] = [
  { id: "ps5-1", title: "Lords of the Fallen", price: "$49.99", image: PRODUCT_IMAGE, platform: "PS5", category: "New Arrival" },
  { id: "ps5-2", title: "Spider-Man 2", price: "$59.99", image: PRODUCT_IMAGE, platform: "PS5", category: "Adventure" },
  { id: "ps5-3", title: "EA FC 25", price: "$39.99", image: PRODUCT_IMAGE, platform: "PS5", category: "Sports" },
  { id: "ps5-4", title: "God of War Ragnarok", price: "$54.99", image: PRODUCT_IMAGE, platform: "PS5", category: "Adventure" },
  { id: "ps5-5", title: "NBA 2K25", price: "$44.99", image: PRODUCT_IMAGE, platform: "PS5", category: "Sports" },
  { id: "ps5-6", title: "Final Fantasy XVI", price: "$52.99", image: PRODUCT_IMAGE, platform: "PS5", category: "New Arrival" },
  { id: "ps5-7", title: "Assassin's Creed Mirage", price: "$37.99", image: PRODUCT_IMAGE, platform: "PS5", category: "Adventure" },
  { id: "ps5-8", title: "F1 25", price: "$46.99", image: PRODUCT_IMAGE, platform: "PS5", category: "Sports" },
  { id: "ps5-9", title: "Horizon Forbidden West", price: "$41.99", image: PRODUCT_IMAGE, platform: "PS5", category: "Adventure" },
  { id: "ps5-10", title: "Tekken 8", price: "$48.99", image: PRODUCT_IMAGE, platform: "PS5", category: "New Arrival" },
  { id: "ps5-11", title: "Gran Turismo 7", price: "$35.99", image: PRODUCT_IMAGE, platform: "PS5", category: "Sports" },
  { id: "ps5-12", title: "The Last of Us Part I", price: "$53.99", image: PRODUCT_IMAGE, platform: "PS5", category: "Adventure" },
];
