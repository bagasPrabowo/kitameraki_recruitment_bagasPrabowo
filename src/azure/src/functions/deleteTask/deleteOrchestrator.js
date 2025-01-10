module.exports = function* (context) {
    const input = context.df.getInput();
    const { userId, ids } = input;

    if (!userId || !Array.isArray(ids) || ids.length === 0) {
        return { success: false, message: "Missing required fields: userId and array of ids." };
    }

    const results = [];
    for (const id of ids) {
        context.log(`Calling taskDelete with userId: ${userId}, id: ${id}`);
        const result = yield context.df.callActivity("taskDelete", { userId, id });
        results.push(result);
    }

    return results;
};