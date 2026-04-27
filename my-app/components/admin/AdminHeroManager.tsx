"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { FiEdit2, FiLoader, FiPlus, FiRefreshCw, FiTrash2, FiUploadCloud, FiX } from "react-icons/fi";
import { toast } from "sonner";

import { apiClient, getApiErrorMessage } from "@/lib/http/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type EditorMode = "create" | "edit";
type HeroStatus = "active" | "inactive";

type HeroImageRecord = {
  id: string;
  imageUrl: string;
  title: string;
  altText: string;
  isActive: boolean;
  displayOrder: number;
};

type HeroFormState = {
  title: string;
  altText: string;
  displayOrder: string;
  status: HeroStatus;
};

const HERO_API_PATH = "/admin/hero-images";

const MAX_HERO_IMAGES = 2;
const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"]);

const INITIAL_FORM_STATE: HeroFormState = {
  title: "",
  altText: "",
  displayOrder: "0",
  status: "active",
};

function parseHeroImages(payload: unknown): HeroImageRecord[] {
  const root = typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : null;
  const data = typeof root?.data === "object" && root.data !== null ? (root.data as Record<string, unknown>) : null;
  const list = Array.isArray(data?.items) ? data.items : [];

  return list.map((item, index) => {
    const hero = item as {
      _id?: string;
      id?: string;
      imageUrl?: string;
      title?: string;
      altText?: string;
      isActive?: boolean;
      displayOrder?: number;
    };

    return {
      id: String(hero._id ?? hero.id ?? `hero-${index}`),
      imageUrl: hero.imageUrl ?? "",
      title: hero.title ?? "",
      altText: hero.altText ?? "",
      isActive: hero.isActive ?? true,
      displayOrder: Number.isFinite(hero.displayOrder) ? Number(hero.displayOrder) : 0,
    };
  });
}

function toFormState(hero: HeroImageRecord): HeroFormState {
  return {
    title: hero.title,
    altText: hero.altText,
    displayOrder: String(hero.displayOrder),
    status: hero.isActive ? "active" : "inactive",
  };
}

function parseDisplayOrder(value: string): number {
  const parsedValue = Number.parseInt(value, 10);

  return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : -1;
}

