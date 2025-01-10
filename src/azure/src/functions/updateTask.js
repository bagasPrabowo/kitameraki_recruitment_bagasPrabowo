module.exports = async (request, context, container) => {
    const { id, userId, ...updates } = await request.json();

    if (!id || !userId || !updates || typeof updates !== 'object') {
        return {
            status: 400,
            jsonBody: {
                success: false,
                message: 'Missing required fields: id, userId, or updated field.'
            }
        };
    }

    // Fetch the current resource
    const { resource: existingTask } = await container.item(id, userId).read();
    if (!existingTask) {
        return {
            status: 404,
            jsonBody: {
                success: false,
                message: 'Task not found.'
            }
        };
    }

    const patchOperations = Object.entries(updates).map(([key, value]) => ({
        op: "set",
        path: `/${key}`,
        value
    }));

    const { resource: updatedTask } = await container
        .item(id, userId)
        .patch(patchOperations);

    return {
        status: 200,
        jsonBody: {
            success: true,
            message: 'Task updated successfully!',
            task: updatedTask
        }
    };
}