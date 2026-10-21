export function productHomePath(slug: string): string {
  if (slug === "education") return "/institutes";
  if (slug === "business") return "/businesses";
  return "/";
}
