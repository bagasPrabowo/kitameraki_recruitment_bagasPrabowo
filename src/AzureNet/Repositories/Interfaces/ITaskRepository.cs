using System.Collections.Generic;
using System.Threading.Tasks;
using AzureNet.Models;

namespace AzureNet.Repositories.Interfaces
{
    public interface ITaskRepository
    {
        Task<TaskItem> GetTaskByIdAsync(string id);
        Task<IEnumerable<TaskItem>> GetAllTasksAsync();
        Task AddTaskAsync(TaskItem task);
        Task UpdateTaskAsync(TaskItem task);
        Task DeleteTaskAsync(string id);
    }
}
