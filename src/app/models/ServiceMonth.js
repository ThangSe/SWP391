const mongoose = require('mongoose')
const mongooseDelete = require('mongoose-delete')

const Schema = mongoose.Schema

const ServiceMonth = new Schema({
    description: {type: String},
    timePerformer: {type: Date},
    bill_id: {type: mongoose.Schema.Types.ObjectId, ref: "bill"},
    service_id: {type: mongoose.Schema.Types.ObjectId, ref: "service"},
    staff_id : {type: mongoose.Schema.Types.ObjectId, ref: "account"}
}, {
    timestamps: true,
})
ServiceMonth.plugin(mongooseDelete, {
    deletedAt : true, 
    overrideMethods: 'all'})

module.exports = mongoose.model('servicemonth', ServiceMonth)