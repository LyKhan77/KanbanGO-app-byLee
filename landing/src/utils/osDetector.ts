export type OSType = 'windows' | 'macos' | 'linux' | 'unknown'

/**
 * Mendeteksi sistem operasi pengunjung dari string userAgent.
 * Digunakan untuk menampilkan tombol unduh yang relevan secara otomatis.
 */
export function detectOS(userAgent: string): OSType {
  const ua = userAgent.toLowerCase()

  if (ua.includes('windows') || ua.includes('win32') || ua.includes('win64')) {
    return 'windows'
  }
  if (ua.includes('macintosh') || ua.includes('mac os') || ua.includes('macos')) {
    return 'macos'
  }
  if (ua.includes('linux') || ua.includes('x11')) {
    return 'linux'
  }

  return 'unknown'
}

/**
 * Mendeteksi OS dari navigator.userAgent browser saat ini.
 */
export function detectCurrentOS(): OSType {
  if (typeof navigator === 'undefined') return 'unknown'
  return detectOS(navigator.userAgent)
}
