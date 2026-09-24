import { describe, it, expect } from 'vitest'
import { detectOS, type OSType } from '../src/utils/osDetector'

describe('detectOS', () => {
  it('detects Windows from userAgent', () => {
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    expect(detectOS(ua)).toBe('windows')
  })

  it('detects macOS from userAgent', () => {
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    expect(detectOS(ua)).toBe('macos')
  })

  it('detects Linux from userAgent', () => {
    const ua = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
    expect(detectOS(ua)).toBe('linux')
  })

  it('detects Linux from Android userAgent', () => {
    const ua = 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36'
    expect(detectOS(ua)).toBe('linux')
  })

  it('returns unknown for unrecognized userAgent', () => {
    const ua = 'SomeBot/1.0'
    expect(detectOS(ua)).toBe('unknown')
  })

  it('returns unknown for empty string', () => {
    expect(detectOS('')).toBe('unknown')
  })

  it('is case-insensitive', () => {
    expect(detectOS('WINDOWS NT')).toBe('windows')
    expect(detectOS('macintosh')).toBe('macos')
    expect(detectOS('LINUX')).toBe('linux')
  })
})
