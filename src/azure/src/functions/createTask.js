const Task = require('../models/taskDao');
const { getNextId } = require('../utils/index');

module.exports = async (request, context, container) => {
    const { title, description, dueDate, priority, status, tags, userId } = await request.json();

    if (!title || !status || !userId) {
        return {
            status: 400,
            jsonBody: {
                success: false,
                message: 'Missing required fields: title, status, or userId.'
            }
        };
    }

    const id = await getNextId(userId);

    const task = new Task(
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
