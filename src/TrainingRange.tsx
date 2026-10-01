import { useEffect, useRef } from 'react'
import type { Drill } from './drills'
import type { AimSettings } from './sensitivity'
import { getYawDegreesPerCount } from './sensitivity'
import { Play, RotateCcw, X } from 'lucide-react'
import { getEnvironment, getTargetDistance } from './environments'
import type { EnvironmentSettings } from './environments'

interface TrainingRangeProps {
  drill: Drill
  duration: number
  settings: AimSettings
  environmentSettings: EnvironmentSettings
  showFps: boolean
  onUpdateSettings: <K extends keyof AimSettings>(key: K, value: AimSettings[K]) => void
  onClose: () => void
  onComplete: (result: RunResult) => void
}

export interface RunResult {
  score: number
  hits: number
  misses: number
  shots: number
  accuracy: number
  elapsed: number
  averageReaction: number
  bestReaction: number
  targetsPerSecond: number
}

interface Target {
  x: number
  y: number
  z: number
  radius: number
  phase: number
  vx: number
  vy: number
  born: number
}

const difficultySize: Record<Drill['difficulty'], number> = {
  Easy: 0.9,
  Medium: 0.75,
  Hard: 0.62,
  Expert: 0.5,
}

const difficultySpeed: Record<Drill['difficulty'], number> = {
  Easy: 0.75,
  Medium: 1,
  Hard: 1.25,
  Expert: 1.5,
}

function projectedRadius(targetRadius: number, scale: number, difficulty: Drill['difficulty']) {
  return Math.max(3, targetRadius * scale * difficultySize[difficulty] / 125)
}

