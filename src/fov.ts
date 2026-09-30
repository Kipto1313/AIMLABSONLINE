export type AspectRatio = '16:9' | '16:10' | '4:3' | '21:9'

export const aspectRatios: AspectRatio[] = ['16:9', '16:10', '4:3', '21:9']

export function getRatioValue(ratio: AspectRatio) {
  const [width, height] = ratio.split(':').map(Number)
  return width / height
}

export function horizontalToVerticalFov(horizontalDegrees: number, ratio: AspectRatio) {
  const horizontalRadians = horizontalDegrees * Math.PI / 180
  const verticalRadians = 2 * Math.atan(Math.tan(horizontalRadians / 2) / getRatioValue(ratio))
  return verticalRadians * 180 / Math.PI
}

export function verticalToHorizontalFov(verticalDegrees: number, ratio: AspectRatio) {
  const verticalRadians = verticalDegrees * Math.PI / 180
  const horizontalRadians = 2 * Math.atan(Math.tan(verticalRadians / 2) * getRatioValue(ratio))
  return horizontalRadians * 180 / Math.PI
}
