const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Room = new Schema({
    roomnum: {type: Number, required: true},
    type: {type: String, required: true},
    furniture: {
        bedroom: {type: Number, required: true},
        livingroom: {type: Number, required: true},
        bathroom: {type: Number, required: true},
        kitchen: {type: Number, required: true},
        view: {type: String, required: true},
    },
    status: {type: String, required: true, default: 'Còn trống'},
    price: {type: Number, require: true},
    imgURL: {type: Array},
    acc_id: {type: mongoose.Schema.Types.ObjectId, ref: "account"}
}, {
    timestamps: true,
})

module.exports = mongoose.model('room', Room)
