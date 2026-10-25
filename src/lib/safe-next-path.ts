export function safeNextPath(value: FormDataEntryValue | string | null | undefined) {
  const path = String(value || "");
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.startsWith("/login") ||
    path.startsWith("/logout") ||
    path.includes("\\") ||
    path.includes("\n") ||
    path.includes("\r")
  ) {
    return "/dashboard";
  }
  return path;
}
