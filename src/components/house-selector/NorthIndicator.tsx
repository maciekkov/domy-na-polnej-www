/** North orientation is source geometry: 135° clockwise from screen-up. */
export function NorthIndicator() {
  return <svg className="masterplan-north" viewBox="0 0 80 80" width="80" height="80" role="img" aria-label="Północ — ukośnie w dół i w prawo, kierunek godziny 4:30" data-north-angle="135" focusable="false">
    <title>Północ — godzina 4:30</title>
    <circle cx="40" cy="40" r="38" fill="#fdfcf8" stroke="#d8c9ae" />
    <circle cx="40" cy="40" r="29" fill="none" stroke="#344e3f" strokeOpacity=".16" />
    <path d="M40 8v5M40 67v5M8 40h5M67 40h5" stroke="#344e3f" strokeOpacity=".35" />
    <g transform="rotate(135 40 40)">
      <path d="M40 17L31 43L40 39L49 43Z" fill="#243b33" data-north-needle="true" />
      <path d="M40 63L31 43L40 46L49 43Z" fill="#d8c9ae" />
    </g>
    <circle cx="40" cy="40" r="2.5" fill="#fdfcf8" stroke="#243b33" />
    <text x="65" y="68" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="700" fill="#243b33">N</text>
  </svg>
}
