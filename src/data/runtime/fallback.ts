import baseline from '../../../public/data/site-data.json'
import { parseSiteData } from './siteSchema.mjs'
// The deployed public file and the last-known build fallback share one source.
export const fallbackSiteData = parseSiteData(baseline)
