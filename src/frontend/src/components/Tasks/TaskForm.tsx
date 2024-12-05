import { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  Button,
  Input,
  Textarea,
  Select,
} from '@fluentui/react-components';
import { Plus } from 'lucide-react';
import { ITask } from '../../types/task';
import { useTaskStore } from '../../store/useTaskStore';

const priorities = ['low', 'medium', 'high'];
const statuses = ['todo', 'in-progress', 'completed'];

export const TaskForm = () => {
  const addTask = useTaskStore((state) => state.addTask);
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    status: 'todo',
    tags: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({
      ...task,
      dueDate: new Date(task.dueDate),
      tags: task.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    } as Omit<ITask, 'id'>);
    setOpen(false);
    setTask({
      title: '',
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'medium',
      status: 'todo',
      tags: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={(_, { open }) => setOpen(open)}>
      <DialogTrigger disableButtonEnhancement>
        <Button icon={<Plus />}>Add Task</Button>
      </DialogTrigger>
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <DialogTitle>New Task</DialogTitle>
          <DialogBody>
            <div className="space-y-4">
              <Input
                required
                placeholder="Task title"
                value={task.title}
                onChange={(e) => setTask({ ...task, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={task.description}
                onChange={(e) => setTask({ ...task, description: e.target.value })}
              />
              <Input
                type="date"
                value={task.dueDate}
                onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
              />
              <Select
                value={task.priority}
                onChange={(e) => setTask({ ...task, priority: e.target.value })}
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </Select>
              <Select
                value={task.status}
                onChange={(e) => setTask({ ...task, status: e.target.value })}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </Select>
              <Input
                placeholder="Tags (comma-separated)"
                value={task.tags}
                onChange={(e) => setTask({ ...task, tags: e.target.value })}
              />
            </div>
          </DialogBody>
          <DialogActions>
            <Button appearance="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" appearance="primary">
              Create Task
            </Button>
          </DialogActions>
        </form>
      </DialogSurface>
    </Dialog>
  );
};