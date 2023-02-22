const mongoose = require('mongoose')
const mongooseDelete = require('mongoose-delete')

const Schema = mongoose.Schema

const Account = new Schema({
    username: {type: String, required: [true, 'Bạn phải nhập tài khoản'], unique: true},
    password: {type: String, required: [true, 'Bạn phải nhập mật khẩu']},
    status: {type: String, required: true, default: 'deactive'},
    role: {type: String, required: true, default: 'resident'},
    refreshToken: {type: String},
    user_id: {type: mongoose.Schema.Types.ObjectId, ref:"user"},
    room_id: {type: mongoose.Schema.Types.ObjectId, ref: "room"}
}, {
    timestamps: true,
})
Account.plugin(mongooseDelete, {
    deletedAt : true, 
    overrideMethods: 'all'})

module.exports = mongoose.model('account', Account)