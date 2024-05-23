// app.js
const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./util/database'); 
const cors = require('cors');

const userRoutes = require('./routes/userRoutes'); 
const userExpense = require('./routes/expenseRoute');
const purchaseRoute = require('./routes/purchase')
const premiumFeature = require('./routes/premiumFeatures')


const User = require('./models/User');
const Expense = require('./models/Expense');
const Order = require('./models/Order');

require('dotenv').config();


const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (CSS, images, etc.) from the "public" directory
app.use(express.static('public'));

// Use userRoutes for /user route
app.use('/user', userRoutes);
app.use('/expense', userExpense);
app.use('/purchase',purchaseRoute);
app.use('/premium',premiumFeature);

//relationship between user and expenses
User.hasMany(Expense);
Expense.belongsTo(User);


// relationship between user and order
User.hasMany(Order);
Order.belongsTo(User);

// Sync the database  
sequelize.sync({force : false})
    .then(() => {
        console.log('Database synced successfully.');

        // Start the server after the database is synced
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error syncing database:', err);
    });
