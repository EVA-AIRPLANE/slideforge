import axios from 'axios';

const API_BASE_URL = '/api/v1/ai';

export interface AIOutlineRequest {
  topic: string;
  preferences?: Record<string, any>;
}

export interface AIOutlineResponse {
  nodes: Array<{
    id: string;
    type: string;
    title: string;
    children?: Array<{
      id: string;
      type: string;
      title: string;
      description?: string;
    }>;
  }>;
}

export interface AIContentRequest {
  node_id: string;
  topic: string;
  context?: string;
}

export interface AIContentResponse {
  description: string;
  ai_generated: boolean;
}

export interface AIImageSearchRequest {
  keyword: string;
  per_page?: number;
}

export interface AIImageSearchResponse {
  images: Array<{
    id: number;
    url: string;
    thumbnail: string;
    photographer: string;
  }>;
}

export interface AIImageUnderstandRequest {
  image_url: string;
  node_title: string;
  parent_title: string;
  siblings: string[];
}

export interface AIImageUnderstandResponse {
  description: string;
}

export const aiApi = {
  generateOutline: async (request: AIOutlineRequest): Promise<AIOutlineResponse> => {
    const response = await axios.post(`${API_BASE_URL}/outline`, request);
    return response.data;
  },

  generateContent: async (request: AIContentRequest): Promise<AIContentResponse> => {
    const response = await axios.post(`${API_BASE_URL}/content`, request);
    return response.data;
  },

  searchImages: async (request: AIImageSearchRequest): Promise<AIImageSearchResponse> => {
    const response = await axios.post(`${API_BASE_URL}/images/search`, request);
    return response.data;
  },

  understandImage: async (request: AIImageUnderstandRequest): Promise<AIImageUnderstandResponse> => {
    const response = await axios.post(`${API_BASE_URL}/images/understand`, request);
    return response.data;
  },
};
