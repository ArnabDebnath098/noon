// 3D bell for the "Updates today" header (replaces the flat header-bell.png).
//
// Built to match the art: a polished chrome bell (lathe-turned shoulder,
// waist and flared lip) with a purple velvet band between two chrome rings,
// a chrome hanging loop with a purple inner loop, and a clapper — chrome stem,
// purple ball peeking out of the mouth — hung on its own pivot inside.
//
// Motion is two coupled pendulums: the bell swings from its loop, and the
// clapper swings inside it, driven by the bell's acceleration, so it lags,
// catches up and knocks the inner wall (each knock nudges the bell back and
// flashes the sparkles; a burst of sparks scatters out on each ring). ring() gives the bell a push; between rings it keeps
// a gentle sway and a slow turn so it reads as 3D.
import * as THREE from 'three';

// ─── profile (units; y up, bell mouth at y ≈ −0.56) ───────────────────────
const PROFILE = new THREE.SplineCurve([
  [0.0, 1.0], [0.34, 0.985], [0.56, 0.92], [0.69, 0.77], [0.745, 0.55], [0.765, 0.3],
  [0.79, 0.05], [0.86, -0.18], [0.97, -0.37], [1.07, -0.5], [1.11, -0.56],
].map(([x, y]) => new THREE.Vector2(x, y))).getPoints(90);
/** outer radius at height y */
function radiusAt(y) {
  for (let i = 1; i < PROFILE.length; i++) {
    const a = PROFILE[i - 1], b = PROFILE[i];
    if ((y <= a.y && y >= b.y) || (y >= a.y && y <= b.y)) return a.x + ((b.x - a.x) * (y - a.y)) / (b.y - a.y || 1);
  }
  return PROFILE.at(-1).x;
}
const LIP_Y = -0.56;
const HINGE_Y = 1.3; // the bell swings from the top of its loop
const BAND = { top: -0.1, bottom: -0.4, lift: 0.045 };
const WALL = 0.3; // rad: the clapper's swing before it meets the inner wall
const GLINT = { start: 1.1, every: 3.2, sweep: 0.9, peak: 5 }; // s · s · s · light intensity at mid-sweep

function noiseTexture(w, h, { streak = 1, amp = 70, seed = 1 } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  const img = x.createImageData(w, h);
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let j = 0; j < h; j++) {
    let run = 0, v = 128;
    for (let i = 0; i < w; i++) {
      if (run-- <= 0) { v = 128 + (r() - 0.5) * amp; run = Math.floor(r() * streak); }
      img.data.set([v, v, v, 255], (j * w + i) * 4);
    }
  }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function starTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.12, 'rgba(255,255,255,0.8)');
  g.addColorStop(0.3, 'rgba(255,240,255,0.15)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  x.fillStyle = '#fff';
  x.beginPath(); // four-point star
  x.moveTo(64, 2); x.quadraticCurveTo(68, 60, 126, 64); x.quadraticCurveTo(68, 68, 64, 126);
  x.quadraticCurveTo(60, 68, 2, 64); x.quadraticCurveTo(60, 60, 64, 2);
  x.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// a jewellery-shot studio for polished chrome: a dim dome (chrome reads as
// chrome only with darks to reflect) over a dark floor, big white softboxes, hot strip lights for the crisp streaks, and
// purple cards for the purple rims in the art
function chromeEnvironment() {
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(
    new THREE.SphereGeometry(20, 48, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `varying vec3 vP;
        void main(){
          float h = normalize(vP).y;
          vec3 floorC = vec3(0.05, 0.05, 0.07);
          vec3 horizon = vec3(0.34, 0.34, 0.38); // a light horizon: the chrome reads white, not gunmetal
          vec3 sky = vec3(0.72, 0.72, 0.76); // bright sky: broad white reflections over the crown
          vec3 c = h < 0.0 ? mix(horizon, floorC, smoothstep(0.0, -0.5, h)) : mix(horizon, sky, smoothstep(0.0, 0.8, h));
          gl_FragColor = vec4(c, 1.0);
        }`,
    }),
  ));
  const panel = (w, h, color, k, pos) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
    p.position.set(...pos);
    p.lookAt(0, 0, 0);
    env.add(p);
  };
  panel(12, 10, 0xffffff, 2.8, [-8, 7, 9]); // key softbox
  panel(10, 8, 0xf4f6ff, 2.0, [9, 3, 8]); // fill, a touch cool
  panel(16, 10, 0xffffff, 1.2, [0, 2, 14]); // a big soft front card: lifts the whole face to white
  panel(1.2, 14, 0xffffff, 4.4, [-4, 1, 12]); // strips: the bright vertical streaks of polished metal
  panel(1, 12, 0xffffff, 3.4, [6, 0, 11]);
  panel(0.5, 12, 0xffffff, 3, [1.5, 0, 12]); // a thin centre streak
  panel(14, 0.8, 0xffffff, 2.6, [0, 9, 4]); // a hard top line along the shoulder
  panel(6, 9, 0xd8def0, 1.2, [12, -1, -6]); // silver cards behind the sides: cool metal rims
  panel(5, 8, 0xd8def0, 0.9, [-12, -2, -5]);
  panel(8, 2, 0x8a3dff, 0.7, [0, -8, -4]); // just a hint of purple from below, to sit with the velvet
  return env;
}

