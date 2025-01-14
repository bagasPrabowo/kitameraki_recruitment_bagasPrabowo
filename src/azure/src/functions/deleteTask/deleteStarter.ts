import * as df from 'durable-functions';
import deleteOrchestrator from './deleteOrchestrator';
import deleteActivity from './deleteActivity';
import { HttpRequest, InvocationContext } from "@azure/functions";

df.app.orchestration('deleteOrchestrator', deleteOrchestrator);

df.app.activity('taskDelete', {
    handler: deleteActivity
});

export default async function (request: HttpRequest, context: InvocationContext, orchName: string) {
    const { userId } = request.params;
    const { ids } = await request.json() as { ids: string[] };

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
            statusUrl: `/api/bulk-delete/${instanceId}`
        }
    };
};
