/**
 * Header.tsx — Minimal fixed nav: hamburger left, Flagstik logo right.
 * White icons — sit over the hero image.
 */
export default function Header() {
  return (
    <header
      id="main-header"
      style={{
        opacity:    0,
        position:   'fixed',
        top:        0,
        left:       0,
        right:      0,
        zIndex:     40,
        padding:    'clamp(20px, 3vw, 40px) clamp(24px, 4vw, 60px)',
        display:    'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'transparent',
      }}
    >
      {/* ── Hamburger — top left ─────────────────────────────────────────── */}
      <button
        data-cursor="80"
        aria-label="Menu"
        style={{
          background: 'none',
          border:     'none',
          cursor:     'pointer',
          padding:    0,
          display:    'flex',
          flexDirection: 'column',
          gap:        6,
        }}
      >
        <span style={{ display: 'block', width: 28, height: 1.5, background: '#fff', borderRadius: 2 }} />
        <span style={{ display: 'block', width: 20, height: 1.5, background: '#fff', borderRadius: 2 }} />
        <span style={{ display: 'block', width: 28, height: 1.5, background: '#fff', borderRadius: 2 }} />
      </button>

      {/* ── Flagstik logo mark — top right ──────────────────────────────── */}
      <img
        src="/flagstik-logo.svg"
        alt="Flagstik"
        data-cursor="80"
        style={{
          height:  44,
          width:   'auto',
          display: 'block',
          filter:  'brightness(0) invert(1)',  // force white
          opacity: 0.9,
        }}
      />
    </header>
  )
}
