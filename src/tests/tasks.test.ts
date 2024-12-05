import express from "express";
import request from "supertest";
import taskRoutes from "../routes/task";
import Task from "../models/task";
import { generateToken } from "../utils";
import jwt from "jsonwebtoken";
import Blacklist from "../models/blacklist";
import User from "../models/user";

jest.mock("../models/task");
jest.mock("../models/blacklist");
jest.mock("../models/user");
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue('test-token'),
  verify: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use("/api/tasks", taskRoutes);

const mockUserId = "mock-user-id";
const mockToken = generateToken(mockUserId);

beforeEach(() => {
  // Mock the Blacklist.findOne method to simulate no blacklisted token
  (Blacklist.findOne as jest.Mock).mockResolvedValue(null);

  // Mock the User.findOne method to simulate finding a valid user
  (User.findOne as jest.Mock).mockResolvedValue({
    id: mockUserId,
    name: "Mock User",
    email: "user-test@example.com",
  });

  (jwt.verify as jest.Mock).mockImplementation((token, _secret, callback) => {
    if (token === mockToken) {
      return callback(null, { id: mockUserId });
    } else {
      return callback(new Error("Invalid token"), null);
    }
  });
});

afterEach(() => {
  jest.clearAllMocks();
})

describe("GET /api/tasks", () => {
  const mockTasks = [
    { title: "Task 1", status: "todo", priority: "medium" },
    { title: "Task 2", status: "in-progress", priority: "high" },
  ];

  it("should return tasks with status todo", async () => {
    const mockSort = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockSkip = jest.fn().mockResolvedValue([mockTasks[0]]);

    (Task.find as jest.Mock).mockImplementation(() => ({
      sort: mockSort,
      limit: mockLimit,
      skip: mockSkip,
    }));

    (Task.countDocuments as jest.Mock).mockResolvedValue(1);

    const response = await request(app)
      .get("/api/tasks")
      .set("x-user-token", `Bearer ${mockToken}`)
      .query({ status: "todo", sort: "title", page: "1", limit: "2" });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Success to fetch tasks",
      data: [mockTasks[0]],
      meta: {
        totalCount: 1,
        page: 1,
        totalPages: 1,
      },
    });

    // Ensure the mocked methods were called with correct arguments
    expect(Task.find).toHaveBeenCalledWith({ status: "todo" });
    expect(Task.countDocuments).toHaveBeenCalledWith({ status: "todo" });
    expect(mockSort).toHaveBeenCalledWith("title");
    expect(mockLimit).toHaveBeenCalledWith(2);
    expect(mockSkip).toHaveBeenCalledWith(0);
  });

  it("should return tasks with status in-progress", async () => {
    // Mock the chainable query methods
    const mockSort = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockSkip = jest.fn().mockResolvedValue([mockTasks[1]]);

    (Task.find as jest.Mock).mockImplementation(() => ({
      sort: mockSort,
      limit: mockLimit,
      skip: mockSkip,
    }));

    (Task.countDocuments as jest.Mock).mockResolvedValue(1);

    const response = await request(app)
      .get("/api/tasks")
      .set("x-user-token", `Bearer ${mockToken}`)
      .query({ search: "2", status: "in-progress", priority: "high" });

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Success to fetch tasks",
      data: [mockTasks[1]],
      meta: {
        totalCount: 1,
        page: 1,
        totalPages: 1,
      },
    });

    // Ensure the mocked methods were called with correct arguments
    expect(Task.find).toHaveBeenCalledWith({
      status: "in-progress",
      $or: [
        { title: new RegExp("2", "i") },
        { description: new RegExp("2", "i") },
      ],
      priority: "high",
    });
    expect(Task.countDocuments).toHaveBeenCalledWith({
      status: "in-progress",
      $or: [
        { title: new RegExp("2", "i") },
        { description: new RegExp("2", "i") },
      ],
      priority: "high",
    });
    expect(mockSort).toHaveBeenCalledWith("-createdAt");
    expect(mockLimit).toHaveBeenCalledWith(10);
    expect(mockSkip).toHaveBeenCalledWith(0);
  });

  it("should return 401 if no token is provided", async () => {
    const mockSort = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockReturnThis();
    const mockSkip = jest.fn().mockResolvedValue([mockTasks[0]]);

    (Task.find as jest.Mock).mockImplementation(() => ({
      sort: mockSort,
      limit: mockLimit,
      skip: mockSkip,
    }));

    (Task.countDocuments as jest.Mock).mockResolvedValue(1);

    const response = await request(app)
      .get("/api/tasks")
      .query({ status: "todo", sort: "title", page: "1", limit: "2" });

    // Assertions
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Access denied. No token provided.",
    });
  });

  it("should return 401 if the token is blacklisted", async () => {
    // Mock the Blacklist model to return a blacklisted token
    (Blacklist.findOne as jest.Mock).mockResolvedValue({
      token: "blacklisted-token",
    });
  
    const response = await request(app)
      .get("/api/tasks")
      .set("x-user-token", "Bearer blacklisted-token");
  
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Token has been Invalidated",
    });
  });

  it("should return 401 if the token is invalid", async () => {  
    const response = await request(app)
      .get("/api/tasks")
      .set("x-user-token", "Bearer invalid-token");
  
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Invalid token",
    });
  });
  
  it("should return 401 if the user corresponding to the token does not exist", async () => {
    // Mock User.findOne to return null (user not found)
    (User.findOne as jest.Mock).mockResolvedValue(null);
  
    const response = await request(app)
      .get("/api/tasks")
      .set("x-user-token", `Bearer ${mockToken}`);
  
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Invalid User token",
    });
  });
  
});

