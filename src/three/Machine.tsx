import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { colorways, type ColorwayId } from '../lib/content';
import { modelUrl, type Tier } from '../lib/device';

/** Materials whose base colour is the cabinet finish and must retint. */
const BODY_MATERIALS = new Set([
  'Body_Yellow_FBC700',
  'chamber_flat_backing',
  'Control_Shelf_Yellow',
  'Control_Shelf_Side_Yellow',
]);

/** The chamber window and the LCD, driven during the cycle sequence. */
const EMISSIVE_MATERIALS = { chamber: 'helmet_chamber', panel: 'control_display' } as const;

/**
 * Printed graphics that reverse out to white on the red cabinet, as they do on
 * the real machine. `from` limits the recolour to a fraction of the texture's
 * width, which is how the front lockup keeps its coloured badge while the
 * wordmark beside it turns white.
 */
const REVERSING_DECALS: Record<string, { from: number }> = {
  side_text_right: { from: 0 },
  charge_right: { from: 0 },
  front_logo: { from: 0.19 },
};

/**
 * Builds the reversed-out copy of a decal from the texture already in memory:
 * its alpha is kept and the colour channels are forced to white. Deriving it
 * here rather than shipping a second set of images means switching finish costs
 * no network at all.
 */
function reverseOut(source: THREE.Texture, from: number) {
  const image = source.image as CanvasImageSource & { width: number; height: number };
  if (!image?.width) return null;

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(image, 0, 0);
  const x = Math.round(from * canvas.width);
  const region = ctx.getImageData(x, 0, canvas.width - x, canvas.height);
  for (let i = 0; i < region.data.length; i += 4) {
    region.data[i] = 255;
    region.data[i + 1] = 255;
    region.data[i + 2] = 255;
  }
  ctx.putImageData(region, x, 0);

  const next = new THREE.CanvasTexture(canvas);
  // glTF textures are not flipped; CanvasTexture defaults the other way.
  next.flipY = source.flipY;
  next.colorSpace = source.colorSpace;
  next.wrapS = source.wrapS;
  next.wrapT = source.wrapT;
  next.anisotropy = source.anisotropy;
  return next;
}

export type MachineDrive = {
  /** 0 = idle, 1 = full UV-C wash inside the chamber. */
  uv: number;
  /** 0 = LCD at rest, 1 = LCD at its brightest. */
  panel: number;
  /** 0 = no drying glow, 1 = warm drying phase. */
  heat: number;
};

type Props = {
  tier: Tier;
  colorway: ColorwayId;
  drive: { current: MachineDrive };
  onReady?: () => void;
};

