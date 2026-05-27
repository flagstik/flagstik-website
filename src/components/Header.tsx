/**
 * Header.tsx — Fixed top navigation
 * ─── EDIT THESE ───────────────────────────────────────────────────────────────
 */
const SITE_NAME = 'Flagstik'
const NAV_LINKS = [
  { label: 'Get In Touch', href: '#contacts' },
  { label: 'About',        href: '#agency' },
]

export default function Header() {
  return (
    <header
      id="main-header"
      style={{
        opacity:   0,
        position:  'fixed',
        top:       0,
        left:      0,
        right:     0,
        zIndex:    40,
        padding:   '12px 0',
        background:'transparent',
      }}
    >
      <nav style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        padding:        '0 clamp(24px, 4vw, 80px)',
      }}>
        {/* Logo */}
        <a href="/" data-cursor="400" style={{
          color:          '#fff',
          textDecoration: 'none',
          fontFamily:     'Oswald, sans-serif',
          fontWeight:     700,
          fontSize:       '1.5rem',
          letterSpacing:  '0.05em',
        }}>
          {SITE_NAME}
        </a>

        {/* Nav links */}
        <ul style={{
          display:    'flex',
          gap:        32,
          alignItems: 'center',
          listStyle:  'none',
        }}>
          {NAV_LINKS.map(l => (
            <li key={l.href}>
              <a href={l.href} data-cursor="100" style={{
                color:          '#fff',
                textDecoration: 'none',
                fontSize:       '1.1rem',
                fontFamily:     'sans-serif',
              }}>
                {l.label}
              </a>
            </li>
          ))}

          {/* Hamburger */}
          <li>
            <button
              data-cursor="100"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <svg width="24" height="18" viewBox="0 0 24 18" fill="none">
                <path d="M1 1h22M1 9h22M1 17h22" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  )
}
