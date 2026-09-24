import type { ContactData } from '../data/runtime/types'
export function legalContent(name: 'privacy'|'cookies',contact:ContactData): {title:string;lead:string;updated:string;body:string}
export function legalMarkup(name:'privacy'|'cookies',contact:ContactData):string
