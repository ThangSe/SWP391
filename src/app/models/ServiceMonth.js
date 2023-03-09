const mongoose = require('mongoose')
const mongooseDelete = require('mongoose-delete')

const Schema = mongoose.Schema

const ServiceMonth = new Schema({
    description: {type: String},
    totalSerPrice: {type: Number},
    bill_id: {type: mongoose.Schema.Types.ObjectId, ref: "bill"},
    DetailUsed: [{type: mongoose.Schema.Types.ObjectId, ref: "room"}],
}, {
    timestamps: true,
})
ServiceMonth.plugin(mongooseDelete, {
    deletedAt : true, 
    overrideMethods: 'all'})

module.exports = mongoose.model('servicemonth', ServiceMonth)