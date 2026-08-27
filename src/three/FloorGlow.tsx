import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

const GLOW: Record<string, string> = {
  yellow: '#5a4a10',
  blue: '#1d6b72',
  red: '#4a181c',
};

/**
 * The floor the machine stands on: a soft pool of light with a dark contact
 * patch where the casters meet the ground. Baked into one shader plane rather
 * than a render-to-texture shadow pass, because the cabinet's footprint is a
 * fixed rectangle and re-rendering a shadow map every frame buys nothing.
 *
 * The pool retints with the selected cabinet finish so a colour change reads
 * as a change of light in the room, not only a paint swap on the model.
 */
export function FloorGlow({ y = -0.995, colorway = 'yellow' }: { y?: number; colorway?: string }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uGlow: { value: new THREE.Color(GLOW.yellow) } },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uGlow;
          varying vec2 vUv;
          void main() {
            float d = length(vUv - 0.5) * 2.0;
            float pool = smoothstep(1.0, 0.12, d);
            float contact = smoothstep(0.46, 0.02, d);
            vec3 color = mix(uGlow, vec3(0.0), contact);
            float alpha = max(pool * 0.42, contact * 0.9);
            gl_FragColor = vec4(color, alpha);
          }
        `,
      }),
    []
  );

  useEffect(() => {
    material.uniforms.uGlow.value.set(GLOW[colorway] ?? GLOW.yellow);
  }, [colorway, material]);

  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} material={material} renderOrder={-1}>
      <planeGeometry args={[2.6, 3.1]} />
    </mesh>
  );
}
