export type ViewmodelPosition = 'left' | 'center' | 'right'
export type ViewmodelHand = 'left' | 'right'
export type LookSway = 'off' | 'low' | 'medium' | 'high'
export type MuzzleFlashIntensity = 'low' | 'medium' | 'high'
export type ViewmodelPerformance = 'low' | 'medium' | 'high'

export interface ViewmodelSettings {
  showViewmodel: boolean
  showHands: boolean
  position: ViewmodelPosition
  hand: ViewmodelHand
  x: number
  y: number
  z: number
  scale: number
  fov: number
  visualRecoil: number
  muzzleFlash: boolean
  muzzleFlashIntensity: MuzzleFlashIntensity
  idleMotion: boolean
  idleIntensity: number
  lookSway: LookSway
  movementBob: number
  performance: ViewmodelPerformance
}

export const defaultViewmodelSettings: ViewmodelSettings = {
  showViewmodel: true, showHands: true, position: 'right', hand: 'right',
  x: 0, y: 0, z: 0, scale: 0.9, fov: 70, visualRecoil: 100,
  muzzleFlash: true, muzzleFlashIntensity: 'low', idleMotion: true, idleIntensity: 35,
  lookSway: 'low', movementBob: 35, performance: 'medium',
}

export function viewmodelClass(category: string) {
  return category.toLowerCase().replaceAll(' ', '-')
}
