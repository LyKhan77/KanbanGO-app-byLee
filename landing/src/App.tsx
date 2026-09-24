import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import ValuePillars from './components/ValuePillars'
import InteractiveDemo from './components/InteractiveDemo'
import FeatureShowcase from './components/FeatureShowcase'
import DownloadCenter from './components/DownloadCenter'
import OpenSourcePledge from './components/OpenSourcePledge'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-boho-linen flex flex-col selection:bg-terracotta selection:text-white">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ValuePillars />
        <InteractiveDemo />
        <FeatureShowcase />
        <DownloadCenter />
        <OpenSourcePledge />
      </main>
      <Footer />
    </div>
  )
}

export default App
