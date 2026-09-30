import type { AimMode, RecoilMode, TrainingMode, WeaponProfile } from './weapons'

export interface WeaponShot {
  firedAt: number
  spreadDegrees: number
  recoilHorizontal: number
  recoilVertical: number
  pellets: number
}

export class WeaponManager {
  magazine: number
  reserve: number
  reloadingUntil = 0
  reloadStartedAt = 0
  aiming = false
  airborne = false
  recoilBuildup = 0
  private nextShotAt = 0
  private lastShotAt = -Infinity
  private lastUpdateAt = 0
  private burstRemaining = 0
  private wasAdsHeld = false
  private adsToggle = false
  private lastAimMovementAt = -Infinity

  constructor(
    readonly profile: WeaponProfile,
    readonly unlimitedAmmo: boolean,
    private readonly automaticReload: boolean,
    private readonly aimMode: AimMode,
  ) {
    this.magazine = profile.magazineSize
    this.reserve = profile.reserveAmmo
  }

  get isReloading() { return this.reloadingUntil > 0 }
  get currentSpreadDegrees() { return this.profile.baseSpread + this.profile.sustainedSpread * this.recoilBuildup }
  getReloadProgress(now: number) {
    if (!this.isReloading) return 0
    return Math.min(1, (now - this.reloadStartedAt) / this.profile.reloadTime)
  }

  setAds(held: boolean) {
    if (this.aimMode === 'toggle' && held && !this.wasAdsHeld) this.adsToggle = !this.adsToggle
    this.wasAdsHeld = held
    this.aiming = this.aimMode === 'toggle' ? this.adsToggle : held
  }

  setAirborne(airborne: boolean) { this.airborne = airborne }
  registerAimMovement(now: number) { this.lastAimMovementAt = now }

  reload(now: number) {
    if (this.unlimitedAmmo || this.isReloading || this.magazine >= this.profile.magazineSize || this.reserve <= 0) return false
    this.reloadStartedAt = now
    this.reloadingUntil = now + this.profile.reloadTime
    this.burstRemaining = 0
    return true
  }

  update(now: number, triggerHeld: boolean, triggerPressed: boolean, mode: TrainingMode, recoilMode: RecoilMode): WeaponShot[] {
    const delta = this.lastUpdateAt ? Math.min(now - this.lastUpdateAt, 50) / 1000 : 0
    this.lastUpdateAt = now
    if (this.reloadingUntil && now >= this.reloadingUntil) {
      const needed = this.profile.magazineSize - this.magazine
      const loaded = Math.min(needed, this.reserve)
      this.magazine += loaded
      this.reserve -= loaded
      this.reloadingUntil = 0
      this.reloadStartedAt = 0
    }
    if (this.lastShotAt + this.profile.firstShotResetTime <= now) this.recoilBuildup = Math.max(0, this.recoilBuildup - delta * this.profile.recoilRecoverySpeed)

    if (this.profile.fireMode === 'burst' && triggerPressed && this.burstRemaining === 0 && now >= this.nextShotAt) {
      this.burstRemaining = this.profile.burstCount
    }
    const interval = 60_000 / this.profile.roundsPerMinute
    const shots: WeaponShot[] = []
    let pressedAvailable = triggerPressed

    while (shots.length < 8 && !this.isReloading && (this.unlimitedAmmo || this.magazine > 0)) {
      const shouldFire = this.profile.fireMode === 'automatic'
        ? triggerHeld || pressedAvailable
        : this.profile.fireMode === 'burst'
          ? this.burstRemaining > 0
          : pressedAvailable
      if (!shouldFire || now < this.nextShotAt) break

      const firedAt = now
      shots.push(this.createShot(firedAt, mode, recoilMode))
      if (!this.unlimitedAmmo) this.magazine--
      this.lastShotAt = firedAt
      this.recoilBuildup = Math.min(8, this.recoilBuildup + 1)
      pressedAvailable = false

      if (this.profile.fireMode === 'burst') {
        this.burstRemaining--
        this.nextShotAt = firedAt + (this.burstRemaining ? interval : this.profile.burstDelay)
      } else {
        const cooldown = this.profile.fireMode === 'bolt' ? Math.max(interval, this.profile.boltDelay) : interval
        this.nextShotAt = firedAt + cooldown
        if (this.profile.fireMode !== 'automatic') break
      }
    }

    if (!this.unlimitedAmmo && this.magazine <= 0 && this.automaticReload) this.reload(now)
    return shots
  }

  getAmmoText() {
    return this.unlimitedAmmo ? '∞ / ∞' : `${this.magazine} / ${this.reserve}`
  }

  private createShot(firedAt: number, mode: TrainingMode, recoilMode: RecoilMode): WeaponShot {
    const buildup = Math.max(0, this.recoilBuildup)
    const firstShot = firedAt - this.lastShotAt >= this.profile.firstShotResetTime
    const moving = firedAt - this.lastAimMovementAt < 120
    const firingSpread = mode === 'precision' ? 0 : this.profile.baseSpread * (firstShot ? this.profile.firstShotAccuracy : 1) + this.profile.sustainedSpread * buildup + (moving ? this.profile.movementSpread : 0) + (this.airborne ? this.profile.airborneSpread : 0)
    const pattern = this.profile.recoilPattern[Math.floor(this.recoilBuildup) % this.profile.recoilPattern.length] ?? [0, 1]
    const horizontalNoise = (Math.random() * 2 - 1) * this.profile.recoilRandomness
    const verticalNoise = (Math.random() * 2 - 1) * this.profile.recoilRandomness * 0.3
    let recoilHorizontal = 0
    let recoilVertical = 0
    if (this.profile.recoilEnabled && recoilMode !== 'off') {
      const usePattern = recoilMode === 'pattern' || recoilMode === 'hybrid'
      const horizontalPattern = usePattern ? pattern[0] : 0
      const verticalPattern = usePattern ? pattern[1] : 1
      const randomScale = recoilMode === 'random' || recoilMode === 'hybrid' ? 1 : 0
      recoilHorizontal = (this.profile.horizontalRecoil * horizontalPattern + horizontalNoise * randomScale) * (1 + buildup * 0.16)
      recoilVertical = (this.profile.verticalRecoil * verticalPattern + verticalNoise * randomScale) * (1 + buildup * 0.16)
    }
    return {
      firedAt,
      spreadDegrees: firingSpread,
      recoilHorizontal,
      recoilVertical,
      pellets: this.profile.projectileType === 'pellets' ? this.profile.pelletsPerShot : 1,
    }
  }
}
