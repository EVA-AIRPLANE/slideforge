import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface NodeData {
  id: string
  title: string
  description: string
  speakerNotes: string
  images: Array<{
    id: string
    url: string
    thumbnail: string
    caption?: string
  }>
  aiDescriptionEnabled: boolean
  order: number
  level: number
  aiGenerated?: boolean
  position: { x: number; y: number }
  parentId?: string
}

interface CanvasState {
  nodes: NodeData[]
  edges: Array<{
    id: string
    source: string
    target: string
  }>
  selectedNodeId: string | null
  
  // Actions
  addNode: (node: Omit<NodeData, 'id' | 'order' | 'position'>) => void
  updateNode: (id: string, updates: Partial<NodeData>) => void
  deleteNode: (id: string) => void
  selectNode: (id: string | null) => void
  addEdge: (source: string, target: string) => void
  deleteEdge: (id: string) => void
  updateNodePosition: (id: string, position: { x: number; y: number }) => void
}

const useCanvasStore = create<CanvasState>()(
  immer((set) => ({
    nodes: [],
    edges: [],
    selectedNodeId: null,
    
    addNode: (node) =>
      set((state) => {
        const newNode: NodeData = {
          ...node,
          id: `node-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
          order: state.nodes.length,
          position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 }
        }
        state.nodes.push(newNode)
      }),
    
    updateNode: (id, updates) =>
      set((state) => {
        const node = state.nodes.find((n) => n.id === id)
        if (node) {
          Object.assign(node, updates)
        }
      }),
    
    deleteNode: (id) =>
      set((state) => {
        state.nodes = state.nodes.filter((n) => n.id !== id)
        state.edges = state.edges.filter((e) => e.source !== id && e.target !== id)
        if (state.selectedNodeId === id) {
          state.selectedNodeId = null
        }
      }),
    
    selectNode: (id) =>
      set((state) => {
        state.selectedNodeId = id
      }),
    
    addEdge: (source, target) =>
      set((state) => {
        const existingEdge = state.edges.find(
          (e) => e.source === source && e.target === target
        )
        if (!existingEdge) {
          state.edges.push({
            id: `edge-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            source,
            target
          })
        }
      }),
    
    deleteEdge: (id) =>
      set((state) => {
        state.edges = state.edges.filter((e) => e.id !== id)
      }),
    
    updateNodePosition: (id, position) =>
      set((state) => {
        const node = state.nodes.find((n) => n.id === id)
        if (node) {
          node.position = position
        }
      })
  }))
)

export default useCanvasStore