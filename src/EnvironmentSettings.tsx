import { Eye, Gauge, Map, Sun } from 'lucide-react'
import type { Drill } from './drills'
import { environments, getEnvironment, getTargetDistance } from './environments'
import type { DistancePreset, ElevationPreset, EnvironmentSettings as EnvironmentSettingsState } from './environments'

interface EnvironmentSettingsProps {
  settings: EnvironmentSettingsState
  selectedDrill: Drill
  update: <K extends keyof EnvironmentSettingsState>(key: K, value: EnvironmentSettingsState[K]) => void
}

const distanceOptions: { id: DistancePreset; label: string }[] = [
  { id: 'very-close', label: 'VERY CLOSE' }, { id: 'close', label: 'CLOSE' }, { id: 'medium', label: 'MEDIUM' }, { id: 'far', label: 'FAR' }, { id: 'very-far', label: 'VERY FAR' }, { id: 'custom', label: 'CUSTOM' },
]
const elevationOptions: { id: ElevationPreset; label: string }[] = [
  { id: 'ground', label: 'GROUND' }, { id: 'normal', label: 'NORMAL' }, { id: 'elevated', label: 'ELEVATED' }, { id: 'high', label: 'HIGH' }, { id: 'mixed', label: 'MIXED' },
]

export default function EnvironmentSettings({ settings, selectedDrill, update }: EnvironmentSettingsProps) {
  const selected = getEnvironment(settings.environmentId)
  const recommended = selected.recommendedDrills.includes(selectedDrill.id)
  const targetColor = settings.targetColor || selected.target
  const visibility = Math.round(Math.min(100, 72 * selected.contrast * settings.contrast + (targetColor.toLowerCase() === selected.target.toLowerCase() ? 8 : 0)))

  return <section className="environment-settings settings-section">
    <div className="settings-section-heading"><div className="section-icon"><Map size={17} /></div><div><h2>Training environment</h2><p>Change the range around your aim, never the sensitivity underneath it.</p></div><span className="settings-step">ENV</span></div>
    <div className="environment-layout">
      <div className="environment-picker">
        <label className="settings-field"><span className="appearance-label">ACTIVE ENVIRONMENT</span><select value={settings.environmentId} onChange={(event) => update('environmentId', event.target.value as EnvironmentSettingsState['environmentId'])}>{environments.map((environment) => <option value={environment.id} key={environment.id}>{environment.name}</option>)}</select></label>
        <div className="environment-preview" style={{ '--environment-sky': selected.sky, '--environment-wall': selected.wall, '--environment-floor': selected.floor, '--environment-target': targetColor, '--environment-accent': selected.accent } as React.CSSProperties}>
          <div className="environment-preview-grid" /><span className="environment-preview-target target-one" /><span className="environment-preview-target target-two" /><span className="environment-preview-distance">{getTargetDistance(settings)}M</span>
        </div>
      </div>
      <div className="environment-details"><div className="environment-detail-heading"><div><span className="eyebrow">{selected.name.toUpperCase()}</span><h3>{selected.description}</h3></div><span className={`performance-badge ${selected.performance.toLowerCase()}`}><Gauge size={12} /> {selected.performance} COST</span></div><div className="environment-facts"><span><strong>BEST FOR</strong>{selected.bestFor}</span><span><strong>DISTANCE</strong>{selected.distanceLabel}</span><span><strong>DRILL FIT</strong>{recommended ? 'RECOMMENDED' : 'OPEN CHOICE'}</span></div><div className="environment-recommendations">{selected.recommendedDrills.length ? <>Suggested: {selected.recommendedDrills.map((id) => id.replaceAll('-', ' ')).join(' · ')}</> : 'Custom range for any drill.'}</div></div>
    </div>
    <div className="environment-controls"><div><span className="appearance-label">TARGET DISTANCE</span><div className="segmented-control environment-options">{distanceOptions.map((option) => <button key={option.id} className={settings.distance === option.id ? 'selected' : ''} onClick={() => update('distance', option.id)}>{option.label}</button>)}</div>{settings.distance === 'custom' && <input className="environment-number" type="number" min="3" max="100" value={settings.customDistance} onChange={(event) => update('customDistance', Math.min(100, Math.max(3, Number(event.target.value))))} />}<small>Approx. {getTargetDistance(settings)}m target placement. Environment changes do not alter FOV or mouse sensitivity.</small></div><div><span className="appearance-label">ELEVATION</span><div className="segmented-control environment-options">{elevationOptions.map((option) => <button key={option.id} className={settings.elevation === option.id ? 'selected' : ''} onClick={() => update('elevation', option.id)}>{option.label}</button>)}</div></div></div>
    <div className="environment-controls environment-lighting"><label className="settings-field"><span className="appearance-label"><Sun size={12} /> BRIGHTNESS <strong>{settings.brightness.toFixed(1)}</strong></span><input type="range" min="0.55" max="1.45" step="0.05" value={settings.brightness} onChange={(event) => update('brightness', Number(event.target.value))} /></label><label className="settings-field"><span className="appearance-label"><Eye size={12} /> CONTRAST <strong>{settings.contrast.toFixed(1)}</strong></span><input type="range" min="0.7" max="1.6" step="0.05" value={settings.contrast} onChange={(event) => update('contrast', Number(event.target.value))} /></label><label className="settings-field"><span className="appearance-label">TARGET COLOR</span><div className="environment-color"><input type="color" value={targetColor} onChange={(event) => update('targetColor', event.target.value)} /><span>{targetColor.toUpperCase()}</span></div></label></div>
    <div className="environment-footer"><span className="visibility-meter"><strong>TARGET VISIBILITY</strong><i><b style={{ width: `${visibility}%` }} /></i>{visibility >= 80 ? 'EXCELLENT' : 'CHECK COLORS'} {visibility}/100</span><label className="environment-toggle"><input type="checkbox" checked={settings.performanceMode} onChange={(event) => update('performanceMode', event.target.checked)} /> PERFORMANCE MODE</label><label className="environment-toggle"><input type="checkbox" checked={settings.reducedMotion} onChange={(event) => update('reducedMotion', event.target.checked)} /> REDUCED MOTION</label></div>
  </section>
}
