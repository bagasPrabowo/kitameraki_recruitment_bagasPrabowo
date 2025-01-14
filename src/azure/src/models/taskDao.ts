class ITask {
    id: string
    title: string
    description: string
    dueDate: Date | null
    priority: string
    status: string
    tags: string[]
    userId: string
    timestamp: Date

    constructor(
        id: string,
        title: string,
        description: string,
        dueDate: Date | null,
        priority: string,
        status: string,
        tags: string[],
        userId: string
    ) {
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

export default ITask;