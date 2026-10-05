// 3D message bubbles that pop out of the noon bot (task / approval states).
//
// Each bubble is a glossy, puffy speech bubble (a pill with the tail grown out
// of the same outline, rolled edges) in the state colour, with a silver-rimmed dark glass screen like the
// bot's face. The message is spelled on the screen in a 5 × 7 LED dot-matrix
// font that types in column by column. The body has the bot's skin: a tint
// gradient, white glitter speckles and a fine grain; "waiting" blinks its dots.
//
// The canvas is a transparent strip over the page (sized by CSS). The host
// passes the tail tip in canvas px (the bot's head) and whether the bubble
// sits above or below it; the bubble clamps itself inside the strip and the
// tail slides to keep pointing at the bot. World units are CSS px.
//
// Performance: each state's geometry, textures and LED sprites are built once
// and cached; following the bot reuses the centred body, and a body slid
// toward a screen edge (tail still straight down at the bot) is built once per
// px offset and cached; glows are baked into sprites; shaders are warmed at mount; setPaused()
// stops the loop while the bubble is covered.
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { studioEnvironment } from './noonBot.js';

// ─── states ───────────────────────────────────────────────────────────────
export const BUBBLES = {
  task: { text: 'NEW TASK', icon: 'task', body: 0x8a4dff, led: '#8dff7a' },
  pending: { text: 'WAITING', icon: 'hourglass', body: 0xffb020, led: '#ffd860', dots: true },
  approved: { text: 'APPROVED', icon: 'check', body: 0x22c063, led: '#7dff9c' },
  declined: { text: 'DECLINED', icon: 'cross', body: 0xff4a5c, led: '#ff8a94' },
};

// ─── 5 × 7 LED font (variable width) + 7 × 7 icons ────────────────────────
const GLYPHS = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  I: ['111', '010', '010', '010', '010', '010', '111'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  ' ': ['000', '000', '000', '000', '000', '000', '000'],
  '.': ['0', '0', '0', '0', '0', '0', '1'],
};
const ICONS = {
  task: ['1111111', '1000001', '1011101', '1000001', '1011101', '1000001', '1111111'],
  hourglass: ['1111111', '0100010', '0011100', '0001000', '0010100', '0111110', '1111111'],
  check: ['0000000', '0000001', '0000011', '1000110', '1101100', '0111000', '0010000'],
  cross: ['1000001', '1100011', '0110110', '0011100', '0110110', '1100011', '1000001'],
};

/** lit cells of a message: [{ x, y, dot }] on a 7-row grid, plus its width in cells */
function layoutCells(spec) {
  const cells = [];
  const put = (rows, x0, extra = {}) => rows.forEach((r, y) => [...r].forEach((b, x) => b === '1' && cells.push({ x: x0 + x, y, ...extra })));
  let x = 0;
  put(ICONS[spec.icon], x);
  x += 7 + 3;
  for (const ch of spec.text) {
    const g = GLYPHS[ch] || GLYPHS[' '];
    put(g, x);
    x += g[0].length + 1;
  }
  if (spec.dots) {
    for (let i = 0; i < 3; i++) {
      put(GLYPHS['.'], x, { dot: i });
      x += 2;
    }
  }
  return { cells, cols: x - 1 };
}

// ─── sizes (CSS px) ───────────────────────────────────────────────────────
const CELL = 2; // px per LED (sizes the screen)
const TEXT_SCALE = 0.84; // the lit message is drawn a touch smaller than the cell grid, inside the same screen
const TEX = 8; // texture px per CSS px (crisp LEDs on 3× screens)
const PAD_X = 4; // cells
const PAD_Y = 3;
const RIM = 2.5; // silver bezel width
const MARGIN = 9; // bubble body around the bezel
// puffy body: a thin core with a deep quarter-round bevel, so the edge rolls round like a toy
const DEPTH = 2;
const BEVEL = { thick: 8, size: 4, segs: 14 };
const TAIL = { w: 30, h: 12 }; // root width, tip → body: short and wide, a classic speech tail
const EDGE = 12; // keep the body this far inside the canvas
const TYPE_S = 0.42; // s: the message types in
const SKIN = 4; // body texture px per CSS px

