const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const stripeKey = process.env.STRIPE_SECRET_KEY;
console.log('Stripe Key:', stripeKey);

if (!stripeKey) {
  console.log('STRIPE_SECRET_KEY is not defined');
  process.exit(1);
}

const stripe = require('stripe')(stripeKey);

async function run() {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Test Event',
            },
            unit_amount: 1000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:5173/success',
      cancel_url: 'http://localhost:5173/cancel',
    });
    console.log('SUCCESS: Session created:', session.id);
  } catch (error) {
    console.error('ERROR: Failed to create session:', error.message);
  }
}

run();
