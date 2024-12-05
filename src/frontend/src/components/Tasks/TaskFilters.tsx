import { Input, Select } from '@fluentui/react-components';
import { Search } from 'lucide-react';
import { useTaskFilters } from '../../store/useTaskFilters';

const priorities = ['all', 'low', 'medium', 'high'];
const statuses = ['all', 'todo', 'in-progress', 'completed'];
const sortOptions = [
  { value: 'dueDate-asc', label: 'Due Date (Earliest)' },
  { value: 'dueDate-desc', label: 'Due Date (Latest)' },
  { value: 'priority-asc', label: 'Priority (Low to High)' },
  { value: 'priority-desc', label: 'Priority (High to Low)' },
  { value: 'title-asc', label: 'Title (A-Z)' },
  { value: 'title-desc', label: 'Title (Z-A)' },
  { value: 'status-desc', label: 'Status (Todo to Completed)' },
  { value: 'status-asc', label: 'Status (Completed to Todo)' },
];

export const TaskFilters = () => {
  const { filters, setFilters } = useTaskFilters();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          className="pl-10"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>
      <Select
        value={filters.priority}
        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
      >
        {priorities.map((priority) => (
          <option key={priority} value={priority}>
            {priority === 'all' 
              ? 'All Priorities' 
              : priority.charAt(0).toUpperCase() + priority.slice(1)}
          </option>
        ))}
      </Select>
      <Select
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
      >
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status === 'all'
              ? 'All Statuses'
              : status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </option>
        ))}
      </Select>
      <Select
        value={filters.sort}
        onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
};