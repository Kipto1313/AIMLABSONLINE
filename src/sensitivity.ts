export interface GameSensitivityProfile {
  id: string
  name: string
  sensitivityMin: number
  sensitivityMax: number
  defaultSensitivity: number
  conversionConstant: number
  decimals: number
  step: number
  conversionNote: string
}

// Factors are angular degrees per sensitivity unit. Validate against the game's
// current yaw setting before treating these reference values as authoritative.
export const profiles: GameSensitivityProfile[] = [
  { id: 'valorant', name: 'VALORANT', sensitivityMin: 0.01, sensitivityMax: 10, defaultSensitivity: 0.35, conversionConstant: 0.07, decimals: 3, step: 0.01, conversionNote: 'Reference yaw: 0.07 degrees per sensitivity unit.' },
  { id: 'cs2', name: 'COUNTER-STRIKE 2', sensitivityMin: 0.01, sensitivityMax: 10, defaultSensitivity: 1, conversionConstant: 0.022, decimals: 2, step: 0.01, conversionNote: 'Reference yaw: 0.022 degrees per sensitivity unit.' },
  { id: 'overwatch', name: 'OVERWATCH 2', sensitivityMin: 0.01, sensitivityMax: 100, defaultSensitivity: 5, conversionConstant: 0.0066, decimals: 2, step: 0.1, conversionNote: 'Reference yaw: 0.0066 degrees per sensitivity unit.' },
  { id: 'apex', name: 'APEX LEGENDS', sensitivityMin: 0.1, sensitivityMax: 20, defaultSensitivity: 1.5, conversionConstant: 0.022, decimals: 2, step: 0.1, conversionNote: 'Reference yaw: 0.022 degrees per sensitivity unit.' },
  { id: 'fortnite', name: 'FORTNITE', sensitivityMin: 1, sensitivityMax: 100, defaultSensitivity: 8, conversionConstant: 0.555, decimals: 1, step: 0.1, conversionNote: 'Approximate legacy yaw reference; Fortnite settings can differ.' },
  { id: 'cod', name: 'CALL OF DUTY', sensitivityMin: 0.1, sensitivityMax: 20, defaultSensitivity: 6, conversionConstant: 0.0066, decimals: 2, step: 0.1, conversionNote: 'Approximate reference; CoD response curves and scaling vary by title.' },
  { id: 'siege', name: 'RAINBOW SIX SIEGE', sensitivityMin: 1, sensitivityMax: 100, defaultSensitivity: 10, conversionConstant: 0.00573, decimals: 1, step: 0.1, conversionNote: 'Approximate reference; title-specific look scaling may vary.' },
  { id: 'destiny', name: 'DESTINY 2', sensitivityMin: 1, sensitivityMax: 20, defaultSensitivity: 5, conversionConstant: 0.0066, decimals: 1, step: 0.1, conversionNote: 'Approximate reference; in-game modifier and FOV affect perceived aim.' },
  { id: 'battlefield', name: 'BATTLEFIELD', sensitivityMin: 1, sensitivityMax: 100, defaultSensitivity: 20, conversionConstant: 0.005, decimals: 1, step: 0.1, conversionNote: 'Approximate reference; Battlefield title and uniform soldier aiming vary.' },
  { id: 'custom', name: 'GENERIC / CUSTOM', sensitivityMin: 0.01, sensitivityMax: 10, defaultSensitivity: 1, conversionConstant: 0.022, decimals: 3, step: 0.01, conversionNote: 'Generic reference factor; set a custom conversion factor for exact matching.' },
]

export interface AimSettings {
  theme: 'moss' | 'cyan' | 'amber' | 'rose'
  gameId: string
  sensitivity: number
  dpi: number
  customYaw: number
  fov: number
  aspectRatio: '16:9' | '16:10' | '4:3' | '21:9'
  crosshairColor: string
  crosshairShape: 'cross' | 'dot' | 'four-point' | 't-shape' | 'circle' | 'plus'
  crosshairSize: number
  crosshairThickness: number
  crosshairGap: number
  crosshairDot: boolean
  crosshairOutline: boolean
}

export const defaultSettings: AimSettings = {
  theme: 'moss', gameId: 'valorant', sensitivity: 0.35, dpi: 800, customYaw: 0.022,
  fov: 103, aspectRatio: '16:9', crosshairColor: '#d2f36b', crosshairSize: 10,
  crosshairShape: 'cross',
  crosshairThickness: 2, crosshairGap: 4, crosshairDot: false,
  crosshairOutline: true,
}

export function getProfile(gameId: string) {
  return profiles.find((profile) => profile.id === gameId) ?? profiles[0]
}

export function getYawDegreesPerCount(settings: AimSettings) {
  const factor = settings.gameId === 'custom' ? settings.customYaw : getProfile(settings.gameId).conversionConstant
  return settings.sensitivity * factor
}

export function getCmPer360(settings: AimSettings) {
  return (360 * 2.54) / (settings.dpi * getYawDegreesPerCount(settings))
}

export function getEdpi(settings: AimSettings) {
  return settings.dpi * settings.sensitivity
}
