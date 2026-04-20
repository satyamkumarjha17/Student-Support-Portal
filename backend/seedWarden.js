require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const departments = [
    { email: 'it@cumail.in', dept: 'IT Support', name: 'IT Manager', uid: 'IT001' },
    { email: 'maintenance@cumail.in', dept: 'Maintenance', name: 'Head of Maintenance', uid: 'MAINT001' },
    { email: 'library@cumail.in', dept: 'Library', name: 'Chief Librarian', uid: 'LIB001' },
    { email: 'sports@cumail.in', dept: 'Sports', name: 'Sports Director', uid: 'SPORT001' },
    { email: 'admin@cumail.in', dept: 'Administration', name: 'Admin Officer', uid: 'ADMIN001' },
];

const seedDepartments = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const hashedPassword = await bcrypt.hash('Password@123', 10);
        
        for (const account of departments) {
            await User.findOneAndUpdate(
                { email: account.email },
                { 
                    name: account.name,
                    email: account.email,
                    password: hashedPassword,
                    type: 'Management',
                    role: 'management',
                    uid: account.uid,
                    department: account.dept,
                    designation: account.dept + ' Head',
                    isVerified: true
                },
                { upsert: true, new: true }
            );
            console.log(`Seeded account for ${account.dept}: ${account.email}`);
        }
        
        console.log('All Department Accounts Successfully Restored to the Live Cloud Database!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedDepartments();
