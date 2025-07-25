'use client'

import { api, Category, Document } from "@/utils/interfaces";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import "./page.css";
import "./highlight.css";
import "./katex.min.css";
import { HeaderContext } from "../menu";
import { SidebarContext } from "./layout";
import Card from "@/components/card";

interface ItemProps {
  title: string;
  description: string;
  href: string;
  type: 'category' | 'document';
}

interface Content {
  description: string;
  subcategories: Content[];
  documents: Document[];
}



export default function ReaderTemplate() {
  const fullPath = usePathname();
  const [content, setContent] = useState<string | null>(null);
  const [items, setItems] = useState<ItemProps[]>([]);
  const setHeaderVisible = useContext(HeaderContext);
  const setSidebarVisible = useContext(SidebarContext);

  useEffect(() => {
    const fetchContent = async () => {
      let path = fullPath.split('/').pop() || "";
      if (path.endsWith(".md")) {
        const content_url = await fetch(api(`documents?title=${path}`))
          .then(res => res.json() as Promise<Document[]>)
          .then(data => data[0].content_url);
        const response = await fetch(api(`${content_url}`));
        const content = await response.text();
        setContent(content);
      }
      else {
        const description = await fetch(api(`categories?title=${encodeURIComponent(path)}`))
          .then(res => res.json() as Promise<Category>)
          .then(data => data.description);
        setContent(description || `<p>No description available for ${decodeURIComponent(path)}</p>`);
        setItems(await fetchItems(fullPath, path));
      }
    }
    fetchContent();
  }, [])

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
                  title={item.title}
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
  const cat_id_res = await fetch(api(`categories?title=${encodeURIComponent(title)}`))
  const cat_id: number = await cat_id_res.json()
    .then(data => data.id);
  const subcategories_res = await fetch(api(`subcategories?title=${encodeURIComponent(title)}`))
  const subcategories: Category[] = await subcategories_res.json()
  const documents_res = await fetch(api(`documents?category_id=${cat_id}`))
  const documents: Document[] = await documents_res.json();
  const subcategoryItems: ItemProps[] = subcategories.map(subcat => ({
    title: subcat.title,
    description: subcat.description || "No description available",
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