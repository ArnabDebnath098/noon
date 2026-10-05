/**
 * Dev tool: export the noon nano 3D objects (bottom-nav models + the four
 * message bubbles) as GLB with glTF PBR materials. In the browser console on
 * /noon-nano: `await nanoExportGlb()` → { name: base64 GLB }, or
 * `nanoExportGlb({ download: true })` to save the files.
 */
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { navModels } from './coinNav';
import { createBubble3D, BUBBLES } from './bot/bubble3d';

const toBase64 = (buf) => {
  let s = '';
  const b = new Uint8Array(buf);
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return btoa(s);
};

export async function exportGlb({ download = false } = {}) {
  const exporter = new GLTFExporter();
  const models = await navModels();
  // bubbles: an offscreen engine builds each one exactly as on screen
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 140;
  const bubbles = createBubble3D({ canvas, reduceMotion: true });
  for (const kind of Object.keys(BUBBLES)) {
    const m = bubbles.exportModel(kind);
    m.name = `bubble-${kind}`;
    models[`bubble-${kind}`] = m;
  }
  const out = {};
  for (const [name, obj] of Object.entries(models)) {
    // strictly compatible PBR: bump maps would go out as the non-standard EXT_materials_bump
    // (the paper / bubble grain is subtle enough to drop), so export bump-free copies
    obj.traverse((o) => {
      if (!o.isMesh) return;
      const strip = (m) => {
        if (!m.bumpMap && m.bumpScale === 1) return m;
        const c = m.clone();
        c.bumpMap = null;
        c.bumpScale = 1; // the exporter writes the bump extension for any other scale, map or not
        return c;
      };
      o.material = Array.isArray(o.material) ? o.material.map(strip) : strip(o.material);
    });
    obj.updateMatrixWorld(true);
    const glb = await exporter.parseAsync(obj, { binary: true, onlyVisible: true, maxTextureSize: 2048 });
    out[name] = toBase64(glb);
    if (download) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([glb], { type: 'model/gltf-binary' }));
      a.download = `${name}.glb`;
      a.click();
    }
  }
  bubbles.dispose();
  return out;
}
