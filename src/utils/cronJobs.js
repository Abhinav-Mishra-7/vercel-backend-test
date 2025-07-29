// utils/cronJobs.js
const cron = require('node-cron');
const User = require('../models/user');

const checkPremiumExpiry = () => {
    // Schedule a task to run once every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily check for expired premium memberships...');
        try {
            const now = new Date();
            // Find users who are premium but their expiry date is in the past
            const expiredUsers = await User.updateMany(
                { 
                    isPremium: true, 
                    premiumUntil: { $ne: null, $lt: now } 
                },
                { $set: { isPremium: false, premiumUntil: null } }
            );

            if (expiredUsers.modifiedCount > 0) {
                console.log(`Deactivated premium for ${expiredUsers.modifiedCount} users.`);
            } else {
                console.log('No premium memberships expired today.');
            }
        } catch (error) {
            console.error('Error checking for expired premium memberships:', error);
        }
    });
};

module.exports = { checkPremiumExpiry };