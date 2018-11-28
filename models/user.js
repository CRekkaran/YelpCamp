var mongoose              = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose"),
    passport              = require("passport"),
    LocalStrategy         = require("passport-local")

var UserSchema = new mongoose.Schema({
	username: String,
	password: String
});

UserSchema.plugin(passportLocalMongoose); //hash the password etc

module.exports = mongoose.model("User",UserSchema);
