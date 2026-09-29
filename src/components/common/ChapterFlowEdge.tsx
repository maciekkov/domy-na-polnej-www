/** Decorative chapter boundaries. They never contain content or capture pointer events. */
type ChapterFlowVariant = 'explore' | 'trust' | 'process'

const curves: Record<ChapterFlowVariant, string> = {
  explore: 'M0 14 C160 94 270 99 430 101 C610 103 649 159 866 133 C1085 107 1213 65 1407 105 C1493 123 1540 135 1600 143',
  trust: 'M0 18 C180 67 307 124 500 97 C649 74 721 65 861 88 C1041 142 1133 137 1326 107 C1462 86 1533 85 1600 81',
  process: 'M0 63 C177 124 310 102 476 101 C674 100 735 148 951 127 C1175 105 1327 93 1468 109 C1520 119 1568 135 1600 148',
}

export function ChapterFlowEdge({ variant }: { variant: ChapterFlowVariant }) {
  const curve = curves[variant]
  // The trust chapter reveals its actual existing forest background below the paper cap.
  const closure = variant === 'trust' ? ' L1600 -2 L0 -2 Z' : ' L1600 182 L0 182 Z'
  return (
    <div className={`chapter-flow-edge chapter-flow-edge--${variant}`} aria-hidden="true">
      <svg viewBox="0 0 1600 180" preserveAspectRatio="none" focusable="false">
        <path className="chapter-flow-edge__paper" d={curve + closure} />
        <path className="chapter-flow-edge__champagne" d={curve} />
        <path className="chapter-flow-edge__gold" d={curve} />
      </svg>
    </div>
  )
}
