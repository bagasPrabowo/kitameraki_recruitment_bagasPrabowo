using Microsoft.Azure.Cosmos;
using System.Linq;
using System.Threading.Tasks;

namespace AzureNet.Utils
{
    public class CommonUtils
    {
        private readonly CosmosClient _cosmosClient;

        public CommonUtils(CosmosClient cosmosClient)
        {
            _cosmosClient = cosmosClient;
        }

        public async Task<string> GetNextIdAsync(string userId)
        {
            var container = _cosmosClient.GetContainer("TaskTest", "Task");

            // Query the most recent cp_index for the user
            var query = "SELECT TOP 1 c.cp_index FROM c ORDER BY c.cp_index DESC";
            var queryDefinition = new QueryDefinition(query).WithParameter("@userId", userId);

            var queryResultSetIterator = container.GetItemQueryIterator<dynamic>(queryDefinition, requestOptions: new QueryRequestOptions
            {
                PartitionKey = new PartitionKey(userId)
            });

            var result = await queryResultSetIterator.ReadNextAsync();

            if (result.Count != 0)
            {
                // Increment the cp_index and return it as a string
                var cpIndex = result.First().cp_index;
                return (cpIndex + 1).ToString();
            }
            else
            {
                // If no tasks found, start with '1'
                return "1";
            }
        }
    }
}
