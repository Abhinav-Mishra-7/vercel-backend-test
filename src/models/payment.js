const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user', 
        required: true,
    },
    emailId: { // Store the email for reference, but it's not unique
        type: String,
        required: true,
    },
    plan: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    razorpayOrderId: {
        type: String,
        required: true,
    },
    razorpayPaymentId: {
        type: String,
        required: true,
        unique: true, // The payment ID from Razorpay is always unique
    },
    razorpaySignature: {
        type: String,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['created', 'succeeded', 'failed'],
        default: 'succeeded', // We only create this record on success
    },
    // 'endDate' was here, but it's better to get this from the User model
    // to keep a single source of truth for the subscription's end.
}, { timestamps: true }); // timestamps adds createdAt and updatedAt

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;