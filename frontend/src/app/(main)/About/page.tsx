import AnimatedBlocks from "@/components/animated-blocks";
import "./page.css";

export default function AboutPage() {
  return (
    <main
      id="home-container"
      className="
      about-page 
      relative 
      bg-primary
      h-full w-full 
      overflow-hidden
      wrap-normal">
      <AnimatedBlocks straight={true} className="z-20" />
      <div className="
        pointer-events-none absolute float-right h-full w-full z-10
        bg-gradient-to-b from-transparent via-transparent to-accent opacity-50" />
      <div className="
        relative h-4/5 lg:w-1/2 lg:pr-0 pr-4 flex flex-col ml-[20%] pl-12 mt-12 z-0 pb-44
        overflow-y-scroll! overflow-x-hidden 
        scrollbar-thin
        scrollbar-track-[#00000000]
        scrollbar-thumb-[#00000000]
      ">
        <h1>About the website</h1>
        <p>
          {
            `I, Dexer Matters, had to preserve his knowledge and experience in a remarkable, unparalleled, unsurpassed, and exceptional way.
            Thus, I created this blog website to record my notes, pieces, and thoughts on various topics although this may not be a 
            remarkable, unparalleled, unsurpassed, and exceptional way to do so.
            `
          }
        </p>
        <p>
          {
            `Actually, it's the second time I've attempted to create a blog website for myself. This time I want to create a full-stack,
            maintainable, scalable and robust application not only for me but everyone who wants to share something.
            `
          }
        </p>
        <h1>About me</h1>
        <p>
          {
            `I am a Chinese student, currently studying in an university in China. I am a humble doorman at the gate of 
            Temple of Apollo, peeping at the iceberg of knowledge. The shine it gives arouses my curiosity and passion all
            the time. Then I have been studying front-end and back-end development, compilers, the programming language theory, 
            and many other things, and implementing theoretical concepts in the paper into practical applications.
            `
          }
        </p>
        <h1>Contact me</h1>
        <p>
          <pre>Email:    dexermatters@gmail.com</pre>
          <pre>Discord:  <a href="https://discord.com/users/dexer_matters">@dexer_matters</a></pre>
          <pre>Twitter:  <a href="https://x.com/dexer_matters">@dexer_matters</a></pre>
          <pre>Telegram: <a href="https://t.me/dxrmttrs">@dxrmttrs</a></pre>
          <pre>GitHub:   <a href="https://github.com/dexermatters">@DexerMatters</a></pre>
        </p>
      </div>
    </main>
  )
}