// noon bot (Bot 2) — the floating assistant on the noon nano home.
//
// Ported from saswata2002/3D-noon-bot (main.js @ e1835af), trimmed to Bot 2:
// the Orbi ball, helmet / visor, state bar, keyboard, colour themes and the
// in-canvas drag-to-spin are dropped. The look (robo.js) is copied as is.
// What's kept is the shared engine: hover bob, hops with rebounds and a
// nod / rock wobble, morphing screen faces + blinks, the grow-in intro with
// a greeting, idle glances, per-state poses, dizzy beads, Zz, grounded drop shadows.
//
// No React and no DOM besides the canvas: the host moves the canvas around
// (drag to reposition) and calls tap() / setLean() / setState().

import * as THREE from 'three';
import { createRobo, FACE } from './robo.js';

// ─── constants ────────────────────────────────────────────────────────────
const HOVER_Y = 0;              // resting centre height while floating
const FLOOR_Y = -1.18;
const GRAVITY = 17;              // low: a light, floaty toy
const BASE_PITCH = -0.2;        // tip the face up toward the camera
const STATES = ['idle', 'greeting', 'working', 'error', 'dizzy', 'sleepy', 'angry'];

const FOV = 13.5;
const CAM_TARGET = new THREE.Vector3(0, -0.22, 0);

// studio environment: a dim gradient dome plus one large softbox and two fills
export function studioEnvironment() {
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(
    new THREE.SphereGeometry(20, 48, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `varying vec3 vP;
        void main(){
          float h = normalize(vP).y;
          vec3 floorC = vec3(0.045, 0.042, 0.035);
          vec3 sky = vec3(0.30, 0.29, 0.27);
          gl_FragColor = vec4(mix(floorC, sky, smoothstep(-0.25, 0.85, h)), 1.0);
        }`,
    }),
  ));
  const panel = (w, h, intensity, pos) => {
    const p = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.98, 0.93).multiplyScalar(intensity), side: THREE.DoubleSide }),
    );
    p.position.set(...pos);
    p.lookAt(0, 0, 0);
    env.add(p);
  };
  panel(15, 12, 1.9, [-7, 8, 9]);  // key softbox
  panel(7, 10, 0.6, [10, 1, 5]);   // right fill
  panel(8, 2.5, 0.7, [3, 5, -10]); // back rim strip
  return env;
}

// ─── face morph helpers (same stroke model as the original engine) ────────
const FACE_OF = { idle: 'pill', working: 'pill', greeting: 'greeting', error: 'error', dizzy: 'dizzy', sleepy: 'sleepy', angry: 'angry' };
const mirror = (pts) => pts.map(([x, y]) => [-x, y]);
const lerp = (a, b, t) => a + (b - a) * t;
const lerpPts = (A, B, t) => A.map((p, i) => [lerp(p[0], B[i][0], t), lerp(p[1], B[i][1], t)]);
function faceSpec(state) {
  const kind = FACE_OF[state] || 'pill';
  const L = FACE.LEFT_EYE[kind]();
  const R = { a: mirror(L.a), b: mirror(L.b), w: L.w };
  const pill = kind === 'pill' ? 1 : 0;
  const happy = kind === 'greeting' ? 1 : 0;
  const angry = kind === 'angry' ? 1 : 0;
  const mouth = happy ? FACE.MOUTH.smile() : angry ? FACE.MOUTH.frown() : FACE.MOUTH.none();
  return { eyes: [L, R], mouth, glint: pill, lip: pill, cheeks: happy, flush: angry, brow: angry, blink: pill };
}
function lerpFace(A, B, t) {
  return {
    eyes: A.eyes.map((e, i) => ({ a: lerpPts(e.a, B.eyes[i].a, t), b: lerpPts(e.b, B.eyes[i].b, t), w: lerp(e.w, B.eyes[i].w, t) })),
    mouth: { a: lerpPts(A.mouth.a, B.mouth.a, t), w: lerp(A.mouth.w, B.mouth.w, t) },
    glint: lerp(A.glint, B.glint, t), lip: lerp(A.lip, B.lip, t),
    cheeks: lerp(A.cheeks, B.cheeks, t), blink: lerp(A.blink, B.blink, t),
    flush: lerp(A.flush || 0, B.flush || 0, t), brow: lerp(A.brow || 0, B.brow || 0, t),
  };
}
const CLOSED = (() => {
  const l = FACE.CLOSED_LINE();
  return { eyes: [{ a: l, b: l, w: 7 }, { a: mirror(l), b: mirror(l), w: 7 }], mouth: FACE.MOUTH.none(), glint: 0, lip: 1, cheeks: 0, blink: 0 };
})();

