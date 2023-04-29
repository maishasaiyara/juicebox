const Sequelize = require('sequel')
const db = new Sequelize (
    process.env.DATABASE_URL
);

module.exports = db