export function Machine({ tier, colorway, drive, onReady }: Props) {
  const { scene } = useGLTF(modelUrl(tier));
  const root = useRef<THREE.Group>(null);

  // One clone per mount so material edits never leak into the drei cache.
  const model = useMemo(() => {
    const copy = scene.clone(true);
    const seen = new Map<THREE.Material, THREE.Material>();
    copy.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.frustumCulled = false;
      const source = mesh.material as THREE.MeshStandardMaterial;
      let next = seen.get(source);
      if (!next) {
        const cloned = source.clone();
        // Decals are coplanar with the cabinet skin; without a depth bias they
        // z-fight as the machine turns.
        if (cloned.transparent) {
          cloned.polygonOffset = true;
          cloned.polygonOffsetFactor = -2;
          cloned.polygonOffsetUnits = -2;
          cloned.depthWrite = false;
        }
        if (cloned.map) cloned.map.anisotropy = 4;
        seen.set(source, cloned);
        next = cloned;
      }
      mesh.material = next;
    });
    return copy;
  }, [scene]);

  // Grab the handful of materials the page animates or recolours.
  const handles = useMemo(() => {
    const body: THREE.MeshStandardMaterial[] = [];
    const decals: { material: THREE.MeshStandardMaterial; dark: THREE.Texture; light: THREE.Texture | null }[] = [];
    let chamber: THREE.MeshStandardMaterial | null = null;
    let panel: THREE.MeshStandardMaterial | null = null;
    model.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (BODY_MATERIALS.has(mat.name) && !body.includes(mat)) body.push(mat);
      if (mat.name === EMISSIVE_MATERIALS.chamber) chamber = mat;
      if (mat.name === EMISSIVE_MATERIALS.panel) panel = mat;

      const reversing = REVERSING_DECALS[mat.name];
      if (reversing && mat.map && !decals.some((d) => d.material === mat)) {
        decals.push({ material: mat, dark: mat.map, light: reverseOut(mat.map, reversing.from) });
      }
    });
    return { body, decals, chamber, panel };
  }, [model]);

  const targetBody = useRef(new THREE.Color(colorways[0].body));
  const currentBody = useRef(new THREE.Color(colorways[0].body));

  // Retint the cabinet. The finish is a flat colour with no map, so this is the
  // whole colourway change — one material property, no second asset to download.
  // three's ColorManagement already reads hex strings as sRGB, so no manual
  // conversion here: doing it twice is what turns the yellow cabinet orange.
  //
  // Body colour is lerped in useFrame so a finish change reads as a recast of
  // the same object. Printed graphics snap, because they reverse out rather
  // than tint.
  useLayoutEffect(() => {
    const finish = colorways.find((c) => c.id === colorway) ?? colorways[0];
    targetBody.current.set(finish.body);
    for (const mat of handles.body) {
      mat.roughness = colorway === 'yellow' ? 0.36 : 0.32;
      mat.needsUpdate = true;
    }

    for (const decal of handles.decals) {
      const next = finish.ink === 'light' ? (decal.light ?? decal.dark) : decal.dark;
      if (decal.material.map === next) continue;
      decal.material.map = next;
      decal.material.needsUpdate = true;
    }
  }, [colorway, handles.body, handles.decals]);

  useEffect(
    () => () => {
      for (const decal of handles.decals) decal.light?.dispose();
    },
    [handles.decals]
  );

  const uvColor = useMemo(() => new THREE.Color('#6e8dff'), []);
  const heatColor = useMemo(() => new THREE.Color('#ff7a28'), []);
  const restColor = useMemo(() => new THREE.Color('#111719'), []);
  const effectColor = useMemo(() => new THREE.Color(), []);
  const smoothed = useRef<MachineDrive>({ uv: 0, panel: 0, heat: 0 });
  const framesDrawn = useRef(0);

  useFrame((_, delta) => {
    // Report readiness only once pixels are genuinely on screen, so the poster
    // never fades out over an empty canvas.
    if (framesDrawn.current <= 2) {
      framesDrawn.current += 1;
      if (framesDrawn.current === 2) onReady?.();
    }

    const k = 1 - Math.pow(0.001, delta);
    const s = smoothed.current;
    s.uv += (drive.current.uv - s.uv) * k;
    s.panel += (drive.current.panel - s.panel) * k;
    s.heat += (drive.current.heat - s.heat) * k;

    currentBody.current.lerp(targetBody.current, 1 - Math.pow(0.0004, delta));
    for (const mat of handles.body) mat.color.copy(currentBody.current);

    const { chamber, panel } = handles as {
      chamber: THREE.MeshStandardMaterial | null;
      panel: THREE.MeshStandardMaterial | null;
    };
    if (chamber) {
      effectColor.copy(restColor).lerp(uvColor, s.uv).lerp(heatColor, s.heat);
      chamber.emissiveIntensity = 0.18 + s.uv * 7.4 + s.heat * 6.2;
      chamber.emissive.copy(effectColor);
    }
    if (panel) {
      panel.emissiveIntensity = 0.35 + s.panel * 2.8;
    }
  });

  return (
    <group ref={root}>
      <primitive object={model} />
    </group>
  );
}

export function preloadMachine(tier: Tier) {
  useGLTF.preload(modelUrl(tier));
}
