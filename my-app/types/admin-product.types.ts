import type { ProductCategory } from "@/types/product.types";

export type AdminProductStatus = "active" | "inactive";

export type AdminProduct = {
  id: number;
  name: string;
  image: string;
  price: number;
  description: string;
  status: AdminProductStatus;
  category: ProductCategory;
  platform: "PS5";
};

export type AdminProductStats = {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  averagePrice: number;
};
