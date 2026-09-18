/** Client/server contract: text lengths are counted in Unicode characters. */
const length=value=>Array.from(value).length
export function validateContact(fields){
 const errors={}
 const name=String(fields.name??'').trim(),phone=String(fields.phone??''),email=String(fields.email??'').trim(),message=String(fields.message??'')
 if(length(name)<2||length(name)>100)errors.name='Podaj imię: od 2 do 100 znaków.'
 const digits=phone.replace(/\D/g,'')
 if(digits.length<7||digits.length>15||!/^[+\d\s().-]+$/.test(phone)||length(phone)>50)errors.phone='Podaj numer telefonu: od 7 do 15 cyfr.'
 if(email && (length(email)>160||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||/[\r\n]/.test(email)))errors.email='Podaj poprawny e-mail lub pozostaw to pole puste.'
 if(length(message)>3000)errors.message='Wiadomość może mieć maksymalnie 3000 znaków.'
 if(fields.consentContact!==true)errors.consentContact='Zaznacz zgodę na kontakt w sprawie oferty.'
 if(fields.consentPrivacy!==true)errors.consentPrivacy='Potwierdź zapoznanie się z polityką prywatności.'
 return errors
}
