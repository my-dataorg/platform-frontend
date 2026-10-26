"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Briefcase, ChevronDown, X } from "lucide-react";
import { dashboardAppUrl } from "@/lib/product-embed";
import { ContactFields } from "@/components/contact-fields";
import {
  createBusinessProductAction,
  deleteBusinessProductAction,
  listOwnedBusinessesProductAction,
} from "@/lib/business-product-actions";
import { contactReady, emptyContact, type ContactInput } from "@/lib/contact";
import { BUSINESS_TYPE_OPTIONS, type BusinessType } from "@/lib/business-types";

function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <div className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-6 text-foreground shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function BusinessManageBusinessesDropdown({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<"create" | "industry" | "delete" | null>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState<ContactInput>(emptyContact);
  const [businessType, setBusinessType] = useState<BusinessType>("small_scale_industry");
  const [owned, setOwned] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function openDialog(type: "create" | "industry" | "delete") {
    setMenuOpen(false);
    setError("");
    setDialog(type);
    if (type === "delete") loadOwned();
  }

  async function loadOwned() {
    const result = await listOwnedBusinessesProductAction();
    if (!result.ok) {
      setError(result.error || "Could not load businesses.");
      setOwned([]);
      return;
    }
    setOwned(result.businesses);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await createBusinessProductAction(
      name.trim(),
      dialog === "industry" ? "small_scale_industry" : businessType,
      contact
    );
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDialog(null);
    setName("");
    setContact(emptyContact);
    router.push(dashboardAppUrl("business", `/businesses/${result.business.id}`));
    router.refresh();
  }

  async function handleDelete(id: string, businessName: string) {
    if (!confirm(`Delete "${businessName}"? This cannot be undone.`)) return;
    setDeletingId(id);
    setError("");
    const result = await deleteBusinessProductAction(id);
    setDeletingId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOwned((prev) => prev.filter((b) => b.id !== id));
    setDialog(null);
    router.push(dashboardAppUrl("business", "/businesses"));
    router.refresh();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        className="inline-flex items-center gap-0.5 rounded-md border border-white/20 px-1.5 py-1 text-shell-foreground hover:bg-white/10 sm:gap-1 sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-sm"
        title="Manage businesses"
        aria-label="Manage businesses"
      >
        {compact ? (
          <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        ) : (
          <>
            Manage businesses
            <ChevronDown className={`h-4 w-4 transition ${menuOpen ? "rotate-180" : ""}`} />
          </>
        )}
        {compact && (
          <ChevronDown className={`h-3 w-3 sm:h-3.5 sm:w-3.5 transition ${menuOpen ? "rotate-180" : ""}`} />
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 z-50 mt-1 w-52 rounded-xl border border-border bg-card py-1 text-foreground shadow-lg">
          <button type="button" onClick={() => openDialog("industry")} className="block w-full px-4 py-2 text-left text-sm hover:bg-muted">
            Create industry
          </button>
          <button type="button" onClick={() => openDialog("create")} className="block w-full px-4 py-2 text-left text-sm hover:bg-muted">
            Create business
          </button>
          <button type="button" onClick={() => openDialog("delete")} className="block w-full px-4 py-2 text-left text-sm hover:bg-muted">
            Delete business
          </button>
        </div>
      )}

      <Dialog
        open={dialog === "create" || dialog === "industry"}
        onClose={() => setDialog(null)}
        title={dialog === "industry" ? "Create industry" : "Create business"}
      >
        <form onSubmit={handleCreate}>
          <label className="text-sm font-medium" htmlFor="biz-name">
            {dialog === "industry" ? "Industry name" : "Business name"}{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            id="biz-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm"
            required
            minLength={2}
            autoFocus
          />
          <div className="mt-4">
            <ContactFields idPrefix="shell-biz" value={contact} onChange={setContact} />
          </div>
          {dialog !== "industry" && (
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value as BusinessType)}
              className="mt-4 w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              {BUSINESS_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setDialog(null)} className="rounded-lg border px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || name.trim().length < 2 || !contactReady(contact)}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </Dialog>

      <Dialog open={dialog === "delete"} onClose={() => setDialog(null)} title="Delete business">
        {owned.length === 0 ? (
          <p className="text-sm text-muted-foreground">You do not own any businesses.</p>
        ) : (
          <ul className="space-y-2">
            {owned.map((biz) => (
              <li key={biz.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-sm font-medium">{biz.name}</span>
                <button
                  type="button"
                  disabled={deletingId === biz.id}
                  onClick={() => handleDelete(biz.id, biz.name)}
                  className="text-xs text-red-600 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </Dialog>
    </div>
  );
}
