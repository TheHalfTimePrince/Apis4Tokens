import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <>
      <section
        id="home"
        className="w-full z-0 flex flex-col items-center relative  overflow-hidden bg-white pb-16 pt-[120px] dark:bg-gray-dark md:pb-[120px] md:pt-[150px] xl:pb-[160px] xl:pt-[180px] 2xl:pb-[200px] 2xl:pt-[210px]"
      >
        <div className="inset-0 absolute z-0">
          <Image src="/images/colors-1.jpg" alt="hero image" fill />
          <div className="absolute inset-0 bg-white/60 dark:bg-black/90  mix-blend-overlay  z-[1]"></div>
          <div
            className="w-full h-full absolute inset-0 mix-blend-difference z-[1]"
            style={{
              background: ` url(/grain.svg)`,
              opacity: 0.2,
            }}
          ></div>
        </div>
        <div className="container z-[2]">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-16 md:px-4">
              <div className="mx-auto max-w-[800px] text-center">
                <h1 className="mb-5 text-3xl font-bold leading-tight text-black  sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
                Tokens4Api's for Developers, Built to Scale 🚀
                </h1>
                <p className="mb-12 text-base !leading-relaxed text-neutral-900  sm:text-lg md:text-xl">
                Tokens4Api's provides powerful endpoints like QR code generation and more. Pay for tokens, with each request costing tokens per use. Simplify your developer workflow with our scalable solutions.
                </p>
                <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                  <Link
                    href="/pricing"
                    className="rounded-sm shadow-md bg-primary px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out hover:bg-primary/80"
                  >
                    🔥 Get Started
                  </Link>
                  <Link
                    href="https://github.com/TheHalfTimePrince/easy-apis/stargazers"
                    className="inline-block rounded-sm shadow-sm bg-black dark:text-background dark:bg-black/50 px-8 py-4 text-base font-semibold text-white duration-300 ease-in-out dark:hover:bg-black/40  dark:text-white hover:bg-black/90"
                  >
                    Star on GitHub
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
