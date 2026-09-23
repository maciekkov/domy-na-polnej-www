/**
 * Orientation of the supplied masterplan: north is 135° clockwise from screen-up.
 * Do not rotate this component in CSS: both the needle and N already point down-right.
 * This is a UI direction marker, not a decorative/animated compass.
 */
export function NorthIndicator() {
  return (
    <svg
      className="masterplan-north"
      viewBox="0 0 72 72"
      width="72"
      height="72"
      role="img"
      aria-label="Północ — ukośnie w dół i w prawo, kierunek godziny 4:30"
      data-north-angle="135"
      focusable="false"
    >
      <title>Północ — godzina 4:30</title>
      <rect x=".75" y=".75" width="70.5" height="70.5" rx="16" fill="#FAF8F3" stroke="#D8D9CD" strokeWidth="1.5" />
      <circle cx="31" cy="31" r="20" fill="none" stroke="#D7DCCD" strokeWidth="1" />
      <path d="M17 45L45 17M13 31H17M31 13V17" fill="none" stroke="#B8C0A9" strokeWidth="1" />
      <path d="M17 17L33 33" fill="none" stroke="#9AA38B" strokeWidth="1.5" strokeLinecap="round" />
      {/* Needle tip (49,49) and center (31,31): equal positive x/y = 4:30. */}
      <path data-north-needle="true" d="M49 49L28 37L35 35L37 28Z" fill="#465331" stroke="#465331" strokeWidth="1" strokeLinejoin="round" />
      <path d="M49 49L35 35L37 28Z" fill="#A77B43" />
      <circle cx="31" cy="31" r="2.2" fill="#465331" />
      <text x="57" y="62" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="15" fontWeight="700" fill="#344024">N</text>
    </svg>
  )
}