// seeded random, so a bubble's speckles are the same every time it shows
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** body texture area around the bubble centre (covers the tail either side) */
const skinBox = (w, h) => ({ tw: w + 16, th: h + 2 * TAIL.h + 16 });

export const bubbleSize = (kind) => {
  const { cols } = layoutCells(BUBBLES[kind]);
  const sw = (cols + 2 * PAD_X) * CELL;
  const sh = (7 + 2 * PAD_Y) * CELL;
  return { w: sw + 2 * (RIM + MARGIN), h: sh + 2 * (RIM + MARGIN), sw, sh };
};

/** a pill (stadium) centred on the origin */
function pillShape(w, h, shape = new THREE.Shape()) {
  const r = h / 2, a = w / 2 - r;
  shape.moveTo(-a, -r);
  shape.lineTo(a, -r);
  shape.absarc(a, 0, r, -Math.PI / 2, Math.PI / 2, false);
  shape.lineTo(-a, r);
  shape.absarc(-a, 0, r, Math.PI / 2, (3 * Math.PI) / 2, false);
  return shape;
}

/**
 * The bubble outline in one piece: a pill centred at (cx, cy) with the tail
 * grown out of its bottom edge on smooth fillets, tip at (0, tipY). Sampled to
 * points so it can be mirrored for a bubble that hangs below the bot (dir −1).
 * Sizes are pre-bevel (the bevel pushes the outline out by BEVEL.size).
 */
function bubbleOutline(w, h, cx, cy, tipY, dir) {
  const pts = [];
  const r = h / 2, a = w / 2 - r, yb = cy - r;
  const arc = (x0, y0, a0, a1, n = 28) => {
    for (let i = 0; i <= n; i++) {
      const t = a0 + ((a1 - a0) * i) / n;
      pts.push([x0 + Math.cos(t) * r, y0 + Math.sin(t) * r]);
    }
  };
  const bez = (p0, p1, p2, p3, n = 18) => {
    for (let i = 1; i <= n; i++) {
      const t = i / n, u = 1 - t;
      pts.push([
        u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
      ]);
    }
  };
  // tail root sits straight over the tip (only shifts if the body can't cover it)
  const tw = TAIL.w / 2;
  const rx = THREE.MathUtils.clamp(0, cx - a + tw * 0.5, cx + a - tw * 0.5);
  const L = [rx - tw, yb], R = [rx + tw, yb];
  const TR = 2.6; // tip roundness
  const Tl = [-TR, tipY + TR * 0.85], Tr = [TR, tipY + TR * 0.85];
  const toward = (p, q, k) => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
  pts.push([cx - a, yb]);
  if (L[0] > cx - a) pts.push(L);
  // near-straight flanks with a soft fillet into the bubble, meeting in a rounded tip
  bez(L, [rx - tw * 0.45, yb], toward(Tl, L, 0.3), Tl);
  bez(Tl, [-TR * 0.45, tipY - TR * 0.15], [TR * 0.45, tipY - TR * 0.15], Tr, 10);
  bez(Tr, toward(Tr, R, 0.3), [rx + tw * 0.45, yb], R);
  if (R[0] < cx + a) pts.push([cx + a, yb]);
  arc(cx + a, cy, -Math.PI / 2, Math.PI / 2);
  arc(cx - a, cy, Math.PI / 2, (3 * Math.PI) / 2);
  pts.pop(); // closes on the start point
  const v = pts.map(([x, y]) => new THREE.Vector2(x, y * dir));
  if (dir < 0) v.reverse(); // keep the winding counter-clockwise
  return new THREE.Shape(v);
}

