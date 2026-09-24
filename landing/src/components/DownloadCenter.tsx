import { useState } from 'react'
import { Monitor, Apple, Terminal, Download, ChevronDown, ChevronUp, Copy, Check, ExternalLink } from 'lucide-react'

const RELEASE_BASE = 'https://github.com/LyKhan77/KanbanGO-app-byLee/releases/download/v1.0.3'

const gatekeeperCmd = `sudo xattr -rd com.apple.quarantine /Applications/KanbanGO\\!.app && sudo codesign --force --deep --sign - /Applications/KanbanGO\\!.app`

const platforms = [
  {
    id: 'windows',
    icon: Monitor,
    name: 'Windows',
    primary: {
      label: 'KanbanGO-Setup-1.0.3.exe',
      sublabel: 'Installer NSIS',
      url: `${RELEASE_BASE}/KanbanGO-Setup-1.0.3.exe`
    },
    secondary: {
      label: 'KanbanGO-1.0.3.exe',
      sublabel: 'Portable (tanpa instalasi)',
      url: `${RELEASE_BASE}/KanbanGO-1.0.3.exe`
    }
  },
  {
    id: 'macos',
    icon: Apple,
    name: 'macOS',
    primary: {
      label: 'KanbanGO-1.0.3-mac.dmg',
      sublabel: 'Apple Disk Image',
      url: `${RELEASE_BASE}/KanbanGO-1.0.3-mac.dmg`
    },
    secondary: {
      label: 'KanbanGO-1.0.3-mac.zip',
      sublabel: 'Arsip ZIP',
      url: `${RELEASE_BASE}/KanbanGO-1.0.3-mac.zip`
    },
    hasGatekeeper: true
  },
  {
    id: 'linux',
    icon: Terminal,
    name: 'Linux',
    primary: {
      label: 'KanbanGO-1.0.3-linux.AppImage',
      sublabel: 'Universal AppImage',
      url: `${RELEASE_BASE}/KanbanGO-1.0.3-linux.AppImage`
    },
    secondary: {
      label: 'KanbanGO-1.0.3-linux.deb',
      sublabel: 'Debian / Ubuntu',
      url: `${RELEASE_BASE}/KanbanGO-1.0.3-linux.deb`
    }
  }
]

export default function DownloadCenter() {
  const [gatekeeperOpen, setGatekeeperOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gatekeeperCmd)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <section id="download" className="bg-boho-sand py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-boho-espresso">
            Pusat Unduhan Resmi
          </h2>
          <p className="mt-4 text-lg text-boho-walnut max-w-2xl mx-auto">
            Unduh KanbanGO! versi 1.0.3 untuk sistem operasi Anda. Gratis, open source, tanpa batasan.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {platforms.map((platform) => {
            const Icon = platform.icon
            return (
              <div
                key={platform.id}
                className="bg-white rounded-2xl border border-boho-canvas p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-boho-espresso">{platform.name}</h3>
                </div>

                {/* Primary Download */}
                <a
                  href={platform.primary.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-white bg-terracotta rounded-xl hover:bg-terracotta-dark transition-colors mb-3"
                >
                  <Download className="w-4 h-4 flex-shrink-0" />
                  <div className="text-left">
                    <div>{platform.primary.label}</div>
                    <div className="text-xs font-normal text-white/70">{platform.primary.sublabel}</div>
                  </div>
                </a>

                {/* Secondary Download */}
                <a
                  href={platform.secondary.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-boho-walnut bg-boho-sand/50 border border-boho-canvas rounded-xl hover:bg-boho-sand transition-colors"
                >
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  <div className="text-left">
                    <div>{platform.secondary.label}</div>
                    <div className="text-xs text-boho-walnut/50">{platform.secondary.sublabel}</div>
                  </div>
                </a>

                {/* macOS Gatekeeper Accordion */}
                {platform.hasGatekeeper && (
                  <div className="mt-4">
                    <button
                      onClick={() => setGatekeeperOpen(!gatekeeperOpen)}
                      className="flex items-center gap-2 text-xs font-medium text-boho-walnut/70 hover:text-terracotta transition-colors w-full"
                    >
                      {gatekeeperOpen ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                      Panduan Verifikasi macOS Gatekeeper
                    </button>

                    {gatekeeperOpen && (
                      <div className="mt-3 p-3 bg-boho-sand/30 rounded-lg border border-boho-canvas text-xs">
                        <p className="text-boho-walnut mb-2">
                          macOS mungkin memblokir aplikasi yang tidak bertanda tangan sertifikat Apple Developer ID.
                          Jalankan perintah berikut di Terminal setelah memasang aplikasi:
                        </p>
                        <div className="relative">
                          <pre className="bg-boho-espresso text-boho-linen p-3 rounded-md overflow-x-auto text-[11px] leading-relaxed">
                            {gatekeeperCmd}
                          </pre>
                          <button
                            onClick={handleCopy}
                            className="absolute top-2 right-2 p-1 text-boho-linen/50 hover:text-boho-linen transition-colors"
                            title="Salin perintah"
                          >
                            {copied ? (
                              <Check className="w-3.5 h-3.5 text-sage" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
