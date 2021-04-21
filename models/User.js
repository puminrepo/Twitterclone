const { Model, DataTypes } = require('sequelize')
const sequelize = require('../db.js')
 
class User extends Model {}
User.init({ 
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    dpUrl: DataTypes.STRING
}, { sequelize});

class Tweet extends Model {}
Tweet.init({
    tweet: DataTypes.STRING,
    timeCreated: DataTypes.DATE,
    UserId:DataTypes.STRING
}, { sequelize});

class Sessions extends Model {}
Sessions.init({
    Username: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    SID: DataTypes.STRING,
    dpUrl: DataTypes.STRING,
    login: DataTypes.DATE,
    logout: DataTypes.DATE
}, { sequelize});
//

(async ()=>{
    await sequelize.sync({force:true})
})()
User.hasMany(Tweet)
Tweet.belongsTo(User)

module.exports = {
    User,
    Tweet,
    Sessions
}