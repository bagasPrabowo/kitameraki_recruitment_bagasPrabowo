import { Router } from "express";
import {
    bulkDelete,
    deleteTask,
    getTask,
    getTaskById,
    postTask,
    updateTask
} from "../controllers/task";
import { validate } from "../middleware/validate";
import { taskSchema } from "../validations/task";

const router: Router = Router();

/// Annotations used for Swagger OpenAPI Documentation
/**
 * A Task Type
 * @typedef {object} Task
 * @property {string} id.required - Unique ID of the task
 * @property {string} title.required - Title of the task
 * @property {string} description - Description of the task
 * @property {string} status.required - Status of the task (todo|in-progress|completed)
 * @property {string} priority - Priority of the task (low|medium|high)
 * @property {string[]} tags - Tags associated with the task
 * @property {string} dueDate - Due date and time for the task
 */

/**
 * A Meta type
 * @typedef {object} Meta
 * @property {number} totalCount - Total count of items (optional, for paginated responses)
 * @property {number} page - Current page (optional, for paginated responses)
 * @property {number} totalPages - Total number of pages (optional, for paginated responses)
*/

/**
 * An ApiResponse Multiple Task Type
 * @typedef {object} ApiResponseTasks
 * @property {string} message.required - A message describing the outcome of the operation
 * @property {Task[]} data - The data returned by the API (could be an array or object depending on the route)
 * @property {Meta} meta - Metadata for pagination (optional)
 */

/**
 * A Single Task Type
 * @typedef {object} ApiResponseTask
 * @property {string} message.required - A message describing the outcome of the operation
 * @property {Task} data.required - Single task details
 */

/**
 * A Failed Delete Type
 * @typedef {object} Failed
 * @property {string} id.required - The ID of the task that failed to delete
 * @property {string} error.required - The error message
 */

/**
 * A BulkDeleteResponse Type
 * @typedef {object} BulkDeleteResponse
 * @property {string[]} deleted - List of successfully deleted task IDs
 * @property {Failed[]} failed - List of tasks that failed to delete with error message
 */

/**
 * A Bulk Delete Type
 * @typedef {object} ApiResponseBulkDelete
 * @property {string} message.required - A message describing the outcome of the operation
 * @property {BulkDeleteResponse} data.required - Bulk delete response
 */

/**
 * A Not Found Type
 * @typedef {object} ApiResponseNotFound
 * @property {string} message.required - A message describing the outcome of the operation
 */

/**
 * A Validation Error Type
 * @typedef {object} ValidationError
 * @property {string} message.required - A message describing the validation error
 * @property {string} path.required - The path of the field that failed validation
 */

/**
 * A Validation Error Response Type
 * @typedef {object} ApiResponseValidationError
 * @property {string} message.required - A message describing the validation error
 * @property {ValidationError[]} details.required - List of validation errors
 */

/**
 * GET /api/tasks
 * @summary Get all tasks
 * @tags Tasks
 * @param {string} search.query - Search term for tasks
 * @param {string} status.query - Filter by task status (e.g. todo, in-progress, completed)
 * @param {string} sort.query - Sort tasks by a field (e.g. createdAt)
 * @param {string} priority.query - Filter by task priority (low|medium|high)
 * @param {number} page.query - Page number for pagination (default: 1)
 * @param {number} limit.query - Number of tasks per page (default: 10)
 * @return {ApiResponseTasks} 200 - List of tasks
 */
router.get('/', getTask);

/**
 * POST /api/tasks
 * @summary Create a new task
 * @tags Tasks
 * @param {Task} request.body.required - Task details
 * @return {ApiResponseTask} 201 - Task successfully created
 * @return {ApiResponseValidationError} 400 - Validation error
 */
router.post('/', validate(taskSchema), postTask);

/**
 * PUT /api/tasks/{id}
 * @summary Update an existing task by ID
 * @tags Tasks
 * @param {string} id.path.required - Task ID
 * @param {Task} request.body.required - Updated task details
 * @return {ApiResponseTask} 200 - Task successfully updated
 * @return {ApiResponseNotFound} 404 - Task not found
 * @return {ApiResponseValidationError} 400 - Validation error
 */
router.put('/:id', validate(taskSchema), updateTask);

/**
 * DELETE /api/tasks/bulk-delete
 * @summary Bulk delete tasks
 * @tags Tasks
 * @param {array<string>} request.body.ids.required - List of task IDs to delete
 * @return {ApiResponseTask} 200 - Bulk delete response with deleted task IDs
 * @return {ApiResponseBulkDelete} 400 - Invalid input (no IDs provided)
 */
router.delete('/bulk-delete', bulkDelete);

/**
 * DELETE /api/tasks/{id}
 * @summary Delete a task by ID
 * @tags Tasks
 * @param {string} id.path.required - Task ID
 * @return {ApiResponseTask} 200 - Task successfully deleted
 * @return {ApiResponseNotFound} 404 - Task not found
 */
router.delete('/:id', deleteTask);

/**
 * GET /api/tasks/{id}
 * @summary Get a task by ID
 * @tags Tasks
 * @param {string} id.path.required - Task ID
 * @return {ApiResponseTask} 200 - Task details
 * @return {ApiResponseNotFound} 404 - Task not found
 */
router.get('/:id', getTaskById);

export default router;