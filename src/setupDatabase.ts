import { redisConnection } from '@service/redis/redis.connecetion';
import Logger from 'bunyan';
import mongoose from 'mongoose';
import { config } from './config';
const log: Logger = config.createLogger('database');
export default () => {
  const connect = () => {
    mongoose
      .connect(config.DATABASE_URL)
      .then(() => {
        log.info('Successfully connected to the database.');
        redisConnection.connect();
      })
      .catch((error) => {
        log.error('Error connecting to the database');
      });
  };
  connect();
  mongoose.connection.on('disconnected', connect);
};
