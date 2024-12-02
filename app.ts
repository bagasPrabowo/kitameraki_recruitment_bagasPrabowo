import express, { urlencoded } from 'express';
import { connect } from 'mongoose';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import cors from 'cors';
import logger from './logger';
import taskRoute from './routes/task';

const app = express();

app.use(cors());
app.use(express.json());
app.use(urlencoded({ extended: true }))

app.use(session({
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  store: connectMongo.create({ mongoUrl: process.env.MONGODB_URL })
}))

app.get('/', (request, response) => {
    console.log(request);
    response.status(202).send(
      `Welcome to Task Manager`);
  });

app.use('/api/tasks', taskRoute);

connect(
  process.env.MONGODB_URL as string
).then(result => {
  logger.info('Connected to MongoDB')
  app.listen(process.env.PORT || 3000, () => {
    logger.info(`Server is running on port ${process.env.PORT || 3000}`)
  });
})
  .catch(err => {
    logger.error('Failed to connect to MongoDB', err);
  });
