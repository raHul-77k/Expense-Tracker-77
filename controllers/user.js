// controllers/user.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require('dotenv').config();


exports.postUserDetails = async (req, res, next) => {
    console.log("in postUserDetails");
    console.log(req.body);
    try {
        const { Name, Email, Password } = req.body;
        console.log(Name, Email, Password);

        // Check if the email already exists
        const existingUser = await User.findOne({ where: { Email } });
        if (existingUser) {
            console.log("User already exists");
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(Password, 10);
        
        const data = await User.create({
            Name: Name,
            Email: Email,
            Password: hashedPassword,
        });
        res.status(200).json({ userData: data });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'An error occurred' });
    }
};


function generateAccessToken(id){
    return jwt.sign({userId : id},'secretKey', { expiresIn: '1h' } )
}


exports.postLoginDetails = async (req, res, next) => {
    console.log("in postLoginDetails");
    console.log(req.body);
    try {
        const { Email, Password } = req.body;
        console.log("Email:", Email);

        // Check if the user exists
        const user = await User.findOne({ where: { Email } });
        if (!user) {
            console.log("User not found");
            return res.status(404).json({ error: 'User does not exist' });
        }

        console.log("User found:", user.toJSON());

        // Check if the password matches
        const isMatch = await bcrypt.compare(Password, user.Password);
        console.log("Password match:", isMatch);
        if (!isMatch) {
            console.log("Invalid password");
            return res.status(401).json({ error: 'User not authorized' });
        }

        console.log("Login successful");
        res.status(200).json({ message: 'Login successful', redirectUrl: '/expense.html', token : generateAccessToken(user.id)});
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ error: 'An error occurred', details: error.message });
    }
};   