describe("POST /api/tasks", () => {
  const validTask = {
    title: "New Task",
    description: "Task description",
    status: "todo",
    priority: "high",
  };

  it("should create a new task with valid data", async () => {
    (Task.create as jest.Mock).mockResolvedValue(validTask);

    const response = await request(app)
      .post("/api/tasks")
      .set("x-user-token", `Bearer ${mockToken}`)
      .send(validTask);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "Task successfully added",
      data: validTask,
    });
    expect(Task.create).toHaveBeenCalledWith(validTask);
  });

  it("should return 400 for invalid data", async () => {
    const invalidTask = {
      description: "Task description",
      status: "unknown_status",
      priority: "high",
    };

    const response = await request(app)
      .post("/api/tasks")
      .set("x-user-token", `Bearer ${mockToken}`)
      .send(invalidTask);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Validation Error",
      details: expect.arrayContaining([
        expect.objectContaining({ path: ["title"] }),
        expect.objectContaining({ path: ["status"] }),
      ]),
    });
  });
});

describe("PUT /api/tasks/:id", () => {
  const validUpdatedTask = {
    title: "Updated Task",
    description: "Updated description",
    status: "todo",
    priority: "low",
  };

  it("should update a task with valid data", async () => {
    (Task.findOneAndUpdate as jest.Mock).mockResolvedValue(validUpdatedTask);

    const response = await request(app)
      .put("/api/tasks/1")
      .set("x-user-token", `Bearer ${mockToken}`)
      .send(validUpdatedTask);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Task successfully updated",
      data: validUpdatedTask,
    });
    expect(Task.findOneAndUpdate).toHaveBeenCalledWith(
      { id: "1" },
      validUpdatedTask,
      { new: true, runValidators: true }
    );
  });

  it("should return 404 if the task is not found", async () => {
    (Task.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .put("/api/tasks/999")
      .set("x-user-token", `Bearer ${mockToken}`)
      .send(validUpdatedTask);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Task not found" });
  });

  it("should return 400 for invalid data", async () => {
    const invalidUpdatedTask = {
      title: "",
      status: "invalid_status",
      priority: "low",
    };

    const response = await request(app)
      .put("/api/tasks/1")
      .set("x-user-token", `Bearer ${mockToken}`)
      .send(invalidUpdatedTask);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Validation Error",
      details: expect.arrayContaining([
        expect.objectContaining({ path: ["title"] }),
        expect.objectContaining({ path: ["status"] }),
      ]),
    });
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("should delete a task", async () => {
    const deletedTask = { id: "1", title: "Task to delete" };

    (Task.findOneAndDelete as jest.Mock).mockResolvedValue(deletedTask);

    const response = await request(app)
      .delete("/api/tasks/1")
      .set("x-user-token", `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Task deleted",
      data: deletedTask,
    });
    expect(Task.findOneAndDelete).toHaveBeenCalledWith({ id: "1" });
  });

  it("should return 404 if the task is not found", async () => {
    (Task.findOneAndDelete as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .delete("/api/tasks/999")
      .set("x-user-token", `Bearer ${mockToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Task not found" });
  });
});

describe("DELETE /api/tasks/bulk-delete", () => {
  it("should delete multiple tasks", async () => {
    (Task.findOneAndDelete as jest.Mock)
      .mockResolvedValueOnce({ id: "1" })
      .mockResolvedValueOnce({ id: "2" })
      .mockRejectedValueOnce(new Error("Error Task"));

    const response = await request(app)
      .delete("/api/tasks/bulk-delete")
      .set("x-user-token", `Bearer ${mockToken}`)
      .send({ ids: ["1", "2", "3", "4"] });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Bulk delete task completed",
      data: {
        deleted: ["1", "2"],
        failed: [
          { id: "3", error: "Error Task" },
          { id: "4", error: "Task not found" }
        ],
      },
    });
    expect(Task.findOneAndDelete).toHaveBeenCalledWith({ id: "1" });
    expect(Task.findOneAndDelete).toHaveBeenCalledWith({ id: "2" });
    expect(Task.findOneAndDelete).toHaveBeenCalledWith({ id: "3" });
    expect(Task.findOneAndDelete).toHaveBeenCalledWith({ id: "4" });
  });

  it("should return 400 if no IDs are provided", async () => {
    const response = await request(app)
      .delete("/api/tasks/bulk-delete")
      .set("x-user-token", `Bearer ${mockToken}`)
      .send({ ids: [] });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Please provide an array of task IDs" });
  });
});

describe("GET /api/tasks/:id", () => {
  it("should return the task with the given ID", async () => {
    const task = { id: "1", title: "Task 1" };

    (Task.findOne as jest.Mock).mockResolvedValue(task);

    const response = await request(app)
      .get("/api/tasks/1")
      .set("x-user-token", `Bearer ${mockToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Success to get detail task",
      data: task,
    });
    expect(Task.findOne).toHaveBeenCalledWith({ id: "1" });
  });

  it("should return 404 if the task is not found", async () => {
    (Task.findOne as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .get("/api/tasks/999")
      .set("x-user-token", `Bearer ${mockToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Task not found" });
  });
});