const extrude = (shape, depth, bevel, curveSegments = 48) => {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelThickness: bevel.thick, bevelSize: bevel.size, bevelSegments: bevel.segs ?? 4, curveSegments,
  });
  g.translate(0, 0, -depth / 2);
  // ExtrudeGeometry is unindexed, so its normals are per face: the rolled edge
  // read as flat bands. Weld the vertices and recompute for one smooth surface.
  g.deleteAttribute('normal');
  g.deleteAttribute('uv');
  const smooth = mergeVertices(g, 1e-3);
  g.dispose();
  smooth.computeVertexNormals();
  return smooth;
};

// ─── engine ───────────────────────────────────────────────────────────────
export function createBubble3D({ canvas, reduceMotion = false }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 3));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = studioEnvironment();
  const envRT = pmrem.fromScene(envScene, 0.06);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 1.15;
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-120, 200, 260);
  scene.add(key, new THREE.HemisphereLight(0xf4f2ff, 0x4c4466, 0.8));

  // perspective camera framed so z = 0 maps 1 unit → 1 CSS px
  const FOV = 22;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 5000);
  let W = 1, H = 1;
  const resize = () => {
    W = canvas.clientWidth || 1;
    H = canvas.clientHeight || 1;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.position.set(0, 0, H / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    dirty = true;
  };
  let dirty = true;
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // pivot sits on the tail tip, so the bubble grows out of the bot
  const pivot = new THREE.Group();
  const wobble = new THREE.Group();
  pivot.add(wobble);
  scene.add(pivot);

  const bodyMat = new THREE.MeshPhysicalMaterial({
    // smooth lacquer: glossy base, subtle clearcoat, the grain only a whisper
    color: 0xffffff, bumpScale: 0.12,
    roughness: 0.3, clearcoat: 0.45, clearcoatRoughness: 0.12, sheen: 0.2, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xffffff),
  });
  const silverMat = new THREE.MeshPhysicalMaterial({ color: 0xe6e9f2, metalness: 1, roughness: 0.12, envMapIntensity: 1.4 }); // polished bezel
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.04, transparent: true, opacity: 0.22, depthWrite: false });
  const screenMat = new THREE.MeshBasicMaterial({ toneMapped: false });
  const shadowMat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, toneMapped: false });
  const maxAniso = renderer.capabilities.getMaxAnisotropy();

  // ─── per-state assets, built once and kept ──────────────────────────────
  // Everything that depends only on the state — the body geometry template,
  // skin + grain + shadow textures, the screen backdrop and LED glow sprites —
  // is made the first time that bubble shows and reused after, so a show costs
  // a few texture binds rather than a rebuild (which used to hitch the frame).
  const kinds = new Map();
  function prepare(kind) {
    let k = kinds.get(kind);
    if (k) return k;
    const spec = BUBBLES[kind];
    const layout = layoutCells(spec);
    const { w, h, sw, sh } = bubbleSize(kind);
    const b = BEVEL.size;
    const cy = TAIL.h + h / 2;

    // body: the pill with its tail grown out of the bottom edge. With the bubble
    // centred over the bot (the usual case) this template is used as is; when it
    // has to slide sideways to stay on screen, the outline is rebuilt with the
    // pill shifted and the tail still pointing straight down at the bot (see
    // bodyFor) — shearing one template instead dragged the tail into a slanted blob.
    const { tw, th } = skinBox(w, h);
    const makeBody = (cx) => {
      const geo = extrude(bubbleOutline(w - 2 * b, h - 2 * b, cx, cy, b, 1), DEPTH, BEVEL, 1);
      const pos = geo.attributes.position;
      const uv = new Float32Array(pos.count * 2);
      for (let i = 0; i < pos.count; i++) {
        uv[i * 2] = (pos.getX(i) - cx) / tw + 0.5; // the skin rides with the pill
        uv[i * 2 + 1] = (pos.getY(i) - cy) / th + 0.5;
      }
      geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      return geo;
    };
    const bodyGeo = makeBody(0);

    // skin: state-colour gradient + white glitter speckles (as on the bot's head)
    const skinCanvas = document.createElement('canvas');
    const CW = Math.round(tw * SKIN), CH = Math.round(th * SKIN);
    skinCanvas.width = CW;
    skinCanvas.height = CH;
    const c = skinCanvas.getContext('2d');
    const baseCol = new THREE.Color(spec.body);
    const css = (col) => `#${col.getHexString()}`;
    const top = (0.5 - h / 2 / th) * CH, bot = (0.5 + h / 2 / th) * CH;
    const g = c.createLinearGradient(0, top, 0, bot);
    g.addColorStop(0, css(baseCol.clone().lerp(new THREE.Color(0xffffff), 0.3)));
    g.addColorStop(0.45, css(baseCol));
    g.addColorStop(1, css(baseCol.clone().lerp(new THREE.Color(0x000000), 0.3))); // also tints the tail
    c.fillStyle = g;
    c.fillRect(0, 0, CW, CH);
    c.save(); // a soft lit band across the upper half
    c.filter = `blur(${6 * SKIN}px)`;
    c.fillStyle = 'rgba(255,255,255,0.16)';
    c.beginPath();
    c.ellipse(CW * 0.42, top + (bot - top) * 0.22, tw * 0.34 * SKIN, (bot - top) * 0.14, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
    const r = rng([...kind].reduce((n, ch) => n * 31 + ch.charCodeAt(0), 7));
    const n = Math.round((w * h) / 70);
    for (let i = 0; i < n; i++) {
      const big = r() < 0.12;
      const x = (8 + r() * w) * SKIN, y = top + r() * (bot - top);
      const rad = (big ? 0.9 + r() * 0.5 : 0.3 + r() * 0.45) * SKIN;
      c.fillStyle = `rgba(255,255,255,${big ? 0.75 + r() * 0.25 : 0.3 + r() * 0.45})`;
      c.beginPath();
      c.arc(x, y, rad, 0, Math.PI * 2);
      c.fill();
    }
    const skinTex = new THREE.CanvasTexture(skinCanvas);
    skinTex.colorSpace = THREE.SRGBColorSpace;
    skinTex.anisotropy = maxAniso;
    // grain: soft value noise, a whisper of a bump
    const bumpCanvas = document.createElement('canvas');
    const BW = Math.round(tw * 2), BH = Math.round(th * 2);
    bumpCanvas.width = BW;
    bumpCanvas.height = BH;
    const bc = bumpCanvas.getContext('2d');
    const img = bc.createImageData(BW, BH);
    for (let i = 0; i < BW * BH; i++) {
      const v = 128 + (r() - 0.5) * 90;
      img.data.set([v, v, v, 255], i * 4);
    }
    bc.putImageData(img, 0, 0);
    bc.filter = 'blur(0.6px)';
    bc.drawImage(bumpCanvas, 0, 0);
    const bumpTex = new THREE.CanvasTexture(bumpCanvas);

    // silver bezel + screen: concentric pills inside the body
    const bezShape = pillShape(sw + 2 * RIM, sh + 2 * RIM);
    bezShape.holes.push(pillShape(sw, sh));
    const bezelGeo = extrude(bezShape, 0.6, { thick: 1.1, size: 0.7, segs: 4 });
    const screenGeo = new THREE.ShapeGeometry(pillShape(sw, sh), 32);
    remapUV(screenGeo, sw, sh);

    // drop shadow: a soft pill under the body
    const pad = 24;
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = (w + 2 * pad) * 2;
    shadowCanvas.height = (h + 2 * pad) * 2;
    const x = shadowCanvas.getContext('2d');
    x.scale(2, 2);
    x.filter = 'blur(8px)';
    x.fillStyle = 'rgba(30,6,80,0.3)';
    x.translate(pad + w / 2, pad + h / 2);
    x.beginPath();
    x.roundRect(-w * 0.45, -h * 0.38, w * 0.9, h * 0.76, h * 0.38);
    x.fill();
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(w + 2 * pad, h + 2 * pad);

    // the LED screen: a live canvas, drawn from a pre-rendered backdrop (glass + unlit matrix),
    // one glowing-LED sprite per lit cell, and a pre-rendered overlay (scanlines + glare).
    // Glows are the slow part of canvas drawing (shadowBlur), so they're baked into the sprites once.
    const screenCanvas = document.createElement('canvas');
    const cw = Math.round(sw * TEX), ch = Math.round(sh * TEX);
    screenCanvas.width = cw;
    screenCanvas.height = ch;
    const screenTex = new THREE.CanvasTexture(screenCanvas);
    screenTex.colorSpace = THREE.SRGBColorSpace;
    screenTex.anisotropy = maxAniso;
    screenTex.generateMipmaps = false;
    screenTex.minFilter = THREE.LinearFilter;
    const s = CELL * TEX * TEXT_SCALE;
    const dot = s * 0.78, rr = s * 0.2;
    const grid = { s, dot, ox: (cw - layout.cols * s) / 2, oy: (ch - 7 * s) / 2 };
    const backdrop = document.createElement('canvas');
    backdrop.width = cw;
    backdrop.height = ch;
    {
      const d = backdrop.getContext('2d');
      // deep black glass, recessed into the bezel: near-black in the middle, falling to pure black at
      // the rim, with an inner shadow along the top edge and a faint lift at the bottom
      const bg = d.createLinearGradient(0, 0, 0, ch);
      bg.addColorStop(0, '#000000');
      bg.addColorStop(0.45, '#07070b');
      bg.addColorStop(1, '#0d0c14');
      d.fillStyle = bg;
      d.fillRect(0, 0, cw, ch);
      const vignette = d.createRadialGradient(cw / 2, ch / 2, Math.min(cw, ch) * 0.2, cw / 2, ch / 2, Math.max(cw, ch) * 0.62);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.75)');
      d.fillStyle = vignette;
      d.fillRect(0, 0, cw, ch);
      const lip = d.createLinearGradient(0, 0, 0, ch * 0.32);
      lip.addColorStop(0, 'rgba(0,0,0,0.85)');
      lip.addColorStop(1, 'rgba(0,0,0,0)');
      d.fillStyle = lip;
      d.fillRect(0, 0, cw, ch * 0.32);
      const lift = d.createLinearGradient(0, ch * 0.82, 0, ch);
      lift.addColorStop(0, 'rgba(255,255,255,0)');
      lift.addColorStop(1, 'rgba(255,255,255,0.05)');
      d.fillStyle = lift;
      d.fillRect(0, ch * 0.82, cw, ch * 0.18);
      // unlit matrix: barely-there dots everywhere the text could be (dim, so the lit ones pop)
      d.fillStyle = 'rgba(255,255,255,0.028)';
      for (let yy = 0; yy < 7; yy++)
        for (let xx = 0; xx < layout.cols; xx++) {
          d.beginPath();
          d.roundRect(grid.ox + xx * s + (s - dot) / 2, grid.oy + yy * s + (s - dot) / 2, dot, dot, rr);
          d.fill();
        }
    }
    const overlay = document.createElement('canvas');
    overlay.width = cw;
    overlay.height = ch;
    {
      const d = overlay.getContext('2d');
      // scanlines + a diagonal glare, as on the bot's face
      d.fillStyle = 'rgba(0,0,0,0.16)';
      for (let yy = 0; yy < ch; yy += TEX * 1.5) d.fillRect(0, yy, cw, TEX * 0.5);
      const gl = d.createLinearGradient(0, 0, cw * 0.6, ch);
      gl.addColorStop(0.25, 'rgba(255,255,255,0)');
      gl.addColorStop(0.32, 'rgba(255,255,255,0.06)'); // softer glare on the darker glass
      gl.addColorStop(0.4, 'rgba(255,255,255,0)');
      d.fillStyle = gl;
      d.fillRect(0, 0, cw, ch);
    }
    // neon LED sprites: a wide halo + tight glow in the LED colour (added up, like light),
    // and a hot near-white core — each rendered once with shadowBlur, then just stamped
    const spritePad = Math.ceil(s * 3.8);
    const sprite = (passes) => {
      const sc = document.createElement('canvas');
      const size = Math.ceil(dot + 2 * spritePad);
      sc.width = sc.height = size;
      const d = sc.getContext('2d');
      for (const [fill, glow, blur, shrink, add] of passes) {
        d.save();
        if (add) d.globalCompositeOperation = 'lighter';
        d.fillStyle = fill;
        d.shadowColor = glow;
        d.shadowBlur = blur;
        const dd = dot - shrink * 2;
        d.beginPath();
        d.roundRect((size - dd) / 2, (size - dd) / 2, dd, dd, rr);
        d.fill();
        d.restore();
      }
      return sc;
    };
    const core = '#' + new THREE.Color(spec.led).lerp(new THREE.Color(0xffffff), 0.3).getHexString();
    const halo = sprite([
      [spec.led, spec.led, s * 2.4, 0, true], // halo, built up twice so it blooms
      [spec.led, spec.led, s * 2.4, 0, true],
      [spec.led, spec.led, s * 0.8, 0, true], // tight glow
    ]);
    const coreSprite = sprite([[core, core, s * 0.3, s * 0.06, false]]); // hot core, still in colour

    k = {
      spec, layout, w, h, bodyGeo, makeBody, slid: new Map(), skinTex, bumpTex, bezelGeo, screenGeo, shadowGeo, shadowTex,
      screenCanvas, sctx: screenCanvas.getContext('2d'), screenTex, backdrop, overlay, grid, halo, coreSprite, spritePad,
    };
    kinds.set(kind, k);
    return k;
  }

  let parts = null; // meshes for the current bubble
  let spec = null;
  let layout = null;

  function build(kind) {
    disposeParts();
    const k = prepare(kind);
    spec = k.spec;
    layout = k.layout;
    bodyMat.map = k.skinTex;
    bodyMat.bumpMap = k.bumpTex;
    bodyMat.needsUpdate = true; // same shader each time (three reuses the compiled program)
    screenMat.map = k.screenTex;
    screenMat.needsUpdate = true;
    shadowMat.map = k.shadowTex;
    shadowMat.needsUpdate = true;
    const body = new THREE.Mesh(k.bodyGeo, bodyMat);
    body.frustumCulled = false; // its geometry is swapped as the bubble slides
    const front = DEPTH / 2 + BEVEL.thick;
    const bezel = new THREE.Mesh(k.bezelGeo, silverMat);
    bezel.position.z = front - 0.6;
    const screen = new THREE.Mesh(k.screenGeo, screenMat);
    screen.position.z = front + 0.05;
    const glass = new THREE.Mesh(k.screenGeo, glassMat);
    glass.position.z = front + 0.6;
    const shadow = new THREE.Mesh(k.shadowGeo, shadowMat);
    shadow.position.set(0, -7, -DEPTH / 2 - BEVEL.thick - 4);
    const card = new THREE.Group(); // screen + shadow: centred on the body
    card.add(shadow, bezel, screen, glass);
    wobble.add(body, card);
    parts = { k, card, body, bezel, screen, glass, shadow, w: k.w, h: k.h, shapedFor: null };
  }
  /**
   * Follow the bot: the body slides sideways by `cx` while the tail tip stays
   * put and keeps pointing straight down at the bot. Centred (`cx` 0) uses the
   * template; any other offset is built once and cached (whole px only, so a
   * drag along the screen edge builds a handful). Below the bot (`dir` −1) the
   * body is turned 180°, so the local offset flips sign.
   */
  const SLID_MAX = 48;
  function bodyFor(k, cx) {
    if (cx === 0) return k.bodyGeo;
    let geo = k.slid.get(cx);
    if (!geo) {
      geo = k.makeBody(cx);
      k.slid.set(cx, geo);
      if (k.slid.size > SLID_MAX) {
        const [oldest, old] = k.slid.entries().next().value;
        if (parts?.body.geometry !== old) {
          old.dispose();
          k.slid.delete(oldest);
        }
      }
    }
    return geo;
  }
  function reshape(cx, dir) {
    const { k, body } = parts;
    body.geometry = bodyFor(k, dir * cx);
    body.rotation.z = dir < 0 ? Math.PI : 0;
    parts.shapedFor = { cx, dir };
  }
  function remapUV(geo, w, h) {
    const p = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + 0.5, p.getY(i) / h + 0.5);
    uv.needsUpdate = true;
  }
  function disposeParts() {
    if (!parts) return;
    wobble.clear(); // geometries and textures stay cached per state
    parts = null;
  }

  // ─── LED screen ─────────────────────────────────────────────────────────
  function drawScreen(k, typed, t) {
    const c = k.sctx;
    const { s, dot, ox, oy } = k.grid;
    const pad = k.spritePad;
    c.drawImage(k.backdrop, 0, 0);
    // lit LEDs, typed in left → right; "waiting" dots blink in turn
    const shown = typed * (k.layout.cols + 2);
    const step = Math.floor(t * 2.6) % 4;
    const lit = k.layout.cells.filter((cell) => cell.x <= shown && !(cell.dot !== undefined && cell.dot >= step));
    c.save();
    c.globalCompositeOperation = 'lighter'; // glows add up, like light
    for (const cell of lit) c.drawImage(k.halo, ox + cell.x * s + (s - dot) / 2 - pad, oy + cell.y * s + (s - dot) / 2 - pad);
    c.restore();
    for (const cell of lit) c.drawImage(k.coreSprite, ox + cell.x * s + (s - dot) / 2 - pad, oy + cell.y * s + (s - dot) / 2 - pad);
    c.drawImage(k.overlay, 0, 0);
    k.screenTex.needsUpdate = true;
  }

  // ─── motion ─────────────────────────────────────────────────────────────
  const anchor = { x: 0, y: 0, below: false };
  const pop = { v: 0, vel: 0, target: 0 };
  const tilt = { v: 0, vel: 0 };
  let shownAt = 0;
  let pendingKind = null; // swap: shrink the current bubble, then grow the next
  let lastScreen = -1;
  let clock = 0;

  function place() {
    if (!parts) return;
    const tipX = anchor.x - W / 2;
    const tipY = H / 2 - anchor.y;
    pivot.position.set(tipX, tipY, 0);
    const dir = anchor.below ? -1 : 1;
    // the tail tip stays on the bot; the body slides sideways to stay inside the
    // canvas (never so far that the tail's root leaves its flat bottom edge)
    const half = parts.w / 2;
    const reach = half - parts.h / 2 - TAIL.w * 0.25;
    let cx = THREE.MathUtils.clamp(THREE.MathUtils.clamp(tipX, -W / 2 + EDGE + half, W / 2 - EDGE - half) - tipX, -reach, reach);
    cx = Math.round(cx);
    const sf = parts.shapedFor;
    if (!sf || sf.dir !== dir || Math.abs(sf.cx - cx) >= 1) reshape(cx, dir);
    parts.card.position.set(cx, dir * (TAIL.h + parts.h / 2), 0);
  }

  let raf = 0, last = performance.now();
  let paused = false;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    clock += dt;
    if (!parts) {
      if (dirty) { renderer.clear(); dirty = false; }
      return;
    }
    if (reduceMotion) pop.v = pop.target;
    else {
      pop.vel += (260 * (pop.target - pop.v) - (pop.target ? 15 : 26) * pop.vel) * dt;
      pop.v += pop.vel * dt;
      tilt.vel += (-120 * tilt.v - 7 * tilt.vel) * dt;
      tilt.v += tilt.vel * dt;
    }
    if (pop.target === 0 && pop.v < 0.02) {
      pop.v = 0;
      if (pendingKind) startShow(pendingKind);
      else {
        disposeParts();
        renderer.clear();
        return;
      }
    }
    place();
    const s = Math.max(pop.v, 0.0001);
    pivot.scale.set(s, s, s);
    const age = clock - shownAt;
    const bob = reduceMotion ? 0 : Math.sin(age * 2.2) * 1.6;
    wobble.position.y = bob;
    wobble.rotation.set(
      reduceMotion ? 0 : Math.sin(age * 1.3) * 0.05,
      reduceMotion ? 0 : Math.sin(age * 0.9) * 0.12,
      tilt.v,
    );
    const typed = reduceMotion ? 1 : THREE.MathUtils.clamp((age - 0.12) / TYPE_S, 0, 1);
    const key = Math.round(typed * 100) * 10 + (spec.dots ? Math.floor(age * 2.6) % 4 : 0);
    if (key !== lastScreen) {
      drawScreen(parts.k, typed, age);
      lastScreen = key;
    }
    renderer.render(scene, camera);
  }
  // compile the shaders and upload a first set of textures now, against the real scene, rather than
  // on the first show (where it was a visible hitch); the other states' assets follow when idle
  function warm(kind) {
    build(kind);
    reshape(0, 1);
    drawScreen(parts.k, 1, 0);
    pivot.scale.setScalar(0.0001);
    renderer.render(scene, camera);
    renderer.clear();
    disposeParts();
    dirty = true;
  }
  warm('task');
  const idle = window.requestIdleCallback ?? ((fn) => window.setTimeout(fn, 400));
  const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
  const idleIds = Object.keys(BUBBLES).filter((kind) => kind !== 'task').map((kind) => idle(() => {
    if (parts) prepare(kind); // something's showing: just build the assets, don't touch the scene
    else warm(kind);
  }));
  raf = requestAnimationFrame(frame);

  function startShow(kind) {
    pendingKind = null;
    build(kind);
    shownAt = clock;
    lastScreen = -1;
    pop.v = 0;
    pop.vel = 0;
    pop.target = 1;
    tilt.v = 0;
    tilt.vel = reduceMotion ? 0 : (anchor.x > W / 2 ? 1 : -1) * 2.4; // swings in from the bot's side
  }

  return {
    /** pop a bubble out of the bot (swaps out any bubble already showing) */
    show(kind) {
      if (!BUBBLES[kind]) return;
      if (parts && pop.target === 1) {
        pendingKind = kind;
        pop.target = 0;
      } else startShow(kind);
    },
    hide() {
      pendingKind = null;
      pop.target = 0;
    },
    /** a bubble as a standalone object (for GLB export): shaped (tail centred), message fully typed, no shadow */
    exportModel(kind) {
      pendingKind = null;
      build(kind);
      reshape(0, 1);
      drawScreen(parts.k, 1, 0);
      const g = new THREE.Group();
      g.add(parts.body.clone(), parts.card.clone());
      g.children[1].children = g.children[1].children.filter((m) => m !== parts.shadow && m.material !== shadowMat); // no shadow plane
      return g;
    },
    /** stop rendering (e.g. while covered by an overlay); resumes from where it was */
    setPaused(on) {
      if (on === paused) return;
      paused = on;
      if (on) cancelAnimationFrame(raf);
      else {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    },
    /** tail tip in canvas CSS px; below = the bubble hangs under the bot */
    setAnchor(x, y, below = false) {
      anchor.x = x;
      anchor.y = y;
      anchor.below = below;
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      idleIds.forEach((id) => cancelIdle(id));
      disposeParts();
      for (const m of [bodyMat, silverMat, glassMat, screenMat, shadowMat]) m.dispose();
      for (const k of kinds.values()) {
        for (const g of [k.bodyGeo, ...k.slid.values(), k.bezelGeo, k.screenGeo, k.shadowGeo]) g.dispose();
        for (const t of [k.skinTex, k.bumpTex, k.shadowTex, k.screenTex]) t.dispose();
      }
      envScene.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
