import { format } from 'date-fns';
import { Card, Text, Button, Checkbox } from '@fluentui/react-components';
import { Pencil, Trash2 } from 'lucide-react';
import { ITask } from '../../types/task';
import { useTaskStore } from '../../store/useTaskStore';

interface TaskCardProps {
  task: ITask;
  onEdit: (task: ITask) => void;
}

export const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  const { deleteTask, toggleTaskSelection, selectedTasks } = useTaskStore();

  const priorityColors = {
    low: '!bg-green-200',
    medium: '!bg-yellow-200',
    high: '!bg-red-300',
  };

  return (
    <Card className={`w-full ${priorityColors[task.priority]}`}>
      <div className="flex items-start gap-3 p-4">
        <div className="flex flex-col items-center gap-2 w-1/8">
          <Checkbox
            checked={selectedTasks.includes(task.id)}
            onChange={() => toggleTaskSelection(task.id)}
          />
          <Text size={200} className="text-gray-800">
            {format(new Date(task.dueDate), 'd MMM yyyy')}
          </Text>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <Text weight="semibold">{task.title}</Text>
            <div className="flex items-center gap-2">
              <Button
                icon={<Pencil className="h-4 w-4" />}
                appearance="subtle"
                onClick={() => onEdit(task)}
              />
              <Button
                icon={<Trash2 className="h-4 w-4" />}
                appearance="subtle"
                onClick={() => deleteTask(task.id)}
              />
            </div>
          </div>
          <Text>{task.description}</Text>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="mt-3 flex flex-col gap-2">
              {/* Status */}
              <div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${task.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : task.status === "in-progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                >
                  {task.status
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};