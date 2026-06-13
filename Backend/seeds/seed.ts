import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { Product } from '../src/models/Product';
import { hashPassword } from '../src/helpers/bcrypt.helper';
import { env } from '../src/config/env';

const categories = [
  'Composites',
  'Impression Materials',
  'Endodontics',
  'Orthodontics',
  'Instruments',
  'Disposables',
  'Cements & Adhesives',
  'Whitening',
];

const brands = ['3M ESPE', 'Ivoclar', 'Dentsply Sirona', 'GC', 'Kerr', 'Septodont', 'VOCO'];

const productNames = [
  'Filtek Universal Composite',
  'Alginate Impression Powder',
  'RotoFile Endo Rotary Set',
  'Orthodontic Bracket Kit',
  'Stainless Steel Scaler',
  'Disposable Bib Roll',
  'GC Fuji Glass Ionomer',
  'Opalescence Whitening Gel',
];

const productSuffixes = ['A2', 'Pro', 'Plus', 'Premium', 'Kit', 'Pack'];

async function seed() {
  console.log('🌱 Starting seed...');

  await mongoose.connect(env.MONGO_URI);
  console.log('✅ MongoDB connected');

  // Clear existing data
  await User.deleteMany({});
  await Product.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Create admin user
  const adminPassword = await hashPassword('Admin@123456');
  const admin = await User.create({
    role: 'admin',
    fullName: 'Darsh Admin',
    email: 'admin@darshdental.com',
    phone: '9000000001',
    password: adminPassword,
    isVerified: true,
    isActive: true,
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Create shop owner
  const shopOwnerPassword = await hashPassword('Shop@123456');
  const shopOwner = await User.create({
    role: 'shop_owner',
    fullName: 'Mehta Medical Depot',
    email: 'shop@darshdental.com',
    phone: '9000000002',
    password: shopOwnerPassword,
    clinicName: 'Mehta Medical Depot',
    address: '42 Gandhi Road, Ahmedabad, Gujarat',
    isVerified: true,
    isActive: true,
  });
  console.log(`✅ Shop Owner created: ${shopOwner.email}`);

  // Create doctor
  const doctorPassword = await hashPassword('Doctor@123456');
  const doctor = await User.create({
    role: 'doctor',
    fullName: 'Dr. Aisha Khan',
    email: 'doctor@darshdental.com',
    phone: '9000000003',
    password: doctorPassword,
    clinicName: 'Khan Dental Clinic',
    medicalRegistrationNumber: 'MCI-DEN-2023-001',
    address: 'B-12, Andheri West, Mumbai, Maharashtra',
    isVerified: true,
    isActive: true,
  });
  console.log(`✅ Doctor created: ${doctor.email}`);

  // Create 24 products (matching frontend mock data structure)
  const products = [];
  for (let i = 0; i < 24; i++) {
    const cat = categories[i % categories.length];
    const brand = brands[i % brands.length];
    const name = `${productNames[i % 8]} ${productSuffixes[i % 6]}`;
    const sellingPrice = Math.round((19 + ((i * 7.3) % 280)) * 100) / 100;
    const stock = (i * 13) % 60;
    const skuSuffix = String(i + 1).padStart(3, '0');

    products.push({
      name,
      category: cat,
      description: 'Premium-grade dental material designed for clinical excellence. Trusted by professionals for consistent results, durability, and patient comfort.',
      images: [`https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=600&q=80`],
      SKU: `DDD-${cat.slice(0, 3).toUpperCase()}-${skuSuffix}`,
      batchNumber: `BATCH-2025-${skuSuffix}`,
      manufacturer: brand,
      brand,
      stock,
      purchasePrice: Math.round(sellingPrice * 0.7 * 100) / 100,
      sellingPrice,
      discountPrice: i % 4 === 0 ? Math.round(sellingPrice * 0.9 * 100) / 100 : undefined,
      expiryDate: new Date(Date.now() + (365 + i * 30) * 24 * 60 * 60 * 1000),
      status: stock === 0 ? 'out_of_stock' : 'active',
      lowStockThreshold: 10,
      rating: Math.round((3.8 + ((i * 0.17) % 1.2)) * 10) / 10,
      reviewCount: 12 + (i * 7) % 240,
      createdBy: shopOwner._id,
    });
  }

  await Product.insertMany(products);
  console.log(`✅ Created ${products.length} products`);

  console.log('\n🎉 Seed complete!');
  console.log('───────────────────────────────────');
  console.log('Test Credentials:');
  console.log('  Admin:      admin@darshdental.com    / Admin@123456');
  console.log('  Shop Owner: shop@darshdental.com     / Shop@123456');
  console.log('  Doctor:     doctor@darshdental.com   / Doctor@123456');
  console.log('───────────────────────────────────');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
