'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Vector3, Mesh, DoubleSide } from 'three';
import { DSATopic } from './data';

interface DSACardProps {
  topic: DSATopic;
  position: [number, number, number];
  onClick: (topic: DSATopic) => void;
  isSelected: boolean;
}

export const DSACard: React.FC<DSACardProps> = ({ topic, position, onClick, isSelected }) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Color Mapping based on Mermaid classes
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Foundation': return '#2a75bb';
      case 'Core': return '#4CAF50';
      case 'Intermediate': return '#FF9800';
      case 'Advanced': return '#F44336';
      case 'Final': return '#9C27B0';
      default: return '#3b82f6';
    }
  };

  const baseColor = getCategoryColor(topic.category);
  const glowColor = isSelected ? '#F59E0B' : baseColor; // Amber/Gold for selection
  const glowIntensity = isSelected ? 1.0 : 0.5;
  const scaleFactor = topic.scale || 1;
  const fontSize = topic.fontSize || 0.45;
  // When selected: Always Black. When not selected: Use custom color or default white.
  const textColor = isSelected ? '#000000' : (topic.textColor || '#ffffff');

  useFrame((state) => {
    if (!meshRef.current) return;
    if (hovered || isSelected) {
      meshRef.current.scale.lerp(new Vector3(1.05 * scaleFactor, 1.05 * scaleFactor, 1.05 * scaleFactor), 0.1);
    } else {
      meshRef.current.scale.lerp(new Vector3(scaleFactor, scaleFactor, scaleFactor), 0.1);
    }
  });

  const renderShape = () => {
    switch (topic.shape) {
      case 'circle':
        return (
          <>
             <circleGeometry args={[1.8, 64]} />
             <mesh position={[0, 0, 0.01]}>
               <ringGeometry args={[1.7, 1.8, 64]} />
               <meshBasicMaterial color={baseColor} side={DoubleSide} toneMapped={false} />
            </mesh>
          </>
        );
      case 'rhomboid':
        return (
            <>
              <planeGeometry args={[2.5, 2.5]} />
              <mesh position={[1.1, 1.1, 0.01]}>
                 <planeGeometry args={[0.5, 0.5]} />
                 <meshBasicMaterial color={baseColor} transparent opacity={0.5} toneMapped={false} />
              </mesh>
              <mesh position={[-1.1, -1.1, 0.01]}>
                 <planeGeometry args={[0.5, 0.5]} />
                 <meshBasicMaterial color={baseColor} transparent opacity={0.5} toneMapped={false} />
              </mesh>
            </>
        );
      case 'rect':
      default:
        return (
            <>
            <planeGeometry args={[3.8, 1.4]} />
            <mesh position={[0, 0.65, 0.01]}>
               <planeGeometry args={[3.8, 0.1]} />
               <meshBasicMaterial color={baseColor} toneMapped={false} />
            </mesh>
             <mesh position={[0, -0.65, 0.01]}>
               <planeGeometry args={[3.8, 0.05]} />
               <meshBasicMaterial color={baseColor} transparent opacity={0.5} toneMapped={false} />
             </mesh>
            </>
        );
    }
  };

  // Native 3D Glow Mesh - Renders behind the card
  const renderGlow = () => {
    if (!isSelected) return null;

    const glowMaterialProps = {
      color: '#F59E0B', // Amber/Gold glow
      transparent: true,
      opacity: 0.4,
      toneMapped: false,
      side: DoubleSide
    };

    // Render multiple layers for a softer falloff effect
    const layers = [1.05, 1.15, 1.25]; 
    const opacities = [0.3, 0.2, 0.1];

    return (
      <group position={[0, 0, -0.1]}>
         {layers.map((scale, i) => {
            const layerOpacity = opacities[i];
            
            if (topic.shape === 'circle') {
               return (
                 <mesh key={i} scale={[scale, scale, 1]}>
                    <circleGeometry args={[1.8, 64]} />
                    <meshBasicMaterial {...glowMaterialProps} opacity={layerOpacity} />
                 </mesh>
               );
            } else if (topic.shape === 'rhomboid') {
               return (
                 <mesh key={i} rotation={[0, 0, Math.PI / 4]} scale={[scale, scale, 1]}>
                    <planeGeometry args={[2.5, 2.5]} />
                    <meshBasicMaterial {...glowMaterialProps} opacity={layerOpacity} />
                 </mesh>
               );
            } else { // rect
               return (
                 <mesh key={i} scale={[scale, scale, 1]}>
                    <planeGeometry args={[3.8, 1.4]} />
                    <meshBasicMaterial {...glowMaterialProps} opacity={layerOpacity} />
                 </mesh>
               );
            }
         })}
      </group>
    );
  };


  return (
    <group position={position}>
      
      {/* Render the Glow Effect */}
      {renderGlow()}

      <mesh
        ref={meshRef}
        rotation={topic.shape === 'rhomboid' ? [0, 0, Math.PI / 4] : [0, 0, 0]}
        onClick={(e) => { e.stopPropagation(); onClick(topic); }}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; setHovered(true); }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; setHovered(false); }}
      >
        {/* Main Body Shape */}
        {renderShape()}
        
        <meshBasicMaterial
          color={baseColor}
          transparent
          opacity={hovered || isSelected ? 0.3 : 0.15}
          side={DoubleSide}
          toneMapped={false}
        />
        
         {/* Border Highlight Mesh */}
         { topic.shape === 'rhomboid' ? (
             <mesh position={[0, 0, -0.01]}>
                 <planeGeometry args={[2.55, 2.55]} />
                 <meshBasicMaterial color={glowColor} opacity={glowIntensity} transparent toneMapped={false} />
             </mesh>
         ) : topic.shape === 'circle' ? (
             <mesh position={[0, 0, -0.01]}>
                 <circleGeometry args={[1.85, 64]} />
                 <meshBasicMaterial color={glowColor} opacity={glowIntensity} transparent toneMapped={false} />
             </mesh>
         ) : (
             <mesh position={[0, 0, -0.01]}>
                 <planeGeometry args={[3.85, 1.45]} />
                 <meshBasicMaterial color={glowColor} opacity={glowIntensity} transparent toneMapped={false} />
             </mesh>
         )}

      </mesh>

      {/* Text Label */}
      <Text
        position={[0, 0, 0.05]} 
        fontSize={fontSize} 
        color={textColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={topic.shape === 'rhomboid' ? 2 : (topic.shape === 'circle' ? 2.5 : 3.6)}
        textAlign="center"
        letterSpacing={0.01}
        fontWeight={800}
        renderOrder={2}
      >
        {topic.name}
      </Text>
    </group>
  );
};
