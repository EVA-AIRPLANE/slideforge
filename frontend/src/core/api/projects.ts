import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
})

interface Project {
  id: string
  name: string
  mode: string
  status: string
  template_id: string | null
  created_at: string
  updated_at: string
}

interface ProjectCreate {
  name: string
  mode: string
  template_id: string | null
}

interface ProjectUpdate {
  name?: string
  mode?: string
  status?: string
  template_id?: string | null
}

export const projectApi = {
  getProjects: async (): Promise<Project[]> => {
    const response = await apiClient.get('/projects')
    return response.data.data.items
  },
  
  getProject: async (projectId: string): Promise<Project> => {
    const response = await apiClient.get(`/projects/${projectId}`)
    return response.data.data
  },
  
  createProject: async (project: ProjectCreate): Promise<Project> => {
    const response = await apiClient.post('/projects', project)
    return response.data.data
  },
  
  updateProject: async (projectId: string, updates: ProjectUpdate): Promise<Project> => {
    const response = await apiClient.put(`/projects/${projectId}`, updates)
    return response.data.data
  },
  
  deleteProject: async (projectId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}`)
  }
}