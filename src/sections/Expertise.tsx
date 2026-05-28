const AREAS = [
  { title: 'Strategy',  items: ['Brand Strategy', 'SEO Optimization', 'Digital Marketing', 'Analytics & Growth', 'Consultation'] },
  { title: 'Design',    items: ['Custom Web Design', 'Logo & Branding', 'UX/UI Design', 'Course Photography', 'Drone Aerials'] },
  { title: 'Tech',      items: ['Web Development', 'Online Booking', 'Tournament Management', 'E-Commerce', '3D Mapping'] },
  { title: 'Support',   items: ['Site Maintenance', 'Performance Updates', 'Content Management', 'Hosting', 'Ongoing Support'] },
]

export default function Expertise() {
  return (
    <section id="expertise" style={{
      minHeight:     '100vh',
      marginBottom:  '50vh',
      padding:       'clamp(80px, 10vw, 160px) 0',
      display:       'flex',
      flexDirection: 'column',
      justifyContent:'center',
      background:    '#fff',
    }}>
      <div style={{ overflow: 'hidden', marginBottom: 80 }}>
        <h3 className="strip" data-amount="0.5" style={{
          fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, 'Cormorant Garamond', Georgia, serif",
          fontWeight: 400,
          color:      '#0a0a0a',
          fontSize:   'clamp(3rem, 8vw, 9rem)',
          margin:     0,
          fontStyle:  'italic',
        }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ marginRight: '4rem', display: 'flex', gap: '0.4em', alignItems:'baseline' }}>
              <span>Our </span>
              <span style={{ WebkitTextStroke: '1px #0a0a0a', color: 'transparent' }}>services</span>
            </span>
          ))}
        </h3>
      </div>

      <div style={{ padding: '0 clamp(24px, 4vw, 80px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
          {AREAS.map(area => (
            <div key={area.title} className="words-splitted" data-amount="1">
              <h3 style={{
                color:         '#0a0a0a',
                fontFamily:    "'Palatino Linotype', 'Book Antiqua', Palatino, 'Cormorant Garamond', Georgia, serif",
                fontWeight:    400,
                fontSize:      '1.6rem',
                borderBottom:  '1px solid rgba(0,0,0,0.15)',
                paddingBottom: 12,
                marginBottom:  16,
              }}>
                {area.title}
              </h3>
              <ul style={{ listStyle: 'none' }}>
                {area.items.map(item => (
                  <li key={item} style={{
                    padding:    '8px 0',
                    color:      'rgba(0,0,0,0.65)',
                    fontSize:   '1.05rem',
                    fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, 'Cormorant Garamond', Georgia, serif",
                    fontWeight: 400,
                  }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
