import nodemailer from "nodemailer";

export async function sendGmailOTP(email: string, code: string) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;
  if (!user || !pass) {
    console.log("[DEV] GMAIL_USER or GMAIL_PASS not set. Simulating email OTP:");
    console.log(`To: ${email} | OTP: ${code}`);
    return true;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const mailOptions = {
    from: `RentalPay <${user}>`,
    to: email,
    subject: "RentalPay OTP Code",
    text: `Your OTP code is: ${code}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("[Gmail SMTP] Email OTP failed:", error);
    return false;
  }
}
