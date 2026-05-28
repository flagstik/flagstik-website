/**
 * Hero.tsx — Full-screen golf course image with "flagstik." in the sky
 * Image anchored to the bottom; text floats in the negative space above.
 */

export default function Hero() {
  return (
    <section
      id="home"
      style={{
        position:   'relative',
        height:     '100vh',
        minHeight:  '600px',
        overflow:   'hidden',
        background: '#b8cdd6',   // sky fallback colour while image loads
      }}
    >
      {/* ── Golf course photo — anchored to bottom ───────────────────────── */}
      <img
        src="/hero-golf.jpg"
        alt=""
        aria-hidden
        style={{
          position:       'absolute',
          bottom:         0,
          left:           0,
          width:          '100%',
          height:         '100%',
          objectFit:      'cover',
          objectPosition: 'center bottom',
          display:        'block',
          userSelect:     'none',
          pointerEvents:  'none',
        }}
      />

      {/* ── "flagstik." — centred in the sky ─────────────────────────────── */}
      <div
        style={{
          position:        'absolute',
          inset:           0,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          paddingBottom:   '20vh',   // nudge up into the sky area
          pointerEvents:   'none',
        }}
      >
        <h1
          style={{
            margin:       0,
            fontFamily:   "'Palatino Linotype', 'Book Antiqua', Palatino, 'Cormorant Garamond', Georgia, serif",
            fontWeight:   400,
            fontSize:     'clamp(4rem, 10vw, 12rem)',
            letterSpacing:'0.01em',
            color:         '#fff',
            lineHeight:    1,
            whiteSpace:    'nowrap',
          }}
        >
          flagstik.
        </h1>
      </div>
    </section>
  )
}
