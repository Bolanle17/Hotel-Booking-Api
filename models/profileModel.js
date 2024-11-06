const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    UserName: String,
    phone: String,
    email: String,
    address: String,
    image: {
        type: String,
    },
}, { minimize: false });

const profileModel = mongoose.models.profile || mongoose.model("profile", profileSchema);

module.exports = profileModel;