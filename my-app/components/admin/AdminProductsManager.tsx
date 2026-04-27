"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { FiEdit2, FiLoader, FiPlus, FiRefreshCw, FiTrash2, FiUploadCloud, FiX } from "react-icons/fi";
import { toast } from "sonner";

import { apiClient, getApiErrorMessage } from "@/lib/http/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdminProduct, AdminProductStatus } from "@/types/admin-product.types";
import type { ProductCategory } from "@/types/product.types";

type EditorMode = "create" | "edit";

type ProductFormState = {
  name: string;
  price: string;
  description: string;
  status: AdminProductStatus;
  category: ProductCategory;
};

const PRODUCT_API_PATH = "/admin/products";
const PRODUCT_CATEGORIES: ProductCategory[] = ["New Arrival", "Adventure", "Sports"];

const INITIAL_FORM_STATE: ProductFormState = {
  name: "",
  price: "",
  description: "",
  status: "active",
  category: "New Arrival",
};

const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"]);
const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function toFormState(product: AdminProduct): ProductFormState {
  return {
    name: product.name,
    price: product.price.toString(),
    description: product.description,
    status: product.status,
    category: product.category,
  };
}

function parsePrice(value: string): number {
  const parsedPrice = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsedPrice) ? parsedPrice : 0;
}

function formatProductPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

function parseProducts(payload: unknown): AdminProduct[] {
  const root = typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : null;
  const data = typeof root?.data === "object" && root.data !== null ? (root.data as Record<string, unknown>) : null;
  const list = Array.isArray(data?.items) ? data.items : [];

  return list
    .map((item) => {
      const product = item as {
        id?: number;
        name?: string;
        image?: string;
        price?: number;
        description?: string;
        status?: AdminProductStatus;
        category?: ProductCategory;
        platform?: "PS5";
      };

      if (!Number.isFinite(product.id)) {
        return null;
      }

      return {
        id: Number(product.id),
        name: product.name ?? "",
        image: product.image ?? "",
        price: Number.isFinite(product.price) ? Number(product.price) : 0,
        description: product.description ?? "",
        status: product.status === "inactive" ? "inactive" : "active",
        category: PRODUCT_CATEGORIES.includes(product.category as ProductCategory)
          ? (product.category as ProductCategory)
          : "New Arrival",
        platform: "PS5",
      } satisfies AdminProduct;
    })
    .filter((product): product is AdminProduct => product !== null);
}

