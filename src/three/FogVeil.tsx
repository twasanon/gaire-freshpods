import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Dry fog inside the chamber, for the Aroma stage of the cycle.
 *
 * Drawn as a single translucent quad sitting just in front of the chamber window
 * (which is itself a flat panel in the source asset), with drifting FBM noise.
 * Rendering is skipped outright while `drive.current` is zero, so it costs
 * nothing during the rest of the page.
 */
export function FogVeil({ drive }: { drive: { current: number } }) {
  const mesh = useRef<THREE.Mesh>(null);
  const smoothed = useRef(0);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.NormalBlending,
        uniforms: {
          uTime: { value: 0 },
          uAmount: { value: 0 },
          uColor: { value: new THREE.Color('#e0f2ff') },
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
          uniform float uAmount;
          uniform vec3 uColor;
          varying vec2 vUv;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
          }

          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(
              mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
              mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
              u.y
            );
          }

          float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            for (int i = 0; i < 5; i++) {
              v += a * noise(p);
              p *= 2.03;
              a *= 0.5;
            }
            return v;
          }

          void main() {
            // Fog rises, so the sample drifts downward through the field.
            vec2 p = vUv * vec2(3.0, 2.25) + vec2(uTime * 0.045, -uTime * 0.16);
            float density = 0.18 + fbm(p) * 0.9 + fbm(p * 2.15 + 4.0) * 0.52;
            density += sin(vUv.y * 18.0 + uTime * 0.8 + fbm(p * 1.4) * 5.0) * 0.06;

            // Hold it inside the chamber opening rather than letting it square off.
            vec2 c = (vUv - 0.5) * vec2(1.58, 1.42);
            float mask = smoothstep(1.03, 0.18, length(c));

            // Denser low in the chamber, thinning toward the lamps.
            float gravity = mix(1.12, 0.62, smoothstep(0.08, 0.96, vUv.y));

            float billow = smoothstep(0.18, 1.18, density);
            float a = (0.22 + billow * 0.78) * mask * gravity * uAmount;
            gl_FragColor = vec4(uColor * (0.72 + density * 0.28), clamp(a, 0.0, 0.92));
          }
        `,
      }),
    []
  );

  useFrame((_, delta) => {
    const target = drive.current;
    smoothed.current += (target - smoothed.current) * (1 - Math.pow(0.004, delta));
    const amount = smoothed.current;
    material.uniforms.uAmount.value = amount;
    if (amount > 0.002) material.uniforms.uTime.value += delta;
    if (mesh.current) mesh.current.visible = amount > 0.002;
  });

  // Matches the chamber window quad: 0.59 × 0.575, centred at y 0.43, z 0.338.
  return (
    <mesh ref={mesh} position={[0, 0.43, 0.347]} material={material} visible={false} renderOrder={4}>
      <planeGeometry args={[0.59, 0.575]} />
    </mesh>
  );
}
