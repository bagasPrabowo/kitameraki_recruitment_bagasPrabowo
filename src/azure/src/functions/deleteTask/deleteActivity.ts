import { DeleteOperationInput } from "@azure/cosmos";
import dbConfig from "../../config/database";
import ITask from "../../models/taskDao";

export default async (input: { userId: string, ids: string[] }) => {
    const { userId, ids } = input;

    try {
        const container = await dbConfig();

        if (!userId || !Array.isArray(ids) || ids.length === 0) {
            return { success: false, message: "Missing required fields: userId and array of ids." };
        }

        let query = `SELECT * FROM c WHERE ARRAY_CONTAINS(@ids, c.id, true)`;
        let parameters = [
            { name: '@ids', value: ids }
        ];

        // Query for the tasks to be deleted
        const { resources: tasksToDelete } = await container.items
            .query({ query, parameters }, { partitionKey: userId })
            .fetchAll();

        if (tasksToDelete.length < 1) {
            return {
                status: 404,
                jsonBody: {
                    success: false,
                    message: "No tasks found for the provided ids."
                }
            };
        }

        /// Delete with bulk operation
        const operations: DeleteOperationInput[] = tasksToDelete.map((task: ITask) => {
            return {
                operationType: 'Delete',
                partitionKey: task.userId,
                id: task.id
            };
        });

        await container.items.bulk(operations);

        return {
            status: 200,
            jsonBody: {
                success: true,
                message: `Tasks deleted successfully.`
            }
        };
    } catch (error) {
        return {
            status: 500,
            jsonBody: {
                success: false,
                message: `Error during deletion: ${error}`
            }
        };
    }
};
