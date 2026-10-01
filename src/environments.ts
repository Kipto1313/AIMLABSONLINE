export type EnvironmentId =
  | 'classic-room'
  | 'precision-range'
  | 'close-quarters'
  | 'tracking-arena'
  | 'outdoor-range'
  | 'dark-arena'
  | 'movement-arena'
  | 'recoil-range'
  | 'minimal-room'
  | 'infinite-grid'
  | 'custom'

export type DistancePreset = 'very-close' | 'close' | 'medium' | 'far' | 'very-far' | 'custom'
export type ElevationPreset = 'ground' | 'normal' | 'elevated' | 'high' | 'mixed'

export interface SpawnZone {
  id: string
  x: number
  y: number
  width: number
  height: number
  minDistance: number
  maxDistance: number
}

export interface TrainingEnvironment {
  id: EnvironmentId
  name: string
  description: string
  bestFor: string
  distanceLabel: string
  performance: 'LOW' | 'MEDIUM' | 'HIGH'
  sky: string
  wall: string
  floor: string
  accent: string
  target: string
  ambient: string
  contrast: number
  spawnZones: SpawnZone[]
  defaultDistance: DistancePreset
  recommendedDrills: string[]
  movementSpace: number
  minimal: boolean
}

export interface EnvironmentSettings {
  environmentId: EnvironmentId
  distance: DistancePreset
  customDistance: number
  elevation: ElevationPreset
  targetColor: string
  brightness: number
  contrast: number
  shadows: boolean
  reducedMotion: boolean
  performanceMode: boolean
}

const broadZone: SpawnZone = { id: 'broad', x: 0, y: 0, width: 2.2, height: 1.45, minDistance: 7, maxDistance: 14 }

