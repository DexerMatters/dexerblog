'use client';

import Link from "next/link";

interface Document {
  url: string;
  author: string;

}

export default function SideNav() {
  return (
    <nav className="flex flex-col items-stretch">
      <Link href="/about" className="p-2 text-left hover:underline">About</Link>
      <Link href="/contact" className="p-2 text-left hover:underline">Contact</Link>
    </nav>
  )
}