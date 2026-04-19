import axios from 'axios';

const API_BASE_URL = '/api/v1';

export interface Template {
  id: string;
  name: string;
  source: 'builtin' | 'user_upload';
  file_path: string;
  thumbnail?: string;
  layouts?: any;
  parse_success: boolean;
  created_at: string;
  updated_at: string;
}

export const templateApi = {
  getTemplates: async (): Promise<Template[]> => {
    const response = await axios.get(`${API_BASE_URL}/templates/`);
    return response.data;
  },

  uploadTemplate: async (
    name: string,
    file: File,
    thumbnail?: File
  ): Promise<Template> => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);
    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }

    const response = await axios.post(`${API_BASE_URL}/templates/upload`, formData, {
      timeout: 30000 // 30秒超时
    });
    return response.data;
  },

  deleteTemplate: async (templateId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/templates/${templateId}`);
  },

  clearAllTemplates: async (): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/templates/`);
  },
};
