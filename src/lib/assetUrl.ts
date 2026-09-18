import manifest from '../../public/assets/data/asset-versions.json'
const versions = manifest.assets as Record<string, string>
export function assetUrl(url: string): string {
  if (/[?&]v=/.test(url)) return url
  const key = url.startsWith('/') ? url : `/${url}`
  const version = versions[key]
  return version ? `${url}${url.includes('?') ? '&' : '?'}v=${version}` : url
}
