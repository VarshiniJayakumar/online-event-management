# Eventure - Online Event Management Platform

Eventure is a fully functional, MERN-stack event management platform that allows users to discover, book, and manage events. It features dynamic routing, an elegant UI, and robust backend logic.

## Features

- **User Authentication:** Secure registration and login with JWT and email verification via Brevo.
- **Event Discovery:** Browse a wide variety of seeded events across categories like Tech, Music, Sports, Food, Business, and Art.
- **Event Booking:** Users can seamlessly book tickets for free or paid events.
- **Demo Payment Gateway:** The application includes a "Demo Mode" for payments if a real Stripe API key isn't provided, simulating successful checkouts without requiring real cards.
- **Dashboard:** Manage your tickets, view QR codes, and download or cancel bookings.
- **Admin/Organizer Analytics:** Organizers have a dedicated analytics tab to track revenue, tickets sold, and registrations for their managed events.
- **Wishlist & Sharing:** Save events to your wishlist and copy links to share with friends.
- **Ticket Availability Tracking:** See exactly how many tickets are left for any given event.
- **Past Event Prevention:** Users cannot book events that have already occurred.

## Demo Credentials

You can log in to explore the Organizer/Admin dashboard with the following credentials:
- **Email:** `admin@eventure.com`
- **Password:** `password123`

## Setup & Installation

### Backend
1. Navigate to the `backend` folder.
2. Install dependencies: `npm install`
3. Create a `.env` file based on your configuration requirements. Example:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   # To enable real Stripe payments, add:
   # STRIPE_SECRET_KEY=sk_test_...
   # To enable email verification, add:
   # BREVO_API_KEY=your_brevo_api_key
   ```
   *Note: If `STRIPE_SECRET_KEY` is not provided, the platform automatically switches to a simulated Demo Mode.*
4. Seed the database (optional but recommended): `npm run seed`
5. Start the server: `npm start` or `npm run dev`

### Frontend
1. Navigate to the `frontend` folder.
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

## Payment Gateway Details

A fully integrated Stripe payment flow exists in `backend/routes/paymentRoutes.js`. However, to facilitate easy local testing without setting up Stripe, the code gracefully falls back to a **Demo Checkout Mode** when the `STRIPE_SECRET_KEY` is missing or invalid. In Demo Mode, the registration successfully processes as a simulated payment.

## Built With
- MongoDB & Mongoose
- Express.js
- React.js (Vite)
- Node.js
- Tailwind CSS
- Stripe
