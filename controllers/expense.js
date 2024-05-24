const Expense = require('../models/Expense');
const jwt = require('jsonwebtoken');
const sequelize = require('../util/database');

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

        const expenses = await Expense.findAll({ where: { userId } });
        // console.log('Expenses:', expenses);

        res.status(200).json(expenses);
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
