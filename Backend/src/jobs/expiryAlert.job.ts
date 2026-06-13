import cron from 'node-cron';
import { Product } from '../models/Product';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import dayjs from 'dayjs';

export const startExpiryAlertJob = () => {
  // Runs every Monday at 9:00 AM
  cron.schedule('0 9 * * 1', async () => {
    logger.info('Running expiry alert job...');

    try {
      const thirtyDaysFromNow = dayjs().add(30, 'day').toDate();
      const now = new Date();

      const expiringProducts = await Product.find({
        expiryDate: { $lte: thirtyDaysFromNow, $gte: now },
        status: { $ne: 'inactive' },
      }).populate('createdBy', 'email fullName _id');

      if (expiringProducts.length === 0) {
        logger.info('No expiring products found.');
        return;
      }

      const admins = await User.find({ role: 'admin', isActive: true });

      for (const product of expiringProducts) {
        const daysLeft = dayjs(product.expiryDate).diff(dayjs(), 'day');
        const owner = product.createdBy as any;

        if (owner?._id) {
          await Notification.create({
            userId: owner._id,
            type: 'expiry',
            title: 'Product Expiry Warning',
            message: `${product.name} expires in ${daysLeft} day(s) (${dayjs(product.expiryDate).format('DD MMM YYYY')})`,
            link: `/products/${product._id}`,
          });
        }

        for (const admin of admins) {
          await Notification.create({
            userId: admin._id,
            type: 'expiry',
            title: 'Product Expiry Warning',
            message: `${product.name} expires in ${daysLeft} day(s).`,
            link: `/products/${product._id}`,
          });
        }
      }

      logger.info(`Expiry alert job complete. ${expiringProducts.length} products near expiry.`);
    } catch (error) {
      logger.error(`Expiry alert job failed: ${(error as Error).message}`);
    }
  });

  logger.info('Expiry alert job scheduled (every Monday at 09:00)');
};
