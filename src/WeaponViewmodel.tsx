import { forwardRef, useState } from 'react'
import type { WeaponProfile } from './weapons'
import type { ViewmodelSettings } from './viewmodel'

interface WeaponViewmodelProps {
  weapon: WeaponProfile
  settings: ViewmodelSettings
}

const WeaponViewmodel = forwardRef<HTMLDivElement, WeaponViewmodelProps>(function WeaponViewmodel({ weapon, settings }, ref) {
  const [imageFailed, setImageFailed] = useState(false)
  const position = settings.position === 'left' ? 'left' : settings.position === 'center' ? 'center' : 'right'
  return <div ref={ref} className={`weapon-viewmodel position-${position}`} style={{ '--view-x': `${settings.x}px`, '--view-y': `${settings.y}px`, '--view-z': `${settings.z}px`, '--view-scale': settings.scale, '--view-fov': `${settings.fov}deg`, '--view-recoil': settings.visualRecoil / 100 } as React.CSSProperties} aria-hidden="true">
    {imageFailed ? <div className="viewmodel-image-fallback"><span className="fallback-slide" /><span className="fallback-grip" /><span className="fallback-barrel" /></div> : <img className="viewmodel-image" src="/assets/pistol.png" alt="" onError={() => setImageFailed(true)} />}
    <span className="viewmodel-flash" />
    <span className="viewmodel-label">{weapon.name.toUpperCase()}</span>
  </div>
})

export default WeaponViewmodel
