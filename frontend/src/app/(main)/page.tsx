import AnimatedBlocks from "@/components/animated_blocks";

export default function Home() {
  return (
    <main
      id="home-container"
      className="relative bg-gradient-to-b from-primary to-accent h-full w-full overflow-hidden wrap-normal">
      <div className="absolute float-right h-full w-full opacity-30" style={{
        backgroundImage: 'url(/bg.png)',
        backgroundSize: 'cover',
      }} />
      <AnimatedBlocks />
      <div className="absolute h-full w-full flex flex-col justify-center lg:pl-32 pl-4 text-white">
        <text className="text-2xl mb-4 text-primary">Welcome to</text>
        <header className="bg-accent overflow-hidden text-8xl w-fit">Dexer</header>
        <header className="text-primary overflow-hidden text-8xl mt-[-30px] w-fit">Matters</header>
        <header className="bg-primary overflow-hidden text-7xl mt-1 mb-8 pb-4 pr-2 w-fit italic">Blog</header>
      </div>
    </main>
  );
}