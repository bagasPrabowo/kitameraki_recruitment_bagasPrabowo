import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  Button,
  Input,
  Textarea,
  Select,
} from '@fluentui/react-components';
import { ITask } from '../../types/task';
import { useTaskStore } from '../../store/useTaskStore';
import { useState } from 'react';

interface EditTaskDialogProps {
  task: ITask;
  onClose: () => void;
}

const priorities = ['low', 'medium', 'high'];
const statuses = ['todo', 'in-progress', 'completed'];

export const EditTaskDialog = ({ task, onClose }: EditTaskDialogProps) => {
  const updateTask = useTaskStore((state) => state.updateTask);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    dueDate: new Date(task.dueDate).toISOString().split('T')[0],
    priority: task.priority,
    status: task.status,
    tags: task.tags.join(', '),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTask(task.id, {
      ...formData,
      dueDate: new Date(formData.dueDate),
      tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(_, { open }) => !open && onClose()}>
      <DialogSurface>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogBody>
            <div className="space-y-4">
              <Input
                required
                placeholder="Task title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as ITask['priority'] })}
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </Select>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ITask['status'] })}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </Select>
              <Input
                placeholder="Tags (comma-separated)"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </DialogBody>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" appearance="primary">
              Update Task
            </Button>
          </DialogActions>
        </form>
      </DialogSurface>
    </Dialog>
  );
};