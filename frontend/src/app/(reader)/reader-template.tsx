'use client'

import { Category, Document, removeSuffix } from "@/utils/interfaces";
import { cachedFetch, cachedFetchText } from "@/utils/cache";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useRef, useState, useCallback } from "react";
import "./page.css";
import "./highlight.css";
import "./katex.min.css";
import { HeaderContext } from "../menu";
import { SidebarContext } from "@/contexts/sidebar-context";
import Card from "@/components/card";

interface ItemProps {
  title: string;
  description: string;
  href: string;
  type: 'category' | 'document';
}


export default function ReaderTemplate() {
  const fullPath = usePathname();
  const [content, setContent] = useState<string | null>(null);
  const [items, setItems] = useState<ItemProps[]>([]);
  const setHeaderVisible = useContext(HeaderContext);
  const setSidebarVisible = useContext(SidebarContext);

  const fetchContent = useCallback(async () => {
    let path = fullPath.split('/').pop() || "";
    if (path.endsWith(".md")) {
      const documents = await cachedFetch<Document[]>(`documents?title=${encodeURIComponent(path)}`);
      const content_url = documents[0].content_url;
      const content = await cachedFetchText(decodeURIComponent(content_url));
      setContent(content);
    }
    else {
      const category = await cachedFetch<Category>(`categories?title=${encodeURIComponent(path)}`);
      const description = category.description || " ";
      setContent(description);
      setItems(await fetchItems(fullPath, path));
    }
  }, [fullPath]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    const handleCacheInvalidation = () => {
      fetchContent();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cache-invalidated', handleCacheInvalidation);
      return () => {
        window.removeEventListener('cache-invalidated', handleCacheInvalidation);
      };
    }
  }, [fetchContent])

  const scrollFrame = useRef<[number, number]>([0, 0]);
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    scrollFrame.current.unshift(e.currentTarget.scrollTop);
    scrollFrame.current.pop();

    const [current, previous] = scrollFrame.current;
    if (current > previous) {
      setHeaderVisible(false);
    }
    else if (current < previous) {
      setHeaderVisible(true);
    }
  }

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If it is large screen
    if (window.innerWidth >= 1024) {
      setSidebarVisible(true);
      return;
    }
    // If it is small screen
    if (e.clientX > 256 && e.clientX < 256 + 48) {
      setSidebarVisible(false);
      return;
    }

    if (e.clientX > 0 && e.clientX < 48) {
      setSidebarVisible(true);
    }
  }

  return (
    <main onScroll={onScroll} onClick={onClick} className={
      `scrollbar-thin 
      scrollbar-thumb-zinc-600 
      scrollbar-corner-gray-950 
      scrollbar-track-background 
      overflow-y-scroll 
      overflow-x-scroll
      h-full 
      justify-start`}>
      <div className={readerViewStyle}>
        {content ?
          <div
            className="animate-slide"
            dangerouslySetInnerHTML={{ __html: content }} />
          : <div className={readerViewStyle}>Loading...</div>}
        {
          items.length === 0 ? null :
            <div className="animate-slide">
              {items.map((item, index) => (
                <Card
                  key={index}
                  title={removeSuffix(item.title, ".link")}
                  description={item.description}
                  href={item.href}
                  type={item.type} />
              ))}
            </div>
        }
      </div>
    </main>
  )
}

async function fetchItems(root: string, title: string): Promise<ItemProps[]> {
  const category = await cachedFetch<Category>(`categories?title=${encodeURIComponent(title)}`);
  const cat_id = category.id;
  const subcategories = await cachedFetch<Category[]>(`subcategories?title=${encodeURIComponent(title)}`);
  const documents = await cachedFetch<Document[]>(`documents?category_id=${cat_id}`);

  const subcategoryItems: ItemProps[] = subcategories.map(subcat => ({
    title: subcat.title,
    description: subcat.description,
    href: `${root}/${encodeURIComponent(subcat.title)}`,
    type: 'category' as const,
  }));

  const documentItems: ItemProps[] = documents.map(doc => ({
    title: doc.title,
    description: "",
    href: `${root}/${encodeURIComponent(doc.title)}.md`,
    type: 'document' as const,
  }));

  return subcategoryItems.concat(documentItems);
}

const readerViewStyle = "content lg:w-2/3 lg:pl-30 lg:pb-60 lg:pt-5 pl-8 pr-8 w-lvw pb-32 pt-2"