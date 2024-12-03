import { Response, Request } from "express";
import { ITask, TaskQuery } from "../types/task";
import { ApiResponse, BulkDeleteResponse } from "../types/response";
import Task from "../models/task";
import { asyncHandler } from "../utils";

// Build filter for task
const buildFilters = (query: TaskQuery): Record<string, any> => {
    const filters: Record<string, any> = {};
    if (query.status) filters.status = query.status;
    if (query.priority) filters.priority = query.priority;
    if (query.search) filters.$or = [
        { title: new RegExp(query.search, "i") },
        { description: new RegExp(query.search, "i") },
    ];
    return filters;
};

const getTask = asyncHandler(async (req: Request, res: Response<ApiResponse<ITask[]>>) => {
    const { search, status, sort, priority, page = 1, limit = 10 } = req.query;

    const filters = buildFilters({
        search: search as string,
        status: status as string,
        priority: priority as string
    });
    const sortBy = sort ? (sort as string).split(",").join(" ") : "-createdAt";
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [tasks, totalCount] = await Promise.all([
        Task.find(filters).sort(sortBy).limit(parseInt(limit as string)).skip(skip),
        Task.countDocuments(filters),
    ]);

    return res.status(200).json({
        message: "Success to fetch tasks",
        data: tasks,
        meta: {
            totalCount,
            page: parseInt(page as string),
            totalPages: Math.ceil(totalCount / parseInt(limit as string))
        },
    });
});

const postTask = asyncHandler(async (req: Request, res: Response<ApiResponse<ITask>>) => {
    const body = req.body as Pick<ITask, 'title' | 'description' | 'status' | 'tags' | 'dueDate' | 'priority'>
    const task: ITask = await Task.create(body);
    return res.status(201).json({ message: 'Task successfully added', data: task });
});

const updateTask = asyncHandler(async (req: Request, res: Response<ApiResponse<ITask>>) => {
    const { id } = req.params;
    const updatedTask: ITask | null = await Task.findOneAndUpdate({ id }, req.body, { new: true, runValidators: true });
    if (!updatedTask) {
        return res.status(404).json({ message: 'Task not found' });
    }

    return res.status(200).json({ message: 'Task successfully updated', data: updatedTask })
});

const deleteTask = asyncHandler(async (req: Request, res: Response<ApiResponse<ITask>>) => {
    const { id } = req.params;
    const deletedTask = await Task.findOneAndDelete({ id });
    if (!deletedTask) {
        return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted', data: deletedTask })
});

const bulkDelete = asyncHandler(async (req: Request, res: Response<ApiResponse<BulkDeleteResponse>>) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Please provide an array of task IDs" });
    }

    const results: BulkDeleteResponse = { deleted: [], failed: [] };

    // Process each ID individually
    await Promise.allSettled(
        ids.map(async (id) => {
            try {
                const deletedTask = await Task.findOneAndDelete({ id });
                if (deletedTask) {
                    results.deleted.push(id);
                } else {
                    results.failed.push({ id, error: "Task not found" });
                }
            } catch (error: any) {
                results.failed.push({ id, error: error.message });
            }
        })
    );

    res.status(200).json({
        message: "Bulk delete task completed",
        data: results,
    });
});

const getTaskById = asyncHandler(async (req: Request, res: Response<ApiResponse<ITask>>) => {
    const task: ITask | null = await Task.findOne({ id: req.params.id });
    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ message: 'Success to get detail task', data: task });
})

export { getTask, postTask, updateTask, deleteTask, bulkDelete, getTaskById };