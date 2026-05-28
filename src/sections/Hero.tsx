/**
 * Hero.tsx — "ELEVATE YOUR COURSE" full-viewport hero
 * Text sits in the lower-left, particle system floats right.
 * GSAP SplitText handles the word stagger on load.
 *
 * ─── EDIT THESE to customize ──────────────────────────────────────────────────
 */
const HEADLINE_OUTLINE = 'ELEVATE'
const HEADLINE_SOLID   = ['YOUR', 'COURSE']
const SUBHEAD = (
  <>
    We create <strong>tailored web solutions</strong> at the intersection of{' '}
    <strong>design</strong> and <strong>technology</strong>, helping golf courses to{' '}
    <strong>attract members</strong> and grow their online presence, today.
  </>
)
// ─────────────────────────────────────────────────────────────────────────────

export default function Hero() {
  return (
    <section
      id="home"
      style={{
        color:         '#0a0a0a',
        minHeight:     '100vh',
        display:       'flex',
        alignItems:    'flex-end',
        paddingBottom: 'clamp(80px, 10vw, 240px)',
        marginBottom:  '50vh',
      }}
    >
      <div style={{ width: '100%', padding: '0 clamp(24px, 4vw, 80px)' }}>
        <h1
          id="main-title"
          style={{
            opacity:       0,
            fontFamily:    'Oswald, sans-serif',
            fontWeight:    700,
            fontSize:      'clamp(3.5rem, 10vw, 9rem)',
            lineHeight:    1,
            textTransform: 'uppercase',
            margin:        0,
          }}
        >
          <span
            style={{
              WebkitTextStroke: '2px #0a0a0a',
              color:            'transparent',
              display:          'block',
            }}
          >
            {HEADLINE_OUTLINE}
          </span>
          {HEADLINE_SOLID.map(word => (
            <span key={word} style={{ display: 'block' }}>{word}</span>
          ))}
        </h1>

        <p
          id="main-description"
          style={{
            opacity:    0,
            maxWidth:   640,
            marginTop:  24,
            fontSize:   'clamp(1rem, 1.5vw, 1.25rem)',
            lineHeight: 1.4,
            fontFamily: 'sans-serif',
            fontWeight: 400,
            color:      'rgba(0,0,0,0.75)',
          }}
        >
          {SUBHEAD}
        </p>
      </div>
    </section>
  )
}
