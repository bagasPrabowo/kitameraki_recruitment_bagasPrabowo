import { Router } from "express";
import { postLogin, postLogout, postRegister } from "../controllers/auth";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../validations/auth";

const router: Router = Router();

/**
 * A User Type
 * @typedef {object} User
 * @property {string} id.required - Unique ID of the task
 * @property {string} email.required - Email address of the user
 * @property {string} password.required - Hash of the password
 * @property {string} username - Name of the user
 */

/**
 * A Login Type
 * @typedef {object} UserLogin
 * @property {string} email.required - Email address of the user
 * @property {string} password.required - Password of the user
 */

/**
 * A Register Respon Type
 * @typedef {object} ApiResponseRegister
 * @property {string} message.required - A message describing the outcome of the operation
 * @property {User} data.required - Single task details
 */

/**
 * A Login Respon Type
 * @typedef {object} ApiResponseLogin
 * @property {string} message.required - A message describing the outcome of the operation
 * @property {string} token.required - Single task details
 */

/**
 * Default auth response
 * @typedef {object} DefaultResponse
 * @property {string} message.required - A message describing the outcome of the operation
 */

/** POST /api/auth/register
 * @summary Register a new user
 * @tags Auth
 * @param {User} request.body.required - User details 
 * @return {ApiResponseRegister} 201 - User registered successfully
 * @return {ApiResponseValidationError} 400 - Validation error
 */
router.post('/register', validate(registerSchema), postRegister);

/** POST /api/auth/login
 * @summary Login a user
 * @tags Auth
 * @param {UserLogin} request.body.required - User login details
 * @return {ApiResponseLogin} 200 - Login successful
 * @return {DefaultResponse} 401 - User not found or Invalid Email or Password
 * @return {ApiResponseValidationError} 400 - Validation error
 */
router.post('/login', validate(loginSchema), postLogin);

/** POST /api/auth/logout
 * @summary Logout a user
 * @tags Auth
 * @param {string} x-user-token.header.required - User token
 * @return {DefaultResponse} 200 - Logged out successfully
 * @return {DefaultResponse} 401 - Unauthorized
 */
router.post('/logout', authenticate, postLogout);

export default router;
