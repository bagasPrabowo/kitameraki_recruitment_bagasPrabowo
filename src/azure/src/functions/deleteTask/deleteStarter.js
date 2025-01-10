const df = require("durable-functions");

module.exports = async function (request, context, orchName) {
    const { userId } = request.params;
    const { ids } = await request.json();

    if (!userId || !Array.isArray(ids) || ids.length === 0) {
        return {
            status: 400,
            jsonBody: { success: false, message: "Missing required fields: userId and array of ids." }
        };
    }

    const client = df.getClient(context);
    const instanceId = await client.startNew(orchName, { input: { userId, ids } });
    return {
        status: 202,
        jsonBody: {
            success: true,
            message: "Delete operation started.",
            instanceId,
            statusUrl: `/api/deleteStatus/${instanceId}`
        }
    };
};
