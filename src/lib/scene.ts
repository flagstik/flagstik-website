/**
 * scene.ts
 * Core Three.js scene — mirrors the USTA agency approach:
 *   • MeshSurfaceSampler samples point clouds from GLTF meshes
 *   • Custom ShaderMaterial with multi-shape morph (position → position2 → position3 → position4)
 *   • GPU cursor repulsion + particle bloom
 *   • EffectComposer with grain post-process pass
 *   • GSAP drives uProgress (scroll) + uIntro (load) + camera position
 */

import * as THREE from 'three'
import { GLTFLoader }           from 'three/addons/loaders/GLTFLoader.js'
import { MeshSurfaceSampler }   from 'three/addons/math/MeshSurfaceSampler.js'
import { EffectComposer }       from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass }           from 'three/addons/postprocessing/RenderPass.js'
import { ShaderPass }           from 'three/addons/postprocessing/ShaderPass.js'
import { vertexShader, fragmentShader, grainVertexShader, grainFragmentShader } from './shaders'
import { createFlagstikLogoScene } from './flagstikShape'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ModelConfig {
  src:              string
  mainSamplerIndex: number
  rotation:         THREE.Vector3
  translate:        THREE.Vector3
  scale:            number
  single?:          boolean
  scene?:           THREE.Group
}

// ─── Palette — exact USTA colours (swap these for Flagstik branding) ──────────
export const PALETTE = [
  new THREE.Color('#f48c18'),  // orange
  new THREE.Color('#4089dd'),  // blue
  new THREE.Color('#33478B'),  // dark blue
  new THREE.Color('#8A5894'),  // purple
  new THREE.Color('#DE466E'),  // pink
  new THREE.Color('#EC9354'),  // orange-red
]

// ─── Shared uniforms (referenced by both particle system and grain pass) ──────
export function createUniforms(isMobile: boolean) {
  return {
    uOpacity:  { value: isMobile ? 0.5 : 1.0 },
    uProgress: { value: 0 },
    uIntro:    { value: 0 },
    uTime:     { value: 0 },
    uCursor:   { value: new THREE.Vector2() },
    uColorA:   { value: PALETTE[0].clone() },
    uColorB:   { value: PALETTE[2].clone() },
    uColorC:   { value: PALETTE[1].clone() },
    uColorD:   { value: PALETTE[1].clone() },
  }
}

// ─── Build background scatter particles (CE() in USTA source) ─────────────────
export function createBackgroundParticles(
  count:    number,
  uniforms: ReturnType<typeof createUniforms>,
  scene:    THREE.Scene,
) {
  const geo     = new THREE.BufferGeometry()
  // Camera is at z=30, FOV=60 — visible screen at z=0 is ~55 wide × ~34 tall.
  // Use wider X/Y spread so particles cover the full viewport.
  const spreadX = 90
  const spreadY = 65
  const spreadZ = 40
  const pos     = new Float32Array(count * 3)
  const normals = new Float32Array(count * 3)
  const opacities = new Float32Array(count).fill(1)
  const scales  = new Float32Array(count)   // itemSize=1, one value per particle

  for (let i = 0; i < count; i++) {
    pos[i*3]     = (Math.random() - 0.5) * spreadX
    pos[i*3 + 1] = (Math.random() - 0.5) * spreadY
    pos[i*3 + 2] = (Math.random() - 0.5) * spreadZ
    const dir = new THREE.Vector3().randomDirection()
    normals[i*3]     = dir.x
    normals[i*3 + 1] = dir.y
    normals[i*3 + 2] = dir.z
    scales[i] = 0.2 + Math.random() * 0.8   // 0.2–1.0 so all particles are visible
  }

  // Per-particle colour cycling through palette
  const colors = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const c = PALETTE[i % PALETTE.length]
    colors[i*3]     = c.r
    colors[i*3 + 1] = c.g
    colors[i*3 + 2] = c.b
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos,      3))
  geo.setAttribute('normal',   new THREE.BufferAttribute(normals,  3))
  geo.setAttribute('opacity',  new THREE.BufferAttribute(opacities, 1))
  geo.setAttribute('color',    new THREE.BufferAttribute(colors,   3))
  geo.setAttribute('scale',    new THREE.BufferAttribute(scales,    1))

  // Background uses own uProgress=0 so it doesn't morph
  const mat = new THREE.ShaderMaterial({
    uniforms:     { ...uniforms, uProgress: { value: 0 } },
    vertexColors: true,
    blending:     THREE.AdditiveBlending,
    depthWrite:   false,
    depthTest:    true,
    vertexShader,
    fragmentShader,
    transparent:  true,
  })

  const pts = new THREE.Points(geo, mat)
  pts.frustumCulled = false
  scene.add(pts)
  return pts
}

// ─── Sample points from a GLTF mesh's surface ─────────────────────────────────
function buildSamplers(config: ModelConfig) {
  const meshes: Array<{ sampler: MeshSurfaceSampler; mesh: THREE.Mesh }> = []
  config.scene!.traverse(obj => {
    const mesh = obj as THREE.Mesh
    if (mesh.isMesh && mesh.geometry) {
      mesh.geometry.scale(0.018 * config.scale, 0.018 * config.scale, 0.018 * config.scale)
      mesh.geometry.rotateX(config.rotation.x)
      mesh.geometry.rotateY(config.rotation.y)
      mesh.geometry.rotateZ(config.rotation.z)
      const sampler = new MeshSurfaceSampler(mesh).build()
      meshes.push({ sampler, mesh })
    }
  })
  return meshes
}

