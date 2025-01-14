import { Container, SqlQuerySpec } from "@azure/cosmos";
import { HttpRequest, HttpResponse, HttpResponseInit, InvocationContext } from "@azure/functions";

export default async (request: HttpRequest, context:InvocationContext, container: Container) => {
    const { userId, priority, search, status, size = '10' } = request.params;
    const continueToken = request.headers.get('x-ms-continuation') ? request.headers.get('x-ms-continuation')! : undefined;
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
    const itemSize = parseInt(size);

    const { resources: tasks, continuationToken, hasMoreResults } = await container.items
        .query(
            { query, parameters } as SqlQuerySpec,
            {
                partitionKey: userId,
                maxItemCount: itemSize,
                continuationToken: continueToken,
            }
        )
        .fetchNext();

    const response = new HttpResponse ({
        status: 200,
        jsonBody: {
            success: true,
            tasks: tasks,
            hasMoreResults: hasMoreResults,
            continuationToken: continuationToken
        }
    });
    response.headers.set(
        "x-ms-continuation", (continuationToken),
    )

    return response;
}