import { sendEmail } from "./smtp";

export async function sendEmailOTP(email: string, code: string) {
  return sendEmail(email, "StyleP2P Verification Code", `Your OTP code is: ${code}`);
}

export async function sendNotificationEmail(email: string, subject: string, message: string) {
  return sendEmail(email, subject, message);
}
