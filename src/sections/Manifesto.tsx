// ─── EDIT THIS ────────────────────────────────────────────────────────────────
const TEXT = 'Dedicated to elevating your golf course\'s online presence through custom digital solutions that highlight what makes your course truly unique.'

export default function Manifesto() {
  return (
    <section style={{
      minHeight:   '100vh',
      marginBottom:'50vh',
      padding:     'clamp(80px, 10vw, 160px) clamp(24px, 4vw, 80px)',
      display:     'flex',
      alignItems:  'center',
    }}>
      <div className="words-splitted" data-amount="3" style={{
        fontSize:      'clamp(1.6rem, 3.5vw, 3.5rem)',
        lineHeight:    1.2,
        color:         '#fff',
        fontFamily:    'Oswald, sans-serif',
        textTransform: 'uppercase',
        textAlign:     'center',
        width:         '100%',
        maxWidth:      1200,
        margin:        '0 auto',
      }}>
        <p>{TEXT}</p>
      </div>
    </section>
  )
}
