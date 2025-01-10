const df = require("durable-functions");

module.exports = async function (request, context) {
    const instanceId = request.params.instanceId;

    if (!instanceId) {
        return {
            status: 400,
            jsonBody: { success: false, message: "Missing instanceId." }
        };
    }

    const client = df.getClient(context);
    const status = await client.getStatus(instanceId);

    if (!status) {
        return {
            status: 404,
            jsonBody: { success: false, message: "No such instance found." }
        };
    }

    return {
        status: 200,
        jsonBody: { success: true, runtimeStatus: status.runtimeStatus, output: status.output }
    };
};
