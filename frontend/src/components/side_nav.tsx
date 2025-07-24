'use client';;
import { HeaderContext } from "@/app/menu";
import { api, Category } from "@/utils/interfaces";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

interface ItemProps {
  href: string;
  active: boolean;
  level: number;
  children: React.ReactNode;
  type: "category" | "document";
}



export default function SideNav({ className = "" }: { className?: string }) {
  const path = usePathname().slice(1).split('/');
  const router = useRouter();
  const setHeaderVisible = useContext(HeaderContext);
  const [items, setItems] = useState<ItemProps[]>([]);
  useEffect(() => {
    fetchCategories(true, path[0], `/${path[0]}`, 0, path).then((data) => {
      setItems(data.slice(1));
    });
  }, [])

  const onClick = (href: string) => {
    router.push(href);
    setHeaderVisible(true);
  }

  return (
    <nav className={className}>
      {
        items.map((item, index) => (
          <div
            key={index}
            className={makeStyle(item.level, item.active)}
            onClick={() => onClick(item.href)}
          >
            {item.children}
          </div>
        ))
      }
    </nav>
  )
}

function makeStyle(level: number, active: boolean): string {
  const fixedStyle = "py-1 cursor-pointer";
  const activeStyle = active
    ? "text-secondary-foreground text-bold"
    : "text-secondary-foreground/50 hover:text-secondary-foreground";
  const baseStyle = (() => {
    switch (level) {
      case 0: return "pl-2 text-lg";
      case 1: return "pl-2 text-lg";
      case 2: return "pl-6 text-md";
      default: return "pl-8 text-xl";
    }
  })()
  return `${fixedStyle} ${baseStyle} ${activeStyle}`
}

async function fetchCategories(willExtend: boolean, current: string, href: string, level: number, path: string[]): Promise<ItemProps[]> {
  // Category
  const self: ItemProps = {
    href,
    active: decodeURIComponent(path[level]) === current,
    level,
    children: decodeURIComponent(current).split('.')[0],
    type: "category"
  }

  if (!willExtend) {
    return [self]
  }

  // Extend subcategories and documents
  const cats: Category[] =
    await fetch(api(`subcategories?title=${encodeURIComponent(current)}`))
      .then(res => res.json());

  const items: ItemProps[] =
    await Promise.all(cats.map(async cat => {
      const subHref = `${href}/${encodeURIComponent(cat.title)}`;
      const extend = decodeURIComponent(path[level + 1]) === cat.title;
      return await fetchCategories(extend, cat.title, subHref, level + 1, path);
    })).then(res => res.flat());

  const cat_id: number =
    await fetch(api(`categories?title=${encodeURIComponent(current)}`))
      .then(res => res.json()).then(cat => cat.id);

  const docs: Document[] =
    await fetch(api(`documents?category_id=${cat_id}`))
      .then(res => res.json());

  const hrefTitle = (title: string) => encodeURIComponent(title + ".md");
  const docItems: ItemProps[] = docs.map(doc => ({
    href: `${href}/${hrefTitle(doc.title)}`,
    active: path[level + 1] === hrefTitle(doc.title),
    level: level + 1,
    children: doc.title,
    type: "document"
  }))

  return [self, ...items, ...docItems];
}


