using Microsoft.Extensions.DependencyInjection;
using Microsoft.Azure.Cosmos;
using AzureNet.Utils;
using AzureNet.Handlers;
using AzureNet.Controllers;

public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // Retrieve the Cosmos DB connection string from local.settings.json or environment variables
        var cosmosConnectionString = Environment.GetEnvironmentVariable("CosmosDBEndpoint");

        if (string.IsNullOrEmpty(cosmosConnectionString))
        {
            throw new InvalidOperationException("Cosmos DB connection string is missing in the configuration.");
        }

        // Register CosmosClient as a singleton (to be reused)
        CosmosClientOptions options = new() { AllowBulkExecution = true };
        services.AddSingleton(_ => new CosmosClient(cosmosConnectionString, options));

        // Register DatabaseUtils for Cosmos DB operations
        services.AddScoped<CommonUtils>();

        // Register your handler services
        services.AddScoped<CreateTaskHandler>();
        services.AddScoped<GetTaskHandler>();
        services.AddScoped<UpdateTaskHandler>();
        services.AddScoped<DeleteStatusHandler>();
    }
}
