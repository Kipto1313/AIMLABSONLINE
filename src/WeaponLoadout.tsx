import { useState } from 'react'
import { Copy, Crosshair, Plus, Trash2, X } from 'lucide-react'
import type { AimMode, RecoilMode, WeaponProfile, WeaponSettings } from './weapons'
import { getFireModeLabel, recoilModes, weaponProfiles } from './weapons'

const categories: WeaponProfile['category'][] = ['Pistol']
const modes: WeaponProfile['fireMode'][] = ['semi', 'automatic', 'burst', 'bolt']

interface WeaponLoadoutProps {
  weapons: WeaponProfile[]
  selected: WeaponProfile
  settings: WeaponSettings
  update: <K extends keyof WeaponSettings>(key: K, value: WeaponSettings[K]) => void
  onSaveCustom: (weapon: WeaponProfile, previousId?: string) => void
  onDeleteCustom: (id: string) => void
}

export default function WeaponLoadout({ weapons, selected, settings, update, onSaveCustom, onDeleteCustom }: WeaponLoadoutProps) {
  const [draft, setDraft] = useState<WeaponProfile | null>(null)
  const [editingId, setEditingId] = useState<string | undefined>()
  const isCustom = selected.id.startsWith('custom-')
  const setDraftValue = <K extends keyof WeaponProfile>(key: K, value: WeaponProfile[K]) => setDraft((current) => current ? { ...current, [key]: value } : current)
  const openEditor = (existing?: WeaponProfile) => {
    setEditingId(existing?.id)
    setDraft({ ...selected, ...(existing ?? {}), id: existing?.id ?? `custom-${Date.now()}`, name: existing ? existing.name : `${selected.name} Custom` })
  }
  const saveDraft = () => {
    if (!draft?.name.trim()) return
    onSaveCustom({ ...draft, name: draft.name.trim() }, editingId)
    update('weaponId', draft.id)
    setDraft(null)
    setEditingId(undefined)
  }

  return <section className="weapon-loadout settings-section">
    <div className="settings-section-heading"><div className="section-icon"><Crosshair size={17} /></div><div><h2>Weapon profile</h2><p>Generic weapon feel, tuned for aim practice.</p></div><span className="settings-step">WPN</span></div>
    <div className="weapon-top-row"><div className="settings-field"><label htmlFor="weapon-select">ACTIVE PROFILE</label><select id="weapon-select" value={selected.id} onChange={(event) => update('weaponId', event.target.value)}>{categories.map((category) => <optgroup key={category} label={category}>{weapons.filter((weapon) => weapon.category === category).map((weapon) => <option value={weapon.id} key={weapon.id}>{weapon.name}</option>)}</optgroup>)}</select></div><div className="weapon-fire-rate"><span>FIRE RATE</span><strong>{selected.roundsPerMinute}<small> RPM</small></strong></div></div>
    <div className="weapon-facts"><div><span>FIRE MODE</span><strong>{getFireModeLabel(selected)}</strong></div><div><span>MAGAZINE</span><strong>{selected.magazineSize} ROUNDS</strong></div><div><span>RELOAD</span><strong>{(selected.reloadTime / 1000).toFixed(1)} SEC</strong></div><div><span>ADS</span><strong>{selected.zoomAvailable ? `${selected.zoomFOV}° SCOPE` : 'HIP FIRE'}</strong></div></div>
    <div className="weapon-mode-row"><div><span className="appearance-label">TRAINING MODE</span><div className="segmented-control"><button className={settings.trainingMode === 'precision' ? 'selected' : ''} onClick={() => update('trainingMode', 'precision')}>PRECISION</button><button className={settings.trainingMode === 'weapon' ? 'selected' : ''} onClick={() => update('trainingMode', 'weapon')}>WEAPON FEEL</button></div><small>{settings.trainingMode === 'precision' ? 'Perfect bullet accuracy; recoil remains independently selectable.' : 'Configured spread and sustained-fire inaccuracy enabled.'}</small></div><label className="settings-field recoil-select"><span className="appearance-label">RECOIL MODEL</span><select value={settings.recoilMode} onChange={(event) => update('recoilMode', event.target.value as RecoilMode)}>{recoilModes.map((mode) => <option key={mode.id} value={mode.id}>{mode.name}</option>)}</select></label></div>
    <div className="weapon-toggles"><label><span>Unlimited ammunition</span><input type="checkbox" checked={settings.unlimitedAmmo} onChange={(event) => update('unlimitedAmmo', event.target.checked)} /></label><label><span>Automatic reload</span><input type="checkbox" checked={settings.automaticReload} onChange={(event) => update('automaticReload', event.target.checked)} /></label><label><span>ADS behavior</span><select value={settings.aimMode} onChange={(event) => update('aimMode', event.target.value as AimMode)}><option value="hold">Hold right mouse</option><option value="toggle">Toggle right mouse</option></select></label></div>
    <label className="ads-transition-control">ADS TRANSITION SPEED <strong>{settings.adsTransitionSpeed.toFixed(0)}</strong><input type="range" min="3" max="24" step="1" value={settings.adsTransitionSpeed} onChange={(event) => update('adsTransitionSpeed', Number(event.target.value))} /></label>
    <div className="custom-weapon-actions"><button className="small-action" onClick={() => openEditor()}><Copy size={13} /> DUPLICATE / CREATE</button>{isCustom && <><button className="small-action" onClick={() => openEditor(selected)}>EDIT</button><button className="small-action destructive" onClick={() => { onDeleteCustom(selected.id); update('weaponId', weaponProfiles[0].id) }}><Trash2 size={13} /> DELETE</button></>}</div>
    {draft && <div className="weapon-editor"><div className="weapon-editor-head"><strong>{editingId ? 'EDIT PROFILE' : 'CUSTOM WEAPON CREATOR'}</strong><button aria-label="Close editor" onClick={() => setDraft(null)}><X size={15} /></button></div><div className="weapon-editor-grid">
      <label>NAME<input value={draft.name} onChange={(event) => setDraftValue('name', event.target.value)} /></label>
      <label>CATEGORY<select value={draft.category} onChange={(event) => setDraftValue('category', event.target.value as WeaponProfile['category'])}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
      <label>FIRE MODE<select value={draft.fireMode} onChange={(event) => { const mode = event.target.value as WeaponProfile['fireMode']; setDraftValue('fireMode', mode); setDraftValue('automatic', mode === 'automatic') }}>{modes.map((mode) => <option key={mode} value={mode}>{mode.toUpperCase()}</option>)}</select></label>
      <NumberField label="RPM" value={draft.roundsPerMinute} min={30} max={1800} step={10} onChange={(value) => setDraftValue('roundsPerMinute', value)} />
      <NumberField label="MAGAZINE SIZE" value={draft.magazineSize} min={1} max={200} onChange={(value) => setDraftValue('magazineSize', value)} />
      <NumberField label="RESERVE AMMO" value={draft.reserveAmmo} min={0} max={999} onChange={(value) => setDraftValue('reserveAmmo', value)} />
      <NumberField label="RELOAD MS" value={draft.reloadTime} min={250} max={8000} step={50} onChange={(value) => setDraftValue('reloadTime', value)} />
      <NumberField label="BURST COUNT" value={draft.burstCount} min={2} max={8} onChange={(value) => setDraftValue('burstCount', value)} />
      <NumberField label="BURST DELAY MS" value={draft.burstDelay} min={50} max={2000} step={10} onChange={(value) => setDraftValue('burstDelay', value)} />
      <NumberField label="BOLT DELAY MS" value={draft.boltDelay} min={50} max={4000} step={10} onChange={(value) => setDraftValue('boltDelay', value)} />
      <label className="weapon-editor-check"><span>Recoil enabled</span><input type="checkbox" checked={draft.recoilEnabled} onChange={(event) => setDraftValue('recoilEnabled', event.target.checked)} /></label>
      <NumberField label="VERTICAL RECOIL" value={draft.verticalRecoil} min={0} max={2} step={0.01} onChange={(value) => setDraftValue('verticalRecoil', value)} />
      <NumberField label="HORIZONTAL RECOIL" value={draft.horizontalRecoil} min={0} max={2} step={0.01} onChange={(value) => setDraftValue('horizontalRecoil', value)} />
      <NumberField label="RECOIL RANDOMNESS" value={draft.recoilRandomness} min={0} max={1} step={0.01} onChange={(value) => setDraftValue('recoilRandomness', value)} />
      <NumberField label="RECOIL RECOVERY" value={draft.recoilRecoverySpeed} min={0} max={10} step={0.1} onChange={(value) => setDraftValue('recoilRecoverySpeed', value)} />
      <NumberField label="BASE SPREAD" value={draft.baseSpread} min={0} max={4} step={0.01} onChange={(value) => setDraftValue('baseSpread', value)} />
      <NumberField label="SUSTAINED SPREAD" value={draft.sustainedSpread} min={0} max={2} step={0.01} onChange={(value) => setDraftValue('sustainedSpread', value)} />
      <NumberField label="MOVEMENT SPREAD" value={draft.movementSpread} min={0} max={4} step={0.01} onChange={(value) => setDraftValue('movementSpread', value)} />
      <NumberField label="AIRBORNE SPREAD" value={draft.airborneSpread} min={0} max={8} step={0.01} onChange={(value) => setDraftValue('airborneSpread', value)} />
      <NumberField label="FIRST-SHOT MULTIPLIER" value={draft.firstShotAccuracy} min={0} max={1} step={0.01} onChange={(value) => setDraftValue('firstShotAccuracy', value)} />
      <NumberField label="FIRST-SHOT RESET MS" value={draft.firstShotResetTime} min={50} max={2000} step={10} onChange={(value) => setDraftValue('firstShotResetTime', value)} />
      <NumberField label="PELLET COUNT" value={draft.pelletsPerShot} min={1} max={24} onChange={(value) => setDraftValue('pelletsPerShot', value)} />
      <label>PROJECTILE TYPE<select value={draft.projectileType} onChange={(event) => setDraftValue('projectileType', event.target.value as WeaponProfile['projectileType'])}><option value="hitscan">HITSCAN</option><option value="pellets">PELLETS</option></select></label>
      <NumberField label="PROJECTILE SPEED" value={draft.projectileSpeed} min={0} max={3000} step={10} onChange={(value) => setDraftValue('projectileSpeed', value)} />
      <label className="weapon-editor-check"><span>ADS available</span><input type="checkbox" checked={draft.zoomAvailable} onChange={(event) => setDraftValue('zoomAvailable', event.target.checked)} /></label>
      <NumberField label="ADS FOV" value={draft.zoomFOV} min={15} max={100} onChange={(value) => setDraftValue('zoomFOV', value)} />
      <NumberField label="ADS SENS. MULTIPLIER" value={draft.adsSensitivityMultiplier} min={0.1} max={2} step={0.05} onChange={(value) => setDraftValue('adsSensitivityMultiplier', value)} />
    </div><button className="primary-button weapon-save" onClick={saveDraft}><Plus size={14} /> SAVE WEAPON PROFILE</button></div>}
  </section>
}

function NumberField({ label, value, min, max, step = 1, onChange }: { label: string; value: number; min: number; max: number; step?: number; onChange: (value: number) => void }) {
  return <label>{label}<input type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Math.max(min, Math.min(max, Number(event.target.value))))} /></label>
}
