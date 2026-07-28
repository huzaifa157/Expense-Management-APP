const nodemailer = require("nodemailer");

// Built lazily (not at module load time) so it always reads env vars after
// dotenv.config() has actually run, regardless of require order.
const getTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

const sendResetCodeEmail = async (to, code) => {
  await getTransporter().sendMail({
    from: `Expense Tracker <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your password reset code",
    text: `Your password reset code is ${code}. It expires in 15 minutes. If you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: auto;">
        <h2>Password Reset</h2>
        <p>Use the code below to reset your Expense Tracker password. It expires in 15 minutes.</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p style="color: #888; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendResetCodeEmail };
