export interface Option {
  label: string;
  next?: string;
  answer?: string;
}

export interface SupportNode {
  message: string;
  options: Option[];
}

export interface SupportFlow {
  [key: string]: SupportNode;
}

export const supportFlow: SupportFlow = {
  start: {
    message: "Hi 👋 Welcome to RentalPay Support. What do you need help with?",
    options: [
      { label: "Renting an Outfit", next: "renting" },
      { label: "Payments & Refunds", next: "payments" },
      { label: "Pickup & Return", next: "pickup" },
      { label: "Listing My Outfit", next: "listing" },
      { label: "Account & Verification", next: "account" },
      { label: "Security Deposit", next: "deposit" },

      { label: "Technical Problems", next: "technical" }
    ]
  },

  // =========================
  // RENTING
  // =========================
  renting: {
    message: "Choose a renting-related topic",
    options: [
      {
        label: "How renting works",
        answer:
          "Browse outfits, select available dates, choose rental duration, complete payment, and coordinate pickup/return with the owner."
      },
      {
        label: "How pricing works",
        answer:
          "Rental cost is calculated based on the number of rental days plus a refundable security deposit."
      },
      {
        label: "Availability calendar",
        answer:
          "Listings show an availability calendar. Dates already booked are marked unavailable."
      },
      {
        label: "How long can I rent?",
        answer:
          "Rental duration depends on the listing and owner preferences."
      },
      {
        label: "Go Back",
        next: "start"
      }
    ]
  },

  // =========================
  // PAYMENTS
  // =========================
  payments: {
    message: "Select a payment issue",
    options: [
      {
        label: "Payment Failed",
        answer:
          "Please retry after checking your bank balance, UPI app, or card status. If money was deducted but order failed, contact support."
      },
      {
        label: "Refund Status",
        answer:
          "Refund processing depends on order completion and admin approval timelines."
      },
      {
        label: "Razorpay Payments",
        answer:
          "RentalPay uses Razorpay for secure rental and security deposit payments."
      },
      {
        label: "Money deducted but no booking",
        answer:
          "Please wait a few minutes for payment verification. If the issue continues, contact support with payment details."
      },
      {
        label: "Payouts to Owners",
        answer:
          "Owners can receive payouts through connected bank accounts or UPI IDs."
      },
      {
        label: "Go Back",
        next: "start"
      }
    ]
  },

  // =========================
  // PICKUP & RETURN
  // =========================
  pickup: {
    message: "Choose pickup or return help",
    options: [
      {
        label: "How pickup works",
        answer:
          "Pickup coordination is managed between the renter and the outfit owner."
      },
      {
        label: "How return works",
        answer:
          "Items must be returned on the agreed return date after rental completion."
      },
      {
        label: "Pickup OTP",
        answer:
          "Pickup and return OTPs may be used to verify successful handover."
      },
      {
        label: "Late Return",
        answer:
          "Late returns may impact deposits or future rentals depending on the situation."
      },
      {
        label: "Item damaged during rental",
        answer:
          "Damage disputes may affect security deposit refunds after review."
      },
      {
        label: "Go Back",
        next: "start"
      }
    ]
  },

  // =========================
  // LISTING
  // =========================
  listing: {
    message: "Choose a listing-related topic",
    options: [
      {
        label: "How to list outfits",
        answer:
          "Go to your dashboard and create a listing with title, description, pricing, deposit amount, category, size, gender, and images."
      },
      {
        label: "Listing approval",
        answer:
          "All listings are reviewed by admins before becoming publicly visible."
      },
      {
        label: "Why was my listing rejected?",
        answer:
          "Listings may be rejected for poor-quality images, incomplete information, policy violations, or inappropriate content."
      },
      {
        label: "Editing a listing",
        answer:
          "You can update listing details from your profile/dashboard section."
      },
      {
        label: "Required images",
        answer:
          "Upload clear, high-quality outfit images for better approval chances and visibility."
      },
      {
        label: "Go Back",
        next: "start"
      }
    ]
  },

  // =========================
  // ACCOUNT
  // =========================
  account: {
    message: "Select an account-related issue",
    options: [
      {
        label: "Phone Verification",
        answer:
          "Phone verification is required for account security and rental protection."
      },
      {
        label: "OTP Not Received",
        answer:
          "Wait a few minutes, check network signal, and retry OTP verification."
      },
      {
        label: "Login Problems",
        answer:
          "Ensure your credentials are correct and your account is verified."
      },

      {
        label: "Go Back",
        next: "start"
      }
    ]
  },

  // =========================
  // SECURITY DEPOSIT
  // =========================
  deposit: {
    message: "Choose a security deposit topic",
    options: [
      {
        label: "Why security deposit is required",
        answer:
          "Security deposits help protect outfit owners against damage, misuse, or late returns."
      },
      {
        label: "When deposit is refunded",
        answer:
          "Deposits are generally processed after successful item return and verification."
      },
      {
        label: "Deposit refund pending",
        answer:
          "Refund requests may require admin confirmation and verification checks."
      },
      {
        label: "Deposit deduction",
        answer:
          "Deposit deductions may occur in cases of damage, policy violations, or severe late returns."
      },
      {
        label: "Go Back",
        next: "start"
      }
    ]
  },

  // =========================
  // ADMIN
  // =========================


  // =========================
  // TECHNICAL
  // =========================
  technical: {
    message: "Choose a technical issue",
    options: [
      {
        label: "Website not loading",
        answer:
          "Try refreshing the page, clearing browser cache, or switching networks."
      },
      {
        label: "Images not uploading",
        answer:
          "Ensure stable internet connection and supported image formats."
      },
      {
        label: "Calendar issue",
        answer:
          "If booking dates are not displaying correctly, refresh the page or retry later."
      },
      {
        label: "Mobile responsiveness issue",
        answer:
          "Please report device model and browser details to support."
      },
      {
        label: "Unexpected error",
        answer:
          "An unexpected issue occurred. Please retry later or contact support."
      },
      {
        label: "Go Back",
        next: "start"
      }
    ]
  },

  // =========================
  // GLOBAL END NODE
  // =========================
  fallback: {
    message: "Still need help?",
    options: [
      {
        label: "Contact Support",
        answer:
          "Please contact the RentalPay support team through email or WhatsApp support."
      },
      {
        label: "Restart",
        next: "start"
      }
    ]
  }
};
