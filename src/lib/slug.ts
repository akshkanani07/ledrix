/**
 * Ledrix — Slug utility.
 * Workspace slugs, route params, etc.
 */

export function slugify(input: string): string {
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")           // spaces → dash
    .replace(/[^\w\-]+/g, "")       // remove non-word chars
    .replace(/\-\-+/g, "-")         // collapse dashes
    .replace(/^-+/, "")             // trim leading dash
    .replace(/-+$/, "");            // trim trailing dash
}

/**
 * Unique slug generator — existing slugs થી avoid કરે.
 */
export function uniqueSlug(base: string, existing: string[]): string {
  const baseSlug = slugify(base) || "workspace";
  if (!existing.includes(baseSlug)) return baseSlug;

  let counter = 1;
  let candidate = `${baseSlug}-${counter}`;
  while (existing.includes(candidate)) {
    counter++;
    candidate = `${baseSlug}-${counter}`;
  }
  return candidate;
}