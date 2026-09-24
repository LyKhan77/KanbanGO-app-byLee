import { Layers, Calendar, FileText, Search, UserCheck } from 'lucide-react'

const features = [
  {
    icon: Layers,
    title: 'Multi-Board Tab Vault dengan DnD',
    description:
      'Kelola banyak proyek dalam satu jendela dengan navigasi tab dinamis di header. Atur ulang urutan tab dengan drag-and-drop.',
    screenshot: '/screenshots/1_real_kanban_board.png',
    alt: 'KanbanGO! Multi-Board Tab View'
  },
  {
    icon: Calendar,
    title: 'Tampilan Kalender Bulanan Terpadu',
    description:
      'Beralih instan antara Kanban Board dan Monthly Calendar untuk melacak tenggat waktu visual dengan badge interaktif.',
    screenshot: '/screenshots/3_real_calendar_view.png',
    alt: 'KanbanGO! Calendar View'
  },
  {
    icon: FileText,
    title: 'Detail Kartu Komprehensif',
    description:
      'Markdown live preview, checklist bersarang dengan bilah progres, dan 6 pilihan cover bernuansa alam yang indah.',
    screenshot: '/screenshots/2_real_card_detail_modal.png',
    alt: 'KanbanGO! Card Detail Modal'
  },
  {
    icon: Search,
    title: 'Bohemian Command Palette',
    description:
      'Pencarian tugas fuzzy super cepat dan navigasi keyboard menyeluruh dengan Ctrl+K / Cmd+K.',
    screenshot: '/screenshots/4_real_command_palette.png',
    alt: 'KanbanGO! Command Palette'
  },
  {
    icon: UserCheck,
    title: 'Hardcore Daily Coach & Persona Widget',
    description:
      'Briefing harian otomatis dan dorongan motivasi terukur. Personalisasi profil produktivitas Anda.',
    screenshot: '/screenshots/5_real_profile_modal.png',
    alt: 'KanbanGO! Profile & Persona Widget'
  }
]

export default function FeatureShowcase() {
  return (
    <section id="features" className="bg-boho-sand py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-boho-espresso">
            Fitur Unggulan
          </h2>
          <p className="mt-4 text-lg text-boho-walnut max-w-2xl mx-auto">
            Dirancang khusus untuk produktivitas penuh — setiap fitur dibangun dengan perhatian terhadap detail dan kenyamanan pengguna.
          </p>
        </div>

        <div className="space-y-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isEven = index % 2 === 0

            return (
              <div
                key={feature.title}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-12 items-center`}
              >
                {/* Screenshot */}
                <div className="lg:w-1/2">
                  <div className="rounded-2xl overflow-hidden shadow-xl border border-boho-canvas/50 bg-white">
                    <img
                      src={feature.screenshot}
                      alt={feature.alt}
                      className="w-full h-auto"
                    />
                  </div>
                </div>

                {/* Text */}
                <div className="lg:w-1/2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-terracotta/10 text-terracotta border border-terracotta/20 mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-boho-espresso mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-base text-boho-walnut leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
