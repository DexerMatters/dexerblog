'use client'

import { useRouter } from "next/navigation";
import { motion } from "motion/react"
import { useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/notes", label: "Notes" },
  { href: "/extra", label: "Extra" },
  { href: "/works", label: "Works" },
  { href: "/about", label: "About" },
]

export default function TopNav() {
  const router = useRouter();
  const style_active = "text-foreground";
  const style_inactive = "text-white hover:bg-primary-lighter transition";
  const [active, setActive] = useState(navItems[0]);

  const onClick = (href: string, label: string) => {
    setActive({ href, label });
    router.push(href);
  };

  return (
    <ul className="flex flex-row items-center">
      {navItems.map(({ href, label }) => (
        <motion.li key={href} onClick={() => onClick(href, label)} className={
          `relative p-1 text-center w-64
          ${active.href == href ? style_active : style_inactive}`
        }>
          {
            active.href == href ? (
              <motion.div
                id="active-link"
                className="absolute bg-background z-10 left-0 top-0 inset-0"
                layoutId="active-link" />
            ) : null
          }
          <div className="relative z-20 cursor-pointer">
            {label}
          </div>
        </motion.li>
      ))}
    </ul>
  );
}

