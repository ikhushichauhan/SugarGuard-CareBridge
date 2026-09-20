import { useRef, useEffect, useState, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, Float, Center } from "@react-three/drei";
import * as THREE from "three";

function OrganMesh({ modelUrl, targetSize = 2.4, mousePos, dragRotation }) {
  const group = useRef();
  const idleAngle = useRef(0);
  const { scene, animations } = useGLTF(modelUrl);
  const { actions } = useAnimations(animations, group);

  // Auto-normalize model scale using Box3 bounding box so EVERY model fits targetSize
  const autoScale = useMemo(() => {
    if (!scene) return targetSize;
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    return maxDim > 0 ? (targetSize / maxDim) : targetSize;
  }, [scene, targetSize]);

  // Play embedded GLB animation if available
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const firstActionKey = Object.keys(actions)[0];
      if (actions[firstActionKey]) {
        actions[firstActionKey].play();
      }
    }
  }, [actions]);

  // Ensure meshes are visible, illuminated, and preserve true original GLB textures
  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child.isMesh) {
        child.visible = true;
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
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

    // 2. Interaction targets (oscillation + drag + mouse parallax tilt)
    const targetRotY = oscRotationY + dragRotation.current.y + (mousePos.current.x * 0.25);
    const targetRotX = dragRotation.current.x + (mousePos.current.y * 0.15);
    const targetRotZ = -mousePos.current.x * 0.08;

    // Clamp Y rotation so it stays strictly within 180° swing bounds (-90° to +90°)
    const clampedRotY = THREE.MathUtils.clamp(targetRotY, -Math.PI / 1.7, Math.PI / 1.7);

    // 3. Butter-smooth lerp damping
    const lerpFactor = 0.08;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, clampedRotY, lerpFactor);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetRotX, lerpFactor);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, targetRotZ, lerpFactor);
  });

  return (
    <group ref={group}>
      <Center top={false}>
        <primitive object={scene} scale={autoScale} />
      </Center>
    </group>
  );
}

export default function AnatomicalOrganModel({ modelUrl, targetSize = 2.4, title, label }) {
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
      className="sg-organ-item-card"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        cursor: cursorStyle,
        touchAction: "pan-y",
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "visible",
      }}
    >
      <div className="sg-organ-canvas-wrap">
        <Canvas
          camera={{ position: [0, 0, 4.6], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          style={{ overflow: "visible" }}
        >
          {/* Cinematic Multi-Light Setup */}
          <ambientLight intensity={1.4} />
          <directionalLight position={[5, 8, 5]} intensity={3.5} color="#ffffff" />
          <directionalLight position={[-5, 2, 3]} intensity={2.5} color="#93c5fd" />
          <pointLight position={[0, 5, -5]} intensity={4.2} color="#3b82f6" />
          <pointLight position={[0, 0, 4.5]} intensity={2.2} color="#ffffff" />
          <pointLight position={[0, -4, 3]} intensity={1.5} color="#60a5fa" />

          <Suspense fallback={null}>
            <Float
              speed={1.5}
              rotationIntensity={0.18}
              floatIntensity={0.35}
            >
              <OrganMesh
                modelUrl={modelUrl}
                targetSize={targetSize}
                mousePos={mousePos}
                dragRotation={dragRotation}
              />
            </Float>
          </Suspense>
        </Canvas>
      </div>
      {title && (
        <div className="sg-organ-meta">
          <span className="sg-organ-title">{title}</span>
          {label && <span className="sg-organ-label">{label}</span>}
        </div>
      )}
    </div>
  );
}
