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
      {/* Golf image — full section, masked to fade out at top ~55% */}
      <img
        src="/hero-golf.jpg"
        alt=""
        aria-hidden
        style={{
          position:          'absolute',
          inset:             0,
          width:             '100%',
          height:            '100%',
          objectFit:         'cover',
          objectPosition:    'center bottom',
          display:           'block',
          userSelect:        'none',
          pointerEvents:     'none',
          WebkitMaskImage:   'linear-gradient(to bottom, transparent 0%, transparent 55%, black 78%, black 100%)',
          maskImage:         'linear-gradient(to bottom, transparent 0%, transparent 55%, black 78%, black 100%)',
        }}
      />

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
          fontStyle:     'italic',
          fontWeight:    400,
          fontSize:      'clamp(0.75rem, 1.1vw, 1rem)',
          color:         'rgba(255,255,255,0.85)',
          letterSpacing: '0.18em',
        }}>
          making golf modern.
        </p>
      </div>
    </section>
  )
}
