import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';

dotenv.config();

const app = express();
const port = process.env.PORT || 4242;

app.use(cors({
    origin: 'http://localhost:5173',
}));
app.use(express.json());

if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Stripe secret key (STRIPE_SECRET_KEY) is not set. Checkout API will return errors until it is configured.');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

app.post('/api/create-checkout-session', async (req, res) => {
    try {
        if (!stripe) {
            return res.status(500).json({ error: 'Stripe is not configured on the server.' });
        }

        const { orderId, items, successUrl, cancelUrl } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'No items provided for checkout.' });
        }

        const lineItems = items.map((item) => {
            const unitAmount = Math.round((item.price || 0) * 100);

            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.name || 'Product',
                    },
                    unit_amount: unitAmount,
                },
                quantity: item.quantity || 1,
            };
        });

        const session = await stripe.checkout.sessions.create({
            ui_mode: 'hosted',
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            metadata: {
                orderId: String(orderId || ''),
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        console.log('Created Stripe Checkout session:', {
            id: session.id,
            url: session.url,
            status: session.status,
        });

        res.json({ id: session.id, url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session.' });
    }
});

app.listen(port, () => {
    console.log(`Stripe checkout server listening on port ${port}`);
});
