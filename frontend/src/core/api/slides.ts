import axios from "axios";

const API_BASE_URL = "/api/v1";

export interface Slide {
  id: string;
  project_id: string;
  source_node_id?: string;
  order: number;
  layout_type: string;
  content?: { [key: string]: any };
  speaker_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SlideCreateRequest {
  project_id: string;
  source_node_id?: string;
  order: number;
  layout_type: string;
  content?: { [key: string]: any };
  speaker_notes?: string;
}

export interface SlideUpdateRequest {
  order?: number;
  layout_type?: string;
  content?: { [key: string]: any };
  speaker_notes?: string;
}

export const slidesApi = {
  /**
   * 获取项目的幻灯片列表
   */
  getSlidesByProject: async (projectId: string): Promise<Slide[]> => {
    const response = await axios.get(
      `${API_BASE_URL}/slides/project/${projectId}`
    );
    return response.data.data.items;
  },

  /**
   * 获取单个幻灯片
   */
  getSlide: async (slideId: string): Promise<Slide> => {
    const response = await axios.get(`${API_BASE_URL}/slides/${slideId}`);
    return response.data.data;
  },

  /**
   * 创建幻灯片
   */
  createSlide: async (slide: SlideCreateRequest): Promise<Slide> => {
    const response = await axios.post(`${API_BASE_URL}/slides`, slide);
    return response.data.data;
  },

  /**
   * 更新幻灯片
   */
  updateSlide: async (
    slideId: string,
    slide: SlideUpdateRequest
  ): Promise<Slide> => {
    const response = await axios.put(
      `${API_BASE_URL}/slides/${slideId}`,
      slide
    );
    return response.data.data;
  },

  /**
   * 删除幻灯片
   */
  deleteSlide: async (slideId: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/slides/${slideId}`);
  },

  /**
   * 从画布组装幻灯片
   */
  assembleSlides: async (projectId: string): Promise<Slide[]> => {
    const response = await axios.post(
      `${API_BASE_URL}/slides/assemble/${projectId}`
    );
    return response.data.data;
  },
};
