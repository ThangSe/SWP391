const mongoose = require('mongoose')
const mongooseDelete = require('mongoose-delete')

const Schema = mongoose.Schema

const Comment = new Schema({
    comment_list:[{
        resident_id: {type: mongoose.Schema.Types.ObjectId, ref:"account"},
        content: {type: String},
        like: {type: Number, default: 0}
    }],
    post_id: {type: mongoose.Schema.Types.ObjectId, ref: "post"}
}, {
    timestamps: true,
})
Comment.plugin(mongooseDelete, {
    deletedAt : true, 
    overrideMethods: 'all'})

module.exports = mongoose.model('comment', Comment)