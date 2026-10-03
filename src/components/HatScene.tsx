import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const range = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

const INDIGO = "#381932";
const DARK = "#200815";
const AMBER = "#FFB547";
const LILAC = "#FFF9F2";
const PINK = "#F6B9CF";

const HAT_TOP = 1.5;
const STARS: [number, number, number, number][] = [
  [-1.9, 2.6, 0.3, 0],
  [1.9, 2.9, -0.2, 0.2],
  [-2.2, 1.4, -0.4, 0.45],
  [2.3, 1.7, 0.4, 0.1],
  [-0.9, 3.6, -0.5, 0.35],
  [1.0, 3.7, 0.2, 0.55],
];

type Props = { progress: MutableRefObject<number>; active: boolean; mobile: boolean };

function Rig({ progress, mobile }: { progress: MutableRefObject<number>; mobile: boolean }) {
  const seg = mobile ? 20 : 36;
  const hat = useRef<THREE.Group>(null);
  const bunny = useRef<THREE.Group>(null);
  const earL = useRef<THREE.Group>(null);
  const earR = useRef<THREE.Group>(null);
  const stars = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  const clip = useMemo(() => [new THREE.Plane(new THREE.Vector3(0, 1, 0), -(HAT_TOP - 0.05))], []);
  const fur = useMemo(() => new THREE.MeshStandardMaterial({ color: LILAC, roughness: 0.85, clippingPlanes: clip }), [clip]);
  const pink = useMemo(() => new THREE.MeshStandardMaterial({ color: PINK, roughness: 0.8, clippingPlanes: clip }), [clip]);
  const eye = useMemo(() => new THREE.MeshStandardMaterial({ color: DARK, roughness: 0.4, clippingPlanes: clip }), [clip]);

  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    const p = progress.current;
    const hatIn = ease(range(p, 0, 0.15));
    const rise = ease(range(p, 0.15, 0.75));
    const w = range(p, 0.6, 0.85);
    const wig = w > 0 && w < 1 ? Math.sin(w * Math.PI * 4) * 0.18 : 0;

    if (!mobile) {
      const k = 1 - Math.exp(-4 * dt);
      pointer.current.x += (state.pointer.x - pointer.current.x) * k;
      pointer.current.y += (state.pointer.y - pointer.current.y) * k;
    }
    if (hat.current) {
      hat.current.scale.setScalar(0.6 + hatIn * 0.4);
      hat.current.position.y = (1 - hatIn) * -0.8;
      hat.current.rotation.z = (1 - hatIn) * -0.25 - 0.06 * (1 - range(p, 0.15, 0.4));
      hat.current.rotation.y = pointer.current.x * 0.35;
      hat.current.rotation.x = -pointer.current.y * 0.12;
      hat.current.visible = hatIn > 0.001;
    }
    if (bunny.current) bunny.current.position.y = -1.9 + rise * 3.2;
    if (earL.current) earL.current.rotation.z = 0.18 + wig;
    if (earR.current) earR.current.rotation.z = -0.18 - wig;
    if (stars.current) {
      stars.current.children.forEach((s, i) => {
        const t = ease(range(w, STARS[i]![3] * 0.5, STARS[i]![3] * 0.5 + 0.5));
        s.scale.setScalar(p >= 0.6 ? t * 0.9 : 0);
        s.rotation.z += dt * 1.2;
        s.position.y = STARS[i]![1] + Math.sin(state.clock.elapsedTime * 1.5 + i) * 0.08;
      });
    }
  });

  return (
    <>
      <group ref={hat}>
        {/* aba */}
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[1.9, 1.9, 0.08, seg]} />
          <meshStandardMaterial color={INDIGO} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.04, 0]} rotation-x={-Math.PI / 2}>
          <torusGeometry args={[1.9, 0.06, 8, seg]} />
          <meshStandardMaterial color={INDIGO} roughness={0.7} />
        </mesh>
        {/* corpo oco */}
        <mesh position={[0, HAT_TOP / 2, 0]}>
          <cylinderGeometry args={[1.12, 1.05, HAT_TOP, seg, 1, true]} />
          <meshStandardMaterial color={INDIGO} roughness={0.75} side={THREE.DoubleSide} />
        </mesh>
        {/* interior escuro */}
        <mesh position={[0, HAT_TOP / 2, 0]}>
          <cylinderGeometry args={[1.1, 1.03, HAT_TOP - 0.02, seg, 1, true]} />
          <meshStandardMaterial color={DARK} roughness={1} side={THREE.BackSide} />
        </mesh>
        <mesh position={[0, 0.12, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[1.05, seg]} />
          <meshStandardMaterial color={DARK} roughness={1} />
        </mesh>
        <mesh position={[0, HAT_TOP, 0]} rotation-x={-Math.PI / 2}>
          <torusGeometry args={[1.12, 0.05, 8, seg]} />
          <meshStandardMaterial color={INDIGO} roughness={0.7} />
        </mesh>
        {/* faixa */}
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[1.08, 1.06, 0.3, seg, 1, true]} />
          <meshStandardMaterial color={AMBER} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>

      <group ref={bunny}>
        <mesh position={[0, 0.55, 0]} scale={[1, 0.85, 0.9]} material={fur}>
          <sphereGeometry args={[0.6, seg, seg / 2]} />
        </mesh>
        <mesh position={[0, 1.45, 0.05]} scale={[1, 0.9, 0.95]} material={fur}>
          <sphereGeometry args={[0.72, seg, seg / 2]} />
        </mesh>
        {[
          [earL, -0.3],
          [earR, 0.3],
        ].map(([ref, x], i) => (
          <group key={i} ref={ref as MutableRefObject<THREE.Group>} position={[x as number, 2.0, 0]}>
            <mesh position={[0, 0.65, 0]} scale={[1, 1, 0.6]} material={fur}>
              <capsuleGeometry args={[0.17, 0.9, 6, 12]} />
            </mesh>
            <mesh position={[0, 0.65, 0.08]} scale={[0.55, 0.85, 0.3]} material={pink}>
              <capsuleGeometry args={[0.17, 0.9, 6, 12]} />
            </mesh>
          </group>
        ))}
        <mesh position={[-0.25, 1.55, 0.66]} material={eye}><sphereGeometry args={[0.07, 12, 8]} /></mesh>
        <mesh position={[0.25, 1.55, 0.66]} material={eye}><sphereGeometry args={[0.07, 12, 8]} /></mesh>
        <mesh position={[0, 1.36, 0.7]} scale={[1.3, 0.9, 0.8]} material={pink}><sphereGeometry args={[0.06, 12, 8]} /></mesh>
        <mesh position={[-0.42, 1.3, 0.55]} scale={[1, 0.6, 0.3]} material={pink}><sphereGeometry args={[0.1, 12, 8]} /></mesh>
        <mesh position={[0.42, 1.3, 0.55]} scale={[1, 0.6, 0.3]} material={pink}><sphereGeometry args={[0.1, 12, 8]} /></mesh>
      </group>

      <group ref={stars}>
        {STARS.map(([x, y, z], i) => (
          <mesh key={i} position={[x, y, z]} scale={0}>
            <octahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial color={AMBER} emissive={AMBER} emissiveIntensity={0.4} roughness={0.5} />
          </mesh>
        ))}
      </group>
    </>
  );
}

export default function HatScene({ progress, active, mobile }: Props) {
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, mobile ? 1.25 : 1.75]}
      frameloop={active ? "always" : "never"}
      gl={{ alpha: true, antialias: !mobile, localClippingEnabled: true } as never}
      onCreated={({ gl }) => { gl.localClippingEnabled = true; }}
      camera={{ position: [0, 4.4, 8.6], fov: 38 }}
      style={{ background: "transparent" }}
    >
      <CameraAim />
      <ambientLight intensity={0.75} />
      <directionalLight position={[2, 6, 5]} intensity={1.6} />
      <directionalLight position={[0, 3, -5]} intensity={1.4} color={AMBER} />
      <Rig progress={progress} mobile={mobile} />
      <ContactShadows position={[0, -0.01, 0]} opacity={0.35} scale={7} blur={2.4} far={3} resolution={mobile ? 256 : 512} color={DARK} />
    </Canvas>
  );
}

function CameraAim() {
  const done = useRef(false);
  useFrame(({ camera }) => {
    if (done.current) return;
    camera.lookAt(0, 1.9, 0);
    done.current = true;
  });
  return null;
}
