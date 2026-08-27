import { Environment, Lightformer } from '@react-three/drei';

/**
 * A small product-photography rig built from light shapes rather than a
 * downloaded HDR: no third-party request, no multi-megabyte .hdr, and it bakes
 * into a 128px cube map exactly once (`frames={1}`).
 *
 * Layout is a conventional three-light setup — broad softbox above, cool rim
 * from behind-left, warm kick from the right — plus two vertical strips that
 * give the cabinet's gloss something to reflect while it turns.
 */
export function StudioEnv({ tier }: { tier: 'hi' | 'lo' }) {
  return (
    <>
      <Environment resolution={tier === 'hi' ? 128 : 64} frames={1} background={false}>
        <Lightformer intensity={2.9} form="rect" position={[0, 3.4, 1.6]} scale={[7, 4, 1]} target={[0, 0, 0]} />
        <Lightformer
          intensity={1.5}
          color="#bfe6ff"
          form="rect"
          position={[-3.6, 1.1, -2.4]}
          scale={[5, 5, 1]}
          target={[0, 0, 0]}
        />
        <Lightformer
          intensity={1.1}
          color="#ffe2c2"
          form="rect"
          position={[3.8, 0.4, 1.2]}
          scale={[3.4, 5, 1]}
          target={[0, 0, 0]}
        />
        {/* Vertical strips: the moving highlights that make gloss read as gloss. */}
        <Lightformer intensity={2.2} form="rect" position={[-1.5, 0.2, 2.6]} scale={[0.28, 4.2, 1]} target={[0, 0, 0]} />
        <Lightformer intensity={1.8} form="rect" position={[1.7, 0.1, 2.4]} scale={[0.22, 3.8, 1]} target={[0, 0, 0]} />
        <Lightformer intensity={0.5} color="#0a2c31" form="rect" position={[0, -3, 0]} scale={[8, 8, 1]} target={[0, 0, 0]} />
      </Environment>

      {/* One directional light for definition on the panel edges. No shadow map. */}
      <directionalLight position={[2.4, 3.6, 3.2]} intensity={1.35} />
      <directionalLight position={[-3, 1.2, -2]} intensity={0.35} color="#a8d8ff" />
      <ambientLight intensity={0.28} />
    </>
  );
}
