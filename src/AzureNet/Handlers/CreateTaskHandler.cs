using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Cosmos;
using System.Net;
using System.Threading.Tasks;
using AzureNet.Models;
using Microsoft.Azure.Functions.Worker;
using AzureNet.Utils;
using Microsoft.Extensions.Logging;

namespace AzureNet.Handlers
{
    public class CreateTaskHandler(CosmosClient cosmosClient)
    {
        private readonly CosmosClient _cosmosClient = cosmosClient;

        public async Task<HttpResponseData> HandleAsync(HttpRequestData req, FunctionContext context)
        {
            var logger = context.GetLogger("CreateTaskHandler");
            var dbName = Environment.GetEnvironmentVariable("CosmosDBDatabase") ?? "TaskTest";
            var containerName = Environment.GetEnvironmentVariable("CosmosDBTaskContainer") ?? "Task";

            try
            {
                var task = await req.ReadFromJsonAsync<TaskItem>();
                if (task == null || string.IsNullOrEmpty(task.Title) || string.IsNullOrEmpty(task.Status) || string.IsNullOrEmpty(task.UserId))
                {
                    var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                    await badRequest.WriteAsJsonAsync(new
                    {
                        success = false,
                        message = "Missing required fields: title, status, or userId."
                    });
                    return badRequest;
                }

                var container = _cosmosClient.GetContainer(dbName, containerName);
                var id = await CommonUtils.GetNextIdAsync(_cosmosClient, dbName, containerName, task.UserId);
                task.Id = id;

                await container.CreateItemAsync(task, new PartitionKey(task.UserId));

                var response = req.CreateResponse(HttpStatusCode.Created);
                await response.WriteAsJsonAsync(new
                {
                    success = true,
                    message = "Task created successfully!",
                    task
                });

                return response;
            }
            catch (Exception ex)
            {
                logger.LogError("Error creating task: {message}", ex.Message);

                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteAsJsonAsync(new
                {
                    success = false,
                    message = $"Error during task creation: {ex.Message}"
                });

                return errorResponse;
            }
        }
    }
}
