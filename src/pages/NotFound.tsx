import { ArrowLeft } from 'lucide-react'
import { BrandLogo } from '../components/common/BrandLogo'

export function NotFound() {
  return (
    <main className="not-found">
      <a className="not-found__brand" href="/" aria-label="Domy na Polnej — strona główna"><BrandLogo tone="dark" /></a>
      <div>
        <span>404</span>
        <h1>Nie znaleźliśmy tej strony.</h1>
        <p>Adres mógł się zmienić albo zawiera błąd. Wróć do strony inwestycji.</p>
        <a className="button button--olive" href="/"><ArrowLeft aria-hidden="true" /> Strona główna</a>
      </div>
    </main>
  )
}
