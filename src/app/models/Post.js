const mongoose = require('mongoose')
const mongooseDelete = require('mongoose-delete')

const Schema = mongoose.Schema

const Post = new Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    vote: {type: Number},
    imgURLs: {type: Array},
    author_id: {type: mongoose.Schema.Types.ObjectId, ref: "account"},
    tag_id: {type: mongoose.Schema.Types.ObjectId, ref: "tag"},
    comment_id: {type: mongoose.Schema.Types.ObjectId, ref: "comment"}
}, {
    timestamps: true,
})
Post.plugin(mongooseDelete, {
    deletedAt : true, 
    overrideMethods: 'all'})

module.exports = mongoose.model('post', Post)