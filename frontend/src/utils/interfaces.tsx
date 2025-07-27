export interface Document {
  id: number;
  title: string;
  content_url: string;
  category_id: number;
  created_at: string;
  modified_at: string;
}

export interface Category {
  id: number;
  title: string;
  description: string;
  parent_id: number | null;
}

export function api(s: string) {
  if (process.env.NODE_ENV === "development") {
    return `http://localhost:3001/${s}`;
  }
  return `https://api.dexermatte.rs/${s}`;
}

export function dbg<T>(value: T): T {
  console.log("Debug:", value);
  return value;
}

export function removeSuffix(str: string, suffix: string): string {
  if (str.endsWith(suffix)) {
    return str.slice(0, -suffix.length);
  }
  return str;
}

export function createCacheKey(...parts: string[]): string {
  return parts.map(part => encodeURIComponent(part)).join('_');
}