class Task {
    constructor(id, title, description, dueDate, priority, status, tags, userId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.status = status;
        this.tags = tags || [];
        this.userId = userId;
        this.timestamp = new Date();
    }
}

module.exports = Task;