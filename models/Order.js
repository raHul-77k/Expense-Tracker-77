const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Order = sequelize.define('Order', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  paymentId: {
    type: Sequelize.STRING,
    allowNull: true // or false based on your requirement
  },
  orderId: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports = Order;
