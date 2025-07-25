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
  return `http://localhost:3001/${s}`;
}
export function dbg<T>(value: T): T {
  console.log("Debug:", value);
  return value;
}