/**
 * Cursor.tsx
 * Custom circular cursor that grows/shrinks on interactive elements.
 * Hidden on mobile (touch) devices.
 */
import { useEffect } from 'react'
import gsap from 'gsap'

export default function Cursor() {
  useEffect(() => {
    const el = document.getElementById('cursor')
    if (!el) return
    const isMobile = window.innerWidth <= 768
    if (isMobile) return

    const onMove = (e: MouseEvent) => {
      gsap.set(el, { top: e.clientY, left: e.clientX })
    }
    window.addEventListener('mousemove', onMove)

    // All [data-cursor] elements control the circle size
    const targets = document.querySelectorAll<HTMLElement>('[data-cursor]')
    targets.forEach(t => {
      t.addEventListener('mouseenter', () => {
        gsap.to(el, { width: t.dataset.cursor, duration: 0.3, ease: 'power2.out' })
      })
      t.addEventListener('mouseleave', () => {
        gsap.to(el, { width: 16, duration: 0.3, ease: 'power2.out' })
      })
    })

    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      id="cursor"
      style={{
        position:     'fixed',
        width:        16,
        height:       16,
        borderRadius: '50%',
        border:       '1px solid rgba(0,0,0,0.5)',
        pointerEvents:'none',
        zIndex:       200,
        transform:    'translate(-50%,-50%)',
        mixBlendMode: 'difference',
      }}
    />
  )
}
