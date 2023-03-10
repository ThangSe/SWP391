const mongoose = require('mongoose')
const mongooseDelete = require('mongoose-delete')
const Schema = mongoose.Schema

const Room = new Schema({
    roomnum: {type: String, required: true},
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
    resident_id: {type: mongoose.Schema.Types.ObjectId, ref: "account"},
    bill_id: [{type: mongoose.Schema.Types.ObjectId, ref: "bill"}]
}, {
    timestamps: true,
})
Room.plugin(mongooseDelete, {
    deletedAt : true, 
    overrideMethods: 'all'})

module.exports = mongoose.model('room', Room)
