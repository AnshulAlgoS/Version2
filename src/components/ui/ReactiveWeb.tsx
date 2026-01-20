import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsMobile } from '@/hooks/use-mobile';

// Global mouse tracker to ensure reactivity even when UI covers the canvas
const mousePosition = { x: 0, y: 0 };
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', (event) => {
    // Normalize to -1 to 1
    mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });
}

const WebMesh = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const { viewport } = useThree();
  
  // Grid configuration
  const width = 70; // Wider to cover full screen
  const height = 70;
  const segmentsX = 60;
  const segmentsY = 60;

  // Create geometry once
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY);
    const pos = geo.attributes.position;
    // Add more randomness for organic look
    for (let i = 0; i < pos.count; i++) {
        pos.setX(i, pos.getX(i) + (Math.random() - 0.5) * 2);
        pos.setY(i, pos.getY(i) + (Math.random() - 0.5) * 2);
        pos.setZ(i, (Math.random() - 0.5) * 4);
    }
    return geo;
  }, []);

  const originalPositions = useMemo(() => {
    return new Float32Array(geometry.attributes.position.array);
  }, [geometry]);

  useFrame((state) => {
    if (!meshRef.current || !pointsRef.current) return;

    const time = state.clock.getElapsedTime() * 0.5;
    const positions = meshRef.current.geometry.attributes.position;
    const pointPositions = pointsRef.current.geometry.attributes.position;
    
    // Use global mouse position instead of useThree().mouse
    const mouseX = (mousePosition.x * viewport.width) / 2;
    const mouseY = (mousePosition.y * viewport.height) / 2;

    for (let i = 0; i < positions.count; i++) {
      const px = originalPositions[i * 3];
      const py = originalPositions[i * 3 + 1];
      const pz = originalPositions[i * 3 + 2];

      // Cyberpunk Digital Wave
      const waveX = Math.sin(py * 0.2 + time) * 1.0;
      const waveY = Math.cos(px * 0.2 + time) * 1.0;
      const waveZ = Math.sin(px * 0.15 + py * 0.15 + time * 0.8) * 2.5;

      // Mouse Interaction (Digital Ripple)
      const dx = mouseX - (px + waveX);
      const dy = mouseY - (py + waveY);
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      let mouseForceX = 0;
      let mouseForceY = 0;
      let mouseForceZ = 0;

      const interactionRadius = 15; // Increased radius
      if (dist < interactionRadius) {
        const force = (interactionRadius - dist) / interactionRadius;
        const ease = force * force * (3 - 2 * force); 
        
        const angle = Math.atan2(dy, dx);
        const pushStrength = 8 * ease; // Stronger push
        
        mouseForceX = -Math.cos(angle) * pushStrength;
        mouseForceY = -Math.sin(angle) * pushStrength;
        mouseForceZ = -pushStrength * 5;
      }

      const nx = px + waveX + mouseForceX;
      const ny = py + waveY + mouseForceY;
      const nz = pz + waveZ + mouseForceZ;

      positions.setX(i, nx);
      positions.setY(i, ny);
      positions.setZ(i, nz);

      // Sync points with mesh
      pointPositions.setX(i, nx);
      pointPositions.setY(i, ny);
      pointPositions.setZ(i, nz);
    }

    positions.needsUpdate = true;
    pointPositions.needsUpdate = true;
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry}>
        <meshBasicMaterial 
          color="#000000"
          wireframe={true} 
          transparent={true}
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          color="#ff0000"
          size={0.15}
          transparent={true}
          opacity={0.6}
          sizeAttenuation={true}
        />
      </points>
    </group>
  );
};

const ReactiveWeb = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="fixed inset-0 -z-10 bg-white overflow-hidden pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        dpr={isMobile ? 1 : [1, 2]}
        className="!absolute inset-0"
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#ffffff']} />
        <fog attach="fog" args={['#ffffff', 5, 30]} /> 
        <WebMesh />
      </Canvas>
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0)_60%,rgba(0,0,0,0.05)_100%)] pointer-events-none" />
    </div>
  );
};

export default ReactiveWeb;
