'use client'

import TopNav from "@/components/top_nav";
import Image from "next/image";
import { createContext, Dispatch, SetStateAction, useState } from "react";
import { motion } from "motion/react";


export const HeaderContext
  = createContext<Dispatch<SetStateAction<boolean>>>((_b) => { });

export default function Menu({ children }: Readonly<{ children: React.ReactNode }>) {
  const [headerVisible, setHeaderVisible] = useState(true);
  return (
    <HeaderContext.Provider value={setHeaderVisible}>
      <div className="flex flex-col w-lvw h-lvh items-stretch overflow-hidden">
        {/* Header */}
        <header className="flex flex-col items-stretch text-white">
          <motion.div className="overflow-hidden bg-primary" animate={{ height: headerVisible ? '64px' : '0px' }}>
            <Image priority
              className="block mx-6 mb-2 pt-4 w-[200px] h-auto"
              src="/logo.svg"
              alt="Dexer Matters Logo"
              width={200}
              height={20} />
          </motion.div>
          <TopNav />
        </header>
        {/* Main Content */}
        {children}
      </div>
    </HeaderContext.Provider>
  )
}