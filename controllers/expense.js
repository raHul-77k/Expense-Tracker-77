const Expense = require('../models/Expense');
const jwt = require('jsonwebtoken');
const sequelize = require('../util/database');
const AWS = require('aws-sdk');
require('dotenv').config();
const DownloadedExpense = require('../models/DownloadedExpense')

// Add Expense
exports.addExpense = async (req, res) => {
    const { amount, description, category } = req.body;

    if (amount === undefined || amount <= 0) {
        return res.status(400).json({ success: false, message: 'parameter missing or invalid' });
    }

    const t = await sequelize.transaction();

    try {
        const expense = await Expense.create(
            { amount, description, category, userId: req.user.id },
            { transaction: t }
        );

        const totalExpense = Number(req.user.totalExpense) + Number(amount);
        console.log(totalExpense);

        await User.update(
            { totalExpense: totalExpense },
            { where: { id: req.user.id }, transaction: t }
        );

        await t.commit();

        return res.status(200).json({ expense: expense });
    } catch (err) {
        await t.rollback();
        return res.status(500).json({ success: false, error: err.message });
    }
};

// Get Expenses
exports.getExpenses = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            console.error('User ID is missing in the request object');
            return res.status(400).json({ error: 'User ID is missing in the request object' });
        }

        const userId = req.user.id;
        console.log('User ID:', userId);

        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Expense.findAndCountAll({
            where: { userId },
            limit: limit,
            offset: offset,
        });

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            expenses: rows,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ error: 'An error occurred', details: error.message });
    }
};

// Delete Expense
exports.deleteExpense = async (req, res, next) => {
    try {
        const id = req.params.id;
        const userId = req.user.id;

        const expense = await Expense.findByPk(id);

        if (req.user.id === userId) {
            await expense.destroy();
            res.sendStatus(200);
        } else {
            res.status(400).json({ message: "unauthorised user", success: false })
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred', details: error.message });
    }
};


exports.downloadExpenses = async (req, res) => {
    try {
        // Fetch expenses from the database
        const expenses = await req.user.getExpenses();

        // Save expenses into the database
        await Promise.all(expenses.map(async (expense) => {
            // Create a new record for each expense in the database
            await DownloadedExpense.create({
                userId: req.user.id,
                amount: expense.amount,
                description: expense.description,
                category: expense.category,
                // Add other fields if needed
            });
        }));

        return res.status(200).json({ success: true, message: 'Expenses downloaded and saved successfully' });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'An error occurred while downloading and saving expenses', details: error.message });
    }
};

function uploadToS3(data, filename){
    const BUCKET_NAME = process.env.BUCKET_NAME;
    const IAM_USER_KEY = process.env.IAM_USER_KEY;
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

    let s3bucket = new AWS.S3({
        accessKeyId: IAM_USER_KEY,
        secretAccessKey: IAM_USER_SECRET,
    })
        const params = {
            Bucket:BUCKET_NAME,
            Key: filename,
            Body: data,
            ACL: 'public-read'
        }

        return new Promise((resolve, reject)=>{
            s3bucket.upload(params, (err, s3response)=>{
                if(err){
                    console.log('something went wrong', err)
                }else{
                    resolve (s3response.Location)
                }
            })
        })
}