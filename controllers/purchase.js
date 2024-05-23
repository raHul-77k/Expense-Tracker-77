const Razorpay = require('razorpay');
const Order = require('../models/Order');
require('dotenv').config();

const premiumpurchase = async (req, res) => {
    try {
        const rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const amount = 2500;

        rzp.orders.create({ amount, currency: "INR" }, async (err, order) => {
            if (err) {
                console.error('Error creating Razorpay order:', err);
                return res.status(401).json({ message: 'Authentication failed', error: err });
            }

            console.log('Razorpay Order Created:', order);

            try {
                // Ensuring correct field names
                const newOrder = await req.user.createOrder({ orderId: order.id, status: 'PENDING' });
                console.log('Order saved to database:', newOrder);
                return res.status(201).json({ order, key_id: rzp.key_id });
            } catch (dbError) {
                console.error('Error saving order to database:', dbError.message);
                console.error('DB Error Stack:', dbError.stack);
                return res.status(500).json({ message: 'Error saving order to database', error: dbError.message });
            }
        });
    } catch (err) {
        console.error('Error in premiumpurchase:', err);
        res.status(403).json({ message: 'Something went wrong', error: err });
    }
};

const updateTransactionStatus = async (req, res) => {
    try {
        const { order_id, payment_id } = req.body;

        const order = await Order.findOne({ where: { orderId: order_id } });
        if (!order) {
            console.error('Order not found:', order_id);
            return res.status(404).json({ message: 'Order not found' });
        }

        await order.update({ paymentId: payment_id, status: 'SUCCESSFUL' });
        await req.user.update({ ispremiumuser: true });
        
        console.log('Transaction updated successfully');
        return res.status(202).json({ success: true, message: "Transaction Successful" });
    } catch (err) {
        console.error('Error updating transaction status:', err);
        res.status(500).json({ message: 'Error updating transaction status', error: err });
    }
};

module.exports = {
    premiumpurchase,
    updateTransactionStatus
};
