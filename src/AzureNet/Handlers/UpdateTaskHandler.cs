using System.Net;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Cosmos;
using System.Threading.Tasks;
using AzureNet.Models;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace AzureNet.Handlers
{
    public class UpdateTaskHandler(CosmosClient cosmosClient)
    {
        private readonly CosmosClient _cosmosClient = cosmosClient;

        public async Task<HttpResponseData> HandleAsync(HttpRequestData req, FunctionContext context, string id)
        {
            var logger = context.GetLogger("UpdateTaskHandler");

            try
            {
                var requestBody = await JsonSerializer.DeserializeAsync<TaskItem>(req.Body);
                if (requestBody == null || string.IsNullOrEmpty(requestBody.UserId) || requestBody == null)
                {
                    var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                    await badRequest.WriteAsJsonAsync(new
                    {
                        success = false,
                        message = "Missing required fields: id, userId, or updated field."
                    });
                    return badRequest;
                }

                var container = _cosmosClient.GetContainer("TaskTest", "Task");

                // Fetch the current resource
                var existingTask = await container.ReadItemAsync<TaskItem>(id, new PartitionKey(requestBody.UserId));
                if (existingTask == null)
                {
                    var notFound = req.CreateResponse(HttpStatusCode.NotFound);
                    await notFound.WriteAsJsonAsync(new
                    {
                        success = false,
                        message = "Task not found."
                    });
                    return notFound;
                }

                // Create patch operations
                var patchOperations = new List<PatchOperation>();
                foreach (var update in requestBody.GetType().GetProperties())
                {
                    var value = update.GetValue(requestBody);
                    if (value != null)
                    {
                        patchOperations.Add(PatchOperation.Set($"/{update.Name}", value));
                    }
                }

                // Apply patch operations to the item
                var updatedTask = await container.PatchItemAsync<TaskItem>(id, new PartitionKey(requestBody.UserId), patchOperations);

                var successResponse = req.CreateResponse(HttpStatusCode.OK);
                await successResponse.WriteAsJsonAsync(new
                {
                    success = true,
                    message = "Task updated successfully!",
                    task = updatedTask.Resource
                });

                return successResponse;
            }
            catch (Exception ex)
            {
                logger.LogError("Error updating task: {message}", ex.Message);

                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                await errorResponse.WriteAsJsonAsync(new
                {
                    success = false,
                    message = $"Error during update: {ex.Message}"
                });
                return errorResponse;
            }
        }
    }
}
