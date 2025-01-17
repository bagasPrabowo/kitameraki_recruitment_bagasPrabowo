using Microsoft.Azure.Cosmos;
using AzureNet.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using AzureNet.Repositories.Interfaces;

namespace AzureNet.Repositories
{
    public class TaskRepository(CosmosClient cosmosClient, string databaseName, string containerName) : ITaskRepository
    {
        private readonly Container _container = cosmosClient.GetContainer(databaseName, containerName);

        public async Task<TaskItem> GetTaskByIdAsync(string id)
        {
            var response = await _container.ReadItemAsync<TaskItem>(id, new PartitionKey(id));
            return response.Resource;
        }

        public async Task<IEnumerable<TaskItem>> GetAllTasksAsync()
        {
            var query = _container.GetItemQueryIterator<TaskItem>();
            var results = new List<TaskItem>();
            while (query.HasMoreResults)
            {
                var response = await query.ReadNextAsync();
                results.AddRange(response);
            }
            return results;
        }

        public async Task AddTaskAsync(TaskItem task)
        {
            await _container.CreateItemAsync(task, new PartitionKey(task.Id));
        }

        public async Task UpdateTaskAsync(TaskItem task)
        {
            await _container.UpsertItemAsync(task, new PartitionKey(task.Id));
        }

        public async Task DeleteTaskAsync(string id)
        {
            await _container.DeleteItemAsync<TaskItem>(id, new PartitionKey(id));
        }
    }
}
