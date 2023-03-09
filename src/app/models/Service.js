const mongoose = require('mongoose')
const mongooseDelete = require('mongoose-delete')

const Schema = mongoose.Schema

const Bill = new Schema({
    detail: {type: String},
    dueDate: {type: Date},
    totalPrice: {type: Number},
    status: {type: String, required: true, default: 'Chưa thanh toán'},
    room_id: {type: mongoose.Schema.Types.ObjectId, ref: "room"},
    serviceMonth: {type: mongoose.Schema.Types.ObjectId, ref: "servicemonth"},
}, {
    timestamps: true,
})
Bill.plugin(mongooseDelete, {
    deletedAt : true, 
    overrideMethods: 'all'})

module.exports = mongoose.model('bill', Bill)