export default function AdminProductsManager() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

  const [editorMode, setEditorMode] = useState<EditorMode | null>(null);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [formState, setFormState] = useState<ProductFormState>(INITIAL_FORM_STATE);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const editorTitle = editorMode === "edit" ? `Edit Product #${editingProductId ?? ""}` : "Add Product";

  function resetEditor() {
    setEditorMode(null);
    setEditingProductId(null);
    setFormState(INITIAL_FORM_STATE);
    setSelectedImageFile(null);
    setImagePreview("");
  }

  async function fetchProducts(options: { initial?: boolean } = {}) {
    if (options.initial) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const response = await apiClient.get(PRODUCT_API_PATH);
      setProducts(parseProducts(response.data));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load products."));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  function startCreate() {
    setEditorMode("create");
    setEditingProductId(null);
    setFormState(INITIAL_FORM_STATE);
    setSelectedImageFile(null);
    setImagePreview("");
  }

  function startEdit(product: AdminProduct) {
    setEditorMode("edit");
    setEditingProductId(product.id);
    setFormState(toFormState(product));
    setSelectedImageFile(null);
    setImagePreview(product.image);
  }

  async function handleDelete(productId: number) {
    const shouldDelete = window.confirm("Are you sure you want to delete this product?");

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingProductId(productId);
      await apiClient.delete(`${PRODUCT_API_PATH}/${productId}`);
      toast.success("Product deleted.");

      if (editingProductId === productId) {
        resetEditor();
      }

      await fetchProducts();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Product could not be deleted."));
    } finally {
      setDeletingProductId(null);
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
      toast.error("Invalid image type. Please use JPEG, PNG, WEBP, or AVIF.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
      toast.error("Image size must be 5MB or less.");
      event.target.value = "";
      return;
    }

    setSelectedImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = formState.name.trim();
    const normalizedDescription = formState.description.trim();
    const normalizedPrice = parsePrice(formState.price);

    if (!normalizedName || !normalizedDescription || normalizedPrice <= 0) {
      toast.error("Please fill all fields and provide a valid price.");
      return;
    }

    if (editorMode === "create" && !selectedImageFile) {
      toast.error("Please upload a product image.");
      return;
    }

    if (editorMode === "edit" && editingProductId === null) {
      toast.error("No product selected for editing.");
      return;
    }

    try {
      setIsSaving(true);

      const formData = new FormData();
      formData.append("name", normalizedName);
      formData.append("price", String(normalizedPrice));
      formData.append("description", normalizedDescription);
      formData.append("status", formState.status);
      formData.append("category", formState.category);

      if (selectedImageFile) {
        formData.append("image", selectedImageFile);
      }

      const endpoint = editorMode === "edit" ? `${PRODUCT_API_PATH}/${editingProductId}` : PRODUCT_API_PATH;
      const method = editorMode === "edit" ? "patch" : "post";

      await apiClient.request({
        url: endpoint,
        method,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(editorMode === "edit" ? "Product updated." : "Product created.");
      resetEditor();
      await fetchProducts();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Product could not be saved."));
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchProducts({ initial: true });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!editorMode) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        resetEditor();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [editorMode]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <>
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Products</h1>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => void fetchProducts()} disabled={isRefreshing || isLoading}>
              {isRefreshing ? <FiLoader className="size-4 animate-spin" aria-hidden="true" /> : <FiRefreshCw className="size-4" aria-hidden="true" />}
              Refresh
            </Button>
            <Button size="sm" onClick={startCreate}>
              <FiPlus className="size-4" aria-hidden="true" />
              Add Product
            </Button>
          </div>
        </div>

        <Card className="border-border/80">
          <CardContent className="space-y-3 pt-4">
            <div className="hidden items-center rounded-lg border border-border bg-muted/20 px-3 py-2 md:grid md:grid-cols-[70px_72px_minmax(180px,1.2fr)_110px_minmax(220px,1.6fr)_110px_120px_170px]">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">ID</p>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Image</p>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Name</p>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Price</p>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Description</p>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Category</p>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Status</p>
              <p className="text-right text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Actions</p>
            </div>

            {isLoading ? (
              <div className="flex min-h-44 items-center justify-center rounded-lg border border-border bg-muted/20">
                <FiLoader className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                No products available.
              </div>
            ) : (
              products.map((product) => (
                <article
                  key={product.id}
                  className="grid items-center gap-3 rounded-lg border border-border px-3 py-3 md:grid-cols-[70px_72px_minmax(180px,1.2fr)_110px_minmax(220px,1.6fr)_110px_120px_170px]"
                >
                  <p className="text-sm font-medium text-muted-foreground">#{product.id}</p>

                  <div className="flex size-14 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>

                  <p className="self-center text-sm font-semibold leading-tight text-foreground">{product.name}</p>

                  <p className="text-sm font-medium text-foreground">{formatProductPrice(product.price)}</p>

                  <p className="text-sm text-muted-foreground">{product.description}</p>

                  <Badge variant="outline">{product.category}</Badge>

                  <Badge
                    variant={product.status === "active" ? "secondary" : "outline"}
                    className={product.status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}
                  >
                    {product.status === "active" ? "Active" : "Inactive"}
                  </Badge>

                  <div className="flex items-center gap-2 md:justify-end">
                    <Button type="button" variant="outline" size="sm" onClick={() => startEdit(product)}>
                      <FiEdit2 className="size-3.5" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => void handleDelete(product.id)}
                      disabled={deletingProductId === product.id}
                    >
                      {deletingProductId === product.id ? (
                        <FiLoader className="size-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <FiTrash2 className="size-3.5" aria-hidden="true" />
                      )}
                      Delete
                    </Button>
                  </div>
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      {editorMode ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/35 p-4 backdrop-blur-sm sm:p-6"
          onClick={resetEditor}
          role="presentation"
        >
          <Card className="max-h-[90vh] w-full max-w-3xl overflow-auto border-border/80 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{editorTitle}</CardTitle>
                  <CardDescription>Edit product details and set status as active or inactive.</CardDescription>
                </div>
                <Button type="button" variant="ghost" size="icon-sm" onClick={resetEditor} aria-label="Close editor">
                  <FiX className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input
                    id="product-name"
                    value={formState.name}
                    onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-price">Price</Label>
                  <Input
                    id="product-price"
                    type="text"
                    value={formState.price}
                    onChange={(event) => setFormState((prev) => ({ ...prev, price: event.target.value }))}
                    placeholder="49.99"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-category">Category</Label>
                  <select
                    id="product-category"
                    value={formState.category}
                    onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value as ProductCategory }))}
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {PRODUCT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-status">Status</Label>
                  <select
                    id="product-status"
                    value={formState.status}
                    onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value as AdminProductStatus }))}
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="product-image">Product Image</Label>
                  <label
                    htmlFor="product-image"
                    className="flex min-h-32 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-3 transition hover:bg-muted/50"
                  >
                    {imagePreview ? (
                      <div className="h-28 w-full overflow-hidden rounded-md border border-border bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="Product preview" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="mx-auto mb-2 flex size-9 items-center justify-center rounded-full border border-border bg-background">
                          <FiUploadCloud className="size-4 text-muted-foreground" aria-hidden="true" />
                        </span>
                        <p className="text-sm font-medium text-foreground">Click to upload product image</p>
                        <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG, WEBP, AVIF (max 5MB)</p>
                      </div>
                    )}
                  </label>
                  <Input
                    id="product-image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={handleImageChange}
                    required={editorMode === "create"}
                  />
                  {selectedImageFile ? <p className="text-xs text-muted-foreground">Selected: {selectedImageFile.name}</p> : null}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="product-description">Description</Label>
                  <Textarea
                    id="product-description"
                    value={formState.description}
                    onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Short product description"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 md:col-span-2">
                  <Button type="button" variant="outline" onClick={resetEditor}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? <FiLoader className="size-4 animate-spin" aria-hidden="true" /> : null}
                    {editorMode === "edit" ? "Save Product" : "Create Product"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </>
  );
}
