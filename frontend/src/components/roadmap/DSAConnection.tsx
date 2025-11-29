'use client';

import React, { useMemo, useState, useRef } from 'react';
import { Vector3, CubicBezierCurve3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import { X } from 'lucide-react';

interface DSAConnectionProps {
  start: [number, number, number];
  end: [number, number, number];
  startScale?: number;
  endScale?: number;
  startShape?: 'rect' | 'circle' | 'rhomboid';
  endShape?: 'rect' | 'circle' | 'rhomboid';
  selectedTopicId: string | null;
  sourceId: string;
  targetId: string;
  isEditMode?: boolean;
  onDelete?: () => void;
}

export const DSAConnection: React.FC<DSAConnectionProps> = ({ 
  start, 
  end, 
  startScale = 1, 
  endScale = 1, 
  startShape = 'rect', 
  endShape = 'rect',
  selectedTopicId, 
  sourceId, 
  targetId, 
  isEditMode, 
  onDelete 
}) => {
  const [hovered, setHovered] = useState(false);
  const lineRef = useRef<any>(null);

  const points = useMemo(() => {
    // Base dimensions
    const RECT_HALF_WIDTH = 1.9;
    const CIRCLE_RADIUS = 1.8;
    const RHOMBUS_HALF_WIDTH = 1.7; // Approx width projection

    const getOffset = (shape: string, scale: number) => {
      switch(shape) {
        case 'circle': return CIRCLE_RADIUS * scale;
        case 'rhomboid': return RHOMBUS_HALF_WIDTH * scale;
        case 'rect':
        default: return RECT_HALF_WIDTH * scale;
      }
    };
    
    const startVec = new Vector3(...start);
    const endVec = new Vector3(...end);

    // Apply offsets based on shape and scale
    startVec.x += getOffset(startShape, startScale);
    endVec.x -= getOffset(endShape, endScale);

    const distX = Math.abs(endVec.x - startVec.x);
    
    // Adjusted tangent for the wider spacing
    const tangentLength = Math.max(distX * 0.5, 3); 

    const control1 = new Vector3(startVec.x + tangentLength, startVec.y, startVec.z);
    const control2 = new Vector3(endVec.x - tangentLength, endVec.y, endVec.z);

    const curve = new CubicBezierCurve3(
      startVec,
      control1,
      control2,
      endVec
    );

    return curve.getPoints(60);
  }, [start, end, startScale, endScale, startShape, endShape]);

  // Calculate Arrow Position (at the end of the curve)
  const arrowPosition = points[points.length - 1];
  // Calculate Arrow Rotation (look at the previous point)
  const lookAtPoint = points[points.length - 2];
  
  // Calculate Midpoint for delete button
  const midPoint = points[Math.floor(points.length / 2)];
  
  // Determine Highlight State
  // Highlight if this connection originates from the selected topic
  const isHighlighted = selectedTopicId === sourceId;

  useFrame((state, delta) => {
    if (isHighlighted && lineRef.current && lineRef.current.material) {
        lineRef.current.material.dashOffset -= delta * 2; // Animate dash offset
    }
  });

  // Evening Sunset Color (Warm Orange/Pink)
  const highlightedColor = '#FF7E5F'; 
  const defaultColor = '#e2e8f0';
  const hoverColor = '#ef4444'; // Red on hover in edit mode

  const lineColor = (isEditMode && hovered) ? hoverColor : (isHighlighted ? highlightedColor : defaultColor);
  const lineOpacity = isHighlighted ? 1 : 0.9;
  const lineWidth = isHighlighted ? 4 : 2.5; // Slightly reduced width from 5
  const backingOpacity = isHighlighted ? 0.6 : 0.5;

  return (
    <group
      onPointerOver={(e) => {
        if (isEditMode) {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={(e) => {
        if (isEditMode) {
            setHovered(false);
            document.body.style.cursor = 'auto';
        }
      }}
      onClick={(e) => {
        if (isEditMode && onDelete) {
            e.stopPropagation();
            onDelete();
        }
      }}
    >
      {/* Backing Line - thicker for easier clicking */}
      <Line
        points={points}
        color="#0f172a"
        lineWidth={lineWidth + 8} // Much thicker hit area
        transparent
        opacity={backingOpacity}
        position={[0, 0, -0.02]}
      />
      
      {/* Main Line */}
      <Line
        ref={lineRef}
        points={points}
        color={lineColor}
        lineWidth={lineWidth}
        transparent
        opacity={lineOpacity}
        toneMapped={false} // Make colors pop more
        dashed={isHighlighted}
        dashScale={isHighlighted ? 2 : 0} // Adjust scale of dashes
        dashSize={isHighlighted ? 0.5 : 0}
        gapSize={isHighlighted ? 0.25 : 0}
      />
      
      <ArrowHead position={arrowPosition} target={lookAtPoint} color={lineColor} />

      {isEditMode && hovered && (
        <Html position={[midPoint.x, midPoint.y, midPoint.z]} center>
            <div className="bg-red-500 text-white rounded-full p-1 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-in zoom-in duration-150">
                <X size={12} />
            </div>
        </Html>
      )}
    </group>
  );
};

const ArrowHead = ({ position, target, color }: { position: Vector3, target: Vector3, color: string }) => {
    const ref = React.useRef<any>(null);
    
    React.useLayoutEffect(() => {
        if (ref.current) {
            const direction = new Vector3().subVectors(position, target).normalize();
            const lookTarget = new Vector3().addVectors(position, direction);
            ref.current.lookAt(lookTarget);
            // Cone points up (Y+). We need it to point +Z.
            ref.current.rotateX(Math.PI / 2); 
        }
    }, [position, target]);

    return (
        <mesh ref={ref} position={position}> 
            <coneGeometry args={[0.2, 0.6, 12]} />
            <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
    );
}
