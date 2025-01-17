using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Threading.Tasks;
using AzureNet.Handlers;
using System.Net;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;

namespace AzureNet.Controllers
{
    public class GetTaskController(GetTaskHandler handler)
    {
        private readonly GetTaskHandler _handler = handler;

        [Function("GetTask")]
        public async Task<HttpResponseData> RunAsync(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "task")] HttpRequestData req,
            FunctionContext context)
        {
            var userId = req.Query["userId"] ?? "";
            var priority = req.Query["priority"] ?? "";
            var search = req.Query["search"] ?? "";
            var status = req.Query["status"] ?? "";
            var size = req.Query["size"] ?? "10";

            return await _handler.HandleAsync(req, context, userId, priority, search, status, size);
        }
    }
}
