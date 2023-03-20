const mongoose = require('mongoose')
const lastDayOfMonth = require('date-fns/lastDayOfMonth')
const mongooseDelete = require('mongoose-delete')

const Schema = mongoose.Schema

const Bill = new Schema({
    detail: {type: String},
    dueDate: {type: Date, default: lastDayOfMonth(new Date())},
    totalPrice: {type: Number},
    status: {type: String, required: true, default: 'Chưa thanh toán'},
    room_id: {type: mongoose.Schema.Types.ObjectId, ref: "room"},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref:"user"},
    serviceMonth: [{type: mongoose.Schema.Types.ObjectId, ref: "servicemonth"}],
}, {
    timestamps: true,
})
Bill.plugin(mongooseDelete, {
    deletedAt : true, 
    overrideMethods: 'all'})

module.exports = mongoose.model('bill', Bill)