using System.Net;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Azure.Functions.Worker;
using Microsoft.DurableTask.Client;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace AzureNet.Handlers;
public class DeleteStatusHandler()
{
    public async Task<HttpResponseData> HandleAsync([DurableClient] DurableTaskClient client, HttpRequestData req, string instanceId, FunctionContext context)
    {
        var logger = context.GetLogger("DeleteStatusHandler");

        if (string.IsNullOrEmpty(instanceId))
        {
            var errorResponse = req.CreateResponse(HttpStatusCode.BadRequest);
            await errorResponse.WriteAsJsonAsync(new
            {
                success = false,
                message = "Missing instanceId."
            });
            return errorResponse;
        }

        try
        {
            var clientInstance = await client.GetInstanceAsync(instanceId, true);

            if (clientInstance == null)
            {
                var notFoundResponse = req.CreateResponse(HttpStatusCode.NotFound);
                await notFoundResponse.WriteAsJsonAsync(new
                {
                    success = false,
                    message = "No such instance found."
                });
                return notFoundResponse;
            }

            var successResponse = req.CreateResponse(HttpStatusCode.OK);
            await successResponse.WriteAsJsonAsync(new
            {
                success = true,
                runtimeStatus = clientInstance.RuntimeStatus.ToString(),
                output = clientInstance.SerializedOutput?.Replace("\"", string.Empty),
            });
            return successResponse;
        }
        catch (Exception ex)
        {
            logger.LogError("Error retrieving status: {message}", ex.Message);

            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new
            {
                success = false,
                error = ex.Message,
                timestamp = DateTime.UtcNow
            });
            return errorResponse;
        }
    }
}
