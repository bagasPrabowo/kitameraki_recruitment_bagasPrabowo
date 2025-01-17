using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Threading.Tasks;
using AzureNet.Handlers;

namespace AzureNet.Controllers
{
    public class UpdateTaskController(UpdateTaskHandler handler)
    {
        private readonly UpdateTaskHandler _handler = handler;

        [Function("UpdateTask")]
        public async Task<HttpResponseData> RunAsync(
            [HttpTrigger(AuthorizationLevel.Anonymous, "patch", Route = "task/{id}")] HttpRequestData req,
            string id,
            FunctionContext context)
        {
            return await _handler.HandleAsync(req, context, id);
        }
    }
}
