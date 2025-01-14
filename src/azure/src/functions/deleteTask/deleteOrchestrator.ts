import { OrchestrationContext, OrchestrationHandler } from "durable-functions";

const deleteOrchestrator: OrchestrationHandler = function* (context: OrchestrationContext) {
    const input = context.df.getInput<{ userId: string, ids: string[] }>();
    const { userId, ids } = input;

    context.log(`Calling taskDelete with userId: ${userId}, id: ${ids}`);
    const result = yield context.df.callActivity("taskDelete", { userId, ids });

    return result;
};

export default deleteOrchestrator;