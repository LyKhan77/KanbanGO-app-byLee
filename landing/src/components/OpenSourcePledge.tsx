import { ShieldCheck, Eye, Lock } from 'lucide-react'

const pledges = [
  {
    icon: ShieldCheck,
    title: 'Zero Analytics',
    description: 'Tidak ada Google Analytics, tidak ada pelacak pihak ketiga. Aktivitas Anda tidak pernah direkam.'
  },
  {
    icon: Eye,
    title: 'Zero Telemetry',
    description: 'Tidak ada data penggunaan yang dikirim ke server mana pun. Aplikasi berjalan 100% di perangkat lokal.'
  },
  {
    icon: Lock,
    title: 'Zero Cookies',
    description: 'Tidak ada cookie, tidak ada fingerprinting. Privasi Anda adalah prioritas mutlak kami.'
  }
]

export default function OpenSourcePledge() {
  return (
    <section className="bg-boho-linen py-20 lg:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-boho-espresso mb-4">
          Komitmen Privasi & Open Source
        </h2>
        <p className="text-lg text-boho-walnut max-w-2xl mx-auto mb-12">
          KanbanGO! dibangun dengan prinsip transparansi penuh. Kode sumber terbuka di GitHub,
          bebas diaudit oleh siapa saja, dan tidak pernah mengumpulkan data pengguna.
        </p>

        <div className="grid sm:grid-cols-3 gap-6">
          {pledges.map((pledge) => {
            const Icon = pledge.icon
            return (
              <div
                key={pledge.title}
                className="p-6 rounded-2xl bg-white border border-boho-canvas"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sage/10 text-sage border border-sage/20 mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-boho-espresso mb-2">{pledge.title}</h3>
                <p className="text-sm text-boho-walnut leading-relaxed">{pledge.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
