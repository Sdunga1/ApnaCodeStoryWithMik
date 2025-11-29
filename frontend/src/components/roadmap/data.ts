export type DSACategory = 'Foundation' | 'Core' | 'Intermediate' | 'Advanced' | 'Final';
export type DSAShape = 'rect' | 'circle' | 'rhomboid';

export interface DSATopic {
  id: string;
  name: string;
  position: [number, number, number];
  description: string;
  category: DSACategory;
  shape: DSAShape;
  scale?: number;
  fontSize?: number;
  textColor?: string;
}

export interface DSAEdge {
  source: string;
  target: string;
}

// Horizontal Layout based on Mermaid Graph
export const dsaTopics: DSATopic[] = [
  // Level 0: Foundation (Blue) - x: -35 to -25
  { id: 'L0A', name: 'Language Basics', position: [-35, 0, 0], description: 'Pick a Language & Basic Syntax.', category: 'Foundation', shape: 'rect' },
  { id: 'L0B', name: 'Pointers / Memory', position: [-30, 0, 0], description: 'Memory management fundamentals.', category: 'Foundation', shape: 'rhomboid' },
  { id: 'L0C', name: 'Algo Complexity', position: [-25, 0, 0], description: 'Big O Notation & Analysis.', category: 'Foundation', shape: 'circle' },

  // Level 1: Core Structures (Green) - x: -15 to -5
  { id: 'L1A', name: 'Basic Data Structs', position: [-15, 4, 0], description: 'Arrays, Lists, Maps, Stacks, Queues.', category: 'Core', shape: 'rect' },
  { id: 'L1B', name: 'Search & Sort', position: [-15, -4, 0], description: 'Binary Search, Merge Sort, etc.', category: 'Core', shape: 'rect' },
  { id: 'L1C', name: 'Two Pointers', position: [-10, 4, 0], description: 'Iterative technique for arrays.', category: 'Core', shape: 'rect' },
  { id: 'L1D', name: 'Sliding Window', position: [-5, 4, 0], description: 'Subarray optimization.', category: 'Core', shape: 'rect' },
  { id: 'L1E', name: 'Recursion', position: [-10, -4, 0], description: 'Solving problems recursively.', category: 'Core', shape: 'circle' },

  // Level 2: Non-Linear & Intermediate (Orange) - x: 5 to 10
  { id: 'L2A', name: 'Trees & Traversal', position: [5, 0, 0], description: 'Binary Trees, BST, DFS/BFS.', category: 'Intermediate', shape: 'rect' },
  { id: 'L2B', name: 'Heaps / PQ', position: [5, -6, 0], description: 'Priority Queues & Heap Sort.', category: 'Intermediate', shape: 'rect' },
  { id: 'L2C', name: 'Backtracking', position: [5, 6, 0], description: 'Solving via exploration.', category: 'Intermediate', shape: 'circle' },
  { id: 'L2D', name: 'Tries', position: [10, 0, 0], description: 'Prefix Trees for strings.', category: 'Intermediate', shape: 'circle' },

  // Level 3: Advanced Paradigms (Red) - x: 20 to 25
  { id: 'L3A', name: 'Graphs', position: [20, 2, 0], description: 'Adjacency lists, matrices, traversals.', category: 'Advanced', shape: 'rect' },
  { id: 'L3B', name: '1-D DP', position: [20, 8, 0], description: 'Linear Dynamic Programming.', category: 'Advanced', shape: 'rect' },
  { id: 'L3C', name: 'Adv. Graph Algos', position: [25, -2, 0], description: 'MST, Shortest Path, DSU.', category: 'Advanced', shape: 'circle' },
  { id: 'L3D', name: '2-D DP', position: [25, 8, 0], description: 'Grid and Multi-state DP.', category: 'Advanced', shape: 'circle' },

  // Level 4: Optimization & Practice (Purple) - x: 35 to 40
  { id: 'L4A', name: 'Adv. Techniques', position: [35, 0, 0], description: 'Segment Trees, Fenwick Trees.', category: 'Final', shape: 'rect' },
  { id: 'L4B', name: 'Bit Manipulation', position: [35, 8, 0], description: 'Binary operations optimization.', category: 'Final', shape: 'circle' },
  { id: 'L4C', name: 'Math & Geometry', position: [35, 12, 0], description: 'Number theory & Geometric algos.', category: 'Final', shape: 'circle' },
  { id: 'L4D', name: 'Practice & Opt.', position: [42, 4, 0], description: 'Competitive platforms & tuning.', category: 'Final', shape: 'rect' },
];

export const dsaEdges: DSAEdge[] = [
  // Level 0
  { source: 'L0A', target: 'L0B' },
  { source: 'L0B', target: 'L0C' },

  // Level 0 -> Level 1
  { source: 'L0C', target: 'L1A' },
  { source: 'L0C', target: 'L1B' },

  // Level 1 Internal
  { source: 'L1A', target: 'L1C' },
  { source: 'L1B', target: 'L1E' },
  { source: 'L1C', target: 'L1D' },

  // Level 1 -> Level 2
  { source: 'L1E', target: 'L2A' }, // Recursion -> Trees
  { source: 'L1D', target: 'L2A' }, // Sliding Window -> Trees (via link in mermaid L1D -> L2A is explicit flow link) 
  // Actually Mermaid says L1D -> L2B in subgraph, but L1D -> L2A in flow linking. Let's follow subgraph primarily + explicit flow links.
  { source: 'L1D', target: 'L2B' }, // Sliding Window -> Heaps (subgraph)
  { source: 'L1E', target: 'L2C' }, // Recursion -> Backtracking

  // Level 2 Internal
  { source: 'L2A', target: 'L2D' }, // Trees -> Tries
  { source: 'L2A', target: 'L2C' }, // Trees -> Backtracking

  // Level 2 -> Level 3
  { source: 'L2C', target: 'L3A' }, // Backtracking -> Graphs
  { source: 'L2C', target: 'L3B' }, // Backtracking -> 1-D DP
  { source: 'L2B', target: 'L3C' }, // Heaps -> Adv Graphs
  { source: 'L2D', target: 'L3A' }, // Tries -> Graphs (explicit flow link)

  // Level 3 Internal
  { source: 'L3B', target: 'L3D' }, // 1-D DP -> 2-D DP
  { source: 'L3A', target: 'L3C' }, // Graphs -> Adv Graphs

  // Level 3 -> Level 4
  { source: 'L3C', target: 'L4A' }, // Adv Graphs -> Adv Techniques
  { source: 'L3D', target: 'L4A' }, // 2-D DP -> Adv Techniques
  { source: 'L3D', target: 'L4B' }, // 2-D DP -> Bit Manip

  // Level 4 Internal
  { source: 'L4B', target: 'L4C' }, // Bit Manip -> Math
  { source: 'L4A', target: 'L4D' }, // Adv Tech -> Practice
  { source: 'L4C', target: 'L4D' }, // Math -> Practice
];
