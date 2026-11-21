import { Hero } from "./sections/Hero";
import { Journey } from "./sections/Journey";
import { Services } from "./sections/Services";
import { Companies } from "./sections/Companies";
import { Gallery } from "./sections/Gallery";
import { PipelineDivider } from "./components/PipelineDivider";
import { Awards } from "./sections/Awards";
import { Contact } from "./sections/Contact";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <PipelineDivider label={'6"-P-1001-A1'} />
        <Services />
        <PipelineDivider label={'8"-HC-2014-B2'} />
        <Journey />
        <PipelineDivider label={'4"-FW-1998-C1'} />
        <Gallery />
        <Companies />
        <Awards />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
