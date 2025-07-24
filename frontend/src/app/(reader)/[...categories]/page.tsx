'use client'

import { api, Category, Document } from "@/utils/interfaces";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import "./page.css";
import "./highlight.css";
import "./katex.min.css";
import { HeaderContext } from "../../menu";
import { SidebarContext } from "../layout";

export default function BlogPage() {
  const path = usePathname().split('/').pop() || '';
  const [content, setContent] = useState<string | null>(null);
  const setHeaderVisible = useContext(HeaderContext);
  const setSidebarVisible = useContext(SidebarContext);

  useEffect(() => {
    const fetchContent = async () => {
      if (path.endsWith(".md")) {
        console.log(`Fetching document content for: ${path}`);
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

  const headerState = useRef(true);
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log("Clicked at:", e.clientX, e.clientY);
    // If it is large screen
    if (window.innerWidth >= 1024) {
      setSidebarVisible(true);
      return;
    }
    // If it is small screen
    if (e.clientX > 256 && e.clientX < 256 + 48 && headerState.current) {
      setSidebarVisible(false);
      headerState.current = false;
      return;
    }

    if (e.clientX > 0 && e.clientX < 48 && !headerState.current) {
      setSidebarVisible(true);
      console.log("Header is now visible");
      headerState.current = true;
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
      {content ?
        <div
          className={readerViewStyle}
          dangerouslySetInnerHTML={{ __html: content }} />
        : <div className={readerViewStyle}>Loading...</div>}
    </main>
  )
}

const readerViewStyle = "content lg:w-2/3 lg:pl-30 lg:pb-60 lg:pt-5 pl-8 pr-8 w-lvw pb-32 pt-2"