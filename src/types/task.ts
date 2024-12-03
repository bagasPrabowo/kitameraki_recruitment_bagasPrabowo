import {Document} from 'mongoose';

export interface ITask extends Document {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    priority: string;
    status: string;
    tags: string[];
}