const MORPH_S = 0.24;
const VIA = { close: 0.16, open: 0.26 };            // s: blink shut, then open into the new shape
const VIA_BACK = { reshape: 0.3, open: 0.26 };      // back to pills: relax shut, then open gently
const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const easeInQuad = (x) => x * x;
const easeOutCubic = (x) => 1 - (1 - x) ** 3;
const easeOut = (x) => 1 - (1 - x) * (1 - x);
const easeOutBack = (x, c = 1.9) => 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2;

// intro: grow from nothing with a full turn, greet, settle into idle
const GREET_AT = 0.6;
const GREET_FOR = 1.7;
const INTRO = { delay: 0.12, scale: 0.75, spin: 0.95 };

// idle glances [yaw, pitch]
const GLANCES = [[-0.2, 0], [0.2, 0], [-0.16, -0.12], [0.16, -0.12], [0, 0]];
const POSE_BLEND_S = 0.5;
function statePose(st, t, stT) {
  const p = { yaw: 0, pitch: 0, roll: 0, sway: 0 };
  switch (st) {
    case 'idle': p.yaw = Math.sin(t * 0.7) * 0.015; break;
    case 'working': p.yaw = Math.sin(t * 1.5) * 0.3; p.pitch = 0.1; break;
    case 'greeting': p.roll = Math.sin(stT * 9) * 0.2 * Math.exp(-stT * 1.2) + 0.06; break;
    case 'error': p.roll = Math.sin(stT * 18) * 0.1 * Math.exp(-stT * 3); p.pitch = 0.05; break;
    case 'angry': p.pitch = 0.13; p.roll = Math.sin(t * 1.9) * 0.025; break;
    case 'dizzy':
      p.roll = Math.sin(t * 2.6) * 0.24;
      p.pitch = Math.cos(t * 2.6) * 0.14;
      p.yaw = Math.sin(t * 1.3) * 0.18;
      p.sway = Math.sin(t * 2.6) * 0.08;
      break;
    case 'sleepy': p.roll = 0.14 + Math.sin(t * 0.8) * 0.03; p.pitch = 0.16; break;
    default: break;
  }
  return p;
}

/**
 * Mount the bot on `canvas` (transparent; sized by CSS, followed with a
 * ResizeObserver). Returns { tap, setLean, setState, enter, exit, celebrate,
 * look, dispose }. `hidden` starts it away (no intro) until enter().
 */
