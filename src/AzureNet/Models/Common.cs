namespace AzureNet.Models;
public class DurableRequestInput(string UserId, string[] Ids)
{
    public string? UserId { get; set; } = UserId;
    public string[] Ids { get; set; } = Ids;
}