export default function TrainingRange({ drill, duration, settings, environmentSettings, showFps, onUpdateSettings, onClose, onComplete }: TrainingRangeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hudRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef(settings)
  const pauseMenuRef = useRef<HTMLDivElement>(null)
  const startHintRef = useRef<HTMLDivElement>(null)
  const resumeRef = useRef<(() => void) | null>(null)
  const fpsRef = useRef<HTMLSpanElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  settingsRef.current = settings
  const gameRef = useRef({ yaw: 0, pitch: 0, targets: [] as Target[], score: 0, hits: 0, misses: 0, clicks: 0, reactions: [] as number[], currentFov: settings.fov, startedAt: 0, lastFrameAt: 0, lastHud: 0, lastFps: 0, phase: 'waiting' as 'waiting' | 'countdown' | 'running' | 'paused' | 'done', countdownAt: 0, elapsedBeforePause: 0, timeLeft: duration, raf: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d', { alpha: false })
    if (!canvas || !ctx) return
    const state = gameRef.current
    const movementSpeed = difficultySpeed[drill.difficulty]
    const environment = getEnvironment(environmentSettings.environmentId)
    const targetDistance = getTargetDistance(environmentSettings)
    const targetColor = environmentSettings.targetColor || environment.target
    state.yaw = 0
    state.pitch = 0
    state.score = 0
    state.hits = 0
    state.misses = 0
    state.clicks = 0
    state.reactions = []
    state.currentFov = settingsRef.current.fov
    state.lastFrameAt = 0
    state.phase = 'waiting'
    state.countdownAt = 0
    state.elapsedBeforePause = 0
    state.timeLeft = duration

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(canvas.clientWidth * ratio)
      canvas.height = Math.floor(canvas.clientHeight * ratio)
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const spawn = (now: number, gridSlot = Math.floor(Math.random() * 9)): Target => {
      const zone = environment.spawnZones[Math.floor(Math.random() * environment.spawnZones.length)] ?? environment.spawnZones[0]
      const angle = Math.random() * Math.PI * 2
      const spread = drill.id === 'microshot' ? 0.52 : zone.width * environment.movementSpace
      const elevation = environmentSettings.elevation === 'ground' ? -0.32 : environmentSettings.elevation === 'elevated' ? 0.28 : environmentSettings.elevation === 'high' ? 0.52 : environmentSettings.elevation === 'mixed' ? (Math.random() * 0.9 - 0.35) : 0
      const gridColumn = gridSlot % 3 - 1
      const gridRow = Math.floor(gridSlot / 3) - 1
      const gridCellWidth = zone.width / 3
      const gridCellHeight = zone.height / 3
      const gridPosition = drill.id === 'gridshot'
        ? {
            x: zone.x + gridColumn * gridCellWidth + (Math.random() - 0.5) * gridCellWidth * 0.35,
            y: zone.y + elevation + gridRow * gridCellHeight + (Math.random() - 0.5) * gridCellHeight * 0.35,
          }
        : null
      return {
        x: gridPosition?.x ?? zone.x + Math.cos(angle) * spread * (0.45 + Math.random() * 0.7),
        y: gridPosition?.y ?? zone.y + elevation + Math.sin(angle) * zone.height * (0.45 + Math.random() * 0.7),
        z: targetDistance * (0.82 + Math.random() * 0.36),
        radius: drill.targetRadius * (drill.id === 'long-range' || drill.id === 'tiny-targets' ? 0.72 : 1),
        phase: Math.random() * Math.PI * 2,
        vx: (Math.random() > 0.5 ? 1 : -1) * (0.48 + Math.random() * 0.55),
        vy: (Math.random() > 0.5 ? 1 : -1) * (0.22 + Math.random() * 0.5),
        born: now,
      }
    }
    state.targets = Array.from({ length: drill.targets }, (_, index) => {
      const target = spawn(performance.now(), (index * 4) % 9)
      target.phase += (Math.PI * 2 * index) / drill.targets
      return target
    })

    const draw = (now: number) => {
      const frameDelta = state.lastFrameAt ? Math.min(now - state.lastFrameAt, 50) : 0
      state.lastFrameAt = now
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const centerX = width / 2
      const centerY = height / 2
      const currentSettings = settingsRef.current
      state.currentFov = currentSettings.fov
      const focal = width / (2 * Math.tan((state.currentFov * Math.PI) / 360))
      const elapsed = state.phase === 'running' ? state.elapsedBeforePause + (now - state.startedAt) : state.elapsedBeforePause
      if (state.phase === 'running') {
        state.timeLeft = Math.max(0, duration - elapsed / 1000)
        if (state.timeLeft <= 0) finish()
      }

      const sky = ctx.createLinearGradient(0, 0, 0, height)
      sky.addColorStop(0, environment.sky)
      sky.addColorStop(0.58, environment.wall)
      sky.addColorStop(1, environment.floor)
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, width, height)

      const horizon = height * (environment.id === 'infinite-grid' ? 0.66 : 0.61)
      ctx.fillStyle = environment.floor
      ctx.fillRect(0, horizon, width, height - horizon)
      ctx.strokeStyle = `${environment.accent}22`
      ctx.lineWidth = 1
      for (let i = -8; i <= 8; i++) {
        ctx.beginPath()
        ctx.moveTo(centerX + i * width * 0.085, horizon)
        ctx.lineTo(centerX + i * width * 0.34, height)
        ctx.stroke()
      }
      for (let i = 1; i <= 8; i++) {
        const y = horizon + ((height - horizon) * i * i) / 80
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      ctx.fillStyle = `${environment.accent}09`
      ctx.fillRect(0, horizon - 1, width, 2)

      const profileTargets = state.targets.map((target) => {
        let x = target.x
        let y = target.y
        if (state.phase === 'running' && !environmentSettings.reducedMotion && drill.movement === 'strafe') x += Math.sin(now / (420 / movementSpeed) + target.phase) * 1.15
        if (state.phase === 'running' && !environmentSettings.reducedMotion && drill.movement === 'circle') {
          x += Math.cos(now / (800 / movementSpeed) + target.phase) * 0.8
          y += Math.sin(now / (800 / movementSpeed) + target.phase) * 0.56
        }
        if (state.phase === 'running' && !environmentSettings.reducedMotion && drill.movement === 'random') {
          const age = now - target.born
          x += target.vx * Math.sin(age / (420 / movementSpeed) + target.phase) * 0.42
          y += target.vy * Math.cos(age / (510 / movementSpeed) + target.phase) * 0.32
        }
        const cosYaw = Math.cos(state.yaw)
        const sinYaw = Math.sin(state.yaw)
        const cameraX = x * cosYaw - target.z * sinYaw
        const cameraZ = x * sinYaw + target.z * cosYaw
        const cosPitch = Math.cos(state.pitch)
        const sinPitch = Math.sin(state.pitch)
        const cameraY = y * cosPitch - cameraZ * sinPitch
        const depth = y * sinPitch + cameraZ * cosPitch
        const scale = focal / Math.max(depth, 0.1)
        return { target, x: centerX + cameraX * scale, y: centerY - cameraY * scale, radius: projectedRadius(target.radius, scale, drill.difficulty), depth }
      }).filter((point) => point.depth > 0.5).sort((a, b) => b.depth - a.depth)

      if (state.phase === 'running' && drill.category === 'Tracking' && frameDelta > 0) {
        const tracking = profileTargets.some((point) => Math.hypot(point.x - centerX, point.y - centerY) <= point.radius)
        if (tracking) state.score += frameDelta * 0.8
      }

      for (const point of profileTargets) {
        const { x, y, radius } = point
        ctx.save()
        ctx.shadowColor = `${targetColor}66`
        ctx.shadowBlur = environmentSettings.performanceMode || environment.minimal ? 0 : radius * 0.55
        ctx.fillStyle = targetColor
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.strokeStyle = 'rgba(255,255,255,0.8)'
        ctx.lineWidth = Math.max(1, radius * 0.07)
        ctx.stroke()
        ctx.fillStyle = `${environment.wall}88`
        ctx.beginPath()
        ctx.arc(x, y, radius * 0.44, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      const crosshair = currentSettings.crosshairSize
      ctx.save()
      if (currentSettings.crosshairOutline) {
        ctx.strokeStyle = 'rgba(0,0,0,0.8)'
        ctx.fillStyle = 'rgba(0,0,0,0.8)'
        ctx.lineWidth = currentSettings.crosshairThickness + 2
        drawCrosshair(ctx, centerX, centerY, crosshair, currentSettings.crosshairGap, currentSettings.crosshairShape, currentSettings.crosshairThickness + 2)
      }
      ctx.strokeStyle = currentSettings.crosshairColor
      ctx.fillStyle = currentSettings.crosshairColor
      ctx.lineWidth = currentSettings.crosshairThickness
      ctx.globalAlpha = 0.95
      drawCrosshair(ctx, centerX, centerY, crosshair, currentSettings.crosshairGap, currentSettings.crosshairShape, currentSettings.crosshairThickness)
      if (currentSettings.crosshairDot && currentSettings.crosshairShape !== 'dot') {
        ctx.fillStyle = currentSettings.crosshairColor
        ctx.beginPath()
        ctx.arc(centerX, centerY, Math.max(1, currentSettings.crosshairThickness / 2), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()

      if (state.phase === 'waiting') {
        ctx.fillStyle = 'rgba(10, 13, 11, 0.22)'
        ctx.fillRect(0, 0, width, height)
        ctx.textAlign = 'center'
        ctx.fillStyle = '#edf2e8'
        ctx.font = '500 17px "DM Mono", monospace'
        ctx.fillText('CLICK TO BEGIN', centerX, centerY + 86)
      } else if (state.phase === 'countdown') {
        const count = 3 - Math.floor((now - state.countdownAt) / 850)
        ctx.fillStyle = 'rgba(10, 13, 11, 0.48)'
        ctx.fillRect(0, 0, width, height)
        ctx.textAlign = 'center'
        ctx.fillStyle = '#d2f36b'
        ctx.font = '600 92px "Space Grotesk", sans-serif'
        ctx.fillText(count > 0 ? String(count) : 'GO', centerX, centerY + 26)
        if (count <= 0) {
          state.phase = 'running'
          state.startedAt = now
          if (drill.reaction) state.targets = state.targets.map(() => spawn(now))
        }
      } else if (state.phase === 'paused') {
        ctx.fillStyle = 'rgba(10, 13, 11, 0.76)'
        ctx.fillRect(0, 0, width, height)
        ctx.textAlign = 'center'
        ctx.fillStyle = '#f0f2eb'
        ctx.font = '600 46px "Space Grotesk", sans-serif'
        ctx.fillText('PAUSED', centerX, centerY)
        ctx.fillStyle = '#a6b0aa'
        ctx.font = '15px "IBM Plex Mono", monospace'
        ctx.fillText('ESC TO RESUME  ·  SHIFT+R TO RESTART', centerX, centerY + 38)
      }

      if (state.phase === 'running' && now - state.lastHud > 100) {
        state.lastHud = now
        const accuracy = state.clicks ? Math.round((state.hits / state.clicks) * 100) : 0
        hudRef.current?.querySelector('[data-score]')?.replaceChildren(document.createTextNode(Math.floor(state.score).toLocaleString()))
        hudRef.current?.querySelector('[data-time]')?.replaceChildren(document.createTextNode(`${state.timeLeft.toFixed(1)}s`))
        hudRef.current?.querySelector('[data-accuracy]')?.replaceChildren(document.createTextNode(`${accuracy}%`))
        hudRef.current?.querySelector('[data-hits]')?.replaceChildren(document.createTextNode(String(state.hits)))
      }
      if (showFps && now - state.lastFps > 500) {
        fpsRef.current?.replaceChildren(document.createTextNode(`${Math.round(1000 / Math.max(1, now - state.lastFps))} FPS`))
        state.lastFps = now
      }
      state.raf = requestAnimationFrame(draw)
    }

    const finish = () => {
      if (state.phase === 'done') return
      state.phase = 'done'
      document.exitPointerLock?.()
      const elapsed = Math.min(duration, state.elapsedBeforePause + (performance.now() - state.startedAt) / 1000)
      const accuracy = state.clicks ? state.hits / state.clicks : 0
      const averageReaction = state.reactions.length ? state.reactions.reduce((sum, value) => sum + value, 0) / state.reactions.length : 0
      const bestReaction = state.reactions.length ? Math.min(...state.reactions) : 0
      const score = drill.category === 'Tracking' ? Math.round(state.score) : Math.round(state.hits * (400 + accuracy * 600) * (0.85 + drill.targetRadius / 200))
      onComplete({ score, hits: state.hits, misses: state.misses, shots: state.clicks, accuracy, elapsed, averageReaction, bestReaction, targetsPerSecond: elapsed ? state.clicks / elapsed : 0 })
    }

    const start = () => {
      if (state.phase === 'paused') {
        state.startedAt = performance.now()
        state.phase = 'running'
        pauseMenuRef.current?.classList.remove('visible')
        canvas.requestPointerLock()
      } else if (state.phase === 'running') {
        state.elapsedBeforePause += performance.now() - state.startedAt
        state.phase = 'paused'
        pauseMenuRef.current?.classList.add('visible')
        document.exitPointerLock?.()
      }
    }
    resumeRef.current = start
    const mouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas || state.phase !== 'running') return
      const sensitivity = getYawDegreesPerCount(settingsRef.current) * Math.PI / 180
      const maxYaw = Math.PI / 2
      state.yaw = Math.max(-maxYaw, Math.min(maxYaw, state.yaw + event.movementX * sensitivity))
      state.pitch = Math.max(-1.2, Math.min(1.2, state.pitch - event.movementY * sensitivity))
    }
    const clickTarget = () => {
      if (state.phase !== 'running') return
      const now = performance.now()
      const width = canvas.clientWidth
      const focal = width / (2 * Math.tan((state.currentFov * Math.PI) / 360))
      const hit = state.targets.map((target) => {
        let x = target.x
        let y = target.y
        if (!environmentSettings.reducedMotion && drill.movement === 'strafe') x += Math.sin(now / (420 / movementSpeed) + target.phase) * 1.15
        if (!environmentSettings.reducedMotion && drill.movement === 'circle') {
          x += Math.cos(now / (800 / movementSpeed) + target.phase) * 0.8
          y += Math.sin(now / (800 / movementSpeed) + target.phase) * 0.56
        }
        if (!environmentSettings.reducedMotion && drill.movement === 'random') {
          const age = now - target.born
          x += target.vx * Math.sin(age / (420 / movementSpeed) + target.phase) * 0.42
          y += target.vy * Math.cos(age / (510 / movementSpeed) + target.phase) * 0.32
        }
        const cameraX = x * Math.cos(state.yaw) - target.z * Math.sin(state.yaw)
        const cameraZ = x * Math.sin(state.yaw) + target.z * Math.cos(state.yaw)
        const cameraY = y * Math.cos(state.pitch) - cameraZ * Math.sin(state.pitch)
        const depth = y * Math.sin(state.pitch) + cameraZ * Math.cos(state.pitch)
        const scale = focal / Math.max(depth, 0.1)
        return { target, depth, distance: Math.hypot(cameraX * scale, cameraY * scale), radius: projectedRadius(target.radius, scale, drill.difficulty) }
      }).filter((target) => target.depth > 0.5 && target.distance <= target.radius).sort((a, b) => a.depth - b.depth)[0]

      state.clicks++
      if (hit) {
        state.hits++
        playTrainingSound(audioContextRef, 'hit')
        if (drill.reaction) state.reactions.push(now - hit.target.born)
        if (drill.category !== 'Tracking') {
          const accuracy = state.hits / state.clicks
          state.score += Math.round(400 + accuracy * 600)
        }
        const index = state.targets.indexOf(hit.target)
        state.targets[index] = spawn(now)
      } else {
        state.misses++
        playTrainingSound(audioContextRef, 'miss')
      }
    }
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (state.phase === 'running') start()
        else if (state.phase === 'paused') start()
      } else if (event.code === 'Space' && state.phase === 'waiting') {
        event.preventDefault()
        state.phase = 'countdown'
        state.countdownAt = performance.now()
        canvas.requestPointerLock()
      }
    }
    const lockChange = () => {
      startHintRef.current?.classList.toggle('hidden-hint', document.pointerLockElement === canvas)
      if (document.pointerLockElement !== canvas && state.phase === 'running') start()
      else if (document.pointerLockElement === canvas && state.phase === 'paused') start()
    }
    const pointerDown = (event: PointerEvent) => {
      if (!audioContextRef.current) audioContextRef.current = new AudioContext()
      if (audioContextRef.current.state === 'suspended') void audioContextRef.current.resume()
      if (event.button === 2) {
        event.preventDefault()
        return
      }
      if (event.button !== 0) return
      if (state.phase === 'waiting') {
        state.phase = 'countdown'
        state.countdownAt = performance.now()
        canvas.requestPointerLock()
      } else if (state.phase === 'running') {
        clickTarget()
      }
    }
    const contextMenu = (event: MouseEvent) => event.preventDefault()
    canvas.addEventListener('pointerdown', pointerDown)
    canvas.addEventListener('contextmenu', contextMenu)
    document.addEventListener('mousemove', mouseMove)
    document.addEventListener('keydown', keyDown)
    document.addEventListener('pointerlockchange', lockChange)
    state.raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(state.raf)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointerdown', pointerDown)
      canvas.removeEventListener('contextmenu', contextMenu)
      document.removeEventListener('mousemove', mouseMove)
      document.removeEventListener('keydown', keyDown)
      document.removeEventListener('pointerlockchange', lockChange)
      if (document.pointerLockElement === canvas) document.exitPointerLock()
      audioContextRef.current?.close()
      audioContextRef.current = null
    }
  }, [drill, duration, environmentSettings, onClose, onComplete, showFps])

  return (
    <main className="range-shell" data-theme={settings.theme}>
      <canvas ref={canvasRef} className="range-canvas" aria-label="Aim training range" />
      <div className="range-vignette" />
      <header className="range-hud" ref={hudRef}>
        <div><span className="hud-label">SCORE</span><strong data-score>0</strong></div>
        <div className="hud-timer"><span className="hud-label">TIME</span><strong data-time>{duration.toFixed(1)}s</strong></div>
        <div className="hud-right"><span className="hud-label">ACCURACY</span><strong data-accuracy>0%</strong></div>
      </header>
      <div className="range-bottom"><span>{drill.name.toUpperCase()} <i /> {drill.category.toUpperCase()}</span><span><b data-hits>0</b> HITS <i /> ESC TO PAUSE</span></div>
      {showFps && <span className="fps-counter" ref={fpsRef}>— FPS</span>}
      <button className="range-exit" onClick={onClose}>EXIT SESSION <span>ESC</span></button>
      <div className="range-start-hint" ref={startHintRef}>CLICK TO BEGIN · MOUSE WILL LOCK</div>
      <div className="pause-menu" ref={pauseMenuRef}>
        <div className="pause-card"><div className="eyebrow"><span className="eyebrow-line" /> SESSION PAUSED</div><h2>Take a breath.</h2><p>Your run is saved when you finish the drill.</p>
          <div className="pause-adjustments"><label>SENSITIVITY <strong>{settings.sensitivity.toFixed(3)}</strong><input type="range" min={0.01} max={10} step={0.01} value={settings.sensitivity} onChange={(event) => onUpdateSettings('sensitivity', Number(event.target.value))} /></label><label>CROSSHAIR COLOR <input type="color" value={settings.crosshairColor} onChange={(event) => onUpdateSettings('crosshairColor', event.target.value)} /></label></div>
          <button className="primary-button pause-resume" onClick={() => resumeRef.current?.()}><Play size={14} fill="currentColor" /> RESUME</button><button className="pause-action" onClick={() => { onClose(); window.setTimeout(() => window.dispatchEvent(new CustomEvent('restart-drill')), 0) }}><RotateCcw size={14} /> RESTART DRILL</button><button className="pause-action" onClick={onClose}><X size={14} /> QUIT TO DASHBOARD</button>
        </div>
      </div>
    </main>
  )
}

