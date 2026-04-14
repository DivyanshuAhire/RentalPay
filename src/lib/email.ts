import { sendGmailOTP } from "./smtp";

export async function sendEmailOTP(email: string, code: string) {
  return sendGmailOTP(email, code);
}
