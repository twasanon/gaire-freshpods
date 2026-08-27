import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Hides the helmet at the start of Load, then reveals it from the bottom.
 * Sized to the chamber window (same quad as the fog), sitting just in front
 * of the glass so the yellow cabinet is never covered.
 */
export function HelmetLoadVeil({ drive }: { drive: { current: number } }) {
  const mesh = useRef<THREE.Mesh>(null);
  const smoothed = useRef(1);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        uniforms: {
          uReveal: { value: 1 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uReveal;
          varying vec2 vUv;

          void main() {
            // Helmet-shaped cover inside the opening, not a rectangle on the
            // cabinet face. Upper lamps stay visible so it reads as a chamber.
            vec2 q = (vUv - vec2(0.5, 0.34)) * vec2(1.18, 1.48);
            float helmet = smoothstep(0.98, 0.55, length(q));
            float lower = smoothstep(0.82, 0.2, vUv.y);
            float region = max(helmet, lower * 0.72);

            float covered = smoothstep(uReveal - 0.06, uReveal + 0.08, vUv.y);
            float fadeOut = 1.0 - smoothstep(0.88, 1.0, uReveal);
            float alpha = region * mix(1.0, covered, smoothstep(0.0, 0.08, uReveal)) * fadeOut;
            gl_FragColor = vec4(0.016, 0.07, 0.08, alpha);
          }
        `,
      }),
    []
  );

  useFrame((_, delta) => {
    const target = drive.current;
    if (Math.abs(target - smoothed.current) > 0.5) {
      smoothed.current = target;
    } else {
      smoothed.current += (target - smoothed.current) * (1 - Math.pow(0.002, delta));
    }
    const reveal = smoothed.current;
    material.uniforms.uReveal.value = reveal;
    if (mesh.current) mesh.current.visible = reveal < 0.998;
  });

  return (
    <mesh ref={mesh} position={[0, 0.43, 0.351]} material={material} visible={false} renderOrder={5}>
      <planeGeometry args={[0.59, 0.575]} />
    </mesh>
  );
}
