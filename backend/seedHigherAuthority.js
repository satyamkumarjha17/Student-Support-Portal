require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const departments = [
    { email: 'head.dsw@cumail.in', dept: 'DSW', name: 'DSW Higher Authority', uid: 'HEAD_DSW001' },
    { email: 'head.dcpd@cumail.in', dept: 'DCPD', name: 'DCPD Higher Authority', uid: 'HEAD_DCPD001' },
    { email: 'head.fee@cumail.in', dept: 'Fee Department', name: 'Fee Higher Authority', uid: 'HEAD_FEE001' },
    { email: 'head.academics@cumail.in', dept: 'Academics', name: 'Academics Higher Authority', uid: 'HEAD_ACAD001' },
    { email: 'head.hod@cumail.in', dept: 'HOD', name: 'HOD Higher Authority', uid: 'HEAD_HOD001' },
    { email: 'head.egovernance@cumail.in', dept: 'E-Governance', name: 'E-Gov Higher Authority', uid: 'HEAD_EGOV001' },
    { email: 'head.security@cumail.in', dept: 'Security', name: 'Security Higher Authority', uid: 'HEAD_SEC001' },
    { email: 'head.food@cumail.in', dept: 'Food', name: 'Food Higher Authority', uid: 'HEAD_FOOD001' },
    { email: 'head.hostel@cumail.in', dept: 'Hostel', name: 'Hostel Higher Authority', uid: 'HEAD_HSTL001' },
    { email: 'head.teacher@cumail.in', dept: 'Teacher', name: 'Teacher Higher Authority', uid: 'HEAD_TCH001' },
    { email: 'head.faculty@cumail.in', dept: 'Faculty', name: 'Faculty Higher Authority', uid: 'HEAD_FAC001' },
    
    // From warden seed
    { email: 'head.it@cumail.in', dept: 'IT Support', name: 'IT Higher Authority', uid: 'HEAD_IT001' },
    { email: 'head.maintenance@cumail.in', dept: 'Maintenance', name: 'Maintenance Higher Authority', uid: 'HEAD_MAINT001' },
    { email: 'head.library@cumail.in', dept: 'Library', name: 'Library Higher Authority', uid: 'HEAD_LIB001' },
    { email: 'head.sports@cumail.in', dept: 'Sports', name: 'Sports Higher Authority', uid: 'HEAD_SPORT001' },
    { email: 'head.admin@cumail.in', dept: 'Administration', name: 'Admin Higher Authority', uid: 'HEAD_ADMIN001' },
];

const seedHigherAuthorities = async () => {
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
                    role: 'higher_authority', // Specific role requested
                    uid: account.uid,
                    department: account.dept,
                    designation: account.dept + ' Supreme Head',
                    isVerified: true
                },
                { upsert: true, new: true }
            );
            console.log(`Seeded higher authority account for ${account.dept}: ${account.email}`);
        }
        
        console.log('Successfully seeded all Higher Authority accounts!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seedHigherAuthorities();
