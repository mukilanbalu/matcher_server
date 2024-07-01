const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email:{type : String, required: true,unique: true},
    password:{type : String, required: true},
    mobile:{type: Number, required: true},
    last_login:{type: Date},
    logged_in:{type: Boolean},
})

module.exports = mongoose.model("app_users", userSchema)