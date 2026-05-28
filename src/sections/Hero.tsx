/**
 * Hero.tsx — Golf course photo with particles in the sky.
 * Upper area is transparent so the ThreeScene canvas sky shows through.
 * Image is masked at the top so it fades into the canvas sky seamlessly.
 */
export default function Hero() {
  return (
    <section
      id="home"
      style={{
        position:  'relative',
        height:    '100vh',
        minHeight: '600px',
        overflow:  'hidden',
        background:'transparent',
      }}
    >
      {/* Tagline — sits just below the Flagstik logo particle */}
      <div
        style={{
          position:      'absolute',
          top:           '46%',
          left:          '50%',
          transform:     'translateX(-50%)',
          textAlign:     'center',
          pointerEvents: 'none',
          zIndex:        2,
          whiteSpace:    'nowrap',
        }}
      >
        <p style={{
          fontFamily:    "'Palatino Linotype', 'Book Antiqua', Palatino, 'Cormorant Garamond', Georgia, serif",
          fontWeight:    400,
          fontSize:      'clamp(0.9rem, 1.4vw, 1.25rem)',
          color:         'rgba(255,255,255,0.85)',
          letterSpacing: '0.18em',
        }}>
          making golf modern.
        </p>
      </div>
    </section>
  )
}
