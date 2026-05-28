export default function Agency() {
  return (
    <section id="agency" style={{
      minHeight:   '100vh',
      marginBottom:'50vh',
      padding:     'clamp(80px, 10vw, 160px) clamp(24px, 4vw, 80px)',
      display:     'flex',
      alignItems:  'center',
      background:  '#fff',
    }}>
      <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80 }}>
        <div style={{ gridColumnStart: 2 }} className="words-splitted" data-amount="2.5">
          <h2 style={{
            fontFamily:    "'Palatino Linotype', 'Book Antiqua', Palatino, 'Cormorant Garamond', Georgia, serif",
            fontWeight:    400,
            color:         '#0a0a0a',
            fontSize:      'clamp(2.5rem, 6vw, 6rem)',
            textTransform: 'uppercase',
            lineHeight:    1,
            margin:        '0 0 24px',
          }}>
            FLAGSTIK
          </h2>
          <p style={{
            color:      'rgba(0,0,0,0.75)',
            fontSize:   'clamp(1rem, 1.5vw, 1.4rem)',
            lineHeight: 1.6,
            fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, 'Cormorant Garamond', Georgia, serif",
            fontWeight: 400,
          }}>
            We believe that the <em>power of creativity, design and passion for golf</em> is
            the key to connecting courses with their community. Whether you&apos;re looking to{' '}
            attract new members, showcase stunning fairways, or improve member engagement —{' '}
            we&apos;re here to help.
          </p>
        </div>
      </div>
    </section>
  )
}
