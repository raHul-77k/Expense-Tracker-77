const Razorpay = require('razorpay');
const Order = require('../models/Order');

const premiumpurchase = async (req, res) => {
    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        const amount = 2500;
        rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
            if (err) {
                throw new Error(JSON.stringify(err));
            }
            req.user.createOrder({ orderid: order.id, status: 'PENDING' }).then(() => {
                return res.status(201).json({ order, key_id: rzp.key_id });
            }).catch(err => {
                throw new Error(err);
            });
        });
    } catch (err) {
        console.log(err);
        res.status(403).json({ message: 'something went wrong', error: err });
    }
};



const updateTransactionStatus = async (req, res) => {
    try {
        const { order_id, payment_id } = req.body;
        Order.findOne({where : {orderid: order_id}}).then(order=>{
            order.update({paymentid: payment_id, status: 'SUCCESSFUL'}).then(() =>{
                req.user.update({ispremiumuser:true}).then(()=>{
                    return res.status(202).json({success:true, message:"Transaction Successful"});
                }).catch((err)=>{
                    throw new Error(err);
                })
            }).catch((err)=>{
                throw new Error
            })
        })
    } catch (err) {
        console.error("Error updating transaction status:", err);
        res.status(500).json({ message: 'Error updating transaction status', error: err });
    }
};

module.exports = {
    premiumpurchase,
    updateTransactionStatus
};
