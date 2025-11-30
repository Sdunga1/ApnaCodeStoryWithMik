'use client';

import React, { useState, Suspense, useEffect, useCallback } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { DSACard } from './DSACard';
import { DSAConnection } from './DSAConnection';
import { MovingGalaxy } from './MovingGalaxy';
import {
  dsaTopics as initialTopics,
  dsaEdges as initialEdges,
  DSATopic,
  DSAEdge,
  DSAShape,
  DSACategory,
} from './data';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  Edit,
  Save,
  Plus,
  Trash2,
  X,
  Link as LinkIcon,
  Scan,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import * as THREE from 'three';
import { useAuth } from '@/contexts/AuthContext';

// Draggable Wrapper for Edit Mode
const DraggableTopic = ({
  topic,
  isSelected,
  isEditMode,
  onSelect,
  onStartDrag,
}: {
  topic: DSATopic;
  isSelected: boolean;
  isEditMode: boolean;
  onSelect: (t: DSATopic) => void;
  onStartDrag: (e: any, topic: DSATopic) => void;
}) => {
  return (
    <group
      onPointerDown={e => {
        if (isEditMode) {
          onStartDrag(e, topic);
        }
      }}
    >
      <DSACard
        topic={topic}
        position={topic.position}
        onClick={() => onSelect(topic)}
        isSelected={isSelected}
      />
    </group>
  );
};

// Camera Controller for Fit to Page and Bounds Constraint
const CameraController = ({
  topics,
  fitTrigger,
  zoomInTrigger,
  zoomOutTrigger,
}: {
  topics: DSATopic[];
  fitTrigger: number;
  zoomInTrigger: number;
  zoomOutTrigger: number;
}) => {
  const { camera, controls } = useThree();
  const [targetPos] = useState(() => new THREE.Vector3());
  const [isFitting, setIsFitting] = useState(false);
  const [initialFitDone, setInitialFitDone] = useState(false);

  const performFit = useCallback(() => {
    // Calculate bounds
    if (topics.length === 0) return;

    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    topics.forEach(t => {
      minX = Math.min(minX, t.position[0]);
      maxX = Math.max(maxX, t.position[0]);
      minY = Math.min(minY, t.position[1]);
      maxY = Math.max(maxY, t.position[1]);
    });

    // Add padding
    const padding = 10;
    minX -= padding;
    maxX += padding;
    minY -= padding;
    maxY += padding;

    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Calculate required distance
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const aspect = (camera as THREE.PerspectiveCamera).aspect;

    let distanceH = height / (2 * Math.tan(fov / 2));
    let distanceW = width / (2 * Math.tan(fov / 2) * aspect);
    let distance = Math.max(distanceH, distanceW);

    // Clamp distance to be reasonable
    distance = Math.max(distance, 20);
    distance = Math.min(distance, 100);

    // Apply Position
    camera.position.set(centerX, centerY, distance);
    if (controls) {
      (controls as any).target.set(centerX, centerY, 0);
      (controls as any).update();
    }
  }, [topics, camera, controls]);

  // Initial Fit on Load
  //
  // NOTE: We intentionally *do not* include `topics` in the dependency array.
  // Including it would cause the camera to re-fit any time a topic is updated
  // (for example when scaling a node in edit mode), which feels like a
  // "zoom reset" to the user. We only want a single initial fit on mount,
  // and then explicit fits when the user presses the FIT VIEW button.
  useEffect(() => {
    if (!initialFitDone && topics.length > 0 && controls) {
      performFit();
      setInitialFitDone(true);
    }
  }, [initialFitDone, controls, performFit, topics.length]);

  // Fit to Page Logic Trigger
  useEffect(() => {
    if (fitTrigger === 0) return;
    performFit();
  }, [fitTrigger, performFit]);

  // Zoom In Logic
  useEffect(() => {
    if (zoomInTrigger === 0 || !controls) return;
    const orbitControls = controls as any;
    const distance = camera.position.distanceTo(orbitControls.target);
    const newDistance = Math.max(distance * 0.8, orbitControls.minDistance); // Zoom in by 20%

    const direction = new THREE.Vector3()
      .subVectors(camera.position, orbitControls.target)
      .normalize();
    camera.position
      .copy(orbitControls.target)
      .add(direction.multiplyScalar(newDistance));
    orbitControls.update();
  }, [zoomInTrigger, camera, controls]);

  // Zoom Out Logic
  useEffect(() => {
    if (zoomOutTrigger === 0 || !controls) return;
    const orbitControls = controls as any;
    const distance = camera.position.distanceTo(orbitControls.target);
    const newDistance = Math.min(distance * 1.2, orbitControls.maxDistance); // Zoom out by 20%

    const direction = new THREE.Vector3()
      .subVectors(camera.position, orbitControls.target)
      .normalize();
    camera.position
      .copy(orbitControls.target)
      .add(direction.multiplyScalar(newDistance));
    orbitControls.update();
  }, [zoomOutTrigger, camera, controls]);

  // Bounds Constraint Logic
  useFrame(() => {
    if (!controls) return;
    const orbitControls = controls as any;

    // Calculate bounds again (could be memoized if performance issue, but map is small)
    if (topics.length === 0) return;

    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    topics.forEach(t => {
      minX = Math.min(minX, t.position[0]);
      maxX = Math.max(maxX, t.position[0]);
      minY = Math.min(minY, t.position[1]);
      maxY = Math.max(maxY, t.position[1]);
    });

    const buffer = 20; // Allow scrolling a bit past the content
    const boundMinX = minX - buffer;
    const boundMaxX = maxX + buffer;
    const boundMinY = minY - buffer;
    const boundMaxY = maxY + buffer;

    // Clamp target
    orbitControls.target.x = Math.max(
      boundMinX,
      Math.min(boundMaxX, orbitControls.target.x)
    );
    orbitControls.target.y = Math.max(
      boundMinY,
      Math.min(boundMaxY, orbitControls.target.y)
    );
  });

  return null;
};

