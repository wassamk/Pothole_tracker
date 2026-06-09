// src/utils/seed.js
// Seeds the database with a default superadmin user
// Run: node src/utils/seed.js

import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../features/admin/admin.model.js';
import connectDB from '../config/db.js';

const seedAdmin = async () => {
  await connectDB();

  try {
    // Check if superadmin already exists
    const existing = await User.findOne({ email: 'admin@fixkarachi.pk' });
    if (existing) {
      console.log('✅ Superadmin already exists. No changes made.');
      process.exit(0);
    }

    // Create default superadmin
    const admin = await User.create({
      name: 'Fix Karachi Admin',
      email: 'admin@fixkarachi.pk',
      password: 'Admin@1234', // Will be bcrypt-hashed by pre-save hook
      role: 'superadmin',
    });

    console.log('✅ Superadmin created successfully!');
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Password: Admin@1234`);
    console.log('   ⚠️  Please change this password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
