require("dotenv").config();
const env = process.env.ENVIRONMENT;
const config = require("./config.json")[env];
const QueryBuilder = require("node-querybuilder");

const pool = new QueryBuilder(
    {
        connectionLimit: 1000000,
        user: config.username,
        password: config.password,
        host: config.host,
        database: config.database,
        timezone: "Asia/Dhaka",
        pool_size: 1000,
        pool_min: 1000,
        acquireTimeout: 10000,
    },
    "mysql",
    "pool"
);

module.exports = pool;
