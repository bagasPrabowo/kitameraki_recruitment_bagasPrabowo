using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Threading.Tasks;
using AzureNet.Handlers;
using Microsoft.DurableTask.Client;
using Microsoft.Extensions.Logging;
using Microsoft.DurableTask;
using AzureNet.Models;
using System.Text.Json;
using System.Net;
using Microsoft.Azure.Cosmos;
using Microsoft.AspNetCore.Mvc;

namespace AzureNet.Controllers
{
    public class DeleteTaskController
    {
        private readonly CosmosClient _cosmosClient;

        public DeleteTaskController(CosmosClient cosmosClient)
        {
            _cosmosClient = cosmosClient;
        }

        [Function("DeleteOrchestrator")]
        public static async Task<string> RunOrchestrator(
            [OrchestrationTrigger] TaskOrchestrationContext context,
            DurableRequestInput input)
        {
            ILogger logger = context.CreateReplaySafeLogger("DeleteOrchestrator");
            logger.LogInformation("Delete Task.");

            var result = await context.CallActivityAsync<string>("TaskDelete", input);

            return result;
        }

        [Function(nameof(TaskDelete))]
        public async Task<string> TaskDelete([ActivityTrigger] DurableRequestInput input, FunctionContext context)
        {
            try
            {
                ILogger logger = context.GetLogger("TaskDelete");
                logger.LogInformation("Deleting tasks {ids}", input.Ids);

                var container = _cosmosClient.GetContainer("TaskTest", "Task");
                var query = $"SELECT * FROM c WHERE ARRAY_CONTAINS(@ids, c.id, true)";
                var queryParams = new QueryDefinition(query).WithParameter("@ids", input.Ids);

                var tasksToDelete = new List<TaskItem>();
                var iterator = container.GetItemQueryIterator<TaskItem>(queryParams, null, new QueryRequestOptions
                {
                    PartitionKey = new PartitionKey(input.UserId)
                });

                while (iterator.HasMoreResults)
                {
                    var response = await iterator.ReadNextAsync();
                    tasksToDelete.AddRange(response.Resource);
                }

                if (tasksToDelete.Count == 0)
                {
                    return "No tasks found for the provided IDs.";
                }

                var operations = new List<Task>();
                foreach (var task in tasksToDelete)
                {
                    operations.Add(container.DeleteItemAsync<TaskItem>(task.Id, new PartitionKey(task.UserId)));
                }

                await Task.WhenAll(operations);

                return "Tasks deleted successfully.";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting tasks: {ex.Message}");
                throw;
            }
        }

        [Function("DeleteTask")]
        public static async Task<HttpResponseData> HttpStart(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "bulk-delete")] HttpRequestData req,
            [DurableClient] DurableTaskClient client,
            FunctionContext context,
            [FromQuery] string UserId,
            [Microsoft.Azure.Functions.Worker.Http.FromBody] DurableRequestInput requestInput)
        {
            ILogger logger = context.GetLogger("DeleteTask");

            // var requestBody = JsonConvert.DeserializeAnonymousType(req.Body.ToString(), new { UserId = "", Ids = new string[0] });
            if (string.IsNullOrEmpty(UserId) || requestInput == null || requestInput.Ids == null || requestInput.Ids.Length == 0)
            {
                var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequest.WriteAsJsonAsync(new
                {
                    success = false,
                    message = "Missing required fields: userId and array of ids."
                });
                return badRequest;
            }

            requestInput.UserId = UserId;

            // Function input comes from the request content.
            string instanceId = await client.ScheduleNewOrchestrationInstanceAsync("DeleteOrchestrator", input: requestInput);

            logger.LogInformation("Started orchestration with ID = '{instanceId}'.", instanceId);

            var response = req.CreateResponse(HttpStatusCode.Accepted);
            await response.WriteAsJsonAsync(new
            {
                success = true,
                message = "Delete operation started.",
                instanceId,
                statusUrl = $"/api/bulk-delete/{instanceId}"
            });

            return response;
        }
    }
}
