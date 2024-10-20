import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
// import Brands from "@/components/Brands";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Next.js Template for Startup and SaaS",
  description: "This is Home for Startup Nextjs Template",
  // other metadata
};

export default function Home() {
  return (

    <div className="w-full bg-background  flex flex-col items-center">

      <ScrollUp />
      <Hero />
      <AboutSectionOne />
      <Features />
      {/* <Brands /> */}
      
      <AboutSectionTwo />
      <Testimonials />
      <Pricing />
      <Contact />

    </div>
  );
}
