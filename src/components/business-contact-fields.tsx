"use client";

import type { BusinessContactInput } from "@/lib/business-contact";

const inputClass = "mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm";

function Field({
  id,
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={required && type !== "tel" ? 2 : undefined}
        className={inputClass}
      />
    </div>
  );
}

export function BusinessContactFields({
  idPrefix,
  value,
  onChange,
  requireState = false,
}: {
  idPrefix: string;
  value: BusinessContactInput;
  onChange: (next: BusinessContactInput | ((current: BusinessContactInput) => BusinessContactInput)) => void;
  requireState?: boolean;
}) {
  function set(key: keyof BusinessContactInput, next: string) {
    onChange((current) => ({ ...current, [key]: next }));
  }

  return (
    <div className="space-y-3">
      <Field
        id={`${idPrefix}-contact`}
        label="Proprietor / contact person"
        required
        value={value.contactName}
        onChange={(next) => set("contactName", next)}
      />
      <Field
        id={`${idPrefix}-phone`}
        label="Phone"
        required
        type="tel"
        value={value.phone}
        onChange={(next) => set("phone", next)}
      />
      <Field
        id={`${idPrefix}-address`}
        label="Factory / unit address"
        required
        value={value.address}
        onChange={(next) => set("address", next)}
      />
      <Field
        id={`${idPrefix}-city`}
        label="City"
        required
        value={value.city}
        onChange={(next) => set("city", next)}
      />
      <Field
        id={`${idPrefix}-state`}
        label="State"
        required={requireState}
        value={value.state}
        onChange={(next) => set("state", next)}
      />
      <Field
        id={`${idPrefix}-pin`}
        label="PIN code"
        value={value.postalCode}
        onChange={(next) => set("postalCode", next)}
      />
    </div>
  );
}