export function createNoonBot({ canvas, reduceMotion = false, hidden = false }) {
  // ─── renderer / scene ───────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();          // no background: floats over the page
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = studioEnvironment();
  const envRT = pmrem.fromScene(envScene, 0.06);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 1.2;

  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 3.1, 15.2);
  camera.lookAt(CAM_TARGET);

  const robo = createRobo();
  const key = new THREE.DirectionalLight(robo.lights.key, 2.0);
  key.position.set(-3.6, 5, 4);
  const bounce = new THREE.HemisphereLight(robo.lights.sky, robo.lights.ground, 0.85);
  const rim = new THREE.DirectionalLight(robo.lights.rim, 0.25);
  rim.position.set(3.5, 2.5, -3);
  scene.add(key, bounce, rim);

  const body = robo.group;
  body.frustumCulled = false;
  scene.add(body);
  const BODY_BOTTOM = robo.bottom;
  const ORBIT_UP = 1.2;                    // dizzy beads circle this far above the centre

  const resize = () => {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // ─── Figma drop shadows (screen-facing sprites behind the bot) ──────────
  const SHADOW_EXTENT = 2;
  function shadowSprite(draw) {
    const size = 512, k = size / (2 * SHADOW_EXTENT);
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    ctx.translate(size / 2, size / 2);
    draw(ctx, k);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2 * SHADOW_EXTENT, 2 * SHADOW_EXTENT),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }),
    );
    scene.add(mesh);
    return mesh;
  }
  const DROP = robo.shadows.map((s) => [shadowSprite(s.draw), s.dy]);
  const toCam = new THREE.Vector3(), camUp = new THREE.Vector3(), qRoll = new THREE.Quaternion(), zAxis = new THREE.Vector3(0, 0, 1);
  let viewRoll = 0;
  function placeShadows() {
    toCam.subVectors(camera.position, body.position).normalize();
    camUp.set(0, 1, 0).applyQuaternion(camera.quaternion);
    const dBody = camera.position.distanceTo(body.position);
    qRoll.setFromAxisAngle(zAxis, viewRoll);
    const lift = Math.max(0, body.position.y - HOVER_Y);
    // the shadow stays at hover height while the bot hops, shrinking and fading as it rises
    const away = THREE.MathUtils.clamp(lift / 1.4, 0, 1);
    for (const [sp, dy] of DROP) {
      sp.position.copy(body.position).addScaledVector(toCam, -1.6);
      sp.position.y -= lift;
      const sc = camera.position.distanceTo(sp.position) / dBody;
      sp.scale.setScalar(sc * intro.scale * (1 - 0.25 * away));
      sp.position.addScaledVector(camUp, -dy * sc * intro.scale);
      sp.quaternion.copy(camera.quaternion).multiply(qRoll);
      sp.material.opacity = 1 - 0.75 * away;
    }
  }

  // ─── props: dizzy orbit, Zz ─────────────────────────────────────────────
  const orbiters = [0.075, 0.055, 0.068].map((r, i) => {
    const o = new THREE.Mesh(
      new THREE.SphereGeometry(r, 24, 12),
      new THREE.MeshPhysicalMaterial({ color: 0xfff6a8, roughness: 0.5, clearcoat: 0.2, clearcoatRoughness: 0.4, emissive: 0xfff07a, emissiveIntensity: 0.35 }),
    );
    o.userData.phase = (i * Math.PI * 2) / 3;
    o.scale.setScalar(0);
    scene.add(o);
    return o;
  });
  const zTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const x = c.getContext('2d');
    x.fillStyle = '#fff6b0';
    x.font = '800 104px -apple-system, "SF Pro Rounded", system-ui, sans-serif';
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText('z', 64, 60);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const zs = [];
  let zTimer = 0;

  // ─── rigid-body motion ──────────────────────────────────────────────────
  const m = {
    y: HOVER_Y, vy: 0, airborne: false, hoverY: HOVER_Y,
    x: 0, vx: 0,
    spin: 0, spinV: 0, homing: true, home: 0,
    lastDir: 1,
    nod: 0, nodV: 0, rock: 0, rockV: 0,
    shake: 0,
    lean: 0, leanTarget: 0,              // roll lean while the host drags the bot around
  };
  function hop(v) {
    if (reduceMotion) return;
    if (m.airborne && m.y > m.hoverY + 0.12) return;   // no re-launching mid-air
    m.airborne = true;
    m.vy = Math.min(Math.max(m.vy, 0) + v, 4.6);
  }
  function stepMotion(h) {
    if (!intro.active) {
      // the yaw spring keeps it face-on (soft overshoot)
      m.spinV += (45 * (m.home - m.spin) - 9.5 * m.spinV) * h;
      m.spin += m.spinV * h;
      // a celebratory turn homes on ±2π; once it lands, fold back to 0
      if (m.home && Math.abs(m.home - m.spin) < 0.01 && Math.abs(m.spinV) < 0.05) { m.spin -= m.home; m.home = 0; }
    }
    if (m.airborne) {
      m.vy -= GRAVITY * h;
      m.y += m.vy * h;
      if (m.y <= m.hoverY && m.vy < 0) {
        const impact = -m.vy;
        m.y = m.hoverY;
        m.nodV += Math.min(impact, 4.5) * 0.55;
        m.rockV += m.lastDir * Math.min(impact, 4.5) * 0.35;
        if (impact > 1.5) m.vy = impact * 0.4;
        else { m.airborne = false; m.vy *= 0.3; }
      }
    } else {
      m.vy += (85 * (m.hoverY - m.y) - 11 * m.vy) * h;
      m.y += m.vy * h;
    }
    m.nodV += (-95 * m.nod - 4.6 * m.nodV) * h;
    m.nod += m.nodV * h;
    m.rockV += (-95 * m.rock - 4.6 * m.rockV) * h;
    m.rock += m.rockV * h;
    m.vx += (90 * -m.x - 14 * m.vx) * h;
    m.x += m.vx * h;
    m.lean += (m.leanTarget - m.lean) * (1 - Math.exp(-h * 14));
  }

  // ─── state machine ──────────────────────────────────────────────────────
  let state = 'idle';
  let faceCur = faceSpec('idle');
  let morph = null;
  let stateTime = 0;
  let eyeOpen = 1;
  let blinkT = -1, nextBlink = 2.5;
  let prevState = 'idle', prevStateTime = 0, poseBlend = 1;
  const scripts = [];
  const schedule = (at, fn) => scripts.push({ at: stateTime + at, fn });

  function setState(next, { quiet = false } = {}) {
    if (!STATES.includes(next)) return;
    const prev = state;
    if (prev !== next) { prevState = prev; prevStateTime = stateTime; poseBlend = 0; }
    state = next;
    stateTime = 0;
    scripts.length = 0;
    const to = faceSpec(next);
    const fromPill = faceCur.blink > 0.5, toPill = to.blink > 0.5;
    morph = fromPill !== toPill ? { via: true, fromPill, from: faceCur, to, t: 0 } : { from: faceCur, to, t: 0 };
    m.shake = 0;
    if (quiet || reduceMotion) return;
    switch (next) {
      case 'greeting': hop(3.2); break;
      case 'error':
        m.vx -= 2.4; m.shake = 0.03;
        schedule(0.45, () => { m.shake = 0; });
        break;
      case 'dizzy': m.vx += 1.6; break;
      case 'angry': {
        m.shake = 0.024; m.nodV += 1.4;
        schedule(0.4, () => { m.shake = 0.006; });
        const huff = () => {
          if (state !== 'angry') return;
          hop(1.7); m.shake = 0.02;
          schedule(0.32, () => { if (state === 'angry') m.shake = 0.006; });
          schedule(2.2 + Math.random() * 0.8, huff);
        };
        schedule(1.6, huff);
        break;
      }
      default:
        if (prev === 'sleepy') hop(3.6);
    }
  }

  // ─── face animation ─────────────────────────────────────────────────────
  const drawFace = (spec, open = 1) => robo.drawFace(spec, open);
  function updateFace(dt) {
    if (morph && morph.via) {
      const total = morph.fromPill ? VIA.close + VIA.open : VIA_BACK.reshape + VIA_BACK.open;
      morph.t = Math.min(1, morph.t + dt / total);
      if (morph.fromPill) {
        const split = VIA.close / total;
        if (morph.t < split) {
          faceCur = morph.from;
          drawFace(morph.from, lerp(1, FACE.SQUASH, easeInQuad(morph.t / split)));
        } else {
          faceCur = lerpFace(CLOSED, morph.to, easeOutCubic((morph.t - split) / (1 - split)));
          drawFace(faceCur, 1);
        }
      } else {
        const split = VIA_BACK.reshape / total;
        if (morph.t < split) {
          faceCur = lerpFace(morph.from, CLOSED, easeInOutCubic(morph.t / split));
          drawFace(faceCur, 1);
        } else {
          faceCur = morph.to;
          drawFace(morph.to, lerp(FACE.SQUASH, 1, easeInOutCubic((morph.t - split) / (1 - split))));
        }
      }
      if (morph.t >= 1) { faceCur = morph.to; morph = null; drawFace(faceCur, 1); }
      return;
    }
    if (morph) {
      morph.t = Math.min(1, morph.t + dt / MORPH_S);
      faceCur = lerpFace(morph.from, morph.to, easeInOutCubic(morph.t));
      if (morph.t >= 1) { faceCur = morph.to; morph = null; }
      drawFace(faceCur, 1);
      return;
    }
    if (faceCur.blink > 0.5) {
      nextBlink -= dt;
      if (nextBlink <= 0 && blinkT < 0) blinkT = 0;
      if (blinkT >= 0) {
        blinkT += dt;
        const p = blinkT / 0.16;
        eyeOpen = p < 0.5 ? 1 - p * 2 : (p - 0.5) * 2;
        if (p >= 1) { eyeOpen = 1; blinkT = -1; nextBlink = 1.8 + Math.random() * 3.5; }
        drawFace(faceCur, easeOut(Math.max(0, eyeOpen)));
      }
    }
  }

  // ─── intro ──────────────────────────────────────────────────────────────
  const intro = { active: !reduceMotion && !hidden, t: 0, scale: hidden ? 0 : reduceMotion ? 1 : 0, greeted: reduceMotion || hidden };
  // leaving: shrink with a quarter turn and a little rise, then stay away
  const outro = { active: false, t: 0, done: null };
  let away = hidden;
  const OUTRO_S = 0.34;
  function updateOutro(dt) {
    if (!outro.active) return;
    outro.t += dt;
    const p = Math.min(1, outro.t / OUTRO_S);
    intro.scale = 1 - easeInQuad(p);
    m.spin = -Math.PI * 0.5 * easeInQuad(p);
    if (p >= 1) {
      outro.active = false;
      intro.scale = 0;
      m.spin = 0; m.spinV = 0; m.home = 0;
      away = true;
      const done = outro.done; outro.done = null;
      done?.();
    }
  }
  // a timed look (e.g. at the bubble), over any state's pose
  const lookAt = { yaw: 0, pitch: 0, until: 0 };
  /** public calls cut the first-run intro short, but not a comeback grow-in (enter) */
  const skipIntro = () => { if (intro.active && !comeback) endIntro(); };
  let comeback = false;
  function endIntro() {
    comeback = false;
    if (!intro.active) return;
    intro.active = false;
    intro.greeted = true;
    intro.scale = 1;
    m.spin = 0; m.spinV = 0; m.home = 0;
  }
  function updateIntro(dt) {
    if (!intro.active) return;
    intro.t += dt;
    const t = Math.max(0, intro.t - INTRO.delay);
    const ps = Math.min(1, t / INTRO.scale), pr = Math.min(1, t / INTRO.spin);
    intro.scale = Math.max(0, easeOutBack(ps));
    m.spin = Math.PI * 2 * (1 - easeOutCubic(pr));    // 360° → 0, ends face-on
    m.spinV = 0;
    if (!intro.greeted && intro.t >= GREET_AT) {
      intro.greeted = true;
      setState('greeting', { quiet: true });
      hop(2.2);
      schedule(GREET_FOR, () => { if (state === 'greeting') setState('idle'); });
    }
    if (ps >= 1 && pr >= 1) endIntro();
  }

  // ─── idle glances ───────────────────────────────────────────────────────
  const gaze = { yaw: 0, pitch: 0, vy: 0, vp: 0, ty: 0, tp: 0, i: -1, hold: 1.4 };
  function updateGaze(dt) {
    if (lookAt.until > simT && !reduceMotion) {
      gaze.ty = lookAt.yaw; gaze.tp = lookAt.pitch; gaze.hold = 0.6;
    } else if (state === 'idle' && !intro.active && !reduceMotion) {
      gaze.hold -= dt;
      if (gaze.hold <= 0) {
        gaze.i = (gaze.i + 1) % GLANCES.length;
        [gaze.ty, gaze.tp] = GLANCES[gaze.i];
        const centre = gaze.ty === 0 && gaze.tp === 0;
        gaze.hold = (centre ? 2.8 : 2.0) + Math.random() * 0.8;
        if (Math.random() < 0.3 && blinkT < 0) nextBlink = 0.05;
      }
    } else {
      gaze.ty = 0; gaze.tp = 0; gaze.i = -1; gaze.hold = 0.9;
    }
    const K = 6, D = 2 * Math.sqrt(K);
    gaze.vy += (K * (gaze.ty - gaze.yaw) - D * gaze.vy) * dt;
    gaze.yaw += gaze.vy * dt;
    gaze.vp += (K * (gaze.tp - gaze.pitch) - D * gaze.vp) * dt;
    gaze.pitch += gaze.vp * dt;
  }

  // ─── frame loop ─────────────────────────────────────────────────────────
  const euler = new THREE.Euler(0, 0, 0, 'YXZ');
  const up = new THREE.Vector3();
  const tmpV = new THREE.Vector3();
  const H = 1 / 240;
  let acc = 0;
  let simT = 0;

  function update(dt) {
    simT += dt;
    const t = simT;
    stateTime += dt;
    for (let i = scripts.length - 1; i >= 0; i--) {
      if (stateTime >= scripts[i].at) { const s = scripts[i]; scripts.splice(i, 1); s.fn(); }
    }
    const bob = reduceMotion ? 0 : state === 'working' ? 0.02 : 0.05;
    m.hoverY = state === 'sleepy' ? FLOOR_Y + BODY_BOTTOM : HOVER_Y + Math.sin(t * 1.6) * bob;

    updateIntro(dt);
    updateOutro(dt);
    acc += dt;
    while (acc >= H) { stepMotion(H); acc -= H; }
    updateGaze(dt);

    poseBlend = Math.min(1, poseBlend + dt / POSE_BLEND_S);
    prevStateTime += dt;
    const cur = statePose(state, t, stateTime);
    const pb = easeInOutCubic(poseBlend);
    const pv = pb < 1 ? statePose(prevState, t, prevStateTime) : cur;
    const yaw = gaze.yaw + lerp(pv.yaw, cur.yaw, pb);
    let pitch = BASE_PITCH + gaze.pitch + lerp(pv.pitch, cur.pitch, pb);
    let roll = lerp(pv.roll, cur.roll, pb);
    const sway = lerp(pv.sway, cur.sway, pb);
    roll += THREE.MathUtils.clamp(-m.spinV * 0.012, -0.18, 0.18) - m.rock - m.lean;
    pitch += m.nod;

    euler.set(pitch, yaw + m.spin, roll, 'YXZ');
    viewRoll = roll;
    body.quaternion.setFromEuler(euler);
    body.scale.setScalar(Math.max(1e-4, intro.scale));
    const tremble = m.shake ? Math.sin(t * 90) * m.shake : 0;
    body.position.set(m.x + sway + tremble, m.y, 0);

    updateFace(dt);
    placeShadows();

    up.set(0, 1, 0).applyQuaternion(body.quaternion);
    orbiters.forEach((o, i) => {
      const on = state === 'dizzy' ? 1 : 0;
      o.scale.setScalar(THREE.MathUtils.lerp(o.scale.x, on, 1 - Math.exp(-dt * 10)));
      o.visible = o.scale.x > 0.01;
      if (!o.visible) return;
      const a = t * 3.2 + o.userData.phase;
      tmpV.set(Math.cos(a) * 0.62, 0.02 * Math.sin(a * 2 + i), Math.sin(a) * 0.36);
      o.position.copy(body.position).addScaledVector(up, ORBIT_UP).add(tmpV);
    });

    if (state === 'sleepy') {
      zTimer -= dt;
      if (zTimer <= 0) {
        zTimer = 1.15;
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: zTex, transparent: true, depthWrite: false, toneMapped: false }));
        sp.userData.age = 0;
        sp.position.copy(body.position).add(new THREE.Vector3(0.55, 0.95, 0.3));
        scene.add(sp);
        zs.push(sp);
      }
    }
    for (let i = zs.length - 1; i >= 0; i--) {
      const z = zs[i];
      z.userData.age += dt;
      const a = z.userData.age;
      z.position.x += dt * 0.22 + Math.sin(a * 3) * dt * 0.08;
      z.position.y += dt * 0.38;
      const s = 0.16 + a * 0.12;
      z.scale.set(s, s, 1);
      z.material.opacity = Math.min(1, a * 3) * Math.max(0, 1 - a / 2.6);
      if (a > 2.6) { scene.remove(z); z.material.dispose(); zs.splice(i, 1); }
    }
  }

  let raf = 0;
  let last = performance.now();
  let paused = false;
  let cleared = false; // away and settled: the canvas is cleared once, then nothing is drawn until it comes back
  const frame = (now) => {
    update(Math.min(Math.max(0, now - last) / 1000, 1 / 30));
    last = now;
    const resting = away && !intro.active && !outro.active;
    if (!resting) {
      renderer.render(scene, camera);
      cleared = false;
    } else if (!cleared) {
      renderer.clear();
      cleared = true;
    }
    raf = requestAnimationFrame(frame);
  };
  drawFace(faceCur, 1);
  setState('idle', { quiet: true });
  renderer.compileAsync?.(scene, camera).catch(() => {}); // warm the shaders off the first frame where possible
  raf = requestAnimationFrame(frame);

  return {
    /** a tap: a little hop + nod (wakes it if asleep) */
    tap() {
      skipIntro();
      if (state === 'sleepy') { setState('idle'); return; }
      hop(2.6);
      m.nodV += reduceMotion ? 0 : 1.2;
    },
    /** lean while being dragged: horizontal drag velocity in px/s (0 on release) */
    setLean(vx) {
      if (reduceMotion) return;
      const target = THREE.MathUtils.clamp(vx / 1600, -1, 1) * 0.3;
      if (target === 0 && m.lean) m.rockV += m.lean * 4;   // let go: it rocks back upright
      if (vx) m.lastDir = Math.sign(vx);
      m.leanTarget = target;
    },
    setState(next) { skipIntro(); setState(next); },
    /** come back (grow in with a full turn) after `hidden` / exit(); true if it had to */
    enter() {
      const leaving = outro.active;
      outro.active = false; outro.done = null;   // a new event cancels a leave in progress
      if (!away && !leaving) return false;       // already here
      const from = away ? 0 : intro.scale;
      away = false;
      if (reduceMotion) { intro.scale = 1; return true; }
      // grow back from wherever the leave got to (no snap)
      intro.active = true; intro.greeted = true; comeback = true;
      intro.t = INTRO.delay + INTRO.scale * from * 0.45;
      if (!from) { m.y = m.hoverY - 0.6; m.vy = 0; m.airborne = false; } // rises up into place as it grows
      return true;
    },
    /** leave: shrink away, then call done */
    exit(done) {
      endIntro();
      if (away) { done?.(); return; }
      if (reduceMotion) { intro.scale = 0; away = true; done?.(); return; }
      outro.active = true; outro.t = 0; outro.done = done;
    },
    get away() { return away; },
    /** stop rendering (e.g. while covered by an overlay); resumes from where it was */
    setPaused(on) {
      if (on === paused) return;
      paused = on;
      if (on) cancelAnimationFrame(raf);
      else { last = performance.now(); raf = requestAnimationFrame(frame); }
    },
    /** a joyful hop with a full spin */
    celebrate() {
      skipIntro();
      if (reduceMotion) return;
      hop(3.6);
      m.home += m.lastDir >= 0 ? Math.PI * 2 : -Math.PI * 2;
    },
    /** look toward (yaw, pitch) for a while, whatever the state */
    look(yaw, pitch, secs = 1.2) {
      lookAt.yaw = yaw; lookAt.pitch = pitch; lookAt.until = simT + secs;
    },
    get state() { return state; },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      const textures = new Set();
      scene.traverse((o) => {
        o.geometry?.dispose();
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
        for (const mat of mats) {
          for (const v of Object.values(mat)) if (v?.isTexture) textures.add(v);
          mat.dispose();
        }
      });
      textures.add(zTex);
      textures.forEach((t) => t.dispose());
      envScene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
      envRT.dispose();
      pmrem.dispose();
      // no forceContextLoss: the canvas is reused when React remounts (StrictMode)
      renderer.dispose();
    },
  };
}
