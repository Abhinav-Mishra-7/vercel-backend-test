const crypto = require('crypto');
const User = require('../models/user');
const Payment = require('../models/Payment');
const razorpay = require("../config/razorpay") ;

const PLANS = {
    'free-trial': { name: 'Free Trial', price: 0, durationInDays: 7, currency: 'inr' },
    'monthly': { name: 'Monthly', price: 10, durationInDays: 30, currency: 'inr' },
    'yearly': { name: 'Yearly', price: 100, durationInDays: 365, currency: 'inr' },
    'lifetime': { name: 'Lifetime', price: 200, durationInDays: null , currency: 'inr' },
};

const createOrder = async (req, res) => {
    try {
        const { planId } = req.body;
        const userId = req.result.id; // From your userMiddleware
        const plan = PLANS[planId];
        
        if (!plan) {
            return res.status(400).json({ message: 'Invalid plan selected.' });
        }
        if (planId === 'free-trial') {
            return res.status(400).json({ message: 'Free trials cannot be processed as payments.'});
        }

        const options = {
            amount: Number(plan.price * 100) , // amount in the smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_order_${new Date().getTime()}`,
            notes: {
                planId: planId,
                userId: userId,
            }
        };

        const order = await razorpay.orders.create(options);
        
        res.status(200).json({ 
            orderId: order.id,
            currency: order.currency,
            amount: order.amount,
            keyId: process.env.RAZORPAY_KEY_ID // Send key to frontend
        });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Server error while creating order.' });
    }
};

/**
 * @desc    Verify payment signature and update user status
 * @route   POST /payments/verify-payment
 * @access  Private
 */
const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.result.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: 'Payment details are missing.' });
    }

    try {
        // 1. Verify the signature (same as before)
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
        }
        
        // --- NEW LOGIC STARTS HERE ---

        // 2. Fetch User and Order details
        const [user, orderDetails] = await Promise.all([
            User.findById(userId),
            razorpay.orders.fetch(razorpay_order_id)
        ]);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        if (orderDetails.notes.userId !== userId) {
            return res.status(400).json({ message: 'Order does not belong to the authenticated user.' });
        }

        const planId = orderDetails.notes.planId;
        const plan = PLANS[planId];
        const now = new Date();

        // 3. Determine the subscription start date
        const startDate = (user.isPremium && user.premiumUntil > now)
            ? new Date(user.premiumUntil) // Start from the end of the current plan
            : now;                      // Start from today

        // 4. Calculate the new expiry date
        const newPremiumUntil = new Date(startDate);
        newPremiumUntil.setDate(newPremiumUntil.getDate() + plan.durationInDays);

        // 5. Create a record in the Payment collection
        await Payment.create({
            userId,
            plan: planId,
            emailId: req.result.emailId ,
            amount: orderDetails.amount,
            currency: orderDetails.currency,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            paymentStatus: 'succeeded',
            startDate: now, // The payment happened now
            endDate: newPremiumUntil, // The calculated new expiry date
        });

        // 6. Update User's premium status in the database
        await User.findByIdAndUpdate(userId, {
            isPremium: true,
            premiumUntil: newPremiumUntil,
        });

        res.status(200).json({ 
            message: `Payment successful! Your subscription is now active until ${newPremiumUntil.toDateString()}.`,
            planId: planId,
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        // Log the detailed error for debugging
        if (error.response) {
            console.error('Razorpay Error Response:', error.response.data);
        }
        res.status(500).json({ message: 'Server error while verifying payment.' });
    }
};


const getLastPayment = async (req, res) => {
    try {
        const userId = req.result.id; // From userMiddleware

        // Find the most recent payment for this user that was successful.
        // We sort by 'createdAt' in descending order and take the first one.
        const lastPayment = await Payment.findOne({
            userId: userId,
            paymentStatus: 'succeeded',
        }).sort({ createdAt: -1 });

        if (!lastPayment) {
            // It's okay if a user has no payment history, just return null.
            return res.status(200).json({ lastPayment: null });
        }

        res.status(200).json({ lastPayment });

    } catch (error) {
        console.error('Error fetching last payment:', error);
        res.status(500).json({ message: 'Server error while fetching payment history.' });
    }
};


module.exports = {createOrder,verifyPayment,getLastPayment};