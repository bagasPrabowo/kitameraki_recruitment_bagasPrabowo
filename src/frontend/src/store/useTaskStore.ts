/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { ITask } from '../types/task';
import { taskService, TaskQuery } from '../services/api/tasks';

interface TaskStore {
  tasks: ITask[];
  selectedTasks: string[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  fetchTasks: (query?: TaskQuery) => Promise<void>;
  loadMoreTasks: () => Promise<void>;
  addTask: (task: Omit<ITask, 'id'>) => Promise<void>;
  updateTask: (id: string, task: Partial<ITask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  deleteBulkTasks: (ids: string[]) => Promise<void>;
  toggleTaskSelection: (id: string) => void;
  clearSelectedTasks: () => void;
}

const ITEMS_PER_PAGE = 12;

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  selectedTasks: [],
  loading: false,
  error: null,
  hasMore: true,
  page: 1,

  fetchTasks: async (query?: TaskQuery) => {
    try {
      set({ loading: true, error: null, page: 1, tasks: [] });
      const response = await taskService.getTasks({
        ...query,
        page: '1',
        limit: String(ITEMS_PER_PAGE),
      });
      set({
        tasks: response.data,
        hasMore: response.data.length === ITEMS_PER_PAGE,
        page: 2,
      });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  loadMoreTasks: async () => {
    const { loading, hasMore, page, tasks } = get();
    if (loading || !hasMore) return;

    try {
      set({ loading: true, error: null });
      const response = await taskService.getTasks({
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
      });
      
      set({
        tasks: [...tasks, ...response.data],
        hasMore: response.data.length === ITEMS_PER_PAGE,
        page: page + 1,
      });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  addTask: async (task) => {
    try {
      set({ loading: true, error: null });
      const response = await taskService.createTask(task);
      set((state) => ({ tasks: [response.data, ...state.tasks] }));
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  updateTask: async (id, updatedTask) => {
    try {
      set({ loading: true, error: null });
      const response = await taskService.updateTask(id, updatedTask);
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? response.data : task
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  deleteTask: async (id) => {
    try {
      set({ loading: true, error: null });
      await taskService.deleteTasks([id]);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        selectedTasks: state.selectedTasks.filter((taskId) => taskId !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  deleteBulkTasks: async (ids) => {
    try {
      set({ loading: true, error: null });
      await taskService.deleteTasks(ids);
      set((state) => ({
        tasks: state.tasks.filter((task) => !ids.includes(task.id)),
        selectedTasks: [],
      }));
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  toggleTaskSelection: (id) =>
    set((state) => ({
      selectedTasks: state.selectedTasks.includes(id)
        ? state.selectedTasks.filter((taskId) => taskId !== id)
        : [...state.selectedTasks, id],
    })),

  clearSelectedTasks: () => set({ selectedTasks: [] }),
}));