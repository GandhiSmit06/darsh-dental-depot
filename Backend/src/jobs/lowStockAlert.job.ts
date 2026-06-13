import cron from 'node-cron';
import { Product } from '../models/Product';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { sendLowStockAlertEmail } from '../helpers/mailer.helper';
import { logger } from '../utils/logger';

export const startLowStockAlertJob = () => {
  // Runs every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    logger.info('Running low stock alert job...');

    try {
      const lowStockProducts = await Product.find({
        $expr: { $lte: ['$stock', '$lowStockThreshold'] },
        status: { $ne: 'inactive' },
      }).populate('createdBy', 'email fullName');

      if (lowStockProducts.length === 0) {
        logger.info('No low stock products found.');
        return;
      }

      // Notify shop owners of their own products
      const byOwner = new Map<string, { email: string; name: string; products: any[] }>();

      for (const product of lowStockProducts) {
        const owner = product.createdBy as any;
        if (!owner?._id) continue;

        const ownerId = owner._id.toString();
        if (!byOwner.has(ownerId)) {
          byOwner.set(ownerId, { email: owner.email, name: owner.fullName, products: [] });
        }
        byOwner.get(ownerId)!.products.push({
          name: product.name,
          stock: product.stock,
          threshold: product.lowStockThreshold,
        });

        // Create in-app notification
        await Notification.create({
          userId: owner._id,
          type: 'low_stock',
          title: 'Low Stock Alert',
          message: `${product.name} has only ${product.stock} units remaining.`,
          link: `/products/${product._id}`,
        });
      }

      // Also notify admins
      const admins = await User.find({ role: 'admin', isActive: true });
      const allProducts = lowStockProducts.map((p) => ({
        name: p.name,
        stock: p.stock,
        threshold: p.lowStockThreshold,
      }));

      for (const admin of admins) {
        await Notification.create({
          userId: admin._id,
          type: 'low_stock',
          title: `Low Stock Alert: ${lowStockProducts.length} products`,
          message: `${lowStockProducts.length} products are running low on stock.`,
        });

        try {
          await sendLowStockAlertEmail(admin.email, allProducts);
        } catch (e) {
          logger.error(`Failed to send low stock email to ${admin.email}`);
        }
      }

      // Send to each shop owner
      for (const [, data] of byOwner) {
        try {
          await sendLowStockAlertEmail(data.email, data.products);
        } catch (e) {
          logger.error(`Failed to send low stock email to ${data.email}`);
        }
      }

      logger.info(`Low stock alert job complete. Notified ${byOwner.size} shop owners.`);
    } catch (error) {
      logger.error(`Low stock alert job failed: ${(error as Error).message}`);
    }
  });

  logger.info('Low stock alert job scheduled (daily at 08:00)');
};
