import type { CSSProperties } from 'react'
import { Crosshair } from 'lucide-react'
import type { AimSettings } from './sensitivity'

type AppearanceSettingsProps = {
  settings: AimSettings
  update: <K extends keyof AimSettings>(key: K, value: AimSettings[K]) => void
}

const themes = [
  { id: 'moss', name: 'Moss', color: '#d2f36b' },
  { id: 'cyan', name: 'Cyan', color: '#6be8f3' },
  { id: 'amber', name: 'Amber', color: '#ffbd68' },
  { id: 'rose', name: 'Rose', color: '#f08bb2' },
] as const

const shapes = [
  { id: 'dot', name: 'Dot' },
  { id: 'four-point', name: 'Four-point' },
  { id: 't-shape', name: 'T-shape' },
  { id: 'circle', name: 'Circle' },
  { id: 'plus', name: 'Plus' },
  { id: 'cross', name: 'Classic' },
] as const

const crosshairColors = ['#d2f36b', '#6be8f3', '#ffbd68', '#f08bb2', '#ffffff']

export default function AppearanceSettings({ settings, update }: AppearanceSettingsProps) {
  return <section className="settings-section appearance-settings">
    <div className="settings-section-heading"><div className="section-icon"><Crosshair size={17} /></div><div><h2>Theme & crosshair style</h2><p>Choose your interface palette and reticle geometry.</p></div><span className="settings-step">05</span></div>
    <div className="appearance-group"><label className="appearance-label">INTERFACE THEME</label><div className="theme-options">{themes.map((theme) => <button key={theme.id} className={settings.theme === theme.id ? 'theme-option selected' : 'theme-option'} onClick={() => update('theme', theme.id)}><span className="theme-swatch" style={{ '--theme-color': theme.color } as CSSProperties}><i /></span><span>{theme.name}</span></button>)}</div></div>
    <div className="appearance-group"><label className="appearance-label">CROSSHAIR SHAPE</label><div className="shape-options">{shapes.map((shape) => <button key={shape.id} className={settings.crosshairShape === shape.id ? 'shape-option selected' : 'shape-option'} onClick={() => update('crosshairShape', shape.id)}><span className={`shape-sample shape-${shape.id}`} style={{ '--sample-color': settings.crosshairColor } as CSSProperties} /><span>{shape.name}</span></button>)}</div></div>
    <div className="appearance-group color-group"><label className="appearance-label">CROSSHAIR COLOR</label><div className="color-swatches">{crosshairColors.map((color) => <button key={color} title={`Set crosshair color ${color}`} aria-label={`Set crosshair color ${color}`} className={settings.crosshairColor.toLowerCase() === color ? 'appearance-swatch selected' : 'appearance-swatch'} style={{ background: color }} onClick={() => update('crosshairColor', color)} />)}<label className="custom-crosshair-color" title="Choose a custom crosshair color"><input aria-label="Custom crosshair color" type="color" value={settings.crosshairColor} onChange={(event) => update('crosshairColor', event.target.value)} /><span>CUSTOM</span></label></div></div>
  </section>
}
