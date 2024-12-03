import { randomUUID } from 'crypto';
import { Schema, model } from 'mongoose';
import { ITask } from '../types/task';

const taskSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    description: 'Unique identifier for the task',
    default: () => randomUUID()
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
    description: 'Title of the task'
  },
  description: {
    type: String,
    maxlength: 1000,
    description: 'Description of the task'
  },
  dueDate: {
    type: Date,
    description: 'Due date and time for the task'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    description: 'Priority level of the task'
  },
  status: {
    type: String,
    required: true,
    enum: ['todo', 'in-progress', 'completed'],
    description: 'Status of the task'
  },
  tags: {
    type: [String],
    maxlength: 50,
    description: 'Tags associated with the task'
  }
}, {
  timestamps: true,
  versionKey: false
});

const Task = model<ITask>('Task', taskSchema);

export default Task;
