import Joi from "joi";

export const taskSchema = Joi.object({
    title: Joi.string()
        .max(100)
        .required()
        .description('Title of the task'),

    description: Joi.string()
        .max(1000)
        .optional()
        .description('Description of the task'),

    dueDate: Joi.date()
        .optional()
        .description('Due date and time for the task'),

    priority: Joi.string()
        .valid('low', 'medium', 'high')
        .optional()
        .description('Priority level of the task'),

    status: Joi.string()
        .valid('todo', 'in-progress', 'completed')
        .required()
        .description('Status of the task'),

    tags: Joi.array()
        .items(Joi.string().max(50))  // Array of strings with max length for each tag
        .optional()
        .description('Tags associated with the task')
});