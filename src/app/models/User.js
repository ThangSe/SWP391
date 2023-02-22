const mongoose = require('mongoose')

const Schema = mongoose.Schema

const User = new Schema({
    name: {type: String, required: true, default: 'user0'},
    email: {type: String, required: true, default: 'user0@gmail.com'},
    gender: {type: String},
    address: {
        city: {type: String, required: true, default: 'Empty'},
        district: {type: String, required: true, default: 'Empty'},
        ward: {type: String, required: true, default: 'Empty'},
        street: {type: String, required: true, default: 'Empty'}
    },
    phonenum: {type: String, required: true},
    birth: {type: Date, default: Date.now},
    families: [{
        name: {type: String},
        birth: {type: Date},
        phonenum: {type: String},
        relationship: {type: String}
    }],
    imgURL: {type: String},
    acc_id: {type: mongoose.Schema.Types.ObjectId, ref: "account"},
}, {
    timestamps: true,
})

module.exports = mongoose.model('user', User)
