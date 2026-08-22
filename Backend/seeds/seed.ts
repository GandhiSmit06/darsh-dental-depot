import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { hashPassword } from '../src/helpers/bcrypt.helper';
import { env } from '../src/config/env';

async function seed() {
  console.log('🌱 Starting seed...');

  await mongoose.connect(env.MONGO_URI);
  console.log('✅ MongoDB connected');

  // Check and create core administrative accounts if they do not already exist
  const adminExists = await User.findOne({ email: 'admin@darshdental.com' });
  if (!adminExists) {
    const adminPassword = await hashPassword('Admin@123456');
    await User.create({
      role: 'admin',
      fullName: 'Darsh Admin',
      email: 'admin@darshdental.com',
      phone: '9000000001',
      password: adminPassword,
      isVerified: true,
      isActive: true,
    });
    console.log('✅ Admin created: admin@darshdental.com');
  }

  const shopOwnerExists = await User.findOne({ email: 'shop@darshdental.com' });
  if (!shopOwnerExists) {
    const shopOwnerPassword = await hashPassword('Shop@123456');
    await User.create({
      role: 'shop_owner',
      fullName: 'Darsh Dental Depot',
      email: 'shop@darshdental.com',
      phone: '9727076119',
      password: shopOwnerPassword,
      clinicName: 'Darsh Dental Depot',
      address: 'FF-10/11, Vraj Vihar Complex, Char Rasta, Opp. Kachhia Patel Wadi, Mahavir Colony, Shiyabaug, Kevdabaug, Vadodara, Gujarat 390001',
      isVerified: true,
      isActive: true,
    });
    console.log('✅ Shop Owner created: shop@darshdental.com (Darsh Dental Depot)');
  }

  console.log('\n🎉 Seed complete! Products database is left completely untouched.');
  console.log('───────────────────────────────────');
  console.log('Core Credentials:');
  console.log('  Admin:      admin@darshdental.com    / Admin@123456');
  console.log('  Shop Owner: shop@darshdental.com     / Shop@123456');
  console.log('───────────────────────────────────');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