function playTrainingSound(audioRef: { current: AudioContext | null }, kind: 'hit' | 'miss') {
  const context = audioRef.current
  if (!context || context.state !== 'running') return
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const now = context.currentTime
  const hit = kind === 'hit'
  oscillator.type = hit ? 'sine' : 'triangle'
  oscillator.frequency.setValueAtTime(hit ? 720 : 170, now)
  oscillator.frequency.exponentialRampToValueAtTime(hit ? 980 : 110, now + (hit ? 0.07 : 0.11))
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(hit ? 0.045 : 0.025, now + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (hit ? 0.08 : 0.12))
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(now)
  oscillator.stop(now + (hit ? 0.08 : 0.12))
}

function drawCrosshair(ctx: CanvasRenderingContext2D, x: number, y: number, length: number, gap: number, shape: AimSettings['crosshairShape'], thickness: number) {
  const radius = Math.max(thickness, length / 2)
  if (shape === 'dot') {
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  if (shape === 'circle') {
    ctx.beginPath()
    ctx.arc(x, y, Math.max(radius, gap + length / 2), 0, Math.PI * 2)
    ctx.stroke()
    return
  }
  if (shape === 'plus') {
    ctx.fillRect(x - thickness / 2, y - gap - length, thickness, (gap + length) * 2)
    ctx.fillRect(x - gap - length, y - thickness / 2, (gap + length) * 2, thickness)
    return
  }
  if (shape === 'four-point') {
    for (const [offsetX, offsetY] of [[0, -gap - radius], [gap + radius, 0], [0, gap + radius], [-gap - radius, 0]]) {
      ctx.beginPath()
      ctx.arc(x + offsetX, y + offsetY, Math.max(1, thickness), 0, Math.PI * 2)
      ctx.fill()
    }
    return
  }
  ctx.beginPath()
  ctx.moveTo(x - gap - length, y)
  ctx.lineTo(x - gap, y)
  ctx.moveTo(x + gap, y)
  ctx.lineTo(x + gap + length, y)
  if (shape !== 't-shape') {
    ctx.moveTo(x, y - gap - length)
    ctx.lineTo(x, y - gap)
  }
  ctx.moveTo(x, y + gap)
  ctx.lineTo(x, y + gap + length)
  ctx.stroke()
}
