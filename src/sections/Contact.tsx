const EMAIL = 'hello@flagstik.com'

export default function Contact() {
  return (
    <section id="contacts" style={{
      minHeight:  '50vh',
      padding:    'clamp(60px,8vw,160px) 0',
      display:    'flex',
      alignItems: 'center',
      background: '#fff',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div className="words-splitted" data-amount="2">
          <p style={{
            color:      '#0a0a0a',
            fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, 'Cormorant Garamond', Georgia, serif",
            fontStyle:  'italic',
            marginBottom: 8,
            marginLeft:   4,
            fontSize:   '1.1rem',
          }}>
            ready to tee off?
          </p>
          <h2 style={{
            margin:     0,
            fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, 'Cormorant Garamond', Georgia, serif",
            fontWeight: 300,
            fontSize:   'clamp(2rem, 7vw, 8rem)',
            color:      'rgba(0,0,0,0.85)',
          }}>
            <a href={`mailto:${EMAIL}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {EMAIL}
            </a>
          </h2>
        </div>
      </div>
    </section>
  )
}