export default function AdminHeroManager() {
  const [heroImages, setHeroImages] = useState<HeroImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editorMode, setEditorMode] = useState<EditorMode | null>(null);
  const [editingHeroId, setEditingHeroId] = useState<string | null>(null);
  const [formState, setFormState] = useState<HeroFormState>(INITIAL_FORM_STATE);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const canCreateMore = heroImages.length < MAX_HERO_IMAGES;
  const editorTitle = editorMode === "edit" ? "Edit Hero Image" : "Add Hero Image";

  const setPreview = useCallback((nextUrl: string) => {
    setPreviewUrl((currentUrl) => {
      if (currentUrl.startsWith("blob:")) {
        URL.revokeObjectURL(currentUrl);
      }

      return nextUrl;
    });
  }, []);

  const resetEditor = useCallback(() => {
    setEditorMode(null);
    setEditingHeroId(null);
    setFormState(INITIAL_FORM_STATE);
    setSelectedImageFile(null);
    setPreview("");
  }, [setPreview]);

  function startCreate() {
    if (!canCreateMore) {
      toast.error(`Only ${MAX_HERO_IMAGES} hero images are allowed.`);
      return;
    }

    setEditorMode("create");
    setEditingHeroId(null);
    setFormState(INITIAL_FORM_STATE);
    setSelectedImageFile(null);
    setPreview("");
  }

  function startEdit(hero: HeroImageRecord) {
    setEditorMode("edit");
    setEditingHeroId(hero.id);
    setFormState(toFormState(hero));
    setSelectedImageFile(null);
    setPreview(hero.imageUrl);
  }

  async function fetchHeroImages(options: { initial?: boolean } = {}) {
    if (options.initial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const response = await apiClient.get(HERO_API_PATH);
      setHeroImages(parseHeroImages(response.data));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load hero images."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleDelete(heroId: string) {
    if (!window.confirm("Are you sure you want to delete this hero image?")) {
      return;
    }

    try {
      setDeletingId(heroId);
      await apiClient.delete(`${HERO_API_PATH}/${heroId}`);

      toast.success("Hero image deleted.");
      await fetchHeroImages();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Hero image could not be deleted."));
    } finally {
      setDeletingId(null);
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
      toast.error("Invalid image type. Use JPEG, PNG, WEBP, or AVIF.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
      toast.error("Image size must be 5MB or less.");
      event.target.value = "";
      return;
    }

    setSelectedImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedTitle = formState.title.trim();
    const normalizedAltText = formState.altText.trim();
    const displayOrder = parseDisplayOrder(formState.displayOrder);

    if (!normalizedTitle || !normalizedAltText || displayOrder < 0) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (editorMode === "create" && !selectedImageFile) {
      toast.error("Please upload a hero image.");
      return;
    }

    if (editorMode === "edit" && !editingHeroId) {
      toast.error("No hero image selected for editing.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("title", normalizedTitle);
      formData.append("altText", normalizedAltText);
      formData.append("displayOrder", String(displayOrder));
      formData.append("isActive", String(formState.status === "active"));

      if (selectedImageFile) {
        formData.append("image", selectedImageFile);
      }

      const endpoint = editorMode === "edit" ? `${HERO_API_PATH}/${editingHeroId}` : HERO_API_PATH;
      const method = editorMode === "edit" ? "patch" : "post";
      await apiClient.request({
        url: endpoint,
        method,
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(editorMode === "edit" ? "Hero image updated." : "Hero image created.");
      resetEditor();
      await fetchHeroImages();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Hero image could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchHeroImages({ initial: true });
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!editorMode) {
      return;
    }

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        resetEditor();
      }
    };

    document.addEventListener("keydown", onKeydown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeydown);
      document.body.style.overflow = "";
    };
  }, [editorMode, resetEditor]);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <>
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Hero Images</h1>
            <p className="text-sm text-muted-foreground">Manage homepage hero images with a simple and editable workflow.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => void fetchHeroImages()} disabled={refreshing || loading}>
              {refreshing ? <FiLoader className="size-4 animate-spin" aria-hidden="true" /> : <FiRefreshCw className="size-4" aria-hidden="true" />}
              Refresh
            </Button>
            <Button type="button" size="sm" onClick={startCreate} disabled={!canCreateMore}>
              <FiPlus className="size-4" aria-hidden="true" />
              Add Hero Image
            </Button>
          </div>
        </div>

        {!canCreateMore ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Maximum {MAX_HERO_IMAGES} hero images reached. Delete one to add a new image.
          </div>
        ) : null}

        <Card className="border-border/80">
          <CardContent className="space-y-3 pt-4">
            <div className="hidden rounded-lg border border-border bg-muted/20 px-3 py-2 md:grid md:grid-cols-[120px_88px_minmax(180px,1fr)_minmax(220px,1.2fr)_90px_110px_170px]">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">ID</p>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Image</p>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Title</p>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Alt Text</p>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Order</p>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Status</p>
              <p className="text-right text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Actions</p>
            </div>

            {loading ? (
              <div className="flex min-h-44 items-center justify-center rounded-lg border border-border bg-muted/20">
                <FiLoader className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            ) : heroImages.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                No hero images available.
              </div>
            ) : (
              heroImages.map((hero) => (
                <article
                  key={hero.id}
                  className="grid gap-3 rounded-lg border border-border px-3 py-3 md:grid-cols-[120px_88px_minmax(180px,1fr)_minmax(220px,1.2fr)_90px_110px_170px] md:items-center"
                >
                  <p className="text-sm font-medium text-muted-foreground">{hero.id.slice(-8)}</p>

                  <div className="size-16 overflow-hidden rounded-md border border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={hero.imageUrl} alt={hero.altText || hero.title} className="h-full w-full object-cover" />
                  </div>

                  <p className="text-sm font-semibold text-foreground">{hero.title || "Untitled"}</p>
                  <p className="text-sm text-muted-foreground">{hero.altText || "-"}</p>
                  <p className="text-sm font-medium text-foreground">{hero.displayOrder}</p>

                  <Badge
                    variant={hero.isActive ? "secondary" : "outline"}
                    className={hero.isActive ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : ""}
                  >
                    {hero.isActive ? "Active" : "Inactive"}
                  </Badge>

                  <div className="flex items-center gap-2 md:justify-end">
                    <Button type="button" variant="outline" size="sm" onClick={() => startEdit(hero)}>
                      <FiEdit2 className="size-3.5" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => void handleDelete(hero.id)} disabled={deletingId === hero.id}>
                      {deletingId === hero.id ? <FiLoader className="size-3.5 animate-spin" aria-hidden="true" /> : <FiTrash2 className="size-3.5" aria-hidden="true" />}
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
                  <CardDescription>Update image file, title, alt text, display order, and active status.</CardDescription>
                </div>
                <Button type="button" variant="ghost" size="icon-sm" onClick={resetEditor} aria-label="Close editor">
                  <FiX className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hero-title">Title</Label>
                  <Input
                    id="hero-title"
                    value={formState.title}
                    onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="PlayStation 5 Games"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero-alt-text">Alt Text</Label>
                  <Input
                    id="hero-alt-text"
                    value={formState.altText}
                    onChange={(event) => setFormState((prev) => ({ ...prev, altText: event.target.value }))}
                    placeholder="Hero banner showing PS5 game discs"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero-order">Display Order</Label>
                  <Input
                    id="hero-order"
                    type="number"
                    min={0}
                    value={formState.displayOrder}
                    onChange={(event) => setFormState((prev) => ({ ...prev, displayOrder: event.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero-status">Status</Label>
                  <select
                    id="hero-status"
                    value={formState.status}
                    onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value as HeroStatus }))}
                    className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="hero-image">Hero Image</Label>
                  <label
                    htmlFor="hero-image"
                    className="flex min-h-36 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-3 transition hover:bg-muted/50"
                  >
                    {previewUrl ? (
                      <div className="h-32 w-full overflow-hidden rounded-md border border-border bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={previewUrl} alt="Hero preview" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="mx-auto mb-2 flex size-9 items-center justify-center rounded-full border border-border bg-background">
                          <FiUploadCloud className="size-4 text-muted-foreground" aria-hidden="true" />
                        </span>
                        <p className="text-sm font-medium text-foreground">Click to upload hero image</p>
                        <p className="mt-1 text-xs text-muted-foreground">JPEG, PNG, WEBP, AVIF (max 5MB)</p>
                      </div>
                    )}
                  </label>
                  <Input
                    id="hero-image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                    className="hidden"
                    onChange={handleImageChange}
                    required={editorMode === "create"}
                  />
                  {selectedImageFile ? <p className="text-xs text-muted-foreground">Selected: {selectedImageFile.name}</p> : null}
                </div>

                <div className="flex items-center justify-end gap-2 md:col-span-2">
                  <Button type="button" variant="outline" onClick={resetEditor}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? <FiLoader className="size-4 animate-spin" aria-hidden="true" /> : null}
                    {editorMode === "edit" ? "Save Changes" : "Create Hero Image"}
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
