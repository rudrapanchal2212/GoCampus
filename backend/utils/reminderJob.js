const cron = require('node-cron');
const Event = require('../models/Event');
const User = require('../models/User');
const { sendEventReminderEmail } = require('./emailService');

/**
 * Runs every day at 08:00 AM.
 * Finds all events happening exactly tomorrow, then emails every
 * student whose registration is 'approved'.
 */
const startReminderJob = () => {
    cron.schedule('0 8 * * *', async () => {
        console.log('[ReminderJob] Running daily event reminder check...');

        try {
            const now = new Date();
            // Build tomorrow's date range (midnight-to-midnight UTC)
            const tomorrowStart = new Date(now);
            tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);
            tomorrowStart.setUTCHours(0, 0, 0, 0);

            const tomorrowEnd = new Date(tomorrowStart);
            tomorrowEnd.setUTCHours(23, 59, 59, 999);

            const events = await Event.find({
                isActive: true,
                isApproved: true,
                date: { $gte: tomorrowStart, $lte: tomorrowEnd },
            }).populate({
                path: 'registrations.user',
                select: 'name email',
            });

            let emailsSent = 0;
            for (const event of events) {
                const approvedRegs = event.registrations.filter(
                    r => r.status === 'approved' && r.user?.email
                );

                for (const reg of approvedRegs) {
                    try {
                        await sendEventReminderEmail({ student: reg.user, event });
                        emailsSent++;
                    } catch (err) {
                        console.error(`[ReminderJob] Failed for user ${reg.user?.email}:`, err.message);
                    }
                }
            }

            console.log(`[ReminderJob] Done. Sent ${emailsSent} reminder(s) for ${events.length} event(s).`);
        } catch (err) {
            console.error('[ReminderJob] Cron job error:', err.message);
        }
    });

    console.log('[ReminderJob] 24-hour event reminder cron job scheduled (runs daily at 08:00 AM).');
};

module.exports = { startReminderJob };
