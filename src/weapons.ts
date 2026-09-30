export type WeaponCategory = 'Assault Rifle' | 'SMG' | 'Burst Rifle' | 'Semi-Auto Rifle' | 'Precision Rifle' | 'Sniper Rifle' | 'Pistol' | 'Heavy Pistol' | 'Shotgun' | 'LMG'
export type FireMode = 'semi' | 'automatic' | 'burst' | 'bolt'
export type RecoilMode = 'off' | 'simple' | 'pattern' | 'random' | 'hybrid'
export type TrainingMode = 'precision' | 'weapon'
export type AimMode = 'hold' | 'toggle'

export interface WeaponSettings {
  weaponId: string
  trainingMode: TrainingMode
  recoilMode: RecoilMode
  unlimitedAmmo: boolean
  automaticReload: boolean
  aimMode: AimMode
  adsTransitionSpeed: number
}

export const defaultWeaponSettings: WeaponSettings = {
  weaponId: 'standard-pistol', trainingMode: 'precision', recoilMode: 'off',
  unlimitedAmmo: true, automaticReload: true, aimMode: 'hold', adsTransitionSpeed: 12,
}

export interface WeaponProfile {
  id: string
  name: string
  category: WeaponCategory
  fireMode: FireMode
  roundsPerMinute: number
  magazineSize: number
  reserveAmmo: number
  reloadTime: number
  baseSpread: number
  movementSpread: number
  airborneSpread: number
  sustainedSpread: number
  recoilEnabled: boolean
  verticalRecoil: number
  horizontalRecoil: number
  recoilRandomness: number
  recoilRecoverySpeed: number
  firstShotAccuracy: number
  firstShotResetTime: number
  projectileType: 'hitscan' | 'pellets'
  projectileSpeed: number
  pelletsPerShot: number
  zoomAvailable: boolean
  zoomFOV: number
  adsSensitivityMultiplier: number
  automatic: boolean
  burstCount: number
  burstDelay: number
  boltDelay: number
  recoilPattern: [number, number][]
}

const standardPattern: [number, number][] = [[0, 1], [0.25, 1.1], [-0.3, 1.2], [0.4, 1.35], [-0.5, 1.45], [0.62, 1.6]]

function profile(overrides: Partial<WeaponProfile> & Pick<WeaponProfile, 'id' | 'name' | 'category'>): WeaponProfile {
  return {
    fireMode: 'automatic', roundsPerMinute: 700, magazineSize: 30, reserveAmmo: 120,
    reloadTime: 1900, baseSpread: 0.12, movementSpread: 0.25, airborneSpread: 0.6,
    sustainedSpread: 0.05, recoilEnabled: true, verticalRecoil: 0.11,
    horizontalRecoil: 0.035, recoilRandomness: 0.025, recoilRecoverySpeed: 2.2,
    firstShotAccuracy: 0.25, firstShotResetTime: 260, projectileType: 'hitscan',
    projectileSpeed: 0, pelletsPerShot: 1, zoomAvailable: true, zoomFOV: 72,
    adsSensitivityMultiplier: 0.8, automatic: true, burstCount: 3, burstDelay: 360,
    boltDelay: 850, recoilPattern: standardPattern, ...overrides,
  }
}

export const weaponProfiles: WeaponProfile[] = [
  profile({ id: 'standard-pistol', name: 'Standard Pistol', category: 'Pistol', fireMode: 'semi', automatic: false, roundsPerMinute: 420, magazineSize: 15, reserveAmmo: 90, reloadTime: 1450, baseSpread: 0.07, verticalRecoil: 0.07, zoomAvailable: false }),
]

export const recoilModes: { id: RecoilMode; name: string }[] = [
  { id: 'off', name: 'Off' }, { id: 'simple', name: 'Simple' },
  { id: 'pattern', name: 'Pattern' }, { id: 'random', name: 'Random' },
  { id: 'hybrid', name: 'Hybrid' },
]

export function getWeapon(id: string) {
  return weaponProfiles.find((item) => item.id === id) ?? weaponProfiles[0]
}

export function getFireModeLabel(weapon: WeaponProfile) {
  if (weapon.fireMode === 'automatic') return 'Fully automatic'
  if (weapon.fireMode === 'burst') return `${weapon.burstCount}-round burst`
  if (weapon.fireMode === 'bolt') return 'Bolt / slow fire'
  return 'Semi-automatic'
}
