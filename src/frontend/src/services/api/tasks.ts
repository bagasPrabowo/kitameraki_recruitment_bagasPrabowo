import api from '../../config/axios.config';
import { ApiResponse, BulkDeleteResponse } from './types';
import { ITask } from '../../types/task';

export interface TaskQuery {
  search?: string;
  status?: string;
  priority?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

export const taskService = {
  getTasks: async (query: TaskQuery = {}): Promise<ApiResponse<ITask[]>> => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const response = await api.get<ApiResponse<ITask[]>>(`/tasks?${params.toString()}`);
    return response.data;
  },

  getTaskById: async (id: string): Promise<ApiResponse<ITask>> => {
    const response = await api.get<ApiResponse<ITask>>(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (task: Omit<ITask, 'id'>): Promise<ApiResponse<ITask>> => {
    const response = await api.post<ApiResponse<ITask>>('/tasks', task);
    return response.data;
  },

  updateTask: async (id: string, task: Partial<ITask>): Promise<ApiResponse<ITask>> => {
    const response = await api.put<ApiResponse<ITask>>(`/tasks/${id}`, task);
    return response.data;
  },

  deleteTasks: async (ids: string[]): Promise<ApiResponse<BulkDeleteResponse>> => {
    const response = await api.delete<ApiResponse<BulkDeleteResponse>>('/tasks/bulk-delete', { data: { ids } });
    return response.data;
  },
};