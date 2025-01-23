// Default URL for triggering event grid function in the local environment.
// http://localhost:7071/runtime/webhooks/EventGrid?functionName={functionname}

using System;
using Azure;
using Azure.Messaging;
using Azure.Messaging.EventGrid;
using AzureNet.Models;
using AzureNet.Utils;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace AzureNet.Controllers;

public class TaskActivityLog(ILogger<TaskActivityLog> logger, CosmosClient cosmosClient)
{
    private readonly ILogger<TaskActivityLog> _logger = logger;
    private readonly CosmosClient _cosmosClient = cosmosClient;

    [Function(nameof(TaskActivityLog))]
    public async Task Run([EventGridTrigger] CloudEvent cloudEvent)
    {
        var dbName = Environment.GetEnvironmentVariable("CosmosDBDatabase") ?? "TaskTest";
        var containerName = Environment.GetEnvironmentVariable("CosmosDBLogContainer") ?? "ChangeLog";

        try
        {
            if (cloudEvent.Data == null)
            {
                _logger.LogError("[Error] Event Data is null");
                return;
            }

            var data = CommonUtils.ConvertCloudEventData<ChangeLogData>(cloudEvent.Data);

            if (data == null)
            {
                _logger.LogError("[Error] Change Log Data is null");
                return;
            }

            var userId = data.OldTask.UserId ?? "";
            var logId = await CommonUtils.GetNextIdAsync(_cosmosClient, dbName, containerName, userId);

            data.Id = logId;
            data.Timestamp = DateTime.UtcNow.ToString("O");
            data.UserId = userId;

            var container = _cosmosClient.GetContainer(dbName, containerName);

            switch (cloudEvent.Type)
            {
                case Constant.Update:
                    await container.CreateItemAsync(data, new PartitionKey(userId));
                    _logger.LogInformation(
                        "Event type: {type}, Event subject: {subject}",
                        cloudEvent.Type,
                        cloudEvent.Subject
                    );
                    break;
                case Constant.Create:
                    await container.CreateItemAsync(data, new PartitionKey(userId));
                    _logger.LogInformation(
                        "Event type: {type}, Event subject: {subject}",
                        cloudEvent.Type,
                        cloudEvent.Subject
                    );
                    break;
                case Constant.Delete:
                    await container.CreateItemAsync(data, new PartitionKey(userId));
                    _logger.LogInformation(
                        "Event type: {type}, Event subject: {subject}",
                        cloudEvent.Type,
                        cloudEvent.Subject
                    );
                    break;
                default:
                    _logger.LogWarning(
                        "[Warning] Unhandled Event Type: {type}, ID: {id}",
                        cloudEvent.Type,
                        cloudEvent.Id
                    );
                    break;
            }

            _logger.LogInformation(
                "[Success] Event Successfull with Type: {type} ID: {id}",
                cloudEvent.Type,
                cloudEvent.Id
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(
                "[Error] Event Error with Type: {type} ID: {id}, Message: {message}",
                cloudEvent.Type,
                cloudEvent.Id,
                ex.Message
            );
            throw;
        }
    }
}

