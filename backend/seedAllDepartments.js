require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const departments = [
    { email: 'dsw@cumail.in', dept: 'DSW', name: 'DSW Head', uid: 'DSW001' },
    { email: 'dcpd@cumail.in', dept: 'DCPD', name: 'DCPD Head', uid: 'DCPD001' },
    { email: 'fee@cumail.in', dept: 'Fee Department', name: 'Fee Manager', uid: 'FEE001' },
    { email: 'academics@cumail.in', dept: 'Academics', name: 'Academics Head', uid: 'ACAD001' },
    { email: 'hod@cumail.in', dept: 'HOD', name: 'Head of Dept', uid: 'HOD001' },
    { email: 'egovernance@cumail.in', dept: 'E-Governance', name: 'E-Gov Head', uid: 'EGOV001' },
    { email: 'security@cumail.in', dept: 'Security', name: 'Security Chief', uid: 'SEC001' },
    { email: 'food@cumail.in', dept: 'Food', name: 'Food/Mess Head', uid: 'FOOD001' },
    { email: 'hostel@cumail.in', dept: 'Hostel', name: 'Hostel Manager', uid: 'HSTL001' },
    { email: 'teacher@cumail.in', dept: 'Teacher', name: 'Demo Teacher', uid: 'TCH001' },
    { email: 'faculty@cumail.in', dept: 'Faculty', name: 'Demo Faculty', uid: 'FAC001' }
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
        }
        
        console.log('Successfully seeded the remaining departments!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedDepartments();
