/**
 * coinNav — the three.js scene behind NanoBottomNav.
 *
 * The noon nano bottom-nav icons as real coins: a bevelled lacquer body,
 * resolution-independent faces (holo foil for Tasks, purple satin for Wallet,
 * flat orange for Account) and each icon's hero art — a modelled book &
 * pencil, an extruded glass "nano" card, the avatar — floating just off the
 * face and casting a soft shadow onto it. Lit from straight above; every coin
 * drops a two-layer shadow (tight contact + soft penumbra).
 *
 * The engine is DOM-agnostic: the React component renders the tabs and hands over
 * the canvas plus one slot element per tab; coins are placed on the slots'
 * centres, so the DOM stays the source of truth for layout. The nav drives
 * it imperatively — select (plays the flip), setCompact (scroll-down settle),
 * setPressed — and disposes it on unmount.
 *
 * Active pose follows the Figma Bottom nav (52:5472): the icon grows
 * 56 → 60.48 and rises 1.76px (its item drops the 4px top inset), with a glow
 * in the item colour. Ported from the 3D-noon-bot prototype (nav/nav.js).
 */
import * as THREE from 'three';
import walletBadgeUrl from '../../assets/nano/nav/wallet-badge.png';
import avatarUrl from '../../assets/nano/nav/account-avatar.png';
const R = 28; // coin radius: the 56px Figma circles
const THICK = 7;
const BEVEL = 2.6;
const FACE_R = R - BEVEL + 0.4;
const LIFT_Y = 4 - (60.48 - 56) / 2; // Figma: active item loses its 4px inset, icon grows
const ACTIVE_SCALE = 60.48 / 56;
const MAX_TILT = 0.38;
const HERO_Z = 2.2; // hero art floats this far off the face at rest
const SETTLE_PX = 24; // compact: coins drop by the label row's height
const SCROLL_TILT = 0.32; // rad the coins pitch at full scroll speed (up on scroll down, down on scroll up)
const FLIP_DUR = 0.85;
const BACKPLATE_Z = -16;
const FOV = 16;
// Tasks (Nav item 52:5323): book & pencil sits in a 53.2px box at (1.4, 0.4) in the 56px disc
const BOOK = { w: 53.2, h: 53.2, x: 1.4 + 26.6 - R, y: R - (0.4 + 26.6) };
// Wallet: object-cover of the 1492×1054 badge into 64.684×43.123 crops top/bottom
const BADGE = { w: 64.684, h: 43.123, x: 0.26, y: 0.61, rot: THREE.MathUtils.degToRad(-7.66) };
const BADGE_SHOWN = BADGE.h / (BADGE.w / (1492 / 1054));
// the card slab traced from the art's opaque outline (x 16–1474, y 65–967 of 1492×1054, r ≈ 170px)
const CARD = (() => {
    const s = BADGE.w / 1492;
    const crop = (1054 * s - BADGE.h) / 2;
    return {
        left: 16 * s - BADGE.w / 2,
        right: 1474 * s - BADGE.w / 2,
        top: BADGE.h / 2 - (65 * s - crop),
        bottom: BADGE.h / 2 - (967 * s - crop),
        r: 170 * s,
        depth: 2.4,
        bevel: 0.7,
    };
})();
const TAB_STYLE = {
    tasks: {
        accent: '#E063E6',
        rim: { color: '#F4F1FF', iridescence: 0.6, iridescenceIOR: 1.35, iridescenceThicknessRange: [180, 620] },
    },
    wallet: { accent: '#7924FF', rim: { color: '#7B3CFF' } },
    account: { accent: '#FF6301', rim: { color: '#FF6301' } },
};
const SHADOW_INK = '#1D2539';
// ─── shaders ────────────────────────────────────────────────────────────────
const NOISE_GLSL = `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 7.1; a *= 0.5; }
    return s;
  }`;
