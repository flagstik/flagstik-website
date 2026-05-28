/**
 * ThreeScene.tsx
 * Fixed full-screen Three.js canvas — sits behind all page content.
 * Exposes the `uniforms` object via a ref so GSAP can drive uProgress,
 * uIntro, and uCursor from outside.
 */
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import * as THREE from 'three'
import {
  loadModels,
  buildMainParticles,
  createBackgroundParticles,
  createComposer,
  createUniforms,
  type ModelConfig,
} from '../lib/scene'

export interface SceneHandle {
  uniforms:   ReturnType<typeof createUniforms>
  mainParticles: THREE.Points | null
}

// Rocket removed — shape 1 (hero) is now a procedural flagstik built in scene.ts
const MODELS: ModelConfig[] = [
  {
    src:              '/models/satellite_v2.gltf',   // shape 2
    mainSamplerIndex: 1,
    rotation:         new THREE.Vector3(Math.PI * 0.2,   Math.PI * 0.3,   Math.PI * 0.3),
    translate:        new THREE.Vector3(3, -1, 1),
    scale:            0.95,
  },
  {
    src:              '/models/terra.gltf',           // shape 3
    mainSamplerIndex: 0,
    single:           true,
    rotation:         new THREE.Vector3(Math.PI * -0.65, Math.PI * -0.3,  Math.PI * 0.1),
    translate:        new THREE.Vector3(3, 1, 0),
    scale:            window.innerWidth <= 768 ? 1.5 : 2,
  },
  {
    src:              '/models/astronauta_v5.gltf',   // shape 4
    mainSamplerIndex: 4,
    rotation:         new THREE.Vector3(0,               Math.PI * 0.1,   Math.PI * -0.05),
    translate:        new THREE.Vector3(0, 0, 0),
    scale:            1.1,
  },
]

const ThreeScene = forwardRef<SceneHandle>((_, ref) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<SceneHandle>({ uniforms: null as any, mainParticles: null })

  useImperativeHandle(ref, () => sceneRef.current)

  useEffect(() => {
    const el       = mountRef.current!
    const isMobile = window.innerWidth <= 768

    // ── Use window dimensions — more reliable than el.clientWidth at mount ──
    const W = window.innerWidth
    const H = window.innerHeight

    // ── Core Three objects ────────────────────────────────────────────────
    const threeScene = new THREE.Scene()
    const fov        = 60
    const camera     = new THREE.PerspectiveCamera(fov, W / H, 0.1)
    camera.position.set(0, 0, 30)

    const renderer = new THREE.WebGLRenderer({ antialias: window.devicePixelRatio < 2, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.setClearColor(0xcce0ea, 1)   // sky blue — matches hero background, no black bar
    el.appendChild(renderer.domElement)

    // ── Uniforms ──────────────────────────────────────────────────────────
    const uniforms = createUniforms(isMobile)
    sceneRef.current.uniforms = uniforms
    // Expose uniforms globally in dev so preview/debug tools can force uIntro etc.
    if (import.meta.env.DEV) (window as any).__u = uniforms

    // ── Background particles — enough to fill the full viewport ─────────
    const bgParticles = createBackgroundParticles(isMobile ? 1200 : 3000, uniforms, threeScene)
    bgParticles.rotation.set(0, 0, 0)

    // ── Post-processing ───────────────────────────────────────────────────
    const { composer, grainPass } = createComposer(
      renderer, threeScene, camera, W, H, uniforms,
    )

    // ── Cursor tracking disabled — camera and particles stay still ───────────
    const cursorNDC  = new THREE.Vector2(0, 0)
    const raycaster  = new THREE.Raycaster()
    const hitPlane   = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshBasicMaterial({ visible: false }),
    )
    hitPlane.position.z = 1
    threeScene.add(hitPlane)

    const onMouseMove = (_e: MouseEvent) => { /* mouse tracking disabled */ }
    window.addEventListener('mousemove', onMouseMove)

    // ── Render loop ───────────────────────────────────────────────────────
    let   raf:     number
    let   mainPts: THREE.Points | null = null
    let   prevTime = performance.now()
    let   elapsed  = 0

    const tick = () => {
      raf = requestAnimationFrame(tick)
      const now   = performance.now()
      const delta = Math.min((now - prevTime) / 1000, 0.1)  // cap at 100ms
      prevTime    = now
      elapsed    += delta

      uniforms.uTime.value = elapsed
      grainPass.uniforms.uTime.value = elapsed

      // Smooth cursor → world position
      raycaster.setFromCamera(cursorNDC, camera)
      const hits = raycaster.intersectObject(hitPlane)
      if (hits[0]) {
        const { x, y } = hits[0].point
        uniforms.uCursor.value.lerp(new THREE.Vector2(x, y), delta * 4)
      }

      // Camera stays fixed — no mouse tracking
      camera.updateProjectionMatrix()

      // Main particle gentle sway
      if (mainPts) {
        mainPts.rotation.y = Math.sin(elapsed * 0.5) * 0.15
        mainPts.rotation.z = Math.sin(-elapsed * 0.5) * 0.15
      }

      composer.render()
    }
    tick()

    // ── Load models → build particles ────────────────────────────────────
    loadModels(MODELS).then(loaded => {
      mainPts = buildMainParticles(loaded, uniforms, threeScene, isMobile)
      sceneRef.current.mainParticles = mainPts

      // Kick off intro via GSAP (called from App.tsx after loading screen)
      // Position set to hero default
      mainPts.position.set(0, 7 * (isMobile ? 0.5 : 1), 0)
    })

    // ── Resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      composer.setSize(w, h)
      grainPass.uniforms.uResolution.value.set(w, h)

      let sz = 300
      if      (w < 540)  sz = 40
      else if (w < 768)  sz = 80
      else if (w < 1020) sz = 120
      else if (w < 1400) sz = 200
      grainPass.uniforms.uSize.value = sz
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position:   'fixed',
        inset:      0,
        zIndex:     0,
        /* Sky gradient — matches the golf photo sky; visible through transparent WebGL */
        background: 'linear-gradient(to bottom, #cce0ea 0%, #a8c8d6 55%, #90b8ca 100%)',
      }}
    />
  )
})

ThreeScene.displayName = 'ThreeScene'
export default ThreeScene

