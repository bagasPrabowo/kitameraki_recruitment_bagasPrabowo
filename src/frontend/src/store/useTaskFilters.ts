import { create } from 'zustand';

interface TaskFilters {
  search: string;
  priority: string;
  status: string;
  sort: string;
}

interface TaskFiltersStore {
  filters: TaskFilters;
  setFilters: (filters: TaskFilters) => void;
}

export const useTaskFilters = create<TaskFiltersStore>((set) => ({
  filters: {
    search: '',
    priority: 'all',
    status: 'all',
    sort: 'dueDate-asc',
  },
  setFilters: (filters) => set({ filters }),
}));