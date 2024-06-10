const dotenv = require('dotenv');
dotenv.config();

const Sequelize = require('sequelize');
const sequelize=new Sequelize('expense','root','@#MaD.772k',{ 
    dialect:'mysql',
    host:process.env.DB_HOST,
});

module.exports=sequelize;