const FACE_VERT = `
  varying vec2 vUv; varying vec3 vN;
  void main() {
    vUv = uv;
    vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;
// pastel holographic foil: soft diagonal bands, warped by noise, shifting with tilt
const HOLO_BODY = `
  float n = fbm(p * 1.7 + vec2(uTime * 0.04, -uTime * 0.03));
  float t = p.x * 0.42 - p.y * 0.36 + n * 1.05 + tilt.x * 1.4 - tilt.y * 1.1 + uTime * 0.02;
  col = 0.80 + 0.19 * cos(6.28318 * (t + vec3(0.00, 0.30, 0.62)));
  col = mix(col, vec3(0.97, 0.96, 1.0), 0.18);
  float streak = pow(0.5 + 0.5 * sin((p.x * 0.7 + p.y + n * 0.5) * 7.0 + tilt.x * 3.0), 10.0);
  col += streak * 0.05;`;
// purple satin: deep violet with soft lighter silk sweeps
const SATIN_BODY = `
  float n = fbm(p * 1.25 + vec2(uTime * 0.02, 0.0));
  vec3 deep = vec3(0.40, 0.20, 0.98), silk = vec3(0.60, 0.46, 1.0);
  float sweep = smoothstep(0.35, 0.95, 0.5 + 0.5 * sin((p.x * 0.9 - p.y * 1.1 + n * 1.8) * 2.6 + tilt.x * 2.2 - tilt.y * 1.4));
  col = mix(deep, silk, sweep * 0.75);
  col = mix(col, deep * 0.9, smoothstep(0.75, 1.0, length(p)) * 0.35);`;
// ─── geometry helpers ───────────────────────────────────────────────────────
// ExtrudeGeometry is non-indexed, so its normals are per-triangle and bevels
// shade in facets. Average normals across coincident vertices within one group.
function smoothGroupNormals(g, groupIndex) {
    const pos = g.attributes.position;
    const nrm = g.attributes.normal;
    const grp = g.groups[groupIndex];
    const key = (i) => `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
    const sum = new Map();
    const n = new THREE.Vector3();
    for (let i = grp.start; i < grp.start + grp.count; i++) {
        const k = key(i);
        let acc = sum.get(k);
        if (!acc)
            sum.set(k, (acc = new THREE.Vector3()));
        acc.add(n.fromBufferAttribute(nrm, i));
    }
    for (let i = grp.start; i < grp.start + grp.count; i++) {
        n.copy(sum.get(key(i))).normalize();
        nrm.setXYZ(i, n.x, n.y, n.z);
    }
    nrm.needsUpdate = true;
}
/** rounded-rectangle Shape centred on the origin */
function roundedRect(x0, y0, x1, y1, r) {
    const s = new THREE.Shape();
    s.moveTo(x0 + r, y0);
    s.lineTo(x1 - r, y0);
    s.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0, false);
    s.lineTo(x1, y1 - r);
    s.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2, false);
    s.lineTo(x0 + r, y1);
    s.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(x0, y0 + r);
    s.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, false);
    return s;
}
/** coin edge revolved from a profile: two quarter arcs joined by a slightly barrelled wall */
function coinBodyGeometry() {
    const pts = [];
    const STEPS = 24;
    const arc = (cx, cy, a0, a1) => {
        for (let i = 0; i <= STEPS; i++) {
            const a = a0 + (a1 - a0) * (i / STEPS);
            pts.push(new THREE.Vector2(cx + Math.cos(a) * BEVEL, cy + Math.sin(a) * BEVEL));
        }
    };
    pts.push(new THREE.Vector2(R - BEVEL - 0.6, -THICK));
    arc(R - BEVEL, -THICK + BEVEL, -Math.PI / 2, 0);
    const side = THICK - 2 * BEVEL;
    for (let i = 1; i < 8; i++) {
        const k = i / 8;
        pts.push(new THREE.Vector2(R + 0.25 * Math.sin(Math.PI * k), -THICK + BEVEL + side * k));
    }
    arc(R - BEVEL, -BEVEL, 0, Math.PI / 2);
    pts.push(new THREE.Vector2(R - BEVEL - 0.6, 0));
    const g = new THREE.LatheGeometry(pts, 192);
    g.rotateX(Math.PI / 2); // lathe axis Y → coin axis Z
    return g;
}
/** the nano card slab, UVs laid out in the Figma badge box so the cover crop lines up */
function cardGeometry() {
    const { left, right, top, bottom, r, depth, bevel } = CARD;
    const shape = roundedRect(left + bevel, bottom + bevel, right - bevel, top - bevel, r - bevel);
    const g = new THREE.ExtrudeGeometry(shape, {
        depth,
        curveSegments: 24,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelSegments: 8,
    });
    g.translate(0, 0, -depth / 2);
    const pos = g.attributes.position;
    const uv = g.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
        uv.setXY(i, (pos.getX(i) + BADGE.w / 2) / BADGE.w, (pos.getY(i) + BADGE.h / 2) / BADGE.h);
    }
    smoothGroupNormals(g, 1); // sides + bevel smooth, caps flat
    return g;
}
/** rounded slab lying flat: w along X, d along Z, h tall, bottom at y = 0 */
function slab(w, d, h, r, bevel) {
    const x = w / 2 - bevel;
    const z = d / 2 - bevel;
    const g = new THREE.ExtrudeGeometry(roundedRect(-x, -z, x, z, Math.max(r - bevel, 0.01)), {
        depth: Math.max(h - bevel * 2, 0.01),
        curveSegments: 16,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelSegments: 6,
    });
    for (let i = 1; i < g.groups.length; i++)
        smoothGroupNormals(g, i);
    g.rotateX(-Math.PI / 2);
    g.translate(0, bevel, 0);
    return g;
}
/** Tasks hero: modelled book & pencil, turned to the icon art's three-quarter view */
function bookModel() {
    const M = {
        chrome: new THREE.MeshPhysicalMaterial({ color: '#E4E7EE', metalness: 0.55, roughness: 0.24, clearcoat: 0.4, clearcoatRoughness: 0.2, envMapIntensity: 1.5 }),
        page: new THREE.MeshPhysicalMaterial({ color: '#F6F7FA', metalness: 0.15, roughness: 0.32, clearcoat: 0.3, clearcoatRoughness: 0.3, envMapIntensity: 1.2 }),
        purple: new THREE.MeshPhysicalMaterial({ color: '#8048F0', roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.4, sheen: 0.6, sheenColor: '#B79BFF', sheenRoughness: 0.6 }),
        groove: new THREE.MeshPhysicalMaterial({ color: '#A9ADB8', metalness: 0.3, roughness: 0.4 }),
        lead: new THREE.MeshStandardMaterial({ color: '#34343B', metalness: 0.4, roughness: 0.35 }),
    };
    const book = new THREE.Group();
    const add = (geo, mat, x = 0, y = 0) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, 0);
        book.add(m);
        return m;
    };
    add(slab(44, 33, 2.6, 4.5, 0.9), M.chrome); // chrome tray
    add(slab(41, 30.5, 1.4, 3.6, 0.5), M.purple, 0, 2.3); // purple cover
    for (const side of [-1, 1]) {
        const pages = add(slab(19.4, 27.5, 3.4, 2.4, 1.0), M.page, side * 10.0, 3.2);
        pages.rotation.z = -side * 0.06; // inner edges raised toward the spine
        const rows = side < 0 ? [-8.5, -3.2, 2.1, 7.4] : [-8.5, -3.2];
        rows.forEach((z, i) => {
            const len = side < 0 ? 12.5 - (i === 3 ? 2 : 0) : 10;
            const line = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, len, 6, 12), M.groove);
            line.rotation.z = Math.PI / 2;
            line.scale.set(0.45, 1, 1); // flattened: a groove, not a rod
            line.position.set(side * 0.2, 3.45, z);
            pages.add(line);
        });
    }
    // pencil: tip on the right page, rising up and back to the right
    const pencil = new THREE.Group();
    const seg = (geo, mat, y) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.y = y;
        pencil.add(m);
    };
    const RP = 3.5;
    seg(new THREE.ConeGeometry(0.85, 1.8, 32).rotateX(Math.PI), M.lead, 0.9);
    seg(new THREE.CylinderGeometry(RP, 0.85, 5, 48), M.chrome, 4.3);
    seg(new THREE.CylinderGeometry(RP, RP, 14.5, 48), M.purple, 14.05);
    seg(new THREE.CylinderGeometry(RP + 0.2, RP + 0.2, 3.4, 48), M.chrome, 23);
    seg(new THREE.CylinderGeometry(RP - 0.1, RP - 0.1, 2.4, 48), M.purple, 25.9);
    seg(new THREE.SphereGeometry(RP - 0.1, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2), M.purple, 27.1);
    pencil.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0.42, 0.72, -0.55).normalize());
    pencil.position.set(5.5, 6.7, 3.5);
    book.add(pencil);
    book.rotation.set(0.62, -0.36, 0, 'XYZ');
    const view = new THREE.Group();
    view.add(book);
    // fit inside the Figma 53.2px box and centre; depth compressed so the far edge stays off the face
    const box = new THREE.Box3().setFromObject(book);
    const size = box.getSize(new THREE.Vector3());
    const mid = box.getCenter(new THREE.Vector3());
    const k = (BOOK.w * 0.94) / Math.max(size.x, size.y);
    book.position.set(-mid.x, -mid.y, -box.min.z);
    view.scale.set(k, k, k * 0.5);
    return view;
}
// ─── canvas textures ────────────────────────────────────────────────────────
/** disc with a Gaussian-blurred edge, computed per pixel: white, falloff in alpha */
function blurredDisc(blurFrac) {
    const S = 256;
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const g = c.getContext('2d');
    const r = (S * 0.5) / (1 + blurFrac * 2.4);
    const sigma = Math.max(r * blurFrac, 0.5);
    const erf = (v) => {
        // Abramowitz–Stegun 7.1.26
        const s = Math.sign(v);
        const x = Math.abs(v);
        const t = 1 / (1 + 0.3275911 * x);
        return s * (1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x));
    };
    const img = g.createImageData(S, S);
    for (let y = 0; y < S; y++) {
        for (let x = 0; x < S; x++) {
            const d = Math.hypot(x + 0.5 - S / 2, y + 0.5 - S / 2);
            const o = (y * S + x) * 4;
            img.data[o] = img.data[o + 1] = img.data[o + 2] = 255;
            img.data[o + 3] = Math.round(0.5 * (1 - erf((d - r) / (sigma * Math.SQRT2))) * 255);
        }
    }
    g.putImageData(img, 0, 0);
    return { texture: new THREE.CanvasTexture(c), span: S / r / 2 };
}
/** soft black silhouette of an image crop, padded so the blur isn't cut off */
function silhouette(w, h, blur) {
    const pad = blur * 2.5;
    const scale = 4;
    const c = document.createElement('canvas');
    c.width = Math.ceil((w + pad * 2) * scale);
    c.height = Math.ceil((h + pad * 2) * scale);
    const texture = new THREE.CanvasTexture(c);
    return {
        texture,
        w: w + pad * 2,
        h: h + pad * 2,
        draw(img, sx, sy, sw, sh) {
            const g = c.getContext('2d');
            g.filter = `blur(${blur * scale}px) brightness(0)`;
            g.drawImage(img, sx, sy, sw, sh, pad * scale, pad * scale, w * scale, h * scale);
            texture.needsUpdate = true;
        },
    };
}
/** top-lit falloff multiplied over the flat faces */
function falloffTexture() {
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 128;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.45, '#f7f7f7');
    grad.addColorStop(1, '#c9c9cf');
    g.fillStyle = grad;
    g.fillRect(0, 0, 4, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
}
/** studio lit from above: big overhead softbox, dim front card, dark floor */
function studioEnvironment() {
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.SphereGeometry(20, 48, 24), new THREE.ShaderMaterial({
        side: THREE.BackSide,
        vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: `varying vec3 vP;
          void main(){
            float h = normalize(vP).y;
            gl_FragColor = vec4(mix(vec3(0.03), vec3(0.38, 0.38, 0.40), smoothstep(-0.2, 0.95, h)), 1.0);
          }`,
    })));
    const panel = (w, h, k, pos) => {
        const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.99, 0.97).multiplyScalar(k), side: THREE.DoubleSide }));
        p.position.set(...pos);
        p.lookAt(0, 0, 0);
        env.add(p);
    };
    panel(16, 16, 3.0, [0, 12, 2]); // overhead key softbox
    panel(12, 4, 0.9, [0, 4, 11]); // front-top card: face sheen
    panel(3, 8, 0.35, [-11, 2, 3]); // faint side kicks
    panel(3, 8, 0.35, [11, 2, 3]);
    return env;
}
const spring = (s, target, k, d, dt) => {
    s.vel += ((target - s.v) * k - s.vel * d) * dt;
    s.v += s.vel * dt;
};
const sp = (v = 0) => ({ v, vel: 0 });
const easeOutBack = (p) => 1 + 2.25 * Math.pow(p - 1, 3) + 1.25 * Math.pow(p - 1, 2);
export function createCoinNav({ canvas, slots, active = null, reduceMotion = false }) {
    let W = canvas.clientWidth || 375;
    let H = canvas.clientHeight || 240;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(studioEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmrem.dispose();
    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(0, 1, 0.35);
    scene.add(sun, new THREE.HemisphereLight(0xffffff, 0x6d6f78, 0.6));
    // long lens framed so the z = 0 plane maps 1:1 onto canvas CSS pixels
    const camera = new THREE.PerspectiveCamera(FOV, W / H, 10, 4000);
    function fitCamera() {
        camera.aspect = W / H;
        camera.position.set(W / 2, H / 2, H / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
        camera.lookAt(W / 2, H / 2, 0);
        camera.updateProjectionMatrix();
    }
    // supersample: the canvas is small, so 1.5× display density (capped) keeps edges crisp
    function fitRenderer() {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio * 1.5, 4));
        renderer.setSize(W, H, false);
    }
    fitCamera();
    fitRenderer();
    // textures — coins appear only once every image has decoded
    let ready = false;
    const manager = new THREE.LoadingManager(() => {
        ready = true;
    });
    const loader = new THREE.TextureLoader(manager);
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const badgeShadow = silhouette(BADGE.w, BADGE.h, 1.6);
    const walletBadge = loader.load(walletBadgeUrl, (t) => {
        const img = t.image;
        const crop = img.height * BADGE_SHOWN;
        badgeShadow.draw(img, 0, (img.height - crop) / 2, img.width, crop);
    });
    walletBadge.repeat.set(1, BADGE_SHOWN);
    walletBadge.offset.set(0, (1 - BADGE_SHOWN) / 2);
    const avatarTex = loader.load(avatarUrl);
    for (const t of [walletBadge, avatarTex]) {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = maxAniso;
    }
    const CONTACT = blurredDisc(0.1);
    const PENUMBRA = blurredDisc(0.42);
    const FALLOFF = falloffTexture();
    const BODY_GEO = coinBodyGeometry();
    const FACE_GEO = new THREE.CircleGeometry(FACE_R, 128);
    const faceMats = [];
    const proceduralFace = (body) => {
        const m = new THREE.ShaderMaterial({
            uniforms: { uTime: { value: 0 } },
            toneMapped: false,
            vertexShader: FACE_VERT,
            fragmentShader: `
        uniform float uTime; varying vec2 vUv; varying vec3 vN;
        ${NOISE_GLSL}
        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          vec2 tilt = vN.xy;
          vec3 col;
          ${body}
          col *= mix(0.86, 1.03, smoothstep(-1.0, 0.8, p.y));
          gl_FragColor = vec4(pow(col, vec3(2.2)), 1.0);
          #include <colorspace_fragment>
        }`,
        });
        faceMats.push(m);
        return m;
    };
    const faceFor = (id) => id === 'tasks'
        ? proceduralFace(HOLO_BODY)
        : id === 'wallet'
            ? proceduralFace(SATIN_BODY)
            : new THREE.MeshBasicMaterial({ color: 0xff6301, toneMapped: false });
    // art on (or just off) the face, clipped to the face circle except above uCut
    const decalMaterial = (map, { shadow = false, opacity = 1 } = {}) => new THREE.ShaderMaterial({
        uniforms: {
            map: { value: map },
            uToCoin: { value: new THREE.Matrix4() },
            uCut: { value: 999 },
            uOpacity: { value: opacity },
            uClip: { value: shadow ? 1 : 0 },
        },
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        vertexShader: `
        uniform mat4 uToCoin; varying vec2 vUv; varying vec2 vCoin;
        void main() {
          vUv = uv;
          vCoin = (uToCoin * vec4(position, 1.0)).xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
        fragmentShader: `
        uniform sampler2D map; uniform float uCut, uOpacity, uClip; varying vec2 vUv; varying vec2 vCoin;
        void main() {
          vec4 c = texture2D(map, vUv);
          float inside = 1.0 - smoothstep(${(FACE_R - 0.8).toFixed(2)}, ${(FACE_R + 0.2).toFixed(2)}, length(vCoin));
          float above = uClip > 0.5 ? 0.0 : smoothstep(uCut - 1.0, uCut + 1.0, vCoin.y);
          gl_FragColor = vec4(${shadow ? 'vec3(0.0)' : 'c.rgb'}, c.a * uOpacity * max(inside, above));
          ${shadow ? '' : '#include <colorspace_fragment>'}
        }`,
    });
    const ids = ['tasks', 'wallet', 'account'];
    const coins = ids.map((id, i) => {
        const style = TAB_STYLE[id];
        const root = new THREE.Group();
        const coin = new THREE.Group();
        root.add(coin);
        scene.add(root);
        coin.add(new THREE.Mesh(BODY_GEO, new THREE.MeshPhysicalMaterial({
            roughness: 0.34,
            metalness: 0,
            clearcoat: 0.55,
            clearcoatRoughness: 0.18,
            ...style.rim,
            color: new THREE.Color(style.rim.color),
            emissive: new THREE.Color(style.rim.color).multiplyScalar(0.18),
        })));
        const layer = (mat, z, back = false, order = 1) => {
            const m = new THREE.Mesh(FACE_GEO, mat);
            m.position.z = back ? -THICK - z : z;
            if (back)
                m.rotation.y = Math.PI;
            m.renderOrder = order;
            coin.add(m);
        };
        const falloff = () => new THREE.MeshBasicMaterial({
            map: FALLOFF,
            transparent: true,
            depthWrite: false,
            toneMapped: false,
            blending: THREE.MultiplyBlending,
            premultipliedAlpha: true,
        });
        layer(faceFor(id), 0.05);
        layer(faceFor(id), 0.05, true);
        layer(falloff(), 0.08, false, 2);
        layer(falloff(), 0.08, true, 2);
        const decals = [];
        let hero = null;
        let heroArt = null;
        let heroShadow = null;
        let shadowDy = 0;
        let avatar = null;
        if (id === 'tasks' || id === 'wallet') {
            const isCard = id === 'wallet';
            const box = isCard ? BADGE : BOOK;
            const sh = isCard ? badgeShadow : { texture: PENUMBRA.texture, w: 46, h: 26 };
            shadowDy = isCard ? 0 : -9;
            heroShadow = new THREE.Mesh(new THREE.PlaneGeometry(sh.w, sh.h), decalMaterial(sh.texture, { shadow: true, opacity: 0.32 }));
            heroShadow.rotation.z = isCard ? BADGE.rot : 0;
            heroShadow.renderOrder = 3;
            coin.add(heroShadow);
            decals.push(heroShadow);
            hero = new THREE.Group();
            hero.rotation.z = isCard ? BADGE.rot : 0;
            hero.userData = { x: box.x, y: box.y };
            heroArt = isCard
                ? new THREE.Mesh(cardGeometry(), [
                    new THREE.MeshPhysicalMaterial({
                        map: walletBadge,
                        emissiveMap: walletBadge,
                        emissive: 0xffffff,
                        emissiveIntensity: 0.62,
                        roughness: 0.55,
                        clearcoat: 0.25,
                        clearcoatRoughness: 0.35,
                        envMapIntensity: 0.45,
                    }),
                    new THREE.MeshPhysicalMaterial({
                        color: '#CFCBF6',
                        emissive: new THREE.Color('#CFCBF6').multiplyScalar(0.28),
                        roughness: 0.38,
                        clearcoat: 0.4,
                        clearcoatRoughness: 0.25,
                        envMapIntensity: 0.7,
                        iridescence: 0.35,
                        iridescenceIOR: 1.3,
                    }),
                ])
                : bookModel();
            heroArt.renderOrder = 5;
            hero.add(heroArt);
            coin.add(hero);
        }
        else {
            // Figma: 46.905 × 58.611 at (4.54, 2.6) in the 57 × 56 circle → centre offset (−0.51, −3.91)
            avatar = new THREE.Mesh(new THREE.PlaneGeometry(46.905, 58.611), decalMaterial(avatarTex));
            avatar.renderOrder = 4;
            coin.add(avatar);
            decals.push(avatar);
        }
        layer(new THREE.MeshPhysicalMaterial({
            color: 0x000000,
            roughness: 0.22,
            clearcoat: 0.6,
            clearcoatRoughness: 0.14,
            envMapIntensity: 0.8,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        }), hero ? 0.12 : 0.6, false, 6);
        const ink = new THREE.Color(SHADOW_INK).lerp(new THREE.Color(style.accent), 0.28);
        const plane = (map, color) => {
            const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color, map, transparent: true, depthWrite: false, toneMapped: false }));
            m.renderOrder = -1;
            scene.add(m);
            return m;
        };
        const penumbra = plane(PENUMBRA.texture, ink);
        const glow = plane(PENUMBRA.texture, style.accent); // active glow in the item colour
        const contact = plane(CONTACT.texture, ink);
        return {
            id,
            root,
            coin,
            hero,
            heroArt,
            heroShadow,
            shadowDy,
            avatar,
            decals,
            contact,
            penumbra,
            glow,
            flipHero: id === 'wallet', // only the nano card spins, the purple coin stays put
            phase: i * 1.9,
            x: 0,
            y: 0,
            lift: sp(),
            tiltX: sp(),
            tiltY: sp(),
            press: sp(),
            pop: sp(),
            scroll: sp(),
            pressed: false,
            flipT: -1,
            flipBase: 0,
        };
    });
    // ─── layout + input ───────────────────────────────────────────────────────
    function layout() {
        W = canvas.clientWidth || W;
        H = canvas.clientHeight || H;
        fitCamera();
        fitRenderer();
        const c = canvas.getBoundingClientRect();
        const k = W / (c.width || W); // stays correct if the nav is scaled by CSS
        for (const coin of coins) {
            const s = slots[coin.id].getBoundingClientRect();
            coin.x = (s.left + s.width / 2 - c.left) * k;
            coin.y = (c.bottom - (s.top + s.height / 2)) * k;
        }
    }
    const ro = new ResizeObserver(layout);
    ro.observe(canvas);
    for (const id of ids)
        ro.observe(slots[id]);
    layout();
    let pointer = null;
    const onPointerMove = (e) => {
        if (e.pointerType !== 'mouse')
            return;
        const c = canvas.getBoundingClientRect();
        const k = W / (c.width || W);
        pointer = { x: (e.clientX - c.left) * k, y: (c.bottom - e.clientY) * k };
    };
    const onPointerLeave = () => {
        pointer = null;
    };
    window.addEventListener('pointermove', onPointerMove);
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    let selected = null;
    const settle = sp();
    let settleTarget = 0;
    let scrollKick = 0; // -1..1 from scroll speed (+ down, - up), decays when scrolling stops
    function select(id, { animate = true } = {}) {
        selected = id;
        const c = coins.find((x) => x.id === id);
        if (!c)
            return;
        const spinning = c.flipHero ? c.heroArt : c.coin;
        c.flipBase = ((spinning?.rotation.y ?? 0) - (c.flipHero ? 0 : c.tiltY.v)) % (Math.PI * 2);
        c.flipT = reduceMotion || !animate ? -1 : 0;
        if (!animate)
            c.lift.v = 1; // start already settled in the active pose
    }
    select(active, { animate: false });
    // ─── frame loop ───────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let raf = 0;
    function frame() {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(clock.getDelta(), 1 / 30);
        const t = clock.elapsedTime;
        if (reduceMotion)
            settle.v = settleTarget;
        else
            spring(settle, settleTarget, 200, 22, dt);
        const drop = SETTLE_PX * settle.v;
        scrollKick *= Math.exp(-dt * 7);
        const shown = ready ? 1 : 0;
        for (const c of coins) {
            const on = c.id === selected;
            spring(c.lift, on ? 1 : 0, 170, 18, dt);
            spring(c.press, c.pressed ? 1 : 0, 520, 30, dt);
            spring(c.pop, on && c.avatar ? 1 : 0, 140, 15, dt);
            // each coin follows a touch later than the one before, so the tilt ripples across
            spring(c.scroll, reduceMotion ? 0 : scrollKick, 150 - coins.indexOf(c) * 25, 12, dt);
            let tx = 0;
            let ty = 0;
            if (pointer && !reduceMotion) {
                ty = THREE.MathUtils.clamp((pointer.x - c.x) / 140, -1, 1) * MAX_TILT;
                tx = -THREE.MathUtils.clamp((pointer.y - (c.y + LIFT_Y * c.lift.v)) / 140, -1, 1) * MAX_TILT;
            }
            else if (!reduceMotion) {
                ty = Math.sin(t * 0.9 + c.phase) * 0.12;
                tx = Math.sin(t * 0.7 + c.phase * 1.3) * 0.06;
            }
            spring(c.tiltX, tx, 90, 14, dt);
            spring(c.tiltY, ty, 90, 14, dt);
            let flip = 0;
            if (c.flipT >= 0) {
                c.flipT += dt / FLIP_DUR;
                if (c.flipT >= 1) {
                    c.flipT = -1;
                    c.flipBase = 0;
                }
                else
                    flip = c.flipBase + (Math.PI * 2 - c.flipBase) * easeOutBack(c.flipT);
            }
            const lift = c.lift.v;
            const bob = reduceMotion ? 0 : Math.sin(t * 1.8 + c.phase) * 1.2 * (1 - lift * 0.5);
            c.root.position.set(c.x, c.y + bob + LIFT_Y * lift - drop, 0);
            c.root.scale.setScalar(Math.max(shown, 0.0001) * (1 + (ACTIVE_SCALE - 1) * lift));
            const cardFlip = c.flipHero ? flip : 0;
            const yaw = c.tiltY.v + (c.flipHero ? 0 : flip);
            c.coin.rotation.set(c.tiltX.v - SCROLL_TILT * c.scroll.v, yaw, reduceMotion ? 0 : Math.sin(t * 1.1 + c.phase) * 0.03);
            c.coin.scale.set(1 + c.press.v * 0.06, 1 - c.press.v * 0.1, 1 - c.press.v * 0.2);
            if (c.hero && c.heroArt && c.heroShadow) {
                const { x, y } = c.hero.userData;
                // a spinning card swings its edges through depth: hop it forward to clear the face
                const swing = ((CARD.right - CARD.left) / 2) * Math.abs(Math.sin(cardFlip));
                const gap = HERO_Z + 3.5 * lift + swing;
                c.hero.position.set(x, y, gap);
                c.heroArt.rotation.y = cardFlip;
                const edgeOn = Math.max(Math.abs(Math.cos(cardFlip)), 0.06);
                c.heroShadow.position.set(x, y + c.shadowDy - 0.9 - gap * 0.55, 0.1);
                c.heroShadow.scale.set((1 + gap * 0.012) * edgeOn, 1 + gap * 0.012, 1);
                c.heroShadow.material.uniforms.uOpacity.value = Math.max(0.34 - gap * 0.025, 0.06);
            }
            if (c.avatar) {
                const pop = c.pop.v;
                c.avatar.scale.setScalar(1 + 0.14 * pop);
                c.avatar.position.set(-0.51, -3.91 + 4 * pop, 0.3 + 6 * pop);
                c.avatar.material.uniforms.uCut.value = THREE.MathUtils.lerp(999, 4, Math.min(pop * 2, 1));
            }
            if (c.decals.length) {
                c.coin.updateMatrixWorld(true);
                const inv = c.coin.matrixWorld.clone().invert();
                for (const d of c.decals)
                    d.material.uniforms.uToCoin.value.multiplyMatrices(inv, d.matrixWorld);
            }
            // drop shadow: the coin's silhouette narrows as it turns edge-on
            const s = c.root.scale.x;
            const across = Math.abs(Math.cos(yaw)) + (THICK / (2 * R)) * Math.abs(Math.sin(yaw));
            const d = 2 * R * s;
            const place = (m, span, down, grow, alpha) => {
                m.position.set(c.x, c.root.position.y - down, BACKPLATE_Z);
                m.scale.set(d * span * grow * Math.max(across, 0.12), d * span * grow * 0.96, 1);
                m.material.opacity = alpha * shown;
            };
            place(c.contact, CONTACT.span, 4 + 5 * lift, 0.9 + 0.08 * lift, 0.5 * (1 - 0.55 * lift));
            place(c.penumbra, PENUMBRA.span, 11 + 9 * lift, 1.0 + 0.16 * lift, 0.3 * (1 - 0.2 * lift));
            place(c.glow, PENUMBRA.span, 8 + 4 * lift, 1.0 + 0.1 * lift, 0.34 * lift);
        }
        if (!reduceMotion)
            for (const m of faceMats)
                m.uniforms.uTime.value = t;
        renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(frame);
    return {
        select,
        setCompact(on) {
            settleTarget = on ? 1 : 0;
        },
        /** scroll delta (px) since the last event: scrolling down tilts the coins up, scrolling up tilts them down; faster tilts further */
        scroll(dy) {
            const k = THREE.MathUtils.clamp(dy / 40, -1, 1);
            if (Math.sign(k) !== Math.sign(scrollKick) || Math.abs(k) > Math.abs(scrollKick))
                scrollKick = k;
        },
        setPressed(id, down) {
            const c = coins.find((x) => x.id === id);
            if (c)
                c.pressed = down;
        },
        layout,
        dispose() {
            cancelAnimationFrame(raf);
            ro.disconnect();
            window.removeEventListener('pointermove', onPointerMove);
            document.documentElement.removeEventListener('pointerleave', onPointerLeave);
            scene.traverse((o) => {
                const m = o;
                m.geometry?.dispose();
                const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
                for (const mat of mats)
                    mat.dispose();
            });
            for (const t of [walletBadge, avatarTex, badgeShadow.texture, CONTACT.texture, PENUMBRA.texture, FALLOFF])
                t.dispose();
            envRT.dispose();
            renderer.dispose();
        },
    };
}
