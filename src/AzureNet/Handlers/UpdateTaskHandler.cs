using System.Net;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Cosmos;
using System.Threading.Tasks;
using AzureNet.Models;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using AzureNet.Utils;
using Azure.Messaging;
using Azure.Messaging.EventGrid;
using Newtonsoft.Json;

namespace AzureNet.Handlers
{
    public class UpdateTaskHandler(
        CosmosClient cosmosClient,
        EventGridPublisherClient eventGridClient
    )
    {
        private readonly CosmosClient _cosmosClient = cosmosClient;
        private readonly EventGridPublisherClient _eventGridClient = eventGridClient;

        public async Task<HttpResponseData> HandleAsync(HttpRequestData req, FunctionContext context, string id)
        {
            var logger = context.GetLogger("UpdateTaskHandler");

            try
            {
                var requestBody = await System.Text.Json.JsonSerializer.DeserializeAsync<TaskItem>(req.Body);
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
                List<DataChanges> dataChanges = [];
                foreach (var update in requestBody.GetType().GetProperties())
                {
                    var value = update.GetValue(requestBody);
                    if (value != null)
                    {
                        var stringValue = JsonConvert.SerializeObject(value);
                        dataChanges.Add(new DataChanges() { Path = update.Name, NewValue = stringValue });
                        patchOperations.Add(PatchOperation.Set($"/{update.Name}", value));
                    }
                }

                // Apply patch operations to the item
                var updatedTask = await container.PatchItemAsync<TaskItem>(id, new PartitionKey(requestBody.UserId), patchOperations);

                var logTask = new ChangeLogData()
                {
                    OldTask = existingTask.Resource,
                    Timestamp = DateTime.UtcNow.ToString("O"),
                    UserId = requestBody.UserId,
                    Changes = [],
                    Action = "update"
                };
                var data = CommonUtils.SerializeObject(logTask);
                var cloudEventData = new CloudEvent($"/task/{id}", "net.task-test-app.azurewebsites.Update.Task", data);

                await _eventGridClient.SendEventAsync(cloudEventData);

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
