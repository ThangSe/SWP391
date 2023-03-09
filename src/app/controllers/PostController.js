const Post = require("../models/Post")
const Tag = require("../models/Tag")
const Comment = require("../models/Comment")
const Account = require("../models/Account")
const Buffer = require('buffer').Buffer
const multer = require('multer')
const {storage} = require('../../config/db/upload')

class PostController{

    getAllTags(req, res, next) {
        Tag.find({})
            .then(tags => {
                res.status(200).json(tags)
            })
            .catch(next)
    }

    async getAllPost(req, res) {
        try {
            const {page = 1, limit = 10, sort = 1, tagId, authorId} = req.query
            const filter = {
                tag_id: tagId,
                author_id: authorId,
            }
            if(!tagId) filter.tag_id = {$ne:null}
            if(!authorId) filter.author_id = {$ne:null}
            const posts = await Post.find(filter).sort({_id:sort}).limit(limit * 1).skip((page - 1) * limit)
            const count = await Post.find(filter).count()/limit
            return res.status(200).json({count: Math.ceil(count), posts})
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async getOwnedPost(req, res) {
        try {
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const author_id = accountInfo.id
            const {page = 1, limit = 10, sort = 1, tagId} = req.query
            const filter = {
                tag_id: tagId,
                author_id: author_id,
            }
            if(!tagId) filter.tag_id = {$ne:null}
            const posts = await Post.find(filter).sort({_id:sort}).limit(limit * 1).skip((page - 1) * limit)
            const count = await Post.find(filter).count()/limit
            return res.status(200).json({count: Math.ceil(count), posts})
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async createNewPost(req, res) {
        try {
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const author_id = accountInfo.id
            const upload = multer({
                storage,
                limits: {fileSize: 3 * 1024 * 1024 },
                fileFilter: (req, file, cb) => {
                    if(file.originalname.match(/\.(jpg|png|jpeg)$/)){
                        cb(null, true)
                    }else {
                        cb(null, false)
                        const err = new Error('Chỉ nhận định dạng .png, .jpg và .jpeg')
                        err.name = 'ExtensionError'
                        return cb(err)
                    }
                }
            }).array('img', 5)
            upload(req, res, async(err) => {
                if(err instanceof multer.MulterError) {
                    res.status(500).json(`Multer uploading error: ${err.message}`).end()
                    return
                } else if(err) {
                    if(err.name == 'ExtensionError') {
                        res.status(413).json(err.message).end()
                    } else {
                        res.status(500).json(`unknown uploading error: ${err.message}`).end()
                    }
                    return
                }
                if(req.files.length > 0) {
                    const data = JSON.parse(req.body.data)
                    const tagName = data.tag
                    const existedTag = await Tag.findOne({type: tagName})
                    var tagId
                    if(!existedTag) {
                        const newTag = new Tag({
                            type: tagName
                        })
                        const savedTag = await newTag.save()
                        tagId = savedTag.id
                    } else {
                        tagId = existedTag.id
                    }
                    const post = new Post({
                        title: data.title,
                        content: data.content,
                        author_id: author_id,
                        tag_id: tagId
                    })
                    const savePost = await post.save()
                    const URLs = req.files.map(file => "https://aprartment-api.onrender.com/post/image/"+file.filename)
                    await Account.findByIdAndUpdate({_id: author_id}, {$push: {post_id: savePost.id}})
                    await Tag.findOneAndUpdate({type: tagName}, {$push: {post_id: savePost.id}})
                    await Post.findByIdAndUpdate({_id: savePost.id}, {$push: {imgUrls: {$each: URLs}}}, {new: true})
                    res.status(200).json("Tạo bài đăng thành công")
                }
                else res.status(400).json('Chưa chọn file')
            })
        } catch (err) {
            if(err.name === "ValidationError") {
                res.status(500).json(Object.values(err.errors).map(val => val.message))
            } else {
                res.status(500).json(err)
            }
        }
    }

    async createComment(req, res) {
        try {
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const resident_id = accountInfo.id
            const postId = req.params.postId
            const post = await Post.findById(postId)
            const data = {
                resident_id: resident_id,
                content: req.body.content
            }
            if(!post.comment_id) {
                const comments = new Comment({
                    post_id: postId
                })
                const saveComments = await comments.save()
                await saveComments.updateOne({$push: {comment_list: data}})
                await post.updateOne({$set: {comment_id: saveComments.id}})
            } else {
                await Comment.findOneAndUpdate({post_id: postId}, {$push: {comment_list: data}})
            }
            res.status(200).json("Success")
        } catch (err) {
            res.status(500).json(err)
        }        
    }

    async incLike (req, res) {
        try {
            commentId = req.body.id
        } catch (err) {
            res.status(500).json(err)
        }
    }

}

module.exports = new PostController()
