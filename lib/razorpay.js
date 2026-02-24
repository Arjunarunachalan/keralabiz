import Razorpay from 'razorpay';

let razorpayClient = null;

export function getRazorpay() {
    if (!razorpayClient) {
        razorpayClient = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayClient;
}

// Plan IDs must be created in Razorpay dashboard and stored here
export const PLANS = {
    basic: {
        name: 'Basic Plan',
        amount: 49900, // ₹499 in paise
        planId: process.env.RAZORPAY_PLAN_BASIC_ID || '', // set after creating in Razorpay
    },
    featured: {
        name: 'Featured Plan',
        amount: 99900, // ₹999 in paise
        planId: process.env.RAZORPAY_PLAN_FEATURED_ID || '', // set after creating in Razorpay
    },
};
