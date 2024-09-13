const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const learnerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 2
    },
    lastName: {
        type: String,
        required: true,
        minlength: 2
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email address']
    },
    phone: {
        type: String,
        required: true,
        match: [/^\d{9,11}$/, 'Please enter a valid phone number with 9 to 11 digits']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    picture: {
        type: String,
        default: 'profile-1.png'
    },
    address: {type: String, required: true},
}, { timestamps: true });

learnerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();  // This was missing the return statement
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

learnerSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });
    if (user) {
        const validPass = await bcrypt.compare(password, user.password);
        if (validPass) {
            return user;
        }
        throw Error('Incorrect password');
    }
    throw Error('Incorrect email');
};

const Learner = mongoose.model('Learner', learnerSchema, 'learners');
module.exports = Learner;


