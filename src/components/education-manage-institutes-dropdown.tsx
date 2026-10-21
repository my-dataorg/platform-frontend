"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Building2, ChevronDown, X } from "lucide-react";
import { dashboardAppUrl } from "@/lib/product-embed";
import {
  createEducationInstituteAction,
  deleteEducationInstituteAction,
  listOwnedEducationInstitutesAction,
} from "@/lib/education-institute-actions";

type Institute = { id: string; name: string; role: string; joinCode: string };

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

export function EducationManageInstitutesDropdown({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<"create" | "delete" | null>(null);
  const [name, setName] = useState("");
  const [owned, setOwned] = useState<Institute[]>([]);
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

  function openDialog(type: "create" | "delete" | "join") {
    setMenuOpen(false);
    setError("");
    if (type === "join") {
      router.push(dashboardAppUrl("education", "/institutes/join"));
      return;
    }
    setDialog(type);
    if (type === "delete") loadOwned();
  }

  async function loadOwned() {
    const result = await listOwnedEducationInstitutesAction();
    if (!result.ok) {
      setError(result.error || "Could not load institutes.");
      setOwned([]);
      return;
    }
    setOwned(result.institutes);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await createEducationInstituteAction(name.trim());
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDialog(null);
    setName("");
    router.push(dashboardAppUrl("education", `/institutes/${result.institute.id}`));
    router.refresh();
  }

  async function handleDelete(id: string, instituteName: string) {
    if (!confirm(`Delete "${instituteName}"? This cannot be undone.`)) return;
    setDeletingId(id);
    setError("");
    const result = await deleteEducationInstituteAction(id);
    setDeletingId(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOwned((prev) => prev.filter((i) => i.id !== id));
    setDialog(null);
    router.push(dashboardAppUrl("education", "/institutes"));
    router.refresh();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        className="inline-flex items-center gap-0.5 rounded-md border border-white/20 px-1.5 py-1 text-shell-foreground hover:bg-white/10 sm:gap-1 sm:rounded-lg sm:px-3 sm:py-1.5 sm:text-sm"
        title="Manage institutes"
        aria-label="Manage institutes"
      >
        {compact ? (
          <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        ) : (
          <>
            Manage institutes
            <ChevronDown className={`h-4 w-4 transition ${menuOpen ? "rotate-180" : ""}`} />
          </>
        )}
        {compact && (
          <ChevronDown className={`h-3 w-3 sm:h-3.5 sm:w-3.5 transition ${menuOpen ? "rotate-180" : ""}`} />
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 z-50 mt-1 w-48 rounded-xl border border-border bg-card py-1 text-foreground shadow-lg">
          <button type="button" onClick={() => openDialog("create")} className="block w-full px-4 py-2 text-left text-sm hover:bg-muted">
            Create institute
          </button>
          <button type="button" onClick={() => openDialog("delete")} className="block w-full px-4 py-2 text-left text-sm hover:bg-muted">
            Delete institute
          </button>
          <button type="button" onClick={() => openDialog("join")} className="block w-full px-4 py-2 text-left text-sm hover:bg-muted">
            Join with code
          </button>
        </div>
      )}

      <Dialog open={dialog === "create"} onClose={() => setDialog(null)} title="Create institute">
        <form onSubmit={handleCreate}>
          <label className="text-sm font-medium" htmlFor="inst-name">
            Institute name
          </label>
          <input
            id="inst-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-sm"
            required
            minLength={2}
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setDialog(null)} className="rounded-lg border px-4 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading || name.trim().length < 2} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60">
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </Dialog>

      <Dialog open={dialog === "delete"} onClose={() => setDialog(null)} title="Delete institute">
        {owned.length === 0 ? (
          <p className="text-sm text-muted-foreground">You do not own any institutes.</p>
        ) : (
          <ul className="space-y-2">
            {owned.map((inst) => (
              <li key={inst.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-sm font-medium">{inst.name}</span>
                <button
                  type="button"
                  disabled={deletingId === inst.id}
                  onClick={() => handleDelete(inst.id, inst.name)}
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
