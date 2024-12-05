import express from "express";
import request from "supertest";
import { generateToken } from "../utils";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";
import Blacklist from "../models/blacklist";
import User from "../models/user";
import authRoute from '../routes/auth';

jest.mock("../models/blacklist");
jest.mock("../models/user");
jest.mock("bcrypt");
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue('test-token'),
  verify: jest.fn(),
}));


const app = express();
app.use(express.json());
app.use("/api/auth", authRoute);

const mockUserId = "mock-user-id";
const hashedPassword = "hashedpassword";
const mockToken = generateToken(mockUserId);

// Mock user data
const mockUser = {
  id: mockUserId,
  email: "testuser@example.com",
  password: hashedPassword,
  username: "testuser"
};

beforeEach(() => {
  // Mock JWT functions
  (jwt.verify as jest.Mock).mockImplementation((token, _secret, callback) => {
    if (token === mockToken) {
      return callback(null, { id: mockUserId, exp: 15 * 60 });
    } else {
      return callback(new Error("Invalid token"), null);
    }
  });

  // Mock bcrypt functions
  (bcrypt.compare as jest.Mock).mockImplementation((password: string, hash: string) => {
    if (password === "Correct123!" && hash === hashedPassword) {
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  });
  (bcrypt.genSalt as jest.Mock).mockResolvedValue("dummy-salt");
  (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

  // Mock the User.findOne method
  (User.findOne as jest.Mock).mockResolvedValue(mockUser);
});

afterEach(() => {
  jest.clearAllMocks();
})

describe("POST /api/auth/register", () => {
  it("should register a new user with valid data", async () => {
    const newUser = {
      email: "newuser@example.com",
      username: "newuser",
      password: "Valid123!"
    };
    (User.create as jest.Mock).mockResolvedValue(newUser);

    const response = await request(app)
      .post("/api/auth/register")
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: 'User registered successfully',
      data: expect.objectContaining({
        email: newUser.email,
        username: newUser.username
      }),
    });
    newUser.password = hashedPassword;
    expect(User.create).toHaveBeenCalledWith(newUser);
  });

  it("should return validation error if email is invalid", async () => {
    const newUser = {
      email: "invalid-email",
      username: "newuser",
      password: "Valid123!"
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Validation Error",
      details: expect.arrayContaining([
        expect.objectContaining({ path: ["email"] }),
      ]),
    });
  });

  it("should return validation error if password is too weak", async () => {
    const newUser = {
      email: "validuser@example.com",
      username: "validuser",
      password: "weakpass"
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Validation Error",
      details: expect.arrayContaining([
        expect.objectContaining({ path: ["password"] }),
      ]),
    });
  });

  it("should return validation error if username is too short", async () => {
    const newUser = {
      email: "validuser@example.com",
      username: "us",
      password: "Valid123!"
    };

    const response = await request(app)
      .post("/api/auth/register")
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Validation Error",
      details: expect.arrayContaining([
        expect.objectContaining({ path: ["username"] }),
      ]),
    });
  });
});

describe("POST /api/auth/login", () => {
  it("should log in a user with valid credentials", async () => {
    const loginData = {
      email: "testuser@example.com",
      password: "Correct123!"
    };

    const response = await request(app)
      .post("/api/auth/login")
      .send(loginData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Login successful',
      token: 'test-token',
    });
    expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
  });

  it("should return validation error if password does not meet the requirements", async () => {
    const loginData = {
      email: "testuser@example.com",
      password: "weakpass"
    };

    const response = await request(app)
      .post("/api/auth/login")
      .send(loginData);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Validation Error",
      details: expect.arrayContaining([
        expect.objectContaining({ path: ["password"] }),
      ]),
    });
  });

  it("should return validation error if email is invalid", async () => {
    const loginData = {
      email: "invalid-email",
      password: "Correct123!"
    };

    const response = await request(app)
      .post("/api/auth/login")
      .send(loginData);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Validation Error",
      details: expect.arrayContaining([
        expect.objectContaining({ path: ["email"] }),
      ]),
    });
  });

  it("should return 401 if the user are incorrect", async () => {
    const loginData = {
      email: "wronguser@example.com",
      password: "Correct123!"
    };

    (User.findOne as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .post("/api/auth/login")
      .send(loginData);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: 'Invalid Email or Password',
    });
  });

  it("should return 401 if the password are incorrect", async () => {
    const loginData = {
      email: "testuser@example.com",
      password: "WrongPass123!"
    };

    const response = await request(app)
      .post("/api/auth/login")
      .send(loginData);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: 'Invalid Email or Password',
    });
  });
});

describe("POST /api/auth/logout", () => {
  it("should log out a user and blacklist the token", async () => {
    (jwt.verify as jest.Mock).mockImplementationOnce((token, _secret, callback) => {
      if (token === mockToken) {
        return callback(null, { id: mockUserId, exp: 15 * 60 });
      } else {
        return callback(new Error("Invalid token"), null);
      }
    });
    (jwt.verify as jest.Mock).mockImplementationOnce((token, _secret) => {
      if (token === mockToken) {
        return { id: mockUserId, exp: 15 * 60 };
      } else {
        return new Error("Invalid token");
      }
    });
    (Blacklist.create as jest.Mock).mockResolvedValue({ token: mockToken, expiry: new Date(15 * 60) });
    const token = `Bearer ${mockToken}`;

    const response = await request(app)
      .post("/api/auth/logout")
      .set("x-user-token", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Logged out successfully",
    });

    // Check if the token was added to the blacklist
    expect(Blacklist.create).toHaveBeenCalledWith({
      token,
      expiry: expect.any(Date),
    });
  });

  it("should log out a user and blacklist the token default expiry", async () => {
    (jwt.verify as jest.Mock).mockImplementationOnce((token, _secret, callback) => {
      if (token === mockToken) {
        return callback(null, { id: mockUserId});
      } else {
        return callback(new Error("Invalid token"), null);
      }
    });
    (jwt.verify as jest.Mock).mockImplementationOnce((token, _secret) => {
      if (token === mockToken) {
        return { id: mockUserId };
      } else {
        return new Error("Invalid token");
      }
    });
    (Blacklist.create as jest.Mock).mockResolvedValue({ token: mockToken, expiry: new Date(1000) });
    
    const token = `Bearer ${mockToken}`;

    const response = await request(app)
      .post("/api/auth/logout")
      .set("x-user-token", token);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Logged out successfully",
    });

    // Check if the token was added to the blacklist
    expect(Blacklist.create).toHaveBeenCalledWith({
      token,
      expiry: expect.any(Date),
    });
  });

  it("should return 401 if no token is provided", async () => {
    const response = await request(app)
      .post("/api/auth/logout")
      .send();

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: "Access denied. No token provided.",
    });
  });
});
