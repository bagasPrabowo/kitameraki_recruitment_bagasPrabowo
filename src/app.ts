import 'dotenv/config';
import express, { urlencoded, Express, NextFunction, Response, Request } from 'express';
import { connect } from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import logger from './logger';
import taskRoute from './routes/task';
import errorHandler from './middleware/errorHandler';
import expressJSDocSwagger from 'express-jsdoc-swagger';

const app: Express = express();
const port: string = process.env.PORT || '3000';
const mongoUrl: string = process.env.MONGODB_URL || "";
const sessionSecret: string = process.env.SESSION_SECRET || "";

app.use(cors());
app.use(express.json());
app.use(urlencoded({ extended: true }))

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: mongoUrl })
}))

app.use('/api/tasks', taskRoute);

const options = {
  info: {
    version: "1.0.0",
    title: "Task Manager API",
    description: "API for managing tasks",
  },
  baseDir: __dirname,
  filesPattern: ["./routes/**/*.ts", "./controllers/**/*.ts", "./types/**/*.ts"],
  fileName: './swagger.json',
  swaggerUIPath: "/api-docs",
  exposeSwaggerUI: true,
  exposeApiDocs: false,
  apiDocsPath: "/v1/api-docs",
};

expressJSDocSwagger(app)(options);

app.use(errorHandler);

connect(
  mongoUrl
).then(result => {
  logger.info('Connected to MongoDB')
  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`)
  });
})
  .catch(err => {
    logger.error('Failed to connect to MongoDB', err);
  });
