using Microsoft.Extensions.Hosting;

internal class Program
{
    private static void Main(string[] args)
    {
        var host = new HostBuilder()
        .ConfigureFunctionsWebApplication()
        .ConfigureServices((context, services) =>
        {
            // Call Startup class for additional service configuration
            Startup.ConfigureServices(services);
        })
        .Build();

        host.Run();
    }
}