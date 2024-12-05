import { useState, useEffect, useMemo } from 'react';
import { Button, Spinner } from '@fluentui/react-components';
import { Trash2, AlertCircle } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useTaskFilters } from '../../store/useTaskFilters';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { TaskFilters } from './TaskFilters';
import { EditTaskDialog } from './EditTaskDialog';
import { ITask } from '../../types/task';

const priorityOrder = { low: 0, medium: 1, high: 2 };

export const TaskList = () => {
  const { 
    tasks, 
    selectedTasks, 
    deleteBulkTasks, 
    loading, 
    error, 
    hasMore,
    fetchTasks,
    loadMoreTasks 
  } = useTaskStore();
  const { filters } = useTaskFilters();
  const [editingTask, setEditingTask] = useState<ITask | null>(null);

  useEffect(() => {
    fetchTasks({
      search: filters.search || undefined,
      status: filters.status !== 'all' ? filters.status : undefined,
      priority: filters.priority !== 'all' ? filters.priority : undefined,
      sort: modifySortQuery(filters.sort),
    });
  }, [fetchTasks, filters]);

  const modifySortQuery = (sort: string) => {
    const [field, direction] = sort.split('-');
    return `${direction === 'asc' ? '' : '-'}${field}`;
  }

  useInfiniteScroll(loadMoreTasks, hasMore, loading);

  const filteredTasks = useMemo(() => {
    return tasks.sort((a, b) => {
      const [field, direction] = filters.sort.split('-');
      if (field === 'dueDate') {
        return direction === 'asc'
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      if (field === 'priority') {
        return direction === 'asc'
          ? priorityOrder[a.priority] - priorityOrder[b.priority]
          : priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });
  }, [tasks, filters.sort]);

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-600">
        <AlertCircle className="h-6 w-6 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <TaskForm />
        {selectedTasks.length > 0 && (
          <Button
            appearance="primary"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => deleteBulkTasks(selectedTasks)}
          >
            Delete Selected ({selectedTasks.length})
          </Button>
        )}
      </div>
      <TaskFilters />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={setEditingTask} />
        ))}
      </div>
      {loading && (
        <div className="flex justify-center py-4">
          <Spinner size="large" />
        </div>
      )}
      {editingTask && (
        <EditTaskDialog task={editingTask} onClose={() => setEditingTask(null)} />
      )}
    </div>
  );
};