using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Threading.Tasks;
using AzureNet.Handlers;
using Microsoft.DurableTask.Client;

namespace AzureNet.Controllers
{
    public class DeleteStatusFunction(DeleteStatusHandler handler)
    {
        private readonly DeleteStatusHandler _handler = handler;

        [Function("DeleteStatus")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "bulk-delete/{instanceId}")] HttpRequestData req,
            [DurableClient] DurableTaskClient client,
            string instanceId,
            FunctionContext context)
        {
            return await _handler.HandleAsync(client, req, instanceId, context);
        }
    }
}
