import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'admin' },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function seedAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const existing = await Admin.findOne({ username: 'admin' });
        if (existing) {
            console.log('Admin already exists. Username: admin');
        } else {
            const passwordHash = await bcrypt.hash('admin123', 12);
            await Admin.create({ username: 'admin', passwordHash });
            console.log('Created admin. Username: admin, Password: admin123');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
seedAdmin();
