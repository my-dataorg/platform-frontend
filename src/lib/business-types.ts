export type BusinessType =
  | "kirana_merchant"
  | "small_scale_industry"
  | "online_merchant"
  | "wholesale_trader"
  | "service_provider"
  | "restaurant_fnb"
  | "professional_services";

export const BUSINESS_TYPE_OPTIONS: { value: BusinessType; label: string }[] = [
  { value: "kirana_merchant", label: "Kirana merchant" },
  { value: "small_scale_industry", label: "Small scale industry" },
  { value: "online_merchant", label: "Online merchant" },
  { value: "wholesale_trader", label: "Wholesale trader" },
  { value: "service_provider", label: "Service provider" },
  { value: "restaurant_fnb", label: "Restaurant / F&B" },
  { value: "professional_services", label: "Professional services" },
];
