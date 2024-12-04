import cron from 'node-cron';
import Blacklist from '../models/blacklist';
import logger from '../utils/logger';

const cleanBlacklistCron = () => {
  // Define the cleanup job
  cron.schedule('0 0 * * *', async () => { // Runs daily at midnight
    try {
      const result = await Blacklist.deleteMany({ expiry: { $lte: new Date() } });
      logger.info(`Deleted ${result.deletedCount} expired tokens`);
    } catch (error: any) {
      logger.error('Error cleaning up expired tokens:', error.message)
    }
  });

  logger.info('Cron jobs initialized');
};

export default cleanBlacklistCron;