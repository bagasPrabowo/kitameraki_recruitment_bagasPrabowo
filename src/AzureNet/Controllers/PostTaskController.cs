using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Threading.Tasks;
using AzureNet.Handlers;

namespace AzureNet.Controllers
{
    public class CreateTaskController
    {
        private readonly CreateTaskHandler _handler;

        public CreateTaskController(CreateTaskHandler handler)
        {
            _handler = handler;
        }

        [Function("CreateTask")]
        public async Task<HttpResponseData> RunAsync(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "task")] HttpRequestData req,
            FunctionContext context)
        {
            return await _handler.HandleAsync(req, context);
        }
    }
}
