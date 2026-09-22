import { publicAssetUrl } from '../services/environment'

export function BrandMark() {
  return <img className="brand-mark" src={publicAssetUrl('/assets/hj-logo-112.png')} width="28" height="28" alt="" aria-hidden="true" />
}
