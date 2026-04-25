export type ProductCategory = "New Arrival" | "Adventure" | "Sports";

export type ProductFilterCategory = "All Games" | ProductCategory;

export type Product = {
  id: string;
  title: string;
  price: string;
  image: string;
  platform: "PS5";
  category: ProductCategory;
};
