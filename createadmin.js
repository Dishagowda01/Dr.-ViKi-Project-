require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require("./models/admin");
const bcrypt = require("bcryptjs");

const mongoURL = process.env.MONGO_URI;

const adminEmail = "admin@example.com";
const adminPassword = "admin123";

async function createAdmin() {
  try {
    await mongoose.connect(mongoURL);
    console.log("✅ MongoDB connected");

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("ℹ️ Admin already exists");
      mongoose.disconnect();
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = new Admin({ email: adminEmail, password: hashedPassword });
    await admin.save();

    console.log("✅ Admin created successfully");
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
    mongoose.disconnect();
  }
}

createAdmin();
