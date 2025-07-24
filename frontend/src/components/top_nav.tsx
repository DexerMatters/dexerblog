'use client'

import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useContext, useEffect, useState } from "react";
import { HeaderContext } from "@/app/menu";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/Notes", label: "Notes" },
  { href: "/Extra", label: "Extra" },
  { href: "/Works", label: "Works" },
  { href: "/About", label: "About" },
]

export default function TopNav() {
  const router = useRouter();
  const currentPath = usePathname().split('/').slice(0, 2).join('/');
  const style_active = "text-foreground";
  const style_inactive = "text-white hover:bg-primary-lighter transition";
  const [active, setActive] = useState(navItems[0]);
  const setHeaderVisible = useContext(HeaderContext);

  const onClick = (href: string, label: string) => {
    setActive({ href, label });
    router.push(href);
    setHeaderVisible(true);
  };

  useEffect(() => {
    navItems.filter(item => item.href === currentPath).forEach(item => {
      setActive(item);
    });
  }, [currentPath]);

  return (
    <ul className="bg-primary flex flex-row items-center text-lg">
      {navItems.map(({ href, label }) => (
        <motion.li id={`nav-item-${label}`} key={href} onClick={() => onClick(href, label)} className={
          `relative p-1 text-center lg:w-64 w-1/6
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
          <div className="relative z-20 lg:w-64 w-full cursor-pointer">
            {label}
          </div>
        </motion.li>
      ))}
    </ul>
  );
}

