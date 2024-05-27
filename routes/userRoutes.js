// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const adminControllers = require('../controllers/user');


router.post('/sign-up', adminControllers.postUserDetails);
router.post('/login', adminControllers.postLoginDetails);




module.exports = router;
