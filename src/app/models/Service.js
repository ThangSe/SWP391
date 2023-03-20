const mongoose = require('mongoose')
const mongooseDelete = require('mongoose-delete')

const Schema = mongoose.Schema

const Service = new Schema({
    name: {type: String, required: true},
    supplier: {type: String, required: true},
    type: {type: String, required: true},
    price: {type: Number, required: true},
    detail: {type: String, required: true},
    status: {type: String, required: true, default: 'Đang hoạt động'},
    imgURLs: {type: Array},
    room_id: {type: mongoose.Schema.Types.ObjectId, ref: "room"},
    serviceMonth_id: [{type: mongoose.Schema.Types.ObjectId, ref: "servicemonth"}],
}, {
    timestamps: true,
})
Service.plugin(mongooseDelete, {
    deletedAt : true, 
    overrideMethods: 'all'})

module.exports = mongoose.model('service', Service)