import { Wifi, Palette, Zap, Shield } from 'lucide-react'

const pillars = [
  {
    icon: Wifi,
    title: '100% Offline-First & Bebas Langganan Cloud',
    description:
      'Tidak ada biaya bulanan, tidak membutuhkan akun, dan tidak bergantung pada koneksi internet. Data Anda, aturan Anda.',
    color: 'bg-sage/10 text-sage border-sage/20'
  },
  {
    icon: Palette,
    title: 'Estetika Bohemian Modern yang Menenangkan',
    description:
      'Palet earthy hangat terkalibrasi untuk mengurangi kelelahan mata dan kecemasan kerja. Produktivitas tanpa tekanan visual.',
    color: 'bg-terracotta/10 text-terracotta border-terracotta/20'
  },
  {
    icon: Zap,
    title: 'Super Ringan & Bebas Dependensi Berat',
    description:
      'Audio prosedural Web Audio API murni, parser markdown native, tanpa pustaka berat eksternal. Hemat memori RAM.',
    color: 'bg-amber-500/10 text-amber-700 border-amber-500/20'
  },
  {
    icon: Shield,
    title: 'Privasi Mutlak & Cadangan Mandiri',
    description:
      'Data tersimpan di IndexedDB lokal perangkat Anda dengan fitur ekspor/impor JSON terenkapsulasi. Tanpa pelacak.',
    color: 'bg-boho-walnut/10 text-boho-walnut border-boho-walnut/20'
  }
]

export default function ValuePillars() {
  return (
    <section id="pillars" className="bg-boho-linen py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-boho-espresso">
            Mengapa KanbanGO!?
          </h2>
          <p className="mt-4 text-lg text-boho-walnut max-w-2xl mx-auto">
            Empat pilar keunggulan yang membedakan KanbanGO! dari aplikasi produktivitas korporat konvensional.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className="group p-6 rounded-2xl bg-white border border-boho-canvas hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border ${pillar.color} mb-4`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-boho-espresso mb-2 leading-snug">
                  {pillar.title}
                </h3>
                <p className="text-sm text-boho-walnut leading-relaxed">{pillar.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
