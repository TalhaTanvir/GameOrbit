import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { ADMIN_PRODUCTS } from "@/data/admin-products";
import type { AdminProduct, AdminProductStatus } from "@/types/admin-product.types";
import type { ProductCategory } from "@/types/product.types";

export type StoredProduct = AdminProduct & {
  createdAt: string;
  updatedAt: string;
};

export type StoredHeroImage = {
  id: string;
  imageUrl: string;
  title: string;
  altText: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

type AppDatabase = {
  products: StoredProduct[];
  heroImages: StoredHeroImage[];
};

type ProductMutationInput = {
  name: string;
  image: string;
  price: number;
  description: string;
  status: AdminProductStatus;
  category: ProductCategory;
};

type HeroMutationInput = {
  imageUrl: string;
  title: string;
  altText: string;
  isActive: boolean;
  displayOrder: number;
};

const MAX_HERO_IMAGES = 2;
const DATABASE_FILE_PATH = path.join(process.cwd(), "data", "app-db.json");

let databaseCache: AppDatabase | null = null;
let initPromise: Promise<void> | null = null;

function cloneDatabase(database: AppDatabase): AppDatabase {
  return {
    products: database.products.map((product) => ({ ...product })),
    heroImages: database.heroImages.map((heroImage) => ({ ...heroImage })),
  };
}

function createInitialDatabase(): AppDatabase {
  const timestamp = new Date().toISOString();

  return {
    products: ADMIN_PRODUCTS.map((product) => ({
      ...product,
      createdAt: timestamp,
      updatedAt: timestamp,
    })),
    heroImages: [
      {
        id: randomUUID(),
        imageUrl: "/images/hero.png",
        title: "GameOrbit Main Hero",
        altText: "GameOrbit homepage hero banner",
        isActive: true,
        displayOrder: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ],
  };
}

async function ensureDatabaseInitialized() {
  if (databaseCache) {
    return;
  }

  if (!initPromise) {
    initPromise = (async () => {
      try {
        const fileContents = await fs.readFile(DATABASE_FILE_PATH, "utf8");
        const parsed = JSON.parse(fileContents) as AppDatabase;

        if (Array.isArray(parsed.products) && Array.isArray(parsed.heroImages)) {
          databaseCache = parsed;
          return;
        }
      } catch {
        // Seed file will be created below.
      }

      const initialData = createInitialDatabase();
      databaseCache = initialData;
      await fs.mkdir(path.dirname(DATABASE_FILE_PATH), { recursive: true });
      await fs.writeFile(DATABASE_FILE_PATH, JSON.stringify(initialData, null, 2), "utf8");
    })();
  }

  await initPromise;
}

async function readDatabase() {
  await ensureDatabaseInitialized();
  return cloneDatabase(databaseCache as AppDatabase);
}

async function writeDatabase(nextDatabase: AppDatabase) {
  databaseCache = cloneDatabase(nextDatabase);
  await fs.mkdir(path.dirname(DATABASE_FILE_PATH), { recursive: true });
  await fs.writeFile(DATABASE_FILE_PATH, JSON.stringify(databaseCache, null, 2), "utf8");
}

function sortProducts(products: StoredProduct[]) {
  return [...products].sort((left, right) => right.id - left.id);
}

function sortHeroImages(heroImages: StoredHeroImage[]) {
  return [...heroImages].sort((left, right) => left.displayOrder - right.displayOrder);
}

export async function listAllProducts() {
  const database = await readDatabase();
  return sortProducts(database.products);
}

export async function listActiveProducts() {
  const products = await listAllProducts();
  return products.filter((product) => product.status === "active");
}

export async function getProductById(id: number) {
  const database = await readDatabase();
  return database.products.find((product) => product.id === id) ?? null;
}

export async function createProduct(input: ProductMutationInput) {
  const database = await readDatabase();
  const maxProductId = database.products.reduce((max, product) => Math.max(max, product.id), 0);
  const timestamp = new Date().toISOString();

  const nextProduct: StoredProduct = {
    id: maxProductId + 1,
    name: input.name,
    image: input.image,
    price: input.price,
    description: input.description,
    status: input.status,
    category: input.category,
    platform: "PS5",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  database.products.unshift(nextProduct);
  await writeDatabase(database);
  return nextProduct;
}

export async function updateProduct(id: number, input: ProductMutationInput) {
  const database = await readDatabase();
  const productIndex = database.products.findIndex((product) => product.id === id);

  if (productIndex < 0) {
    return null;
  }

  const existingProduct = database.products[productIndex];
  const nextProduct: StoredProduct = {
    ...existingProduct,
    name: input.name,
    image: input.image,
    price: input.price,
    description: input.description,
    status: input.status,
    category: input.category,
    updatedAt: new Date().toISOString(),
  };

  database.products[productIndex] = nextProduct;
  await writeDatabase(database);
  return nextProduct;
}

export async function deleteProduct(id: number) {
  const database = await readDatabase();
  const nextProducts = database.products.filter((product) => product.id !== id);

  if (nextProducts.length === database.products.length) {
    return false;
  }

  database.products = nextProducts;
  await writeDatabase(database);
  return true;
}

export async function listHeroImages() {
  const database = await readDatabase();
  return sortHeroImages(database.heroImages);
}

export async function listActiveHeroImages() {
  const heroImages = await listHeroImages();
  return heroImages.filter((heroImage) => heroImage.isActive);
}

export async function getHeroImageById(id: string) {
  const database = await readDatabase();
  return database.heroImages.find((heroImage) => heroImage.id === id) ?? null;
}

export async function createHeroImage(input: HeroMutationInput) {
  const database = await readDatabase();

  if (database.heroImages.length >= MAX_HERO_IMAGES) {
    throw new Error(`Maximum ${MAX_HERO_IMAGES} hero images allowed.`);
  }

  const timestamp = new Date().toISOString();
  const nextHeroImage: StoredHeroImage = {
    id: randomUUID(),
    imageUrl: input.imageUrl,
    title: input.title,
    altText: input.altText,
    isActive: input.isActive,
    displayOrder: input.displayOrder,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  database.heroImages.push(nextHeroImage);
  await writeDatabase(database);
  return nextHeroImage;
}

export async function updateHeroImage(id: string, input: HeroMutationInput) {
  const database = await readDatabase();
  const heroImageIndex = database.heroImages.findIndex((heroImage) => heroImage.id === id);

  if (heroImageIndex < 0) {
    return null;
  }

  const existingHeroImage = database.heroImages[heroImageIndex];
  const nextHeroImage: StoredHeroImage = {
    ...existingHeroImage,
    imageUrl: input.imageUrl,
    title: input.title,
    altText: input.altText,
    isActive: input.isActive,
    displayOrder: input.displayOrder,
    updatedAt: new Date().toISOString(),
  };

  database.heroImages[heroImageIndex] = nextHeroImage;
  await writeDatabase(database);
  return nextHeroImage;
}

export async function deleteHeroImage(id: string) {
  const database = await readDatabase();
  const nextHeroImages = database.heroImages.filter((heroImage) => heroImage.id !== id);

  if (nextHeroImages.length === database.heroImages.length) {
    return false;
  }

  database.heroImages = nextHeroImages;
  await writeDatabase(database);
  return true;
}

export async function getDashboardStats() {
  const products = await listAllProducts();
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
