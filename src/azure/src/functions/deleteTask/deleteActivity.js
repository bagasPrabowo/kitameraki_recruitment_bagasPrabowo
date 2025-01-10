const { dbConfig } = require("../../config/database");

module.exports = async (input) => {
    const { userId, id } = input;

    try {
        const container = await dbConfig();

        // Simulate a delay to test polling
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        await delay(15000); // 15 seconds

        const { resource: tasksToDelete } = await container.item(id, userId).read();

        if (!tasksToDelete) {
            return {
                status: 404,
                jsonBody: {
                    success: false,
                    message: "No tasks found for the provided ids."
                }
            };
        }

        await container.item(id, userId).delete();

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
                message: `Error during deletion: ${error.message}`
            }
        };
    }
};
