'use client'
import { HeaderContext } from "@/app/menu";
import { Category, removeSuffix, createCacheKey } from "@/utils/interfaces";
import { cachedFetch } from "@/utils/cache";
import { usePathname, useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { Document } from "@/utils/interfaces";


interface ItemProps {
  href: string;
  active: boolean;
  level: number;
  children: React.ReactNode;
  type: "category" | "document";
}

interface NavigationData {
  categories: Category[];
  documents: Document[];
  rootCategory: Category;
}

export default function SideNav({ className = "", handler }
  : { className?: string, handler: Dispatch<SetStateAction<boolean>> }) {
  const path = usePathname().slice(1).split('/');
  const router = useRouter();
  const setHeaderVisible = useContext(HeaderContext);
  const [items, setItems] = useState<ItemProps[]>([]);

  const loadNavigation = async () => {
    try {
      const data = await buildNavigationTree(path[0], path);
      setItems(data);
    } catch (error) {
      console.error('Failed to load navigation:', error);
    }
  };

  useEffect(() => {
    loadNavigation();

    const handleCacheInvalidation = () => {
      loadNavigation();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cache-invalidated', handleCacheInvalidation);
      return () => {
        window.removeEventListener('cache-invalidated', handleCacheInvalidation);
      };
    }
  }, [path.join('/')])

  const onClick = (href: string) => {
    // If small screen
    if (window.innerWidth < 1024) {
      handler(false);
    }
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
  const fixedStyle = "py-1 cursor-pointer transition-colors";
  const activeStyle = active
    ? "text-secondary-foreground text-bold"
    : "text-secondary-foreground/50 hover:text-secondary-foreground";
  const baseStyle = (() => {
    switch (level) {
      case 0: return "pl-2 text-lg";
      case 1: return "pl-6 text-md";
      case 2: return "pl-10 text-sm";
      default: return "pl-12 text-sm";
    }
  })()
  return `${fixedStyle} ${baseStyle} ${activeStyle}`
}

async function buildNavigationTree(rootCategory: string, path: string[]): Promise<ItemProps[]> {
  const cacheKey = createCacheKey('navigation', rootCategory);
  const navigationData: NavigationData = await cachedFetch(`navigation/${encodeURIComponent(rootCategory)}`);

  const categoryMap = new Map<number, Category & { children: Category[], documents: Document[] }>();

  navigationData.categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, children: [], documents: [] });
  });

  // Build parent-child relationships
  navigationData.categories.forEach(cat => {
    if (cat.parent_id && categoryMap.has(cat.parent_id)) {
      categoryMap.get(cat.parent_id)!.children.push(cat);
    }
  });

  // Assign documents to their categories
  navigationData.documents.forEach(doc => {
    if (categoryMap.has(doc.category_id)) {
      categoryMap.get(doc.category_id)!.documents.push(doc);
    }
  });

  // Find the current category based on path
  const rootCat = categoryMap.get(navigationData.rootCategory.id);
  if (!rootCat) return [];

  // If we're at root level, show subcategories
  if (path.length === 1) {
    return buildSubcategoryItems(rootCat, `/${encodeURIComponent(rootCategory)}`, path, categoryMap);
  }

  // Find the current category we're viewing
  let currentCategory = rootCat;
  for (let i = 1; i < path.length; i++) {
    const pathSegment = decodeURIComponent(path[i]);
    // Skip if it's a document (ends with .md)
    if (pathSegment.endsWith('.md')) break;

    const childCat = currentCategory.children.find(child => child.title === pathSegment);
    if (childCat) {
      currentCategory = categoryMap.get(childCat.id)!;
    } else {
      break;
    }
  }

  // Show siblings of current category and expand current one
  const parentId = currentCategory.parent_id;
  if (parentId && categoryMap.has(parentId)) {
    const parentCategory = categoryMap.get(parentId)!;
    return buildSubcategoryItems(parentCategory, `/${encodeURIComponent(rootCategory)}`, path, categoryMap, currentCategory.id);
  }

  // If no parent, show subcategories of current
  return buildSubcategoryItems(currentCategory, `/${encodeURIComponent(rootCategory)}`, path, categoryMap);
}

function buildSubcategoryItems(
  parentCategory: Category & { children: Category[], documents: Document[] },
  baseHref: string,
  path: string[],
  categoryMap: Map<number, Category & { children: Category[], documents: Document[] }>,
  expandCategoryId?: number
): ItemProps[] {
  const items: ItemProps[] = [];

  // Add subcategories (siblings) - these are at level 0
  parentCategory.children.forEach(child => {
    const childCategory = categoryMap.get(child.id);
    if (!childCategory) return;

    const childHref = `${baseHref}/${encodeURIComponent(child.title)}`;
    // Check if this category is active by comparing with path[1]
    const isActive = path.length > 1 && decodeURIComponent(path[1]) === child.title;
    const shouldExpand = isActive || child.id === expandCategoryId;

    const categoryItem: ItemProps = {
      href: childHref,
      active: isActive,
      level: 0, // Categories are at level 0
      children: decodeURIComponent(child.title).split('.')[0],
      type: "category"
    };

    items.push(categoryItem);

    // If this category should be expanded, show its documents at level 1
    if (shouldExpand) {
      const hrefTitle = (title: string) => encodeURIComponent(title + ".md");
      const docItems: ItemProps[] = childCategory.documents.map(doc => ({
        href: `${childHref}/${hrefTitle(doc.title)}`,
        active: path.length > 2 && path[2] === hrefTitle(doc.title),
        level: 1, // Documents are at level 1 (indented)
        children: removeSuffix(doc.title, ".link"),
        type: "document"
      }));

      items.push(...docItems);
    }
  });

  return items;
}

