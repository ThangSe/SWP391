const mongoose = require('mongoose')
const mongooseDelete = require('mongoose-delete')

const Schema = mongoose.Schema

const Ticket = new Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    type: {type: String, required: true},
    status: {type: String, required: true, default: 'Chờ tiếp nhận'},
    imgUrls: {type: Array},
    sender_id: {type: mongoose.Schema.Types.ObjectId, ref: "account"},
    manager_id: {type: mongoose.Schema.Types.ObjectId, ref: "account"}
}, {
    timestamps: true,
})
Ticket.plugin(mongooseDelete, {
    deletedAt : true, 
    overrideMethods: 'all'})

module.exports = mongoose.model('ticket', Ticket)