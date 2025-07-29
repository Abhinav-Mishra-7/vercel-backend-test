// routes/paymentRoutes.js
const express = require('express');
const paymentRouter = express.Router();
const { createOrder, verifyPayment , getLastPayment} = require('../controllers/paymentController');
const userMiddleware = require("../middleware/userMiddleware");

// Route for creating a Razorpay order
paymentRouter.post('/create-order', userMiddleware, createOrder);

// Route for verifying the payment after it's completed on the frontend
paymentRouter.post('/verify-payment', userMiddleware, verifyPayment);

// Getting  the last payment done by user
paymentRouter.get('/last-payment', userMiddleware, getLastPayment);

module.exports = paymentRouter;