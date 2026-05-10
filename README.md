# Eventure - Online Event Management Platform 🚀

Eventure is a premium, full-stack MERN (MongoDB, Express, React, Node.js) platform designed for seamless event discovery, booking, and management. It features a sleek, modern UI with high-end animations and a robust backend architecture.

---

## 🌟 Key Features

### **For Users**
- **Dynamic Event Discovery:** Browse 25+ high-quality events across categories like Tech, Music, Sports, Food, and Art.
- **Advanced Wishlist (Saved Events):** Save events you're interested in and view them in a dedicated dashboard tab.
- **Realistic Payment Experience:**
    - **Card Payments:** Interactive virtual card preview with live data syncing.
    - **UPI / QR Payments:** Integrated support for **GPay, Paytm, and PhonePe** simulation.
- **Ticket Management:** View your booked tickets with unique **QR Codes**, download them for offline use, or cancel bookings.
- **Real-time Availability:** Live ticket counting and visual alerts ("Only 5 tickets left!") to drive urgency.
- **Native Sharing:** Integrated **Web Share API** for one-click sharing on mobile devices.

### **For Organizers & Admins**
- **Admin Dashboard:** Exclusive access for administrators to manage the entire platform.
- **Organizer Analytics:** Track revenue trends, total tickets sold, and detailed registration lists for every event.
- **Event Management:** Create, edit, and delete events with a user-friendly interface.

---

## 🔑 Demo Credentials

Test the platform with these pre-configured accounts:

### **Administrator Account**
Access the hidden Admin panel and full organizer statistics.
- **Email:** `admin@eventure.com`
- **Password:** `password123`

### **Standard User Account**
Experience the booking flow and wishlist features.
- **Email:** `user@example.com`
- **Password:** `password123` (or register a new account instantly)

---

## 🛠️ Tech Stack

- **Frontend:** React.js (Vite), Tailwind CSS, Lucide Icons, Framer Motion
- **Backend:** Node.js, Express.js
- **Database:** MongoDB & Mongoose
- **Authentication:** JWT (JSON Web Tokens) with secure password hashing
- **Payments:** Stripe Integration (with professional fallback Demo Mode)
- **Email:** Brevo (formerly SendinBlue) integration for verification

---

## 🚀 Getting Started

### **1. Backend Setup**
1. Navigate to the `/backend` directory.
2. Install dependencies: `npm install`
3. Create a `.env` file:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   # Optional: STRIPE_SECRET_KEY, BREVO_API_KEY
   ```
4. Seed the initial events: `npm run seed`
5. Start the server: `npm run dev`

### **2. Frontend Setup**
1. Navigate to the `/frontend` directory.
2. Install dependencies: `npm install`
3. Start the application: `npm run dev`

---

## 💳 Realistic Payment Simulation
The platform includes a custom-built, professional-grade **Demo Payment Gateway**. If no Stripe keys are found, it automatically switches to this mode, allowing you to:
- Fill in Card details manually (try number `4242...`).
- Choose between Card and UPI methods.
- Experience realistic "Verifying with bank..." delays.
- Process successful registrations for the user's dashboard.

---

Built with ❤️ by the Eventure Team
