import { Container } from "@azure/cosmos";
import { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

import ITask from '../models/taskDao';
import getNextId from '../utils/index';

export default async (request: HttpRequest, context: InvocationContext, container: Container): Promise<HttpResponseInit> => {
    const { title, description, dueDate, priority, status, tags, userId } = await request.json() as ITask;

    if (!title || !status || !userId) {
        return <HttpResponseInit>{
            status: 400,
            jsonBody: {
                success: false,
                message: 'Missing required fields: title, status, or userId.'
            }
        };
    }

    const id = await getNextId(userId);

    const task = new ITask(
        id,
        title,
        description || '',
        dueDate ? new Date(dueDate) : null,
        priority || 'medium',
        status,
        tags || [],
        userId
    );

    const { resource: createdTask } = await container.items.create(task);

    if (!createdTask) {
        return {
            status: 500,
            jsonBody: {
                success: false,
                message: 'Task failed to create!',
            }
        }
    }

    context.log(`Task created with id: ${createdTask.id}`);

    return {
        status: 201,
        jsonBody: {
            success: true,
            message: 'Task created successfully!',
            task: createdTask
        }
    };
};
