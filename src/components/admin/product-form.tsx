"use client";

import { useState } from "react";
import type { AdminProduct } from "@/lib/admin-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProductForm({
  product,
  onSaved,
  onCancel,
}: {
  product: AdminProduct;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const isNew = product.slug === "new";
  const [status, setStatus] = useState(product.status);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save(form: HTMLFormElement) {
    const data = new FormData(form);
    const launchUrl = String(data.get("launchUrl") ?? "").trim();
    const defaultPath = String(data.get("defaultPath") ?? "/").trim() || "/";
    if (!/^https?:\/\/[^/]+/.test(launchUrl) || !defaultPath.startsWith("/")) {
      setMessage("Launch URL must be absolute and default path must start with /.");
      return;
    }

    setSaving(true);
    setMessage("");
    const slug = String(data.get("slug") ?? "").trim();
    const response = await fetch(
      isNew ? "/api/admin/products" : `/api/admin/products/${encodeURIComponent(product.slug)}`,
      {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        slug,
        shortDescription: data.get("shortDescription"),
        iconUrl: data.get("iconUrl"),
        category: data.get("category"),
        tags: String(data.get("tags") ?? "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        featured: data.get("featured") === "on",
        launchUrl,
        defaultPath,
        status,
        embedEnabled: data.get("embedEnabled") === "on",
      }),
      },
    );
    setSaving(false);
    if (response.ok) {
      onSaved?.();
      return;
    }
    setMessage("Could not save this product.");
  }

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault();
        void save(event.currentTarget);
      }}
    >
      <label className="text-sm">
        Slug
        <Input name="slug" defaultValue={isNew ? "" : product.slug} readOnly={!isNew} required />
      </label>
      <label className="text-sm">
        Name
        <Input name="name" defaultValue={product.name} required />
      </label>
      <label className="text-sm">
        Category
        <Input name="category" defaultValue={product.category} required />
      </label>
      <label className="text-sm sm:col-span-2">
        Description
        <Input name="shortDescription" defaultValue={product.shortDescription} required />
      </label>
      <label className="text-sm">
        Launch URL
        <Input name="launchUrl" type="url" defaultValue={product.launchUrl} required />
      </label>
      <label className="text-sm">
        Default path
        <Input name="defaultPath" defaultValue={product.defaultPath} required />
      </label>
      <label className="text-sm sm:col-span-2">
        Icon URL
        <Input name="iconUrl" type="url" defaultValue={product.iconUrl} />
      </label>
      <label className="text-sm">
        Tags
        <Input name="tags" defaultValue={product.tags.join(", ")} />
      </label>
      <label className="text-sm">
        Status
        <select
          className="mt-1 h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
          value={status}
          onChange={(event) => setStatus(event.target.value as AdminProduct["status"])}
        >
          <option value="enabled">Enabled / published</option>
          <option value="disabled">Disabled / archived</option>
        </select>
      </label>
      <div className="flex gap-5 text-sm sm:col-span-2">
        <label className="flex items-center gap-2">
          <input name="featured" type="checkbox" defaultChecked={product.featured} />
          Featured
        </label>
        <label className="flex items-center gap-2">
          <input name="embedEnabled" type="checkbox" defaultChecked={product.embedEnabled} />
          Enable embedded launch
        </label>
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isNew ? "Create product" : "Save changes"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
        {message && <span className="text-sm text-muted-foreground">{message}</span>}
      </div>
    </form>
  );
}
