const df = require("durable-functions");

module.exports = function* (context) {
    const input = context.df.getInput();
    const { userId, ids } = input;

    if (!userId || !Array.isArray(ids) || ids.length === 0) {
        return { success: false, message: "Missing required fields: userId and array of ids." };
    }

    const results = [];
    for(const id of ids) {
        results.push(yield context.df.callActivity("deleteT", { userId, id }));
    }

    return results;
};