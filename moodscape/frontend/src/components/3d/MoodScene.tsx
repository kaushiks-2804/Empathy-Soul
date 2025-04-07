import { FC, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface Mood {
  score: number;
  emotion: string;
  color: string;
}

interface MoodSceneProps {
  mood: Mood;
}

const MoodOrb: FC<{ position: [number, number, number]; color: string; scale: number }> = ({ 
  position, 
  color, 
  scale = 1 
}) => {
  const orbRef = useRef<THREE.Mesh>(null);
  
  useFrame((_, delta) => {
    if (orbRef.current) {
      orbRef.current.rotation.x += delta * 0.2;
      orbRef.current.rotation.y += delta * 0.3;
    }
  });
  
  return (
    <mesh ref={orbRef} position={position}>
      <sphereGeometry args={[scale, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.2} 
        metalness={0.8}
        emissive={color}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

const MoodScene: FC<MoodSceneProps> = ({ mood }) => {
  const getEnvironment = () => {
    if (mood.score < 3) return 'stormy'; // Angry, terrible
    if (mood.score < 5) return 'cloudy'; // Sad, worried
    if (mood.score < 7) return 'neutral'; // Neutral, calm
    return 'sunny'; // Happy, excited, amazing
  };
  
  const getOrbCount = () => {
    return Math.max(1, Math.floor(mood.score / 2));
  };
  
  return (
    <>
      <color attach="background" args={['#1a202c']} />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
      
      {/* Main emotion orb */}
      <MoodOrb 
        position={[0, 0, 0]} 
        color={mood.color} 
        scale={0.8 + (mood.score * 0.05)} 
      />
      
      {/* Generate smaller satellite orbs based on mood score */}
      {Array.from({ length: getOrbCount() }).map((_, i) => {
        const angle = (i / getOrbCount()) * Math.PI * 2;
        const radius = 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.5;
        const z = Math.sin(angle) * Math.cos(angle) * radius;
        
        return (
          <MoodOrb 
            key={i}
            position={[x, y, z]} 
            color={mood.color} 
            scale={0.2 + (Math.random() * 0.3)} 
          />
        );
      })}
      
      <Environment preset="sunset" />
    </>
  );
};

export default MoodScene; 