export const environments: TrainingEnvironment[] = [
  { id: 'classic-room', name: 'Classic Training Room', description: 'A balanced indoor room with a clean wall and soft lighting.', bestFor: 'General warmups and target switching', distanceLabel: 'Close - Medium', performance: 'LOW', sky: '#151a18', wall: '#46504a', floor: '#272d29', accent: '#9caf87', target: '#d2f36b', ambient: 'Room tone', contrast: 1, spawnZones: [broadZone], defaultDistance: 'medium', recommendedDrills: ['gridshot', 'six-target', 'multi-target'], movementSpace: 1, minimal: false },
  { id: 'precision-range', name: 'Precision Range', description: 'A long geometric range for small targets and deliberate corrections.', bestFor: 'Precision and long-distance flicks', distanceLabel: 'Medium - Very Far', performance: 'LOW', sky: '#101615', wall: '#293632', floor: '#202926', accent: '#6be8f3', target: '#f0f2eb', ambient: 'Quiet room', contrast: 1.16, spawnZones: [{ id: 'close', x: 0, y: 0, width: 1.4, height: 1, minDistance: 5, maxDistance: 10 }, { id: 'long', x: 0, y: 0, width: 1.7, height: 1.2, minDistance: 20, maxDistance: 50 }], defaultDistance: 'far', recommendedDrills: ['tiny-targets', 'microshot', 'long-range'], movementSpace: 1.1, minimal: false },
  { id: 'close-quarters', name: 'Close Quarters', description: 'A compact room that opens the full rotation for fast flicks.', bestFor: 'Large flicks and reaction training', distanceLabel: 'Very Close - Close', performance: 'LOW', sky: '#171816', wall: '#4b4a43', floor: '#2d2d28', accent: '#ffbd59', target: '#ffdf8d', ambient: 'Room tone', contrast: 1.08, spawnZones: [{ id: 'surround', x: 0, y: 0.05, width: 3.2, height: 2.2, minDistance: 4, maxDistance: 8 }], defaultDistance: 'close', recommendedDrills: ['reflex-shot', 'switchshot', 'speed-switch'], movementSpace: 2.2, minimal: false },
  { id: 'tracking-arena', name: 'Tracking Arena', description: 'A wide open arena with generous horizontal and vertical movement space.', bestFor: 'Smooth and reactive tracking', distanceLabel: 'Medium - Far', performance: 'MEDIUM', sky: '#142326', wall: '#31545a', floor: '#24363a', accent: '#8ce4d4', target: '#8ce4d4', ambient: 'Open air', contrast: 1.08, spawnZones: [{ id: 'wide', x: 0, y: 0, width: 3.2, height: 1.9, minDistance: 8, maxDistance: 20 }], defaultDistance: 'medium', recommendedDrills: ['strafetrack', 'circle-track', 'random-track'], movementSpace: 2.4, minimal: false },
  { id: 'outdoor-range', name: 'Outdoor Range', description: 'An original open-air range with long sightlines and a clear horizon.', bestFor: 'Long-range precision and target identification', distanceLabel: 'Medium - Very Far', performance: 'MEDIUM', sky: '#426b79', wall: '#65796f', floor: '#4b5043', accent: '#d9dfbd', target: '#ffef9b', ambient: 'Wind', contrast: 1.05, spawnZones: [{ id: 'sightline', x: 0, y: 0.05, width: 2.1, height: 1.35, minDistance: 10, maxDistance: 50 }], defaultDistance: 'far', recommendedDrills: ['long-range', 'tiny-targets'], movementSpace: 1.4, minimal: false },
  { id: 'dark-arena', name: 'Dark Arena', description: 'A restrained dark room that makes bright targets stand out.', bestFor: 'Reaction and high-contrast acquisition', distanceLabel: 'Close - Far', performance: 'MEDIUM', sky: '#050708', wall: '#11181a', floor: '#0b1010', accent: '#6be8f3', target: '#6be8f3', ambient: 'Electronic', contrast: 1.5, spawnZones: [broadZone], defaultDistance: 'medium', recommendedDrills: ['reflex-shot', 'microshot', 'speed-switch'], movementSpace: 1.5, minimal: false },
  { id: 'movement-arena', name: 'Movement Arena', description: 'A simple open floor with room for elevation and strafing practice.', bestFor: 'Movement plus aim fundamentals', distanceLabel: 'Close - Medium', performance: 'MEDIUM', sky: '#18201d', wall: '#3c5145', floor: '#293c31', accent: '#b9e07b', target: '#e4f79a', ambient: 'Open air', contrast: 1.05, spawnZones: [{ id: 'movement', x: 0, y: 0.2, width: 2.8, height: 1.7, minDistance: 6, maxDistance: 15 }], defaultDistance: 'medium', recommendedDrills: ['strafetrack', 'switchshot'], movementSpace: 2.8, minimal: false },
  { id: 'recoil-range', name: 'Precision Corner', description: 'A clear wall and stable sightline for deliberate target practice.', bestFor: 'Small targets and careful corrections', distanceLabel: 'Close - Far', performance: 'LOW', sky: '#191c1a', wall: '#555c53', floor: '#292d28', accent: '#ff8b6b', target: '#ffbd59', ambient: 'Room tone', contrast: 1.1, spawnZones: [{ id: 'wall', x: 0, y: 0, width: 1.15, height: 1.15, minDistance: 5, maxDistance: 30 }], defaultDistance: 'close', recommendedDrills: ['tiny-targets', 'long-range', 'microshot'], movementSpace: 0.7, minimal: false },
  { id: 'minimal-room', name: 'Minimal Performance Room', description: 'A low-cost scene built for stable frame time and consistent input.', bestFor: 'High-refresh-rate and older hardware', distanceLabel: 'Close - Medium', performance: 'LOW', sky: '#151817', wall: '#242a27', floor: '#1b211e', accent: '#a4b59c', target: '#d2f36b', ambient: 'Off', contrast: 1.08, spawnZones: [broadZone], defaultDistance: 'medium', recommendedDrills: ['gridshot', 'strafetrack', 'six-target'], movementSpace: 1, minimal: true },
  { id: 'infinite-grid', name: 'Infinite Grid', description: 'An abstract horizon and floor for full-rotation spatial awareness.', bestFor: '180s, 360s, and reactive switching', distanceLabel: 'Close - Far', performance: 'LOW', sky: '#0e1517', wall: '#18252a', floor: '#142126', accent: '#6be8f3', target: '#d9ffff', ambient: 'Off', contrast: 1.22, spawnZones: [{ id: 'full-space', x: 0, y: 0, width: 3.8, height: 2.5, minDistance: 7, maxDistance: 24 }], defaultDistance: 'medium', recommendedDrills: ['switchshot', 'speed-switch', 'random-track'], movementSpace: 3.2, minimal: true },
  { id: 'custom', name: 'Custom Environment', description: 'Tune distance, elevation, lighting, contrast, and target color for your own range.', bestFor: 'Personal routines and experiments', distanceLabel: 'Custom', performance: 'MEDIUM', sky: '#151a18', wall: '#46504a', floor: '#272d29', accent: '#d2f36b', target: '#d2f36b', ambient: 'Off', contrast: 1, spawnZones: [broadZone], defaultDistance: 'medium', recommendedDrills: [], movementSpace: 1, minimal: false },
]

export const defaultEnvironmentSettings: EnvironmentSettings = {
  environmentId: 'classic-room', distance: 'medium', customDistance: 20, elevation: 'normal', targetColor: '', brightness: 1, contrast: 1, shadows: false, reducedMotion: false, performanceMode: false,
}

export const distanceValues: Record<DistancePreset, number> = { 'very-close': 5, close: 8, medium: 14, far: 28, 'very-far': 50, custom: 20 }
export function getEnvironment(id: EnvironmentId) { return environments.find((item) => item.id === id) ?? environments[0] }
export function getTargetDistance(settings: EnvironmentSettings) { return settings.distance === 'custom' ? settings.customDistance : distanceValues[settings.distance] }
