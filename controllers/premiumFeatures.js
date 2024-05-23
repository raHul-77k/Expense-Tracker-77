// controllers/premiumFeatures.js
const User = require('../models/User');
const Expense = require('../models/Expense');
const sequelize = require('../util/database');

const getUserLeaderBoard = async (req, res) => {
    try {
        // Fetch users with their total expenses
        const leaderboard = await User.findAll({
            attributes: [
                'Name',
                [sequelize.fn('SUM', sequelize.col('Expenses.amount')), 'total_cost']
            ],
            include: [{
                model: Expense,
                attributes: []
            }],
            group: ['User.id'],
            order: [[sequelize.literal('total_cost'), 'DESC']]
        });

        // Transform result to plain JSON
        const leaderboardDetails = leaderboard.map(user => user.get({ plain: true }));

        console.log('User Leaderboard:', leaderboardDetails);

        res.status(200).json(leaderboardDetails);
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(500).json(err);
    }
};

module.exports = {
    getUserLeaderBoard
};