export function createBell3D({ canvas, reduceMotion = false }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); // a ~70px bell: 2× is plenty
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const envScene = chromeEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(envScene, 0.03);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 1.35;
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(-3, 5, 6);
  // the glint: a light that sweeps across now and then, sliding a sharp highlight over the chrome
  const glint = new THREE.DirectionalLight(0xffffff, 0);
  glint.position.set(-6, 3, 6);
  scene.add(key, glint, new THREE.HemisphereLight(0xf4f6ff, 0x1c1a2a, 0.45));

  const camera = new THREE.PerspectiveCamera(20, 1, 0.1, 100);
  camera.position.set(0, -0.2, 12.2);
  camera.lookAt(0, 0.2, 0);
  const resize = () => {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // ─── materials ──────────────────────────────────────────────────────────
  const brushed = noiseTexture(512, 64, { streak: 40, amp: 40, seed: 7 }); // horizontal hairlines
  const chrome = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 1, roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.03, // polished silver
    bumpMap: brushed, bumpScale: 0.045,
  });
  const inside = new THREE.MeshPhysicalMaterial({ color: 0xd8dce6, metalness: 1, roughness: 0.24, side: THREE.BackSide, bumpMap: brushed, bumpScale: 0.05 });
  const fuzz = noiseTexture(256, 256, { streak: 1, amp: 160, seed: 3 });
  fuzz.repeat.set(6, 1.5);
  const velvet = new THREE.MeshPhysicalMaterial({
    color: 0x5410c4, roughness: 0.95, metalness: 0, sheen: 1, sheenColor: new THREE.Color(0xa85cff), sheenRoughness: 0.35,
    bumpMap: fuzz, bumpScale: 0.8, envMapIntensity: 0.35, // velvet drinks light: keep the bright studio off it
  });
  const purpleGloss = new THREE.MeshPhysicalMaterial({ color: 0x8a2cff, metalness: 0.4, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 });
  const ballFuzz = noiseTexture(128, 128, { amp: 120, seed: 11 });
  ballFuzz.repeat.set(3, 2);
  const ballMat = new THREE.MeshPhysicalMaterial({
    color: 0x7a22ee, roughness: 0.55, sheen: 0.8, sheenColor: new THREE.Color(0xd2a6ff), sheenRoughness: 0.5, bumpMap: ballFuzz, bumpScale: 0.6,
  });

  // ─── model ──────────────────────────────────────────────────────────────
  const tilt = new THREE.Group(); // the art's pose: mouth tipped toward us, leaning a touch
  const swing = new THREE.Group(); // pendulum, hinged at the loop
  swing.position.y = HINGE_Y;
  const bell = new THREE.Group();
  bell.position.y = -HINGE_Y;
  swing.add(bell);
  tilt.add(swing);
  scene.add(tilt);
  tilt.position.y = 0.1;

  // LatheGeometry faces point outward only for points ordered bottom → top
  const up = (pts) => [...pts].reverse();
  const outer = new THREE.Mesh(new THREE.LatheGeometry(up(PROFILE), 96), chrome);
  const inner = new THREE.Mesh(new THREE.LatheGeometry(up(PROFILE.map((p) => new THREE.Vector2(p.x * 0.955, p.y - 0.02))), 96), inside);
  // velvet band: follows the profile, rounded top and bottom
  const bandPts = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const y = BAND.top + (BAND.bottom - BAND.top) * t;
    const round = Math.sin(Math.PI * Math.min(1, Math.min(t, 1 - t) * 6) * 0.5); // eases in at the edges
    bandPts.push(new THREE.Vector2(radiusAt(y) + BAND.lift * round, y));
  }
  const band = new THREE.Mesh(new THREE.LatheGeometry(up(bandPts), 96), velvet);
  const ring = (y, tube, extra = 0) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(radiusAt(y) + extra, tube, 20, 120), chrome);
    m.rotation.x = Math.PI / 2;
    m.position.y = y;
    return m;
  };
  const lip = ring(LIP_Y + 0.012, 0.05, -0.02);
  const ringTop = ring(BAND.top + 0.005, 0.022, 0.03);
  const ringLow = ring(BAND.bottom - 0.035, 0.04, 0.025);
  // crown: a collar and the hanging loop (chrome outside, purple inside)
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.07, 48), chrome);
  collar.position.y = 0.995;
  const loop = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.065, 24, 64, Math.PI), chrome);
  loop.position.y = 1.02;
  const loopIn = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.04, 20, 48, Math.PI), purpleGloss);
  loopIn.position.set(0, 1.02, -0.02);
  bell.add(outer, inner, band, lip, ringTop, ringLow, collar, loop, loopIn);

  // clapper: its own pendulum inside the bell
  const CLAP_PIVOT = 0.78;
  const clapper = new THREE.Group();
  clapper.position.y = CLAP_PIVOT;
  const stemLen = CLAP_PIVOT - (LIP_Y - 0.02);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, stemLen, 24), chrome);
  stem.position.y = -stemLen / 2;
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.25, 48, 32), ballMat);
  ball.position.y = -stemLen - 0.2; // hangs below the rim, as in the art
  clapper.add(stem, ball);
  bell.add(clapper);

  // sparkles: a ring of twinkles that live around the bell…
  const starTex = starTexture();
  const star = () => new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, depthWrite: false, toneMapped: false }));
  const stars = [[-1.25, 0.25, 0.32], [1.05, 0.95, 0.38], [1.3, -0.3, 0.3], [-0.9, 1.1, 0.22], [0.2, 1.55, 0.2], [-1.45, -0.55, 0.18]].map(([x, y, s], i) => {
    const sp = star();
    sp.position.set(x, y, 0.5);
    sp.userData = { s, phase: i * 2.1 };
    scene.add(sp);
    return sp;
  });
  // …and a burst that scatters out from it when it appears / rings: each spark flies outward,
  // slows, flares and fades, with a little spin
  const SPARKS = 14;
  const sparks = Array.from({ length: SPARKS }, () => {
    const sp = star();
    sp.visible = false;
    sp.userData = { age: 99, life: 1, vx: 0, vy: 0, s: 0.3, spin: 0 };
    scene.add(sp);
    return sp;
  });
  const rnd = (a, b) => a + Math.random() * (b - a);
  function burst(strength = 1) {
    if (reduceMotion) return;
    for (const sp of sparks) {
      const ang = rnd(0, Math.PI * 2);
      const r = rnd(0.55, 0.95); // start at the bell's edge
      sp.position.set(Math.cos(ang) * r, 0.25 + Math.sin(ang) * r * 0.85, 0.6);
      const speed = rnd(1.6, 3.4) * strength;
      sp.userData = { age: -rnd(0, 0.18), life: rnd(0.75, 1.25), vx: Math.cos(ang) * speed, vy: Math.sin(ang) * speed + 0.4, s: rnd(0.14, 0.34), spin: rnd(-2, 2) };
    }
  }

  // ─── motion: coupled pendulums ──────────────────────────────────────────
  const B = { a: 0, v: 0, w: 2 * Math.PI * 1.05, c: 1.5 }; // bell
  const C = { a: 0, v: 0, w: 2 * Math.PI * 1.7, c: 1.1 }; // clapper (relative to the bell)
  let flash = 0;
  let pushDir = 1;
  let t = 0, raf = 0, last = performance.now();
  const H = 1 / 240;
  let acc = 0;
  function step(h) {
    const sway = reduceMotion ? 0 : Math.sin(t * 1.3) * 0.35; // a breath of drive between rings
    const prevV = B.v;
    B.v += (-B.w * B.w * B.a - B.c * B.v + sway) * h;
    B.a += B.v * h;
    const bellAcc = (B.v - prevV) / h;
    C.v += (-C.w * C.w * C.a - C.c * C.v - bellAcc * 1.15) * h;
    C.a += C.v * h;
    if (Math.abs(C.a) > WALL) {
      // knock: bounce off the inner wall, nudge the bell, flash the sparkles
      const dir = Math.sign(C.a);
      C.a = dir * WALL;
      const hit = Math.abs(C.v);
      C.v = -C.v * 0.45;
      if (hit > 0.6) {
        B.v -= dir * Math.min(hit, 6) * 0.05;
        flash = Math.min(1, flash + hit * 0.18);
      }
    }
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    t += dt;
    if (!reduceMotion) {
      acc += dt;
      while (acc >= H) { step(H); acc -= H; }
    }
    swing.rotation.z = B.a;
    clapper.rotation.z = C.a;
    // the art's pose: mouth tipped toward us (so the clapper shows), leaning a touch, slowly turning
    tilt.rotation.set(-0.24, reduceMotion ? 0.25 : 0.25 + Math.sin(t * 0.55) * 0.35, -0.14);
    if (!reduceMotion) {
      // every GLINT.every s, a quick sweep left → right (eased in and out), bright in the middle
      const g = (t - GLINT.start) % GLINT.every;
      const p = t > GLINT.start && g < GLINT.sweep ? g / GLINT.sweep : -1;
      if (p >= 0) {
        const e = p * p * (3 - 2 * p);
        glint.position.set(-7 + 14 * e, 3.5 - 1.5 * e, 6);
        glint.intensity = GLINT.peak * Math.sin(Math.PI * p);
      } else glint.intensity = 0;
    }
    flash *= Math.exp(-dt * 3.5);
    for (const sp of stars) {
      const { s, phase } = sp.userData;
      const tw = reduceMotion ? 0.8 : 0.55 + 0.45 * Math.sin(t * 2.4 + phase) ** 2;
      const k = s * (tw + flash * 0.6);
      sp.scale.set(k, k, 1);
      sp.material.opacity = Math.min(1, tw * 0.9 + flash);
      sp.material.rotation = reduceMotion ? 0 : Math.sin(t * 0.8 + phase) * 0.3;
    }
    for (const sp of sparks) {
      const u = sp.userData;
      u.age += dt;
      if (u.age < 0 || u.age > u.life) {
        sp.visible = false;
        continue;
      }
      sp.visible = true;
      const p = u.age / u.life;
      // drift out and slow down (drag), a touch of lift
      const drag = Math.exp(-dt * 2.2);
      u.vx *= drag;
      u.vy = u.vy * drag + 0.25 * dt;
      sp.position.x += u.vx * dt;
      sp.position.y += u.vy * dt;
      // flare in fast, fade out slow
      const k = u.s * (p < 0.15 ? p / 0.15 : 1 - ((p - 0.15) / 0.85) * 0.6);
      sp.scale.set(k, k, 1);
      sp.material.opacity = p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85;
      sp.material.rotation += u.spin * dt;
    }
    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);
  // nothing to see while the page is hidden: stop rendering until it's back
  const onVisibility = () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };
  document.addEventListener('visibilitychange', onVisibility);

  return {
    /** push the bell: it swings, and the clapper catches up and knocks */
    ring(strength = 1) {
      if (reduceMotion) return;
      B.v += pushDir * 3.4 * strength;
      burst(strength);
      pushDir = -pushDir;
    },
    dispose() {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
      ro.disconnect();
      scene.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose?.();
      });
      for (const tex of [brushed, fuzz, ballFuzz, starTex]) tex.dispose();
      envScene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