const SpaceMapContent = ({
  topics,
  edges,
  onTopicSelect,
  selectedTopic,
  isEditMode,
  onTopicMove,
  onDeleteEdge,
  fitTrigger,
  zoomInTrigger,
  zoomOutTrigger,
  onDragEnd,
}: {
  topics: DSATopic[];
  edges: DSAEdge[];
  onTopicSelect: (t: DSATopic) => void;
  selectedTopic: DSATopic | null;
  isEditMode: boolean;
  onTopicMove: (id: string, newPos: [number, number, number]) => void;
  onDeleteEdge: (index: number) => void;
  fitTrigger: number;
  zoomInTrigger: number;
  zoomOutTrigger: number;
  onDragEnd: () => void;
}) => {
  const { camera } = useThree();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<THREE.Vector3 | null>(null);
  const [planeNormal] = useState(() => new THREE.Vector3(0, 0, 1));
  const [planeConstant] = useState(0);
  const [plane] = useState(() => new THREE.Plane(planeNormal, planeConstant));
  const [intersectPoint] = useState(() => new THREE.Vector3());
  const raycaster = new THREE.Raycaster();

  const handleStartDrag = (e: any, topic: DSATopic) => {
    if (!isEditMode) return;
    e.stopPropagation();

    // Get the native DOM event for accurate coordinates
    const nativeEvent = e.nativeEvent || e;
    const clientX =
      nativeEvent.clientX ?? nativeEvent.touches?.[0]?.clientX ?? 0;
    const clientY =
      nativeEvent.clientY ?? nativeEvent.touches?.[0]?.clientY ?? 0;

    // Calculate the intersection point where the user clicked
    const pointer = new THREE.Vector2(
      (clientX / window.innerWidth) * 2 - 1,
      -(clientY / window.innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(pointer, camera);
    const clickedPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, clickedPoint);

    // Calculate offset between click position and node position
    const nodePos = new THREE.Vector3(...topic.position);
    const offset = new THREE.Vector3().subVectors(nodePos, clickedPoint);

    setDragOffset(offset);
    setDraggingId(topic.id);
    onTopicSelect(topic);
  };

  const handlePointerMove = (e: any) => {
    if (!isEditMode || !draggingId || !dragOffset) return;

    // Calculate intersection with Z=0 plane
    const pointer = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(pointer, camera);
    raycaster.ray.intersectPlane(plane, intersectPoint);

    if (intersectPoint) {
      // Apply the offset so the node maintains its position relative to where it was clicked
      const newPos = new THREE.Vector3().addVectors(intersectPoint, dragOffset);
      onTopicMove(draggingId, [newPos.x, newPos.y, 0]);
    }
  };

  const handlePointerUp = () => {
    if (draggingId) {
      onDragEnd && onDragEnd();
    }
    setDraggingId(null);
    setDragOffset(null);
  };

  // Add global event listeners for drag
  useEffect(() => {
    if (isEditMode && draggingId && dragOffset) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isEditMode, draggingId, dragOffset, camera, plane, intersectPoint]);

  return (
    <>
      <CameraController
        topics={topics}
        fitTrigger={fitTrigger}
        zoomInTrigger={zoomInTrigger}
        zoomOutTrigger={zoomOutTrigger}
      />
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.1} />
      <pointLight
        position={[0, 20, 10]}
        intensity={1.2}
        color="#60a5fa"
        distance={100}
      />
      <pointLight
        position={[0, -20, 10]}
        intensity={0.8}
        color="#c084fc"
        distance={100}
      />
      <spotLight
        position={[50, 0, 50]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        color="#ffffff"
      />

      {/* Background Elements */}
      <MovingGalaxy />

      <group>
        {topics.map(topic => (
          <DraggableTopic
            key={topic.id}
            topic={topic}
            isSelected={selectedTopic?.id === topic.id}
            isEditMode={isEditMode}
            onSelect={onTopicSelect}
            onStartDrag={handleStartDrag}
          />
        ))}

        {edges.map((edge, i) => {
          const source = topics.find(t => t.id === edge.source);
          const target = topics.find(t => t.id === edge.target);

          if (!source || !target) return null;

          return (
            <DSAConnection
              key={`${edge.source}-${edge.target}-${i}`}
              start={source.position}
              end={target.position}
              startScale={source.scale}
              endScale={target.scale}
              startShape={source.shape}
              endShape={target.shape}
              selectedTopicId={selectedTopic?.id || null}
              sourceId={edge.source}
              targetId={edge.target}
              isEditMode={isEditMode}
              onDelete={() => onDeleteEdge(i)}
            />
          );
        })}
      </group>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={false} // Disabled rotation for 2D feel
        mouseButtons={{
          LEFT: 2, // PAN
          MIDDLE: 1, // ZOOM
          RIGHT: 0, // ROTATE (Disabled)
        }}
        autoRotate={false}
        maxDistance={80}
        minDistance={10}
        target={[0, 0, 0]}
        enabled={!isEditMode || !draggingId} // Disable orbit only while actively dragging
        makeDefault // Important for useThree to pick it up
      />
    </>
  );
};

export const SpaceMap = () => {
  const { user, isAuthenticated } = useAuth();
  const isCreator = isAuthenticated && user?.role === 'creator';
  
  const [selectedTopic, setSelectedTopic] = useState<DSATopic | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // New Node Form State
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeDesc, setNewNodeDesc] = useState('');
  const [newNodeCategory, setNewNodeCategory] =
    useState<DSACategory>('Foundation');
  const [newNodeShape, setNewNodeShape] = useState<DSAShape>('rect');
  const [newNodeFontSize, setNewNodeFontSize] = useState(0.45);
  const [newNodeTextColor, setNewNodeTextColor] = useState('#ffffff');

  // State for Topics and Edges
  const [topics, setTopics] = useState<DSATopic[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dsa-topics');
      return saved ? JSON.parse(saved) : initialTopics;
    }
    return initialTopics;
  });

  const [edges, setEdges] = useState<DSAEdge[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dsa-edges');
      return saved ? JSON.parse(saved) : initialEdges;
    }
    return initialEdges;
  });

  // History Management
  const [history, setHistory] = useState<
    { topics: DSATopic[]; edges: DSAEdge[] }[]
  >([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addToHistory = (newTopics: DSATopic[], newEdges: DSAEdge[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ topics: newTopics, edges: newEdges });
    // Limit history size to 50
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ topics, edges }]);
      setHistoryIndex(0);
    }
  }, []);

  // Disable edit mode for non-creators
  useEffect(() => {
    if (!isCreator && isEditMode) {
      setIsEditMode(false);
      setLinkSource(null);
    }
  }, [isCreator, isEditMode]);

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      setTopics(state.topics);
      setEdges(state.edges);
      setHistoryIndex(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      setTopics(state.topics);
      setEdges(state.edges);
      setHistoryIndex(newIndex);
    }
  };

  const updateState = (newTopics: DSATopic[], newEdges: DSAEdge[]) => {
    setTopics(newTopics);
    setEdges(newEdges);
    addToHistory(newTopics, newEdges);
  };

  // Link creation state
  const [linkSource, setLinkSource] = useState<string | null>(null);
  const [fitTrigger, setFitTrigger] = useState(0);
  const [zoomInTrigger, setZoomInTrigger] = useState(0);
  const [zoomOutTrigger, setZoomOutTrigger] = useState(0);

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dsa-topics', JSON.stringify(topics));
      localStorage.setItem('dsa-edges', JSON.stringify(edges));
    }

  };

  const handleCreateNode = () => {
    const newTopic: DSATopic = {
      id: uuidv4(),
      name: newNodeName || 'New Node',
      position: [0, 15, 0], // Above the existing flow
      description: newNodeDesc || 'Description goes here...',
      category: newNodeCategory,
      shape: newNodeShape,
      scale: 0.1, // Start at small scale for smooth pop-in animation
      fontSize: newNodeFontSize,
      textColor: newNodeTextColor,
    };
    const newTopicsList = [...topics, newTopic];
    updateState(newTopicsList, edges);
    setSelectedTopic(newTopic);
    setIsAddDialogOpen(false);

    // Smooth scale-up animation over 400ms
    const startTime = Date.now();
    const duration = 400; // 400ms animation
    const nodeId = newTopic.id; // Capture node ID for closure

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newScale = 0.1 + (1 - 0.1) * easeOut;

      setTopics(prev =>
        prev.map(t => (t.id === nodeId ? { ...t, scale: newScale } : t))
      );

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Ensure final scale is exactly 1
        setTopics(prev =>
          prev.map(t => (t.id === nodeId ? { ...t, scale: 1 } : t))
        );
        // Update selected topic if it's the newly created one
        setSelectedTopic(prev =>
          prev?.id === nodeId ? { ...prev, scale: 1 } : prev
        );
      }
    };

    requestAnimationFrame(animate);

    // Reset form
    setNewNodeName('');
    setNewNodeDesc('');
    setNewNodeCategory('Foundation');
    setNewNodeShape('rect');
    setNewNodeFontSize(0.45);
    setNewNodeTextColor('#ffffff');

  };

  const handleDeleteTopic = () => {
    if (!selectedTopic) return;
    const newTopics = topics.filter(t => t.id !== selectedTopic.id);
    const newEdges = edges.filter(
      e => e.source !== selectedTopic.id && e.target !== selectedTopic.id
    );

    updateState(newTopics, newEdges);
    setSelectedTopic(null);
  };

  const handleUpdateTopic = (updates: Partial<DSATopic>) => {
    if (!selectedTopic) return;
    const updated = { ...selectedTopic, ...updates };
    const newTopics = topics.map(t =>
      t.id === selectedTopic.id ? updated : t
    );
    setTopics(newTopics);
    setSelectedTopic(updated);
  };

  // Add history entry for Drag End (Move)
  const handleMoveTopic = (id: string, newPos: [number, number, number]) => {
    setTopics(prev =>
      prev.map(t => (t.id === id ? { ...t, position: newPos } : t))
    );
    if (selectedTopic?.id === id) {
      setSelectedTopic(prev => (prev ? { ...prev, position: newPos } : null));
    }
  };

  // New wrapper for Drag End to commit history
  const handleDragEnd = () => {
    addToHistory(topics, edges);
  };

  const handleToggleLink = () => {
    if (!selectedTopic) return;
    if (linkSource === selectedTopic.id) {
      setLinkSource(null); // Cancel
      return;
    }

    if (!linkSource) {
      setLinkSource(selectedTopic.id);
    } else {
      // Check if link already exists
      const exists = edges.some(
        e =>
          (e.source === linkSource && e.target === selectedTopic.id) ||
          (e.source === selectedTopic.id && e.target === linkSource)
      );

      let newEdges = edges;

      if (exists) {
        // Remove link
        newEdges = edges.filter(
          e =>
            !(
              (e.source === linkSource && e.target === selectedTopic.id) ||
              (e.source === selectedTopic.id && e.target === linkSource)
            )
        );
      } else {
        // Add link
        newEdges = [...edges, { source: linkSource, target: selectedTopic.id }];
      }

      updateState(topics, newEdges);
      setLinkSource(null);
    }
  };

  // Keyboard Shortcuts (Creator only)
  useEffect(() => {
    if (!isCreator) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey)
      ) {
        e.preventDefault();
        redo();
      }

      // Save: Enter
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }

      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedTopic && isEditMode) {
          e.preventDefault();
          handleDeleteTopic();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [topics, edges, history, historyIndex, selectedTopic, isCreator, isEditMode]);

  return (
    <div className="w-full h-full relative bg-black overflow-visible">
      {/* UI Overlay Header */}
      <div className="absolute top-8 sm:top-6 md:top-4 left-4 z-40 select-none flex flex-col gap-2 pointer-events-none">
        <div>
          <h1
            className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-wider font-orbitron"
            style={{ textShadow: '0 0 10px rgba(96, 165, 250, 0.8)' }}
          >
            CodeStorywithMik <span className="text-blue-500">Roadmap</span>
          </h1>
          <p className="text-blue-200 font-light text-xs sm:text-sm mt-1 max-w-md font-rajdhani opacity-80">
            {isCreator && isEditMode ? 'EDIT MODE ENABLED' : 'Welcome to the World of DSA'}
          </p>
        </div>

        {isCreator && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 max-w-[calc(100%-5rem)]" style={{ pointerEvents: 'auto' }}>
            <Button
              variant={isEditMode ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => {
                if (isEditMode) {
                  // Auto-save when exiting edit mode
                  handleSave();
                }
                setIsEditMode(!isEditMode);
              }}
              className="h-7 sm:h-9 px-2 sm:px-3 gap-1 sm:gap-2 text-xs sm:text-sm font-orbitron tracking-wider border-blue-500/50 text-blue-100 bg-blue-900/20 hover:bg-blue-800/50"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />{' '}
              <span className="hidden sm:inline">{isEditMode ? 'Done Editing' : 'Edit Cosmos'}</span>
              <span className="sm:hidden">{isEditMode ? 'Done' : 'Edit'}</span>
            </Button>

            {isEditMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  className="h-7 sm:h-9 px-2 sm:px-3 gap-1 sm:gap-2 text-xs sm:text-sm font-orbitron border-green-500/50 text-green-100 bg-green-900/20 hover:bg-green-800/50"
                >
                  <Save className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Save</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddDialogOpen(true)}
                  className="h-7 sm:h-9 px-2 sm:px-3 gap-1 sm:gap-2 text-xs sm:text-sm font-orbitron border-purple-500/50 text-purple-100 bg-purple-900/20 hover:bg-purple-800/50"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Add Node</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Top Right Zoom Controls */}
      <div
        className="absolute top-[5.5rem] sm:top-4 right-4 z-40 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 bg-black/70 backdrop-blur-md p-1.5 sm:p-2 rounded-xl border border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.3)]"
        style={{ pointerEvents: 'auto' }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setZoomInTrigger(t => t + 1)}
          className="h-8 w-8 sm:h-10 sm:w-10 text-blue-300 hover:text-white hover:bg-blue-600/50 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFitTrigger(prev => prev + 1)}
          className="h-8 sm:h-10 px-2 sm:px-4 gap-2 font-orbitron text-xs text-cyan-300 hover:text-white hover:bg-cyan-600/50 border-x border-blue-500/30 rounded-none transition-all duration-200 hover:scale-105"
          title="Fit to View"
        >
          <Scan className="w-4 h-4" /> <span className="hidden sm:inline">FIT VIEW</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setZoomOutTrigger(t => t + 1)}
          className="h-8 w-8 sm:h-10 sm:w-10 text-blue-300 hover:text-white hover:bg-blue-600/50 rounded-lg transition-all duration-200 hover:scale-110 hover:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>

      {/* Add Node Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-slate-950/95 backdrop-blur-xl border-blue-500/30 text-white shadow-[0_0_30px_rgba(59,130,246,0.3)] sm:max-w-[425px]">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl font-orbitron text-blue-300 tracking-wider">
              Create New Node
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs text-slate-400 font-rajdhani">
                Name
              </Label>
              <Input
                id="name"
                value={newNodeName}
                onChange={e => setNewNodeName(e.target.value)}
                className="bg-slate-900/50 border-blue-500/30 text-white placeholder:text-slate-500 focus:border-blue-500"
                placeholder="Topic Name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc" className="text-xs text-slate-400 font-rajdhani">
                Description
              </Label>
              <Textarea
                id="desc"
                value={newNodeDesc}
                onChange={e => setNewNodeDesc(e.target.value)}
                className="bg-slate-900/50 border-blue-500/30 text-white placeholder:text-slate-500 focus:border-blue-500 min-h-[80px] resize-none"
                placeholder="Short description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-xs text-slate-400 font-rajdhani">Shape</Label>
                <Select
                  value={newNodeShape}
                  onValueChange={(v: DSAShape) => setNewNodeShape(v)}
                >
                  <SelectTrigger className="h-9 bg-slate-900/50 border-blue-500/30 text-white focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-blue-500/30 z-[200]">
                    <SelectItem value="rect" className="text-white focus:bg-blue-600/50">Rectangle</SelectItem>
                    <SelectItem value="circle" className="text-white focus:bg-blue-600/50">Circle</SelectItem>
                    <SelectItem value="rhomboid" className="text-white focus:bg-blue-600/50">Rhombus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-xs text-slate-400 font-rajdhani">Category</Label>
                <Select
                  value={newNodeCategory}
                  onValueChange={(v: DSACategory) => setNewNodeCategory(v)}
                >
                  <SelectTrigger className="h-9 bg-slate-900/50 border-blue-500/30 text-white focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-blue-500/30 z-[200]">
                    <SelectItem value="Foundation" className="text-white focus:bg-blue-600/50">Foundation</SelectItem>
                    <SelectItem value="Core" className="text-white focus:bg-blue-600/50">Core</SelectItem>
                    <SelectItem value="Intermediate" className="text-white focus:bg-blue-600/50">Intermediate</SelectItem>
                    <SelectItem value="Advanced" className="text-white focus:bg-blue-600/50">Advanced</SelectItem>
                    <SelectItem value="Final" className="text-white focus:bg-blue-600/50">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2 mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAddDialogOpen(false)}
              className="bg-slate-800/50 hover:bg-slate-700/50 text-white border-slate-600/50 text-sm h-9"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateNode}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm h-9 px-4"
            >
              Create Node
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Creation Overlay Hint */}
      {linkSource && isCreator && isEditMode && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 bg-blue-600 text-white px-4 py-2 rounded-full font-bold animate-pulse shadow-[0_0_20px_rgba(37,99,235,0.8)] pointer-events-none">
          Select target node to link
        </div>
      )}

      {/* Legend / Navigation Hint */}
      <div className="absolute bottom-4 left-4 z-40 text-xs text-slate-400 font-rajdhani pointer-events-none">
        <div className="flex flex-col gap-1 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2a75bb]"></span>{' '}
            Foundation
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4CAF50]"></span> Core
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF9800]"></span>{' '}
            Intermediate
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F44336]"></span> Advanced
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9C27B0]"></span> Final
          </div>
        </div>
        <div className="mt-2 opacity-50">
          Left Click + Drag to Pan | Scroll to Zoom{' '}
          {isCreator && isEditMode && '| Drag handles to Move'}
        </div>
      </div>

      {/* Edit / Details Panel */}
      {selectedTopic && (
        <div className="absolute bottom-8 right-8 z-40 w-80 animate-in slide-in-from-right-10 fade-in duration-300 pointer-events-auto">
          <Card className="bg-slate-950/90 backdrop-blur-xl border-blue-500/30 text-white shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-orbitron text-blue-300 flex justify-between items-center">
                {isCreator && isEditMode ? (
                  <Input
                    value={selectedTopic.name}
                    onChange={e => handleUpdateTopic({ name: e.target.value })}
                    className="bg-slate-900/50 border-blue-500/30 text-white h-8 font-bold"
                  />
                ) : (
                  <>
                    {selectedTopic.name}
                    <span className="text-xs px-2 py-1 rounded border border-slate-500 text-slate-300">
                      {selectedTopic.category}
                    </span>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-400 hover:text-white"
                  onClick={() => setSelectedTopic(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {isCreator && isEditMode ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-400">
                      Description
                    </Label>
                    <Textarea
                      value={selectedTopic.description}
                      onChange={e =>
                        handleUpdateTopic({ description: e.target.value })
                      }
                      className="bg-slate-900/50 border-blue-500/30 text-white text-xs min-h-[60px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-400">Shape</Label>
                      <Select
                        value={selectedTopic.shape}
                        onValueChange={(v: DSAShape) =>
                          handleUpdateTopic({ shape: v })
                        }
                      >
                        <SelectTrigger className="h-8 bg-slate-900/50 border-blue-500/30 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rect">Rectangle</SelectItem>
                          <SelectItem value="circle">Circle</SelectItem>
                          <SelectItem value="rhomboid">Rhombus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-slate-400">Category</Label>
                      <Select
                        value={selectedTopic.category}
                        onValueChange={(v: DSACategory) =>
                          handleUpdateTopic({ category: v })
                        }
                      >
                        <SelectTrigger className="h-8 bg-slate-900/50 border-blue-500/30 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Foundation">Foundation</SelectItem>
                          <SelectItem value="Core">Core</SelectItem>
                          <SelectItem value="Intermediate">
                            Intermediate
                          </SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                          <SelectItem value="Final">Final</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <Label className="text-xs text-slate-400">
                      Size Scale: {(selectedTopic.scale || 1).toFixed(1)}x
                    </Label>
                    <Slider
                      value={[selectedTopic.scale || 1]}
                      max={3}
                      min={0.5}
                      step={0.1}
                      onValueChange={vals =>
                        handleUpdateTopic({ scale: vals[0] })
                      }
                      className="py-2"
                    />
                  </div>

                  <div className="space-y-1 pt-1">
                    <Label className="text-xs text-slate-400">
                      Font Size: {(selectedTopic.fontSize || 0.45).toFixed(2)}
                    </Label>
                    <Slider
                      value={[selectedTopic.fontSize || 0.45]}
                      max={1.5}
                      min={0.1}
                      step={0.05}
                      onValueChange={vals =>
                        handleUpdateTopic({ fontSize: vals[0] })
                      }
                      className="py-2"
                    />
                  </div>

                  <div className="space-y-1 pt-1">
                    <Label className="text-xs text-slate-400">Text Color</Label>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        '#ffffff',
                        '#000000',
                        '#f59e0b',
                        '#3b82f6',
                        '#ef4444',
                        '#22c55e',
                      ].map(color => (
                        <button
                          key={color}
                          className={`w-6 h-6 rounded-full border-2 ${
                            selectedTopic.textColor === color
                              ? 'border-white scale-110'
                              : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() =>
                            handleUpdateTopic({ textColor: color })
                          }
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteTopic}
                      className="flex-1 gap-1 text-xs bg-red-600/90 hover:bg-red-700 border-red-500/50 text-white shadow-sm"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </Button>
                    <Button
                      variant={
                        linkSource === selectedTopic.id
                          ? 'secondary'
                          : 'outline'
                      }
                      size="sm"
                      onClick={handleToggleLink}
                      className={`flex-1 gap-1 text-xs border-blue-500/30 ${
                        linkSource === selectedTopic.id
                          ? 'animate-pulse bg-blue-600 hover:bg-blue-700'
                          : ''
                      }`}
                    >
                      {linkSource === selectedTopic.id ? (
                        <X className="w-3 h-3" />
                      ) : (
                        <LinkIcon className="w-3 h-3" />
                      )}
                      {linkSource === selectedTopic.id
                        ? 'Cancel Link'
                        : 'Link Node'}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-slate-300 font-rajdhani text-lg leading-snug">
                    {selectedTopic.description}
                  </p>
                  <Button
                    className="mt-4 w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 rounded transition-all hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] text-sm font-orbitron uppercase tracking-widest text-white"
                    onClick={() => setSelectedTopic(null)}
                  >
                    Close Transmission
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 40], fov: 45 }}>
        <Suspense fallback={null}>
          <SpaceMapContent
            topics={topics}
            edges={edges}
            onTopicSelect={t => {
              if (linkSource && isCreator && isEditMode && linkSource !== t.id) {
                // If linking, selecting another node completes the link
                const exists = edges.some(
                  e =>
                    (e.source === linkSource && e.target === t.id) ||
                    (e.source === t.id && e.target === linkSource)
                );

                let newEdges = edges;
                if (exists) {
                  newEdges = edges.filter(
                    e =>
                      !(
                        (e.source === linkSource && e.target === t.id) ||
                        (e.source === t.id && e.target === linkSource)
                      )
                  );
                } else {
                  newEdges = [...edges, { source: linkSource, target: t.id }];
                }

                updateState(topics, newEdges);
                setLinkSource(null); // Reset link source
              } else {
                setSelectedTopic(t);
              }
            }}
            selectedTopic={selectedTopic}
            isEditMode={isCreator && isEditMode}
            onTopicMove={handleMoveTopic}
            onDeleteEdge={index => {
              const newEdges = edges.filter((_, i) => i !== index);
              updateState(topics, newEdges);
            }}
            fitTrigger={fitTrigger}
            zoomInTrigger={zoomInTrigger}
            zoomOutTrigger={zoomOutTrigger}
            onDragEnd={handleDragEnd}
          />
        </Suspense>
      </Canvas>

      {/* Loading Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Suspense
          fallback={
            <div className="text-blue-400 font-orbitron tracking-widest animate-pulse text-lg shadow-blue-500/50 drop-shadow-lg">
              INITIALIZING HYPERDRIVE...
            </div>
          }
        >
          <></>
        </Suspense>
      </div>
    </div>
  );
};
