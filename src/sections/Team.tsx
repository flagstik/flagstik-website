const TEAM = [
  { name: 'Dallas',  role: 'Web Designer & Developer',           linkedin: 'https://www.linkedin.com/company/flagstik', outline: false },
  { name: 'Jon',     role: 'Designer, Photographer & Marketer',  linkedin: 'https://www.linkedin.com/company/flagstik', outline: true  },
]

const ROWS = [
  [...TEAM, ...TEAM, ...TEAM, ...TEAM],
  [...TEAM, ...TEAM, ...TEAM, ...TEAM],
]
const DURATIONS = [32, 28]

export default function Team() {
  return (
    <section id="team" style={{
      minHeight:     '100vh',
      padding:       'clamp(80px,10vw,160px) 0',
      display:       'flex',
      flexDirection: 'column',
      justifyContent:'center',
      background:    '#fff',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', width: '100%', marginBottom: 80 }}>
        <div className="words-splitted" data-amount="3">
          <h2 style={{
            fontFamily:    "'Palatino Linotype', 'Book Antiqua', Palatino, 'Cormorant Garamond', Georgia, serif",
            fontWeight:    400,
            color:         '#0a0a0a',
            fontSize:      'clamp(2.5rem, 6vw, 6rem)',
            textTransform: 'uppercase',
            lineHeight:    1,
            margin:        0,
          }}>
            THE<br/>
            <span style={{ WebkitTextStroke: '1px #0a0a0a', color: 'transparent' }}>FLAGSTIK</span><br/>
            TEAM
          </h2>
        </div>
      </div>

      <div style={{ overflow: 'hidden' }}>
        {ROWS.map((row, ri) => (
          <h3
            key={ri}
            className={`strip slower ${ri % 2 === 1 ? 'reverse' : ''}`}
            data-amount="0.5"
            data-duration={DURATIONS[ri]}
            data-direction={ri % 2 === 1 ? 'reverse' : undefined}
            style={{
              whiteSpace:  'nowrap',
              display:     'flex',
              marginTop:   ri > 0 ? 48 : 80,
              fontFamily:  "'Palatino Linotype', 'Book Antiqua', Palatino, 'Cormorant Garamond', Georgia, serif",
              fontSize:    'clamp(2rem, 5vw, 4rem)',
              fontWeight:  400,
              color:       '#0a0a0a',
            }}
          >
            {[...row, ...row].map((m, i) => (
              <span key={i} style={{ marginRight: '3rem' }}>
                <span style={m.outline ? { WebkitTextStroke: '1px #0a0a0a', color: 'transparent' } : {}}>
                  {m.name}
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 400, marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(0,0,0,0.6)', fontStyle: 'italic' }}>
                  {m.role}
                  <a href={m.linkedin} target="_blank" rel="noreferrer" data-cursor="60" onClick={e => e.stopPropagation()}>
                    <img src="/linkedin-in.svg" width={18} height={18} alt="LinkedIn" />
                  </a>
                </div>
              </span>
            ))}
          </h3>
        ))}
      </div>
    </section>
  )
}
