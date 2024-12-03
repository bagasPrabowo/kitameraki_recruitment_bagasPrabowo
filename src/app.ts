import 'dotenv/config';
import express, { urlencoded, Express } from 'express';
import { connect } from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import logger from './logger';
import taskRoute from './routes/task';

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
