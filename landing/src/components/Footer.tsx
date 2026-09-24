import { Github, Heart } from 'lucide-react'

const GITHUB_URL = 'https://github.com/LyKhan77/KanbanGO-app-byLee'

const footerLinks = [
  { label: 'Fitur', href: '#features' },
  { label: 'Demo', href: '#demo' },
  { label: 'Keunggulan', href: '#pillars' },
  { label: 'Unduh', href: '#download' }
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-boho-espresso text-boho-linen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img src="/icon.png" alt="KanbanGO! Logo" className="w-8 h-8 rounded-md" />
            <div>
              <span className="text-lg font-serif font-bold">KanbanGO!</span>
              <span className="ml-2 text-xs text-boho-linen/50 font-mono">v1.0.3</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-boho-linen/60 hover:text-boho-linen transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* GitHub */}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-boho-linen/60 hover:text-boho-linen transition-colors"
          >
            <Github className="w-4 h-4" />
            Source Code
          </a>
        </div>

        <hr className="my-8 border-boho-linen/10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-boho-linen/40">
          <p>&copy; {currentYear} KanbanGO! &mdash; Offline-First Bohemian Desktop Kanban</p>
          <p className="inline-flex items-center gap-1">
            Dibuat dengan <Heart className="w-3 h-3 text-terracotta" /> untuk produktivitas yang menenangkan
          </p>
        </div>
      </div>
    </footer>
  )
}
