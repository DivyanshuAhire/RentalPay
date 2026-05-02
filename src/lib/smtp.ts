import nodemailer from "nodemailer";

export async function sendEmail(email: string, subject: string, text: string) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;
  if (!user || !pass) {
    console.log("[DEV] GMAIL_USER or GMAIL_PASS not set. Simulating email:");
    console.log(`To: ${email} | Subject: ${subject} | Text: ${text}`);
    return true;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const mailOptions = {
    from: `StyleP2P <${user}>`,
    to: email,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("[Gmail SMTP] Email failed:", error);
    return false;
  }
}
