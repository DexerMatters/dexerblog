import Image from "next/image";

export default function Home() {
  return (
    <main>
      <div className="flex flex-col w-lvw h-lvh items-stretch">
        {/* Header */}
        <header className="flex items-center bg-primary text-white p-4">
          <text className="text-2xl">dexer-matte.rs</text>
        </header>
        {/* Main Content */}
        <div className="flex flex-1 flex-row items-stretch">
          {/* Sidebar */}
          <nav className="flex-col w-64 bg-primary p-4">
            ss
          </nav>
          {/* Content Area */}
          <div className="flex-1 p-4">
            <h1 className="text-3xl font-bold mb-4">Welcome to dexer-matte.rs</h1>
            <p className="text-lg">
              This is a place where Dexer shares running ideas and experiences.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
