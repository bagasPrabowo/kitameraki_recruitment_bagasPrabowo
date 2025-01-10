module.exports = async (request, context, container) => {
    const { userId, priority, search, status, size = 10 } = request.params;
    const continueToken = request.headers.get('x-ms-continuation');
    if (!userId) {
        return {
            status: 400,
            jsonBody: {
                success: false,
                message: 'Missing required query parameter: userId.'
            }
        };
    }

    let query = `SELECT * FROM c`;
    let parameters = []

    if (status) {
        query += ` WHERE c.status = @status`;
        parameters.push({ name: '@status', value: status });
    }

    if (priority) {
        query += parameters.length > 0 ? ` AND` : ` WHERE`;
        query += ` c.priority = @priority`;
        parameters.push({ name: '@priority', value: priority });
    }

    if (search) {
        query += parameters.length > 0 ? ` AND` : ` WHERE`;
        query += ` (CONTAINS(c.title, @search) OR CONTAINS(c.description, @search))`;
        parameters.push({ name: '@search', value: search });
    }

    query += ' ORDER BY c.cp_index ASC';

    const { resources: tasks, continuationToken, hasMoreResults } = await container.items
        .query(
            { query, parameters },
            {
                partitionKey: userId,
                maxItemCount: size,
                continuationToken: continueToken,
            }
        )
        .fetchNext();

    return {
        status: 200,
        headers: {
            "x-ms-continuation": continuationToken || null,
        },
        jsonBody: {
            success: true,
            tasks: tasks,
            hasMoreResults: hasMoreResults,
            continuationToken: continuationToken
        }
    };
}