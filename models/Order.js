const Sequelize=require('sequelize');
const sequelize=require('../util/database');

const order=sequelize.define('Order',{
  id:{
    type:Sequelize.INTEGER,
    allowNull:false,
    autoIncrement:true,
    primaryKey:true
  },
  Paymentid:Sequelize.STRING,
  Orderid:Sequelize.STRING,
  Status:Sequelize.STRING
});
module.exports=order;