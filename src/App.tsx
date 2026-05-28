/**
 * App.tsx
 * GSAP ScrollSmoother + ScrollTrigger + SplitText wiring.
 *
 * Loading strategy:
 *  1. Counter runs immediately after mount (2s fake tween)
 *  2. Loader hides → hero content animates in
 *  3. Particle system builds in background (MeshSurfaceSampler is slow on big GLTFs)
 *  4. Particles fade in via uIntro whenever they're ready
 */
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { SplitText } from 'gsap/SplitText'

import ThreeScene, { type SceneHandle } from './components/ThreeScene'
import Loader    from './components/Loader'
import Cursor    from './components/Cursor'
import Header    from './components/Header'
import Hero      from './sections/Hero'
import Manifesto from './sections/Manifesto'
import Agency    from './sections/Agency'
import Expertise from './sections/Expertise'
import Team      from './sections/Team'
import Contact   from './sections/Contact'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText)
// Prevent GSAP from sleeping when tab is hidden (headless/preview browsers)
gsap.ticker.lagSmoothing(0)

export default function App() {
  const sceneRef = useRef<SceneHandle>(null)

  useEffect(() => {
    const isMobile = window.innerWidth <= 768
    const r = isMobile ? 0.5 : 1

    // ── ScrollSmoother ──────────────────────────────────────────────────────
    const smoother = ScrollSmoother.create({
      smooth: 1.5, speed: 1, smoothTouch: 0.2, effects: true,
    })
    smoother.scrollTo(0, false)

    document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]:not(.has-dropdown a)')
      .forEach(a => a.addEventListener('click', e => {
        e.preventDefault(); smoother.scrollTo(a.hash, true)
      }))

    // ── Scrolling text strips ───────────────────────────────────────────────
    document.querySelectorAll<HTMLElement>('.strip').forEach(el => {
      const dur = Number(el.dataset.duration) || 30
      const rev = el.dataset.direction === 'reverse'
      const tl  = gsap.to(el, {
        keyframes: { xPercent: rev ? [-25, 0] : [0, -25], ease: 'none', easeEach: 'none' },
        duration: dur, repeat: -1, ease: 'none',
      })
      const slow = gsap.to({ v: 1 }, {
        v: 0.15, paused: true,
        onUpdate() { tl.timeScale((this.targets()[0] as any).v) },
        ease: 'power3.out', duration: 0.5,
      })
      el.addEventListener('mouseenter', () => slow.play())
      el.addEventListener('mouseleave', () => slow.reverse())
    })

    // ── Word-split scroll reveals ───────────────────────────────────────────
    document.querySelectorAll<HTMLElement>('.words-splitted').forEach(el => {
      const amount   = Number(el.dataset.amount) || 0.5
      const splitted = new SplitText(el, { type: 'chars,words',
        wordsClass: 'overflow-hidden', charsClass: 'inline-block' })
      gsap.set(splitted.chars, { autoAlpha: 0, y: 100 })
      gsap.to(splitted.chars, {
        y: 0, autoAlpha: 1, stagger: { amount: amount / 2 }, ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start:   `top ${isMobile ? '60%' : '90%'}`,
          end:     () => `+=${window.innerHeight * (isMobile ? 1 : 1.5) / 2}px`,
        },
      })
    })

    // ── PHASE 1: Counter — uses performance.now() so throttled tabs still work ─
    const startTime  = performance.now()
    const COUNTER_MS = 1800   // total counter duration
    const timers: ReturnType<typeof setTimeout>[] = []

    // Fire every 50ms; even if throttled to 1s, value is always correct
    const counterInterval = setInterval(() => {
      const pct = Math.min((performance.now() - startTime) / COUNTER_MS, 1)
      const val = Math.round(pct * 100)
      const el  = document.getElementById('counter')
      if (el) el.textContent = String(val)
      if (pct >= 1) {
        clearInterval(counterInterval)
        runIntro()
      }
    }, 50)

    // ── PHASE 2: Intro — setTimeout-based so it works even when RAF is frozen ─
    // Use gsap.set/to for elements GSAP previously touched (avoids cache override)
    function runIntro() {
      // Kill any lingering GSAP tweens on these elements from HMR cycles
      gsap.killTweensOf(['#loader', '#main-header', '#content', '#main-title', '#main-description'])

      // Step 1 (t=0): Fade out loader
      gsap.set('#loader', { clearProps: 'all' })
      gsap.to('#loader', { opacity: 0, y: -40, duration: 0.6, ease: 'power2.in',
        onComplete: () => gsap.set('#loader', { display: 'none' }) })

      // Step 2 (t=300ms): Reveal header + content
      timers.push(setTimeout(() => {
        gsap.to('#main-header', { opacity: 1, y: 0, duration: 0.8, ease: 'power4.out' })

        gsap.set('#content', { clearProps: 'all' })
        gsap.to('#content', { opacity: 1, visibility: 'visible', duration: 0.4, ease: 'none' })
      }, 300))

      // Step 3 (t=700ms): Animate hero title words with GSAP SplitText
      timers.push(setTimeout(() => {
        gsap.set('#main-title', { opacity: 1 })
        const titleSplit = new SplitText('#main-title', {
          type: 'words,lines', linesClass: 'overflow-hidden', wordsClass: 'inline-block',
        })
        gsap.fromTo(titleSplit.words,
          { y: 200, rotate: 15 },
          { y: 0, rotate: 0, duration: 1, stagger: 0.1, ease: 'power4.out' })

        // Step 4 (t=1100ms): Animate description chars
        timers.push(setTimeout(() => {
          gsap.set('#main-description', { opacity: 1 })
          const descSplit = new SplitText('#main-description', {
            type: 'chars,words', wordsClass: 'overflow-hidden', charsClass: 'inline-block',
          })
          gsap.fromTo(descSplit.chars,
            { y: 50, rotate: 15, opacity: 0 },
            { y: 0, rotate: 0, opacity: 1, duration: 0.5, stagger: { amount: 0.5 }, ease: 'power4.out' })
        }, 400))
      }, 700))
    }

    // ── PHASE 3: Particles ready → fade them in + wire scroll ─────────────
    const scrollTl = gsap.timeline({
      ease: 'none',
      scrollTrigger: {
        trigger: '#content', scrub: 1, start: 'top top',
        end: () => `+=${window.innerHeight * (isMobile ? 1.3 : 1.5) * 7}px`,
      },
    })

    const particlePoll = setInterval(() => {
      const h = sceneRef.current
      if (!h?.uniforms || !h.mainParticles) return
      clearInterval(particlePoll)

      const { uniforms, mainParticles } = h

      // Fade in particles (may already be mid-intro or after)
      gsap.to(uniforms.uIntro, { value: 1, duration: 3, ease: 'power4.out', delay: 0.5 })

      // Scroll-driven shape morph (uProgress 0→1)
      gsap.to(uniforms.uProgress, {
        value: 1, ease: 'linear',
        scrollTrigger: {
          trigger: '#content', scrub: 1, start: 'top top',
          end: () => `+=${window.innerHeight * (isMobile ? 1.3 : 1.5) * 6}px`,
        },
      })

      // Scroll-driven particle position (camera path through sections)
      // Positions scaled for closer camera (z=30 → visible half-width ~24 units)
      mainParticles.position.set(0, 10 * (isMobile ? 0.5 : 1), 0)
      scrollTl.fromTo(mainParticles.position,
        { x: 0, y: 10*r }, { x: -5*r, y: -2*r, duration: 1, ease: 'power3.inOut' })
      scrollTl.to(mainParticles.position, { x: 6*r, y: 0, z: -2*r, duration: 1, ease: 'power3.inOut' })
      scrollTl.to(mainParticles.position, { x: -5*r, y: -r, z: 0,  duration: 1, ease: 'power3.inOut' })
      scrollTl.to(mainParticles.position, { x: 0,    y: -r, z: -4*r, duration: 1, ease: 'power3.inOut' })
    }, 200)

    return () => {
      clearInterval(counterInterval)
      clearInterval(particlePoll)
      timers.forEach(t => clearTimeout(t))
      ScrollTrigger.getAll().forEach(t => t.kill())
      smoother.kill()
    }
  }, [])

  return (
    <>
      <ThreeScene ref={sceneRef} />
      <Cursor />
      <Loader />
      <Header />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main id="content" style={{ opacity: 0, position: 'relative', zIndex: 10 }}>
            <Hero />
            <Manifesto />
            <Agency />
            <Expertise />
            <Team />
          </main>
          <Contact />
        </div>
      </div>
    </>
  )
}

