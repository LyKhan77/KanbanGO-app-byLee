import { useState, useCallback } from 'react'
import { ChevronRight, ChevronLeft, RotateCcw, CheckSquare, Square, Volume2 } from 'lucide-react'
import { playTactileClick, playMoveCard, playChime } from '../utils/audio'

interface DemoCard {
  id: string
  title: string
  cover: string
  subtasks: { label: string; done: boolean }[]
}

interface DemoColumn {
  id: string
  title: string
  cards: DemoCard[]
}

const initialColumns: DemoColumn[] = [
  {
    id: 'explore',
    title: '🌱 Eksplorasi Ide',
    cards: [
      {
        id: 'c1',
        title: 'Riset palet warna earthy',
        cover: 'bg-terracotta/20',
        subtasks: [
          { label: 'Cari referensi warna', done: true },
          { label: 'Buat moodboard', done: false }
        ]
      },
      {
        id: 'c2',
        title: 'Desain wireframe halaman',
        cover: 'bg-sage/20',
        subtasks: [{ label: 'Sketsa layout mobile', done: false }]
      }
    ]
  },
  {
    id: 'progress',
    title: '⚡ Sedang Dikerjakan',
    cards: [
      {
        id: 'c3',
        title: 'Integrasi Web Audio API',
        cover: 'bg-amber-500/20',
        subtasks: [
          { label: 'Implementasi oscillator', done: true },
          { label: 'Tulis unit test', done: true },
          { label: 'Optimasi latensi', done: false }
        ]
      }
    ]
  },
  {
    id: 'done',
    title: '✨ Selesai',
    cards: [
      {
        id: 'c4',
        title: 'Setup proyek Vite + React',
        cover: 'bg-boho-walnut/10',
        subtasks: [
          { label: 'Konfigurasi TypeScript', done: true },
          { label: 'Pasang Tailwind CSS', done: true }
        ]
      }
    ]
  }
]

function deepCloneColumns(cols: DemoColumn[]): DemoColumn[] {
  return cols.map((col) => ({
    ...col,
    cards: col.cards.map((card) => ({
      ...card,
      subtasks: card.subtasks.map((st) => ({ ...st }))
    }))
  }))
}

export default function InteractiveDemo() {
  const [columns, setColumns] = useState<DemoColumn[]>(() => deepCloneColumns(initialColumns))

  const moveCard = useCallback(
    (cardId: string, direction: 'left' | 'right') => {
      setColumns((prev) => {
        const cols = deepCloneColumns(prev)
        const fromIdx = cols.findIndex((col) => col.cards.some((c) => c.id === cardId))
        if (fromIdx === -1) return prev

        const toIdx = direction === 'right' ? fromIdx + 1 : fromIdx - 1
        if (toIdx < 0 || toIdx >= cols.length) return prev

        const cardIdx = cols[fromIdx].cards.findIndex((c) => c.id === cardId)
        const [card] = cols[fromIdx].cards.splice(cardIdx, 1)
        cols[toIdx].cards.push(card)

        // Play audio based on destination
        if (cols[toIdx].id === 'done') {
          playChime()
        } else {
          playMoveCard()
        }

        return cols
      })
    },
    []
  )

  const toggleSubtask = useCallback(
    (cardId: string, subtaskIdx: number) => {
      setColumns((prev) => {
        const cols = deepCloneColumns(prev)
        for (const col of cols) {
          const card = col.cards.find((c) => c.id === cardId)
          if (card) {
            card.subtasks[subtaskIdx].done = !card.subtasks[subtaskIdx].done
            playTactileClick()
            break
          }
        }
        return cols
      })
    },
    []
  )

  const resetDemo = useCallback(() => {
    setColumns(deepCloneColumns(initialColumns))
    playTactileClick()
  }, [])

  return (
    <section id="demo" className="bg-boho-linen py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-boho-espresso">
            Coba Demo Interaktif
          </h2>
          <p className="mt-4 text-lg text-boho-walnut max-w-2xl mx-auto">
            Pindahkan kartu antar kolom dan centang tugas — rasakan langsung pengalaman taktil KanbanGO! di browser Anda.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-boho-walnut/60">
            <Volume2 className="w-4 h-4" />
            <span>Aktifkan suara untuk pengalaman penuh</span>
          </div>
        </div>

        {/* Mini Board */}
        <div className="bg-boho-sand rounded-2xl border border-boho-canvas p-4 sm:p-6 shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {columns.map((col, colIdx) => (
              <div key={col.id} className="bg-white/60 rounded-xl p-3 min-h-[200px]">
                <h3 className="text-sm font-semibold text-boho-espresso mb-3 px-1">
                  {col.title}
                  <span className="ml-2 text-xs font-normal text-boho-walnut/50">
                    {col.cards.length}
                  </span>
                </h3>

                <div className="space-y-3">
                  {col.cards.map((card) => {
                    const doneCount = card.subtasks.filter((s) => s.done).length
                    const totalCount = card.subtasks.length
                    const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0

                    return (
                      <div
                        key={card.id}
                        className="bg-white rounded-lg border border-boho-canvas shadow-sm hover:shadow-md transition-shadow"
                      >
                        {/* Card Cover */}
                        <div className={`h-2 rounded-t-lg ${card.cover}`} />

                        <div className="p-3">
                          <p className="text-sm font-medium text-boho-espresso mb-2">
                            {card.title}
                          </p>

                          {/* Subtasks */}
                          <div className="space-y-1.5 mb-3">
                            {card.subtasks.map((st, stIdx) => (
                              <button
                                key={stIdx}
                                onClick={() => toggleSubtask(card.id, stIdx)}
                                className="flex items-center gap-2 text-xs text-boho-walnut hover:text-boho-espresso w-full text-left group"
                              >
                                {st.done ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-sage flex-shrink-0" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-boho-canvas group-hover:text-boho-walnut flex-shrink-0" />
                                )}
                                <span className={st.done ? 'line-through text-boho-walnut/40' : ''}>
                                  {st.label}
                                </span>
                              </button>
                            ))}
                          </div>

                          {/* Progress Bar */}
                          {totalCount > 0 && (
                            <div className="w-full bg-boho-canvas/50 rounded-full h-1.5 mb-3">
                              <div
                                className="bg-sage h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          )}

                          {/* Move Buttons */}
                          <div className="flex gap-1.5">
                            {colIdx > 0 && (
                              <button
                                onClick={() => moveCard(card.id, 'left')}
                                className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium text-boho-walnut bg-boho-sand/50 rounded-md hover:bg-boho-sand transition-colors"
                                title="Pindah ke kiri"
                              >
                                <ChevronLeft className="w-3 h-3" />
                                Kiri
                              </button>
                            )}
                            {colIdx < columns.length - 1 && (
                              <button
                                onClick={() => moveCard(card.id, 'right')}
                                className="flex-1 inline-flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium text-white bg-terracotta rounded-md hover:bg-terracotta-dark transition-colors"
                                title="Pindah ke kanan"
                              >
                                Kanan
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {col.cards.length === 0 && (
                    <div className="flex items-center justify-center h-24 text-sm text-boho-walnut/30 italic">
                      Kolom kosong
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Reset Button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={resetDemo}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-boho-walnut bg-white border border-boho-canvas rounded-lg hover:bg-boho-sand transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
