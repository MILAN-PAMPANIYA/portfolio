import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Record } from "@/components/record";
import { Stack } from "@/components/stack";
import { Work } from "@/components/work";

export default function HomePage() {
  return (
    <>
      <a className="skip" href="#work">
        Skip to work
      </a>
      <Header />
      <main id="top">
        <Hero />
        <Work />
        <Stack />
        <Record />
        <About />
        <Contact />
      </main>
    </>
  );
}
