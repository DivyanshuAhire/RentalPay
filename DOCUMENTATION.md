# RentalPay - Project Documentation

RentalPay is a premium peer-to-peer designer clothing rental platform. It enables users to list their high-end outfits for rent and allows others to book them for specific durations with secure payment and deposit management.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: [Base UI](https://base-ui.com/) (Headless UI components)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: 
  - Custom JWT-based Email/Password Auth
  - [Firebase Auth](https://firebase.google.com/docs/auth) for Phone OTP Verification
- **Payments**: [Razorpay](https://razorpay.com/) (Integrated for rentals and security deposits)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Toasts**: [Sonner](https://react-hot-toast.com/)

---

## 🏗️ Project Architecture

### Directory Structure
- `src/app`: Next.js App Router (Pages and API routes)
- `src/components`: Reusable UI components (shadcn-like structure using Base UI)
- `src/models`: Mongoose schemas (User, Listing, Order, Settings)
- `src/context`: React Context providers (Auth, etc.)
- `src/lib`: Utility functions, database connection, and third-party initializations
- `public`: Static assets (images, fonts)

### Data Models
1. **User**: Profiles, roles (USER, ADMIN, TESTER), bank/UPI details for payouts.
2. **Listing**: Title, description, price per day, deposit, images, category, gender, size, and status (Approved/Pending/Rejected).
3. **Order**: Tracks rentals, payment status, start/end dates, delivery preference, and OTPs for pickup/return.
4. **Settings**: Global system controls (Banner message, Phone Auth toggle).

---

## ✨ Key Features

### 1. Advanced Booking System
- **Duration-Based**: Users select a start date and the number of days for rental.
- **Availability Calendar**: An interactive calendar shows available dates and marks already booked dates with a cross (X).
- **Automated Pricing**: Calculates total rental price plus a refundable security deposit.

### 2. Secure Financial Workflow
- **Razorpay Integration**: Handles real-time payments for both rental fees and security deposits.
- **Payout Management**: Owners can connect their Bank Accounts or UPI IDs to receive earnings.
- **Security Deposit**: Deposits are held and can be requested for refund after the item is returned.

### 3. Comprehensive Admin Dashboard
- **Listing Moderation**: Admins review, approve, or reject new listings.
- **Payout Processing**: Admins manage and confirm payout requests for both owner earnings and renter deposits.
- **System Control Panel**:
  - **Banner Message**: Customizable red rotating text (marquee) at the top of the site.
  - **Banner Visibility**: Toggle to turn the marquee on or off.
  - **Testing Mode**: Option to enable/disable real phone OTP verification for easier testing/development.

### 4. User Profile & Security
- **Phone Verification**: Mandatory phone verification via Firebase OTP (can be toggled by Admin).
- **Role-Based Access**: Specialized views and permissions for Regular Users and Admins.
- **Simulation Mode**: Special `TESTER` role allows bypassing Razorpay for end-to-end flow testing.

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Instance (Atlas or Local)
- Firebase Project (for Phone Auth)
- Razorpay Account (for Payments)

### Environment Variables (.env.local)
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
NEXT_PUBLIC_FIREBASE_CONFIG=your_firebase_json_config
FIREBASE_SERVICE_ACCOUNT=your_firebase_admin_sdk_json
```

### Installation
1. Clone the repository
2. Run `npm install`
3. Run `npm run dev` to start the development server

---

## 🚢 Deployment

The project is optimized for deployment on **Vercel**. 
> [!IMPORTANT]
> Ensure all Environment Variables are configured in the Vercel Dashboard.
> The build process uses the `render` pattern for Base UI components to avoid TypeScript `asChild` errors.

---

## 📈 Future Roadmap
- [ ] Real-time Chat between owners and renters.
- [ ] AI-powered image moderation for listings.
- [ ] Native Mobile App (React Native).
- [ ] Multi-currency support for international expansion.
