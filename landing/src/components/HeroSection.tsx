import { Download, Play } from 'lucide-react'
import { detectCurrentOS } from '../utils/osDetector'

const RELEASE_BASE = 'https://github.com/LyKhan77/KanbanGO-app-byLee/releases/download/v1.0.3'

const downloadLinks = {
  windows: {
    label: 'Unduh untuk Windows (.exe)',
    url: `${RELEASE_BASE}/KanbanGO-Setup-1.0.3.exe`
  },
  macos: {
    label: 'Unduh untuk macOS (.dmg)',
    url: `${RELEASE_BASE}/KanbanGO-1.0.3-mac.dmg`
  },
  linux: {
    label: 'Unduh untuk Linux (.AppImage)',
    url: `${RELEASE_BASE}/KanbanGO-1.0.3-linux.AppImage`
  },
  unknown: {
    label: 'Unduh KanbanGO!',
    url: 'https://github.com/LyKhan77/KanbanGO-app-byLee/releases/tag/v1.0.3'
  }
}

export default function HeroSection() {
  const os = detectCurrentOS()
  const download = downloadLinks[os]

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-boho-linen to-boho-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-boho-espresso leading-tight">
              Produktivitas yang{' '}
              <span className="text-terracotta">Menenangkan</span>,{' '}
              Kendali Penuh di Tangan Anda.
            </h1>

            <p className="mt-6 text-lg text-boho-walnut leading-relaxed max-w-xl mx-auto lg:mx-0">
              Aplikasi Kanban desktop offline-first dengan estetika Bohemian Modern,
              tanpa biaya langganan cloud, dan data 100% tersimpan aman di perangkat lokal Anda.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href={download.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-terracotta rounded-xl hover:bg-terracotta-dark transition-colors shadow-lg shadow-terracotta/20"
              >
                <Download className="w-5 h-5" />
                {download.label}
              </a>

              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-boho-walnut bg-white/70 border border-boho-canvas rounded-xl hover:bg-white transition-colors"
              >
                <Play className="w-5 h-5" />
                Coba Demo Interaktif
              </a>
            </div>

            <p className="mt-4 text-sm text-boho-walnut/60">
              Tersedia untuk Windows, macOS, dan Linux &mdash; Gratis &amp; Open Source
            </p>
          </div>

          {/* Hero Preview Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-boho-canvas/50 bg-boho-sand">
              <img
                src="/screenshots/1_real_kanban_board.png"
                alt="KanbanGO! Board View — Multi-Board Tab Kanban dengan estetika Bohemian Modern"
                className="w-full h-auto"
                loading="eager"
              />
            </div>
            {/* Decorative glow */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-terracotta/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
