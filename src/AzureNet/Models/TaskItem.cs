using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace AzureNet.Models
{
    public class TaskItem
    {
        [JsonProperty("id")]
        public string? Id { get; set; }

        [JsonProperty("title")]
        public string? Title { get; set; }

        [JsonProperty("description")]
        public string? Description { get; set; } = "";

        [JsonProperty("dueDate")]
        public DateTime? DueDate { get; set; }

        [JsonProperty("priority")]
        [RegularExpression("low|medium|high", ErrorMessage = "Priority must be 'low', 'medium', or 'high'.")]
        public string Priority { get; set; } = "medium";

        [JsonProperty("status")]
        [Required]
        [RegularExpression("todo|in-progress|completed", ErrorMessage = "Status must be 'todo', 'in-progress', or 'completed'.")]
        public string Status { get; set; } = "todo";

        [JsonProperty("tags")]
        [MaxLength(50, ErrorMessage = "Tags cannot exceed 50 characters in length.")]
        public List<string> Tags { get; set; } = [];

        [JsonProperty("userId")]
        public string? UserId { get; set; }
    }
}