const {config} = require("dotenv");

config({path : `.env`});

module.exports={
    PORT,
    MONGO_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN,
}=process.env