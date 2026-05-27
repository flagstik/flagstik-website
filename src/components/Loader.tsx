/**
 * Loader.tsx
 * Full-screen loading overlay with animated counter (0→100)
 * GSAP animates it out once models are ready.
 */
export default function Loader() {
  return (
    <div
      id="loader"
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         100,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:     '#000',
        color:          '#fff',
        fontFamily:     'Oswald, sans-serif',
        fontSize:       'clamp(3rem, 10vw, 8rem)',
        fontWeight:     700,
        pointerEvents:  'none',
      }}
    >
      <span id="counter">0</span>
    </div>
  )
}
