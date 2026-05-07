/**
 * WhatsApp Simulation Utility
 * This file handles sending WhatsApp messages (Simulated for development)
 */

export async function sendWhatsAppOTP(phone: string, code: string) {
  // SIMULATION: Log the OTP to the server terminal
  console.log("\n-------------------------------------------");
  console.log("🟢 [WHATSAPP SIMULATION]");
  console.log(`📱 TO: ${phone}`);
  console.log(`🔑 OTP: ${code}`);
  console.log("-------------------------------------------\n");

  /**
   * REAL IMPLEMENTATION EXAMPLE:
   * 
   * const res = await fetch("https://api.ultramsg.com/your-instance-id/messages/chat", {
   *   method: "POST",
   *   headers: { "Content-Type": "application/json" },
   *   body: JSON.stringify({
   *     token: "your-token",
   *     to: phone,
   *     body: `Your RentalPay verification code is: ${code}`
   *   })
   * });
   */

  return true;
}
