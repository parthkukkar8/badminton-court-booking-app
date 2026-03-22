const nodemailer = require('nodemailer');

// Setup Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBookingConfirmation = async (data) => {
  const { userEmail, userName, courtName, startTime, endTime, amount } = data;

  const mailOptions = {
    from: `"BadmintonBook 🏸" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Booking Confirmed — ${courtName} 🏸`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        
        <div style="background-color: #166534; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">🏸 BadmintonBook</h1>
        </div>

        <div style="padding: 32px; background-color: #f9fafb; border-radius: 0 0 12px 12px;">
          <h2 style="color: #111827;">Booking Confirmed! ✅</h2>
          <p style="color: #6b7280;">Hi ${userName},</p>
          <p style="color: #6b7280;">
            Your badminton court booking has been confirmed. 
            See you on the court!
          </p>

          <div style="background-color: white; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="color: #166534; margin-top: 0;">Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Court</td>
                <td style="padding: 8px 0; color: #111827; font-weight: bold;">
                  ${courtName}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Time Slot</td>
                <td style="padding: 8px 0; color: #111827; font-weight: bold;">
                  ${startTime} – ${endTime}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Amount Paid</td>
                <td style="padding: 8px 0; color: #166534; font-weight: bold;">
                  ₹${amount}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Status</td>
                <td style="padding: 8px 0; color: #166534; font-weight: bold;">
                  Confirmed ✅
                </td>
              </tr>
            </table>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            Questions? Call us at <strong>6283382129</strong>
          </p>

          <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
            © 2024 BadmintonBook. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${userEmail}`);
  } catch (error) {
    console.error('❌ Email failed:', error.message);
  }
};

module.exports = { sendBookingConfirmation };