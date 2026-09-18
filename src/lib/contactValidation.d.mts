export type ContactErrors = Partial<Record<'name'|'phone'|'email'|'message'|'consentContact'|'consentPrivacy',string>>
export function validateContact(fields: {name: string;phone: string;email:string;message:string;consentContact:boolean;consentPrivacy:boolean}): ContactErrors
