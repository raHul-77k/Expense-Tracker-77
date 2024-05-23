const express = require('express');
const premiumControllers=require('../controllers/premiumFeatures');
const userAuthentication=require('../middleware/auth');
const router=express.Router();

router.get('/showLeaderBoard',userAuthentication.authenticate,premiumControllers.getUserLeaderBoard);
// router.post('/expense/add-expense',userAuthentication.authenticate,expenseControllers.addExpenses);
// router.delete('/expense/delete-expenses/:id',userAuthentication.authenticate,expenseControllers.deleteExpense);


module.exports = router;