export type Category = 'Flicking' | 'Tracking' | 'Target switching' | 'Precision'
export type Movement = 'still' | 'strafe' | 'circle' | 'random'

export interface Drill {
  id: string
  name: string
  category: Category
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert'
  duration: number
  targets: number
  targetRadius: number
  description: string
  movement: Movement
  reaction: boolean
}

export const drills: Drill[] = [
  { id: 'gridshot', name: 'Gridshot', category: 'Flicking', difficulty: 'Easy', duration: 30, targets: 3, targetRadius: 37, description: 'Build speed and rhythm across a field of large targets.', movement: 'still', reaction: false },
  { id: 'six-target', name: 'Six Target', category: 'Flicking', difficulty: 'Medium', duration: 30, targets: 6, targetRadius: 25, description: 'Chain precise flicks between six compact targets.', movement: 'still', reaction: false },
  { id: 'microshot', name: 'Microshot', category: 'Flicking', difficulty: 'Hard', duration: 30, targets: 1, targetRadius: 13, description: 'Make small, deliberate corrections under pressure.', movement: 'still', reaction: true },
  { id: 'reflex-shot', name: 'Reflex Shot', category: 'Flicking', difficulty: 'Medium', duration: 30, targets: 1, targetRadius: 24, description: 'React quickly when a target appears in view.', movement: 'still', reaction: true },
  { id: 'strafetrack', name: 'Strafetrack', category: 'Tracking', difficulty: 'Medium', duration: 30, targets: 1, targetRadius: 29, description: 'Stay centered as a target strafes unpredictably.', movement: 'strafe', reaction: false },
  { id: 'circle-track', name: 'Circle Track', category: 'Tracking', difficulty: 'Medium', duration: 30, targets: 1, targetRadius: 27, description: 'Follow smooth circular paths without overcorrecting.', movement: 'circle', reaction: false },
  { id: 'random-track', name: 'Random Track', category: 'Tracking', difficulty: 'Hard', duration: 30, targets: 1, targetRadius: 24, description: 'Adapt to abrupt changes in speed and direction.', movement: 'random', reaction: false },
  { id: 'switchshot', name: 'Switchshot', category: 'Target switching', difficulty: 'Hard', duration: 30, targets: 3, targetRadius: 22, description: 'Switch rapidly between targets in motion.', movement: 'strafe', reaction: false },
  { id: 'multi-target', name: 'Multi Target', category: 'Target switching', difficulty: 'Medium', duration: 30, targets: 4, targetRadius: 28, description: 'Clear a spread of targets with clean transitions.', movement: 'still', reaction: false },
  { id: 'speed-switch', name: 'Speed Switch', category: 'Target switching', difficulty: 'Expert', duration: 30, targets: 4, targetRadius: 19, description: 'Move decisively through a fast sequence of targets.', movement: 'random', reaction: true },
  { id: 'tiny-targets', name: 'Tiny Targets', category: 'Precision', difficulty: 'Expert', duration: 30, targets: 3, targetRadius: 12, description: 'Prioritize accuracy against distant, tiny targets.', movement: 'still', reaction: false },
  { id: 'long-range', name: 'Long Range Precision', category: 'Precision', difficulty: 'Hard', duration: 30, targets: 2, targetRadius: 16, description: 'Place deliberate clicks on narrow, distant targets.', movement: 'still', reaction: false },
  { id: 'headshot', name: 'Headshot Precision', category: 'Precision', difficulty: 'Expert', duration: 30, targets: 2, targetRadius: 17, description: 'Land accurate hits on compact targets.', movement: 'still', reaction: false },
]
