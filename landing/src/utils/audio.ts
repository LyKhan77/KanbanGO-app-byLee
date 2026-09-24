/**
 * Synthesizer audio prosedural Web Audio API untuk efek suara taktil.
 * Tidak memerlukan berkas audio MP3/WAV luar — murni osilator sintetis.
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof AudioContext === 'undefined' && typeof (globalThis as Record<string, unknown>).webkitAudioContext === 'undefined') {
    return null
  }
  if (!audioCtx) {
    const Ctx = AudioContext || (globalThis as Record<string, unknown>).webkitAudioContext as typeof AudioContext
    audioCtx = new Ctx()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

/**
 * Efek suara klik taktil pendek — dipicu saat klik tombol atau interaksi cepat.
 */
export function playTactileClick(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(800, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.06)

  gain.gain.setValueAtTime(0.15, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.08)
}

/**
 * Efek suara denting akord santai Bohemian — dipicu saat kartu berhasil dipindahkan ke kolom "Selesai".
 */
export function playChime(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const notes = [523.25, 659.25, 783.99] // C5, E5, G5 major chord

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08)

    gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.08)
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.4)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(ctx.currentTime + i * 0.08)
    osc.stop(ctx.currentTime + i * 0.08 + 0.4)
  })
}

/**
 * Efek suara "whoosh" halus — dipicu saat kartu dipindahkan antar kolom.
 */
export function playMoveCard(): void {
  const ctx = getAudioContext()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(300, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1)

  gain.gain.setValueAtTime(0.1, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.15)
}