function sampleShape(config: ModelConfig, count: number): THREE.BufferAttribute {
  const samplers         = buildSamplers(config)
  const { mainSamplerIndex, single = false } = config
  const mainCount        = count - Math.floor(0.7 * count / (samplers.length - 1 || 1)) * (samplers.length - 1)
  const perMeshCount     = Math.floor(0.7 * count / (samplers.length - 1 || 1))
  const arr              = new Float32Array(count * 3)
  let   cursor           = 0

  samplers
    .filter((_m, i) => single ? i === mainSamplerIndex : true)
    .forEach(({ sampler }, i) => {
      const n = single ? count : (i === mainSamplerIndex ? mainCount : perMeshCount)
      for (let k = 0; k < n; k++) {
        const pt = new THREE.Vector3()
        sampler.sample(pt)
        arr.set([pt.x, pt.y, pt.z], cursor * 3)
        cursor++
      }
    })

  return new THREE.BufferAttribute(arr, 3)
}

// ─── Shuffle a BufferAttribute in-place (Fisher-Yates) ────────────────────────
function shuffleAttribute(attr: THREE.BufferAttribute) {
  const { count, itemSize } = attr
  for (let i = count - 1; i > 0; i--) {
    const j   = Math.floor(Math.random() * i)
    const tmp = [attr.getX(i), attr.getY(i), attr.getZ(i)]
    const src = [attr.getX(j), attr.getY(j), attr.getZ(j)]
    attr.set(src, i * itemSize)
    attr.set(tmp, j * itemSize)
  }
}

// ─── Build the main particle system once all GLTFs are loaded ─────────────────
// models[0]=satellite, models[1]=terra, models[2]=astronaut  (rocket replaced by flagstik)
export function buildMainParticles(
  models:   ModelConfig[],
  uniforms: ReturnType<typeof createUniforms>,
  scene:    THREE.Scene,
  isMobile: boolean,
): THREE.Points {
  // Keep count manageable — MeshSurfaceSampler on large GLTFs is slow
  const count  = isMobile ? 8000 : 15000
  const geo    = new THREE.BufferGeometry()

  // Shape 1: Procedural flagstik (pole + flag triangle) — no GLTF needed
  const flagstikConfig: ModelConfig = {
    src:              '',
    mainSamplerIndex: 0,
    rotation:         new THREE.Vector3(0, Math.PI * 0.08, 0),  // subtle Y rotation for depth
    translate:        new THREE.Vector3(0, 0, 0),
    scale:            3.5,   // bigger — fills more of the right half
    scene:            createFlagstikLogoScene(),
  }

  // 4 shape positions
  const pos1   = sampleShape(flagstikConfig, count)  // shape 1: flagstik (hero)
  shuffleAttribute(pos1)
  const pos2   = sampleShape(models[0], count)       // shape 2: satellite
  const pos3   = sampleShape(models[1], count)       // shape 3: terra/planet
  const pos4   = sampleShape(models[2], count)       // shape 4: astronaut

  geo.setAttribute('position',  pos1)
  geo.setAttribute('position2', pos2)
  geo.setAttribute('position3', pos3)
  geo.setAttribute('position4', pos4)

  // Normals (random directions — used for burst separation)
  const normals = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const d = new THREE.Vector3().randomDirection()
    normals[i*3]     = d.x
    normals[i*3 + 1] = d.y
    normals[i*3 + 2] = d.z
  }
  geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3))

  // Opacity = 1 for all
  const opacities = new Float32Array(count).fill(1)
  geo.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1))

  // Per-particle colour from palette (cycling)
  const colors = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const c = PALETTE[i % PALETTE.length]
    colors[i*3]     = c.r
    colors[i*3 + 1] = c.g
    colors[i*3 + 2] = c.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  // Random scale per particle
  const scales = new Float32Array(count)
  for (let i = 0; i < count; i++) scales[i] = Math.random()
  geo.setAttribute('scale', new THREE.BufferAttribute(scales, 1))

  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexColors: true,
    blending:     THREE.AdditiveBlending,
    depthWrite:   false,
    depthTest:    true,
    vertexShader,
    fragmentShader,
    transparent:  true,
  })

  const pts = new THREE.Points(geo, mat)
  pts.frustumCulled = false
  scene.add(pts)
  return pts
}

// ─── EffectComposer with grain overlay (identical to USTA) ───────────────────
export function createComposer(
  renderer:  THREE.WebGLRenderer,
  threeScene: THREE.Scene,
  camera:    THREE.Camera,
  width:     number,
  height:    number,
  uniforms:  ReturnType<typeof createUniforms>,
) {
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(threeScene, camera))

  const grainPass = new ShaderPass({
    uniforms: {
      tDiffuse:    { value: null },
      uTime:       uniforms.uTime,
      uIntro:      uniforms.uIntro,
      uResolution: { value: new THREE.Vector2(width, height) },
      uSize:       { value: 300 },
      dpr:         { value: Math.min(window.devicePixelRatio, 2) },
      uOpacity:    uniforms.uOpacity,
    },
    vertexShader:   grainVertexShader,
    fragmentShader: grainFragmentShader,
  })
  composer.addPass(grainPass)

  return { composer, grainPass }
}

// ─── Load all GLTF models in parallel ────────────────────────────────────────
export function loadModels(configs: ModelConfig[]): Promise<ModelConfig[]> {
  const loader = new GLTFLoader()
  return Promise.all(
    configs.map(cfg =>
      new Promise<ModelConfig>((resolve, reject) => {
        loader.load(
          cfg.src,
          gltf => { cfg.scene = gltf.scene; resolve(cfg) },
          undefined,
          reject,
        )
      })
    )
  )
}
