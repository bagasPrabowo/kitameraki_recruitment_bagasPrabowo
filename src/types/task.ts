import { Document } from 'mongoose';

export interface ITask extends Document {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    priority: string;
    status: string;
    tags: string[];
}

export interface TaskQuery {
    search?: string;
    status?: string;
    priority?: string;
    sort?: string;
    page?: string;
    limit?: string;
}