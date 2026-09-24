import { describe, it, expect, vi, beforeEach } from 'vitest'
import { playTactileClick, playChime, playMoveCard } from '../src/utils/audio'

// Mock Web Audio API
const mockOscillator = {
  type: 'sine' as OscillatorType,
  frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn()
}

const mockGain = {
  gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
  connect: vi.fn()
}

const mockAudioContext = {
  createOscillator: vi.fn(() => ({ ...mockOscillator })),
  createGain: vi.fn(() => ({ ...mockGain })),
  currentTime: 0,
  destination: {},
  state: 'running' as AudioContextState,
  resume: vi.fn().mockResolvedValue(undefined)
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('AudioContext', vi.fn(() => mockAudioContext))
  vi.stubGlobal('webkitAudioContext', undefined)
})

describe('audio utilities', () => {
  it('playTactileClick creates oscillator and gain nodes', () => {
    playTactileClick()
    expect(mockAudioContext.createOscillator).toHaveBeenCalled()
    expect(mockAudioContext.createGain).toHaveBeenCalled()
  })

  it('playChime creates oscillator and gain nodes', () => {
    playChime()
    expect(mockAudioContext.createOscillator).toHaveBeenCalled()
    expect(mockAudioContext.createGain).toHaveBeenCalled()
  })

  it('playMoveCard creates oscillator and gain nodes', () => {
    playMoveCard()
    expect(mockAudioContext.createOscillator).toHaveBeenCalled()
    expect(mockAudioContext.createGain).toHaveBeenCalled()
  })

  it('does not throw if AudioContext is unavailable', () => {
    vi.stubGlobal('AudioContext', undefined)
    expect(() => playTactileClick()).not.toThrow()
    expect(() => playChime()).not.toThrow()
    expect(() => playMoveCard()).not.toThrow()
  })
})
