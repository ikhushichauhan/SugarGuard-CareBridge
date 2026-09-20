import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, Float, Center } from "@react-three/drei";
import * as THREE from "three";

// Robust Vite asset URL resolution for the heart model
const heartModelUrl = new URL("../assets/realistic_human_heart.glb", import.meta.url).href;

function Model({ mousePos, dragRotation }) {
  const group = useRef();
  const idleAngle = useRef(0);
  const { scene, animations } = useGLTF(heartModelUrl);
  const { actions } = useAnimations(animations, group);

  // Play embedded GLB animation if available
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const firstActionKey = Object.keys(actions)[0];
      if (actions[firstActionKey]) {
        actions[firstActionKey].play();
      }
    }
  }, [actions]);

  // Ensure meshes are visible, illuminated, and have cinematic metallic contrast
  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child.isMesh) {
        child.visible = true;
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.transparent = false;
          child.material.opacity = 1.0;
          child.material.roughness = 0.35;
          child.material.metalness = 0.45;
          child.material.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (!group.current) return;

    // 1. Continuous slow idle rotation accumulator
    idleAngle.current += delta * 0.22;

    // 2. Interaction targets (idle angle + drag rotation + mouse parallax tilt)
    const targetRotY = idleAngle.current + dragRotation.current.y + (mousePos.current.x * 0.3);
    const targetRotX = dragRotation.current.x + (mousePos.current.y * 0.2);
    const targetRotZ = -mousePos.current.x * 0.1;

    // 3. Butter-smooth lerp damping
    const lerpFactor = 0.08;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRotY, lerpFactor);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotX, lerpFactor);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetRotZ, lerpFactor);
  });

  return (
    <group ref={group}>
      <Center top={false}>
        <primitive object={scene} scale={2.6} />
      </Center>
    </group>
  );
}

export default function HumanHeartModel() {
  const mousePos = useRef({ x: 0, y: 0 });
  const dragRotation = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const previousPointer = useRef({ x: 0, y: 0 });
  const [cursorStyle, setCursorStyle] = useState("grab");

  // Pointer drag event handlers (desktop mouse + mobile touch)
  const handlePointerDown = (e) => {
    isDragging.current = true;
    previousPointer.current = { x: e.clientX, y: e.clientY };
    setCursorStyle("grabbing");
  };

  const handlePointerMove = (e) => {
    const { innerWidth, innerHeight } = window;
    mousePos.current = {
      x: (e.clientX / innerWidth) * 2 - 1,
      y: -(e.clientY / innerHeight) * 2 + 1,
    };

    if (isDragging.current) {
      const deltaX = e.clientX - previousPointer.current.x;
      const deltaY = e.clientY - previousPointer.current.y;

      dragRotation.current.y += deltaX * 0.008;
      dragRotation.current.x += deltaY * 0.005;

      dragRotation.current.x = THREE.MathUtils.clamp(
        dragRotation.current.x,
        -Math.PI / 3,
        Math.PI / 3
      );

      previousPointer.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    setCursorStyle("grab");
  };

  return (
    <div
      className="sg-3d-heart-container"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "420px",
        position: "relative",
        cursor: cursorStyle,
        touchAction: "pan-y",
        overflow: "visible",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ overflow: "visible" }}
      >
        {/* Cinematic Multi-Light Setup */}
        <ambientLight intensity={1.4} />
        <directionalLight position={[5, 8, 5]} intensity={3.5} color="#ffffff" />
        <directionalLight position={[-5, 2, 3]} intensity={2.5} color="#93c5fd" />
        <pointLight position={[0, 5, -5]} intensity={4.5} color="#ef4444" />
        <pointLight position={[0, 0, 4.5]} intensity={2.5} color="#ffffff" />
        <pointLight position={[0, -4, 3]} intensity={1.8} color="#3b82f6" />

        <Suspense fallback={null}>
          <Float
            speed={1.6}
            rotationIntensity={0.2}
            floatIntensity={0.4}
          >
            <Model
              mousePos={mousePos}
              dragRotation={dragRotation}
            />
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(heartModelUrl);
