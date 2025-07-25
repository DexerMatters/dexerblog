'use client';

import SideNav from "@/components/side_nav";
import { Dispatch, SetStateAction, useState } from "react";
import { createContext } from 'react';
import { motion } from "motion/react";


export const SidebarContext = createContext<Dispatch<SetStateAction<boolean>>>((_b) => { });

export default function SideBarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  return (
    <div className="flex flex-1 flex-row items-stretch h-full">
      {/* Sidebar */}
      <motion.div
        className=" 
      bg-secondary
      scrollbar-thin 
      scrollbar-thumb-[#00000000]
      scrollbar-corner-gray-950 
      scrollbar-track-transparent
      overflow-x-hidden 
      overflow-y-scroll"
        animate={{ width: sidebarVisible ? 'calc(var(--spacing) * 64)' : '0px' }}>
        <SideNav
          handler={setSidebarVisible}
          className="ml-auto mr-0 flex flex-col items-stretch w-64 p-4"
        />
      </motion.div>
      {/* Content Area */}
      <div className="flex-1 h-full overflow-x-hidden shadow-lg">
        <SidebarContext.Provider value={setSidebarVisible}>
          {children}
        </SidebarContext.Provider>
      </div>
    </div>
  )
}
