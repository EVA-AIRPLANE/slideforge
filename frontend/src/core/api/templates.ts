import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
})

export interface Template {
  id: string
  name: string
  file_path: string
  thumbnail: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export const templateApi = {
  getTemplates: async (): Promise<Template[]> => {
    const response = await apiClient.get('/templates/')
    return response.data.data
  },

  getTemplate: async (templateId: string): Promise<Template> => {
    const response = await apiClient.get(`/templates/${templateId}`)
    return response.data.data
  }
}
