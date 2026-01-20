import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { useIsMobile } from '@/hooks/use-mobile';

const mousePosition = { x: 0, y: 0 };
const smoothMouse = { x: 0, y: 0 };

interface WebMeshProps {
  isMobile: boolean;
}

function WebMesh({ isMobile }: WebMeshProps) {
  const meshRef = useRef<THREE.LineSegments>(null);
  const { camera } = useThree();
  
  const segments = isMobile ? 30 : 60;
  const size = 30;
  
  // Create a web-like radial structure
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const rings = segments;
    const spokes = isMobile ? 24 : 48;
    
    // Create concentric rings
    for (let r = 1; r <= rings; r++) {
      const radius = (r / rings) * size;
      const prevRadius = ((r - 1) / rings) * size;
      
      for (let s = 0; s < spokes; s++) {
        const angle = (s / spokes) * Math.PI * 2;
        const nextAngle = ((s + 1) / spokes) * Math.PI * 2;
        
        // Ring segments
        positions.push(
          Math.cos(angle) * radius, 0, Math.sin(angle) * radius,
          Math.cos(nextAngle) * radius, 0, Math.sin(nextAngle) * radius
        );
        
        // Spoke segments (radial lines)
        if (r > 1) {
          positions.push(
            Math.cos(angle) * prevRadius, 0, Math.sin(angle) * prevRadius,
            Math.cos(angle) * radius, 0, Math.sin(angle) * radius
          );
        }
      }
    }
    
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, [segments, size, isMobile]);

  // Store original positions
  const originalPositions = useMemo(() => {
    return new Float32Array(geometry.attributes.position.array);
  }, [geometry]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color('#dc2626') },
        uOpacity: { value: 0.12 },
        uGlow: { value: 0.4 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying float vDist;
        
        void main() {
          vPosition = position;
          vDist = length(position.xz) / 15.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uGlow;
        varying vec3 vPosition;
        varying float vDist;
        
        void main() {
          float fade = 1.0 - smoothstep(0.4, 1.0, vDist);
          float glow = (1.0 - vDist) * uGlow;
          vec3 color = uColor * (1.0 + glow * 0.5);
          gl_FragColor = vec4(color, uOpacity * fade);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime * 0.15;
    const positions = meshRef.current.geometry.attributes.position;
    
    smoothMouse.x += (mousePosition.x - smoothMouse.x) * 0.03;
    smoothMouse.y += (mousePosition.y - smoothMouse.y) * 0.03;
    
    for (let i = 0; i < positions.count; i++) {
      const ox = originalPositions[i * 3];
      const oz = originalPositions[i * 3 + 2];
      
      const dist = Math.sqrt(ox * ox + oz * oz);
      const normalizedDist = dist / size;
      
      // Subtle bowl curve
      const curve = Math.pow(1 - normalizedDist, 2) * 2;
      
      // Gentle wave
      const wave = Math.sin(dist * 0.15 + time) * 0.15 * (1 - normalizedDist);
      
      // Mouse influence - gentle ripple from cursor
      const mouseX = smoothMouse.x * 10;
      const mouseZ = smoothMouse.y * 10;
      const mouseDist = Math.sqrt(Math.pow(ox - mouseX, 2) + Math.pow(oz - mouseZ, 2));
      const mouseWave = Math.sin(mouseDist * 0.3 - time * 2) * Math.exp(-mouseDist * 0.08) * 0.5;
      
      positions.setY(i, -curve + wave + mouseWave);
    }
    
    positions.needsUpdate = true;
    
    // Subtle camera movement
    camera.position.x = smoothMouse.x * 0.8;
    camera.position.y = 12 + smoothMouse.y * 0.5;
    camera.lookAt(0, 0, 0);
  });

  return (
    <lineSegments ref={meshRef} geometry={geometry} material={material} />
  );
}

function Scene({ isMobile }: { isMobile: boolean }) {
  const { gl } = useThree();
  
  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
  }, [gl, isMobile]);

  return (
    <>
      <color attach="background" args={['#0a0b0d']} />
      <WebMesh isMobile={isMobile} />
    </>
  );
}

export function WireframeGridBackground() {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      
      gsap.to(mousePosition, {
        x,
        y,
        duration: 1,
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (typeof window !== 'undefined' && window.innerWidth < 400) {
    return <div className="fixed inset-0 -z-10 bg-[#0a0b0d]" />;
  }

  return (
    <div className="fixed inset-0 -z-10 bg-[#0a0b0d]">
      <Canvas
        camera={{ 
          position: [0, 12, 0], 
          fov: 50,
          near: 0.1,
          far: 100
        }}
        dpr={isMobile ? 1 : [1, 1.5]}
        performance={{ min: 0.5 }}
        className="!absolute inset-0"
      >
        <Scene isMobile={isMobile ?? false} />
      </Canvas>
    </div>
  );
}