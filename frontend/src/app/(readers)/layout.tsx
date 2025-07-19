import SideNav from "@/components/side_nav";

export default function SideBarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 flex-row items-stretch animate-slide">
      {/* Sidebar */}
      <nav className="flex-col w-64 bg-primary p-4">
        <SideNav />
      </nav>
      {/* Content Area */}
      <div className="flex-1 p-4">
        {children}
      </div>
    </div>
  )
}