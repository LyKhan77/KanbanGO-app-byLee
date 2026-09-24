import { useState } from 'react'
import { Menu, X, Github, Download } from 'lucide-react'

const navLinks = [
  { label: 'Fitur', href: '#features' },
  { label: 'Coba Demo', href: '#demo' },
  { label: 'Keunggulan', href: '#pillars' },
  { label: 'Unduh', href: '#download' }
]

const GITHUB_URL = 'https://github.com/LyKhan77/KanbanGO-app-byLee'
const RELEASE_URL = 'https://github.com/LyKhan77/KanbanGO-app-byLee/releases/tag/v1.0.3'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-boho-linen/90 backdrop-blur-md border-b border-boho-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <a href="#" className="flex items-center gap-2 group">
            <img src="/icon.png" alt="KanbanGO! Logo" className="w-8 h-8 rounded-md" />
            <span className="text-xl font-serif font-bold text-boho-espresso group-hover:text-terracotta transition-colors">
              KanbanGO!
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-boho-walnut hover:text-terracotta transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-boho-walnut border border-boho-canvas rounded-lg hover:bg-boho-sand transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <a
              href={RELEASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white bg-terracotta rounded-lg hover:bg-terracotta-dark transition-colors"
            >
              <Download className="w-4 h-4" />
              Unduh v1.0.3
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-boho-walnut hover:text-terracotta transition-colors"
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-boho-linen border-t border-boho-canvas">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-boho-walnut hover:text-terracotta transition-colors"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-boho-canvas" />
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-boho-walnut hover:text-terracotta"
            >
              <Github className="w-4 h-4" />
              GitHub Repository
            </a>
            <a
              href={RELEASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-terracotta rounded-lg hover:bg-terracotta-dark w-full justify-center"
            >
              <Download className="w-4 h-4" />
              Unduh v1.0.3
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
