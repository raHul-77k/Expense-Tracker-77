const Expense = require('../models/Expense');
const jwt = require('jsonwebtoken');

// Add Expense
exports.addExpense = async (req, res) => {
    try {
        console.log('req.user in addExpense:', req.user);
        const userId = req.user.id; // Ensure this is defined
        const { amount, description, category } = req.body;

        const newExpense = await Expense.create({
            amount,
            description,
            category,
            userId
        });

        res.status(201).json({ success: true, expense: newExpense });
    } catch (error) {
        console.log('Error adding expense:', error);
        res.status(500).json({ success: false, message: 'Failed to add expense', error: error.message });
    }
};

// Get Expenses
exports.getExpenses=async(req,res,next)=>{
    console.log("get expenses req.user.id");
    console.log(req.user.id);
    try {
        const expenses=await req.user.getExpenseDetails()
    //     const expenses= await expenseApp.findAll({where:{
    //     userDetailId:req.user.id
    // }
    // })
        res.status(200).json({allExpense:expenses,isPremiumuser:req.user.isPremiumuser});
     }catch(err){console.log(err)};

};

// Delete Expense
exports.deleteExpense = async (req, res, next) => {
    try {
        const expenseId = req.params.id;
        const userId = req.user.id;

        const expense = await Expense.findByPk(expenseId);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        if (expense.userId !== userId) {
            return res.status(403).json({ error: 'Forbidden: You are not authorized to delete this expense' });
        }

        await expense.destroy({where : {id:expenseId, user}});
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred', details: error.message });
    }
};
