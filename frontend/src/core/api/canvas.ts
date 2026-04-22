import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
})

interface NodeData {
  id: string
  project_id: string
  parent_id?: string
  node_type: string
  title: string
  description: string
  speaker_notes: string
  order: number
  level: number
  ai_description_enabled: boolean
  ai_generated?: boolean
  position?: string
  created_at: string
  updated_at: string
}

interface SlideImage {
  id: string
  url: string
  thumbnail?: string
  caption?: string
}

interface Slide {
  id: string
  type: string  // title / chapter / content
  title: string
  content?: string
  speaker_notes?: string
  images: SlideImage[]
  level: number
}

export const canvasApi = {
  getNodes: async (projectId: string): Promise<NodeData[]> => {
    const response = await apiClient.get(`/canvas/projects/${projectId}/nodes`)
    return response.data.data
  },
  
  createNode: async (projectId: string, node: Omit<NodeData, 'id' | 'created_at' | 'updated_at'>): Promise<NodeData> => {
    const response = await apiClient.post(`/canvas/projects/${projectId}/nodes`, node)
    return response.data.data
  },
  
  updateNode: async (projectId: string, nodeId: string, updates: Partial<NodeData>): Promise<NodeData> => {
    const response = await apiClient.put(`/canvas/projects/${projectId}/nodes/${nodeId}`, updates)
    return response.data.data
  },
  
  deleteNode: async (projectId: string, nodeId: string): Promise<void> => {
    await apiClient.delete(`/canvas/projects/${projectId}/nodes/${nodeId}`)
  },

  getPreview: async (projectId: string): Promise<Slide[]> => {
    const response = await apiClient.get(`/canvas/projects/${projectId}/preview`)
    return response.data.data
  }
}