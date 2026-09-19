import React, { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, Float, Center } from "@react-three/drei";
import * as THREE from "three";

// Robust Vite asset URL resolution
const humanModelUrl = new URL("../assets/human_organs.glb", import.meta.url).href;

function Model({ mousePos, scrollProgress, dragRotation }) {
  const group = useRef();
  const idleAngle = useRef(0);
  const { scene, animations } = useGLTF(humanModelUrl);
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

  // Ensure meshes are visible, illuminated, and have metallic contrast
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
          child.material.roughness = 0.3;
          child.material.metalness = 0.5;
          child.material.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (!group.current) return;

    // 1. Oscillate Y rotation back-and-forth across a 180° arc (left-to-right <-> right-to-left)
    idleAngle.current += delta * 0.45;
    const oscRotationY = Math.sin(idleAngle.current) * (Math.PI / 2.2); // Smooth 180° swing

    const s = scrollProgress.current; // 0.0 at top -> 1.0+ as page scrolls down

    // 2. Interaction targets (oscillation + drag + mouse parallax tilt)
    const targetRotY = oscRotationY + dragRotation.current.y + (mousePos.current.x * 0.25) + (s * 0.35);
    const targetRotX = dragRotation.current.x + (mousePos.current.y * 0.15);
    const targetRotZ = -mousePos.current.x * 0.08;

    // Clamp total Y rotation within -100° to +100° (never 360°)
    const clampedRotY = THREE.MathUtils.clamp(targetRotY, -Math.PI / 1.7, Math.PI / 1.7);

    // Position targets: Centered & clean
    const initialY = -0.3;
    const targetPosY = initialY - (s * 0.12);
    const targetPosZ = -(s * 0.3);
    const targetPosX = +(s * 0.6);

    // Scale target: bigger imposing scale
    const initialScale = 2.4;
    const targetScale = Math.max(initialScale * (1 - s * 0.1), 1.7);

    // 3. Damped lerp transition
    const lerpFactor = 0.07;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, clampedRotY, lerpFactor);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotX, lerpFactor);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetRotZ, lerpFactor);

    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, targetPosY, lerpFactor);
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, targetPosZ, lerpFactor);
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, targetPosX, lerpFactor);

    const currentScale = group.current.scale.x;
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, lerpFactor);
    group.current.scale.set(newScale, newScale, newScale);
  });

  return (
    <group ref={group}>
      <Center top={false}>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

export default function HumanBodyModel() {
  const mousePos = useRef({ x: 0, y: 0 });
  const scrollProgress = useRef(0);
  const dragRotation = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const previousPointer = useRef({ x: 0, y: 0 });
  const [cursorStyle, setCursorStyle] = useState("grab");

  // Track page scroll ratio
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight || 800;
      const ratio = Math.min(Math.max(window.scrollY / heroHeight, 0), 2.0);
      scrollProgress.current = ratio;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      className="sg-3d-canvas-container"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        cursor: cursorStyle,
        touchAction: "pan-y",
        overflow: "visible",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 44 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ overflow: "visible" }}
      >
        {/* Cinematic Multi-Light Setup */}
        <ambientLight intensity={1.3} />
        <directionalLight position={[5, 8, 5]} intensity={3.2} color="#ffffff" />
        <directionalLight position={[-5, 2, 3]} intensity={2.2} color="#93c5fd" />
        <pointLight position={[0, 5, -5]} intensity={4.2} color="#3b82f6" />
        <pointLight position={[0, 0, 4.5]} intensity={2.2} color="#ffffff" />
        <pointLight position={[0, -4, 3]} intensity={1.5} color="#60a5fa" />

        <Suspense fallback={null}>
          <Float
            speed={1.4}
            rotationIntensity={0.15}
            floatIntensity={0.35}
          >
            <Model
              mousePos={mousePos}
              scrollProgress={scrollProgress}
              dragRotation={dragRotation}
            />
          </Float>
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload(humanModelUrl);
