import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../src/models/User';
import { Product } from '../src/models/Product';
import { hashPassword } from '../src/helpers/bcrypt.helper';
import { env } from '../src/config/env';

const realProductsData = [
  {
    name: '3M ESPE Filtek Z350 XT Universal Restorative',
    category: 'Composites',
    brand: '3M ESPE',
    manufacturer: '3M',
    description: 'A versatile, high-performance nanocomposite. Excellent aesthetics for anterior restorations and strength for posterior restorations.',
    images: ['https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80'],
    hsnCode: '30064000',
    gstPercentage: 12,
    sellingPrice: 2450.00,
    purchasePrice: 2100.00,
    stock: 25,
    SKU: '3M-FLT-Z350',
  },
  {
    name: 'GC Fuji I Glass Ionomer Luting Cement',
    category: 'Cements & Adhesives',
    brand: 'GC',
    manufacturer: 'GC Corporation',
    description: 'Radiopaque glass ionomer luting cement. Ideal for the luting of metal-based and opaque ceramic restorations.',
    images: ['https://images.unsplash.com/photo-1598256989800-fea5f9508d50?auto=format&fit=crop&w=600&q=80'],
    hsnCode: '30064000',
    gstPercentage: 12,
    sellingPrice: 1850.00,
    purchasePrice: 1550.00,
    stock: 40,
    SKU: 'GC-FUJI-1',
  },
  {
    name: 'Dentsply ProTaper Gold Rotary Files',
    category: 'Endodontics',
    brand: 'Dentsply Sirona',
    manufacturer: 'Dentsply Sirona',
    description: 'ProTaper Gold rotary files feature the same exact geometries as ProTaper Universal but with enhanced flexibility.',
    images: ['https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80'],
    hsnCode: '90184900',
    gstPercentage: 12,
    sellingPrice: 3200.00,
    purchasePrice: 2800.00,
    stock: 0, // OUT OF STOCK
    SKU: 'DENT-PTG-001',
  },
  {
    name: 'Septodont Septocaine 1:100,000 (Articaine)',
    category: 'Disposables',
    brand: 'Septodont',
    manufacturer: 'Septodont',
    description: 'Articaine hydrochloride 4% with Epinephrine 1:100,000 local anesthetic for dental use.',
    images: ['https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=600&q=80'],
    hsnCode: '30049099',
    gstPercentage: 12,
    sellingPrice: 2100.00,
    purchasePrice: 1900.00,
    stock: 120,
    SKU: 'SEPT-ART-100',
  },
  {
    name: 'Kerr OptiBond FL Adhesive Kit',
    category: 'Cements & Adhesives',
    brand: 'Kerr',
    manufacturer: 'Kerr Dental',
    description: 'Total-etch, two-component dental adhesive. Renowned for its high bond strengths and proven long-term performance.',
    images: ['https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80'],
    hsnCode: '30064000',
    gstPercentage: 12,
    sellingPrice: 4800.00,
    purchasePrice: 4200.00,
    stock: 15,
    SKU: 'KERR-OPT-FL',
  },
  {
    name: 'Woodpecker Ultrasonic Scaler Tips (G1, G2, G4)',
    category: 'Instruments',
    brand: 'Woodpecker',
    manufacturer: 'Guilin Woodpecker',
    description: 'High quality stainless steel scaler tips compatible with EMS and Woodpecker ultrasonic scalers. Set of 3.',
    images: ['https://images.unsplash.com/photo-1598256989800-fea5f9508d50?auto=format&fit=crop&w=600&q=80'],
    hsnCode: '90184900',
    gstPercentage: 18,
    sellingPrice: 850.00,
    purchasePrice: 600.00,
    stock: 50,
    SKU: 'WOOD-SCL-GSET',
  },
  {
    name: 'Waldent Dental Airotor Handpiece (Standard Head)',
    category: 'Instruments',
    brand: 'Waldent',
    manufacturer: 'Waldent',
    description: 'High-speed airotor handpiece with ceramic bearings, standard head, and push-button chuck.',
    images: ['https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80'],
    hsnCode: '90184100',
    gstPercentage: 18,
    sellingPrice: 1550.00,
    purchasePrice: 1200.00,
    stock: 0, // OUT OF STOCK
    SKU: 'WALD-AIR-STD',
  },
  {
    name: 'Ivoclar Vivadent Tetric N-Ceram Bulk Fill',
    category: 'Composites',
    brand: 'Ivoclar',
    manufacturer: 'Ivoclar Vivadent',
    description: 'Light-curing radiopaque nanohybrid composite for bulk placement in posterior teeth.',
    images: ['https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=600&q=80'],
    hsnCode: '30064000',
    gstPercentage: 12,
    sellingPrice: 2250.00,
    purchasePrice: 1950.00,
    stock: 35,
    SKU: 'IVOC-TET-BF',
  },
  {
    name: 'Zhermack Tropicalgin Alginate Impression Material',
    category: 'Impression Materials',
    brand: 'Zhermack',
    manufacturer: 'Zhermack SpA',
    description: 'Chromatic alginate for highly precise and elastic impressions. Fast setting with mango flavor.',
    images: ['https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80'],
    hsnCode: '34070000',
    gstPercentage: 18,
    sellingPrice: 480.00,
    purchasePrice: 350.00,
    stock: 200,
    SKU: 'ZHER-TROP-ALG',
  },
  {
    name: 'Prevest DenPro Cal LC (Light Cure Calcium Hydroxide)',
    category: 'Endodontics',
    brand: 'Prevest DenPro',
    manufacturer: 'Prevest DenPro',
    description: 'Light cured radiopaque calcium hydroxide paste. Effective for indirect pulp capping and as a cavity liner.',
    images: ['https://images.unsplash.com/photo-1598256989800-fea5f9508d50?auto=format&fit=crop&w=600&q=80'],
    hsnCode: '30064000',
    gstPercentage: 12,
    sellingPrice: 380.00,
    purchasePrice: 250.00,
    stock: 80,
    SKU: 'PREV-CAL-LC',
  }
];

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
    fullName: 'Darsh Dental Depot',
    email: 'shop@darshdental.com',
    phone: '9727076119',
    password: shopOwnerPassword,
    clinicName: 'Darsh Dental Depot',
    address: 'FF-10/11, Vraj Vihar Complex, Char Rasta, Opp. Kachhia Patel Wadi, Mahavir Colony, Shiyabaug, Kevdabaug, Vadodara, Gujarat 390001',
    isVerified: true,
    isActive: true,
  });
  console.log(`✅ Shop Owner created: ${shopOwner.email} (Darsh Dental Depot)`);

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
    address: 'B-12, Alkapuri, Vadodara, Gujarat',
    isVerified: true,
    isActive: true,
  });
  console.log(`✅ Doctor created: ${doctor.email}`);

  // Format real products with necessary database fields
  const productsToInsert = realProductsData.map((prod, i) => {
    return {
      ...prod,
      batchNumber: `BATCH-2025-${prod.SKU}`,
      discountPrice: i % 3 === 0 ? Math.round(prod.sellingPrice * 0.95) : undefined,
      expiryDate: new Date(Date.now() + (365 + i * 30) * 24 * 60 * 60 * 1000),
      status: prod.stock === 0 ? 'out_of_stock' : 'active',
      lowStockThreshold: 10,
      rating: Math.round((4.0 + ((i * 0.17) % 0.9)) * 10) / 10,
      reviewCount: 45 + (i * 7) % 180,
      createdBy: shopOwner._id,
    };
  });

  await Product.insertMany(productsToInsert);
  console.log(`✅ Created ${productsToInsert.length} real products`);

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
