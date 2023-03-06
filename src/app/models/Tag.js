const mongoose = require('mongoose')
const mongooseDelete = require('mongoose-delete')

const Schema = mongoose.Schema

const Tag = new Schema({
    type: {type: String, required: true, unique: true},
    post_id: [{type: mongoose.Schema.Types.ObjectId, ref: "post"}]
}, {
    timestamps: true,
})
Tag.plugin(mongooseDelete, {
    deletedAt : true, 
    overrideMethods: 'all'})

module.exports = mongoose.model('tag', Tag)