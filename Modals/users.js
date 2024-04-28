const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    emailId: {type: String, required: true, unique: true}
}, {TimeStamps: true})

const Users = mongoose.model('users', UserSchema)


module.exports = Users