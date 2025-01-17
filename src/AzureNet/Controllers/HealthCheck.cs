using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace AzureNet.Controllers
{
    public class HealthCheck(ILogger<HealthCheck> logger)
    {
        private readonly ILogger<HealthCheck> _logger = logger;

        [Function("HealthCheck")]
        public IActionResult Run([HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequest req, [FromBody] string name)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");
            return new OkObjectResult($"Hello {name ?? "World"}, Welcome to Azure Functions!");
        }
    }
}
