import { useLayoutEffect } from 'react';
import { Nav } from './components/Nav';
import { Backdrop } from './components/Backdrop';
import { MachinePoster } from './components/MachinePoster';
import { Footer } from './components/Footer';
import { StageLoader } from './three/StageLoader';
import { Hero } from './sections/Hero';
import { Problem } from './sections/Problem';
import { Finishes } from './sections/Finishes';
import { Cycle } from './sections/Cycle';
import { Specs } from './sections/Specs';
import { Lab } from './sections/Lab';
import { Placements } from './sections/Placements';
import { Company } from './sections/Company';
import { Demo } from './sections/Demo';
import { StageProvider } from './state/stage';
import { LocaleProvider } from './state/locale';
import { installAnchorNav } from './lib/anchors';

export default function App() {
  useLayoutEffect(() => installAnchorNav(), []);

  return (
    <LocaleProvider>
      <StageProvider>
        <Nav />
        {/* Ink field beneath the canvas; see Backdrop for the page's stacking order. */}
        <Backdrop />
        {/* Permanent stand-in only where 3D cannot run. Not shown while the model loads. */}
        <MachinePoster />
        {/* One WebGL context for the whole page, borrowed by the hero and the cycle. */}
        <StageLoader />
        <main>
          <Hero />
          <Finishes />
          <Cycle />
          <Problem />
          <Specs />
          <Lab />
          <Placements />
          <Company />
          <Demo />
        </main>
        <Footer />
      </StageProvider>
    </LocaleProvider>
  );
}
