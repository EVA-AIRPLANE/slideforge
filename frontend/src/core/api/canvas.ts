import axios from 'axios'

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

interface NodeCreateRequest {
  type: string
  parentId?: string
  data: {
    title: string
    description?: string
    speakerNotes?: string
    aiDescriptionEnabled?: boolean
  }
  position: { x: number; y: number }
}

interface NodeUpdateRequest {
  data: {
    title?: string
    description?: string
    speakerNotes?: string
    aiDescriptionEnabled?: boolean
  }
  position?: { x: number; y: number }
}

interface NodeReorderRequest {
  nodeId: string
  newParentId?: string
  newOrder?: number
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const canvasApi = {
  // 获取项目的所有节点
  getNodes: async (projectId: string): Promise<{ nodes: CanvasNode[]; edges: CanvasEdge[] }> => {
    const response = await axios.get(`${API_BASE_URL}/api/v1/projects/${projectId}/nodes`)
    return response.data.data
  },

  // 创建节点
  createNode: async (projectId: string, node: NodeCreateRequest): Promise<CanvasNode> => {
    const response = await axios.post(`${API_BASE_URL}/api/v1/projects/${projectId}/nodes`, node)
    return response.data.data
  },

  // 更新节点
  updateNode: async (projectId: string, nodeId: string, updates: NodeUpdateRequest): Promise<CanvasNode> => {
    const response = await axios.put(`${API_BASE_URL}/api/v1/projects/${projectId}/nodes/${nodeId}`, updates)
    return response.data.data
  },

  // 删除节点
  deleteNode: async (projectId: string, nodeId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/api/v1/projects/${projectId}/nodes/${nodeId}`)
  },

  // 调整节点顺序/层级
  reorderNodes: async (projectId: string, request: NodeReorderRequest): Promise<void> => {
    await axios.put(`${API_BASE_URL}/api/v1/projects/${projectId}/nodes/reorder`, request)
  },

  // 上传图片到节点
  uploadImageToNode: async (projectId: string, nodeId: string, file: File): Promise<NodeImage> => {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/projects/${projectId}/nodes/${nodeId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data.data
  },

  // 删除节点图片
  deleteNodeImage: async (projectId: string, nodeId: string, imageId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/api/v1/projects/${projectId}/nodes/${nodeId}/images/${imageId}`)
  }
}

export default canvasApi