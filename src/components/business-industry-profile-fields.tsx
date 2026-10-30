"use client";

import type { BusinessIndustryProfileInput } from "@/lib/business-industry-profile";

const inputClass = "mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm";

export function BusinessIndustryProfileFields({
  idPrefix,
  value,
  onChange,
}: {
  idPrefix: string;
  value: BusinessIndustryProfileInput;
  onChange: (
    next: BusinessIndustryProfileInput | ((current: BusinessIndustryProfileInput) => BusinessIndustryProfileInput)
  ) => void;
}) {
  function set(key: keyof BusinessIndustryProfileInput, next: string) {
    onChange((current) => ({ ...current, [key]: next }));
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Unit & production</p>
      <div>
        <label className="text-sm font-medium" htmlFor={`${idPrefix}-mfg`}>
          Nature of manufacturing / main products <span className="text-red-500">*</span>
        </label>
        <p className="text-xs text-muted-foreground">e.g. rice milling, auto components.</p>
        <input
          id={`${idPrefix}-mfg`}
          required
          minLength={2}
          placeholder="e.g. Rice milling and bran"
          value={value.manufacturingLine}
          onChange={(e) => set("manufacturingLine", e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor={`${idPrefix}-district`}>
          District
        </label>
        <input
          id={`${idPrefix}-district`}
          placeholder="e.g. Krishna"
          value={value.district}
          onChange={(e) => set("district", e.target.value)}
          className={inputClass}
        />
      </div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Registration (optional)</p>
      <div>
        <label className="text-sm font-medium" htmlFor={`${idPrefix}-udyam`}>
          Udyam (MSME) registration no.
        </label>
        <input
          id={`${idPrefix}-udyam`}
          value={value.udyamRegistration}
          onChange={(e) => set("udyamRegistration", e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor={`${idPrefix}-gstin`}>
          GSTIN
        </label>
        <input
          id={`${idPrefix}-gstin`}
          value={value.gstin}
          onChange={(e) => set("gstin", e.target.value.toUpperCase())}
          className={inputClass}
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor={`${idPrefix}-pan`}>
          PAN
        </label>
        <input
          id={`${idPrefix}-pan`}
          value={value.pan}
          onChange={(e) => set("pan", e.target.value.toUpperCase())}
          className={inputClass}
        />
      </div>
    </div>
  );
}
