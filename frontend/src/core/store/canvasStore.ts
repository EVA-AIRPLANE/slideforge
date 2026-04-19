import { create } from 'zustand'
import { produce } from 'immer'

interface NodeImage {
  id: string
  url: string
  thumbnail: string
  caption?: string
}

interface CanvasNode {
  id: string
  type: string
  data: {
    title: string
    description: string
    speakerNotes: string
    images: NodeImage[]
    aiDescriptionEnabled: boolean
    order: number
    level: number
    aiGenerated?: boolean
  }
  position: { x: number; y: number }
  parentId?: string
}

interface CanvasEdge {
  id: string
  source: string
  target: string
  type?: string
}

interface CanvasState {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  selectedNodeId: string | null
  projectId: string | null
  
  // 节点操作
  addNode: (type: string, parentId?: string | null) => void
  updateNode: (nodeId: string, updates: Partial<CanvasNode['data']>) => void
  deleteNode: (nodeId: string) => void
  reorderNodes: (nodeId: string, newParentId?: string, newOrder?: number) => void
  
  // 边操作
  addEdge: (source: string, target: string) => void
  deleteEdge: (edgeId: string) => void
  
  // 图片操作
  addImageToNode: (nodeId: string, image: NodeImage) => void
  removeImageFromNode: (nodeId: string, imageId: string) => void
  
  // 选择操作
  selectNode: (nodeId: string | null) => void
  
  // 项目操作
  setProjectId: (projectId: string) => void
  loadCanvasData: (nodes: CanvasNode[], edges: CanvasEdge[]) => void
  resetCanvas: () => void
}

const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  projectId: null,
  
  addNode: (type, parentId = null) => set(produce((state) => {
    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      type,
      position: { x: 0, y: 0 },
      data: {
        title: type === 'rootNode' ? 'PPT 标题' : type === 'chapterNode' ? '章节' : '内容节点',
        description: '',
        speakerNotes: '',
        images: [],
        aiDescriptionEnabled: false,
        order: 0,
        level: parentId ? get().nodes.find(n => n.id === parentId)?.data.level! + 1 : 0
      },
      parentId
    }
    state.nodes.push(newNode)
  })),
  
  updateNode: (nodeId, updates) => set(produce((state) => {
    const node = state.nodes.find(n => n.id === nodeId)
    if (node) {
      node.data = { ...node.data, ...updates }
    }
  })),
  
  deleteNode: (nodeId) => set(produce((state) => {
    // 删除节点及其所有子节点
    const nodesToDelete = [nodeId]
    let i = 0
    while (i < nodesToDelete.length) {
      const currentNodeId = nodesToDelete[i]
      const childNodes = state.nodes.filter(n => n.parentId === currentNodeId)
      childNodes.forEach(child => nodesToDelete.push(child.id))
      i++
    }
    
    state.nodes = state.nodes.filter(n => !nodesToDelete.includes(n.id))
    state.edges = state.edges.filter(e => 
      !nodesToDelete.includes(e.source) && !nodesToDelete.includes(e.target)
    )
    
    if (state.selectedNodeId && nodesToDelete.includes(state.selectedNodeId)) {
      state.selectedNodeId = null
    }
  })),
  
  reorderNodes: (nodeId, newParentId, newOrder) => set(produce((state) => {
    const node = state.nodes.find(n => n.id === nodeId)
    if (node) {
      node.parentId = newParentId
      if (newOrder !== undefined) {
        node.data.order = newOrder
      }
    }
  })),
  
  addEdge: (source, target) => set(produce((state) => {
    const newEdge: CanvasEdge = {
      id: `edge-${Date.now()}`,
      source,
      target
    }
    state.edges.push(newEdge)
  })),
  
  deleteEdge: (edgeId) => set(produce((state) => {
    state.edges = state.edges.filter(e => e.id !== edgeId)
  })),
  
  addImageToNode: (nodeId, image) => set(produce((state) => {
    const node = state.nodes.find(n => n.id === nodeId)
    if (node) {
      node.data.images.push(image)
    }
  })),
  
  removeImageFromNode: (nodeId, imageId) => set(produce((state) => {
    const node = state.nodes.find(n => n.id === nodeId)
    if (node) {
      node.data.images = node.data.images.filter(img => img.id !== imageId)
    }
  })),
  
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  
  setProjectId: (projectId) => set({ projectId }),
  
  loadCanvasData: (nodes, edges) => set({ nodes, edges }),
  
  resetCanvas: () => set({ nodes: [], edges: [], selectedNodeId: null })
}))

export default useCanvasStore