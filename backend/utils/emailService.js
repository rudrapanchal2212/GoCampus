const nodemailer = require('nodemailer');

// Create a transporter — configure via .env
const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,  // Use an App Password from Google, not your real password
        },
    });
};

// Generic send function
const sendEmail = async ({ to, subject, html }) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('[EmailService] EMAIL_USER or EMAIL_PASS not set. Skipping email to:', to);
        return;
    }
    try {
        const transporter = createTransporter();
        const info = await transporter.sendMail({
            from: `"GoCampus 🎓" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log(`[EmailService] Email sent to ${to}: ${info.messageId}`);
    } catch (error) {
        // Never crash the app due to email failures
        console.error('[EmailService] Failed to send email:', error.message);
    }
};

// ──────────────────────────────────────────────────
// TEMPLATE 1 — Registration Approved
// ──────────────────────────────────────────────────
const sendRegistrationApprovedEmail = async ({ student, event }) => {
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    await sendEmail({
        to: student.email,
        subject: `✅ Registration Approved – ${event.title}`,
        html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 1.8rem;">🎉 You're In!</h1>
                <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0;">Your registration has been approved</p>
            </div>
            <div style="padding: 32px;">
                <p style="color: #374151; font-size: 1rem;">Hi <strong>${student.name}</strong>,</p>
                <p style="color: #4b5563;">Great news! Your registration for the following event has been <strong style="color: #10b981;">approved</strong>.</p>

                <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 24px 0;">
                    <h2 style="color: #1f2937; margin: 0 0 12px 0;">${event.title}</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="color: #6b7280; padding: 6px 0;">📅 Date</td><td style="color: #111827; font-weight: 600;">${eventDate}</td></tr>
                        <tr><td style="color: #6b7280; padding: 6px 0;">🕐 Time</td><td style="color: #111827; font-weight: 600;">${event.time}${event.endTime ? ' – ' + event.endTime : ''}</td></tr>
                        <tr><td style="color: #6b7280; padding: 6px 0;">📍 Location</td><td style="color: #111827; font-weight: 600;">${event.location}</td></tr>
                        <tr><td style="color: #6b7280; padding: 6px 0;">🏛️ Organizer</td><td style="color: #111827; font-weight: 600;">${event.organizer}</td></tr>
                    </table>
                </div>

                <p style="color: #4b5563;">Make sure to be on time. We look forward to seeing you there!</p>
                <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 0.85rem;">
                    GoCampus – Campus Event Management System
                </div>
            </div>
        </div>`,
    });
};

// ──────────────────────────────────────────────────
// TEMPLATE 2 — 24-Hour Reminder
// ──────────────────────────────────────────────────
const sendEventReminderEmail = async ({ student, event }) => {
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    await sendEmail({
        to: student.email,
        subject: `⏰ Reminder: "${event.title}" is Tomorrow!`,
        html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 1.8rem;">⏰ Event Tomorrow!</h1>
                <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0;">Don't forget your upcoming event</p>
            </div>
            <div style="padding: 32px;">
                <p style="color: #374151; font-size: 1rem;">Hi <strong>${student.name}</strong>,</p>
                <p style="color: #4b5563;">This is a friendly reminder that an event you are registered for is happening <strong style="color: #d97706;">tomorrow</strong>.</p>

                <div style="background: #fffbeb; border: 2px solid #fef3c7; border-radius: 8px; padding: 20px; margin: 24px 0;">
                    <h2 style="color: #1f2937; margin: 0 0 12px 0;">${event.title}</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="color: #6b7280; padding: 6px 0;">📅 Date</td><td style="color: #111827; font-weight: 600;">${eventDate}</td></tr>
                        <tr><td style="color: #6b7280; padding: 6px 0;">🕐 Time</td><td style="color: #111827; font-weight: 600;">${event.time}${event.endTime ? ' – ' + event.endTime : ''}</td></tr>
                        <tr><td style="color: #6b7280; padding: 6px 0;">📍 Location</td><td style="color: #111827; font-weight: 600;">${event.location}</td></tr>
                    </table>
                </div>

                <p style="color: #4b5563;">Please plan accordingly. See you there! 🎊</p>
                <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 0.85rem;">
                    GoCampus – Campus Event Management System
                </div>
            </div>
        </div>`,
    });
};

// ──────────────────────────────────────────────────
// TEMPLATE 3 — Venue / Time Change Alert
// ──────────────────────────────────────────────────
const sendEventUpdateEmail = async ({ student, event, changes }) => {
    const changesList = changes.map(c =>
        `<li style="margin-bottom: 8px;"><strong>${c.field}:</strong> 
         <span style="text-decoration: line-through; color: #ef4444;">${c.old}</span> &rarr; 
         <span style="color: #10b981; font-weight: bold;">${c.new}</span></li>`
    ).join('');

    await sendEmail({
        to: student.email,
        subject: `⚠️ Event Updated: "${event.title}"`,
        html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <div style="background: linear-gradient(135deg, #dc2626, #9333ea); padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 1.8rem;">⚠️ Event Updated</h1>
                <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0 0;">Important changes were made to an event you registered for</p>
            </div>
            <div style="padding: 32px;">
                <p style="color: #374151; font-size: 1rem;">Hi <strong>${student.name}</strong>,</p>
                <p style="color: #4b5563;">An event you registered for, <strong>${event.title}</strong>, has been updated. Please review the changes below:</p>

                <div style="background: #fef2f2; border: 2px solid #fecaca; border-radius: 8px; padding: 20px; margin: 24px 0;">
                    <h3 style="margin: 0 0 12px 0; color: #b91c1c;">What Changed:</h3>
                    <ul style="list-style: none; margin: 0; padding: 0; color: #374151;">
                        ${changesList}
                    </ul>
                </div>

                <p style="color: #4b5563;">Please update your plans accordingly.</p>
                <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 0.85rem;">
                    GoCampus – Campus Event Management System
                </div>
            </div>
        </div>`,
    });
};

module.exports = {
    sendRegistrationApprovedEmail,
    sendEventReminderEmail,
    sendEventUpdateEmail,
};
