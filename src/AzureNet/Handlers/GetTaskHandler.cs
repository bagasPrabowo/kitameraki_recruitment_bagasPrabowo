using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Functions.Worker.Http;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using AzureNet.Models;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace AzureNet.Handlers
{
    public class GetTaskHandler(CosmosClient cosmosClient)
    {
        private readonly CosmosClient _cosmosClient = cosmosClient;

        public async Task<HttpResponseData> HandleAsync(HttpRequestData req, FunctionContext context, string userId, string priority, string search, string status, string size)
        {
            var logger = context.GetLogger("GetTaskHandler");

            try
            {
                if (string.IsNullOrEmpty(userId))
                {
                    var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                    await badRequest.WriteAsJsonAsync(new
                    {
                        success = false,
                        message = "Missing required query parameter: userId."
                    });
                    return badRequest;
                }

                string query = "SELECT * FROM c";
                var parameters = new List<(string Name, string Value)>();

                if (!string.IsNullOrEmpty(status))
                {
                    query += " WHERE c.status = @status";
                    parameters.Add(("@status", status));
                }

                if (!string.IsNullOrEmpty(priority))
                {
                    query += parameters.Count > 0 ? " AND" : " WHERE";
                    query += " c.priority = @priority";
                    parameters.Add(("@priority", priority));
                }

                if (!string.IsNullOrEmpty(search))
                {
                    query += parameters.Count > 0 ? " AND" : " WHERE";
                    query += " (CONTAINS(c.title, @search) OR CONTAINS(c.description, @search))";
                    parameters.Add(("@search", search));
                }

                query += " ORDER BY c.cp_index ASC";

                var continuationToken = req.Headers.TryGetValues("x-ms-continuation", out var token) ? token.FirstOrDefault() : null;

                var container = _cosmosClient.GetContainer("TaskTest", "Task");

                var itemSize = int.TryParse(size, out var result) ? result : 10;

                var queryDefinition = new QueryDefinition(query);
                foreach (var param in parameters)
                {
                    queryDefinition.WithParameter(param.Name, param.Value);
                }

                var queryResultSetIterator = container.GetItemQueryIterator<TaskItem>(queryDefinition, continuationToken, new QueryRequestOptions
                {
                    MaxItemCount = itemSize,
                    PartitionKey = new PartitionKey(userId)
                });

                var response = await queryResultSetIterator.ReadNextAsync();

                var taskResponse = req.CreateResponse(HttpStatusCode.OK);
                await taskResponse.WriteAsJsonAsync(new
                {
                    success = true,
                    tasks = response.Resource,
                    hasMoreResults = queryResultSetIterator.HasMoreResults,
                    continuationToken = response.ContinuationToken
                });

                taskResponse.Headers.Add("x-ms-continuation", response.ContinuationToken);
                return taskResponse;
            }
            catch (Exception ex)
            {
                logger.LogError("Error fetching tasks: {message}", ex.Message);

                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteAsJsonAsync(new
                {
                    success = false,
                    message = $"Error during fetch: {ex.Message}"
                });
                return errorResponse;
            }
        }
    }
}
