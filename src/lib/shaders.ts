// ─── Vertex Shader ────────────────────────────────────────────────────────────
// Handles: multi-shape morphing (position → position2 → position3 → position4),
// cursor repulsion, ambient drift, glow size bloom on cursor proximity
export const vertexShader = /* glsl */`
attribute float opacity;
attribute float scale;
attribute vec3 position2;
attribute vec3 position3;
attribute vec3 position4;

uniform float uIntro;
uniform float uTime;
uniform float uProgress;
uniform vec2  uCursor;

varying float vOpacity;
varying float vScale;
varying vec3  vPos;
varying vec3  vColor;
varying float vVawe;

void main() {
  // ── Shape morph: progress 0→1 sweeps position→2→3→4 ──────────────────────
  float progress      = uProgress * 2.999;
  float fractProgress = fract(progress);

  vec3 posA = mix(position,  position2, step(1., progress));
       posA = mix(posA,      position3, step(2., progress));
  vec3 posB = mix(position2, position3, step(1., progress));
       posB = mix(posB,      position4, step(2., progress));

  vec3 mixedPosition = mix(posA, posB, smoothstep(0.01, 0.99, fractProgress));

  // ── Wave burst during transition ──────────────────────────────────────────
  float vawe  = sin(smoothstep(0.1, 0.95, fractProgress) * 3.14);
       vawe  *= vawe * vawe;
  vVawe = vawe;

  vec4 pos          = vec4(mixedPosition * (1. + vawe * 5.), 1.0);
  vec4 modelPos     = modelMatrix * pos;

  // ── Per-particle drift ────────────────────────────────────────────────────
  float sinOffset   = scale * 10.;
  float scaleFactor = scale * 2. - 1.;
  float intensity   = (0.15 + vawe * 0.2) * scaleFactor;

  modelPos.xyz     += normalize(normal) * vawe * 6. * scale;
  modelPos.x       += sin(uTime * scale + sinOffset) * intensity;
  modelPos.y       += cos(uTime * scale + sinOffset) * intensity;

  // ── Cursor repulsion + size bloom ─────────────────────────────────────────
  vec2  diff     = modelPos.xy - uCursor;
  float diffLen  = length(diff);
  float distTpc  = 1.0 - smoothstep(0., 4., diffLen);
  modelPos.xyz  += normalize(vec3(diff, 1.)) * distTpc * (0.5 + vawe * 1.);

  // ── Output ────────────────────────────────────────────────────────────────
  vec4 viewPos    = viewMatrix * modelPos;
  vec4 projPos    = projectionMatrix * viewPos;
  gl_Position     = projPos;

  vOpacity = opacity;
  vScale   = scale;
  vPos     = modelPos.xyz;
  vColor   = color;

  float size = clamp(7.0 * scale, 2., 7.);
  gl_PointSize = 3.0 * (size + (sin(uTime * 5. + sinOffset) * 0.5 + 0.5) * 1.9 * scaleFactor - 1.5 * vawe * scaleFactor) + distTpc * 12.;
}
`

// ─── Fragment Shader ──────────────────────────────────────────────────────────
// Soft glow disc + 3D simplex noise colour mixing
export const fragmentShader = /* glsl */`
uniform float uOpacity;
uniform float uIntro;
uniform float uTime;
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform vec3  uColorC;
uniform vec3  uColorD;

varying float vOpacity;
varying float vScale;
varying vec3  vPos;
varying vec3  vColor;
varying float vVawe;

// ── 3D value noise ────────────────────────────────────────────────────────────
float mod289(float x){ return x - floor(x*(1./289.))*289.; }
vec4  mod289(vec4  x){ return x - floor(x*(1./289.))*289.; }
vec4  perm(vec4 x){ return mod289(((x*34.)+1.)*x); }
float noise(vec3 p){
  vec3 a = floor(p), d = p-a;
  d = d*d*(3.-2.*d);
  vec4 b  = a.xxyy + vec4(0.,1.,0.,1.);
  vec4 k1 = perm(b.xyxy);
  vec4 k2 = perm(k1.xyxy + b.zzww);
  vec4 c  = k2 + a.zzzz;
  vec4 k3 = perm(c), k4 = perm(c+1.);
  vec4 o1 = fract(k3*(1./41.)), o2 = fract(k4*(1./41.));
  vec4 o3 = o2*d.z + o1*(1.-d.z);
  vec2 o4 = o3.yw*d.x + o3.xz*(1.-d.x);
  return o4.y*d.y + o4.x*(1.-d.y);
}

void main() {
  // ── Soft glow disc ───────────────────────────────────────────────────────
  float strength = distance(gl_PointCoord, vec2(0.5)) * 2.0;
  strength = smoothstep(0.7, 0.8, 1.0 - strength);

  // ── Noise-driven colour between D and A ──────────────────────────────────
  float pct   = noise((vPos + uTime * 0.5) * 0.5) * 2. - 0.5;
  vec3  color = mix(uColorD, uColorA, pct);

  gl_FragColor = vec4(color, strength * vScale * vOpacity * uIntro);
  gl_FragColor.a *= (1. - smoothstep(1., -3., vPos.z) * 0.8) * (1. - vVawe * 0.3);
  gl_FragColor.a *= uOpacity;
}
`

// ─── Post-processing: dot-matrix grain overlay ────────────────────────────────
export const grainVertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vUv = uv;
  }
`

export const grainFragmentShader = /* glsl */`
  uniform sampler2D tDiffuse;
  uniform float uTime;
  uniform float uIntro;
  uniform float uSize;
  uniform float dpr;
  uniform float uOpacity;
  uniform vec2  uResolution;

  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec2 st      = gl_FragCoord.xy / uResolution.xy;
    float aspect = uResolution.y / uResolution.x;
    st.y        *= aspect;
    vec2 sti     = st;

    vec4 color   = texture2D(tDiffuse, vUv);

    st          *= uSize;
    vec2 ipos    = floor(st);
    vec3 modColor = vec3(1. - smoothstep(0.1, 0.3, length(ipos + vec2(0.5) - st)));
    modColor    *= 1./dpr * 1./dpr;
    modColor    *= random(ipos * uTime);

    float tcp    = max(max(color.r, color.g), color.g);
    vec2 center  = vec2(0.5, 0.5*aspect) * dpr;

    gl_FragColor.rgb = mix(color.rgb, modColor * 0.15 * (1. * (dpr*dpr) - length(center - sti)) * uIntro, 1. - smoothstep(0., 0.2, tcp));
    gl_FragColor.a   = 1.;
  }
`
