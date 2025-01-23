using Newtonsoft.Json;

namespace AzureNet.Models;

public class ChangeLogData
{
    [JsonProperty("id")]
    public string? Id { get; set; }
    [JsonProperty("action")]
    public string? Action { get; set; }

    [JsonProperty("changes")]
    public List<DataChanges>? Changes { set; get; }

    [JsonProperty("oldTask")]
    public required TaskItem OldTask { get; set; }

    [JsonProperty("timestamp")]
    public required string Timestamp { get; set; }

    [JsonProperty("userId")]
    public required string UserId { get; set; }
}

public class DataChanges
{
    [JsonProperty("path")]
    public required string Path { get; set; }

    [JsonProperty("newValue")]
    public required string NewValue { get; set; }
}
