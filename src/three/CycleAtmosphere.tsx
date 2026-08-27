import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MachineDrive } from './Machine';

/**
 * Extra chamber light for Disinfection (cool UV) and Dry (warm heat).
 * Load and Aroma already have their own veils; those two steps were too quiet.
 */
export function CycleAtmosphere({ drive }: { drive: { current: MachineDrive } }) {
  const mesh = useRef<THREE.Mesh>(null);
  const uv = useRef(0);
  const heat = useRef(0);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uUv: { value: 0 },
          uHeat: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform float uUv;
          uniform float uHeat;
          varying vec2 vUv;

          void main() {
            vec2 q = (vUv - 0.5) * vec2(1.55, 1.4);
            float mask = smoothstep(1.05, 0.22, length(q));

            float lamps = smoothstep(0.42, 0.92, vUv.y);
            float strobe = 0.72 + 0.28 * sin(uTime * 11.0);
            vec3 uvCol = vec3(0.38, 0.55, 1.0);
            float uvA = uUv * mask * (0.22 + lamps * 0.7) * strobe;

            float fill = mix(0.95, 0.55, vUv.y);
            float pulse = 0.82 + 0.18 * sin(uTime * 2.4);
            vec3 heatCol = vec3(1.0, 0.48, 0.14);
            float heatA = uHeat * mask * fill * 0.55 * pulse;

            vec3 colour = uvCol * uvA + heatCol * heatA;
            float alpha = clamp(uvA + heatA, 0.0, 0.85);
            gl_FragColor = vec4(colour, alpha);
          }
        `,
      }),
    []
  );

  useFrame((_, delta) => {
    const k = 1 - Math.pow(0.012, delta);
    uv.current += (drive.current.uv - uv.current) * k;
    heat.current += (drive.current.heat - heat.current) * k;
    material.uniforms.uUv.value = uv.current;
    material.uniforms.uHeat.value = heat.current;
    if (uv.current + heat.current > 0.01) material.uniforms.uTime.value += delta;
    if (mesh.current) mesh.current.visible = uv.current + heat.current > 0.012;
  });

  return (
    <mesh ref={mesh} position={[0, 0.43, 0.349]} material={material} visible={false} renderOrder={3}>
      <planeGeometry args={[0.59, 0.575]} />
    </mesh>
  );
}
