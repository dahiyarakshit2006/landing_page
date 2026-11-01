/* Ambient elliptical-galaxy background for the Ten Sen Lab landing page.
   A faint, fixed Three.js field behind the (translucent) light content.
   - motion drives the fade-in reveal and the scroll-linked field motion
   - trimmed from the standalone scene for background use: fewer points,
     capped pixel ratio, and only the final composite pass (the bloom/torus
     composers in the standalone rendered empty layers = black textures, so
     dropping them is visually identical and much lighter)
   - disabled entirely for prefers-reduced-motion, and paused when hidden */
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { scroll } from 'motion'

const canvas = document.getElementById('bg-galaxy')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (canvas && !reduceMotion) init()

function init() {
  /* ---- subtle background preset (muted palette, lighter than standalone) ---- */
  const coreColor = '#182023', midColor = '#304248', rimColor = '#47646e', twinkleColor = '#5d8795'
  const galaxyCount = 90, spread = 14.5, radius = 1.45, pointCount = 45000
  const concentration = 2.15, flattenY = 0.5
  const tumbleSpeed = 0.19, wobbleAmount = 0.105, wobbleSpeed = 1.7
  const gradientPow = 1.65, twinkleAmount = 0.31, twinkleSpeed = 0.65
  const scrollDiveZ = 2.5, scrollSpin = 1.77, scrollExpand = 0.66
  const cornerBlue = '#81a3ae', cornerOrange = '#a7bec5'
  const atmoColor = '#cdd9dd', atmoCount = 220, atmoSize = 39, atmoSpeed = 3.35
  const HERO_OPACITY = 1.0                      // field strength over the hero (maximum)
  const BASE_OPACITY = 0.09                     // field strength once past the hero (reduced)
  const HERO_FADE_START = 0.45                  // begin transitioning after scrolling 0.45 viewports
  const HERO_FADE_RANGE = 0.6                   // ...reaching BASE_OPACITY 0.6 viewports later

  const Lerp = (a, b, t = 0.075) => a + (b - a) * t
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
  const hexToVec3 = (hex) => {
    const n = parseInt(hex.slice(1), 16)
    return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
  }

  const renderer = new THREE.WebGL1Renderer({ canvas, antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.setSize(window.innerWidth, window.innerHeight)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)
  scene.fog = new THREE.Fog(0x000000, 0, 15)

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 80)
  camera.position.set(0, 0, 14)
  scene.add(camera)

  /* ---- composite shader (corner flames + indigo haze) ---- */
  const FinalPass = {
    uniforms: {
      iTime: { value: 0 }, tDiffuse: { value: null },
      torusTexture: { value: null }, bloomTexture: { value: null }, haloTexture: { value: null },
      iCornerBlue: { value: hexToVec3(cornerBlue) }, iCornerOrange: { value: hexToVec3(cornerOrange) }
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }`,
    fragmentShader: `
      uniform float iTime; uniform sampler2D tDiffuse; uniform sampler2D bloomTexture; uniform sampler2D torusTexture; uniform sampler2D haloTexture;
      uniform vec3 iCornerBlue; uniform vec3 iCornerOrange; varying vec2 vUv;
      vec3 warp3d(vec3 pos, float t) {
        float curv = .8, a = 1.9, b = 0.7; pos *= 2.;
        pos.x += curv * sin(t + a * pos.y) + t * b; pos.y += curv * cos(t + a * pos.x);
        pos.y += curv * sin(t + a * pos.z) + t * b; pos.z += curv * cos(t + a * pos.y);
        pos.z += curv * sin(t + a * pos.x) + t * b; pos.x += curv * cos(t + a * pos.z);
        return 0.5 + 0.5 * cos(pos.xyz + vec3(1, 2, 4));
      }
      void main() {
        vec2 uv = 2. * vUv - 1.;
        vec3 w = pow(warp3d(vec3(uv.x, sin(uv.y), uv.y), iTime * 1.5), vec3(1.5));
        vec3 col = 1.5 * iCornerBlue * w.x; col *= w.y; col += iCornerOrange * w.z;
        col *= smoothstep(0.6, 1., abs(uv.y));
        col *= smoothstep(-.5, 1., -uv.y * uv.x); col *= smoothstep(-.5, 1., -uv.y * uv.x);
        vec3 halo = texture2D(haloTexture, vUv).xyz;
        vec3 atmoBg = vec3(0.02, 0.03, 0.10) * (1.0 - 0.4 * length(uv));
        gl_FragColor = vec4(atmoBg + col * 0.2 + texture2D(bloomTexture, vUv).xyz + texture2D(torusTexture, vUv).xyz + texture2D(tDiffuse, vUv).xyz + halo, 1.);
      }`
  }

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const finalPass = new ShaderPass(FinalPass)
  composer.addPass(finalPass)

  /* ---- galaxy field ---- */
  const material = new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending, depthTest: false, transparent: true,
    uniforms: {
      iTime: { value: 0 }, iAnimate: { value: 1 }, uOpacity: { value: 1 }, uExpand: { value: 1 },
      uWobbleAmount: { value: wobbleAmount }, uWobbleSpeed: { value: wobbleSpeed },
      uCore: { value: hexToVec3(coreColor) }, uMid: { value: hexToVec3(midColor) },
      uRim: { value: hexToVec3(rimColor) }, uTwinkle: { value: hexToVec3(twinkleColor) },
      uGradientPow: { value: gradientPow }, uTwinkleAmount: { value: twinkleAmount }, uTwinkleSpeed: { value: twinkleSpeed }
    },
    vertexShader: `
      attribute float size; attribute float id; attribute float shell;
      uniform float iTime; uniform float iAnimate; uniform float uExpand;
      uniform float uWobbleAmount; uniform float uWobbleSpeed;
      varying float vShell; varying float vId;
      void main() {
        vShell = shell; vId = id;
        float ph = id * 6.2831853;
        vec3 wob = vec3(sin(iTime * uWobbleSpeed + ph),
                        cos(iTime * uWobbleSpeed * 1.3 + ph),
                        sin(iTime * uWobbleSpeed * 0.7 + ph)) * uWobbleAmount;
        vec3 p = (position + wob) * uExpand;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = size / -mv.z * (0.5 + 0.5 * iAnimate);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float iTime; uniform float uOpacity;
      uniform vec3 uCore; uniform vec3 uMid; uniform vec3 uRim; uniform vec3 uTwinkle;
      uniform float uGradientPow; uniform float uTwinkleAmount; uniform float uTwinkleSpeed;
      varying float vShell; varying float vId;
      vec3 grad3(vec3 a, vec3 b, vec3 c, float t) {
        return t < 0.5 ? mix(a, b, t * 2.0) : mix(b, c, clamp((t - 0.5) * 2.0, 0.0, 1.0));
      }
      void main() {
        float t = pow(vShell, uGradientPow);
        vec3 col = grad3(uCore, uMid, uRim, t);
        float tw = 0.5 + 0.5 * sin(iTime * uTwinkleSpeed + vId * 100.0);
        col = mix(col, uTwinkle, tw * uTwinkleAmount * (1.0 - t));
        col *= (0.45 + 0.85 * (1.0 - t));
        float tex = 1.0 - smoothstep(0.5, 1.0, length(2.0 * gl_PointCoord - 1.0));
        gl_FragColor = vec4(col * tex, tex * uOpacity);
      }`
  })

  const cloud = new THREE.Points(buildGalaxy(), material)
  cloud.frustumCulled = false
  cloud.position.set(0, 0, -0.8)
  scene.add(cloud)

  function buildGalaxy() {
    const N = pointCount
    const positions = new Float32Array(N * 3), shells = new Float32Array(N), sizes = new Float32Array(N), ids = new Float32Array(N)
    const K = Math.max(1, Math.round(galaxyCount)), SP = spread, R = radius
    const frames = []
    for (let k = 0; k < K; k++) frames.push({
      m: new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)),
      size: 0.18 + 0.34 * Math.random(), ecc: 0.45 + 0.42 * Math.random(), thick: 0.06 + 0.05 * Math.random(),
      ox: (Math.random() - 0.5) * 2 * SP, oy: (Math.random() - 0.5) * 2 * SP, oz: (Math.random() - 0.5) * 2 * SP * 0.6
    })
    const tmp = new THREE.Vector3()
    for (let i = 0; i < N; i++) {
      const f = frames[i % K]
      const th = Math.random() * 2 * Math.PI
      const rad = Math.pow(Math.random(), concentration)
      const rx = f.size * R * rad, rz = f.size * R * f.ecc * rad
      const y = (Math.random() - 0.5) * 2 * f.thick * R * rad * flattenY
      tmp.set(rx * Math.cos(th), y, rz * Math.sin(th)).applyMatrix4(f.m)
      tmp.x += f.ox; tmp.y += f.oy; tmp.z += f.oz
      positions[i * 3] = tmp.x; positions[i * 3 + 1] = tmp.y; positions[i * 3 + 2] = tmp.z
      shells[i] = rad; sizes[i] = 6 + 9 * Math.random(); ids[i] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('shell', new THREE.BufferAttribute(shells, 1))
    g.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    g.setAttribute('id', new THREE.BufferAttribute(ids, 1))
    return g
  }

  /* ---- ambient motes that follow the camera ---- */
  const atmoMat = new THREE.ShaderMaterial({
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false,
    uniforms: {
      uTime: { value: 0 }, uColor: { value: hexToVec3(atmoColor) },
      uRes: { value: new THREE.Vector2(innerWidth * devicePixelRatio, innerHeight * devicePixelRatio) }
    },
    vertexShader: `
      attribute float size; attribute float seed; uniform float uTime; uniform vec2 uRes; varying float vA;
      vec3 warp(vec3 p, float t){ float c=0.9,a=1.9,b=0.02,s=0.05; p*=2.;
        p.x+=c*sin(s*t+a*p.y)+t*b; p.y+=c*cos(s*t+a*p.x); p.y+=c*sin(s*t+a*p.z)+t*b;
        p.z+=c*cos(s*t+a*p.y); p.z+=c*sin(s*t+a*p.x)+t*b; p.x+=c*cos(s*t+a*p.z);
        return cos(p+vec3(1,2,4)); }
      void main(){
        vec3 v = position*4.0 + warp(position, uTime)*1.2;
        vec4 mv = modelViewMatrix * vec4(v, 1.0);
        float r = length(v); float farF = 1.0 - smoothstep(5.0, 6.5, r); float nearF = smoothstep(0.0, 0.5, -mv.z);
        vA = farF * nearF;
        gl_PointSize = size * uRes.y / 900.0 / -mv.z; gl_PointSize = max(gl_PointSize, 1.0);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uColor; varying float vA;
      void main(){ vec2 p = gl_PointCoord - 0.5; float l = length(p); if (l > 0.5) discard;
        float tex = smoothstep(0.5, 0.0, l); gl_FragColor = vec4(uColor * tex, tex * vA * 0.55); }`
  })
  const aN = Math.round(atmoCount)
  const aPos = new Float32Array(aN * 3), aSize = new Float32Array(aN), aSeed = new Float32Array(aN)
  for (let i = 0; i < aN; i++) {
    aPos[i * 3] = 2 * Math.random() - 1; aPos[i * 3 + 1] = 2 * Math.random() - 1; aPos[i * 3 + 2] = 2 * Math.random() - 1
    aSize[i] = atmoSize * (0.4 + Math.random()); aSeed[i] = Math.random()
  }
  const aGeo = new THREE.BufferGeometry()
  aGeo.setAttribute('position', new THREE.BufferAttribute(aPos, 3))
  aGeo.setAttribute('size', new THREE.BufferAttribute(aSize, 1))
  aGeo.setAttribute('seed', new THREE.BufferAttribute(aSeed, 1))
  const motes = new THREE.Points(aGeo, atmoMat)
  motes.frustumCulled = false
  motes.onBeforeRender = () => {
    const t = performance.now() / 1000
    atmoMat.uniforms.uTime.value = t * atmoSpeed * 8.0
    motes.position.copy(camera.position)
    finalPass.uniforms.iTime.value = t
  }
  scene.add(motes)

  /* ---- scroll progress (motion primary, manual fallback) ---- */
  let scrollT = 0, motionScrollFired = false
  try {
    scroll((p) => { motionScrollFired = true; scrollT = (typeof p === 'number' && p === p) ? clamp(p, 0, 1) : scrollT })
  } catch (e) { /* motion.scroll unavailable — manual listener handles it */ }
  const readScroll = () => {
    if (motionScrollFired) return
    const max = document.documentElement.scrollHeight - window.innerHeight
    scrollT = clamp(max > 0 ? window.scrollY / max : 0, 0, 1)
  }
  window.addEventListener('scroll', readScroll, { passive: true })

  /* ---- hero-aware opacity: 0 while the hero is on screen, ramping to
         BASE_OPACITY as it scrolls away (smoothed each frame) ---- */
  let curOpacity = 0
  function targetOpacity() {
    const vh = window.innerHeight || 1
    const f = clamp((window.scrollY - vh * HERO_FADE_START) / (vh * HERO_FADE_RANGE), 0, 1)
    return Lerp(HERO_OPACITY, BASE_OPACITY, f)   // max over hero → reduced below
  }

  /* ---- loop (paused when the tab is hidden) ---- */
  let scrollCurrent = 0, lastT = performance.now() / 1000
  function frame() {
    if (document.hidden) { requestAnimationFrame(frame); return }
    const t = performance.now() / 1000
    const dt = Math.min(0.05, t - lastT); lastT = t
    scrollCurrent = Lerp(scrollCurrent, scrollT, 0.08)
    camera.position.z = 14 - scrollCurrent * scrollDiveZ
    material.uniforms.iTime.value = t
    material.uniforms.uExpand.value = 1 + scrollCurrent * scrollExpand
    const spin = tumbleSpeed * (1 + scrollCurrent * scrollSpin) * dt
    cloud.rotation.y += spin
    cloud.rotation.x += spin * 0.35
    finalPass.uniforms.iTime.value = t
    composer.render()
    curOpacity = Lerp(curOpacity, targetOpacity(), 0.1)
    canvas.style.opacity = curOpacity.toFixed(3)
    requestAnimationFrame(frame)
  }
  requestAnimationFrame(frame)

  /* ---- resize ---- */
  window.addEventListener('resize', () => {
    const w = innerWidth, h = innerHeight, dpr = Math.min(devicePixelRatio, 1.5)
    renderer.setPixelRatio(dpr); renderer.setSize(w, h, false)
    camera.aspect = w / h; camera.updateProjectionMatrix()
    composer.setPixelRatio(dpr); composer.setSize(w, h)
    atmoMat.uniforms.uRes.value.set(w * dpr, h * dpr)
  }, { passive: true })
}
